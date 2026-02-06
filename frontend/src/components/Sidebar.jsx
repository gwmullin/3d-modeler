import React, { useState } from 'react';
import { MessageSquare, ChevronLeft, ChevronRight, Plus, Box } from 'lucide-react';

export default function Sidebar({ messages, onNewChat, isOpen, onToggle }) {
    // For MVP, we don't have multiple sessions yet, so "Sidebar" just shows "Current Session" or "New Chat" button
    // And maybe a list of messages as "history" trace?
    // The user asked for "sidebar for tracking prior requests". 
    // Let's interpret this as: List of questions asked.

    return (
        <div
            className={`border-r border-gray-800 bg-gray-900 flex flex-col transition-all duration-300 ${isOpen ? 'w-80' : 'w-16'
                }`}
        >
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
                {isOpen ? (
                    <div className="flex items-center gap-2 font-bold text-lg text-white">
                        <Box className="w-6 h-6 text-blue-500" />
                        <span>GenAI</span>
                    </div>
                ) : (
                    <div className="flex justify-center w-full">
                        <Box className="w-6 h-6 text-blue-500" />
                    </div>
                )}

                <button
                    onClick={onToggle}
                    className="p-1 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                    {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                </button>
            </div>

            {/* New Chat Action */}
            <div className="p-4">
                <button
                    onClick={onNewChat}
                    className={`flex items-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 transition-all shadow-lg ${isOpen ? 'justify-start' : 'justify-center'
                        }`}
                >
                    <Plus size={20} />
                    {isOpen && <span className="font-medium">New Project</span>}
                </button>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
                {isOpen && <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Session History</div>}

                <div className="space-y-1 p-2">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`group flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors truncate ${msg.role === 'user' ? 'text-gray-300' : 'text-blue-400 bg-blue-900/10'
                                }`}
                            title={msg.content}
                        >
                            <MessageSquare size={16} className={`shrink-0 ${msg.role === 'user' ? 'text-gray-500' : 'text-blue-500'}`} />
                            {isOpen && <span className="text-sm truncate">{msg.role === 'model' ? (msg.content || "Generated Model") : msg.content}</span>}
                        </div>
                    ))}

                    {messages.length === 0 && isOpen && (
                        <div className="text-gray-600 text-sm text-center py-8">
                            No history yet. Start modeling!
                        </div>
                    )}
                </div>
            </div>

            {/* Footer / User Profile (Static for now) */}
            <div className="p-4 border-t border-gray-800">
                <div className={`flex items-center gap-3 ${isOpen ? '' : 'justify-center'}`}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                        AD
                    </div>
                    {isOpen && (
                        <div className="overflow-hidden">
                            <div className="text-sm font-medium text-white truncate">Admin</div>
                            <div className="text-xs text-gray-500 truncate">Pro Plan</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
