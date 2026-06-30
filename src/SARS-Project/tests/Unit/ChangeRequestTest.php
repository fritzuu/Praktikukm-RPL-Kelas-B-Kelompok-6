<?php

namespace Tests\Unit;

use App\Models\ChangeRequest;
use App\Models\Semester;
use App\Models\User;
use App\Models\Room;
use App\Models\Course;
use App\Models\Schedule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChangeRequestTest extends TestCase
{
    use RefreshDatabase;

    /**
     * TEST 1: Code format validation
     * ARRANGE: No setup needed for pure function
     * ACT: Call generateCode()
     * ASSERT: Format should match REQ-YYYYMMDD-XXXX
     */
    public function test_generates_unique_request_code_with_correct_format(): void
    {
        // ARRANGE
        // (no setup needed - pure function)

        // ACT
        $code = ChangeRequest::generateCode();

        // ASSERT
        // Format: REQ-YYYYMMDD-[4 random chars]
        $this->assertMatchesRegularExpression(
            '/^REQ-\d{8}-[A-Z0-9]{4}$/',
            $code,
            'Code should match format REQ-YYYYMMDD-XXXX'
        );
    }

    /**
     * TEST 2: Uniqueness across calls
     * ARRANGE: Generate multiple codes
     * ACT: Collect them into array
     * ASSERT: All should be unique
     */
    public function test_generates_different_codes_on_subsequent_calls(): void
    {
        // ARRANGE
        $codes = [];

        // ACT
        for ($i = 0; $i < 10; $i++) {
            $codes[] = ChangeRequest::generateCode();
        }

        // ASSERT
        $uniqueCodes = array_unique($codes);
        $this->assertCount(
            10,
            $uniqueCodes,
            'All 10 generated codes should be unique'
        );
    }

    /**
     * TEST 3: Duplicate prevention
     * ARRANGE: Create existing code in database
     * ACT: Generate code until it would be duplicate
     * ASSERT: System should not return duplicate
     */
    public function test_prevents_duplicate_codes(): void
    {
        // ARRANGE
        $semester = Semester::create([
            'name' => '2025/2026-I',
            'academic_year' => '2025/2026',
            'term' => 'GANJIL',
            'start_date' => '2025-09-01',
            'end_date' => '2025-12-31',
        ]);

        $user = User::create([
            'name' => 'Test User',
            'email' => 'testuser@example.com',
            'password' => bcrypt('password'),
            'nim_nip' => '1234567890',
        ]);

        $room = Room::create([
            'name' => 'A1.01',
            'code' => 'A1.01',
            'capacity' => 40,
            'building' => 'Gedung A',
            'type' => 'KELAS',
        ]);

        $course = Course::create([
            'semester_id' => $semester->id,
            'code' => 'CS101',
            'name' => 'Introduction to Programming',
            'credits' => 3,
            'class_name' => 'A',
        ]);

        $schedule = Schedule::create([
            'course_id' => $course->id,
            'room_id' => $room->id,
            'semester_id' => $semester->id,
            'day_of_week' => 'SENIN',
            'start_time' => '09:00',
            'end_time' => '11:00',
            'session_start' => 1,
            'session_duration' => 2,
            'effective_from' => '2025-09-01',
            'is_active' => true,
        ]);

        $existingCode = 'REQ-20260616-AAAA';
        ChangeRequest::create([
            'request_code' => $existingCode,
            'requester_id' => $user->id,
            'schedule_id' => $schedule->id,
            'semester_id' => $semester->id,
            'request_type' => 'TEMPORARY',
            'status' => 'PENDING_ASLAB',
            'reason' => 'Pertemuan pengganti karena hari libur nasional.',
        ]);

        // ACT
        $codes = [];
        for ($i = 0; $i < 100; $i++) {
            $codes[] = ChangeRequest::generateCode();
        }

        // ASSERT
        $this->assertNotContains(
            $existingCode,
            $codes,
            'Generated codes should never match existing code in database'
        );
    }
}
