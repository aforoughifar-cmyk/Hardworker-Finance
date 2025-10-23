import React from 'react';

interface PageOverlayProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'| '3xl' | '4xl' | '5xl';
}

const PageOverlay: React.FC<PageOverlayProps> = ({ title, children, onClose, footer, size = '3xl' }) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl'
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 grid place-items-center p-4" // Use grid for robust centering
    >
      <div 
        className={`bg-slate-50 w-full ${sizeClasses[size]} shadow-2xl rounded-lg modal-content flex flex-col max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-5 border-b border-slate-200 flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 text-slate-500">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>
        {/*
          FIX: Added `min-h-0` to the main content area. This is a crucial fix for flexbox containers
          that need to scroll their content. It prevents the flex item from growing infinitely based on its content,
          allowing the `overflow-y-auto` and `max-h-[90vh]` on the parent to work correctly.
        */}
        <main className="p-6 overflow-y-auto flex-grow min-h-0">
          {children}
        </main>
        {footer && (
          <footer className="p-4 border-t border-slate-200 flex justify-end items-center gap-3 bg-slate-100/80 backdrop-blur-sm flex-shrink-0">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
};

export default PageOverlay;
