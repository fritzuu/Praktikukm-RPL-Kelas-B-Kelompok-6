import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Bot, Sparkles, Send, Building2, Clock, Users, ClipboardCheck } from 'lucide-react';
import {
    MOCK_AI_ANALYSIS,
    MOCK_METRIK,
    MOCK_TUGAS_PENDING,
} from '../../data/mockData';
import {
    MOCK_DOSEN_AI_ANALYSIS,
    MOCK_DOSEN_METRIK,
    MOCK_DOSEN_TUGAS,
} from '../../data/dosenMockData';
import {
    MOCK_ASLAB_AI_ANALYSIS,
    MOCK_ASLAB_METRIK,
    MOCK_ASLAB_TUGAS,
} from '../../data/aslabMockData';

const ROLE_MODE_LABELS = {
    admin: 'Admin Mode',
    dosen: 'Dosen Mode',
    aslab: 'Aslab Mode',
    mahasiswa: 'Mahasiswa Mode',
};

export default function AiAssistantPanel({ isOpen, onClose, role = 'admin', ref }) {
    const [chatInput, setChatInput] = useState('');

    function handleSend() {
        if (!chatInput.trim()) return;
        console.log('AI Chat input:', chatInput, '| Role context:', role);
        setChatInput('');
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    const modeLabel = ROLE_MODE_LABELS[role] || 'Mode Aktif';

    // Dynamic Role Configuration
    const config = {
        admin: {
            analysisTitle: 'Analisis Konflik',
            analysisText: MOCK_AI_ANALYSIS.text,
            analysisRecommendation: MOCK_AI_ANALYSIS.rekomendasi,
            metricTitle: 'Metrik Efisiensi',
            metric1Icon: Building2,
            metric1Label: 'Utilisasi Ruangan',
            metric1Value: MOCK_METRIK.utilisasiRuangan,
            metric1Suffix: '%',
            metric2Icon: Clock,
            metric2Label: 'Waktu Tunggu',
            metric2Value: MOCK_METRIK.waktuTunggu,
            metric2Suffix: '',
            tasksTitle: 'Ringkasan Tugas Tertunda',
            tasksData: MOCK_TUGAS_PENDING,
            placeholder: 'Tanyakan AI tentang konflik...'
        },
        dosen: {
            analysisTitle: 'Analisis Kehadiran',
            analysisText: MOCK_DOSEN_AI_ANALYSIS.text,
            analysisRecommendation: MOCK_DOSEN_AI_ANALYSIS.rekomendasi,
            metricTitle: 'Metrik Mengajar',
            metric1Icon: Users,
            metric1Label: 'Kehadiran Rata²',
            metric1Value: MOCK_DOSEN_METRIK.kehadiranRataRata,
            metric1Suffix: '%',
            metric2Icon: Clock,
            metric2Label: 'Tugas Dinilai',
            metric2Value: MOCK_DOSEN_METRIK.tugasDinilai,
            metric2Suffix: '',
            tasksTitle: 'Tugas Tertunda',
            tasksData: MOCK_DOSEN_TUGAS,
            placeholder: 'Tanya AI tentang jadwal...'
        },
        aslab: {
            analysisTitle: 'Analisis Validasi',
            analysisText: MOCK_ASLAB_AI_ANALYSIS.text,
            analysisRecommendation: MOCK_ASLAB_AI_ANALYSIS.rekomendasi,
            metricTitle: 'Metrik Validasi',
            metric1Icon: ClipboardCheck,
            metric1Label: 'Validasi Minggu Ini',
            metric1Value: MOCK_ASLAB_METRIK.validasiMingguIni,
            metric1Suffix: '',
            metric2Icon: Clock,
            metric2Label: 'Waktu Respon',
            metric2Value: MOCK_ASLAB_METRIK.rataRataWaktuRespon,
            metric2Suffix: '',
            tasksTitle: 'Tugas Tertunda',
            tasksData: MOCK_ASLAB_TUGAS,
            placeholder: 'Tanya AI tentang jadwal...'
        }
    };

    const currentConfig = config[role] || config.admin;
    const Metric1Icon = currentConfig.metric1Icon;
    const Metric2Icon = currentConfig.metric2Icon;

    return (
        <motion.aside
            ref={ref}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 250 }}
            className="shrink-0 border-l border-border bg-card flex flex-col h-[calc(100vh-57px)] sticky top-[57px] z-40 overflow-hidden"
        >
            {/* Fixed width mask wrapper to prevent content squishing during transition */}
            <div className="w-[320px] flex flex-col h-full shrink-0">
                {/* ── Header ───────────────────────────────────────────── */}
                <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
                    <div className="w-9 h-9 rounded-xl bg-primary-500/10 flex items-center justify-center">
                        <Bot size={20} className="text-primary-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-text-primary leading-tight">
                            SARS AI Assistant
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                            <span className="text-[10px] font-semibold text-success uppercase tracking-wide">
                                {modeLabel}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-text-muted hover:bg-surface hover:text-text-secondary transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* ── Scrollable Content ───────────────────────────────── */}
                <div className="flex-1 overflow-y-auto panel-scroll px-4 py-4 space-y-5">
                    {/* Analisis AI */}
                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">
                            {currentConfig.analysisTitle}
                        </h3>
                        <div className="bg-surface rounded-xl p-3.5">
                            <p className="text-sm text-text-secondary leading-relaxed">
                                {currentConfig.analysisText}
                            </p>
                            <div className="mt-3 bg-warning/10 border border-warning/20 rounded-lg px-3 py-2.5">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <Sparkles size={12} className="text-warning" />
                                    <span className="text-[10px] font-bold text-warning uppercase tracking-wide">
                                        Rekomendasi AI
                                    </span>
                                </div>
                                <p className="text-xs text-text-primary leading-relaxed">
                                    {currentConfig.analysisRecommendation}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Metrik AI */}
                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">
                            {currentConfig.metricTitle}
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-surface rounded-xl p-3 text-center">
                                <div className="flex items-center justify-center gap-1.5 mb-1">
                                    <Metric1Icon size={12} className="text-text-muted" />
                                    <span className="text-[10px] text-text-muted">{currentConfig.metric1Label}</span>
                                </div>
                                <p className="text-2xl font-bold text-text-primary">
                                    {currentConfig.metric1Value}
                                    {currentConfig.metric1Suffix && <span className="text-sm font-medium text-text-muted">{currentConfig.metric1Suffix}</span>}
                                </p>
                            </div>
                            <div className="bg-surface rounded-xl p-3 text-center">
                                <div className="flex items-center justify-center gap-1.5 mb-1">
                                    <Metric2Icon size={12} className="text-text-muted" />
                                    <span className="text-[10px] text-text-muted">{currentConfig.metric2Label}</span>
                                </div>
                                <p className="text-2xl font-bold text-text-primary">
                                    {currentConfig.metric2Value}
                                    {currentConfig.metric2Suffix && <span className="text-sm font-medium text-text-muted">{currentConfig.metric2Suffix}</span>}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tugas Pending */}
                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">
                            {currentConfig.tasksTitle}
                        </h3>
                        <ul className="space-y-2">
                            {currentConfig.tasksData.map((tugas, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                    <span
                                        className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${idx === 0 ? 'bg-danger' : idx === 1 ? 'bg-warning' : 'bg-info'}`}
                                    />
                                    <span className="text-sm text-text-secondary leading-tight">{tugas}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* ── Chat Input ───────────────────────────────────────── */}
                <div className="px-4 py-3 border-t border-border">
                    <div className="flex items-center gap-2 bg-surface rounded-xl px-3 py-2 border border-border focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={currentConfig.placeholder}
                            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!chatInput.trim()}
                            className="w-8 h-8 rounded-lg bg-primary-500 hover:bg-primary-600 disabled:bg-border disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors shrink-0"
                        >
                            <Send size={14} />
                        </button>
                    </div>
                </div>
            </div> {/* Closing mask wrapper */}
        </motion.aside>
    );
}

