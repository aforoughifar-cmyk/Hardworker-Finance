import React from 'react';
import PageOverlay from './PageOverlay';

interface FileViewerModalProps {
  fileUrl: string;
  fileType: string;
  onClose: () => void;
}

const FileViewerModal: React.FC<FileViewerModalProps> = ({ fileUrl, fileType, onClose }) => {
  const renderContent = () => {
    if (fileType.startsWith('image/')) {
      return <img src={fileUrl} alt="Dosya" className="max-w-full max-h-full mx-auto object-contain rounded-lg" />;
    }
    if (fileType.startsWith('video/')) {
      return <video src={fileUrl} controls autoPlay className="max-w-full max-h-full mx-auto rounded-lg" />;
    }
    if (fileType === 'application/pdf') {
      return <iframe src={fileUrl} className="w-full h-[80vh] border-0" title="PDF Görüntüleyici" />;
    }
    return (
        <div className="text-center p-10 bg-white rounded-lg shadow-xl">
            <p className="text-slate-700 text-lg mb-6">Bu dosya türü için önizleme desteklenmiyor.</p>
            <a href={fileUrl} download className="text-white bg-indigo-600 hover:bg-indigo-700 font-semibold py-3 px-6 rounded-lg transition-colors">
                Dosyayı İndir
            </a>
        </div>
    );
  };

  return (
    <PageOverlay
      title="Dosya Görüntüleyici"
      onClose={onClose}
      footer={
        <button onClick={onClose} className="px-5 py-2 text-sm font-medium rounded-md bg-slate-200 hover:bg-slate-300 text-slate-800">
          Kapat
        </button>
      }
    >
      <div className="flex items-center justify-center h-full">
        {renderContent()}
      </div>
    </PageOverlay>
  );
};

export default FileViewerModal;
