<?php

use App\Models\Course;
use App\Models\Room;
use App\Models\Schedule;
use App\Models\Semester;
use App\Models\User;
use App\Models\Role;
use App\Models\ChangeRequest;
use App\Models\ScheduleOverride;
use App\Support\AcademicSessionTimes;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Carbon\Carbon;

uses(RefreshDatabase::class);

it('applies active weekly overrides to schedules collection', function () {
    // 1. Setup semester
    $semester = Semester::create([
        'name' => 'Semester Genap 2026',
        'academic_year' => '2025/2026',
        'term' => 'GENAP',
        'start_date' => Carbon::today()->subMonths(2)->format('Y-m-d'),
        'end_date' => Carbon::today()->addMonths(4)->format('Y-m-d'),
        'is_active' => true,
    ]);

    // 2. Setup user/student for requester_id
    $student = User::create([
        'name' => 'Andi Mahasiswa',
        'email' => 'andi@student.sars.test',
        'password' => bcrypt('password'),
        'nim_nip' => 'MHS_ANDI',
    ]);

    // 3. Setup rooms
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

    // 4. Setup courses
    $course = Course::create([
        'semester_id' => $semester->id,
        'code' => 'MK-ALPRO',
        'name' => 'Algoritma Pemrograman',
        'class_name' => 'A',
        'credits' => 3,
        'description' => 'Semester 2',
    ]);

    // 5. Setup schedules
    $schedule = Schedule::create([
        'course_id' => $course->id,
        'room_id' => $room1->id,
        'semester_id' => $semester->id,
        'day_of_week' => 'SENIN',
        'start_time' => '07:30:00',
        'end_time' => '10:10:00',
        'session_start' => 1,
        'session_duration' => 3,
        'effective_from' => Carbon::today()->subMonths(1)->format('Y-m-d'),
        'is_active' => true,
    ]);

    // 6. Setup temporary override in the current week (Wednesday)
    $now = Carbon::now('Asia/Jakarta');
    $wednesdayDate = $now->copy()->startOfWeek()->addDays(2); // Wednesday

    $cr = ChangeRequest::create([
        'request_code' => 'CR-TEMP-100',
        'requester_id' => $student->id,
        'schedule_id' => $schedule->id,
        'semester_id' => $semester->id,
        'request_type' => 'TEMPORARY',
        'target_date' => $wednesdayDate->format('Y-m-d'),
        'proposed_day' => 'RABU',
        'proposed_start_time' => '09:20:00',
        'proposed_end_time' => '11:05:00',
        'proposed_room_id' => $room2->id,
        'reason' => 'Alasan pergeseran jadwal kuliah sementara untuk pertemuan minggu ini.',
        'status' => 'APPROVED',
    ]);

    $override = ScheduleOverride::create([
        'schedule_id' => $schedule->id,
        'request_id' => $cr->id,
        'room_id' => $room2->id,
        'override_date' => $wednesdayDate->format('Y-m-d'),
        'new_day_of_week' => 'RABU',
        'new_start_time' => '09:20:00',
        'new_end_time' => '11:05:00',
        'is_active' => true,
    ]);

    // 7. Test with a mock formatted array
    $schedulesArray = [
        [
            'id' => $schedule->id,
            'kode' => $course->code,
            'nama' => $course->name,
            'kelas' => $course->class_name,
            'ruangan' => $room1->code,
            'hari' => 'senin',
            'sesiMulai' => 1,
            'durasi' => 3,
            'mulai' => '07:30',
            'selesai' => '10:10',
            'tipe' => 'resmi',
        ]
    ];

    $result = AcademicSessionTimes::applyWeeklyOverrides($schedulesArray);

    expect($result)->toHaveCount(1);
    $item = $result->first();

    expect($item['hari'])->toBe('rabu');
    expect($item['ruangan'])->toBe($room2->code);
    expect($item['mulai'])->toBe('09:20');
    expect($item['selesai'])->toBe('11:05');
    expect($item['sesiMulai'])->toBe(3); // 09:20 is session 3
    expect($item['durasi'])->toBe(2); // 09:20 - 11:05 spans sessions 3-4 (duration 2)
    expect($item['tipe'])->toBe('override');

    // 8. Test with a mock stdClass object (as returned in admin/aslab queries)
    $schedulesObject = [
        (object)[
            'id' => $schedule->id,
            'kode' => $course->code,
            'nama' => $course->name,
            'kelas' => $course->class_name,
            'ruangan' => $room1->code,
            'hari' => 'senin',
            'sesiMulai' => 1,
            'durasi' => 3,
            'jamMulai' => '07:30:00',
            'jamAkhir' => '10:10:00',
            'tipe' => 'resmi',
        ]
    ];

    $resultObj = AcademicSessionTimes::applyWeeklyOverrides($schedulesObject);

    expect($resultObj)->toHaveCount(1);
    $itemObj = $resultObj->first();

    expect($itemObj->hari)->toBe('rabu');
    expect($itemObj->ruangan)->toBe($room2->code);
    expect($itemObj->jamMulai)->toBe('09:20');
    expect($itemObj->jamAkhir)->toBe('11:05');
    expect($itemObj->sesiMulai)->toBe(3);
    expect($itemObj->durasi)->toBe(2);
    expect($itemObj->tipe)->toBe('override');
});
