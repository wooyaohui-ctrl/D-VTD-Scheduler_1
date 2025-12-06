'use client';

import React, { useState, useMemo, useRef, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { generateSchedule } from '../utils/scheduler';
import { Phase, ScheduledDay } from '../types';
import CalendarView from '../components/CalendarView';
import ProtocolSidebar from '../components/ProtocolSidebar';
import DayModal from '../components/DayModal';
import { Calendar, Printer, Settings, CalendarDays } from 'lucide-react';

// Lazy load PrintableView
const PrintableView = dynamic(() => import('../components/PrintableView'), {
  ssr: false,
  loading: () => null,
});

export default function App() {
  // Initialize with today's date in local time to avoid UTC shifts
  const [startDate, setStartDate] = useState<string>(() => {
    // Check if we are in the browser to access Date
    if (typeof window === 'undefined') return '';
    const d = new Date();
    return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  });

  const [isMounted, setIsMounted] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    if (!startDate) {
        const d = new Date();
        setStartDate(new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0]);
    }
  }, []);
  
  const [phase, setPhase] = useState<Phase>(Phase.Induction);
  const [cycleNumber, setCycleNumber] = useState<number>(1);
  const [selectedDay, setSelectedDay] = useState<ScheduledDay | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const getCyclesForPhase = (p: Phase) => p === Phase.Induction ? [1, 2, 3, 4] : [5, 6];

  // Parse the date string safely for display logic
  const displayDate = useMemo(() => {
     if (!startDate) return 'Select Date';
     try {
       const [y, m, d] = startDate.split('-').map(Number);
       // Create date at local midnight
       const date = new Date(y, m - 1, d);
       if (isNaN(date.getTime())) return 'Invalid Date';
       return new Intl.DateTimeFormat('en-GB', { 
         day: 'numeric', 
         month: 'short', 
         year: 'numeric',
         weekday: 'short'
       }).format(date);
     } catch (e) {
       return 'Invalid Date';
     }
  }, [startDate]);

  // Generate Schedule with timezone-safe start date
  const schedule = useMemo(() => {
    if (!startDate) return [];
    
    try {
      const [y, m, d] = startDate.split('-').map(Number);
      // Vital: Use local constructor to prevent timezone off-by-one errors
      const start = new Date(y, m - 1, d);
      
      if (isNaN(start.getTime())) return [];
      
      return generateSchedule(start, cycleNumber);
    } catch (e) {
      return [];
    }
  }, [startDate, cycleNumber]);

  // Calendar view reference date
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
    if (typeof window !== 'undefined') {
        setIsPrinting(true);
    }
  };

  if (!isMounted) return <div className="flex h-screen w-full items-center justify-center bg-slate-50"><div className="text-slate-500">Loading Scheduler...</div></div>;

  return (
    <>
      {/* Print View (Only visible when printing) */}
      {isPrinting && (
        <Suspense fallback={null}>
            <PrintableView schedule={schedule} autoPrint={true} />
        </Suspense>
      )}

      {/* Main Screen Layout (Hidden when printing) */}
      <div className="no-print h-screen w-full flex flex-col md:flex-row overflow-hidden bg-slate-100">
        
        {/* Sidebar (Protocol Info) */}
        {isSidebarOpen && (
          <div className="hidden md:block h-full shadow-xl z-20">
            <ProtocolSidebar />
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          
          {/* Top Bar */}
          <header className="bg-white border-b border-slate-200 p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm z-10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 leading-tight">D-VTD Scheduler</h1>
                <p className="text-[10px] text-slate-500">Myeloma Regimen (NICE TA763)</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
              
              {/* Date Picker - Improved Overlay Method */}
              <div className="relative group">
                {/* Visual UI (Ignored by pointer events so clicks pass to input) */}
                <div className="flex flex-col bg-white border border-slate-300 rounded px-2 py-1 shadow-sm group-hover:border-blue-500 group-hover:ring-1 group-hover:ring-blue-200 transition-all min-w-[140px] pointer-events-none">
                    <label className="text-[9px] font-bold uppercase text-slate-500 tracking-wider mb-0.5">Start Date</label>
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-900 truncate">{displayDate}</span>
                        <CalendarDays className="w-4 h-4 text-blue-600 shrink-0" />
                    </div>
                </div>
                
                {/* The Input - Transparent overlay that catches ALL clicks */}
                <input 
                    ref={dateInputRef}
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    onClick={(e) => {
                      // Explicitly force picker open on click
                      try {
                        if (typeof e.currentTarget.showPicker === 'function') {
                          e.currentTarget.showPicker();
                        }
                      } catch (err) {
                        // Fallback handling handled by browser default behavior
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    aria-label="Select Start Date"
                />
              </div>

              <div className="h-8 w-px bg-slate-300 mx-1 hidden sm:block"></div>

              {/* Phase Selector */}
              <div className="flex flex-col">
                <label className="text-[9px] font-bold uppercase text-slate-500 tracking-wider mb-0.5">Phase</label>
                <div className="flex bg-slate-200 rounded p-0.5">
                   <button 
                    onClick={() => handlePhaseChange(Phase.Induction)}
                    className={`px-2 py-1 text-xs rounded font-medium transition-all ${phase === Phase.Induction ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
                   >
                     Induction
                   </button>
                   <button 
                    onClick={() => handlePhaseChange(Phase.Consolidation)}
                    className={`px-2 py-1 text-xs rounded font-medium transition-all ${phase === Phase.Consolidation ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
                   >
                     Consolidation
                   </button>
                </div>
              </div>

              <div className="h-8 w-px bg-slate-300 mx-1 hidden sm:block"></div>

              {/* Cycle Selector */}
              <div className="flex flex-col">
                <label className="text-[9px] font-bold uppercase text-slate-500 tracking-wider mb-0.5">Cycle</label>
                <div className="relative">
                     <select 
                       value={cycleNumber}
                       onChange={(e) => setCycleNumber(Number(e.target.value))}
                       className="appearance-none w-full bg-slate-50 border border-slate-200 hover:border-blue-400 transition-colors text-slate-700 text-xs font-bold py-1.5 pl-3 pr-8 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
                     >
                       {getCyclesForPhase(phase).map(c => (
                         <option key={c} value={c}>Cycle {c}</option>
                       ))}
                     </select>
                     <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                       <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                     </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg md:block hidden border border-slate-200"
                title="Toggle Protocol Info"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button 
                onClick={handlePrint}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-sm font-medium text-sm"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Print</span>
              </button>
            </div>
          </header>

          {/* Calendar Area */}
          <div className="flex-1 p-2 overflow-hidden flex flex-col">
             <CalendarView 
               schedule={schedule} 
               onDayClick={handleDayClick}
               currentDate={calendarDate}
             />
          </div>

          {/* Mobile Sidebar Toggle */}
          <div className="md:hidden absolute bottom-4 right-4 z-30">
            <button 
               onClick={() => setIsSidebarOpen(!isSidebarOpen)}
               className="bg-blue-600 text-white p-3 rounded-full shadow-lg"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>
          
           {/* Mobile Sidebar Drawer */}
           {isSidebarOpen && (
             <div className="md:hidden fixed inset-0 z-40 flex">
                <div className="bg-black/50 flex-1" onClick={() => setIsSidebarOpen(false)}></div>
                <div className="w-80 h-full bg-white shadow-xl overflow-y-auto">
                   <ProtocolSidebar />
                </div>
             </div>
           )}

        </main>
      </div>

      {/* Modals */}
      <div className="no-print">
        <DayModal 
          day={selectedDay} 
          onClose={() => setSelectedDay(null)} 
        />
      </div>
    </>
  );
}
