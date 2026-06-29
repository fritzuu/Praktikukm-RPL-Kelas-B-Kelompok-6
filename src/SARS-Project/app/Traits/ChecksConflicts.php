<?php

namespace App\Traits;

use App\Models\Schedule;
use App\Models\ScheduleOverride;
use Illuminate\Support\Facades\DB;

/**
 * Reusable conflict detection logic for use across controllers.
 * Extracted from MahasiswaController::checkSlotConflict for DRY principle.
 */
trait ChecksConflicts
{
    /**
     * Checks if a proposed slot has conflicts.
     * Returns null if clean, or a string describing the conflict reason if there is one.
     *
     * Conflict Detection Logic:
     * - Time values normalized to HH:MM:SS for consistent SQL comparison
     * - Outgoing overrides: baseline schedules that are overridden OUT of the room
     *   on the given $date are skipped (they no longer occupy the original slot)
     * - Room conflicts: checks baseline schedules and active overrides in same room
     * - Lecturer conflicts: checks if any assigned lecturer has overlapping class on same day
     * - Practicum exemptions: two practicum classes in different rooms = OK
     * - Team-teaching skipped (co-lecturers can cover)
     */
    protected function checkSlotConflict(
        int $scheduleId,
        int $semesterId,
        string $day,
        string $startTime,
        string $endTime,
        int $roomId,
        ?string $date = null
    ): ?string {
        // Normalize times to HH:MM:SS for consistent DB comparison
        $startTime = $this->normalizeTimeToFull($startTime);
        $endTime = $this->normalizeTimeToFull($endTime);

        $schedule = Schedule::with('course')->findOrFail($scheduleId);

        // Build list of schedule IDs that have outgoing overrides on this date
        // (these baselines are moved AWAY from their original room/day, so they don't conflict)
        $outgoingOverrideIds = [];
        if ($date) {
            $outgoingOverrideIds = ScheduleOverride::where('is_active', true)
                ->where('override_date', $date)
                ->pluck('schedule_id')
                ->toArray();
        }

        // 1. Room conflict check
        $roomConflictQuery = Schedule::where('semester_id', $semesterId)
            ->where('is_active', true)
            ->where('room_id', $roomId)
            ->where('day_of_week', $day)
            ->where('id', '!=', $scheduleId)
            ->overlappingTime($startTime, $endTime);

        // Skip baselines that are overridden out on this date
        if (!empty($outgoingOverrideIds)) {
            $roomConflictQuery->whereNotIn('id', $outgoingOverrideIds);
        }

        $roomConflict = $roomConflictQuery->first();

        if ($roomConflict) {
            return "Bentrok Ruangan: digunakan oleh {$roomConflict->course->name} ({$roomConflict->course->class_name})";
        }

        if ($date) {
            $roomOverrideConflict = ScheduleOverride::where('is_active', true)
                ->where('room_id', $roomId)
                ->where('override_date', $date)
                ->where('schedule_id', '!=', $scheduleId)
                ->where(function ($q) use ($startTime, $endTime) {
                    $q->where('new_start_time', '<', $endTime)
                      ->where('new_end_time', '>', $startTime);
                })
                ->first();

            if ($roomOverrideConflict) {
                return "Bentrok Ruangan: digunakan oleh {$roomOverrideConflict->schedule->course->name} (Override)";
            }
        }

        // 2. Lecturer conflict check
        $lecturerIds = DB::table('teaching_assignments')
            ->where('schedule_id', $scheduleId)
            ->pluck('user_id');

        if ($lecturerIds->isNotEmpty()) {
            $lecturerConflictQuery = Schedule::where('semester_id', $semesterId)
                ->where('is_active', true)
                ->where('day_of_week', $day)
                ->where('id', '!=', $scheduleId)
                ->overlappingTime($startTime, $endTime)
                ->whereHas('teachingAssignments', function ($q) use ($lecturerIds) {
                    $q->whereIn('user_id', $lecturerIds);
                });

            if (!empty($outgoingOverrideIds)) {
                $lecturerConflictQuery->whereNotIn('id', $outgoingOverrideIds);
            }

            $lecturerConflicts = $lecturerConflictQuery->get();
            $realConflict = null;
            foreach ($lecturerConflicts as $lc) {
                // Skip if either schedule is team-taught (co-lecturer can cover)
                if ($this->isTeamTeachingSchedule($scheduleId) || $this->isTeamTeachingSchedule($lc->id)) {
                    continue;
                }

                // Check if conflict should be ignored (practicum rules)
                $course1 = $schedule->course;
                $course2 = $lc->course;
                $isP1 = $this->isPracticumCourse($course1);
                $isP2 = $this->isPracticumCourse($course2);
                $isBothPracticum = $isP1 && $isP2;
                $isAnyPracticum = $isP1 || $isP2;
                $isRoomDifferent = $roomId !== $lc->room_id;
                
                if ($isBothPracticum || ($isAnyPracticum && $isRoomDifferent)) {
                    continue; // Ignore
                }
                $realConflict = $lc;
                break;
            }

            if ($realConflict) {
                return "Bentrok Dosen: mengajar {$realConflict->course->name} ({$realConflict->course->class_name})";
            }

            if ($date) {
                $lecturerOverrideConflicts = ScheduleOverride::with(['schedule.course'])
                    ->where('is_active', true)
                    ->where('override_date', $date)
                    ->where('schedule_id', '!=', $scheduleId)
                    ->where(function ($q) use ($startTime, $endTime) {
                        $q->where('new_start_time', '<', $endTime)
                          ->where('new_end_time', '>', $startTime);
                    })
                    ->whereHas('schedule.teachingAssignments', function ($q) use ($lecturerIds) {
                        $q->whereIn('user_id', $lecturerIds);
                    })
                    ->get();

                $realOverrideConflict = null;
                foreach ($lecturerOverrideConflicts as $loc) {
                    // Skip if either schedule is team-taught
                    if ($this->isTeamTeachingSchedule($scheduleId) || $this->isTeamTeachingSchedule($loc->schedule_id)) {
                        continue;
                    }

                    $course1 = $schedule->course;
                    $course2 = $loc->schedule->course;
                    $isP1 = $this->isPracticumCourse($course1);
                    $isP2 = $this->isPracticumCourse($course2);
                    $isBothPracticum = $isP1 && $isP2;
                    $isAnyPracticum = $isP1 || $isP2;
                    $isRoomDifferent = $roomId !== $loc->room_id;
                    
                    if ($isBothPracticum || ($isAnyPracticum && $isRoomDifferent)) {
                        continue;
                    }
                    $realOverrideConflict = $loc;
                    break;
                }

                if ($realOverrideConflict) {
                    return "Bentrok Dosen: mengajar {$realOverrideConflict->schedule->course->name} (Override)";
                }
            }
        }

        return null;
    }

    /**
     * Normalize time to HH:MM:SS format
     */
    protected function normalizeTimeToFull(string $time): string
    {
        if (strlen($time) === 5) {
            return $time . ':00';
        }
        return $time;
    }

    /**
     * Check if schedule has team teaching (multiple lecturers)
     */
    protected function isTeamTeachingSchedule(int $scheduleId): bool
    {
        $count = DB::table('teaching_assignments')
            ->where('schedule_id', $scheduleId)
            ->where('role_in_class', 'PENGAJAR')
            ->count();

        return $count > 1;
    }

    /**
     * Check if course is practicum (by name/class name)
     */
    protected function isPracticumCourse($course): bool
    {
        if (!$course) return false;

        $name = strtolower($course->name ?? '');
        $className = strtolower($course->class_name ?? '');

        return str_contains($name, 'praktikum') ||
               str_contains($name, 'praktik') ||
               str_contains($name, 'lab') ||
               str_contains($className, ' p') ||
               str_ends_with($className, 'p');
    }
}
