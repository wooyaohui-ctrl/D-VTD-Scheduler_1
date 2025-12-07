import React, { useState, useEffect } from 'react';
import { ScheduledDay } from '../types';
import { getDaysInMonth, isSameDay, formatMonthYear } from '../utils/dateHelpers';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Syringe, Pill, Hospital, Home, Droplet, PauseCircle } from 'lucide-react';

interface CalendarViewProps {
  schedule: ScheduledDay[];
  onDayClick: (day: ScheduledDay) => void;
  currentDate: Date;
}

const CalendarView: React.FC<CalendarViewProps> = ({ schedule, onDayClick, currentDate: initialDate }) => {
  const [viewDate, setViewDate] = useState(initialDate);

  useEffect(() => {
    setViewDate(initialDate);
  }, [initialDate]);

  const days = getDaysInMonth(viewDate);
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getDayData = (date: Date) => schedule.find(s => isSameDay(s.date, date));

  const handlePrevMonth = () => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setViewDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setViewDate(newDate);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-600" />
            {formatMonthYear(viewDate)}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grid Header */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
        {weekDays.map(day => (
          <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">
            {day}
          </div>
        ))}
      </div>

      {/* Grid Body */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-slate-100 gap-px border-b border-slate-200">
        {days.map((date, idx) => {
          const dayData = getDayData(date);
          const isCurrentMonth = date.getMonth() === viewDate.getMonth();
          const isToday = isSameDay(date, new Date());
          
          const isStartOfCycle = dayData?.dayOfCycle === 1 && !dayData.isPaused;
          const hasClinicVisit = dayData?.hasClinicVisit;
          const hasDara = dayData?.drugs.some(d => d.name === 'Daratumumab');
          const hasBort = dayData?.drugs.some(d => d.name === 'Bortezomib');
          const hasHomeMeds = dayData?.drugs.some(d => d.route === 'PO');
          const isPaused = dayData?.isPaused;

          return (
            <div 
              key={idx}
              onClick={() => dayData && onDayClick(dayData)}
              className={`
                min-h-[110px] p-1.5 transition-colors relative group flex flex-col gap-1
                ${!isCurrentMonth ? 'bg-slate-50 text-slate-400' : 'bg-white text-slate-700'}
                ${dayData ? 'cursor-pointer hover:bg-indigo-50/50' : 'cursor-default'}
                ${isPaused ? 'bg-slate-100' : ''}
              `}
            >
              {/* Date & Cycle Number */}
              <div className="flex justify-between items-start mb-1">
                <span className={`
                  text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full
                  ${isToday ? 'bg-indigo-600 text-white shadow-md' : ''}
                `}>
                  {date.getDate()}
                </span>
                {dayData && !isPaused && (
                   <span className="text-[10px] font-mono font-medium text-slate-400">D{dayData.dayOfCycle}</span>
                )}
              </div>

              {dayData && (
                <div className="flex-1 flex flex-col gap-1.5">
                  
                  {isPaused && (
                      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-1 opacity-60">
                          <PauseCircle className="w-6 h-6" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Paused</span>
                      </div>
                  )}

                  {!isPaused && (
                    <>
                        {isStartOfCycle && (
                            <div className="text-[9px] font-bold text-white bg-indigo-500 px-1.5 py-0.5 rounded shadow-sm w-full text-center">
                            Start Cycle {dayData.cycle}
                            </div>
                        )}

                        {/* Clinic Card */}
                        {hasClinicVisit && (
                            <div className="bg-blue-50 border border-blue-200 rounded-md p-1 shadow-sm group-hover:border-blue-300 transition-colors">
                            <div className="flex items-center gap-1 text-[9px] font-extrabold text-blue-800 uppercase tracking-tight mb-1 border-b border-blue-100 pb-0.5">
                                <div className="bg-blue-100 p-0.5 rounded-sm">
                                <Hospital className="w-3 h-3 text-blue-600" />
                                </div>
                                <span>Hospital</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                {hasDara && (
                                <div className="flex items-center gap-1.5 text-[9px] font-bold text-purple-800 bg-white px-1 py-0.5 rounded border border-purple-100 shadow-sm">
                                    <Droplet className="w-3 h-3 text-purple-600 shrink-0" />
                                    <span>Dara</span>
                                </div>
                                )}
                                {hasBort && (
                                <div className="flex items-center gap-1.5 text-[9px] font-bold text-sky-800 bg-white px-1 py-0.5 rounded border border-sky-100 shadow-sm">
                                    <Syringe className="w-3 h-3 text-sky-600 shrink-0" />
                                    <span>Bort</span>
                                </div>
                                )}
                            </div>
                            </div>
                        )}

                        {/* Home Meds Card */}
                        {hasHomeMeds && (
                            <div className="bg-amber-50 border border-amber-200 rounded-md p-1 group-hover:border-amber-300 transition-colors">
                            <div className="flex items-center gap-1 text-[9px] font-extrabold text-amber-800 uppercase tracking-tight mb-0.5">
                                <div className="bg-amber-100 p-0.5 rounded-sm">
                                    <Home className="w-3 h-3 text-amber-600" />
                                </div>
                                <span>Home</span>
                            </div>
                            <div className="flex items-center gap-1 pl-0.5 mt-0.5">
                                <Pill className="w-3 h-3 text-amber-500" />
                                <span className="text-[9px] font-medium text-amber-900">Meds</span>
                            </div>
                            </div>
                        )}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
