import React from 'react';
import { AlertTriangle, Info, FileText, CheckCircle } from 'lucide-react';

const ProtocolSidebar: React.FC = () => {
  return (
    <div className="bg-white border-l border-slate-200 h-full overflow-y-auto w-full md:w-80 flex-shrink-0 p-4 text-sm text-slate-700 shadow-xl z-10">
      <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-blue-600" />
        Protocol Guide (D-VTD)
      </h2>

      <div className="space-y-6">
        <section>
          <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-1">
            <Info className="w-4 h-4 text-blue-500" /> Indications
          </h3>
          <p className="text-xs text-slate-600 mb-2">
            Newly diagnosed multiple myeloma eligible for ASCT.
            <br />
            <span className="font-bold text-red-600">Requires Blueteq approval.</span>
          </p>
        </section>

        <section className="bg-amber-50 p-3 rounded-md border border-amber-200">
          <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" /> Critical Checks
          </h3>
          <ul className="list-disc list-inside text-xs space-y-1 text-amber-900">
            <li>Thalidomide PPP (Pregnancy Prevention) compliance for ALL patients.</li>
            <li>Virology: HIV, Hep B, Hep C.</li>
            <li>Blood Group & Save: Inform lab of Daratumumab (interferes with cross-match).</li>
            <li>Neuropathy assessment before each cycle.</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-slate-900 mb-2">Pre-medications</h3>
          <div className="text-xs bg-slate-50 p-2 rounded border border-slate-200">
            <p className="font-medium mb-1">Standard (1hr pre-Dara):</p>
            <ul className="list-disc list-inside mb-2">
              <li>Paracetamol 1g PO</li>
              <li>Chlorphenamine 4mg PO</li>
              <li>Dexamethasone 20mg PO/IV</li>
            </ul>
            <p className="font-medium mb-1">Cycle 1 Only:</p>
            <ul className="list-disc list-inside">
              <li>Montelukast 10mg PO</li>
            </ul>
          </div>
        </section>

        <section>
          <h3 className="font-semibold text-slate-900 mb-2">Prophylaxis</h3>
          <ul className="list-disc list-inside text-xs space-y-1">
            <li><strong>Aciclovir:</strong> 200mg TDS (or renal adj).</li>
            <li><strong>Allopurinol:</strong> Cycle 1 only (7 days).</li>
            <li><strong>VTE Prophylaxis:</strong> Apixaban 2.5mg BD (preferred) or LMWH.</li>
            <li><strong>PPI/H2:</strong> Consider Famotidine/Omeprazole with Dexamethasone.</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-slate-900 mb-2">Dose Modifications</h3>
          <div className="space-y-2 text-xs">
            <div className="p-2 bg-red-50 rounded border border-red-100">
              <p className="font-semibold text-red-800">Neuropathy (Bortezomib)</p>
              <p>G1 with pain/G2: Reduce to 1.0 mg/m²</p>
              <p>G2 with pain/G3: Withhold -&gt; 0.7 mg/m²</p>
            </div>
            <div className="p-2 bg-blue-50 rounded border border-blue-100">
              <p className="font-semibold text-blue-800">Renal Impairment</p>
              <p>Dara/Thal: No adjustment.</p>
              <p>Bortezomib: Use post-dialysis.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProtocolSidebar;
