<?php

use App\Models\Course;
use App\Models\Room;
use App\Models\Schedule;
use App\Models\Semester;
use App\Models\User;
use App\Models\Role;
use App\Models\ChangeRequest;
use App\Models\Notification;
use App\Models\NotificationRecipient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

uses(RefreshDatabase::class);

beforeEach(function () {
    config(['inertia.testing.ensure_pages_exist' => false]);

    // Register custom SQLite functions to emulate PostgreSQL syntax in unit tests
    if (DB::connection()->getDriverName() === 'sqlite') {
        $pdo = DB::connection()->getPdo();
        
        $pdo->sqliteCreateFunction('REGEXP_REPLACE', function ($string, $pattern, $replacement, $flags = '') {
            if ($string === null) return null;
            $pattern = '/' . str_replace('/', '\/', $pattern) . '/' . (str_contains($flags, 'i') ? 'i' : '');
            return preg_replace($pattern, $replacement, $string);
        });

        // Register STRING_AGG as an aggregate function in SQLite
        $pdo->sqliteCreateAggregate(
            'STRING_AGG',
            function (&$context, $value, $delimiter) {
                if ($context === null) {
                    $context = [];
                }
                if ($value !== null) {
                    $context[] = $value;
                }
                return $context;
            },
            function (&$context) {
                if (empty($context)) {
                    return null;
                }
                $unique = array_unique($context);
                sort($unique);
                return implode(' & ', $unique);
            }
        );
    }
});

it('allows aslab to view the dashboard even with null timestamps on requests and notifications', function () {
    $semester = Semester::create([
        'name' => 'Semester Ganjil 2026',
        'academic_year' => '2026/2027',
        'term' => 'GANJIL',
        'start_date' => Carbon::today()->format('Y-m-d'),
        'end_date' => Carbon::today()->addMonths(6)->format('Y-m-d'),
        'is_active' => true,
    ]);

    $aslabRole = Role::create([
        'name' => 'Aslab',
        'slug' => 'aslab',
    ]);

    $mahasiswaRole = Role::create([
        'name' => 'Mahasiswa',
        'slug' => 'mahasiswa',
    ]);

    $aslab = User::create([
        'name' => 'Faris Aslab',
        'email' => 'faris.aslab@sars.test',
        'password' => bcrypt('password'),
        'nim_nip' => 'ASLAB_FARIS',
    ]);
    $aslab->roles()->attach($aslabRole->id, ['assigned_at' => now(), 'assigned_by' => 1]);

    $student = User::create([
        'name' => 'Andi Mahasiswa',
        'email' => 'andi@student.sars.test',
        'password' => bcrypt('password'),
        'nim_nip' => 'MHS_ANDI',
    ]);
    $student->roles()->attach($mahasiswaRole->id, ['assigned_at' => now(), 'assigned_by' => 1]);

    $room = Room::create([
        'name' => 'Lab Komputer 1',
        'code' => 'LAB-KOM-1',
        'capacity' => 30,
        'building' => 'Gedung B',
        'type' => 'LABORATORIUM',
        'is_active' => true,
    ]);

    $course = Course::create([
        'semester_id' => $semester->id,
        'code' => 'MK-PWEB',
        'name' => 'Pemrograman Web',
        'class_name' => 'A',
        'credits' => 3,
        'description' => 'Semester 4',
    ]);

    $schedule = Schedule::create([
        'course_id' => $course->id,
        'room_id' => $room->id,
        'semester_id' => $semester->id,
        'day_of_week' => 'SENIN',
        'start_time' => '07:30:00',
        'end_time' => '10:10:00',
        'session_start' => 1,
        'session_duration' => 3,
        'effective_from' => Carbon::today()->format('Y-m-d'),
        'is_active' => true,
    ]);

    $changeRequest = ChangeRequest::create([
        'request_code' => 'CR-TEST-9999',
        'requester_id' => $student->id,
        'schedule_id' => $schedule->id,
        'semester_id' => $semester->id,
        'request_type' => 'TEMPORARY',
        'target_date' => Carbon::today()->addDay()->format('Y-m-d'),
        'proposed_day' => 'SELASA',
        'proposed_start_time' => '09:20:00',
        'proposed_end_time' => '12:00:00',
        'proposed_room_id' => $room->id,
        'reason' => 'Ini adalah alasan request perubahan jadwal yang sangat panjang agar lolos validasi 20 karakter.',
        'status' => 'PENDING_ASLAB',
    ]);
    
    // Explicitly nullify the created_at timestamp
    $changeRequest->created_at = null;
    $changeRequest->save();

    // Create a Notification with null created_at
    $notification = Notification::create([
        'request_id' => $changeRequest->id,
        'triggered_by' => $student->id,
        'type' => 'STATUS_CHANGE',
        'title' => 'Request Pending',
        'message' => 'Your request is pending.',
        'body' => 'Body content.',
    ]);
    $notification->created_at = null;
    $notification->save();

    NotificationRecipient::create([
        'notification_id' => $notification->id,
        'recipient_id' => $aslab->id,
        'channel' => 'IN_APP',
        'is_read' => false,
    ]);

    $response = $this->actingAs($aslab)->get(route('aslab.dashboard'));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Dashboard/Aslab')
        ->has('pendingRequests', 1)
        ->where('pendingRequests.0.createdAtDiff', '-')
        ->has('notifikasi', 1)
        ->where('notifikasi.0.waktu', '-')
    );
});
