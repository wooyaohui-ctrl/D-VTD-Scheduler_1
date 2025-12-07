export enum Phase {
  Induction = 'Induction',
  Consolidation = 'Consolidation'
}

export interface DrugEntry {
  name: string;
  dose: string;
  route: 'PO' | 'SC' | 'IV';
  notes?: string;
  isPreMed?: boolean;
}

export interface ScheduledDay {
  date: Date;
  dateString: string;
  cycle: number;
  dayOfCycle: number;
  phase: Phase;
  drugs: DrugEntry[];
  hasClinicVisit: boolean; // True if Daratumumab or Bortezomib is given
  isPaused?: boolean;
}

export interface ProtocolConfig {
  inductionCycles: number;
  cycleLength: number;
}

export interface PauseInterval {
  startDate: string; // YYYY-MM-DD
  resumeDate: string; // YYYY-MM-DD
}
