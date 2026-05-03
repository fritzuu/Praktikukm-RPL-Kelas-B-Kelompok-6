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
            $table->foreignId('request_id')->nullable()->constrained('change_requests');
            $table->foreignId('triggered_by')->nullable()->constrained('users');
            $table->enum('type', ['STATUS_CHANGE', 'CONFLICT_ALERT', 'SYSTEM', 'REMINDER']);
            $table->string('title', 200);
            $table->text('body');
            $table->json('data_payload')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('notification_recipients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('notification_id')->constrained('notifications')->cascadeOnDelete();
            $table->foreignId('recipient_id')->constrained('users')->cascadeOnDelete();
            $table->enum('channel', ['PUSH', 'EMAIL', 'IN_APP']);
            $table->boolean('is_sent')->default(false);
            $table->timestamp('sent_at')->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();

            $table->index(['recipient_id', 'is_read']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_recipients');
        Schema::dropIfExists('notifications');
    }
};
