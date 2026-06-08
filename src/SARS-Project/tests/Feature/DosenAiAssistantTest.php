<?php

use App\Models\Course;
use App\Models\Room;
use App\Models\Schedule;
use App\Models\Semester;
use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('returns fallback JSON response when Gemini API key is not set', function () {
    // Explicitly set Gemini API key to empty/null to force fallback path
    config(['ai.gemini.api_key' => '']);

    $semester = Semester::create([
        'name' => 'Semester Uji Dosen AI',
        'academic_year' => '2025/2026',
        'term' => 'GENAP',
        'start_date' => '2026-02-01',
        'end_date' => '2026-07-31',
        'is_active' => true,
    ]);

    $dosenRole = Role::create([
        'name' => 'Dosen',
        'slug' => 'dosen',
    ]);

    $lecturer = User::create([
        'name' => 'Dr. H. Ahmad',
        'email' => 'ahmad@sars.test',
        'password' => bcrypt('password'),
        'nim_nip' => 'DSN_AHMAD',
    ]);

    // Attach role to user
    $lecturer->roles()->attach($dosenRole->id, [
        'assigned_at' => now(),
        'assigned_by' => 1,
    ]);

    $response = $this->actingAs($lecturer)
        ->postJson(route('dosen.aiQuery'), [
            'query' => 'Jadwal mengajar saya?',
        ]);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'answer',
            'type',
        ]);

    $answer = $response->json('answer');
    expect($answer)->toContain('Bapak/Ibu');
    expect($answer)->toContain('jadwal mengajar aktif');
});

it('rejects unauthenticated users', function () {
    $response = $this->post(route('dosen.aiQuery'), [
        'query' => 'Jadwal mengajar saya?',
    ]);

    // RoleMiddleware redirects to login route if not authenticated
    $response->assertRedirect(route('login'));
});

it('rejects users without dosen role', function () {
    $mahasiswaRole = Role::create([
        'name' => 'Mahasiswa',
        'slug' => 'mahasiswa',
    ]);

    $student = User::create([
        'name' => 'Andi Wijaya',
        'email' => 'andi@sars.test',
        'password' => bcrypt('password'),
        'nim_nip' => 'MHS_ANDI',
    ]);

    $student->roles()->attach($mahasiswaRole->id, [
        'assigned_at' => now(),
        'assigned_by' => 1,
    ]);

    $response = $this->actingAs($student)
        ->postJson(route('dosen.aiQuery'), [
            'query' => 'Jadwal mengajar saya?',
        ]);

    $response->assertStatus(403);
});

it('verifies role data isolation for Dosen request context', function () {
    config(['ai.gemini.api_key' => '']); // Force fallback

    $semester = Semester::create([
        'name' => 'Semester Uji Dosen AI 2',
        'academic_year' => '2025/2026',
        'term' => 'GENAP',
        'start_date' => '2026-02-01',
        'end_date' => '2026-07-31',
        'is_active' => true,
    ]);

    $dosenRole = Role::create(['name' => 'Dosen', 'slug' => 'dosen']);

    // Create Dosen A
    $dosenA = User::create([
        'name' => 'Dosen A',
        'email' => 'dosena@sars.test',
        'password' => bcrypt('password'),
        'nim_nip' => 'DSN_A',
    ]);
    $dosenA->roles()->attach($dosenRole->id, ['assigned_at' => now(), 'assigned_by' => 1]);

    // Create Dosen B
    $dosenB = User::create([
        'name' => 'Dosen B',
        'email' => 'dosenb@sars.test',
        'password' => bcrypt('password'),
        'nim_nip' => 'DSN_B',
    ]);
    $dosenB->roles()->attach($dosenRole->id, ['assigned_at' => now(), 'assigned_by' => 1]);

    // Create Course A
    $courseA = Course::create([
        'semester_id' => $semester->id,
        'code' => 'CS-101',
        'name' => 'Intro to CS',
        'class_name' => 'A',
        'credits' => 3,
        'description' => 'Semester 1',
    ]);

    // Create Course B
    $courseB = Course::create([
        'semester_id' => $semester->id,
        'code' => 'CS-102',
        'name' => 'Advanced CS',
        'class_name' => 'A',
        'credits' => 3,
        'description' => 'Semester 2',
    ]);

    $room = Room::create([
        'name' => 'Room 101',
        'code' => 'R101',
        'capacity' => 40,
        'building' => 'B4',
        'type' => 'KELAS',
        'is_active' => true,
    ]);

    // Create Schedule A
    $schedA = Schedule::create([
        'course_id' => $courseA->id,
        'room_id' => $room->id,
        'semester_id' => $semester->id,
        'day_of_week' => 'SENIN',
        'start_time' => '07:30:00',
        'end_time' => '10:10:00',
        'session_start' => 1,
        'session_duration' => 3,
        'effective_from' => '2026-02-01',
        'is_active' => true,
    ]);
    $schedA->teachingAssignments()->create(['user_id' => $dosenA->id, 'role_in_class' => 'PENGAJAR']);

    // Create Schedule B
    $schedB = Schedule::create([
        'course_id' => $courseB->id,
        'room_id' => $room->id,
        'semester_id' => $semester->id,
        'day_of_week' => 'SENIN',
        'start_time' => '10:15:00',
        'end_time' => '12:55:00',
        'session_start' => 4,
        'session_duration' => 3,
        'effective_from' => '2026-02-01',
        'is_active' => true,
    ]);
    $schedB->teachingAssignments()->create(['user_id' => $dosenB->id, 'role_in_class' => 'PENGAJAR']);

    // Create a pending change request affecting Course A (Dosen A)
    \App\Models\ChangeRequest::create([
        'request_code' => \App\Models\ChangeRequest::generateCode(),
        'requester_id' => $dosenA->id, // just use user id
        'schedule_id' => $schedA->id,
        'semester_id' => $semester->id,
        'request_type' => 'PERMANENT',
        'reason' => 'Need a larger room for students.',
        'status' => 'PENDING_ASLAB',
    ]);

    // Create TWO pending change requests affecting Course B (Dosen B)
    \App\Models\ChangeRequest::create([
        'request_code' => \App\Models\ChangeRequest::generateCode(),
        'requester_id' => $dosenB->id,
        'schedule_id' => $schedB->id,
        'semester_id' => $semester->id,
        'request_type' => 'PERMANENT',
        'reason' => 'Scheduling conflict with other classes.',
        'status' => 'PENDING_ASLAB',
    ]);
    \App\Models\ChangeRequest::create([
        'request_code' => \App\Models\ChangeRequest::generateCode(),
        'requester_id' => $dosenB->id,
        'schedule_id' => $schedB->id,
        'semester_id' => $semester->id,
        'request_type' => 'PERMANENT',
        'reason' => 'Room maintenance issue.',
        'status' => 'PENDING_ADMIN',
    ]);

    // Query AI for Dosen A - should say "terdapat 1 pengajuan"
    $responseA = $this->actingAs($dosenA)
        ->postJson(route('dosen.aiQuery'), [
            'query' => 'Apakah ada pengajuan perubahan kelas?',
        ]);
    
    $responseA->assertStatus(200);
    expect($responseA->json('answer'))->toContain('terdapat 1 pengajuan perubahan jadwal');

    // Query AI for Dosen B - should say "terdapat 2 pengajuan"
    $responseB = $this->actingAs($dosenB)
        ->postJson(route('dosen.aiQuery'), [
            'query' => 'Apakah ada pengajuan perubahan kelas?',
        ]);

    $responseB->assertStatus(200);
    expect($responseB->json('answer'))->toContain('terdapat 2 pengajuan perubahan jadwal');
});
