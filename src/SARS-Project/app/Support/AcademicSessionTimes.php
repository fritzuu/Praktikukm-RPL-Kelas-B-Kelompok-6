<?php

namespace App\Support;

/**
 * Canonical academic session slot times (matches AdminJadwalController / schedule seeder).
 */
class AcademicSessionTimes
{
    /** @var array<int, array{0: string, 1: string}> */
    public const NORMAL = [
        1 => ['07:30', '08:20'],
        2 => ['08:25', '09:15'],
        3 => ['09:20', '10:10'],
        4 => ['10:15', '11:05'],
        5 => ['11:10', '12:00'],
        6 => ['13:00', '13:50'],
        7 => ['13:55', '14:45'],
        8 => ['15:30', '16:20'],
        9 => ['16:25', '17:15'],
        10 => ['18:00', '18:50'],
        11 => ['18:55', '19:20'],
    ];

    /** @var array<int, array{0: string, 1: string}> */
    public const JUMAT = [
        1 => ['07:30', '08:20'],
        2 => ['08:25', '09:15'],
        3 => ['09:20', '10:10'],
        4 => ['10:15', '11:05'],
        5 => ['13:00', '13:50'],
        6 => ['13:55', '14:45'],
        7 => ['15:30', '16:20'],
        8 => ['16:25', '17:15'],
        9 => ['18:00', '18:50'],
        10 => ['18:55', '19:20'],
        11 => ['19:25', '20:15'],
    ];

    /**
     * @return array<int, array{0: string, 1: string}>
     */
    public static function sessionsForDay(string $dayOfWeek): array
    {
        return $dayOfWeek === 'JUMAT' ? self::JUMAT : self::NORMAL;
    }

    /**
     * Overall lecture operating window for a weekday (first session start → last session end).
     *
     * @return array{start: string, end: string}
     */
    public static function lectureWindowForDay(string $dayOfWeek): array
    {
        $sessions = self::sessionsForDay($dayOfWeek);
        $first = reset($sessions);
        $last = end($sessions);

        return [
            'start' => $first[0],
            'end' => $last[1],
        ];
    }

    public static function isWithinLectureHours(string $dayOfWeek, string $currentTime): bool
    {
        $window = self::lectureWindowForDay($dayOfWeek);
        $t = self::normalizeTime($currentTime);
        $start = self::normalizeTime($window['start']);
        $end = self::normalizeTime($window['end']);

        return $t >= $start && $t < $end;
    }

    /**
     * @return 'before_hours'|'after_hours'
     */
    public static function outsideHoursPhase(string $dayOfWeek, string $currentTime): string
    {
        $window = self::lectureWindowForDay($dayOfWeek);
        $t = self::normalizeTime($currentTime);
        $start = self::normalizeTime($window['start']);

        return $t < $start ? 'before_hours' : 'after_hours';
    }

    public static function normalizeTime(mixed $time): string
    {
        if ($time instanceof \DateTimeInterface) {
            return $time->format('H:i:s');
        }

        $str = (string) $time;

        return strlen($str) === 5 ? $str . ':00' : $str;
    }

    /**
     * Calculate session start and duration from day of week, start time, and end time.
     *
     * @return array{0: int, 1: int}
     */
    public static function calculateSessionRange(string $day, string $startTime, string $endTime): array
    {
        $dayUpper = strtoupper($day);
        $sessionTimes = self::sessionsForDay($dayUpper);

        // Format start/end times to H:i
        $start = substr($startTime, 0, 5);
        $end = substr($endTime, 0, 5);

        $startSession = null;
        $endSession = null;

        // Try exact match
        foreach ($sessionTimes as $idx => $range) {
            if ($range[0] === $start) {
                $startSession = $idx;
            }
            if ($range[1] === $end) {
                $endSession = $idx;
            }
        }

        // Fallback to closest match if not found exactly
        if ($startSession === null) {
            $minDiff = null;
            foreach ($sessionTimes as $idx => $range) {
                $diff = abs(strtotime($range[0]) - strtotime($start));
                if ($minDiff === null || $diff < $minDiff) {
                    $minDiff = $diff;
                    $startSession = $idx;
                }
            }
        }

        if ($endSession === null) {
            $minDiff = null;
            foreach ($sessionTimes as $idx => $range) {
                $diff = abs(strtotime($range[1]) - strtotime($end));
                if ($minDiff === null || $diff < $minDiff) {
                    $minDiff = $diff;
                    $endSession = $idx;
                }
            }
        }

        $sessionDuration = max(1, $endSession - $startSession + 1);

        return [$startSession, $sessionDuration];
    }

    /**
     * Apply active overrides for the current week to a collection of schedules.
     * Supports both objects and arrays.
     *
     * @param \Illuminate\Support\Collection|array $schedules
     * @return \Illuminate\Support\Collection
     */
    public static function applyWeeklyOverrides($schedules)
    {
        $collection = collect($schedules);
        if ($collection->isEmpty()) {
            return $collection;
        }

        $now = \Carbon\Carbon::now('Asia/Jakarta');
        $startOfWeek = $now->copy()->startOfWeek(); // Monday
        $endOfWeek = $now->copy()->endOfWeek(); // Sunday

        $overrides = \Illuminate\Support\Facades\DB::table('schedule_overrides')
            ->join('rooms', 'schedule_overrides.room_id', '=', 'rooms.id')
            ->where('schedule_overrides.is_active', true)
            ->whereBetween('schedule_overrides.override_date', [
                $startOfWeek->toDateString(),
                $endOfWeek->toDateString()
            ])
            ->select(
                'schedule_overrides.schedule_id',
                'schedule_overrides.room_id',
                'rooms.code as room_code',
                'rooms.name as room_name',
                'schedule_overrides.new_day_of_week',
                'schedule_overrides.new_start_time',
                'schedule_overrides.new_end_time'
            )
            ->get()
            ->keyBy('schedule_id');

        if ($overrides->isEmpty()) {
            return $collection;
        }

        $allRooms = \Illuminate\Support\Facades\DB::table('rooms')->get();
        $roomsByCode = $allRooms->keyBy(fn($r) => strtolower(trim($r->code)));
        $roomsByName = $allRooms->keyBy(fn($r) => strtolower(trim($r->name)));

        return $collection->map(function ($s) use ($overrides, $roomsByCode, $roomsByName) {
            $isObj = is_object($s);
            $scheduleId = $isObj ? ($s->id ?? null) : ($s['id'] ?? null);

            if (!$scheduleId || !$overrides->has($scheduleId)) {
                return $s;
            }

            $ov = $overrides->get($scheduleId);
            $newDay = strtoupper($ov->new_day_of_week);
            $newStart = substr($ov->new_start_time, 0, 5);
            $newEnd = substr($ov->new_end_time, 0, 5);
            $roomCode = $ov->room_code;
            $roomName = $ov->room_name;
            $roomId = $ov->room_id;

            list($sessionStart, $sessionDuration) = self::calculateSessionRange($newDay, $newStart, $newEnd);

            $origRuangan = $isObj ? ($s->ruangan ?? '') : ($s['ruangan'] ?? '');
            $origRuanganClean = strtolower(trim($origRuangan));

            $useCode = false;
            if (isset($roomsByCode[$origRuanganClean])) {
                $useCode = true;
            } elseif (isset($roomsByName[$origRuanganClean])) {
                $useCode = false;
            } else {
                if ($origRuanganClean && $origRuangan === strtoupper($origRuangan)) {
                    $useCode = true;
                }
            }

            $selectedRoomValue = $useCode ? $roomCode : $roomName;

            if ($isObj) {
                // Check and set day
                if (property_exists($s, 'hari')) {
                    $s->hari = strtolower($newDay);
                } elseif (property_exists($s, 'day_of_week')) {
                    $s->day_of_week = $newDay;
                }

                // Check and set room
                if (property_exists($s, 'ruangan')) {
                    $s->ruangan = $selectedRoomValue;
                }
                if (property_exists($s, 'ruangan_id')) {
                    $s->ruangan_id = $roomId;
                }
                if (property_exists($s, 'room_id')) {
                    $s->room_id = $roomId;
                }

                // Check and set times
                if (property_exists($s, 'jamMulai')) {
                    $s->jamMulai = $newStart;
                }
                if (property_exists($s, 'mulai')) {
                    $s->mulai = $newStart;
                }
                if (property_exists($s, 'start_time')) {
                    $s->start_time = $newStart;
                }

                if (property_exists($s, 'jamAkhir')) {
                    $s->jamAkhir = $newEnd;
                }
                if (property_exists($s, 'selesai')) {
                    $s->selesai = $newEnd;
                }
                if (property_exists($s, 'end_time')) {
                    $s->end_time = $newEnd;
                }

                // Check and set sessions
                if (property_exists($s, 'sesiMulai')) {
                    $s->sesiMulai = $sessionStart;
                } elseif (property_exists($s, 'session_start')) {
                    $s->session_start = $sessionStart;
                }

                if (property_exists($s, 'durasi')) {
                    $s->durasi = $sessionDuration;
                } elseif (property_exists($s, 'session_duration')) {
                    $s->session_duration = $sessionDuration;
                }

                // Set type to override
                $s->tipe = 'override';

                // For Dosen 'waktu' if exists
                if (property_exists($s, 'waktu')) {
                    $s->waktu = $newStart . ' - ' . $newEnd;
                }
            } else {
                // It's an array
                if (array_key_exists('hari', $s)) {
                    $s['hari'] = strtolower($newDay);
                } elseif (array_key_exists('day_of_week', $s)) {
                    $s['day_of_week'] = $newDay;
                }

                if (array_key_exists('ruangan', $s)) {
                    $s['ruangan'] = $selectedRoomValue;
                }
                if (array_key_exists('ruangan_id', $s)) {
                    $s['ruangan_id'] = $roomId;
                }
                if (array_key_exists('room_id', $s)) {
                    $s['room_id'] = $roomId;
                }

                if (array_key_exists('jamMulai', $s)) {
                    $s['jamMulai'] = $newStart;
                }
                if (array_key_exists('mulai', $s)) {
                    $s['mulai'] = $newStart;
                }
                if (array_key_exists('start_time', $s)) {
                    $s['start_time'] = $newStart;
                }

                if (array_key_exists('jamAkhir', $s)) {
                    $s['jamAkhir'] = $newEnd;
                }
                if (array_key_exists('selesai', $s)) {
                    $s['selesai'] = $newEnd;
                }
                if (array_key_exists('end_time', $s)) {
                    $s['end_time'] = $newEnd;
                }

                if (array_key_exists('sesiMulai', $s)) {
                    $s['sesiMulai'] = $sessionStart;
                } elseif (array_key_exists('session_start', $s)) {
                    $s['session_start'] = $sessionStart;
                }

                if (array_key_exists('durasi', $s)) {
                    $s['durasi'] = $sessionDuration;
                } elseif (array_key_exists('session_duration', $s)) {
                    $s['session_duration'] = $sessionDuration;
                }

                $s['tipe'] = 'override';

                if (array_key_exists('waktu', $s)) {
                    $s['waktu'] = $newStart . ' - ' . $newEnd;
                }
            }

            return $s;
        });
    }
}
