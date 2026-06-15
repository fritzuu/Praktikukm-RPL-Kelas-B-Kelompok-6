<?php

namespace App\Models;

final class ApprovalDecision
{
    public const FORWARDED = 'FORWARDED';
    public const APPROVED = 'APPROVED';
    public const REJECTED_ASLAB = 'REJECTED_ASLAB';
    public const REJECTED_ADMIN = 'REJECTED_ADMIN';

    private function __construct() {}
}
