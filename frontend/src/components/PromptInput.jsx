import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

export default function PromptInput({ onSend, loading }) {
    const [input, setInput] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;
        onSend(input);
        setInput('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto px-4 pb-6">
            <form onSubmit={handleSubmit} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-20 group-hover:opacity-40 transition-opacity blur"></div>
                <div className="relative flex items-end gap-2 bg-gray-900 border border-gray-700 rounded-2xl p-2 shadow-2xl">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Describe a 3D model to generate..."
                        className="w-full bg-transparent border-none text-white placeholder-gray-500 resize-none max-h-48 min-h-[50px] p-3 focus:ring-0 text-md"
                        rows={1}
                        disabled={loading}
                        style={{ height: 'auto', minHeight: '50px' }}
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="mb-1 p-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                    </button>
                </div>
                <div className="text-xs text-center text-gray-500 mt-2">
                    AI can make mistakes. Review the generated code and model.
                </div>
            </form>
        </div>
    );
}
