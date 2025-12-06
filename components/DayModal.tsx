import React from 'react';
import { ScheduledDay, DrugEntry } from '../types';
import { X, Pill, Syringe, AlertCircle } from 'lucide-react';

interface DayModalProps {
  day: ScheduledDay | null;
  onClose: () => void;
}

const DayModal: React.FC<DayModalProps> = ({ day, onClose }) => {
  if (!day) return null;

  const groupedDrugs = day.drugs.reduce((acc, drug) => {
    const key = drug.isPreMed ? 'Pre-medication' : 'Chemotherapy';
    if (!acc[key]) acc[key] = [];
    acc[key].push(drug);
    return acc;
  }, {} as Record<string, DrugEntry[]>);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-purple-900 p-4 flex justify-between items-center text-white">
          <div>
            <h3 className="text-xl font-bold">{day.dateString}</h3>
            <p className="text-purple-200 text-sm">Cycle {day.cycle}, Day {day.dayOfCycle}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-purple-700 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {day.hasClinicVisit && (
            <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-md flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-blue-800">Clinic Visit Required</p>
                <p className="text-sm text-blue-700">Patient must attend the Day Unit for Isatuximab IV infusion.</p>
              </div>
            </div>
          )}

          {Object.entries(groupedDrugs).sort((a,b) => a[0] === 'Pre-medication' ? -1 : 1).map(([category, drugs]) => (
            <div key={category} className="mb-6 last:mb-0">
              <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-3">{category}</h4>
              <div className="space-y-3">
                {drugs.map((drug, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:border-slate-300 transition-colors bg-white shadow-sm">
                    <div className={`p-2 rounded-full shrink-0 ${drug.route === 'PO' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                      {drug.route === 'PO' ? <Pill className="w-5 h-5" /> : <Syringe className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{drug.name}</span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-mono rounded">{drug.dose}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                         <span className={`text-[10px] px-1.5 rounded border ${drug.route === 'PO' ? 'border-green-200 text-green-700' : 'border-purple-200 text-purple-700'}`}>
                           {drug.route}
                         </span>
                         {drug.notes && <p className="text-xs text-slate-500">{drug.notes}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

           {!day.drugs.length && (
            <div className="text-center py-8 text-slate-400 italic">
              Rest Day - No scheduled medications (Pomalidomide off days 22-28).
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DayModal;
