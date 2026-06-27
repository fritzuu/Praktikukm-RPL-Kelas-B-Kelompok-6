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
use App\Services\Notifications\NotificationDetailBuilder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Carbon\Carbon;

uses(RefreshDatabase::class);

function setupNotificationBuilderContext() {
    $semester = Semester::create([
        'name' => 'Semester Ganjil 2026',
        'academic_year' => '2026/2027',
        'term' => 'GANJIL',
        'start_date' => Carbon::today()->format('Y-m-d'),
        'end_date' => Carbon::today()->addMonths(6)->format('Y-m-d'),
        'is_active' => true,
    ]);

    $mahasiswaRole = Role::create([
        'name' => 'Mahasiswa',
        'slug' => 'mahasiswa',
    ]);

    $student = User::create([
        'name' => 'Andi Mahasiswa',
        'email' => 'andi@student.sars.test',
        'password' => bcrypt('password'),
        'nim_nip' => 'MHS_ANDI',
    ]);
    $student->roles()->attach($mahasiswaRole->id, ['assigned_at' => now(), 'assigned_by' => 1]);

    $room1 = Room::create([
        'name' => 'Kelas A1',
        'code' => 'K-A1',
        'capacity' => 40,
        'building' => 'Gedung A',
        'type' => 'KELAS',
        'is_active' => true,
    ]);

    $course = Course::create([
        'semester_id' => $semester->id,
        'code' => 'MK-ALPRO',
        'name' => 'Algoritma Pemrograman',
        'class_name' => 'A',
        'credits' => 3,
        'description' => 'Semester 2',
    ]);

    // Monday 07:30 - 10:10 in Room 1 (Sesi 1-3)
    $schedule = Schedule::create([
        'course_id' => $course->id,
        'room_id' => $room1->id,
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
        'request_code' => 'REQ-TEST-9999',
        'requester_id' => $student->id,
        'schedule_id' => $schedule->id,
        'semester_id' => $semester->id,
        'request_type' => 'TEMPORARY',
        'target_date' => Carbon::today()->addDay()->format('Y-m-d'),
        'proposed_day' => 'SELASA',
        'proposed_start_time' => '09:20:00',
        'proposed_end_time' => '12:00:00',
        'proposed_room_id' => $room1->id,
        'reason' => 'Alasan pergeseran jadwal kuliah.',
        'status' => 'PENDING_ASLAB',
    ]);

    return compact('semester', 'student', 'room1', 'course', 'schedule', 'changeRequest');
}

it('prioritizes data_payload values over the current schedule model state', function () {
    $context = setupNotificationBuilderContext();
    $schedule = $context['schedule'];
    $cr = $context['changeRequest'];

    // Original schedule values before change: SENIN, K-A1, Sesi 1-3
    $payload = [
        'request_code'  => $cr->request_code,
        'old_day'       => 'SENIN',
        'old_time'      => '07:30 – 10:10',
        'old_room'      => 'K-A1',
        'old_room_name' => 'Kelas A1',
        'old_session'   => 'Sesi 1-3',
    ];

    $notification = Notification::create([
        'request_id'   => $cr->id,
        'triggered_by' => $context['student']->id,
        'type'         => 'REQUEST_FORWARDED',
        'title'        => 'Request Diteruskan',
        'message'      => "Request {$cr->request_code} divalidasi.",
        'data_payload' => $payload,
    ]);

    $recipient = NotificationRecipient::create([
        'notification_id' => $notification->id,
        'recipient_id'    => $context['student']->id,
        'channel'         => 'IN_APP',
        'is_sent'         => true,
    ]);

    // Now let's simulate the database schedule getting updated (e.g. to SELASA, K-A2, Sesi 3-5)
    // In real life, a permanent/override change could change the live schedule model.
    $room2 = Room::create([
        'name' => 'Kelas A2',
        'code' => 'K-A2',
        'capacity' => 40,
        'building' => 'Gedung A',
        'type' => 'KELAS',
        'is_active' => true,
    ]);

    $schedule->update([
        'day_of_week' => 'SELASA',
        'room_id'     => $room2->id,
        'start_time'  => '09:20:00',
        'end_time'    => '12:00:00',
        'session_start' => 3,
        'session_duration' => 3,
    ]);

    $builder = new NotificationDetailBuilder();
    $data = $builder->build($notification, $recipient);

    // Verify it prioritize payload's "old" values (preserving original context)
    expect($data['schedule_change']['old']['day'])->toBe('SENIN');
    expect($data['schedule_change']['old']['time'])->toBe('07:30 – 10:10');
    expect($data['schedule_change']['old']['room'])->toBe('K-A1');
    expect($data['schedule_change']['old']['room_name'])->toBe('Kelas A1');
    expect($data['schedule_change']['old']['session'])->toBe('Sesi 1-3');
});

it('falls back to live schedule details when payload attributes are missing', function () {
    $context = setupNotificationBuilderContext();
    $cr = $context['changeRequest'];

    // Empty payload
    $notification = Notification::create([
        'request_id'   => $cr->id,
        'triggered_by' => $context['student']->id,
        'type'         => 'REQUEST_FORWARDED',
        'title'        => 'Request Diteruskan',
        'message'      => "Request {$cr->request_code} divalidasi.",
        'data_payload' => [], // Empty payload
    ]);

    $recipient = NotificationRecipient::create([
        'notification_id' => $notification->id,
        'recipient_id'    => $context['student']->id,
        'channel'         => 'IN_APP',
        'is_sent'         => true,
    ]);

    $builder = new NotificationDetailBuilder();
    $data = $builder->build($notification, $recipient);

    // Verify it fell back to live schedule model: SENIN, K-A1, Sesi 1-3
    expect($data['schedule_change']['old']['day'])->toBe('SENIN');
    expect($data['schedule_change']['old']['time'])->toBe('07:30 – 10:10'); // formatTimeRange formats it with en-dash
    expect($data['schedule_change']['old']['room'])->toBe('K-A1');
    expect($data['schedule_change']['old']['room_name'])->toBe('Kelas A1');
    expect($data['schedule_change']['old']['session'])->toBe('Sesi 1–3'); // en-dash from sessionLabel
});
