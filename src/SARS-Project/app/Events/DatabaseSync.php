<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DatabaseSync implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $table,
        public string $action,
        public array $data
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('database-sync'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'database.sync';
    }

    public function broadcastWith(): array
    {
        return [
            'table' => $this->table,
            'action' => $this->action,
            'data' => $this->data,
        ];
    }
}
