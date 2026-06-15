<?php

use App\Models\Course;
use App\Models\Room;
use App\Models\Schedule;
use App\Models\Semester;
use App\Models\User;
use App\Models\Role;
use App\Models\ChangeRequest;
use App\Models\Approval;
use App\Events\DatabaseSync;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Carbon\Carbon;

uses(RefreshDatabase::class);

beforeEach(function () {
    config(['inertia.testing.ensure_pages_exist' => false]);
});

function setupAslabValidationContext() {
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

    $adminRole = Role::create([
        'name' => 'Admin',
        'slug' => 'admin',
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

    $admin = User::create([
        'name' => 'Budi Admin',
        'email' => 'admin@sars.test',
        'password' => bcrypt('password'),
        'nim_nip' => 'ADM_BUDI',
    ]);
    $admin->roles()->attach($adminRole->id, ['assigned_at' => now(), 'assigned_by' => 1]);

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

    return compact('semester', 'aslab', 'admin', 'student', 'room', 'course', 'schedule', 'changeRequest');
}

/*
|--------------------------------------------------------------------------
| Security & Authorization Tests
|--------------------------------------------------------------------------
*/

it('redirects guest / unauthenticated users to login for validation routes', function () {
    $response = $this->get(route('aslab.validasi'));
    $response->assertRedirect(route('login'));

    $response2 = $this->post(route('aslab.validasi.forward', ['id' => 1]), []);
    $response2->assertRedirect(route('login'));

    $response3 = $this->post(route('aslab.validasi.reject', ['id' => 1]), []);
    $response3->assertRedirect(route('login'));
});

it('prevents non-aslab users from accessing aslab validation routes', function () {
    $context = setupAslabValidationContext();

    // Logged in as student
    $response = $this->actingAs($context['student'])->get(route('aslab.validasi'));
    $response->assertStatus(403);

    $response2 = $this->actingAs($context['student'])->post(route('aslab.validasi.forward', ['id' => $context['changeRequest']->id]), [
        'notes' => 'Forwarding notes here'
    ]);
    $response2->assertStatus(403);

    $response3 = $this->actingAs($context['student'])->post(route('aslab.validasi.reject', ['id' => $context['changeRequest']->id]), [
        'notes' => 'Rejection notes here'
    ]);
    $response3->assertStatus(403);
});

/*
|--------------------------------------------------------------------------
| Aslab Validation Functionality Tests
|--------------------------------------------------------------------------
*/

it('allows aslab to view the validation queue', function () {
    $context = setupAslabValidationContext();

    $response = $this->actingAs($context['aslab'])->get(route('aslab.validasi'));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Aslab/Validation')
        ->has('pending', 1)
        ->has('recent', 0)
    );
});

it('allows aslab to forward a change request to admin and broadcasts event', function () {
    $context = setupAslabValidationContext();
    $cr = $context['changeRequest'];

    Event::fake([DatabaseSync::class]);

    $response = $this->actingAs($context['aslab'])
        ->post(route('aslab.validasi.forward', ['id' => $cr->id]), [
            'notes' => 'Tolong disetujui, kelas sedang kosong.',
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    // Verify DB status updated
    $cr->refresh();
    expect($cr->status)->toBe('PENDING_ADMIN');

    // Verify approval record created
    $this->assertDatabaseHas('approvals', [
        'request_id' => $cr->id,
        'stage' => 'ASLAB_CHECK',
        'decision' => 'FORWARDED',
        'actor_id' => $context['aslab']->id,
        'notes' => 'Tolong disetujui, kelas sedang kosong.',
    ]);

    // Verify DatabaseSync event broadcasted
    Event::assertDispatched(DatabaseSync::class, function ($event) use ($cr) {
        return $event->table === 'change_requests'
            && $event->action === 'forwarded'
            && $event->data['request_id'] === $cr->id
            && $event->data['status'] === 'PENDING_ADMIN';
    });

    // Verify notifications created
    // Notification for student
    $this->assertDatabaseHas('notifications', [
        'request_id' => $cr->id,
        'triggered_by' => $context['aslab']->id,
        'type' => 'REQUEST_FORWARDED',
        'title' => 'Request Diteruskan',
    ]);

    // Recipient student exists
    $studentNotif = \App\Models\Notification::where('request_id', $cr->id)
        ->where('type', 'REQUEST_FORWARDED')
        ->where('title', 'Request Diteruskan')
        ->first();
    $this->assertDatabaseHas('notification_recipients', [
        'notification_id' => $studentNotif->id,
        'recipient_id' => $context['student']->id,
    ]);

    // Notification for admin
    $adminNotif = \App\Models\Notification::where('request_id', $cr->id)
        ->where('type', 'REQUEST_FORWARDED')
        ->where('title', 'Request Menunggu Persetujuan')
        ->first();
    $this->assertDatabaseHas('notification_recipients', [
        'notification_id' => $adminNotif->id,
        'recipient_id' => $context['admin']->id,
    ]);
});

it('prevents forwarding if the request is not in PENDING_ASLAB status', function () {
    $context = setupAslabValidationContext();
    $cr = $context['changeRequest'];
    $cr->update(['status' => 'PENDING_ADMIN']); // already forwarded

    $response = $this->actingAs($context['aslab'])
        ->post(route('aslab.validasi.forward', ['id' => $cr->id]), [
            'notes' => 'Double forward notes',
        ]);

    $response->assertRedirect();
    $response->assertSessionHas('error', 'Request ini sudah tidak dalam status PENDING_ASLAB.');

    // Status remains unchanged
    expect($cr->fresh()->status)->toBe('PENDING_ADMIN');
});

it('allows aslab to reject a change request with notes and broadcasts event', function () {
    $context = setupAslabValidationContext();
    $cr = $context['changeRequest'];

    Event::fake([DatabaseSync::class]);

    $response = $this->actingAs($context['aslab'])
        ->post(route('aslab.validasi.reject', ['id' => $cr->id]), [
            'notes' => 'Ditolak karena tidak sesuai prosedur.',
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    // Verify DB status updated
    $cr->refresh();
    expect($cr->status)->toBe('REJECTED_ASLAB');

    // Verify approval record created
    $this->assertDatabaseHas('approvals', [
        'request_id' => $cr->id,
        'stage' => 'ASLAB_CHECK',
        'decision' => 'REJECTED_ASLAB',
        'actor_id' => $context['aslab']->id,
        'notes' => 'Ditolak karena tidak sesuai prosedur.',
    ]);

    // Verify DatabaseSync event broadcasted
    Event::assertDispatched(DatabaseSync::class, function ($event) use ($cr) {
        return $event->table === 'change_requests'
            && $event->action === 'rejected'
            && $event->data['request_id'] === $cr->id
            && $event->data['status'] === 'REJECTED_ASLAB';
    });

    // Verify notifications created
    $this->assertDatabaseHas('notifications', [
        'request_id' => $cr->id,
        'triggered_by' => $context['aslab']->id,
        'type' => 'REQUEST_REJECTED',
        'title' => 'Request Ditolak Aslab',
        'body' => 'Alasan: Ditolak karena tidak sesuai prosedur.',
    ]);
});

it('requires a rejection notes with min length of 5', function () {
    $context = setupAslabValidationContext();
    $cr = $context['changeRequest'];

    $response = $this->actingAs($context['aslab'])
        ->post(route('aslab.validasi.reject', ['id' => $cr->id]), [
            'notes' => 'No', // too short
        ]);

    $response->assertSessionHasErrors(['notes']);

    // Status remains PENDING_ASLAB
    expect($cr->fresh()->status)->toBe('PENDING_ASLAB');
});
