import { ScheduledDay, Phase, DrugEntry } from '../types';
import { addDays, formatDate } from './dateHelpers';

export const generateSchedule = (startDate: Date, cycleNumber: number): ScheduledDay[] => {
  const schedule: ScheduledDay[] = [];

  // Protocol Definitions
  // IsaPomDex: Isatuximab + Pomalidomide + Dexamethasone
  // For relapsed/refractory multiple myeloma
  // Cycle Length: 28 Days
  // Treatment continues until disease progression

  const phase = Phase.Treatment;

  // We only generate 1 cycle now, starting at startDate
  const cycleStartDate = startDate;

  for (let day = 1; day <= 28; day++) {
    const currentDate = addDays(cycleStartDate, day - 1);
    const drugs: DrugEntry[] = [];
    let hasClinicVisit = false;

    // --- IsaPomDex LOGIC ---

    // 1. Pomalidomide (Days 1-21)
    // 4mg orally once daily, days 1-21, then 7 days off (days 22-28)
    if (day <= 21) {
      drugs.push({
        name: 'Pomalidomide',
        dose: '4mg',
        route: 'PO',
        notes: 'Take at the same time each day. Warning: Teratogenic - requires PPP compliance.'
      });
    }

    // 2. Isatuximab
    // Cycle 1: Days 1, 8, 15, 22 (Weekly)
    // Cycle 2+: Days 1, 15 (Bi-weekly)
    const isIsaDay = cycleNumber === 1
      ? [1, 8, 15, 22].includes(day)
      : [1, 15].includes(day);

    if (isIsaDay) {
      drugs.push({
        name: 'Isatuximab',
        dose: '10 mg/kg',
        route: 'IV',
        notes: 'IV infusion. Monitor for infusion-related reactions.'
      });
      hasClinicVisit = true;

      // Isatuximab Pre-meds (given before each infusion)
      drugs.push({ name: 'Paracetamol', dose: '650-1000mg', route: 'PO', isPreMed: true, notes: '15-60 min prior to Isa' });
      drugs.push({ name: 'Diphenhydramine', dose: '25-50mg', route: 'IV', isPreMed: true, notes: '15-60 min prior to Isa (or equivalent H1 blocker)' });
      drugs.push({ name: 'Ranitidine', dose: '50mg', route: 'IV', isPreMed: true, notes: '15-60 min prior to Isa (or equivalent H2 blocker)' });

      // Dexamethasone as pre-med on Isatuximab days (given IV before infusion)
      drugs.push({
        name: 'Dexamethasone',
        dose: '40mg',
        route: 'IV',
        isPreMed: true,
        notes: '30-60 min prior to Isa. Part of pre-medication and weekly Dex dose.'
      });
    }

    // 3. Dexamethasone
    // Days 1, 8, 15, 22 of each cycle
    // On Isatuximab days: given IV as pre-medication (already added above)
    // On non-Isatuximab days (only in Cycle 2+): given PO
    if ([1, 8, 15, 22].includes(day) && !isIsaDay) {
      // For cycle 2+, days 8 and 22 don't have Isatuximab, so Dex is given orally
      drugs.push({
        name: 'Dexamethasone',
        dose: '40mg',
        route: 'PO',
        notes: 'Take in the morning with food. Reduce to 20mg if age >=75.'
      });
    }

    // Add to schedule
    schedule.push({
      date: currentDate,
      dateString: formatDate(currentDate),
      cycle: cycleNumber,
      dayOfCycle: day,
      phase: phase,
      drugs,
      hasClinicVisit
    });
  }

  return schedule;
};
