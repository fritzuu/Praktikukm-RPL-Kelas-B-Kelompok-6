<?php

namespace App\Services;

use App\Models\ChangeRequest;
use App\Models\Room;
use App\Models\Schedule;
use App\Models\Semester;
use App\Models\TeachingAssignment;
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
        $this->maxTokens   = config('ai.gemini.max_tokens', 8192);
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
        $schedules = Schedule::with(['course', 'room', 'teachingAssignments.user'])
            ->where('semester_id', $semester->id)
            ->where('is_active', true)
            ->get();

        $scheduleContext = $this->gatherScheduleContext($schedules);
        $requestContext  = $this->gatherRequestContext($user, $semester);
        $roomContext     = $this->gatherRoomContext($semester, $schedules);

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
    private function gatherScheduleContext(\Illuminate\Database\Eloquent\Collection $schedules): string
    {

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
    private function gatherRoomContext(Semester $semester, \Illuminate\Database\Eloquent\Collection $schedules): string
    {
        $rooms = Room::where('is_active', true)->orderBy('code')->get();

        if ($rooms->isEmpty()) {
            return "No active rooms found.";
        }

        $lines = ["Total active rooms: {$rooms->count()}", ""];

        foreach ($rooms as $room) {
            $scheduleCount = $schedules->where('room_id', $room->id)->count();

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

    /**
     * Stream an AI response for an admin query.
     *
     * Returns a StreamedResponse (SSE) when Gemini is available,
     * or null when it's not (caller should fall back to rule-based).
     */
    public function streamAdminQuery(string $query, User $user, ?Semester $semester): ?StreamedResponse
    {
        if (!$this->isAvailable() || !$semester) {
            return null;
        }

        $systemPrompt = $this->buildAdminSystemPrompt($user, $semester);
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
                Log::warning('Gemini API streaming failed for Admin', [
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
     * Build the system prompt for admin role with real DB context.
     */
    private function buildAdminSystemPrompt(User $user, Semester $semester): string
    {
        $schedules = Schedule::with(['course', 'room', 'teachingAssignments.user'])
            ->where('semester_id', $semester->id)
            ->where('is_active', true)
            ->get();

        $scheduleContext = $this->gatherScheduleContext($schedules);
        $requestContext  = $this->gatherAdminRequestContext($semester);
        $roomContext     = $this->gatherRoomContext($semester, $schedules);
        $conflictContext = $this->gatherConflictContext($schedules);

        $now = now()->translatedFormat('l, d F Y H:i');

        return <<<PROMPT
You are SARS AI Assistant — the Smart Academic Schedule & Room Change System assistant for the Informatics study program.

## Your Role
You are in ADMIN mode. You help administrators manage the academic schedule system. You are analytical, precise, and provide data-driven insights. You respond in the same language the user uses (Bahasa Indonesia or English). You support Markdown formatting in your responses — use **bold**, lists, and tables when helpful.

## Current Context
- Current date/time: {$now}
- Active semester: {$semester->name}
- Admin: {$user->name} ({$user->email})

## Schedule Data (Active Semester)
{$scheduleContext}

## Change Requests Summary
{$requestContext}

## Room Information
{$roomContext}

## Conflict Analysis
{$conflictContext}

## System Information
- Request pipeline: Mahasiswa → PENDING_ASLAB → Aslab validates → FORWARDED / REJECTED_ASLAB → Admin decides → APPROVED / REJECTED_ADMIN
- Request types: TEMPORARY (one specific date) or PERMANENT (rest of semester)
- You can approve or reject requests from the Persetujuan page
- You can view all schedules and make manual changes from the Jadwal page
- You can import schedules from CSV files
- You can view statistics and conflict reports

## Rules
1. Only answer questions related to system administration, schedules, rooms, requests, conflicts, and statistics.
2. If asked about something outside your scope, politely say it's outside your capabilities.
3. Use the provided data to give accurate, analytical insights.
4. When analyzing conflicts, provide specific details about affected schedules, rooms, and time slots.
5. For statistics, provide clear numbers and percentages when possible.
6. Keep responses concise but informative.
PROMPT;
    }

    /**
     * Gather all change requests for admin overview.
     */
    private function gatherAdminRequestContext(Semester $semester): string
    {
        $pendingCount = ChangeRequest::where('semester_id', $semester->id)
            ->whereIn('status', ['PENDING_ASLAB', 'PENDING_ADMIN'])->count();
        
        $approvedCount = ChangeRequest::where('semester_id', $semester->id)
            ->where('status', 'APPROVED')->count();
        
        $rejectedCount = ChangeRequest::where('semester_id', $semester->id)
            ->whereIn('status', ['REJECTED_ASLAB', 'REJECTED_ADMIN'])->count();

        $recentRequests = ChangeRequest::with(['schedule.course', 'schedule.room', 'proposedRoom', 'requester'])
            ->where('semester_id', $semester->id)
            ->latest()
            ->take(10)
            ->get();

        $lines = [
            "Total requests this semester: " . ($pendingCount + $approvedCount + $rejectedCount),
            "- Pending: {$pendingCount} | Approved: {$approvedCount} | Rejected: {$rejectedCount}",
            "",
        ];

        if ($recentRequests->isNotEmpty()) {
            $lines[] = "### Recent Requests (last 10):";
            foreach ($recentRequests as $req) {
                $course = $req->schedule?->course;
                $requester = $req->requester?->name ?? 'Unknown';
                $lines[] = "- [{$req->request_code}] {$course?->name} ({$course?->class_name}) | Requester: {$requester} | Type: {$req->request_type} | Status: **{$req->status}** | Reason: {$req->reason}";
            }
        } else {
            $lines[] = "No requests found for this semester.";
        }

        return implode("\n", $lines);
    }

    /**
     * Gather conflict information for admin.
     */
    private function gatherConflictContext(\Illuminate\Database\Eloquent\Collection $schedules): string
    {

        if ($schedules->isEmpty()) {
            return "No active schedules to analyze for conflicts.";
        }

        $lines = [];
        $roomSchedules = [];

        foreach ($schedules as $schedule) {
            $roomCode = $schedule->room?->code ?? 'Unknown';
            $day = $schedule->day_of_week;
            
            $roomSchedules[$roomCode][$day][] = $schedule;
        }

        $conflictCount = 0;
        $conflictDetails = [];

        foreach ($roomSchedules as $room => $days) {
            foreach ($days as $day => $slots) {
                if (count($slots) > 1) {
                    for ($i = 0; $i < count($slots); $i++) {
                        for ($j = $i + 1; $j < count($slots); $j++) {
                            if ($this->timeRangesOverlap($slots[$i]->start_time, $slots[$i]->end_time, $slots[$j]->start_time, $slots[$j]->end_time)) {
                                $conflictCount++;
                                $course1 = $slots[$i]->course?->code . ' ' . $slots[$i]->course?->name;
                                $course2 = $slots[$j]->course?->code . ' ' . $slots[$j]->course?->name;
                                $time1 = substr($slots[$i]->start_time, 0, 5) . '-' . substr($slots[$i]->end_time, 0, 5);
                                $time2 = substr($slots[$j]->start_time, 0, 5) . '-' . substr($slots[$j]->end_time, 0, 5);
                                $conflictDetails[] = "- Room {$room} on {$day}: {$course1} ({$time1}) overlaps with {$course2} ({$time2})";
                            }
                        }
                    }
                }
            }
        }

        $lines[] = "Total potential room conflicts detected: {$conflictCount}";
        $lines[] = "";

        if ($conflictCount > 0) {
            $lines[] = "### Conflicts by Room:";
            foreach ($conflictDetails as $detail) {
                $lines[] = $detail;
            }
        } else {
            $lines[] = "No active conflicts detected in the current schedule.";
        }

        return implode("\n", $lines);
    }

    /**
     * Rule-based fallback for admin when Gemini is unavailable.
     */
    public function fallbackAdminResponse(string $query, ?Semester $semester): string
    {
        if (!$semester) {
            return 'Maaf, tidak ada semester aktif saat ini. Silakan hubungi admin.';
        }

        $query = strtolower($query);

        if (str_contains($query, 'konflik') || str_contains($query, 'conflict')) {
            $conflicts = $this->countConflicts($semester);
            return "Terdapat {$conflicts} potensi konflik jadwal di semester {$semester->name}. Gunakan halaman Jadwal untuk melihat detail dan menyelesaikannya.";
        }

        if (str_contains($query, 'statistik') || str_contains($query, 'statistics') || str_contains($query, 'stat')) {
            $totalRequests = ChangeRequest::where('semester_id', $semester->id)->count();
            $pending = ChangeRequest::where('semester_id', $semester->id)->whereIn('status', ['PENDING_ASLAB', 'PENDING_ADMIN'])->count();
            return "Statistik semester {$semester->name}: Total Request: {$totalRequests}, Pending: {$pending}. Lihat halaman Statistik untuk detail lengkap.";
        }

        if (str_contains($query, 'request') || str_contains($query, 'pengajuan') || str_contains($query, 'ajukan')) {
            $pending = ChangeRequest::where('semester_id', $semester->id)->whereIn('status', ['PENDING_ASLAB', 'PENDING_ADMIN'])->count();
            return "Terdapat {$pending} request yang menunggu persetujuan. Buka halaman Persetujuan untuk memprosesnya.";
        }

        if (str_contains($query, 'jadwal') || str_contains($query, 'schedule')) {
            $count = Schedule::where('semester_id', $semester->id)->where('is_active', true)->count();
            return "Pada semester {$semester->name}, terdapat {$count} jadwal aktif. Gunakan halaman Jadwal untuk mengelola atau mengimport jadwal baru.";
        }

        if (str_contains($query, 'ruang') || str_contains($query, 'room') || str_contains($query, 'slot')) {
            $roomCount = Room::where('is_active', true)->count();
            return "Sistem memiliki {$roomCount} ruangan aktif. Lihat halaman Jadwal untuk informasi utilizasi ruangan.";
        }

        if (str_contains($query, 'import') || str_contains($query, 'csv')) {
            return "Anda dapat mengimport jadwal dari file CSV melalui halaman Jadwal. Pastikan format file sesuai dengan template yang disediakan.";
        }

        return "Halo Admin! Saya adalah AI Assistant SARS. Saya bisa membantu dengan analisis konflik, statistik request, manajemen jadwal, dan informasi ruangan. Silakan tanyakan sesuatu yang spesifik!";
    }

    /**
     * Count conflicts for fallback response.
     */
    private function countConflicts(Semester $semester): int
    {
        $schedules = Schedule::with(['room'])
            ->where('semester_id', $semester->id)
            ->where('is_active', true)
            ->get();

        $roomSchedules = [];
        foreach ($schedules as $schedule) {
            $roomCode = $schedule->room?->code ?? 'Unknown';
            $day = $schedule->day_of_week;
            $start = $schedule->start_time;
            $end = $schedule->end_time;
            
            if (!isset($roomSchedules[$roomCode][$day])) {
                $roomSchedules[$roomCode][$day] = [];
            }
            $roomSchedules[$roomCode][$day][] = ['start' => $start, 'end' => $end, 'id' => $schedule->id];
        }

        $conflicts = 0;
        foreach ($roomSchedules as $room => $days) {
            foreach ($days as $day => $slots) {
                if (count($slots) > 1) {
                    for ($i = 0; $i < count($slots); $i++) {
                        for ($j = $i + 1; $j < count($slots); $j++) {
                            if ($this->timeRangesOverlap($slots[$i]['start'], $slots[$i]['end'], $slots[$j]['start'], $slots[$j]['end'])) {
                                $conflicts++;
                            }
                        }
                    }
                }
            }
        }

        return $conflicts;
    }

    /**
     * Check if two time ranges overlap.
     */
    private function timeRangesOverlap(string $start1, string $end1, string $start2, string $end2): bool
    {
        return $start1 < $end2 && $end1 > $start2;
    }

    /**
     * Stream an AI response for a dosen query.
     */
    public function streamDosenQuery(string $query, User $user, ?Semester $semester): ?StreamedResponse
    {
        if (!$this->isAvailable() || !$semester) {
            return null;
        }

        $systemPrompt = $this->buildDosenSystemPrompt($user, $semester);
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
                Log::warning('Gemini API streaming failed for Dosen', [
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
     * Build the system prompt for dosen role with real DB context.
     */
    private function buildDosenSystemPrompt(User $user, Semester $semester): string
    {
        $schedules = Schedule::with(['course', 'room', 'teachingAssignments.user'])
            ->where('semester_id', $semester->id)
            ->where('is_active', true)
            ->get();

        $scheduleContext = $this->gatherScheduleContext($schedules);
        $requestContext  = $this->gatherDosenRequestContext($user, $semester);
        $roomContext     = $this->gatherRoomContext($semester, $schedules);

        $now = now()->translatedFormat('l, d F Y H:i');

        return <<<PROMPT
You are SARS AI Assistant — the Smart Academic Schedule & Room Change System assistant for the Informatics study program.

## Your Role
You help lecturers (dosen) with academic schedules and change requests. You must maintain a professional, respectful, and helpful tone (e.g., address them politely with "Bapak/Ibu Dosen" or "Bapak/Ibu [Nama Dosen]"). You respond in the same language the lecturer uses (Bahasa Indonesia or English). You support Markdown formatting in your responses — use **bold**, lists, and tables when helpful.

## Current Context
- Current date/time: {$now}
- Active semester: {$semester->name}
- Lecturer: {$user->name} ({$user->email})

## Schedule Data (All Active Schedules in Semester)
{$scheduleContext}

## Change Requests Affecting Your Courses (Lecturer's Courses Only)
{$requestContext}

## Room Information
{$roomContext}

## System Information
- Request pipeline: Student submits request → PENDING_ASLAB → Lab Assistant validates and forwards/rejects → FORWARDED / REJECTED_ASLAB → Admin decides → APPROVED / REJECTED_ADMIN.
- Request types: TEMPORARY (for a single date) or PERMANENT (applies to the rest of the semester).
- While change requests are initiated by students, lecturers can view the status of requests impacting their classes.
- To request a change or check schedule adjustments, refer them to the "Jadwal" and "Requests" pages on their dashboard.

## Rules
1. Only answer questions related to academic schedules, rooms, change requests, and the SARS system.
2. If asked about something outside your scope, politely say it's outside your capabilities.
3. Use the provided data to give accurate, specific answers — don't make up information.
4. When listing schedules or requests, format them clearly with day, time, room, and details.
5. Keep responses concise, helpful, and professional.
PROMPT;
    }

    /**
     * Gather change requests affecting Dosen's courses.
     */
    private function gatherDosenRequestContext(User $user, Semester $semester): string
    {
        $assignedScheduleIds = TeachingAssignment::where('user_id', $user->id)
            ->where('role_in_class', 'PENGAJAR')
            ->pluck('schedule_id');

        if ($assignedScheduleIds->isEmpty()) {
            return "You are not assigned to any teaching schedules this semester.";
        }

        // Optimize counts querying into a single database call (group by and aggregate)
        $statusCounts = ChangeRequest::whereIn('schedule_id', $assignedScheduleIds)
            ->where('semester_id', $semester->id)
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $pendingCount = ($statusCounts['PENDING_ASLAB'] ?? 0) + ($statusCounts['PENDING_ADMIN'] ?? 0);
        $approvedCount = $statusCounts['APPROVED'] ?? 0;
        $rejectedCount = ($statusCounts['REJECTED_ASLAB'] ?? 0) + ($statusCounts['REJECTED_ADMIN'] ?? 0);

        $recentRequests = ChangeRequest::with(['schedule.course', 'schedule.room', 'proposedRoom', 'requester'])
            ->whereIn('schedule_id', $assignedScheduleIds)
            ->where('semester_id', $semester->id)
            ->latest()
            ->take(10)
            ->get();

        $lines = [
            "Change requests affecting your classes:",
            "- Pending Validation: {$pendingCount} | Approved: {$approvedCount} | Rejected: {$rejectedCount}",
            "",
        ];

        if ($recentRequests->isNotEmpty()) {
            $lines[] = "### Recent Requests (last 10):";
            foreach ($recentRequests as $req) {
                $course = $req->schedule?->course;
                $requester = $req->requester?->name ?? 'Unknown';
                $lines[] = "- [{$req->request_code}] {$course?->name} ({$course?->class_name}) | Requester: {$requester} | Type: {$req->request_type} | Status: **{$req->status}** | Reason: {$req->reason}";
            }
        } else {
            $lines[] = "No change requests found affecting your classes this semester.";
        }

        return implode("\n", $lines);
    }

    /**
     * Rule-based fallback for dosen when Gemini is unavailable.
     */
    public function fallbackDosenResponse(string $query, ?Semester $semester, User $user): string
    {
        if (!$semester) {
            return 'Maaf Bapak/Ibu, tidak ada semester aktif saat ini. Silakan hubungi admin.';
        }

        $query = strtolower($query);

        $assignedScheduleIds = TeachingAssignment::where('user_id', $user->id)
            ->where('role_in_class', 'PENGAJAR')
            ->pluck('schedule_id');

        if (str_contains($query, 'jadwal') || str_contains($query, 'schedule') || str_contains($query, 'mengajar')) {
            $myScheduleCount = Schedule::whereIn('id', $assignedScheduleIds)
                ->where('semester_id', $semester->id)
                ->where('is_active', true)
                ->count();
            return "Bapak/Ibu, pada semester {$semester->name}, Anda memiliki {$myScheduleCount} jadwal mengajar aktif yang terdaftar di sistem. Anda dapat melihat rincian lengkapnya di halaman dashboard atau menu Jadwal.";
        }

        if (str_contains($query, 'request') || str_contains($query, 'pengajuan') || str_contains($query, 'perubahan') || str_contains($query, 'ubah')) {
            if ($assignedScheduleIds->isEmpty()) {
                return "Bapak/Ibu, tidak ada pengajuan perubahan kelas saat ini karena Anda belum terdaftar di kelas manapun.";
            }
            $pending = ChangeRequest::whereIn('schedule_id', $assignedScheduleIds)
                ->where('semester_id', $semester->id)
                ->whereIn('status', ['PENDING_ASLAB', 'PENDING_ADMIN'])
                ->count();
            return "Bapak/Ibu, terdapat {$pending} pengajuan perubahan jadwal untuk kelas Anda yang saat ini sedang dalam proses review/persetujuan. Anda dapat melihat status pengajuan ini di menu Jadwal.";
        }

        if (str_contains($query, 'ruang') || str_contains($query, 'room') || str_contains($query, 'slot')) {
            $roomCount = Room::where('is_active', true)->count();
            return "Sistem memiliki {$roomCount} ruangan aktif yang dapat digunakan. Silakan cek menu Jadwal untuk melihat ketersediaan slot ruangan secara lengkap.";
        }

        return "Selamat siang Bapak/Ibu {$user->name}. Saya adalah AI Assistant SARS. Saya siap membantu Bapak/Ibu untuk memeriksa jadwal mengajar, ketersediaan ruangan/slot kosong, serta status pengajuan perubahan kelas yang mempengaruhi mata kuliah Anda. Silakan tanyakan hal yang ingin diketahui!";
    }
}
