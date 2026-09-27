import React from 'react';
import { OnlineMedicalStore } from '../../components/store/OnlineMedicalStore';

export const MedicalStorePage: React.FC = () => {
  return (
    <div className="bg-[#0c001a] text-purple-100 min-h-screen font-sans selection:bg-pink-500 selection:text-white">
      <main className="pt-4">
        <OnlineMedicalStore />
      </main>
    </div>
  );
};
