<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('teaching_assignments', function (Blueprint $table) {
            $table->index('user_id');
        });

        Schema::table('user_roles', function (Blueprint $table) {
            $table->index('role_id');
        });

        Schema::table('schedule_history', function (Blueprint $table) {
            $table->index('request_id');
            $table->index('schedule_id');
        });

        Schema::table('change_requests', function (Blueprint $table) {
            $table->index('proposed_room_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teaching_assignments', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
        });

        Schema::table('user_roles', function (Blueprint $table) {
            $table->dropIndex(['role_id']);
        });

        Schema::table('schedule_history', function (Blueprint $table) {
            $table->dropIndex(['request_id']);
            $table->dropIndex(['schedule_id']);
        });

        Schema::table('change_requests', function (Blueprint $table) {
            $table->dropIndex(['proposed_room_id']);
        });
    }
};
