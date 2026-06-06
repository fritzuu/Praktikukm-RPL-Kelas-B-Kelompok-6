<?php

namespace App\Services;

use App\Models\ChangeRequest;
use App\Models\Room;
use App\Models\Schedule;
use App\Models\Semester;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AiAssistantService
{
    private string $apiKey;
    private string $model;
    private string $baseUrl;
    private int    $maxTokens;
    private float  $temperature;

    public function __construct()
    {
        $this->apiKey      = config('ai.gemini.api_key', '');
        $this->model       = config('ai.gemini.model', 'gemini-2.5-flash');
        $this->baseUrl     = config('ai.gemini.base_url', 'https://generativelanguage.googleapis.com/v1beta');
        $this->maxTokens   = config('ai.gemini.max_tokens', 1024);
        $this->temperature = config('ai.gemini.temperature', 0.7);
    }

    /**
     * Check if Gemini AI is configured and available.
     */
    public function isAvailable(): bool
    {
        return !empty($this->apiKey);
    }

    /**
     * Stream an AI response for a mahasiswa query.
     *
     * Returns a StreamedResponse (SSE) when Gemini is available,
     * or null when it's not (caller should fall back to rule-based).
     */
    public function streamMahasiswaQuery(string $query, User $user, ?Semester $semester): ?StreamedResponse
    {
        if (!$this->isAvailable() || !$semester) {
            return null;
        }

        $systemPrompt = $this->buildMahasiswaSystemPrompt($user, $semester);
        $url = "{$this->baseUrl}/models/{$this->model}:streamGenerateContent?alt=sse";

        $body = [
            'systemInstruction' => [
                'parts' => [['text' => $systemPrompt]],
            ],
            'contents' => [
                [
                    'role'  => 'user',
                    'parts' => [['text' => $query]],
                ],
            ],
            'generationConfig' => [
                'temperature'    => $this->temperature,
                'maxOutputTokens' => $this->maxTokens,
                'topP'           => 0.95,
            ],
        ];

        return new StreamedResponse(function () use ($url, $body) {
            $ch = curl_init($url);

            curl_setopt_array($ch, [
                CURLOPT_POST           => true,
                CURLOPT_HTTPHEADER     => [
                    'Content-Type: application/json',
                    'x-goog-api-key: ' . $this->apiKey,
                ],
                CURLOPT_POSTFIELDS     => json_encode($body),
                CURLOPT_RETURNTRANSFER => false,
                CURLOPT_TIMEOUT        => 60,
                CURLOPT_CONNECTTIMEOUT => 10,
                CURLOPT_WRITEFUNCTION  => function ($ch, $data) {
                    echo $data;

                    if (ob_get_level() > 0) {
                        ob_flush();
                    }
                    flush();

                    return strlen($data);
                },
            ]);

            $result = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

            if ($result === false || $httpCode >= 400) {
                $error = curl_error($ch);
                Log::warning('Gemini API streaming failed', [
                    'http_code' => $httpCode,
                    'error'     => $error,
                ]);
            }

            curl_close($ch);
        }, 200, [
            'Content-Type'  => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection'    => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ]);
    }

    /**
     * Build the system prompt for mahasiswa role with real DB context.
     */
    private function buildMahasiswaSystemPrompt(User $user, Semester $semester): string
    {
        $scheduleContext = $this->gatherScheduleContext($semester);
        $requestContext  = $this->gatherRequestContext($user, $semester);
        $roomContext     = $this->gatherRoomContext($semester);

        $now = now()->translatedFormat('l, d F Y H:i');

        return <<<PROMPT
You are SARS AI Assistant — the Smart Academic Schedule & Room Change System assistant for the Informatics study program.

## Your Role
You help students (mahasiswa) with schedule-related questions. You are friendly, concise, and helpful. You respond in the same language the student uses (Bahasa Indonesia or English). You support Markdown formatting in your responses — use **bold**, lists, and tables when helpful.

## Current Context
- Current date/time: {$now}
- Active semester: {$semester->name}
- Student: {$user->name} ({$user->email})

## Schedule Data (Active Semester)
{$scheduleContext}

## Student's Change Requests
{$requestContext}

## Room Information
{$roomContext}

## System Information
- Request pipeline: Student submits → PENDING_ASLAB → Aslab validates → FORWARDED / REJECTED_ASLAB → Admin decides → APPROVED / REJECTED_ADMIN
- Request types: TEMPORARY (one specific date) or PERMANENT (rest of semester)
- To submit a request: go to the "Requests" page, click "Ajukan Request Baru"
- To check empty slots: go to the "Jadwal" page, use "Cek Slot Kosong" feature
- Minimum reason length for requests: 20 characters

## Rules
1. Only answer questions related to academic schedules, rooms, requests, and the SARS system.
2. If asked about something outside your scope (grades, attendance, etc.), politely say it's outside your capabilities.
3. Use the provided data to give accurate, specific answers — don't make up information.
4. When listing schedules, format them clearly with day, time, room, and lecturer.
5. Keep responses concise but complete.
PROMPT;
    }

    /**
     * Gather all active schedules for the current semester.
     */
    private function gatherScheduleContext(Semester $semester): string
    {
        $schedules = Schedule::with(['course', 'room', 'teachingAssignments.user'])
            ->where('semester_id', $semester->id)
            ->where('is_active', true)
            ->get();

        if ($schedules->isEmpty()) {
            return "No active schedules found for this semester.";
        }

        $lines = ["Total active schedules: {$schedules->count()}", ""];

        $grouped = $schedules->groupBy('day_of_week');
        $dayOrder = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];

        foreach ($dayOrder as $day) {
            if (!$grouped->has($day)) continue;

            $lines[] = "### {$day}";
            foreach ($grouped[$day] as $s) {
                $lecturer = $s->teachingAssignments
                    ->where('role_in_class', 'PENGAJAR')
                    ->first()?->user?->name ?? '-';
                $start = substr($s->start_time, 0, 5);
                $end   = substr($s->end_time, 0, 5);
                $semesterNum = preg_replace('/[^0-9]/', '', $s->course->description);
                $semesterLabel = $semesterNum ? " (Semester {$semesterNum})" : '';
                $lines[] = "- {$s->course->code} {$s->course->name} (Kelas {$s->course->class_name}{$semesterLabel}) | {$start}-{$end} | Room: {$s->room->code} | Dosen: {$lecturer}";
            }
            $lines[] = "";
        }

        return implode("\n", $lines);
    }

    /**
     * Gather the student's own change requests.
     */
    private function gatherRequestContext(User $user, Semester $semester): string
    {
        $requests = ChangeRequest::with(['schedule.course', 'schedule.room', 'proposedRoom'])
            ->where('requester_id', $user->id)
            ->where('semester_id', $semester->id)
            ->latest()
            ->take(10)
            ->get();

        if ($requests->isEmpty()) {
            return "This student has no change requests this semester.";
        }

        $lines = ["Total requests this semester: {$requests->count()}", ""];

        foreach ($requests as $req) {
            $course = $req->schedule?->course;
            $lines[] = "- [{$req->request_code}] {$course?->name} ({$course?->class_name}) | Type: {$req->request_type} | Status: **{$req->status}** | Reason: {$req->reason}";
        }

        return implode("\n", $lines);
    }

    /**
     * Gather room information with occupancy summary.
     */
    private function gatherRoomContext(Semester $semester): string
    {
        $rooms = Room::where('is_active', true)->orderBy('code')->get();

        if ($rooms->isEmpty()) {
            return "No active rooms found.";
        }

        $lines = ["Total active rooms: {$rooms->count()}", ""];

        foreach ($rooms as $room) {
            $scheduleCount = Schedule::where('semester_id', $semester->id)
                ->where('is_active', true)
                ->where('room_id', $room->id)
                ->count();

            $lines[] = "- {$room->code} ({$room->name}) | Building: {$room->building} | Capacity: {$room->capacity} | Scheduled classes: {$scheduleCount}";
        }

        return implode("\n", $lines);
    }

    /**
     * Rule-based fallback for when Gemini is unavailable.
     * Mirrors the original processAiQuery logic from MahasiswaController.
     */
    public function fallbackResponse(string $query, ?Semester $semester): string
    {
        if (!$semester) {
            return 'Maaf, tidak ada semester aktif saat ini. Silakan hubungi admin.';
        }

        $query = strtolower($query);

        if (str_contains($query, 'jadwal') || str_contains($query, 'schedule')) {
            $count = Schedule::where('semester_id', $semester->id)->where('is_active', true)->count();
            return "Pada semester {$semester->name}, terdapat {$count} jadwal aktif. Kamu bisa melihat detailnya di halaman Jadwal.";
        }

        if (str_contains($query, 'slot') || str_contains($query, 'kosong') || str_contains($query, 'ruang')) {
            $roomCount = Room::where('is_active', true)->count();
            return "Saat ini terdapat {$roomCount} ruangan aktif. Gunakan fitur 'Cek Slot Kosong' di halaman Jadwal untuk melihat ketersediaan berdasarkan hari dan waktu.";
        }

        if (str_contains($query, 'request') || str_contains($query, 'pengajuan') || str_contains($query, 'ajukan')) {
            return "Untuk mengajukan perubahan jadwal, buka halaman 'Requests' dan klik 'Ajukan Request Baru'. Kamu bisa memilih tipe Temporary (1x tanggal) atau Permanent (sisa semester).";
        }

        if (str_contains($query, 'status') || str_contains($query, 'tracking')) {
            return "Status request mengikuti pipeline: PENDING_ASLAB → FORWARDED → APPROVED/REJECTED. Kamu bisa memantau semua status di halaman 'Requests'.";
        }

        if (str_contains($query, 'notifikasi') || str_contains($query, 'notification')) {
            return "Notifikasi akan dikirim otomatis saat ada perubahan status request atau perubahan jadwal. Kamu bisa melihat semua notifikasi di halaman 'Notifikasi'.";
        }

        return "Halo! Saya adalah AI Assistant SARS. Saya bisa membantu kamu dengan informasi tentang jadwal, slot kosong, pengajuan request, dan notifikasi. Silakan tanyakan sesuatu yang spesifik!";
    }
}
