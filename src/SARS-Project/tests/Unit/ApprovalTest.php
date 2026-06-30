<?php

namespace Tests\Unit;

use App\Models\Approval;
use App\Models\ApprovalDecision;
use Tests\TestCase;

class ApprovalTest extends TestCase
{
    /**
     * TEST 1: Happy paths for setting allowed decisions.
     * ARRANGE: Create an Approval instance.
     * ACT: Set decision to allowed values.
     * ASSERT: Stored value should match expected enum string.
     */
    public function test_sets_allowed_decisions_correctly(): void
    {
        // ARRANGE
        $approval = new Approval();

        // ACT & ASSERT for APPROVED
        $approval->decision = ApprovalDecision::APPROVED;
        $this->assertEquals(ApprovalDecision::APPROVED, $approval->decision);

        // ACT & ASSERT for FORWARDED
        $approval->decision = ApprovalDecision::FORWARDED;
        $this->assertEquals(ApprovalDecision::FORWARDED, $approval->decision);

        // ACT & ASSERT for REJECTED_ASLAB
        $approval->decision = ApprovalDecision::REJECTED_ASLAB;
        $this->assertEquals(ApprovalDecision::REJECTED_ASLAB, $approval->decision);

        // ACT & ASSERT for REJECTED_ADMIN
        $approval->decision = ApprovalDecision::REJECTED_ADMIN;
        $this->assertEquals(ApprovalDecision::REJECTED_ADMIN, $approval->decision);
    }

    /**
     * TEST 2: Set decision to null.
     * ARRANGE: Create an Approval instance.
     * ACT: Set decision to null.
     * ASSERT: Stored value should be null.
     */
    public function test_sets_decision_to_null_correctly(): void
    {
        // ARRANGE
        $approval = new Approval();

        // ACT
        $approval->decision = null;

        // ASSERT
        $this->assertNull($approval->decision);
    }

    /**
     * TEST 3: Legacy mapping of REJECTED for ASLAB_CHECK stage.
     * ARRANGE: Create an Approval instance with stage set to ASLAB_CHECK.
     * ACT: Set decision to REJECTED.
     * ASSERT: Stored value should be REJECTED_ASLAB.
     */
    public function test_maps_legacy_rejected_decision_for_aslab_check_stage(): void
    {
        // ARRANGE
        $approval = new Approval();
        $approval->stage = 'ASLAB_CHECK';

        // ACT
        $approval->decision = 'REJECTED';

        // ASSERT
        $this->assertEquals(ApprovalDecision::REJECTED_ASLAB, $approval->decision);
    }

    /**
     * TEST 4: Legacy mapping of REJECTED for ADMIN_DECISION stage.
     * ARRANGE: Create an Approval instance with stage set to ADMIN_DECISION.
     * ACT: Set decision to REJECTED.
     * ASSERT: Stored value should be REJECTED_ADMIN.
     */
    public function test_maps_legacy_rejected_decision_for_admin_decision_stage(): void
    {
        // ARRANGE
        $approval = new Approval();
        $approval->stage = 'ADMIN_DECISION';

        // ACT
        $approval->decision = 'REJECTED';

        // ASSERT
        $this->assertEquals(ApprovalDecision::REJECTED_ADMIN, $approval->decision);
    }

    /**
     * TEST 5: Legacy mapping of REJECTED throws exception on unset stage.
     * ARRANGE: Create Approval instance without a stage.
     * ACT & ASSERT: Attempting to set decision to REJECTED throws InvalidArgumentException.
     */
    public function test_throws_exception_when_legacy_rejected_set_on_unset_stage(): void
    {
        // ARRANGE
        $approval = new Approval();
        // stage is unset (null)

        // ASSERT expectation
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Invalid approval stage for legacy decision REJECTED');

        // ACT
        $approval->decision = 'REJECTED';
    }

    /**
     * TEST 6: Legacy mapping of REJECTED throws exception on unsupported stage.
     * ARRANGE: Create Approval instance with an invalid stage.
     * ACT & ASSERT: Attempting to set decision to REJECTED throws InvalidArgumentException.
     */
    public function test_throws_exception_when_legacy_rejected_set_on_unsupported_stage(): void
    {
        // ARRANGE
        $approval = new Approval();
        $approval->stage = 'SOME_OTHER_STAGE';

        // ASSERT expectation
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Invalid approval stage for legacy decision REJECTED: SOME_OTHER_STAGE');

        // ACT
        $approval->decision = 'REJECTED';
    }

    /**
     * TEST 7: Setting an invalid decision string throws exception.
     * ARRANGE: Create Approval instance.
     * ACT & ASSERT: Set decision to unsupported string throws InvalidArgumentException.
     */
    public function test_throws_exception_for_invalid_decision_string(): void
    {
        // ARRANGE
        $approval = new Approval();

        // ASSERT expectation
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Invalid approval decision: INVALID_VALUE');

        // ACT
        $approval->decision = 'INVALID_VALUE';
    }

    /**
     * TEST 8: Case insensitivity and whitespace normalization.
     * ARRANGE: Create Approval instance with stage set to ASLAB_CHECK.
     * ACT: Set decision using lowercase and whitespace.
     * ASSERT: Stored values should be upper-cased and trimmed.
     */
    public function test_normalizes_case_and_whitespace(): void
    {
        // ARRANGE
        $approval = new Approval();
        $approval->stage = 'ASLAB_CHECK';

        // ACT 1 - Lowercase and whitespace for APPROVED
        $approval->decision = "   approved   ";
        // ASSERT 1
        $this->assertEquals(ApprovalDecision::APPROVED, $approval->decision);

        // ACT 2 - Lowercase and whitespace for legacy REJECTED
        $approval->decision = " \t rejected \n ";
        // ASSERT 2
        $this->assertEquals(ApprovalDecision::REJECTED_ASLAB, $approval->decision);
    }
}
