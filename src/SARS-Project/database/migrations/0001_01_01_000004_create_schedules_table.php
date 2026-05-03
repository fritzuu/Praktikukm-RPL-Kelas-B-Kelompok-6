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
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses');
            $table->foreignId('room_id')->constrained('rooms');
            $table->foreignId('semester_id')->constrained('semesters');
            $table->enum('day_of_week', ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU']);
            $table->time('start_time');
            $table->time('end_time');
            $table->date('effective_from');
            $table->date('effective_until')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['semester_id', 'day_of_week']);
            $table->index(['room_id', 'day_of_week', 'start_time']);
        });

        Schema::create('teaching_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('schedule_id')->constrained('schedules')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('role_in_class', ['PENGAJAR', 'ASISTEN'])->default('PENGAJAR');
            $table->timestamp('assigned_at')->useCurrent();

            $table->unique(['schedule_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teaching_assignments');
        Schema::dropIfExists('schedules');
    }
};
