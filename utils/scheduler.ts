import { ScheduledDay, Phase, DrugEntry, PauseInterval } from '../types';
import { addDays, formatDate } from './dateHelpers';

export const generateSchedule = (startDate: Date, cycleNumber: number, pauses: PauseInterval[] = []): ScheduledDay[] => {
  const schedule: ScheduledDay[] = [];
  
  // Protocol Definitions
  // Induction: Cycles 1-4
  // Consolidation: Cycles 5-6
  // Cycle Length: 28 Days
  
  const phase = cycleNumber <= 4 ? Phase.Induction : Phase.Consolidation;
  
  // We generate until we have filled 28 cycle days
  let currentDate = new Date(startDate);
  let cycleDayCounter = 1;
  let safetyLoop = 0;

  while (cycleDayCounter <= 28 && safetyLoop < 100) {
    safetyLoop++;

    // Check if current date is paused
    // We compare strings YYYY-MM-DD
    // Note: formatDate returns 'Mon, 1 Jan 2024'.
    // We need standard YYYY-MM-DD for comparison with PauseInterval
    // Let's create a local helper or just do simple date comparison.
    // PauseInterval is YYYY-MM-DD.
    // To be safe, let's construct YYYY-MM-DD from currentDate
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayDate = String(currentDate.getDate()).padStart(2, '0');
    const currentDateIso = `${year}-${month}-${dayDate}`;

    const isPaused = pauses.some(p => {
        return currentDateIso >= p.startDate && currentDateIso < p.resumeDate;
    });

    if (isPaused) {
        schedule.push({
            date: new Date(currentDate),
            dateString: formatDate(currentDate),
            cycle: cycleNumber,
            dayOfCycle: 0, // 0 indicates pause/gap
            phase: phase,
            drugs: [],
            hasClinicVisit: false,
            isPaused: true
        });
        // Move to next calendar day, but do NOT increment cycleDayCounter
        currentDate = addDays(currentDate, 1);
        continue;
    }

    const day = cycleDayCounter;
    const drugs: DrugEntry[] = [];
    let hasClinicVisit = false;

    // --- D-VTD LOGIC ---

    // 1. Thalidomide (Daily)
    drugs.push({
      name: 'Thalidomide',
      dose: '50mg',
      route: 'PO',
      notes: 'Take at night (nocte). Warning: Teratogenic.'
    });

    // 2. Daratumumab
    // Cycles 1-2: Days 1, 8, 15, 22 (Weekly)
    // Cycles 3-6: Days 1, 15 (Bi-weekly)
    const isDaraDay = cycleNumber <= 2 
      ? [1, 8, 15, 22].includes(day)
      : [1, 15].includes(day);

    if (isDaraDay) {
      drugs.push({
        name: 'Daratumumab',
        dose: '1800mg',
        route: 'SC',
        notes: 'Subcutaneous injection. Monitor for IRR.'
      });
      hasClinicVisit = true;

      // Dara Pre-meds
      drugs.push({ name: 'Paracetamol', dose: '1g', route: 'PO', isPreMed: true, notes: '1 hour prior to Dara' });
      drugs.push({ name: 'Chlorphenamine', dose: '4mg', route: 'PO', isPreMed: true, notes: '1 hour prior to Dara' });
      
      // Cycle 1 Day 1 Special Pre-med
      if (cycleNumber === 1 && day === 1) {
        drugs.push({ name: 'Montelukast', dose: '10mg', route: 'PO', isPreMed: true, notes: 'Cycle 1 only' });
      }
    }

    // 3. Bortezomib
    // All Cycles: Days 1, 8, 15, 22
    if ([1, 8, 15, 22].includes(day)) {
      drugs.push({
        name: 'Bortezomib',
        dose: '1.3 mg/m²',
        route: 'SC',
        notes: 'At least 72 hours between doses. Monitor neuropathy.'
      });
      hasClinicVisit = true;
    }

    // 4. Dexamethasone
    // Days 1, 2, 8, 9, 15, 16, 22, 23
    if ([1, 2, 8, 9, 15, 16, 22, 23].includes(day)) {
      // Dose Logic:
      // Cycles 1-2: 40mg
      // Cycles 3-6: 20mg
      const dexDose = cycleNumber <= 2 ? '40mg' : '20mg';
      
      let notes = 'Take in the morning with food.';
      if (isDaraDay) {
          notes += ' Part of this dose may be given as pre-medication.';
      }

      drugs.push({
        name: 'Dexamethasone',
        dose: dexDose,
        route: 'PO',
        notes: notes
      });
    }

    // Add to schedule
    schedule.push({
      date: new Date(currentDate),
      dateString: formatDate(currentDate),
      cycle: cycleNumber,
      dayOfCycle: day,
      phase: phase,
      drugs,
      hasClinicVisit,
      isPaused: false
    });

    // Advance both
    cycleDayCounter++;
    currentDate = addDays(currentDate, 1);
  }

  return schedule;
};
