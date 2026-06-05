<?php

namespace App\Traits;

use App\Events\DatabaseSync;

trait BroadcastsChanges
{
    public static function bootBroadcastsChanges(): void
    {
        static::created(function ($model) {
            DatabaseSync::dispatch(
                $model->getTable(),
                'created',
                $model->toArray()
            );
        });

        static::updated(function ($model) {
            DatabaseSync::dispatch(
                $model->getTable(),
                'updated',
                $model->toArray()
            );
        });

        static::deleted(function ($model) {
            DatabaseSync::dispatch(
                $model->getTable(),
                'deleted',
                ['id' => $model->id]
            );
        });
    }
}
