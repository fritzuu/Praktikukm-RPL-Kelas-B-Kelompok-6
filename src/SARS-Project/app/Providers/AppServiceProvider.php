<?php

namespace App\Providers;

use Carbon\Carbon;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Carbon::getTranslator()->setMessages('en', ['first_day_of_week' => Carbon::SATURDAY]);
        Carbon::getTranslator()->setMessages('id', ['first_day_of_week' => Carbon::SATURDAY]);
    }
}
