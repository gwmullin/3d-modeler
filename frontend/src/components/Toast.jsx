import React, { useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

export default function Toast({ message, type = 'error', onClose }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 10000); // Auto close after 10s
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in-down w-full max-w-2xl px-4">
            <div className={`bg-gray-900 border ${type === 'error' ? 'border-red-500/50' : 'border-blue-500/50'} rounded-lg shadow-2xl p-4 flex gap-3 text-white`}>
                <div className={`shrink-0 ${type === 'error' ? 'text-red-500' : 'text-blue-500'}`}>
                    <AlertCircle />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm mb-1">{type === 'error' ? 'Error' : 'Info'}</h3>
                    <p className="text-sm text-gray-300 font-mono whitespace-pre-wrap break-words max-h-60 overflow-y-auto select-all">
                        {message}
                    </p>
                </div>
                <button onClick={onClose} className="shrink-0 text-gray-500 hover:text-white">
                    <X size={18} />
                </button>
            </div>
        </div>
    );
}
