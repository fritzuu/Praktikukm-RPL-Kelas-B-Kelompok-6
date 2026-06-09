<?php

namespace App\Services\Dashboard;

use Illuminate\Support\Facades\DB;

class ConflictDetectionService
{
    /**
     * Detect schedule conflicts across all active schedules in the active semester.
     * Returns an array shaped for ConflictAlerts component.
     *
     * @param  int|null  $semesterId  — scope to this semester; null = all active
     * @param  array     $scheduleIds — if provided, only check conflicts that involve
     *                                  at least one of these schedule IDs (e.g. for a
     *                                  specific dosen's schedule)
     * @param  bool      $withActions — include resolve action buttons (admin only)
     */
    public function detect(
        ?int $semesterId = null,
        array $scheduleIds = [],
        bool $withActions = false
    ): array {
        $query = DB::table('schedules')
            ->join('courses', 'schedules.course_id', '=', 'courses.id')
            ->join('rooms', 'schedules.room_id', '=', 'rooms.id')
            ->leftJoin('teaching_assignments', function ($join) {
                $join->on('schedules.id', '=', 'teaching_assignments.schedule_id')
                     ->where('teaching_assignments.role_in_class', '=', 'PENGAJAR');
            })
            ->leftJoin('users', 'teaching_assignments.user_id', '=', 'users.id')
            ->select(
                'schedules.id',
                'courses.code as kode',
                'courses.name as nama',
                'courses.class_name as kelas',
                'rooms.name as ruangan',
                'schedules.day_of_week as hari',
                'schedules.session_start as sesiMulai',
                'schedules.session_duration as durasi',
                'users.id as dosen_id',
                'users.name as dosen_nama'
            )
            ->where('schedules.is_active', true);

        if ($semesterId) {
            $query->where('schedules.semester_id', $semesterId);
        }

        $schedulesList = $query->get();

        // Pre-compute team-teaching schedule IDs
        $teamTeachingIds = DB::table('teaching_assignments')
            ->where('role_in_class', 'PENGAJAR')
            ->groupBy('schedule_id')
            ->havingRaw('COUNT(DISTINCT user_id) > 1')
            ->pluck('schedule_id')
            ->toArray();

        $konflik = [];
        $checked = [];

        foreach ($schedulesList as $s1) {
            foreach ($schedulesList as $s2) {
                if ($s1->id === $s2->id) continue;

                $pairKey = min($s1->id, $s2->id) . '-' . max($s1->id, $s2->id);
                if (in_array($pairKey, $checked)) continue;

                // If $scheduleIds filter given, at least one must be involved
                if (!empty($scheduleIds)) {
                    if (!in_array($s1->id, $scheduleIds) && !in_array($s2->id, $scheduleIds)) {
                        continue;
                    }
                }

                // Must be same day
                if (strtolower($s1->hari) !== strtolower($s2->hari)) continue;

                // Must overlap in session time
                $overlap = ($s1->sesiMulai >= $s2->sesiMulai && $s1->sesiMulai < $s2->sesiMulai + $s2->durasi) ||
                           ($s2->sesiMulai >= $s1->sesiMulai && $s2->sesiMulai < $s1->sesiMulai + $s1->durasi);

                if (!$overlap) continue;

                // ── Room conflict ──────────────────────────────────────────
                if ($s1->ruangan === $s2->ruangan) {
                    $checked[] = $pairKey;
                    $entry = [
                        'id'        => 'room-' . $pairKey,
                        'judul'     => 'Bentrok Ruangan: ' . $s1->ruangan,
                        'deskripsi' => "MK {$s1->kode} ({$s1->nama} - {$s1->kelas}) bertabrakan dengan "
                                     . "{$s2->kode} ({$s2->nama} - {$s2->kelas}) di {$s1->ruangan} "
                                     . 'pada ' . ucfirst(strtolower($s1->hari))
                                     . " (Sesi {$s1->sesiMulai}–" . ($s1->sesiMulai + $s1->durasi - 1)
                                     . " vs Sesi {$s2->sesiMulai}–" . ($s2->sesiMulai + $s2->durasi - 1) . ').',
                        'tipe'      => 'bentrok_ruangan',
                        'aksi'      => $withActions ? [
                            ['label' => "Hapus {$s1->kode} ({$s1->kelas})", 'variant' => 'primary',   'schedule_id' => $s1->id],
                            ['label' => "Hapus {$s2->kode} ({$s2->kelas})", 'variant' => 'secondary', 'schedule_id' => $s2->id],
                        ] : [],
                    ];
                    $konflik[] = $entry;
                    continue;
                }

                // ── Lecturer conflict ──────────────────────────────────────
                if (!$s1->dosen_id || !$s2->dosen_id) continue;
                if ($s1->dosen_id !== $s2->dosen_id) continue;

                // Skip team-teaching pairs
                if (in_array($s1->id, $teamTeachingIds) || in_array($s2->id, $teamTeachingIds)) continue;

                // Practicum exemption
                $isP1 = $this->isPracticum($s1->nama, $s1->kelas);
                $isP2 = $this->isPracticum($s2->nama, $s2->kelas);
                if ($isP1 && $isP2) continue;
                if (($isP1 || $isP2) && $s1->ruangan !== $s2->ruangan) continue;

                $checked[] = $pairKey;
                $konflik[] = [
                    'id'        => 'dosen-' . $pairKey,
                    'judul'     => 'Bentrok Jadwal Dosen: ' . $s1->dosen_nama,
                    'deskripsi' => "Dosen {$s1->dosen_nama} mengajar dua kelas sekaligus "
                                 . 'pada ' . ucfirst(strtolower($s1->hari)) . ": "
                                 . "{$s1->kode} ({$s1->nama} - {$s1->kelas}) di {$s1->ruangan} "
                                 . "dan {$s2->kode} ({$s2->nama} - {$s2->kelas}) di {$s2->ruangan} "
                                 . "(Sesi {$s1->sesiMulai}–" . ($s1->sesiMulai + $s1->durasi - 1)
                                 . " vs Sesi {$s2->sesiMulai}–" . ($s2->sesiMulai + $s2->durasi - 1) . ').',
                    'tipe'      => 'bentrok_jadwal',
                    'aksi'      => $withActions ? [
                        ['label' => "Hapus {$s1->kode} ({$s1->kelas})", 'variant' => 'primary',   'schedule_id' => $s1->id],
                        ['label' => "Hapus {$s2->kode} ({$s2->kelas})", 'variant' => 'secondary', 'schedule_id' => $s2->id],
                    ] : [],
                ];
            }
        }

        return $konflik;
    }

    private function isPracticum(string $name, string $kelas): bool
    {
        $lower = strtolower($name);
        return str_contains($lower, 'praktikum') || str_contains($lower, 'lab') || str_contains(strtolower($kelas), 'p');
    }
}
