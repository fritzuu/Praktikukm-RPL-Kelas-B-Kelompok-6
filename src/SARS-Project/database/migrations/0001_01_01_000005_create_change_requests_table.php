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
        Schema::create('change_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_code', 20)->unique();
            $table->foreignId('requester_id')->constrained('users');
            $table->foreignId('schedule_id')->constrained('schedules');
            $table->foreignId('semester_id')->constrained('semesters');
            $table->enum('request_type', ['TEMPORARY', 'PERMANENT']);
            $table->date('target_date')->nullable();
            $table->date('effective_from_date')->nullable();
            $table->enum('proposed_day', ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'])->nullable();
            $table->time('proposed_start_time')->nullable();
            $table->time('proposed_end_time')->nullable();
            $table->foreignId('proposed_room_id')->nullable()->constrained('rooms');
            $table->text('reason');
            $table->string('attachment_url', 500)->nullable();
            $table->enum('status', [
                'PENDING_ASLAB',
                'REJECTED_ASLAB',
                'PENDING_ADMIN',
                'APPROVED',
                'REJECTED_ADMIN',
                'CANCELLED',
            ])->default('PENDING_ASLAB');
            $table->boolean('conflict_checked')->default(false);
            $table->boolean('has_conflict')->default(false);
            $table->timestamps();

            $table->index(['requester_id', 'status']);
            $table->index(['semester_id', 'status']);
            $table->index('schedule_id');
        });

        Schema::create('approvals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_id')->constrained('change_requests')->cascadeOnDelete();
            $table->foreignId('actor_id')->constrained('users');
            $table->enum('stage', ['ASLAB_CHECK', 'ADMIN_DECISION']);
            $table->enum('decision', ['FORWARDED', 'APPROVED', 'REJECTED_ASLAB', 'REJECTED_ADMIN']);
            $table->text('notes')->nullable();
            $table->timestamp('decided_at')->useCurrent();

            $table->unique(['request_id', 'stage']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('approvals');
        Schema::dropIfExists('change_requests');
    }
};
