<?php

use App\Models\Course;
use App\Models\Room;
use App\Models\Schedule;
use App\Models\Semester;
use App\Models\User;
use App\Models\Role;
use App\Models\ChangeRequest;
use App\Models\Approval;
use App\Models\ScheduleOverride;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Carbon\Carbon;

uses(RefreshDatabase::class);

// Setup context for testing admin approval
function setupAdminApprovalContext() {
    $semester = Semester::create([
        'name' => 'Semester Ganjil 2026',
        'academic_year' => '2026/2027',
        'term' => 'GANJIL',
        'start_date' => Carbon::today()->format('Y-m-d'),
        'end_date' => Carbon::today()->addMonths(6)->format('Y-m-d'),
        'is_active' => true,
    ]);

    $adminRole = Role::create([
        'name' => 'Admin',
        'slug' => 'admin',
    ]);

    $mahasiswaRole = Role::create([
        'name' => 'Mahasiswa',
        'slug' => 'mahasiswa',
    ]);

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

    $room1 = Room::create([
        'name' => 'Kelas A1',
        'code' => 'K-A1',
        'capacity' => 40,
        'building' => 'Gedung A',
        'type' => 'KELAS',
        'is_active' => true,
    ]);

    $room2 = Room::create([
        'name' => 'Kelas A2',
        'code' => 'K-A2',
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

    // Baseline schedule: Room 1, Monday, 07:30 - 10:10 (Sesi 1-3)
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

    return compact('semester', 'admin', 'student', 'room1', 'room2', 'course', 'schedule');
}

it('allows admin to approve a PERMANENT request and updates schedule session ranges', function () {
    $context = setupAdminApprovalContext();

    // Create a PERMANENT request proposed: Tuesday, 09:20 - 12:00 in Room 2 (Sesi 3-5, duration 3)
    $cr = ChangeRequest::create([
        'request_code' => 'CR-PERM-001',
        'requester_id' => $context['student']->id,
        'schedule_id' => $context['schedule']->id,
        'semester_id' => $context['semester']->id,
        'request_type' => 'PERMANENT',
        'effective_from_date' => Carbon::today()->addDays(7)->format('Y-m-d'),
        'proposed_day' => 'SELASA',
        'proposed_start_time' => '09:20:00',
        'proposed_end_time' => '12:00:00',
        'proposed_room_id' => $context['room2']->id,
        'reason' => 'Alasan pergeseran jadwal kuliah permanen mata kuliah ini.',
        'status' => 'PENDING_ADMIN',
    ]);

    $response = $this->actingAs($context['admin'])
        ->post(route('admin.persetujuan.approve', ['id' => $cr->id]), [
            'notes' => 'Disetujui, ruangan baru dialokasikan.',
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    // Verify change request status is updated to APPROVED
    $cr->refresh();
    expect($cr->status)->toBe('APPROVED');

    // Verify approval record
    $this->assertDatabaseHas('approvals', [
        'request_id' => $cr->id,
        'stage' => 'ADMIN_DECISION',
        'decision' => 'APPROVED',
        'notes' => 'Disetujui, ruangan baru dialokasikan.',
        'actor_id' => $context['admin']->id,
    ]);

    // Verify original schedule attributes have been permanently updated (including recalculated session_start and session_duration)
    $schedule = $context['schedule']->refresh();
    expect($schedule->day_of_week)->toBe('SELASA');
    expect(substr($schedule->start_time, 0, 5))->toBe('09:20');
    expect(substr($schedule->end_time, 0, 5))->toBe('12:00');
    expect($schedule->room_id)->toBe($context['room2']->id);
    expect($schedule->session_start)->toBe(3); // 09:20 is start of Sesi 3
    expect($schedule->session_duration)->toBe(3); // 09:20 to 12:00 spans Sesi 3, 4, 5 (duration 3)

    // Verify schedule_history was logged
    $this->assertDatabaseHas('schedule_history', [
        'schedule_id' => $schedule->id,
        'request_id' => $cr->id,
        'changed_by' => $context['admin']->id,
    ]);
});

it('allows admin to approve a TEMPORARY request and creates schedule overrides', function () {
    $context = setupAdminApprovalContext();

    // Create a TEMPORARY request proposed: Friday (Jumat), 13:00 - 14:45 in Room 2 (Jumat Sesi 5-6, duration 2)
    $targetDate = Carbon::today()->addDays(2)->format('Y-m-d');
    $cr = ChangeRequest::create([
        'request_code' => 'CR-TEMP-002',
        'requester_id' => $context['student']->id,
        'schedule_id' => $context['schedule']->id,
        'semester_id' => $context['semester']->id,
        'request_type' => 'TEMPORARY',
        'target_date' => $targetDate,
        'proposed_day' => 'JUMAT',
        'proposed_start_time' => '13:00:00',
        'proposed_end_time' => '14:45:00',
        'proposed_room_id' => $context['room2']->id,
        'reason' => 'Alasan pergeseran jadwal kuliah sementara untuk pertemuan minggu ini.',
        'status' => 'PENDING_ADMIN',
    ]);

    $response = $this->actingAs($context['admin'])
        ->post(route('admin.persetujuan.approve', ['id' => $cr->id]), [
            'notes' => 'Diizinkan untuk minggu ini saja.',
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $cr->refresh();
    expect($cr->status)->toBe('APPROVED');

    // Verify schedule overrides entry exists
    $this->assertDatabaseHas('schedule_overrides', [
        'schedule_id' => $context['schedule']->id,
        'request_id' => $cr->id,
        'room_id' => $context['room2']->id,
        'new_day_of_week' => 'JUMAT',
        'new_start_time' => '13:00:00',
        'new_end_time' => '14:45:00',
        'is_active' => true,
    ]);

    // Verify the original schedule remains unchanged
    $schedule = $context['schedule']->refresh();
    expect($schedule->day_of_week)->toBe('SENIN');
    expect(substr($schedule->start_time, 0, 5))->toBe('07:30');
    expect($schedule->room_id)->toBe($context['room1']->id);
});
