import { Bot } from 'lucide-react';

export default function AiAssistantFab({ onClick }) {
    return (
        <button
            onClick={onClick}
            title="Buka AI Assistant"
            className="fixed bottom-6 right-6 z-50
                       w-14 h-14 rounded-full bg-primary-500 hover:bg-primary-600
                       text-white shadow-lg shadow-primary-500/25
                       flex items-center justify-center
                       transition-all duration-200 hover:scale-110 active:scale-95
                       group"
        >
            <Bot size={24} className="group-hover:rotate-12 transition-transform" />

            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full bg-primary-500/30 animate-ping" />
        </button>
    );
}
