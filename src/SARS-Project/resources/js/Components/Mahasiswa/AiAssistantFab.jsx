import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

export default function MahasiswaAiAssistantFab({ onClick, ref }) {
    return (
        <motion.button
            ref={ref}
            onClick={onClick}
            title="Buka AI Assistant"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="fixed bottom-6 right-6 z-50
                       w-14 h-14 rounded-full bg-primary-500 hover:bg-primary-600
                       text-white shadow-lg shadow-primary-500/25
                       flex items-center justify-center
                       group"
        >
            <Bot size={24} className="group-hover:rotate-12 transition-transform" />
            <span className="absolute inset-0 rounded-full bg-primary-500/30 animate-ping" />
        </motion.button>
    );
}

