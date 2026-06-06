import React, { useState, useEffect, useMemo } from "react";
import { usePage, useForm, router } from "@inertiajs/react";
import AdminLayout from "../../Layouts/AdminLayout";
import Modal from "../../Components/Modal";
import ScheduleGrid from "../../Components/Shared/ScheduleGrid";
import {
    Upload,
    FileText,
    Calendar,
    CheckCircle,
    AlertCircle,
    AlertTriangle,
    Trash2,
    HelpCircle,
    Info,
    ShieldCheck,
} from "lucide-react";

export default function AdminJadwal({ jadwal = [], rooms = [], flash = {} }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const [activeTab, setActiveTab] = useState("view"); // 'view' or 'upload'
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [scheduleToDelete, setScheduleToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [showUploadConfirm, setShowUploadConfirm] = useState(false);
    const [conflictsCount, setConflictsCount] = useState(0);
    const [showResolveConfirm, setShowResolveConfirm] = useState(false);
    const [resolveLoading, setResolveLoading] = useState(false);

    // Detect any existing conflicts in current jadwal data
    const hasConflicts = useMemo(() => {
        return jadwal.some((item) =>
            jadwal.some(
                (other) =>
                    other.id !== item.id &&
                    other.hari === item.hari &&
                    other.ruangan === item.ruangan &&
                    ((item.sesiMulai >= other.sesiMulai &&
                        item.sesiMulai < other.sesiMulai + other.durasi) ||
                        (other.sesiMulai >= item.sesiMulai &&
                            other.sesiMulai < item.sesiMulai + item.durasi)),
            ),
        );
    }, [jadwal]);

    const handleResolveConflicts = () => {
        setResolveLoading(true);
        router.post(
            route("admin.jadwal.resolve-conflicts"),
            {},
            {
                onFinish: () => {
                    setResolveLoading(false);
                    setShowResolveConfirm(false);
                },
            },
        );
    };

    const [successMessage, setSuccessMessage] = useState(flash?.success || "");
    const [errorMessage, setErrorMessage] = useState(flash?.error || "");

    useEffect(() => {
        if (flash?.success) {
            setSuccessMessage(flash.success);
            const timer = setTimeout(() => setSuccessMessage(""), 5000);
            return () => clearTimeout(timer);
        } else {
            setSuccessMessage("");
        }
    }, [flash, flash?.success]);

    useEffect(() => {
        if (flash?.error) {
            setErrorMessage(flash.error);
            const timer = setTimeout(() => setErrorMessage(""), 5000);
            return () => clearTimeout(timer);
        } else {
            setErrorMessage("");
        }
    }, [flash, flash?.error]);

    useEffect(() => {
        const handlePageShow = (event) => {
            if (event.persisted) {
                router.reload();
            }
        };

        window.addEventListener("pageshow", handlePageShow);

        try {
            const perfEntries = performance.getEntriesByType("navigation");
            if (
                perfEntries.length > 0 &&
                perfEntries[0].type === "back_forward"
            ) {
                router.reload();
            }
        } catch (e) {
            console.error("Navigation timing API error:", e);
        }

        return () => {
            window.removeEventListener("pageshow", handlePageShow);
        };
    }, []);

    // Form helper using Inertia
    const { data, setData, post, processing, errors, reset, wasSuccessful } =
        useForm({
            raw_text: "",
            overwrite: false,
        });

    const [fileText, setFileText] = useState("");
    const [dragOver, setDragOver] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState("");

    const handleCardClick = (item) => {
        setSelectedSchedule(item);
    };

    const confirmDelete = () => {
        if (!scheduleToDelete) return;
        setDeleteLoading(true);
        router.delete(route("admin.jadwal.destroy", scheduleToDelete.id), {
            onSuccess: () => {
                setDeleteLoading(false);
                setScheduleToDelete(null);
                setSelectedSchedule(null);
            },
            onError: () => {
                setDeleteLoading(false);
            },
        });
    };

    // Handle File upload and text parsing
    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    };

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        if (file) handleFileSelect(file);
    };

    const handleFileSelect = (file) => {
        const extension = "." + file.name.split(".").pop().toLowerCase();
        if ([".txt", ".csv"].includes(extension)) {
            setUploadedFileName(file.name);
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target.result;
                setData("raw_text", text);
            };
            reader.readAsText(file);
        } else {
            alert(
                "Silakan upload file teks (.txt) atau (.csv) yang berisi format teks jadwal.",
            );
        }
    };

    const checkConflicts = (text, overwrite) => {
        if (!text) return 0;
        const lines = text.split("\n");
        let currentDay = "";
        const parsedItems = [];

        lines.forEach((line) => {
            const trimmed = line.trim();
            if (!trimmed) return;

            const lower = trimmed.toLowerCase();
            if (lower.includes("senin")) currentDay = "senin";
            else if (lower.includes("selasa")) currentDay = "selasa";
            else if (lower.includes("rabu")) currentDay = "rabu";
            else if (lower.includes("kamis")) currentDay = "kamis";
            else if (lower.includes("jumat")) currentDay = "jumat";

            if (!currentDay) return;

            if (trimmed.startsWith("Sesi")) {
                // Extract session
                const sessionMatch = trimmed.match(
                    /Sesi\s+([0-9]+)(?:-([0-9]+))?:/,
                );
                if (!sessionMatch) return;

                const startSession = parseInt(sessionMatch[1]);
                const endSession = sessionMatch[2]
                    ? parseInt(sessionMatch[2])
                    : startSession;

                // Extract room
                const roomMatch = trimmed.match(/\(Ruang:\s*(.*?)\)$/);
                const roomName = roomMatch ? roomMatch[1].trim() : "";

                if (roomName) {
                    parsedItems.push({
                        day: currentDay,
                        room: roomName,
                        start: startSession,
                        end: endSession,
                    });
                }
            }
        });

        let conflictCount = 0;

        // 1. Check conflicts within the uploaded text
        const localConflicts = new Set();
        for (let i = 0; i < parsedItems.length; i++) {
            for (let j = i + 1; j < parsedItems.length; j++) {
                const a = parsedItems[i];
                const b = parsedItems[j];
                if (a.day === b.day && a.room === b.room) {
                    if (
                        (a.start >= b.start && a.start <= b.end) ||
                        (b.start >= a.start && b.start <= a.end)
                    ) {
                        localConflicts.add(i);
                        localConflicts.add(j);
                    }
                }
            }
        }
        conflictCount += localConflicts.size;

        // 2. Check conflicts against existing schedules (only if NOT overwriting)
        if (!overwrite && jadwal && jadwal.length > 0) {
            parsedItems.forEach((newItem, idx) => {
                if (localConflicts.has(idx)) return;

                const hasDbConflict = jadwal.some((dbItem) => {
                    const dbDay = dbItem.hari?.toLowerCase();
                    const dbRoom = dbItem.ruangan;
                    const dbStart = dbItem.sesiMulai;
                    const dbEnd = dbItem.sesiMulai + dbItem.durasi - 1;

                    if (dbDay === newItem.day && dbRoom === newItem.room) {
                        return (
                            (newItem.start >= dbStart &&
                                newItem.start <= dbEnd) ||
                            (dbStart >= newItem.start && dbStart <= newItem.end)
                        );
                    }
                    return false;
                });

                if (hasDbConflict) {
                    conflictCount++;
                }
            });
        }

        return conflictCount;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!data.raw_text.trim()) return;
        const count = checkConflicts(data.raw_text, data.overwrite);
        setConflictsCount(count);
        setShowUploadConfirm(true);
    };

    const confirmUpload = () => {
        setShowUploadConfirm(false);
        post(route("admin.jadwal.import"), {
            onSuccess: () => {
                reset();
                setUploadedFileName("");
                setActiveTab("view");
            },
        });
    };

    // Auto-detect seeder format if user wants to see an example
    const insertExample = () => {
        const example = `📅 Senin\nSesi 1-3: Matematika Diskrit I (semester 2) (kelas C) (Ruang: B4-10)\nSesi 1-2: Pemrograman Web (semester 4) (kelas B) (Ruang: B4-11)\n\n📅 Selasa\nSesi 1-3: Aljabar Linier (semester 2) (kelas C) (Ruang: B4-10)`;
        setData("raw_text", example);
    };

    return (
        <>
            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
                        Jadwal & Upload Akademik
                    </h1>
                    <p className="text-text-secondary mt-1 text-sm">
                        Lihat ketersediaan ruangan, filter matkul, atau import
                        jadwal semester baru.
                    </p>
                </div>

                {/* Tab Switchers */}
                <div className="flex bg-surface p-1 rounded-xl border border-border self-start md:self-auto shadow-sm">
                    <button
                        onClick={() => setActiveTab("view")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
                            activeTab === "view"
                                ? "bg-primary-500 text-white shadow-md"
                                : "text-text-secondary hover:text-text-primary hover:bg-surface/50"
                        }`}
                    >
                        <Calendar size={14} />
                        Lihat Jadwal
                    </button>
                    <button
                        onClick={() => setActiveTab("upload")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
                            activeTab === "upload"
                                ? "bg-primary-500 text-white shadow-md"
                                : "text-text-secondary hover:text-text-primary hover:bg-surface/50"
                        }`}
                    >
                        <Upload size={14} />
                        Upload & Import
                    </button>
                </div>
            </div>

            {/* Flash Messages */}
            {successMessage && (
                <div className="mb-6 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 px-4 py-3 rounded-xl shadow-sm animate-fade-in">
                    <CheckCircle size={18} className="shrink-0" />
                    <p className="text-xs font-semibold">{successMessage}</p>
                </div>
            )}
            {errorMessage && (
                <div className="mb-6 flex items-center gap-3 bg-rose-500/10 border border-rose-500/30 text-rose-700 px-4 py-3 rounded-xl shadow-sm animate-fade-in">
                    <AlertCircle size={18} className="shrink-0" />
                    <p className="text-xs font-semibold">{errorMessage}</p>
                </div>
            )}

            {/* Conflict alert banner */}
            {activeTab === "view" && hasConflicts && (
                <div className="mb-4 flex items-center justify-between gap-4 bg-danger/5 border border-danger/20 text-danger px-4 py-3 rounded-xl">
                    <div className="flex items-center gap-2">
                        <AlertTriangle size={16} className="shrink-0" />
                        <p className="text-xs font-semibold">
                            Terdapat konflik jadwal (ruangan & sesi bertumpuk).
                            Periksa kartu merah pada grid.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowResolveConfirm(true)}
                        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-danger text-white text-[11px] font-bold rounded-lg hover:bg-danger/90 transition-colors"
                    >
                        <ShieldCheck size={13} />
                        Selesaikan Konflik
                    </button>
                </div>
            )}

            {/* View Tab */}
            {activeTab === "view" ? (
                <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden p-6">
                    <ScheduleGrid
                        jadwalItems={jadwal}
                        rooms={rooms}
                        showConflicts={true}
                        onExport={(jadwalItems) =>
                            console.log("Exporting jadwal...", jadwalItems)
                        }
                        onCardClick={handleCardClick}
                    />
                </div>
            ) : (
                /* Upload Tab */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                    {/* Left & Center: Upload Fields */}
                    <div className="lg:col-span-2 space-y-6">
                        <form
                            onSubmit={handleSubmit}
                            className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5"
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-border">
                                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                                    <Upload
                                        size={16}
                                        className="text-primary-500"
                                    />
                                    Form Input Jadwal
                                </h3>
                                <button
                                    type="button"
                                    onClick={insertExample}
                                    className="text-[11px] font-semibold text-primary-500 hover:text-primary-600 transition-colors"
                                >
                                    Masukkan Contoh Format
                                </button>
                            </div>

                            {/* Two upload options */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Option A: File Drag Drop */}
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() =>
                                        document
                                            .getElementById("raw-file-input")
                                            .click()
                                    }
                                    className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl px-4 py-8 cursor-pointer transition-all duration-200 ${
                                        dragOver
                                            ? "border-primary-500 bg-primary-500/5"
                                            : "border-border hover:border-primary-500/40 hover:bg-surface/50"
                                    }`}
                                >
                                    <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-500">
                                        <FileText size={20} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs font-semibold text-text-primary">
                                            {uploadedFileName
                                                ? uploadedFileName
                                                : "Upload File Teks (.txt / .csv)"}
                                        </p>
                                        <p className="text-[10px] text-text-muted mt-1">
                                            Seret file ke sini atau klik untuk
                                            memilih
                                        </p>
                                    </div>
                                    <input
                                        id="raw-file-input"
                                        type="file"
                                        accept=".txt,.csv"
                                        onChange={handleFileInput}
                                        className="hidden"
                                    />
                                </div>

                                {/* Option B: Explanatory text */}
                                <div className="bg-surface/30 border border-border/50 rounded-xl p-4 flex flex-col justify-center gap-1.5">
                                    <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                                        <Info
                                            size={14}
                                            className="text-primary-500"
                                        />
                                        Informasi Format
                                    </h4>
                                    <p className="text-[10px] leading-relaxed text-text-muted">
                                        Format input menggunakan teks
                                        berstruktur sesi per hari. Sistem akan
                                        mem-parsing otomatis ruangan, kelas,
                                        semester, dan mendeteksi bentrok jam
                                        kuliah.
                                    </p>
                                </div>
                            </div>

                            {/* Raw Text Box */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary block">
                                    Teks Jadwal Kuliah (Raw Text)
                                </label>
                                <textarea
                                    value={data.raw_text}
                                    onChange={(e) =>
                                        setData("raw_text", e.target.value)
                                    }
                                    rows={10}
                                    placeholder="Tempel teks jadwal di sini...&#10;Contoh:&#10;📅 Senin&#10;Sesi 1-3: Matematika Diskrit I (semester 2) (kelas C) (Ruang: B4-10)&#10;Sesi 1-2: Pemrograman Web (semester 4) (kelas B) (Ruang: B4-11)"
                                    className="w-full text-xs font-mono bg-surface border border-border focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl p-3 shadow-inner"
                                    required
                                />
                                {errors.raw_text && (
                                    <span className="text-[10px] text-rose-500 font-semibold">
                                        {errors.raw_text}
                                    </span>
                                )}
                            </div>

                            {/* Overwrite Checkbox */}
                            <div className="flex items-center gap-3 bg-rose-500/5 border border-rose-500/10 p-3 rounded-xl">
                                <input
                                    type="checkbox"
                                    id="overwrite-schedules"
                                    checked={data.overwrite}
                                    onChange={(e) =>
                                        setData("overwrite", e.target.checked)
                                    }
                                    className="w-4 h-4 rounded border-border text-rose-500 focus:ring-rose-500 cursor-pointer"
                                />
                                <label
                                    htmlFor="overwrite-schedules"
                                    className="text-xs font-semibold text-rose-700 cursor-pointer select-none"
                                >
                                    Hapus semua jadwal & kelas lama sebelum
                                    melakukan import baru
                                </label>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        reset();
                                        setUploadedFileName("");
                                    }}
                                    className="px-4 py-2 text-xs font-semibold rounded-lg border border-border text-text-secondary hover:bg-surface transition-colors"
                                >
                                    Bersihkan
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing || !data.raw_text}
                                    className="px-4 py-2 text-xs font-semibold rounded-lg text-white bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary-500/10 transition-all duration-200"
                                >
                                    {processing
                                        ? "Sedang Memproses..."
                                        : "Impor & Simpan Jadwal"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Side: Instructions */}
                    <div className="space-y-6">
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                                <HelpCircle
                                    size={16}
                                    className="text-primary-500"
                                />
                                Panduan Struktur
                            </h3>
                            <div className="text-xs space-y-3 leading-relaxed text-text-muted">
                                <p>
                                    Pastikan format teks jadwal Anda mengikuti
                                    aturan penulisan berikut agar berhasil
                                    terbaca:
                                </p>

                                <div className="space-y-2 pt-1">
                                    <div className="p-2.5 bg-surface rounded-lg border border-border font-mono text-[10px] space-y-1">
                                        <div className="text-primary-500 font-bold">
                                            📅 [Nama Hari]
                                        </div>
                                        <div>
                                            Sesi [mulai]-[akhir]: [Nama Matkul]
                                            (semester [N]) (kelas [A/B/C])
                                            (Ruang: [Nama Ruangan])
                                        </div>
                                    </div>
                                </div>

                                <ul className="list-disc pl-4 space-y-1.5 pt-1">
                                    <li>
                                        Hari diawali dengan icon 📅 atau cukup
                                        nama hari saja (Contoh:{" "}
                                        <code className="bg-surface px-1 py-0.5 rounded font-mono text-[10px]">
                                            📅 Senin
                                        </code>
                                        ).
                                    </li>
                                    <li>
                                        Format Sesi menggunakan angka jam kuliah
                                        (Contoh:{" "}
                                        <code className="bg-surface px-1 py-0.5 rounded font-mono text-[10px]">
                                            Sesi 1-3
                                        </code>{" "}
                                        atau{" "}
                                        <code className="bg-surface px-1 py-0.5 rounded font-mono text-[10px]">
                                            Sesi 1-2
                                        </code>
                                        ).
                                    </li>
                                    <li>
                                        Informasi semester ditulis dalam kurung
                                        (Contoh:{" "}
                                        <code className="bg-surface px-1 py-0.5 rounded font-mono text-[10px]">
                                            (semester 2)
                                        </code>
                                        ).
                                    </li>
                                    <li>
                                        Informasi kelas ditulis dalam kurung
                                        (Contoh:{" "}
                                        <code className="bg-surface px-1 py-0.5 rounded font-mono text-[10px]">
                                            (kelas B)
                                        </code>
                                        ).
                                    </li>
                                    <li>
                                        Ruangan ditulis di paling akhir baris
                                        dengan format{" "}
                                        <code className="bg-surface px-1 py-0.5 rounded font-mono text-[10px]">
                                            (Ruang: B4-10)
                                        </code>
                                        .
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            <Modal
                isOpen={!!selectedSchedule}
                onClose={() => setSelectedSchedule(null)}
                title="Detail Jadwal"
                maxWidth="md"
            >
                {selectedSchedule && (
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">
                                Mata Kuliah
                            </h4>
                            <p className="text-lg font-bold text-text-primary">
                                {selectedSchedule.nama} ({selectedSchedule.kode}
                                )
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">
                                    Kelas
                                </h4>
                                <p className="font-medium text-text-primary">
                                    {selectedSchedule.kelas || "-"}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">
                                    Semester
                                </h4>
                                <p className="font-medium text-text-primary">
                                    {selectedSchedule.semesterNum || "-"}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">
                                    Ruangan
                                </h4>
                                <p className="font-medium text-text-primary">
                                    {selectedSchedule.ruangan}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">
                                    Hari
                                </h4>
                                <p className="font-medium text-text-primary capitalize">
                                    {selectedSchedule.hari}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">
                                    Waktu
                                </h4>
                                <p className="font-medium text-text-primary">
                                    {selectedSchedule.jamMulai &&
                                    selectedSchedule.jamAkhir
                                        ? `${selectedSchedule.jamMulai.substring(0, 5)} - ${selectedSchedule.jamAkhir.substring(0, 5)}`
                                        : "Waktu belum diatur"}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">
                                    Sesi
                                </h4>
                                <p className="font-medium text-text-primary">
                                    {selectedSchedule.durasi > 1
                                        ? `Sesi ${selectedSchedule.sesiMulai} - ${selectedSchedule.sesiMulai + selectedSchedule.durasi - 1}`
                                        : `Sesi ${selectedSchedule.sesiMulai}`}
                                </p>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-border flex flex-col gap-4">
                            <div>
                                <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">
                                    Dosen Pengajar
                                </h4>
                                <div className="flex items-center gap-3 mt-2">
                                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-lg">
                                        {selectedSchedule.dosen
                                            ? selectedSchedule.dosen
                                                  .charAt(0)
                                                  .toUpperCase()
                                            : "?"}
                                    </div>
                                    <p className="font-semibold text-text-primary">
                                        {selectedSchedule.dosen}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mt-2">
                                <button
                                    onClick={() =>
                                        setScheduleToDelete(selectedSchedule)
                                    }
                                    className="flex-1 py-3 bg-danger/10 text-danger hover:bg-danger hover:text-white rounded-xl text-sm font-bold transition-colors flex justify-center items-center gap-2"
                                >
                                    <Trash2 size={16} /> Hapus Jadwal
                                </button>
                                <button
                                    onClick={() => setSelectedSchedule(null)}
                                    className="flex-1 py-3 bg-surface hover:bg-card border border-border text-text-secondary rounded-xl text-sm font-bold transition-colors"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Confirm Delete Modal */}
            <Modal
                isOpen={!!scheduleToDelete}
                onClose={() => !deleteLoading && setScheduleToDelete(null)}
                maxWidth="sm"
            >
                <div className="relative p-2 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle size={28} className="text-danger" />
                    </div>
                    <h3 className="text-lg font-bold text-text-primary mb-1">
                        Hapus Jadwal?
                    </h3>
                    <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                        Apakah Anda yakin ingin menghapus jadwal{" "}
                        <strong>
                            {scheduleToDelete?.nama} ({scheduleToDelete?.kode})
                        </strong>
                        ? Tindakan ini akan menghapus permanen data jadwal
                        tersebut.
                    </p>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setScheduleToDelete(null)}
                            disabled={deleteLoading}
                            className="flex-1 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-semibold text-text-primary hover:bg-card transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            onClick={confirmDelete}
                            disabled={deleteLoading}
                            className="flex-1 px-4 py-2.5 bg-danger hover:bg-danger/90 rounded-xl text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {deleteLoading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Trash2 size={16} />
                            )}
                            {deleteLoading ? "Menghapus..." : "Ya, Hapus"}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Confirm Upload Modal */}
            <Modal
                isOpen={showUploadConfirm}
                onClose={() => !processing && setShowUploadConfirm(false)}
                maxWidth="sm"
            >
                <div className="relative p-2 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center mx-auto mb-4">
                        <Upload size={28} className="text-primary-500" />
                    </div>
                    <h3 className="text-lg font-bold text-text-primary mb-1">
                        Konfirmasi Upload Jadwal
                    </h3>

                    <p className="text-sm text-text-secondary mb-4 leading-relaxed">
                        {data.overwrite
                            ? "Apakah Anda yakin ingin menghapus semua jadwal & kelas lama dan menambah jadwal baru?"
                            : "Apakah Anda yakin ingin mengupload jadwal baru?"}
                    </p>

                    {/* Conflict Analysis Section */}
                    <div
                        className={`p-3 text-left rounded-xl border mb-6 text-xs ${
                            conflictsCount > 0
                                ? "bg-danger/10 border-danger/20 text-danger"
                                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-700"
                        }`}
                    >
                        <div className="flex items-center gap-2 font-bold mb-1">
                            {conflictsCount > 0 ? (
                                <>
                                    <AlertTriangle size={15} />
                                    <span>Peringatan Konflik Jadwal</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={15} />
                                    <span>Analisis Jadwal Aman</span>
                                </>
                            )}
                        </div>
                        <p className="opacity-90">
                            {conflictsCount > 0
                                ? `Ditemukan ${conflictsCount} potensi konflik jadwal (ruangan & sesi yang sama bertumpuk) pada data yang akan di-import.`
                                : "Tidak ditemukan potensi konflik jadwal baru. Semua ruangan & sesi aman."}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowUploadConfirm(false)}
                            disabled={processing}
                            className="flex-1 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-semibold text-text-primary hover:bg-card transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            onClick={confirmUpload}
                            disabled={processing}
                            className="flex-1 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 rounded-xl text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {processing ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Upload size={16} />
                            )}
                            {processing ? "Mengunggah..." : "Ya, Upload"}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Confirm Resolve Conflicts Modal */}
            <Modal
                isOpen={showResolveConfirm}
                onClose={() => !resolveLoading && setShowResolveConfirm(false)}
                maxWidth="sm"
            >
                <div className="relative p-2 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-warning/10 flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck size={28} className="text-warning" />
                    </div>
                    <h3 className="text-lg font-bold text-text-primary mb-1">
                        Selesaikan Semua Konflik?
                    </h3>
                    <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                        Sistem akan menghapus jadwal yang bertumpukan (ruangan &
                        sesi sama di hari yang sama). Jadwal pertama yang
                        terdeteksi akan dipertahankan.
                    </p>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowResolveConfirm(false)}
                            disabled={resolveLoading}
                            className="flex-1 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-semibold text-text-primary hover:bg-card transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleResolveConflicts}
                            disabled={resolveLoading}
                            className="flex-1 px-4 py-2.5 bg-warning hover:bg-warning/90 rounded-xl text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {resolveLoading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <ShieldCheck size={16} />
                            )}
                            {resolveLoading ? "Memproses..." : "Ya, Selesaikan"}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}

AdminJadwal.layout = (page) => <AdminLayout>{page}</AdminLayout>;
