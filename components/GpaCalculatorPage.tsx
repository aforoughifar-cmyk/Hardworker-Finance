import React from 'react';
import DersForm from './DersForm';
import DersListesi from './DersListesi';
import SonucGoster from './SonucGoster';

// This is a placeholder component for the GPA Calculator feature.
const GpaCalculatorPage: React.FC = () => {
  return (
    <div className="w-full space-y-8">
       <header className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">Not Ortalaması Hesaplayıcı</h1>
            <p className="text-slate-500 mt-2 text-lg">Derslerinizi ve notlarınızı girerek ortalamanızı hesaplayın.</p>
        </header>
      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <DersForm />
          <SonucGoster />
        </div>
        <div>
          <DersListesi />
        </div>
      </main>
    </div>
  );
};

export default GpaCalculatorPage;
