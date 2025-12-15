'use client'

import React, { useState, useMemo, useRef } from 'react';
import { generateSchedule } from '../utils/scheduler';
import { Phase, ScheduledDay, PauseInterval } from '../types';
import CalendarView from '../components/CalendarView';
import ProtocolSidebar from '../components/ProtocolSidebar';
import DayModal from '../components/DayModal';
import PrintableView from '../components/PrintableView';
import {
  Calendar,
  CalendarDays,
  Clock3,
  HeartPulse,
  PauseCircle,
  Printer,
  Settings,
  Share2,
  StickyNote
} from 'lucide-react';

export default function Home() {
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  });

  const [phase, setPhase] = useState<Phase>(Phase.Induction);
  const [cycleNumber, setCycleNumber] = useState<number>(1);
  const [pauses, setPauses] = useState<PauseInterval[]>([]);
  const [selectedDay, setSelectedDay] = useState<ScheduledDay | null>(null);
  const [showProtocol, setShowProtocol] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const getCyclesForPhase = (p: Phase) => p === Phase.Induction ? [1, 2, 3, 4] : [5, 6];

  const displayDate = useMemo(() => {
    if (!startDate) return 'Select date';
    try {
      const [y, m, d] = startDate.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      if (isNaN(date.getTime())) return 'Invalid date';
      return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        weekday: 'short'
      }).format(date);
    } catch (e) {
      return 'Invalid date';
    }
  }, [startDate]);

  const schedule = useMemo(() => {
    if (!startDate) return [];

    try {
      const [y, m, d] = startDate.split('-').map(Number);
      const start = new Date(y, m - 1, d);

      if (isNaN(start.getTime())) return [];

      return generateSchedule(start, cycleNumber, pauses);
    } catch (e) {
      return [];
    }
  }, [startDate, cycleNumber, pauses]);

  const calendarDate = useMemo(() => {
    if (!startDate) return new Date();
    const [y, m, d] = startDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return isNaN(date.getTime()) ? new Date() : date;
  }, [startDate]);

  const handleDayClick = (day: ScheduledDay) => {
    setSelectedDay(day);
  };

  const handlePhaseChange = (newPhase: Phase) => {
    setPhase(newPhase);
    setCycleNumber(newPhase === Phase.Induction ? 1 : 5);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddPause = (resumeDate: string, resumeDayOfCycle: number) => {
    if (!selectedDay) return;

    const year = selectedDay.date.getFullYear();
    const month = String(selectedDay.date.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDay.date.getDate()).padStart(2, '0');
    const pauseStartStr = `${year}-${month}-${day}`;

    setPauses(prev => {
      const next = [...prev, { startDate: pauseStartStr, resumeDate, resumeDayOfCycle }];
      return next.sort((a, b) => a.startDate.localeCompare(b.startDate));
    });
    setSelectedDay(null);
  };

  const handleRemovePause = (index: number) => {
    setPauses(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <PrintableView schedule={schedule} />

      <div className="no-print min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-white text-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-6 h-screen flex flex-col gap-4">

          <header className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex gap-3">
                <div className="p-3 rounded-xl bg-blue-600 text-white shadow-md">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs uppercase font-semibold text-blue-700">Hammersmith Hospital · Day Unit</p>
                  <h1 className="text-2xl font-bold text-slate-900">D-VTD scheduling companion</h1>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Patient-friendly calendar for Daratumumab + Bortezomib + Thalidomide + Dexamethasone. Built for rapid sharing with people on treatment.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-sm text-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / PDF</span>
                </button>
                <button
                  onClick={() => setShowProtocol(!showProtocol)}
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                  title="Show clinician protocol quick view"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-sm">
              <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-blue-50 text-blue-900 border border-blue-100">
                <Clock3 className="w-4 h-4" />
                <span>Start: {displayDate}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-100">
                <HeartPulse className="w-4 h-4" />
                <span>{phase} · Cycle {cycleNumber}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-amber-50 text-amber-900 border border-amber-100">
                <Share2 className="w-4 h-4" />
                <span>Optimised for patient screenshots</span>
              </div>
            </div>
          </header>

          <div className="grid lg:grid-cols-[360px,1fr] gap-4 flex-1 min-h-0">
            <div className="space-y-4 overflow-y-auto pr-1">
              <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">Build the plan</p>
                    <h2 className="text-lg font-bold text-slate-900">Set the starting point</h2>
                    <p className="text-sm text-slate-600">Pick the calendar start date and the cycle you are dispensing today.</p>
                  </div>
                  <div className="bg-blue-50 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full border border-blue-100">28-day cycle</div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                    <span className="text-xs uppercase tracking-wide text-slate-500">Start date</span>
                    <div className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50">
                      <CalendarDays className="w-5 h-5 text-blue-600" />
                      <input
                        ref={dateInputRef}
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-transparent outline-none text-slate-900 flex-1"
                        aria-label="Select start date"
                      />
                    </div>
                    <span className="text-xs text-slate-500">Local time. This is the day Day 1 medication would be given.</span>
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Phase</p>
                      <div className="flex rounded-lg bg-slate-100 p-1 gap-1">
                        <button
                          onClick={() => handlePhaseChange(Phase.Induction)}
                          className={`flex-1 px-3 py-2 rounded-md text-sm font-semibold transition ${phase === Phase.Induction ? 'bg-white shadow border border-slate-200 text-blue-700' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          Induction
                        </button>
                        <button
                          onClick={() => handlePhaseChange(Phase.Consolidation)}
                          className={`flex-1 px-3 py-2 rounded-md text-sm font-semibold transition ${phase === Phase.Consolidation ? 'bg-white shadow border border-slate-200 text-blue-700' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          Consolidation
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Cycle</p>
                      <div className="relative">
                        <select
                          value={cycleNumber}
                          onChange={(e) => setCycleNumber(Number(e.target.value))}
                          className="w-full appearance-none bg-white border border-slate-200 rounded-md px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {getCyclesForPhase(phase).map(c => (
                            <option key={c} value={c}>Cycle {c}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                          <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Cycles 1-4 = Induction, 5-6 = Consolidation.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <PauseCircle className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">Pause & resume controls</p>
                    <p className="text-xs text-slate-600">Click any calendar day to pause. Choose the resume date and the cycle day number to continue with.</p>
                  </div>
                </div>

                {pauses.length === 0 ? (
                  <div className="text-sm text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded-lg p-3">
                    No pauses added yet. Use the calendar to mark a pause window and select the restart day number that matches the original schedule.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pauses.map((pause, idx) => (
                      <div key={`${pause.startDate}-${idx}`} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                        <div className="space-y-0.5 text-sm">
                          <p className="font-semibold text-slate-900">Paused from {pause.startDate}</p>
                          <p className="text-slate-600 text-xs">Resume on {pause.resumeDate} as Cycle Day {pause.resumeDayOfCycle}</p>
                        </div>
                        <button
                          onClick={() => handleRemovePause(idx)}
                          className="text-xs text-slate-500 hover:text-red-600"
                        >
                          Clear
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <StickyNote className="w-5 h-5 text-sky-700" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">Patient-facing notes</p>
                    <p className="text-xs text-slate-600">Keep language friendly; this block sits beside the calendar for quick screenshots.</p>
                  </div>
                </div>
                <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
                  <li>Hospital visits are shaded blue. Home tablets are highlighted in amber.</li>
                  <li>Paused days are clearly labelled and do not advance the cycle day count.</li>
                  <li>Share by printing to PDF or capturing a screenshot on desktop/mobile.</li>
                </ul>
              </section>

              {showProtocol && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  <ProtocolSidebar />
                </div>
              )}
            </div>

            <div className="h-full min-h-0 flex flex-col gap-3">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-3 sm:p-4 flex flex-col h-full min-h-0">
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-200">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Patient calendar</p>
                    <h2 className="text-xl font-bold text-slate-900">Cycle {cycleNumber} · {phase}</h2>
                    <p className="text-sm text-slate-600">Tap any day to see the schedule, pause treatment, or resume on a specific cycle day.</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="flex items-center gap-1 bg-blue-50 text-blue-800 px-2 py-1 rounded-full border border-blue-100">
                      <CalendarDays className="w-4 h-4" />
                      <span>{displayDate}</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-h-0">
                  <CalendarView
                    schedule={schedule}
                    onDayClick={handleDayClick}
                    currentDate={calendarDate}
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="no-print">
        <DayModal
          day={selectedDay}
          onClose={() => setSelectedDay(null)}
          onPause={handleAddPause}
        />
      </div>
    </>
  );
}
