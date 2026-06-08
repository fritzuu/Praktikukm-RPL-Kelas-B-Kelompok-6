<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Gemini API Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for Google Gemini AI integration used by the
    | AI Assistant feature across all roles.
    |
    */

    'gemini' => [
        'api_key'    => env('GEMINI_API_KEY'),
        'model'      => env('GEMINI_MODEL', 'gemini-2.5-flash'),
        'max_tokens' => (int) env('GEMINI_MAX_TOKENS', 2000),
        'temperature' => (float) env('GEMINI_TEMPERATURE', 0.5),
        'base_url'   => env('GEMINI_BASE_URL', 'https://generativelanguage.googleapis.com/v1beta'),
    ],

];
