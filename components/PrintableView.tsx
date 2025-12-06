import React from 'react';
import { ScheduledDay } from '../types';
import { getStartOfWeek, addDays, isSameDay } from '../utils/dateHelpers';

interface PrintableViewProps {
  schedule: ScheduledDay[];
}

const PrintableView: React.FC<PrintableViewProps> = ({ schedule }) => {
  if (schedule.length === 0) return null;

  const firstDay = schedule[0];
  const lastDay = schedule[schedule.length - 1];
  
  // Calculate Grid
  // We want to show a calendar view starting from the Monday of the first week
  // spanning to the Sunday of the last week.
  const startOfGrid = getStartOfWeek(firstDay.date);
  
  // Calculate end of grid (next Sunday after last day)
  const lastDate = new Date(lastDay.date);
  const endDow = lastDate.getDay(); // 0 is Sunday
  const daysToAdd = endDow === 0 ? 0 : 7 - endDow;
  const endOfGrid = addDays(lastDate, daysToAdd);

  const gridDays: Date[] = [];
  let current = new Date(startOfGrid);
  // Safety limit of 6 weeks (42 days)
  while (current <= endOfGrid && gridDays.length < 42) {
    gridDays.push(new Date(current));
    current = addDays(current, 1);
  }

  const getDayData = (date: Date) => schedule.find(s => isSameDay(s.date, date));

  const weeks = [];
  for (let i = 0; i < gridDays.length; i += 7) {
    weeks.push(gridDays.slice(i, i + 7));
  }

  return (
    <div className="print-only w-full max-w-[280mm] mx-auto text-black font-sans text-xs">
      
      {/* Header Section */}
      <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wider text-slate-900">Myeloma Treatment Schedule</h1>
          <p className="text-sm font-bold text-slate-700 mt-1">Protocol: D-VTD (Daratumumab, Bortezomib, Thalidomide, Dexamethasone)</p>
          <div className="mt-4 flex gap-8 text-sm">
             <div>
               <span className="text-slate-500 uppercase text-[10px] block">Cycle</span>
               <span className="font-bold text-xl">{firstDay.cycle}</span>
             </div>
             <div>
               <span className="text-slate-500 uppercase text-[10px] block">Start Date</span>
               <span className="font-semibold">{firstDay.dateString}</span>
             </div>
             <div>
               <span className="text-slate-500 uppercase text-[10px] block">Phase</span>
               <span className="font-semibold">{firstDay.phase}</span>
             </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 min-w-[300px]">
           <div className="border-b border-slate-300 pb-1">
             <span className="text-[10px] uppercase text-slate-500 mr-2">Patient Name:</span>
           </div>
           <div className="border-b border-slate-300 pb-1">
             <span className="text-[10px] uppercase text-slate-500 mr-2">Hospital No:</span>
           </div>
           <div className="border-b border-slate-300 pb-1">
             <span className="text-[10px] uppercase text-slate-500 mr-2">Consultant:</span>
           </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border border-slate-300 rounded-sm mb-6">
        {/* Days Header */}
        <div className="grid grid-cols-7 bg-slate-100 border-b border-slate-300">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
            <div key={d} className="py-1 px-2 text-center font-bold text-[10px] uppercase text-slate-600 border-r border-slate-300 last:border-r-0">
              {d}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {weeks.map((week, wIdx) => (
          <div key={wIdx} className="break-inside-avoid page-break-inside-avoid border-b border-slate-300 last:border-b-0">
            <div className="grid grid-cols-7">
              {week.map((date, dIdx) => {
                const dayData = getDayData(date);
                const isToday = dayData !== undefined;
                const hasClinic = dayData?.hasClinicVisit;
                const hasDex = dayData?.drugs.some(d => d.name === 'Dexamethasone');

                // Extract specific clinic drugs for display
                const clinicMeds = dayData?.drugs
                  .filter(d => ['Daratumumab', 'Bortezomib'].includes(d.name))
                  .map(d => d.name === 'Daratumumab' ? 'Dara' : 'Bort')
                  .join(' + ');

                return (
                  <div key={dIdx} className={`min-h-[90px] p-1 border-r border-slate-300 last:border-r-0 flex flex-col relative ${!isToday ? 'bg-slate-50' : 'bg-white'}`}>

                    {/* Date Header */}
                    <div className="flex justify-between items-start mb-1">
                      <span className={`font-bold ${!isToday ? 'text-slate-400' : 'text-slate-900'}`}>
                        {date.getDate()} {date.getDate() === 1 || wIdx === 0 && dIdx === 0 ? date.toLocaleString('default', { month: 'short' }) : ''}
                      </span>
                      {dayData && (
                        <span className="text-[9px] font-mono bg-slate-100 text-slate-600 px-1 rounded">
                          D{dayData.dayOfCycle}
                        </span>
                      )}
                    </div>

                    {/* Cell Content */}
                    {dayData ? (
                      <div className="flex-1 flex flex-col gap-1">

                        {/* Clinic Visit Block */}
                        {hasClinic && (
                          <div className="bg-blue-100 border border-blue-300 rounded p-1 text-center mb-1">
                            <div className="text-[9px] font-bold text-blue-900 uppercase">HOSPITAL</div>
                            <div className="text-[10px] font-bold text-blue-800 leading-tight">{clinicMeds}</div>
                          </div>
                        )}

                        {/* Home Meds */}
                        <div className="mt-auto space-y-1">
                          {hasDex && (
                            <div className="flex items-center gap-1 text-[9px]">
                              <span className="font-bold bg-amber-100 text-amber-800 px-1 rounded text-[8px] border border-amber-200">AM</span>
                              <span className="truncate font-medium text-slate-800">Dexamethasone</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-[9px]">
                             <span className="font-bold bg-slate-100 text-slate-600 px-1 rounded text-[8px] border border-slate-200">PM</span>
                             <span className="truncate text-slate-600">Thalidomide</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxwYXRoIGQ9Ik0wIDBMNCA0Wk00IDBMMCA0WiIgc3Ryb2tlPSIjZjFmM2Y1IiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+')] opacity-50"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default PrintableView;