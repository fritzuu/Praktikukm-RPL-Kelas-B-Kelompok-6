<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('schedule_overrides', function (Blueprint $table) {
            $table->id();
            $table->foreignId('schedule_id')->constrained('schedules');
            $table->foreignId('request_id')->unique()->constrained('change_requests');
            $table->foreignId('room_id')->constrained('rooms');
            $table->date('override_date');
            $table->enum('new_day_of_week', ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'])->nullable();
            $table->time('new_start_time');
            $table->time('new_end_time');
            $table->boolean('is_active')->default(true);
            $table->timestamp('created_at')->useCurrent();

            $table->index(['override_date', 'room_id']);
        });

        Schema::create('schedule_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('schedule_id')->constrained('schedules');
            $table->foreignId('request_id')->constrained('change_requests');
            $table->foreignId('changed_by')->constrained('users');
            $table->json('snapshot_data');
            $table->text('change_reason');
            $table->timestamp('changed_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedule_history');
        Schema::dropIfExists('schedule_overrides');
    }
};
