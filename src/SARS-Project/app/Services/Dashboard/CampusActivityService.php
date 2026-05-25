<?php

namespace App\Services\Dashboard;

use App\Models\Room;
use App\Models\Schedule;
use App\Models\ScheduleOverride;
use App\Models\Semester;
use App\Support\AcademicSessionTimes;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class CampusActivityService
{
    private const DAY_MAP = [
        1 => 'SENIN',
        2 => 'SELASA',
        3 => 'RABU',
        4 => 'KAMIS',
        5 => 'JUMAT',
        6 => 'SABTU',
    ];

    /**
     * Build dashboard widget payload from live DB state.
     */
    public function buildPayload(?Semester $semester): array
    {
        if (!$semester) {
            return $this->emptyPayload();
        }

        $now = Carbon::now('Asia/Jakarta');
        $todayDow = self::DAY_MAP[$now->dayOfWeek] ?? null;

        if (!$todayDow) {
            return $this->weekendPayload($semester, $now);
        }

        $todayDate = $now->toDateString();
        $currentTime = $now->format('H:i:s');

        if (!AcademicSessionTimes::isWithinLectureHours($todayDow, $currentTime)) {
            return $this->outsideLectureHoursPayload($semester, $now, $todayDow, $currentTime);
        }

        $rooms = Room::where('is_active', true)->orderBy('code')->get();
        $occurrences = $this->resolveTodayOccurrences($semester->id, $todayDow, $todayDate);
        $lectureWindow = AcademicSessionTimes::lectureWindowForDay($todayDow);

        $activeOccurrences = $occurrences->filter(
            fn (array $o) => $currentTime >= $o['start_time'] && $currentTime < $o['end_time']
        );

        $occupiedRoomIds = $activeOccurrences->pluck('room_id')->unique();

        $emptyRooms = $rooms
            ->filter(fn (Room $room) => !$occupiedRoomIds->contains($room->id))
            ->map(fn (Room $room) => $this->formatEmptyRoom($room, $occurrences, $currentTime, $lectureWindow))
            ->values()
            ->all();

        $roomTypes = $rooms->pluck('type')->unique()->sort()->values()->all();

        return [
            'emptyRooms' => $emptyRooms,
            'stats' => [
                'activeSchedules' => $activeOccurrences->count(),
                'usedRooms' => $occupiedRoomIds->count(),
                'emptyRooms' => count($emptyRooms),
                'totalToday' => $occurrences->count(),
            ],
            'currentTime' => $now->format('H:i'),
            'todayDay' => strtolower($todayDow),
            'roomTypes' => $roomTypes,
            'hasSemester' => true,
            'isWeekend' => false,
            'availabilityStatus' => 'active',
            'lectureWindow' => $lectureWindow,
        ];
    }

    /**
     * Resolve all class occurrences for a calendar date (baseline + overrides).
     */
    private function resolveTodayOccurrences(int $semesterId, string $todayDow, string $todayDate): Collection
    {
        $baseline = Schedule::query()
            ->where('semester_id', $semesterId)
            ->where('is_active', true)
            ->where('day_of_week', $todayDow)
            ->effectiveOnDate($todayDate)
            ->get(['id', 'room_id', 'start_time', 'end_time']);

        $overridesToday = ScheduleOverride::query()
            ->where('is_active', true)
            ->where('override_date', $todayDate)
            ->whereHas('schedule', fn ($q) => $q
                ->where('semester_id', $semesterId)
                ->where('is_active', true))
            ->get(['schedule_id', 'room_id', 'new_day_of_week', 'new_start_time', 'new_end_time']);

        $overriddenScheduleIds = $overridesToday->pluck('schedule_id')->unique();

        $occurrences = collect();

        foreach ($baseline->whereNotIn('id', $overriddenScheduleIds) as $schedule) {
            $occurrences->push([
                'schedule_id' => $schedule->id,
                'room_id' => $schedule->room_id,
                'start_time' => $this->normalizeTime($schedule->start_time),
                'end_time' => $this->normalizeTime($schedule->end_time),
            ]);
        }

        foreach ($overridesToday as $override) {
            if ($override->new_day_of_week && $override->new_day_of_week !== $todayDow) {
                continue;
            }

            $occurrences->push([
                'schedule_id' => $override->schedule_id,
                'room_id' => $override->room_id,
                'start_time' => $this->normalizeTime($override->new_start_time),
                'end_time' => $this->normalizeTime($override->new_end_time),
            ]);
        }

        return $occurrences->values();
    }

    /**
     * @param  array{start: string, end: string}  $lectureWindow
     */
    private function formatEmptyRoom(Room $room, Collection $occurrences, string $currentTime, array $lectureWindow): array
    {
        $roomOccurrences = $occurrences
            ->where('room_id', $room->id)
            ->sortBy('start_time')
            ->values();

        $dayEnd = substr($lectureWindow['end'], 0, 5);

        $nextOccurrence = $roomOccurrences
            ->first(fn (array $o) => $o['start_time'] > $currentTime);

        if ($roomOccurrences->isEmpty()) {
            $availableUntil = 'Available Until ' . $dayEnd;
        } elseif ($nextOccurrence) {
            $availableUntil = 'Available Until ' . substr($nextOccurrence['start_time'], 0, 5);
        } else {
            $availableUntil = 'Available Until ' . $dayEnd;
        }

        return [
            'id' => $room->id,
            'code' => $room->code,
            'name' => $room->name,
            'type' => $room->type,
            'building' => $room->building,
            'availableUntil' => $availableUntil,
        ];
    }

    private function normalizeTime(mixed $time): string
    {
        return AcademicSessionTimes::normalizeTime($time);
    }

    /**
     * Sunday — no academic sessions.
     */
    private function weekendPayload(Semester $semester, Carbon $now): array
    {
        $rooms = Room::where('is_active', true)->orderBy('code')->get();

        return [
            'emptyRooms' => [],
            'stats' => [
                'activeSchedules' => 0,
                'usedRooms' => 0,
                'emptyRooms' => 0,
                'totalToday' => 0,
            ],
            'currentTime' => $now->format('H:i'),
            'todayDay' => null,
            'roomTypes' => $rooms->pluck('type')->unique()->sort()->values()->all(),
            'hasSemester' => true,
            'isWeekend' => true,
            'availabilityStatus' => 'weekend',
            'lectureWindow' => null,
        ];
    }

    /**
     * Before first session or after last session — no live room availability.
     */
    private function outsideLectureHoursPayload(
        Semester $semester,
        Carbon $now,
        string $todayDow,
        string $currentTime
    ): array {
        $rooms = Room::where('is_active', true)->orderBy('code')->get();
        $lectureWindow = AcademicSessionTimes::lectureWindowForDay($todayDow);
        $phase = AcademicSessionTimes::outsideHoursPhase($todayDow, $currentTime);

        return [
            'emptyRooms' => [],
            'stats' => [
                'activeSchedules' => 0,
                'usedRooms' => 0,
                'emptyRooms' => 0,
                'totalToday' => $this->resolveTodayOccurrences(
                    $semester->id,
                    $todayDow,
                    $now->toDateString()
                )->count(),
            ],
            'currentTime' => $now->format('H:i'),
            'todayDay' => strtolower($todayDow),
            'roomTypes' => $rooms->pluck('type')->unique()->sort()->values()->all(),
            'hasSemester' => true,
            'isWeekend' => false,
            'availabilityStatus' => $phase,
            'lectureWindow' => $lectureWindow,
        ];
    }

    private function emptyPayload(?Carbon $now = null, bool $hasSemester = false, bool $isWeekend = false): array
    {
        $now ??= Carbon::now('Asia/Jakarta');

        return [
            'emptyRooms' => [],
            'stats' => [
                'activeSchedules' => 0,
                'usedRooms' => 0,
                'emptyRooms' => 0,
                'totalToday' => 0,
            ],
            'currentTime' => $now->format('H:i'),
            'todayDay' => null,
            'roomTypes' => $hasSemester
                ? Room::where('is_active', true)->distinct()->pluck('type')->sort()->values()->all()
                : [],
            'hasSemester' => $hasSemester,
            'isWeekend' => $isWeekend,
            'availabilityStatus' => $hasSemester ? ($isWeekend ? 'weekend' : 'outside_hours') : 'no_semester',
            'lectureWindow' => null,
        ];
    }
}
