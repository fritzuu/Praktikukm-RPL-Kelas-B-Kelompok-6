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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->foreignId('request_id')->nullable()->constrained('change_requests')->cascadeOnDelete();
            $table->foreignId('triggered_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title', 200)->nullable();
            $table->text('message')->nullable();
            $table->text('body')->nullable();
            $table->enum('type', ['success', 'warning', 'info', 'error', 'STATUS_CHANGE', 'CONFLICT_ALERT', 'SYSTEM', 'REMINDER'])->default('info');
            $table->string('category', 50)->nullable();
            $table->string('action_url')->nullable();
            $table->json('data_payload')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'read_at']);
            $table->index(['request_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
