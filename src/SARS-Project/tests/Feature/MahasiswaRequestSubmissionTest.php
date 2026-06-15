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
use Carbon\Carbon;

uses(RefreshDatabase::class);

// Helper to set up base objects for testing
function setupMahasiswaTestContext() {
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

    $aslabRole = Role::create([
        'name' => 'Aslab',
        'slug' => 'aslab',
    ]);

    $student = User::create([
        'name' => 'Budi Mahasiswa',
        'email' => 'budi@student.sars.test',
        'password' => bcrypt('password'),
        'nim_nip' => 'MHS_BUDI',
    ]);
    $student->roles()->attach($mahasiswaRole->id, ['assigned_at' => now(), 'assigned_by' => 1]);

    $aslab1 = User::create([
        'name' => 'Andi Aslab',
        'email' => 'andi.aslab@sars.test',
        'password' => bcrypt('password'),
        'nim_nip' => 'ASLAB_ANDI',
    ]);
    $aslab1->roles()->attach($aslabRole->id, ['assigned_at' => now(), 'assigned_by' => 1]);

    $aslab2 = User::create([
        'name' => 'Citra Aslab',
        'email' => 'citra.aslab@sars.test',
        'password' => bcrypt('password'),
        'nim_nip' => 'ASLAB_CITRA',
    ]);
    $aslab2->roles()->attach($aslabRole->id, ['assigned_at' => now(), 'assigned_by' => 1]);

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

    return compact('semester', 'student', 'aslab1', 'aslab2', 'room', 'course', 'schedule');
}

/*
|--------------------------------------------------------------------------
| Security & Authorization Tests
|--------------------------------------------------------------------------
*/

it('redirects guest / unauthenticated users to login', function () {
    $response = $this->post(route('mahasiswa.requests.submit'), [
        'schedule_id' => 1,
        'request_type' => 'TEMPORARY',
        'reason' => 'Alasan request perubahan jadwal',
    ]);

    $response->assertRedirect(route('login'));
});

it('prevents non-mahasiswa users from accessing mahasiswa submission routes', function () {
    $context = setupMahasiswaTestContext();
    $dosenRole = Role::create([
        'name' => 'Dosen',
        'slug' => 'dosen',
    ]);
    $lecturer = User::create([
        'name' => 'Dr. Budi',
        'email' => 'budi@sars.test',
        'password' => bcrypt('password'),
        'nim_nip' => 'DSN_BUDI',
    ]);
    $lecturer->roles()->attach($dosenRole->id, ['assigned_at' => now(), 'assigned_by' => 1]);

    $response = $this->actingAs($lecturer)->postJson(route('mahasiswa.requests.submit'), [
        'schedule_id' => $context['schedule']->id,
        'request_type' => 'TEMPORARY',
        'reason' => 'Alasan request perubahan jadwal',
    ]);

    $response->assertStatus(403);
});

/*
|--------------------------------------------------------------------------
| Input Validation Tests
|--------------------------------------------------------------------------
*/

it('requires schedule_id, request_type, and reason', function () {
    $context = setupMahasiswaTestContext();

    $response = $this->actingAs($context['student'])->post(route('mahasiswa.requests.submit'), []);

    $response->assertSessionHasErrors(['schedule_id', 'request_type', 'reason']);
});

it('requires target_date when request_type is TEMPORARY', function () {
    $context = setupMahasiswaTestContext();

    $response = $this->actingAs($context['student'])->post(route('mahasiswa.requests.submit'), [
        'schedule_id' => $context['schedule']->id,
        'request_type' => 'TEMPORARY',
        'reason' => 'Ini adalah alasan request perubahan jadwal yang sangat panjang agar lolos validasi 20 karakter.',
    ]);

    $response->assertSessionHasErrors(['target_date']);
});

it('requires effective_from_date when request_type is PERMANENT', function () {
    $context = setupMahasiswaTestContext();

    $response = $this->actingAs($context['student'])->post(route('mahasiswa.requests.submit'), [
        'schedule_id' => $context['schedule']->id,
        'request_type' => 'PERMANENT',
        'reason' => 'Ini adalah alasan request perubahan jadwal yang sangat panjang agar lolos validasi 20 karakter.',
    ]);

    $response->assertSessionHasErrors(['effective_from_date']);
});

it('requires reason to be at least 20 characters', function () {
    $context = setupMahasiswaTestContext();

    $response = $this->actingAs($context['student'])->post(route('mahasiswa.requests.submit'), [
        'schedule_id' => $context['schedule']->id,
        'request_type' => 'TEMPORARY',
        'target_date' => Carbon::today()->format('Y-m-d'),
        'reason' => 'Terlalu pendek',
    ]);

    $response->assertSessionHasErrors(['reason']);
});

it('validates proposed_end_time is after proposed_start_time', function () {
    $context = setupMahasiswaTestContext();

    $response = $this->actingAs($context['student'])->post(route('mahasiswa.requests.submit'), [
        'schedule_id' => $context['schedule']->id,
        'request_type' => 'TEMPORARY',
        'target_date' => Carbon::today()->format('Y-m-d'),
        'proposed_day' => 'SELASA',
        'proposed_start_time' => '10:00',
        'proposed_end_time' => '09:00', // Chronologically before start time
        'reason' => 'Ini adalah alasan request perubahan jadwal yang sangat panjang agar lolos validasi 20 karakter.',
    ]);

    $response->assertSessionHasErrors(['proposed_end_time']);
});

/*
|--------------------------------------------------------------------------
| Submission Flows (Conflict-Free & Conflict-Detected)
|--------------------------------------------------------------------------
*/

it('submits a valid conflict-free TEMPORARY request and notifies lab assistants', function () {
    $context = setupMahasiswaTestContext();

    $targetDate = Carbon::today()->addDay()->format('Y-m-d');
    $response = $this->actingAs($context['student'])->post(route('mahasiswa.requests.submit'), [
        'schedule_id' => $context['schedule']->id,
        'request_type' => 'TEMPORARY',
        'target_date' => $targetDate,
        'proposed_day' => 'SELASA',
        'proposed_start_time' => '09:20',
        'proposed_end_time' => '12:00',
        'proposed_room_id' => $context['room']->id,
        'reason' => 'Ini adalah alasan request perubahan jadwal yang sangat panjang agar lolos validasi 20 karakter.',
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    // Check DB record
    $this->assertDatabaseHas('change_requests', [
        'requester_id' => $context['student']->id,
        'schedule_id' => $context['schedule']->id,
        'request_type' => 'TEMPORARY',
        'proposed_day' => 'SELASA',
        'proposed_start_time' => '09:20',
        'proposed_end_time' => '12:00',
        'proposed_room_id' => $context['room']->id,
        'status' => 'PENDING_ASLAB',
        'conflict_checked' => true,
        'has_conflict' => false,
    ]);

    $changeRequest = ChangeRequest::latest()->first();
    expect($changeRequest->target_date->format('Y-m-d'))->toBe($targetDate);

    // Check Notifications created
    $notifications = Notification::where('request_id', $changeRequest->id)->get();
    expect($notifications->count())->toBe(2);

    foreach ($notifications as $notification) {
        expect($notification->triggered_by)->toBe($context['student']->id);
        expect($notification->type)->toBe('REQUEST_SUBMITTED');
        expect($notification->title)->toBe('Request Perubahan Jadwal Baru');
        expect($notification->data_payload)->toBeArray();
        expect($notification->data_payload['request_code'])->toBe($changeRequest->request_code);
        expect($notification->data_payload['course_name'])->toBe($context['course']->name);
        expect($notification->data_payload['new_day'])->toBe('SELASA');
    }

    // Verify both Aslab users received their respective notifications
    $this->assertDatabaseHas('notification_recipients', [
        'notification_id' => $notifications[0]->id,
        'recipient_id' => $context['aslab1']->id,
        'channel' => 'IN_APP',
        'is_sent' => true,
    ]);

    $this->assertDatabaseHas('notification_recipients', [
        'notification_id' => $notifications[1]->id,
        'recipient_id' => $context['aslab2']->id,
        'channel' => 'IN_APP',
        'is_sent' => true,
    ]);
});

it('detects room conflict and flags has_conflict=true with alternative rooms', function () {
    $context = setupMahasiswaTestContext();

    // Create a conflicting schedule in the same room on Tuesday 09:20 - 12:00
    $conflictingCourse = Course::create([
        'semester_id' => $context['semester']->id,
        'code' => 'MK-ALPRO',
        'name' => 'Algoritma Pemrograman',
        'class_name' => 'B',
        'credits' => 3,
        'description' => 'Semester 2',
    ]);

    $conflictingSchedule = Schedule::create([
        'course_id' => $conflictingCourse->id,
        'room_id' => $context['room']->id,
        'semester_id' => $context['semester']->id,
        'day_of_week' => 'SELASA',
        'start_time' => '09:20:00',
        'end_time' => '12:00:00',
        'session_start' => 3,
        'session_duration' => 3,
        'effective_from' => Carbon::today()->format('Y-m-d'),
        'is_active' => true,
    ]);

    // Create an alternative room that is active and free
    $altRoom = Room::create([
        'name' => 'Lab Komputer 2',
        'code' => 'LAB-KOM-2',
        'capacity' => 30,
        'building' => 'Gedung B',
        'type' => 'LABORATORIUM',
        'is_active' => true,
    ]);

    $targetDate = Carbon::today()->addDay()->format('Y-m-d');
    
    // Submit request to move schedule to Tuesday 09:20 - 12:00 in LAB-KOM-1 (which is now busy)
    $response = $this->actingAs($context['student'])->post(route('mahasiswa.requests.submit'), [
        'schedule_id' => $context['schedule']->id,
        'request_type' => 'TEMPORARY',
        'target_date' => $targetDate,
        'proposed_day' => 'SELASA',
        'proposed_start_time' => '09:20',
        'proposed_end_time' => '12:00',
        'proposed_room_id' => $context['room']->id,
        'reason' => 'Ini adalah alasan request perubahan jadwal yang sangat panjang agar lolos validasi 20 karakter.',
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    // Check DB record: has_conflict must be true
    $this->assertDatabaseHas('change_requests', [
        'requester_id' => $context['student']->id,
        'schedule_id' => $context['schedule']->id,
        'request_type' => 'TEMPORARY',
        'has_conflict' => true,
    ]);

    // Check session has alternatives listing the altRoom
    $response->assertSessionHas('hasConflict', true);
    $response->assertSessionHas('alternatives');
    $alternatives = session('alternatives');
    expect($alternatives)->toBeArray();
    expect(count($alternatives))->toBeGreaterThanOrEqual(1);
    expect($alternatives[0]['room_id'])->toBe($altRoom->id);
    expect($alternatives[0]['room_code'])->toBe('LAB-KOM-2');
});

/*
|--------------------------------------------------------------------------
| History and Polling Endpoints Tests
|--------------------------------------------------------------------------
*/

it('allows mahasiswa to delete their own request history', function () {
    $context = setupMahasiswaTestContext();

    $cr = ChangeRequest::create([
        'request_code' => 'CR-TEST-1234',
        'requester_id' => $context['student']->id,
        'schedule_id' => $context['schedule']->id,
        'semester_id' => $context['semester']->id,
        'request_type' => 'TEMPORARY',
        'reason' => 'Alasan request perubahan jadwal',
        'status' => 'PENDING_ASLAB',
    ]);

    $response = $this->actingAs($context['student'])->delete(route('mahasiswa.requests.delete'), [
        'ids' => [$cr->id],
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $this->assertDatabaseMissing('change_requests', [
        'id' => $cr->id,
    ]);
});

it('prevents mahasiswa from deleting another student\'s request history', function () {
    $context = setupMahasiswaTestContext();

    $otherStudent = User::create([
        'name' => 'Charlie Mahasiswa',
        'email' => 'charlie@student.sars.test',
        'password' => bcrypt('password'),
        'nim_nip' => 'MHS_CHARLIE',
    ]);
    $mahasiswaRole = Role::where('slug', 'mahasiswa')->first();
    $otherStudent->roles()->attach($mahasiswaRole->id, ['assigned_at' => now(), 'assigned_by' => 1]);

    $cr = ChangeRequest::create([
        'request_code' => 'CR-TEST-5678',
        'requester_id' => $otherStudent->id,
        'schedule_id' => $context['schedule']->id,
        'semester_id' => $context['semester']->id,
        'request_type' => 'TEMPORARY',
        'reason' => 'Alasan request perubahan jadwal',
        'status' => 'PENDING_ASLAB',
    ]);

    // Logged in as $context['student'], trying to delete $otherStudent's request
    $response = $this->actingAs($context['student'])->delete(route('mahasiswa.requests.delete'), [
        'ids' => [$cr->id],
    ]);

    // Should return session error warning about invalid delete
    $response->assertSessionHas('error', 'Tidak ada request yang valid untuk dihapus.');
    $this->assertDatabaseHas('change_requests', [
        'id' => $cr->id,
    ]);
});

it('returns request list as JSON for live-reload', function () {
    $context = setupMahasiswaTestContext();

    $cr = ChangeRequest::create([
        'request_code' => 'CR-TEST-9999',
        'requester_id' => $context['student']->id,
        'schedule_id' => $context['schedule']->id,
        'semester_id' => $context['semester']->id,
        'request_type' => 'TEMPORARY',
        'reason' => 'Alasan request perubahan jadwal',
        'status' => 'PENDING_ASLAB',
    ]);

    $response = $this->actingAs($context['student'])->getJson(route('mahasiswa.requests.list'));

    $response->assertStatus(200);
    $response->assertJsonStructure([
        'requests' => [
            'data',
            'current_page',
        ],
    ]);
});

it('calculates future meeting dates correctly', function () {
    $context = setupMahasiswaTestContext();

    $response = $this->actingAs($context['student'])->postJson(route('mahasiswa.meetingDates'), [
        'schedule_id' => $context['schedule']->id,
    ]);

    $response->assertStatus(200);
    $response->assertJsonStructure([
        'dates',
    ]);

    $dates = $response->json('dates');
    expect(count($dates))->toBeGreaterThan(0);
    // The day of week for $context['schedule'] is 'SENIN'.
    // Verify each returned date is indeed a Monday (dayOfWeek = 1)
    foreach ($dates as $entry) {
        $dateObj = Carbon::parse($entry['date']);
        expect($dateObj->dayOfWeek)->toBe(Carbon::MONDAY);
    }
});
