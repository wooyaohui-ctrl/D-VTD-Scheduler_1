import React from 'react';
import { AlertTriangle, Info, FileText, CheckCircle } from 'lucide-react';

const ProtocolSidebar: React.FC = () => {
  return (
    <div className="bg-white border-l border-slate-200 h-full overflow-y-auto w-full md:w-80 flex-shrink-0 p-4 text-sm text-slate-700 shadow-xl z-10">
      <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-purple-600" />
        Protocol Guide (IsaPomDex)
      </h2>

      <div className="space-y-6">
        <section>
          <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-1">
            <Info className="w-4 h-4 text-purple-500" /> Indications
          </h3>
          <p className="text-xs text-slate-600 mb-2">
            Relapsed/refractory multiple myeloma after at least 2 prior therapies including lenalidomide and a proteasome inhibitor.
            <br />
            <span className="font-bold text-red-600">Requires Blueteq approval.</span>
          </p>
        </section>

        <section className="bg-amber-50 p-3 rounded-md border border-amber-200">
          <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" /> Critical Checks
          </h3>
          <ul className="list-disc list-inside text-xs space-y-1 text-amber-900">
            <li>Pomalidomide PPP (Pregnancy Prevention) compliance for ALL patients.</li>
            <li>Virology: HIV, Hep B, Hep C.</li>
            <li>Blood Group & Save: Inform lab of Isatuximab (interferes with cross-match).</li>
            <li>Baseline FBC, U&E, LFTs before each cycle.</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-slate-900 mb-2">Pre-medications (Isatuximab)</h3>
          <div className="text-xs bg-slate-50 p-2 rounded border border-slate-200">
            <p className="font-medium mb-1">Standard (15-60 min pre-Isa):</p>
            <ul className="list-disc list-inside mb-2">
              <li>Paracetamol 650-1000mg PO</li>
              <li>Diphenhydramine 25-50mg IV (or equivalent)</li>
              <li>Ranitidine 50mg IV (or equivalent H2 blocker)</li>
              <li>Dexamethasone 40mg IV</li>
            </ul>
            <p className="font-medium mb-1 text-purple-700">Infusion-related reactions:</p>
            <ul className="list-disc list-inside">
              <li>Most common during first infusion</li>
              <li>Monitor vital signs during and after</li>
            </ul>
          </div>
        </section>

        <section>
          <h3 className="font-semibold text-slate-900 mb-2">Drug Schedule</h3>
          <div className="text-xs bg-purple-50 p-2 rounded border border-purple-200">
            <p className="font-medium mb-1 text-purple-800">Isatuximab 10mg/kg IV:</p>
            <ul className="list-disc list-inside mb-2">
              <li>Cycle 1: Days 1, 8, 15, 22 (weekly)</li>
              <li>Cycle 2+: Days 1, 15 (bi-weekly)</li>
            </ul>
            <p className="font-medium mb-1 text-purple-800">Pomalidomide 4mg PO:</p>
            <ul className="list-disc list-inside mb-2">
              <li>Days 1-21 (7 days off, days 22-28)</li>
            </ul>
            <p className="font-medium mb-1 text-purple-800">Dexamethasone 40mg:</p>
            <ul className="list-disc list-inside">
              <li>Days 1, 8, 15, 22</li>
              <li>Reduce to 20mg if age &gt;=75</li>
            </ul>
          </div>
        </section>

        <section>
          <h3 className="font-semibold text-slate-900 mb-2">Prophylaxis</h3>
          <ul className="list-disc list-inside text-xs space-y-1">
            <li><strong>Aciclovir:</strong> 400mg BD (VZV prophylaxis).</li>
            <li><strong>Co-trimoxazole:</strong> 480mg BD 3x/week (PCP prophylaxis).</li>
            <li><strong>VTE Prophylaxis:</strong> Aspirin 75mg OD or LMWH (per risk assessment).</li>
            <li><strong>PPI:</strong> Consider with Dexamethasone.</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-slate-900 mb-2">Dose Modifications</h3>
          <div className="space-y-2 text-xs">
            <div className="p-2 bg-red-50 rounded border border-red-100">
              <p className="font-semibold text-red-800">Pomalidomide</p>
              <p>Neutropenia/Thrombocytopenia: Interrupt and reduce dose</p>
              <p>Level -1: 3mg, Level -2: 2mg, Level -3: 1mg</p>
            </div>
            <div className="p-2 bg-purple-50 rounded border border-purple-100">
              <p className="font-semibold text-purple-800">Renal Impairment</p>
              <p>CrCl 30-60: No initial adjustment</p>
              <p>CrCl &lt;30 or dialysis: Reduce Pom to 3mg</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProtocolSidebar;
