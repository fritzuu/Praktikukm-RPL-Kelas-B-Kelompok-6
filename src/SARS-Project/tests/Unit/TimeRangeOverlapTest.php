<?php

namespace Tests\Unit;

use App\Services\AiAssistantService;
use Tests\TestCase;

class TimeRangeOverlapTest extends TestCase
{
    private AiAssistantService $service;

    /**
     * SETUP: Initialize service before each test
     */
    public function setUp(): void
    {
        parent::setUp();
        $this->service = new AiAssistantService();
    }

    /**
     * TEST 1: Basic overlap detection
     * ARRANGE: Two time ranges with clear overlap
     * ACT: Call timeRangesOverlap() with overlapping times
     * ASSERT: Should return true
     */
    public function test_returns_true_when_time_ranges_overlap(): void
    {
        // ARRANGE
        $start1 = '09:00';
        $end1 = '11:00';
        $start2 = '10:00';
        $end2 = '12:00';

        // ACT
        // Access private method via reflection for testing
        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('timeRangesOverlap');
        $method->setAccessible(true);

        $result = $method->invoke($this->service, $start1, $end1, $start2, $end2);

        // ASSERT
        $this->assertTrue($result, 'Should detect overlapping time ranges');
    }

    /**
     * TEST 2: No overlap detection
     * ARRANGE: Two completely separate time ranges
     * ACT: Call with non-overlapping times
     * ASSERT: Should return false
     */
    public function test_returns_false_when_time_ranges_dont_overlap(): void
    {
        // ARRANGE
        $start1 = '09:00';
        $end1 = '11:00';
        $start2 = '13:00';
        $end2 = '15:00';

        // ACT
        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('timeRangesOverlap');
        $method->setAccessible(true);

        $result = $method->invoke($this->service, $start1, $end1, $start2, $end2);

        // ASSERT
        $this->assertFalse($result, 'Should return false for non-overlapping ranges');
    }

    /**
     * TEST 3: Edge case - adjacent times (no overlap)
     * ARRANGE: One range ends exactly when other starts
     * ACT: Call with adjacent times
     * ASSERT: Should return false (no overlap)
     */
    public function test_handles_adjacent_time_boundaries_no_overlap(): void
    {
        // ARRANGE
        $start1 = '09:00';
        $end1 = '11:00';
        $start2 = '11:00'; // Exactly when first ends
        $end2 = '13:00';

        // ACT
        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('timeRangesOverlap');
        $method->setAccessible(true);

        $result = $method->invoke($this->service, $start1, $end1, $start2, $end2);

        // ASSERT
        // At exactly equal times, most implementations return false (no overlap)
        $this->assertFalse($result, 'Adjacent times should not overlap');
    }

    /**
     * TEST 4: Edge case - fully overlapping range
     * ARRANGE: Second range completely contains first
     * ACT: Call with fully nested ranges
     * ASSERT: Should return true
     */
    public function test_detects_when_second_range_fully_contains_first(): void
    {
        // ARRANGE
        $start1 = '10:00';
        $end1 = '11:00';
        $start2 = '09:00'; // Starts before
        $end2 = '12:00'; // Ends after

        // ACT
        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('timeRangesOverlap');
        $method->setAccessible(true);

        $result = $method->invoke($this->service, $start1, $end1, $start2, $end2);

        // ASSERT
        $this->assertTrue($result, 'Should detect full containment overlap');
    }

    /**
     * TEST 5: Edge case - identical ranges
     * ARRANGE: Both ranges exactly the same
     * ACT: Call with identical times
     * ASSERT: Should return true
     */
    public function test_detects_identical_time_ranges(): void
    {
        // ARRANGE
        $start1 = '10:00';
        $end1 = '11:00';
        $start2 = '10:00';
        $end2 = '11:00';

        // ACT
        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('timeRangesOverlap');
        $method->setAccessible(true);

        $result = $method->invoke($this->service, $start1, $end1, $start2, $end2);

        // ASSERT
        $this->assertTrue($result, 'Identical ranges should overlap');
    }
}
