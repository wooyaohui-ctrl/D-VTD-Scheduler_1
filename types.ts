export enum Phase {
  Treatment = 'Treatment'
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
  hasClinicVisit: boolean; // True if Isatuximab is given (requires IV infusion)
}

export interface ProtocolConfig {
  cycleLength: number;
}
