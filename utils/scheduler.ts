import { ScheduledDay, Phase, DrugEntry, PauseInterval } from '../types';
import { addDays, formatDate } from './dateHelpers';

// UK Public Holidays (England & Wales) - commonly observed
// This list covers 2024-2026. For production, consider using an API or more comprehensive list.
const UK_PUBLIC_HOLIDAYS: Set<string> = new Set([
  // 2024
  '2024-01-01', // New Year's Day
  '2024-03-29', // Good Friday
  '2024-04-01', // Easter Monday
  '2024-05-06', // Early May Bank Holiday
  '2024-05-27', // Spring Bank Holiday
  '2024-08-26', // Summer Bank Holiday
  '2024-12-25', // Christmas Day
  '2024-12-26', // Boxing Day
  // 2025
  '2025-01-01', // New Year's Day
  '2025-04-18', // Good Friday
  '2025-04-21', // Easter Monday
  '2025-05-05', // Early May Bank Holiday
  '2025-05-26', // Spring Bank Holiday
  '2025-08-25', // Summer Bank Holiday
  '2025-12-25', // Christmas Day
  '2025-12-26', // Boxing Day
  // 2026
  '2026-01-01', // New Year's Day
  '2026-04-03', // Good Friday
  '2026-04-06', // Easter Monday
  '2026-05-04', // Early May Bank Holiday
  '2026-05-25', // Spring Bank Holiday
  '2026-08-31', // Summer Bank Holiday
  '2026-12-25', // Christmas Day
  '2026-12-28', // Boxing Day (substitute)
]);

// Holiday names for display
const HOLIDAY_NAMES: Record<string, string> = {
  '2024-01-01': 'New Year\'s Day',
  '2024-03-29': 'Good Friday',
  '2024-04-01': 'Easter Monday',
  '2024-05-06': 'Early May Bank Holiday',
  '2024-05-27': 'Spring Bank Holiday',
  '2024-08-26': 'Summer Bank Holiday',
  '2024-12-25': 'Christmas Day',
  '2024-12-26': 'Boxing Day',
  '2025-01-01': 'New Year\'s Day',
  '2025-04-18': 'Good Friday',
  '2025-04-21': 'Easter Monday',
  '2025-05-05': 'Early May Bank Holiday',
  '2025-05-26': 'Spring Bank Holiday',
  '2025-08-25': 'Summer Bank Holiday',
  '2025-12-25': 'Christmas Day',
  '2025-12-26': 'Boxing Day',
  '2026-01-01': 'New Year\'s Day',
  '2026-04-03': 'Good Friday',
  '2026-04-06': 'Easter Monday',
  '2026-05-04': 'Early May Bank Holiday',
  '2026-05-25': 'Spring Bank Holiday',
  '2026-08-31': 'Summer Bank Holiday',
  '2026-12-25': 'Christmas Day',
  '2026-12-28': 'Boxing Day (substitute)',
};

/** Convert Date to YYYY-MM-DD string for comparisons */
const toISODateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** Check if a date is a weekend (Saturday=6 or Sunday=0) */
const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

/** Check if a date is a UK public holiday */
const isPublicHoliday = (dateIso: string): boolean => {
  return UK_PUBLIC_HOLIDAYS.has(dateIso);
};

/** Get the holiday name if it's a public holiday */
const getHolidayName = (dateIso: string): string | undefined => {
  return HOLIDAY_NAMES[dateIso];
};

/** Check if the day unit (clinic) is open on this date */
const isClinicOpen = (date: Date): boolean => {
  if (isWeekend(date)) return false;
  if (isPublicHoliday(toISODateString(date))) return false;
  return true;
};

/** Get reason why clinic is closed */
const getClinicClosedReason = (date: Date): string | undefined => {
  const dateIso = toISODateString(date);
  if (isWeekend(date)) {
    return date.getDay() === 6 ? 'Saturday' : 'Sunday';
  }
  const holidayName = getHolidayName(dateIso);
  if (holidayName) {
    return holidayName;
  }
  return undefined;
};

/** Find the next available clinic day (Mon-Fri, not a holiday) */
const findNextClinicDay = (date: Date): Date => {
  let next = new Date(date);
  let safety = 0;
  while (!isClinicOpen(next) && safety < 14) {
    next = addDays(next, 1);
    safety++;
  }
  return next;
};

/** Protocol: Days when Daratumumab is given */
const getDaraDays = (cycleNumber: number): Set<number> => {
  // Cycles 1-2: Days 1, 8, 15, 22 (Weekly)
  // Cycles 3-6: Days 1, 15 (Bi-weekly)
  return cycleNumber <= 2
    ? new Set([1, 8, 15, 22])
    : new Set([1, 15]);
};

/** Protocol: Days when Bortezomib is given */
const BORT_DAYS = new Set([1, 8, 15, 22]);

/** Protocol: Days when Dexamethasone is given */
const DEX_DAYS = new Set([1, 2, 8, 9, 15, 16, 22, 23]);

export const generateSchedule = (
  startDate: Date,
  cycleNumber: number,
  pauses: PauseInterval[] = []
): ScheduledDay[] => {
  const schedule: ScheduledDay[] = [];

  // Pre-process pauses for efficient lookup
  const sortedPauses = [...pauses].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const resumeLookup = new Map(sortedPauses.map(pause => [pause.resumeDate, pause]));

  // Determine phase
  const phase = cycleNumber <= 4 ? Phase.Induction : Phase.Consolidation;

  // Protocol config
  const daraDays = getDaraDays(cycleNumber);
  const dexDose = cycleNumber <= 2 ? '40mg' : '20mg';

  // Track clinic visits that were moved from their original cycle day
  // Key: original cycle day, Value: moved-to date ISO string
  const movedClinicVisits = new Map<number, string>();

  // First pass: identify clinic days that fall on weekends/holidays and find their moved dates
  let previewDate = new Date(startDate);
  let previewCycleDay = 1;
  let previewSafety = 0;

  while (previewCycleDay <= 28 && previewSafety < 150) {
    previewSafety++;
    const dateIso = toISODateString(previewDate);

    // Check if paused
    const isPausedPreview = sortedPauses.some(p =>
      dateIso >= p.startDate && dateIso < p.resumeDate
    );

    if (isPausedPreview) {
      previewDate = addDays(previewDate, 1);
      continue;
    }

    // Check for resume
    const resumeConfig = resumeLookup.get(dateIso);
    if (resumeConfig) {
      previewCycleDay = Math.min(28, Math.max(1, resumeConfig.resumeDayOfCycle || previewCycleDay));
    }

    const day = previewCycleDay;
    const needsClinic = daraDays.has(day) || BORT_DAYS.has(day);

    if (needsClinic && !isClinicOpen(previewDate)) {
      // Find next available clinic day
      const movedToDate = findNextClinicDay(previewDate);
      movedClinicVisits.set(day, toISODateString(movedToDate));
    }

    previewCycleDay++;
    previewDate = addDays(previewDate, 1);
  }

  // Second pass: generate the actual schedule
  let currentDate = new Date(startDate);
  let cycleDayCounter = 1;
  let safetyLoop = 0;

  while (cycleDayCounter <= 28 && safetyLoop < 150) {
    safetyLoop++;
    const currentDateIso = toISODateString(currentDate);

    // Check if current date is paused
    const isPaused = sortedPauses.some(p =>
      currentDateIso >= p.startDate && currentDateIso < p.resumeDate
    );

    if (isPaused) {
      schedule.push({
        date: new Date(currentDate),
        dateString: formatDate(currentDate),
        cycle: cycleNumber,
        dayOfCycle: 0,
        phase,
        drugs: [],
        hasClinicVisit: false,
        isPaused: true,
      });
      currentDate = addDays(currentDate, 1);
      continue;
    }

    // Check for resume configuration
    const resumeConfig = resumeLookup.get(currentDateIso);
    if (resumeConfig) {
      cycleDayCounter = Math.min(28, Math.max(1, resumeConfig.resumeDayOfCycle || cycleDayCounter));
    }

    const day = cycleDayCounter;
    const drugs: DrugEntry[] = [];
    let hasClinicVisit = false;

    // Check if clinic is open today
    const clinicOpen = isClinicOpen(currentDate);
    const clinicClosedReason = getClinicClosedReason(currentDate);

    // Determine what treatments are due today
    const isDaraDay = daraDays.has(day);
    const isBortDay = BORT_DAYS.has(day);
    const isDexDay = DEX_DAYS.has(day);

    // Check if a moved clinic visit lands on today
    const movedVisitOnToday = Array.from(movedClinicVisits.entries()).find(
      ([_, movedDate]) => movedDate === currentDateIso
    );

    // 1. Thalidomide - Daily (home medication, can be taken any day)
    drugs.push({
      name: 'Thalidomide',
      dose: '50mg',
      route: 'PO',
      notes: 'Take at night (nocte). Warning: Teratogenic.',
    });

    // 2. Daratumumab - clinic visit required
    if (isDaraDay) {
      if (clinicOpen) {
        drugs.push({
          name: 'Daratumumab',
          dose: '1800mg',
          route: 'SC',
          notes: 'Subcutaneous injection. Monitor for IRR.',
        });
        hasClinicVisit = true;

        // Pre-meds for Dara
        drugs.push({ name: 'Paracetamol', dose: '1g', route: 'PO', isPreMed: true, notes: '1 hour prior to Dara' });
        drugs.push({ name: 'Chlorphenamine', dose: '4mg', route: 'PO', isPreMed: true, notes: '1 hour prior to Dara' });

        if (cycleNumber === 1 && day === 1) {
          drugs.push({ name: 'Montelukast', dose: '10mg', route: 'PO', isPreMed: true, notes: 'Cycle 1 only' });
        }
      }
      // If clinic closed, Dara is moved - handled separately when movedVisitOnToday triggers
    }

    // 3. Bortezomib - clinic visit required
    if (isBortDay) {
      if (clinicOpen) {
        drugs.push({
          name: 'Bortezomib',
          dose: '1.3 mg/m²',
          route: 'SC',
          notes: 'At least 72 hours between doses. Monitor neuropathy.',
        });
        hasClinicVisit = true;
      }
      // If clinic closed, Bort is moved - handled when movedVisitOnToday triggers
    }

    // Handle moved clinic visits landing on today
    if (movedVisitOnToday && clinicOpen) {
      const [originalDay] = movedVisitOnToday;

      // Add the moved Daratumumab if it was due on that day
      if (daraDays.has(originalDay) && !drugs.some(d => d.name === 'Daratumumab')) {
        drugs.push({
          name: 'Daratumumab',
          dose: '1800mg',
          route: 'SC',
          notes: `Subcutaneous injection (moved from Day ${originalDay}). Monitor for IRR.`,
        });
        hasClinicVisit = true;

        // Pre-meds
        if (!drugs.some(d => d.name === 'Paracetamol' && d.isPreMed)) {
          drugs.push({ name: 'Paracetamol', dose: '1g', route: 'PO', isPreMed: true, notes: '1 hour prior to Dara' });
        }
        if (!drugs.some(d => d.name === 'Chlorphenamine' && d.isPreMed)) {
          drugs.push({ name: 'Chlorphenamine', dose: '4mg', route: 'PO', isPreMed: true, notes: '1 hour prior to Dara' });
        }
        if (cycleNumber === 1 && originalDay === 1 && !drugs.some(d => d.name === 'Montelukast')) {
          drugs.push({ name: 'Montelukast', dose: '10mg', route: 'PO', isPreMed: true, notes: 'Cycle 1 only' });
        }
      }

      // Add the moved Bortezomib if it was due on that day
      if (BORT_DAYS.has(originalDay) && !drugs.some(d => d.name === 'Bortezomib')) {
        drugs.push({
          name: 'Bortezomib',
          dose: '1.3 mg/m²',
          route: 'SC',
          notes: `At least 72 hours between doses (moved from Day ${originalDay}). Monitor neuropathy.`,
        });
        hasClinicVisit = true;
      }
    }

    // 4. Dexamethasone - home medication, can be taken any day
    if (isDexDay) {
      let notes = 'Take in the morning with food.';
      if (isDaraDay && clinicOpen) {
        notes += ' Part of this dose may be given as pre-medication.';
      }
      drugs.push({
        name: 'Dexamethasone',
        dose: dexDose,
        route: 'PO',
        notes,
      });
    }

    schedule.push({
      date: new Date(currentDate),
      dateString: formatDate(currentDate),
      cycle: cycleNumber,
      dayOfCycle: day,
      phase,
      drugs,
      hasClinicVisit,
      isPaused: false,
      isClinicClosed: !clinicOpen,
      clinicClosedReason,
    });

    cycleDayCounter++;
    currentDate = addDays(currentDate, 1);
  }

  return schedule;
};
