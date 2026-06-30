<?php

namespace Tests\Unit;

use App\Models\Schedule;
use App\Models\Course;
use App\Models\Room;
use App\Models\Semester;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ScheduleEffectiveDateTest extends TestCase
{
    use RefreshDatabase;

    private Semester $semester;
    private Room $room;
    private Course $course;

    /**
     * SETUP: Create baseline relations (Semester, Room, Course) before each test.
     */
    public function setUp(): void
    {
        parent::setUp();

        $this->semester = Semester::create([
            'name' => '2025/2026-I',
            'academic_year' => '2025/2026',
            'term' => 'GANJIL',
            'start_date' => '2025-09-01',
            'end_date' => '2025-12-31',
        ]);

        $this->room = Room::create([
            'name' => 'A1.01',
            'code' => 'A1.01',
            'capacity' => 40,
            'building' => 'Gedung A',
            'type' => 'KELAS',
        ]);

        $this->course = Course::create([
            'semester_id' => $this->semester->id,
            'code' => 'CS101',
            'name' => 'Introduction to Programming',
            'credits' => 3,
            'class_name' => 'A',
        ]);
    }

    /**
     * Helper to create a schedule for testing.
     */
    private function createSchedule(string $from, ?string $until): Schedule
    {
        return Schedule::create([
            'course_id' => $this->course->id,
            'room_id' => $this->room->id,
            'semester_id' => $this->semester->id,
            'day_of_week' => 'SENIN',
            'start_time' => '09:00',
            'end_time' => '11:00',
            'session_start' => 1,
            'session_duration' => 2,
            'effective_from' => $from,
            'effective_until' => $until,
            'is_active' => true,
        ]);
    }

    /**
     * TEST 1: Happy path date within range.
     * ARRANGE: Create schedule effective from 2025-09-01 to 2025-09-30.
     * ACT: Query for effectiveOnDate using a middle date (2025-09-15 00:00:00).
     * ASSERT: The schedule should be included in the results.
     */
    public function test_includes_schedule_when_date_is_within_effective_range(): void
    {
        // ARRANGE
        $schedule = $this->createSchedule('2025-09-01', '2025-09-30');

        // ACT
        $results = Schedule::effectiveOnDate('2025-09-15 00:00:00')->get();

        // ASSERT
        $this->assertCount(1, $results, 'Should include schedule when target date is within range');
        $this->assertTrue($results->contains($schedule));
    }

    /**
     * TEST 2: Boundary match - equal to effective_from date.
     * ARRANGE: Create schedule effective from 2025-09-01 to 2025-09-30.
     * ACT: Query for effectiveOnDate using the start date (2025-09-01 00:00:00).
     * ASSERT: The schedule should be included in the results.
     */
    public function test_includes_schedule_when_date_matches_start_date_exactly(): void
    {
        // ARRANGE
        $schedule = $this->createSchedule('2025-09-01', '2025-09-30');

        // ACT
        $results = Schedule::effectiveOnDate('2025-09-01 00:00:00')->get();

        // ASSERT
        $this->assertCount(1, $results, 'Should include schedule when target date matches start date exactly');
        $this->assertTrue($results->contains($schedule));
    }

    /**
     * TEST 3: Boundary match - equal to effective_until date.
     * ARRANGE: Create schedule effective from 2025-09-01 to 2025-09-30.
     * ACT: Query for effectiveOnDate using the end date (2025-09-30 00:00:00).
     * ASSERT: The schedule should be included in the results.
     */
    public function test_includes_schedule_when_date_matches_end_date_exactly(): void
    {
        // ARRANGE
        $schedule = $this->createSchedule('2025-09-01', '2025-09-30');

        // ACT
        $results = Schedule::effectiveOnDate('2025-09-30 00:00:00')->get();

        // ASSERT
        $this->assertCount(1, $results, 'Should include schedule when target date matches end date exactly');
        $this->assertTrue($results->contains($schedule));
    }

    /**
     * TEST 4: Null effective_until handling (open-ended schedule).
     * ARRANGE: Create schedule effective from 2025-09-01 with null effective_until.
     * ACT: Query for effectiveOnDate using a far future date (2026-05-10 00:00:00).
     * ASSERT: The schedule should be included in the results.
     */
    public function test_includes_schedule_when_end_date_is_null_and_date_is_after_start_date(): void
    {
        // ARRANGE
        $schedule = $this->createSchedule('2025-09-01', null);

        // ACT
        $results = Schedule::effectiveOnDate('2026-05-10 00:00:00')->get();

        // ASSERT
        $this->assertCount(1, $results, 'Should include open-ended schedule for any date after its start date');
        $this->assertTrue($results->contains($schedule));
    }

    /**
     * TEST 5: Exclude expired schedule.
     * ARRANGE: Create schedule effective from 2025-09-01 to 2025-09-30.
     * ACT: Query for effectiveOnDate using an expired date (2025-10-01 00:00:00).
     * ASSERT: The schedule should be excluded from the results.
     */
    public function test_excludes_schedule_when_date_is_after_end_date(): void
    {
        // ARRANGE
        $schedule = $this->createSchedule('2025-09-01', '2025-09-30');

        // ACT
        $results = Schedule::effectiveOnDate('2025-10-01 00:00:00')->get();

        // ASSERT
        $this->assertCount(0, $results, 'Should exclude expired schedule');
    }

    /**
     * TEST 6: Exclude future schedule.
     * ARRANGE: Create schedule effective from 2025-09-01 to 2025-09-30.
     * ACT: Query for effectiveOnDate using a date before effective_from (2025-08-31 00:00:00).
     * ASSERT: The schedule should be excluded from the results.
     */
    public function test_excludes_schedule_when_date_is_before_start_date(): void
    {
        // ARRANGE
        $schedule = $this->createSchedule('2025-09-01', '2025-09-30');

        // ACT
        $results = Schedule::effectiveOnDate('2025-08-31 00:00:00')->get();

        // ASSERT
        $this->assertCount(0, $results, 'Should exclude future schedule');
    }
}
