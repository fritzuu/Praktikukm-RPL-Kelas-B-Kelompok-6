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
}
