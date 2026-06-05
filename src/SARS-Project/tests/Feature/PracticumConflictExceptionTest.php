<?php

use App\Models\Course;
use App\Models\Room;
use App\Models\Schedule;
use App\Models\Semester;
use App\Models\User;
use App\Http\Controllers\Mahasiswa\MahasiswaController;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('exempts lecturer conflicts between theory and practicum in different rooms', function () {
    $semester = Semester::create([
        'name' => 'Semester Uji',
        'academic_year' => '2025/2026',
        'term' => 'GENAP',
        'start_date' => '2026-02-01',
        'end_date' => '2026-07-31',
        'is_active' => true,
    ]);

    $lecturer = User::create([
        'name' => 'Dr. Uji',
        'email' => 'uji@sars.test',
        'password' => bcrypt('password'),
        'nim_nip' => 'DSN_UJI',
    ]);

    $room1 = Room::create([
        'name' => 'Room 101',
        'code' => 'R101',
        'capacity' => 40,
        'building' => 'B4',
        'type' => 'KELAS',
        'is_active' => true,
    ]);

    $room2 = Room::create([
        'name' => 'Lab 1',
        'code' => 'LAB1',
        'capacity' => 30,
        'building' => 'B4',
        'type' => 'LABORATORIUM',
        'is_active' => true,
    ]);

    // Course 1: Theory
    $course1 = Course::create([
        'semester_id' => $semester->id,
        'code' => 'MK-BD',
        'name' => 'Basis Data',
        'class_name' => 'A',
        'credits' => 3,
        'description' => 'Semester 2',
    ]);

    // Course 2: Practicum
    $course2 = Course::create([
        'semester_id' => $semester->id,
        'code' => 'MK-BDP',
        'name' => 'Praktikum Basis Data',
        'class_name' => 'A P',
        'credits' => 3,
        'description' => 'Semester 2',
    ]);

    // Schedule 1: Theory course, Room 101, Monday 07:30 - 10:10 (Sesi 1-3)
    $sched1 = Schedule::create([
        'course_id' => $course1->id,
        'room_id' => $room1->id,
        'semester_id' => $semester->id,
        'day_of_week' => 'SENIN',
        'start_time' => '07:30:00',
        'end_time' => '10:10:00',
        'session_start' => 1,
        'session_duration' => 3,
        'effective_from' => '2026-02-01',
        'is_active' => true,
    ]);

    // Assign lecturer to Schedule 1
    $sched1->teachingAssignments()->create([
        'user_id' => $lecturer->id,
        'role_in_class' => 'PENGAJAR',
    ]);

    // Schedule 2: Practicum course, Lab 1, Monday 07:30 - 10:10 (Sesi 1-3)
    $sched2 = Schedule::create([
        'course_id' => $course2->id,
        'room_id' => $room2->id,
        'semester_id' => $semester->id,
        'day_of_week' => 'SENIN',
        'start_time' => '07:30:00',
        'end_time' => '10:10:00',
        'session_start' => 1,
        'session_duration' => 3,
        'effective_from' => '2026-02-01',
        'is_active' => true,
    ]);

    // Assign lecturer to Schedule 2
    $sched2->teachingAssignments()->create([
        'user_id' => $lecturer->id,
        'role_in_class' => 'PENGAJAR',
    ]);

    // Resolve MahasiswaController and call checkSlotConflict via Reflection
    $controller = app(MahasiswaController::class);
    $reflection = new ReflectionClass(MahasiswaController::class);
    $method = $reflection->getMethod('checkSlotConflict');
    $method->setAccessible(true);

    // Check if scheduling $sched2 in $room2 (Lab 1) conflicts with $sched1
    // It should NOT conflict because one is Theory, one is Practicum, and they are in different rooms.
    $conflict = $method->invoke($controller, $sched2->id, $semester->id, 'SENIN', '07:30:00', '10:10:00', $room2->id, null);

    expect($conflict)->toBeNull();
});

it('triggers lecturer conflicts when both are theory', function () {
    $semester = Semester::create([
        'name' => 'Semester Uji 2',
        'academic_year' => '2025/2026',
        'term' => 'GENAP',
        'start_date' => '2026-02-01',
        'end_date' => '2026-07-31',
        'is_active' => true,
    ]);

    $lecturer = User::create([
        'name' => 'Dr. Uji 2',
        'email' => 'uji2@sars.test',
        'password' => bcrypt('password'),
        'nim_nip' => 'DSN_UJI2',
    ]);

    $room1 = Room::create([
        'name' => 'Room 101',
        'code' => 'R101_2',
        'capacity' => 40,
        'building' => 'B4',
        'type' => 'KELAS',
        'is_active' => true,
    ]);

    $room2 = Room::create([
        'name' => 'Room 102',
        'code' => 'R102_2',
        'capacity' => 40,
        'building' => 'B4',
        'type' => 'KELAS',
        'is_active' => true,
    ]);

    $course1 = Course::create([
        'semester_id' => $semester->id,
        'code' => 'MK-BD2',
        'name' => 'Basis Data',
        'class_name' => 'A',
        'credits' => 3,
        'description' => 'Semester 2',
    ]);

    $course2 = Course::create([
        'semester_id' => $semester->id,
        'code' => 'MK-PWB2',
        'name' => 'Pemrograman Web',
        'class_name' => 'A',
        'credits' => 3,
        'description' => 'Semester 4',
    ]);

    $sched1 = Schedule::create([
        'course_id' => $course1->id,
        'room_id' => $room1->id,
        'semester_id' => $semester->id,
        'day_of_week' => 'SENIN',
        'start_time' => '07:30:00',
        'end_time' => '10:10:00',
        'session_start' => 1,
        'session_duration' => 3,
        'effective_from' => '2026-02-01',
        'is_active' => true,
    ]);

    $sched1->teachingAssignments()->create([
        'user_id' => $lecturer->id,
        'role_in_class' => 'PENGAJAR',
    ]);

    $sched2 = Schedule::create([
        'course_id' => $course2->id,
        'room_id' => $room2->id,
        'semester_id' => $semester->id,
        'day_of_week' => 'SENIN',
        'start_time' => '07:30:00',
        'end_time' => '10:10:00',
        'session_start' => 1,
        'session_duration' => 3,
        'effective_from' => '2026-02-01',
        'is_active' => true,
    ]);

    $sched2->teachingAssignments()->create([
        'user_id' => $lecturer->id,
        'role_in_class' => 'PENGAJAR',
    ]);

    $controller = app(MahasiswaController::class);
    $reflection = new ReflectionClass(MahasiswaController::class);
    $method = $reflection->getMethod('checkSlotConflict');
    $method->setAccessible(true);

    // Both are Theory. This should be a conflict.
    $conflict = $method->invoke($controller, $sched2->id, $semester->id, 'SENIN', '07:30:00', '10:10:00', $room2->id, null);

    expect($conflict)->not->toBeNull();
    expect($conflict)->toContain('Bentrok Dosen');
});

it('triggers room conflict when Theory + Practicum share the same room', function () {
    $semester = Semester::create([
        'name' => 'Semester Uji 3',
        'academic_year' => '2025/2026',
        'term' => 'GENAP',
        'start_date' => '2026-02-01',
        'end_date' => '2026-07-31',
        'is_active' => true,
    ]);

    $lecturer = User::create([
        'name' => 'Dr. Uji 3',
        'email' => 'uji3@sars.test',
        'password' => bcrypt('password'),
        'nim_nip' => 'DSN_UJI3',
    ]);

    $room1 = Room::create([
        'name' => 'Room 101',
        'code' => 'R101_3',
        'capacity' => 40,
        'building' => 'B4',
        'type' => 'KELAS',
        'is_active' => true,
    ]);

    $course1 = Course::create([
        'semester_id' => $semester->id,
        'code' => 'MK-BD3',
        'name' => 'Basis Data',
        'class_name' => 'A',
        'credits' => 3,
        'description' => 'Semester 2',
    ]);

    $course2 = Course::create([
        'semester_id' => $semester->id,
        'code' => 'MK-BDP3',
        'name' => 'Praktikum Basis Data',
        'class_name' => 'A P',
        'credits' => 3,
        'description' => 'Semester 2',
    ]);

    $sched1 = Schedule::create([
        'course_id' => $course1->id,
        'room_id' => $room1->id,
        'semester_id' => $semester->id,
        'day_of_week' => 'SENIN',
        'start_time' => '07:30:00',
        'end_time' => '10:10:00',
        'session_start' => 1,
        'session_duration' => 3,
        'effective_from' => '2026-02-01',
        'is_active' => true,
    ]);

    $sched1->teachingAssignments()->create([
        'user_id' => $lecturer->id,
        'role_in_class' => 'PENGAJAR',
    ]);

    $sched2 = Schedule::create([
        'course_id' => $course2->id,
        'room_id' => $room1->id,
        'semester_id' => $semester->id,
        'day_of_week' => 'SENIN',
        'start_time' => '07:30:00',
        'end_time' => '10:10:00',
        'session_start' => 1,
        'session_duration' => 3,
        'effective_from' => '2026-02-01',
        'is_active' => true,
    ]);

    $sched2->teachingAssignments()->create([
        'user_id' => $lecturer->id,
        'role_in_class' => 'PENGAJAR',
    ]);

    $controller = app(MahasiswaController::class);
    $reflection = new ReflectionClass(MahasiswaController::class);
    $method = $reflection->getMethod('checkSlotConflict');
    $method->setAccessible(true);

    // Shared room. It is a room conflict.
    $conflict = $method->invoke($controller, $sched2->id, $semester->id, 'SENIN', '07:30:00', '10:10:00', $room1->id, null);

    expect($conflict)->not->toBeNull();
    // It should be a room conflict because they share the same room
    expect($conflict)->toContain('Bentrok Ruangan');
});

it('exempts lecturer conflicts between practicum and practicum in different rooms', function () {
    $semester = Semester::create([
        'name' => 'Semester Uji 4',
        'academic_year' => '2025/2026',
        'term' => 'GENAP',
        'start_date' => '2026-02-01',
        'end_date' => '2026-07-31',
        'is_active' => true,
    ]);

    $lecturer = User::create([
        'name' => 'Dr. Uji 4',
        'email' => 'uji4@sars.test',
        'password' => bcrypt('password'),
        'nim_nip' => 'DSN_UJI4',
    ]);

    $room1 = Room::create([
        'name' => 'Lab 1',
        'code' => 'LAB1_4',
        'capacity' => 30,
        'building' => 'B4',
        'type' => 'LABORATORIUM',
        'is_active' => true,
    ]);

    $room2 = Room::create([
        'name' => 'Lab 2',
        'code' => 'LAB2_4',
        'capacity' => 30,
        'building' => 'B4',
        'type' => 'LABORATORIUM',
        'is_active' => true,
    ]);

    $course1 = Course::create([
        'semester_id' => $semester->id,
        'code' => 'MK-BDP4_1',
        'name' => 'Praktikum Basis Data',
        'class_name' => 'A P',
        'credits' => 3,
        'description' => 'Semester 2',
    ]);

    $course2 = Course::create([
        'semester_id' => $semester->id,
        'code' => 'MK-BDP4_2',
        'name' => 'Praktikum Pemrograman Web',
        'class_name' => 'A P',
        'credits' => 3,
        'description' => 'Semester 4',
    ]);

    $sched1 = Schedule::create([
        'course_id' => $course1->id,
        'room_id' => $room1->id,
        'semester_id' => $semester->id,
        'day_of_week' => 'SENIN',
        'start_time' => '07:30:00',
        'end_time' => '10:10:00',
        'session_start' => 1,
        'session_duration' => 3,
        'effective_from' => '2026-02-01',
        'is_active' => true,
    ]);

    $sched1->teachingAssignments()->create([
        'user_id' => $lecturer->id,
        'role_in_class' => 'PENGAJAR',
    ]);

    $sched2 = Schedule::create([
        'course_id' => $course2->id,
        'room_id' => $room2->id,
        'semester_id' => $semester->id,
        'day_of_week' => 'SENIN',
        'start_time' => '07:30:00',
        'end_time' => '10:10:00',
        'session_start' => 1,
        'session_duration' => 3,
        'effective_from' => '2026-02-01',
        'is_active' => true,
    ]);

    $sched2->teachingAssignments()->create([
        'user_id' => $lecturer->id,
        'role_in_class' => 'PENGAJAR',
    ]);

    $controller = app(MahasiswaController::class);
    $reflection = new ReflectionClass(MahasiswaController::class);
    $method = $reflection->getMethod('checkSlotConflict');
    $method->setAccessible(true);

    // Both are Practicum in different rooms. This should NOT be a conflict.
    $conflict = $method->invoke($controller, $sched2->id, $semester->id, 'SENIN', '07:30:00', '10:10:00', $room2->id, null);

    expect($conflict)->toBeNull();
});

