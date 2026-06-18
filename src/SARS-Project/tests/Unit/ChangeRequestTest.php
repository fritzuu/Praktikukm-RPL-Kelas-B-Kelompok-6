<?php

namespace Tests\Unit;

use App\Models\ChangeRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChangeRequestTest extends TestCase
{
    use RefreshDatabase;

    /**
     * TEST 1: Code format validation
     * ARRANGE: No setup needed for pure function
     * ACT: Call generateCode()
     * ASSERT: Format should match CR-YYYYMMDD-XXXX
     */
    public function test_generates_unique_request_code_with_correct_format(): void
    {
        // ARRANGE
        // (no setup needed - pure function)

        // ACT
        $code = ChangeRequest::generateCode();

        // ASSERT
        // Format: CR-YYYYMMDD-[4 random chars]
        $this->assertMatchesRegularExpression(
            '/^CR-\d{8}-[A-Z0-9]{4}$/',
            $code,
            'Code should match format CR-YYYYMMDD-XXXX'
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
        $semester = \App\Models\Semester::create([
            'name' => 'Semester Ganjil 2026',
            'academic_year' => '2026/2027',
            'term' => 'GANJIL',
            'start_date' => '2026-09-01',
            'end_date' => '2027-02-28',
            'is_active' => true,
        ]);

        $user = \App\Models\User::create([
            'name' => 'Test User',
            'email' => 'test@student.sars.test',
            'password' => bcrypt('password'),
            'nim_nip' => '123456',
        ]);

        $room = \App\Models\Room::create([
            'name' => 'Lab Komputer',
            'code' => 'LAB-COMP',
            'capacity' => 30,
            'building' => 'Gedung B',
            'type' => 'LABORATORIUM',
            'is_active' => true,
        ]);

        $course = \App\Models\Course::create([
            'semester_id' => $semester->id,
            'code' => 'MK-TEST',
            'name' => 'Test Course',
            'class_name' => 'A',
            'credits' => 3,
        ]);

        $schedule = \App\Models\Schedule::create([
            'course_id' => $course->id,
            'room_id' => $room->id,
            'semester_id' => $semester->id,
            'day_of_week' => 'SENIN',
            'start_time' => '07:30:00',
            'end_time' => '10:10:00',
            'session_start' => 1,
            'session_duration' => 3,
            'effective_from' => '2026-09-01',
            'is_active' => true,
        ]);

        $existingCode = 'CR-20260616-AAAA';
        ChangeRequest::create([
            'request_code' => $existingCode,
            'requester_id' => $user->id,
            'schedule_id' => $schedule->id,
            'semester_id' => $semester->id,
            'request_type' => 'TEMPORARY',
            'status' => 'PENDING_ASLAB',
            'reason' => 'Test reason for reschedule',
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
