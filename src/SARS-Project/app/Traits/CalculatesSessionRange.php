<?php

namespace App\Traits;

/**
 * Trait untuk menghitung session range dari waktu
 */
trait CalculatesSessionRange
{
    /**
     * Calculate session label from time range (e.g., "Sesi 1-3" or "Sesi 5")
     * 
     * @param string $day Day of week (SENIN, SELASA, etc.)
     * @param string $startTime Start time (HH:MM:SS or HH:MM)
     * @param string $endTime End time (HH:MM:SS or HH:MM)
     * @return string|null Session label or null if cannot determine
     */
    protected function calculateSessionLabel(string $day, string $startTime, string $endTime): ?string
    {
        $isFriday = (strtoupper($day) === 'JUMAT');
        
        $sessionTimes = $isFriday ? [
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
        ] : [
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

        // Format times to HH:MM
        $start = substr($startTime, 0, 5);
        $end = substr($endTime, 0, 5);

        $startSession = null;
        $endSession = null;

        // Find matching sessions
        foreach ($sessionTimes as $idx => $range) {
            if ($range[0] === $start) {
                $startSession = $idx;
            }
            if ($range[1] === $end) {
                $endSession = $idx;
            }
        }

        // Fallback to closest match if exact match not found
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

        if ($startSession === null || $endSession === null) {
            return null;
        }

        // Format as "Sesi X" or "Sesi X–Y"
        if ($startSession === $endSession) {
            return 'Sesi ' . $startSession;
        }

        return 'Sesi ' . $startSession . '–' . $endSession;
    }
}
