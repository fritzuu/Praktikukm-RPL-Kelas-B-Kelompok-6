<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Update all existing request codes from 'CR-' prefix to 'REQ-' prefix
     */
    public function up(): void
    {
        DB::table('change_requests')
            ->where('request_code', 'LIKE', 'CR-%')
            ->update([
                'request_code' => DB::raw("REPLACE(request_code, 'CR-', 'REQ-')")
            ]);
    }

    /**
     * Reverse the migrations.
     * Revert request codes from 'REQ-' prefix back to 'CR-' prefix
     */
    public function down(): void
    {
        DB::table('change_requests')
            ->where('request_code', 'LIKE', 'REQ-%')
            ->update([
                'request_code' => DB::raw("REPLACE(request_code, 'REQ-', 'CR-')")
            ]);
    }
};
