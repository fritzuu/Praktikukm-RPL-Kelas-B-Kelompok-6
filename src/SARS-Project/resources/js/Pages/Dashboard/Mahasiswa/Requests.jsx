import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import MahasiswaLayout from '../../../Layouts/MahasiswaLayout';
import { FileText, Plus, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';

const STATUS_STYLES = {
    PENDING_ASLAB: { bg: 'bg-warning/10', text: 'text-warning', label: 'Pending Aslab', icon: Clock },
    PENDING_ADMIN: { bg: 'bg-info/10', text: 'text-info', label: 'Pending Admin', icon: Clock },
    APPROVED: { bg: 'bg-success/10', text: 'text-success', label: 'Disetujui', icon: CheckCircle },
    REJECTED_ASLAB: { bg: 'bg-danger/10', text: 'text-danger', label: 'Ditolak Aslab', icon: XCircle },
    REJECTED_ADMIN: { bg: 'bg-danger/10', text: 'text-danger', label: 'Ditolak Admin', icon: XCircle },
    CANCELLED: { bg: 'bg-text-muted/10', text: 'text-text-muted', label: 'Dibatalkan', icon: XCircle },
};

const PIPELINE = ['PENDING_ASLAB', 'FORWARDED', 'PENDING_ADMIN', 'APPROVED'];

const SESSION_TIMES_NORMAL = {
    1: { start: '07:30', end: '08:20' },
    2: { start: '08:25', end: '09:15' },
    3: { start: '09:20', end: '10:10' },
    4: { start: '10:15', end: '11:05' },
    5: { start: '11:10', end: '12:00' },
    6: { start: '13:00', end: '13:50' },
    7: { start: '13:55', end: '14:45' },
    8: { start: '15:30', end: '16:20' },
    9: { start: '16:25', end: '17:15' },
    10: { start: '18:00', end: '18:50' },
    11: { start: '18:55', end: '19:20' },
};

const SESSION_TIMES_JUMAT = {
    1: { start: '07:30', end: '08:20' },
    2: { start: '08:25', end: '09:15' },
    3: { start: '09:20', end: '10:10' },
    4: { start: '10:15', end: '11:05' },
    5: { start: '13:00', end: '13:50' },
    6: { start: '13:55', end: '14:45' },
    7: { start: '15:30', end: '16:20' },
    8: { start: '16:25', end: '17:15' },
    9: { start: '18:00', end: '18:50' },
    10: { start: '18:55', end: '19:20' },
    11: { start: '19:25', end: '20:15' },
};

const formatTimesToSessions = (day, startTime, endTime) => {
    if (!startTime || !endTime) return '-';
    const start = startTime.substring(0, 5);
    const end = endTime.substring(0, 5);
    
    const isFriday = day === 'JUMAT';
    const times = isFriday ? SESSION_TIMES_JUMAT : SESSION_TIMES_NORMAL;
    
    let startSesi = null;
    let endSesi = null;
    
    for (const [sesi, range] of Object.entries(times)) {
        if (range.start === start) startSesi = parseInt(sesi);
        if (range.end === end) endSesi = parseInt(sesi);
    }
    
    if (startSesi && endSesi) {
        return startSesi === endSesi 
            ? `Sesi ${startSesi} (${start} - ${end})` 
            : `Sesi ${startSesi} - ${endSesi} (${start} - ${end})`;
    }
    
    return `${start} - ${end}`;
};

const getScheduleOptionLabel = (s) => {
    if (!s) return '';
    const classStr = s.course?.class_name ? ` (Kelas ${s.course.class_name})` : '';
    const startSesi = s.session_start;
    const dur = s.session_duration;
    const endSesi = startSesi + dur - 1;
    const sessionStr = dur > 1 ? `Sesi ${startSesi} - ${endSesi}` : `Sesi ${startSesi}`;
    const roomStr = s.room ? ` [Ruang: ${s.room.name || s.room.code}]` : '';
    return `${s.course?.name || ''}${classStr} — ${s.day_of_week}, ${sessionStr}${roomStr}`;
};

export default function Requests({
    requests: propRequests,
    schedules: propSchedules,
    rooms: propRooms,
}) {
    const requests = propRequests?.data || propRequests || [];
    const schedules = propSchedules || [];
    const rooms = propRooms || [];

    const [showForm, setShowForm] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [startSession, setStartSession] = useState('');
    const [endSession, setEndSession] = useState('');
    const [form, setForm] = useState({
        schedule_id: '', request_type: 'TEMPORARY', target_date: '', effective_from_date: '',
        proposed_day: '', proposed_start_time: '', proposed_end_time: '', proposed_room_id: '', reason: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    function handleChange(field, value) {
        setForm(prev => ({ ...prev, [field]: value }));
        if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: null }));
    }

    const handleSessionChange = (type, val) => {
        const isFriday = form.proposed_day === 'JUMAT';
        const times = isFriday ? SESSION_TIMES_JUMAT : SESSION_TIMES_NORMAL;
        if (type === 'start') {
            setStartSession(val);
            if (times[val]) {
                handleChange('proposed_start_time', times[val].start);
            } else {
                handleChange('proposed_start_time', '');
            }
        } else if (type === 'end') {
            setEndSession(val);
            if (times[val]) {
                handleChange('proposed_end_time', times[val].end);
            } else {
                handleChange('proposed_end_time', '');
            }
        }
    };

    const handleDayChange = (day) => {
        handleChange('proposed_day', day);
        const isFriday = day === 'JUMAT';
        const times = isFriday ? SESSION_TIMES_JUMAT : SESSION_TIMES_NORMAL;
        if (startSession && times[startSession]) {
            handleChange('proposed_start_time', times[startSession].start);
        }
        if (endSession && times[endSession]) {
            handleChange('proposed_end_time', times[endSession].end);
        }
    };

    function validateForm() {
        const errors = {};
        if (!form.schedule_id) errors.schedule_id = 'Pilih jadwal';
        if (form.request_type === 'TEMPORARY' && !form.target_date) errors.target_date = 'Tanggal wajib diisi';
        if (form.request_type === 'PERMANENT' && !form.effective_from_date) errors.effective_from_date = 'Tanggal efektif wajib diisi';
        if (!form.proposed_start_time || !form.proposed_end_time) {
            errors.session = 'Sesi wajib diisi';
        }
        if (form.reason.length < 20) errors.reason = 'Alasan minimal 20 karakter';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!validateForm()) return;
        setSubmitting(true);
        try {
            router.post(route('mahasiswa.requests.submit'), form, {
                onFinish: () => { 
                    setSubmitting(false); 
                    setShowForm(false); 
                    setStartSession('');
                    setEndSession('');
                    setForm({ schedule_id: '', request_type: 'TEMPORARY', target_date: '', effective_from_date: '', proposed_day: '', proposed_start_time: '', proposed_end_time: '', proposed_room_id: '', reason: '' }); 
                },
                onError: (errors) => { setFormErrors(errors); setSubmitting(false); },
            });
        } catch { setSubmitting(false); }
    }

    return (
        <>
            <section className="mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText size={22} className="text-text-primary" />
                        <h1 className="text-xl font-bold text-text-primary">Requests</h1>
                    </div>
                    <button onClick={() => setShowForm(!showForm)} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${showForm ? 'bg-danger text-white' : 'bg-primary-500 hover:bg-primary-600 text-white'}`}>
                        {showForm ? <XCircle size={16} /> : <Plus size={16} />}
                        {showForm ? 'Tutup Form' : 'Ajukan Request Baru'}
                    </button>
                </div>
            </section>

            {showForm && (
                <section className="mb-6 bg-card border border-border rounded-xl p-6">
                    <h3 className="text-base font-bold text-text-primary mb-5">Form Pengajuan Request</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5 block">Jadwal *</label>
                                <select value={form.schedule_id} onChange={e => handleChange('schedule_id', e.target.value)} className={`w-full px-3 py-2.5 bg-surface border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all ${formErrors.schedule_id ? 'border-danger' : 'border-border'}`}>
                                    <option value="">Pilih jadwal...</option>
                                    {schedules.map(s => <option key={s.id} value={s.id}>{getScheduleOptionLabel(s)}</option>)}
                                </select>
                                {formErrors.schedule_id && <p className="text-[10px] text-danger mt-1">{formErrors.schedule_id}</p>}
                                
                                {(() => {
                                    const selectedSchedule = schedules.find(s => String(s.id) === String(form.schedule_id));
                                    if (!selectedSchedule) return null;
                                    return (
                                        <div className="mt-3 p-4 bg-surface border border-border/80 rounded-xl flex flex-col gap-1 text-xs text-text-secondary shadow-sm">
                                            <p className="font-bold text-text-primary mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-primary-500">
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                                                Detail Jadwal Asal
                                            </p>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                <div>
                                                    <span className="text-text-muted block text-[9px] font-bold uppercase tracking-wider mb-0.5">MATA KULIAH</span>
                                                    <span className="font-semibold text-text-primary truncate block" title={selectedSchedule.course?.name}>{selectedSchedule.course?.name || '-'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-text-muted block text-[9px] font-bold uppercase tracking-wider mb-0.5">KELAS & KODE</span>
                                                    <span className="font-semibold text-text-primary block">{selectedSchedule.course?.class_name ? `Kelas ${selectedSchedule.course.class_name}` : '-'} ({selectedSchedule.course?.code || '-'})</span>
                                                </div>
                                                <div>
                                                    <span className="text-text-muted block text-[9px] font-bold uppercase tracking-wider mb-0.5">HARI & SESI</span>
                                                    <span className="font-semibold text-text-primary block">
                                                        {selectedSchedule.day_of_week}, Sesi {selectedSchedule.session_start}
                                                        {selectedSchedule.session_duration > 1 ? ` - ${selectedSchedule.session_start + selectedSchedule.session_duration - 1}` : ''}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-text-muted block text-[9px] font-bold uppercase tracking-wider mb-0.5">RUANGAN</span>
                                                    <span className="font-semibold text-text-primary block">{selectedSchedule.room?.name || selectedSchedule.room?.code || '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                            
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5 block">Tipe Request *</label>
                                <div className="flex gap-2">
                                    {['TEMPORARY', 'PERMANENT'].map(type => (
                                        <button key={type} type="button" onClick={() => handleChange('request_type', type)} className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg border transition-all ${form.request_type === type ? 'bg-primary-500 text-white border-primary-500' : 'bg-surface text-text-secondary border-border hover:border-primary-500'}`}>
                                            {type === 'TEMPORARY' ? '1x Sementara' : 'Permanen'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {form.request_type === 'TEMPORARY' ? (
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5 block">Tanggal Target *</label>
                                    <input type="date" value={form.target_date} onChange={e => handleChange('target_date', e.target.value)} className={`w-full px-3 py-2.5 bg-surface border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all ${formErrors.target_date ? 'border-danger' : 'border-border'}`} />
                                    {formErrors.target_date && <p className="text-[10px] text-danger mt-1">{formErrors.target_date}</p>}
                                </div>
                            ) : (
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5 block">Efektif Dari *</label>
                                    <input type="date" value={form.effective_from_date} onChange={e => handleChange('effective_from_date', e.target.value)} className={`w-full px-3 py-2.5 bg-surface border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all ${formErrors.effective_from_date ? 'border-danger' : 'border-border'}`} />
                                    {formErrors.effective_from_date && <p className="text-[10px] text-danger mt-1">{formErrors.effective_from_date}</p>}
                                </div>
                            )}
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5 block">Hari Usulan</label>
                                <select value={form.proposed_day} onChange={e => handleDayChange(e.target.value)} className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all">
                                    <option value="">Pilih hari...</option>
                                    {['SENIN','SELASA','RABU','KAMIS','JUMAT','SABTU'].map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5 block">Ruangan Usulan</label>
                                <select value={form.proposed_room_id} onChange={e => handleChange('proposed_room_id', e.target.value)} className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all">
                                    <option value="">Pilih ruangan...</option>
                                    {rooms.map(r => <option key={r.id} value={r.id}>{r.code} — {r.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5 block">Sesi Mulai *</label>
                                <select
                                    value={startSession}
                                    onChange={e => handleSessionChange('start', e.target.value)}
                                    className={`w-full px-3 py-2.5 bg-surface border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all ${formErrors.session ? 'border-danger' : 'border-border'}`}
                                >
                                    <option value="">Pilih sesi mulai...</option>
                                    {Array.from({ length: 11 }, (_, i) => i + 1).map(s => {
                                        const isFriday = form.proposed_day === 'JUMAT';
                                        const t = isFriday ? SESSION_TIMES_JUMAT[s] : SESSION_TIMES_NORMAL[s];
                                        return (
                                            <option key={s} value={s}>
                                                Sesi {s} ({t.start} - {t.end})
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5 block">Sesi Selesai *</label>
                                <select
                                    value={endSession}
                                    onChange={e => handleSessionChange('end', e.target.value)}
                                    className={`w-full px-3 py-2.5 bg-surface border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all ${formErrors.session ? 'border-danger' : 'border-border'}`}
                                >
                                    <option value="">Pilih sesi selesai...</option>
                                    {Array.from({ length: 11 }, (_, i) => i + 1).map(s => {
                                        const isFriday = form.proposed_day === 'JUMAT';
                                        const t = isFriday ? SESSION_TIMES_JUMAT[s] : SESSION_TIMES_NORMAL[s];
                                        return (
                                            <option key={s} value={s} disabled={startSession && s < parseInt(startSession)}>
                                                Sesi {s} ({t.start} - {t.end})
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                        </div>
                        {formErrors.session && <p className="text-[10px] text-danger mt-1">{formErrors.session}</p>}
                        {(form.proposed_start_time || form.proposed_end_time) && (
                            <p className="text-[11px] text-text-secondary mt-1">
                                Waktu Terhitung: <strong className="text-primary-500 font-semibold">{form.proposed_start_time || '--:--'}</strong> s/d <strong className="text-primary-500 font-semibold">{form.proposed_end_time || '--:--'}</strong>
                            </p>
                        )}
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5 block">Alasan * (min 20 karakter)</label>
                            <textarea value={form.reason} onChange={e => handleChange('reason', e.target.value)} rows={3} placeholder="Jelaskan alasan perubahan jadwal..." className={`w-full px-3 py-2.5 bg-surface border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all resize-none ${formErrors.reason ? 'border-danger' : 'border-border'}`} />
                            <div className="flex justify-between mt-1">
                                {formErrors.reason && <p className="text-[10px] text-danger">{formErrors.reason}</p>}
                                <p className={`text-[10px] ml-auto ${form.reason.length >= 20 ? 'text-success' : 'text-text-muted'}`}>{form.reason.length}/20</p>
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end pt-2">
                            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">Batal</button>
                            <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50">
                                {submitting ? 'Mengirim...' : 'Kirim Request'}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {/* Request List */}
            <section>
                <h2 className="text-sm font-bold text-text-primary mb-3">Riwayat Request ({requests.length})</h2>
                <div className="space-y-3">
                    {requests.map(req => {
                        const st = STATUS_STYLES[req.status] || STATUS_STYLES.PENDING_ASLAB;
                        const StIcon = st.icon;
                        const expanded = expandedId === req.id;
                        return (
                            <div key={req.id} className="bg-card border border-border rounded-xl overflow-hidden transition-all hover:shadow-sm">
                                <button onClick={() => setExpandedId(expanded ? null : req.id)} className="w-full px-5 py-4 flex items-center gap-4 text-left">
                                    <div className={`w-10 h-10 rounded-xl ${st.bg} flex items-center justify-center shrink-0`}>
                                        <StIcon size={18} className={st.text} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-xs font-bold text-text-primary">{req.request_code}</span>
                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${req.request_type === 'TEMPORARY' ? 'bg-cyan-100 text-cyan-700' : 'bg-warning/10 text-warning'}`}>{req.request_type}</span>
                                        </div>
                                        <p className="text-sm text-text-secondary truncate">
                                            {req.schedule?.course?.name || 'N/A'}{' '}
                                            {req.schedule && (
                                                <span className="text-[11px] text-text-muted font-medium">
                                                    ({req.schedule.day_of_week}, Sesi {req.schedule.session_start}
                                                    {req.schedule.session_duration > 1 ? ` - ${req.schedule.session_start + req.schedule.session_duration - 1}` : ''})
                                                </span>
                                            )}{' '}
                                            — {req.schedule?.room?.code || ''}
                                        </p>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${st.bg} ${st.text}`}>{st.label}</span>
                                    {expanded ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
                                </button>
                                {expanded && (
                                    <div className="px-5 pb-5 border-t border-border pt-4 space-y-4">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                            <div><span className="text-text-muted block mb-0.5">Tanggal Target</span><span className="font-semibold text-text-primary">{req.target_date || req.effective_from_date || '-'}</span></div>
                                            <div><span className="text-text-muted block mb-0.5">Hari Usulan</span><span className="font-semibold text-text-primary">{req.proposed_day || '-'}</span></div>
                                            <div>
                                                <span className="text-text-muted block mb-0.5">Sesi Usulan</span>
                                                <span className="font-semibold text-text-primary">
                                                    {formatTimesToSessions(req.proposed_day, req.proposed_start_time, req.proposed_end_time)}
                                                </span>
                                            </div>
                                            <div><span className="text-text-muted block mb-0.5">Ruangan Usulan</span><span className="font-semibold text-text-primary">{req.proposed_room?.code || '-'}</span></div>
                                        </div>
                                        <div><span className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-1">Alasan</span><p className="text-sm text-text-secondary">{req.reason}</p></div>
                                        {req.has_conflict && (
                                            <div className="bg-danger/5 border border-danger/20 rounded-lg px-3 py-2 flex items-center gap-2">
                                                <AlertTriangle size={14} className="text-danger shrink-0" />
                                                <p className="text-xs text-danger font-medium">Terdeteksi konflik jadwal pada slot yang diusulkan</p>
                                            </div>
                                        )}
                                        {req.approvals?.length > 0 && (
                                            <div>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-2">Pipeline Validasi</span>
                                                <div className="space-y-2">
                                                    {req.approvals.map((a, i) => (
                                                        <div key={i} className="flex items-start gap-3 text-xs">
                                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${a.decision.includes('REJECTED') ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
                                                                {a.decision.includes('REJECTED') ? <XCircle size={12} /> : <CheckCircle size={12} />}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-text-primary">{a.stage} — {a.decision}</p>
                                                                <p className="text-text-muted">{a.actor?.name} • {a.notes}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>
        </>
    );
}

Requests.layout = (page) => <MahasiswaLayout>{page}</MahasiswaLayout>;
