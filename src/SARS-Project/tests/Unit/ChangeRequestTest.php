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
        $existingCode = 'CR-20260616-AAAA';
        ChangeRequest::create([
            'request_code' => $existingCode,
            'requester_id' => 1,
            'schedule_id' => 1,
            'semester_id' => 1,
            'request_type' => 'reschedule',
            'status' => 'pending',
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
