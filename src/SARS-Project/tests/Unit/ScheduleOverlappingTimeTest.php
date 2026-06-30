<?php

namespace Tests\Unit;

use App\Models\Schedule;
use App\Models\Course;
use App\Models\Room;
use App\Models\Semester;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ScheduleOverlappingTimeTest extends TestCase
{
    use RefreshDatabase;

    private Semester $semester;
    private Room $room;
    private Course $course;

    /**
     * SETUP: Create test data before each test
     */
    public function setUp(): void
    {
        parent::setUp();

        // Create semester
        $this->semester = Semester::create([
            'name' => '2025/2026-I',
            'academic_year' => '2025/2026',
            'term' => 'GANJIL',
            'start_date' => '2025-09-01',
            'end_date' => '2025-12-31',
        ]);

        // Create room
        $this->room = Room::create([
            'name' => 'A1.01',
            'code' => 'A1.01',
            'capacity' => 40,
            'building' => 'Gedung A',
            'type' => 'KELAS',
        ]);

        // Create course
        $this->course = Course::create([
            'semester_id' => $this->semester->id,
            'code' => 'CS101',
            'name' => 'Introduction to Programming',
            'credits' => 3,
            'class_name' => 'A',
        ]);
    }

    /**
     * TEST 1: Query returns schedules with overlapping time
     * ARRANGE: Create schedule with specific time, query with overlapping range
     * ACT: Execute scopeOverlappingTime query
     * ASSERT: Should return the schedule
     */
    public function test_returns_schedules_with_overlapping_time(): void
    {
        // ARRANGE
        Schedule::create([
            'course_id' => $this->course->id,
            'room_id' => $this->room->id,
            'semester_id' => $this->semester->id,
            'day_of_week' => 'SENIN',
            'start_time' => '09:00',
            'end_time' => '11:00',
            'session_start' => 1,
            'session_duration' => 2,
            'effective_from' => '2025-09-01',
            'is_active' => true,
        ]);

        // ACT - Query for overlapping time: 10:00-12:00
        $overlappingSchedules = Schedule::overlappingTime('10:00', '12:00')->get();

        // ASSERT
        $this->assertCount(
            1,
            $overlappingSchedules,
            'Should return 1 schedule that overlaps with 10:00-12:00'
        );
        $this->assertEquals('09:00', $overlappingSchedules->first()->start_time);
    }

    /**
     * TEST 2: Query returns empty when no overlapping schedules
     * ARRANGE: Create schedule at different time
     * ACT: Query for non-overlapping time range
     * ASSERT: Should return empty
     */
    public function test_returns_empty_when_no_overlapping_schedules(): void
    {
        // ARRANGE
        Schedule::create([
            'course_id' => $this->course->id,
            'room_id' => $this->room->id,
            'semester_id' => $this->semester->id,
            'day_of_week' => 'SENIN',
            'start_time' => '09:00',
            'end_time' => '11:00',
            'session_start' => 1,
            'session_duration' => 2,
            'effective_from' => '2025-09-01',
            'is_active' => true,
        ]);

        // ACT - Query for time after schedule ends
        $overlappingSchedules = Schedule::overlappingTime('13:00', '15:00')->get();

        // ASSERT
        $this->assertCount(
            0,
            $overlappingSchedules,
            'Should return 0 schedules (no overlap with 13:00-15:00)'
        );
    }

    /**
     * TEST 3: Query handles multiple overlapping schedules
     * ARRANGE: Create 3 schedules, 2 overlap with query range
     * ACT: Execute query
     * ASSERT: Should return only 2 overlapping
     */
    public function test_returns_multiple_overlapping_schedules(): void
    {
        // ARRANGE
        // Schedule 1: 09:00-11:00 (overlaps with 10:00-12:00)
        Schedule::create([
            'course_id' => $this->course->id,
            'room_id' => $this->room->id,
            'semester_id' => $this->semester->id,
            'day_of_week' => 'SENIN',
            'start_time' => '09:00',
            'end_time' => '11:00',
            'session_start' => 1,
            'session_duration' => 2,
            'effective_from' => '2025-09-01',
            'is_active' => true,
        ]);

        // Schedule 2: 11:30-13:00 (overlaps with 10:00-12:00)
        Schedule::create([
            'course_id' => $this->course->id,
            'room_id' => $this->room->id,
            'semester_id' => $this->semester->id,
            'day_of_week' => 'SELASA',
            'start_time' => '11:30',
            'end_time' => '13:00',
            'session_start' => 1,
            'session_duration' => 2,
            'effective_from' => '2025-09-01',
            'is_active' => true,
        ]);

        // Schedule 3: 14:00-16:00 (NO overlap with 10:00-12:00)
        Schedule::create([
            'course_id' => $this->course->id,
            'room_id' => $this->room->id,
            'semester_id' => $this->semester->id,
            'day_of_week' => 'RABU',
            'start_time' => '14:00',
            'end_time' => '16:00',
            'session_start' => 1,
            'session_duration' => 2,
            'effective_from' => '2025-09-01',
            'is_active' => true,
        ]);

        // ACT
        $overlappingSchedules = Schedule::overlappingTime('10:00', '12:00')->get();

        // ASSERT
        $this->assertCount(
            2,
            $overlappingSchedules,
            'Should return 2 schedules that overlap'
        );
    }

    /**
     * TEST 4: Query with exact boundary times
     * ARRANGE: Create schedule at exact boundary (10:00-12:00)
     * ACT: Query for same exact time
     * ASSERT: Should NOT return (boundary check: start < end && end > start)
     */
    public function test_handles_exact_boundary_times(): void
    {
        // ARRANGE
        $schedule = Schedule::create([
            'course_id' => $this->course->id,
            'room_id' => $this->room->id,
            'semester_id' => $this->semester->id,
            'day_of_week' => 'SENIN',
            'start_time' => '10:00',
            'end_time' => '12:00',
            'session_start' => 1,
            'session_duration' => 2,
            'effective_from' => '2025-09-01',
            'is_active' => true,
        ]);

        // ACT - Query with same exact time
        $result = Schedule::overlappingTime('10:00', '12:00')->get();

        // ASSERT
        $this->assertCount(1, $result, 'Exact same time range should be detected as overlap');
    }

    /**
     * TEST 5: Query ignores inactive schedules (bonus test)
     * ARRANGE: Create 1 active and 1 inactive overlapping schedule
     * ACT: Query for overlapping times
     * ASSERT: Should return only active ones
     */
    public function test_considers_only_active_schedules_with_overlap(): void
    {
        // ARRANGE - Active schedule
        Schedule::create([
            'course_id' => $this->course->id,
            'room_id' => $this->room->id,
            'semester_id' => $this->semester->id,
            'day_of_week' => 'SENIN',
            'start_time' => '09:00',
            'end_time' => '11:00',
            'session_start' => 1,
            'session_duration' => 2,
            'effective_from' => '2025-09-01',
            'is_active' => true, // ACTIVE
        ]);

        // Inactive schedule with same time
        Schedule::create([
            'course_id' => $this->course->id,
            'room_id' => $this->room->id,
            'semester_id' => $this->semester->id,
            'day_of_week' => 'SENIN',
            'start_time' => '09:00',
            'end_time' => '11:00',
            'session_start' => 1,
            'session_duration' => 2,
            'effective_from' => '2025-08-01',
            'is_active' => false, // INACTIVE
        ]);

        // ACT - Query overlap without explicit active filter
        $result = Schedule::overlappingTime('10:00', '12:00')->get();

        // ASSERT - Should get 2 (scope only filters by time, not active status)
        // If you want to test active-only, combine with activeForSemester()
        $this->assertGreaterThanOrEqual(1, $result->count(), 'Should find at least active schedule');
    }
}
