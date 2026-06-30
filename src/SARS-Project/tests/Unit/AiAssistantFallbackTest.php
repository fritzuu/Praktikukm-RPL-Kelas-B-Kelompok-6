<?php

namespace Tests\Unit;

use App\Services\AiAssistantService;
use App\Models\Semester;
use App\Models\User;
use App\Models\Room;
use App\Models\Schedule;
use App\Models\Course;
use App\Models\TeachingAssignment;
use App\Models\ChangeRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AiAssistantFallbackTest extends TestCase
{
    use RefreshDatabase;

    private AiAssistantService $service;
    private Semester $semester;
    private User $dosen;
    private User $student;
    private Course $course;
    private Room $room;
    private Schedule $schedule;

    /**
     * SETUP: Initialize the service and seed database dependencies.
     */
    public function setUp(): void
    {
        parent::setUp();

        $this->service = new AiAssistantService();

        // Create standard semester
        $this->semester = Semester::create([
            'name' => '2025/2026-I',
            'academic_year' => '2025/2026',
            'term' => 'GANJIL',
            'start_date' => '2025-09-01',
            'end_date' => '2025-12-31',
        ]);

        // Create a lecturer user (Dosen)
        $this->dosen = User::create([
            'name' => 'Dr. Jane Doe',
            'email' => 'jane.doe@university.ac.id',
            'password' => bcrypt('password123'),
            'nim_nip' => '199001012020122001',
        ]);

        // Create a student user
        $this->student = User::create([
            'name' => 'Andi Wijaya',
            'email' => 'andi.wijaya@student.university.ac.id',
            'password' => bcrypt('password123'),
            'nim_nip' => '2100010001',
        ]);

        // Create room
        $this->room = Room::create([
            'name' => 'Lab Komputer 1',
            'code' => 'LAB-01',
            'capacity' => 30,
            'building' => 'Gedung Teknik',
            'type' => 'LABORATORIUM',
            'is_active' => true,
        ]);

        // Create course
        $this->course = Course::create([
            'semester_id' => $this->semester->id,
            'code' => 'IF301',
            'name' => 'Software Engineering',
            'credits' => 3,
            'class_name' => 'A',
        ]);

        // Create schedule
        $this->schedule = Schedule::create([
            'course_id' => $this->course->id,
            'room_id' => $this->room->id,
            'semester_id' => $this->semester->id,
            'day_of_week' => 'RABU',
            'start_time' => '13:00',
            'end_time' => '15:00',
            'session_start' => 5,
            'session_duration' => 2,
            'effective_from' => '2025-09-01',
            'is_active' => true,
        ]);

        // Assign Dosen to teaching schedule
        TeachingAssignment::create([
            'schedule_id' => $this->schedule->id,
            'user_id' => $this->dosen->id,
            'role_in_class' => 'PENGAJAR',
        ]);
    }

    /**
     * TEST 1: Null semester handling for student fallback.
     * ARRANGE: Set semester parameter to null.
     * ACT: Call fallbackResponse().
     * ASSERT: Should return the correct semester error message.
     */
    public function test_student_fallback_handles_null_semester(): void
    {
        // ARRANGE & ACT
        $response = $this->service->fallbackResponse('jadwal', null);

        // ASSERT
        $this->assertEquals(
            'Maaf, tidak ada semester aktif saat ini. Silakan hubungi admin.',
            $response
        );
    }

    /**
     * TEST 2: Null semester handling for admin fallback.
     * ARRANGE: Set semester parameter to null.
     * ACT: Call fallbackAdminResponse().
     * ASSERT: Should return the correct semester error message.
     */
    public function test_admin_fallback_handles_null_semester(): void
    {
        // ARRANGE & ACT
        $response = $this->service->fallbackAdminResponse('statistik', null);

        // ASSERT
        $this->assertEquals(
            'Maaf, tidak ada semester aktif saat ini. Silakan hubungi admin.',
            $response
        );
    }

    /**
     * TEST 3: Null semester handling for dosen fallback.
     * ARRANGE: Set semester parameter to null.
     * ACT: Call fallbackDosenResponse().
     * ASSERT: Should return the correct dosen-specific semester error message.
     */
    public function test_dosen_fallback_handles_null_semester(): void
    {
        // ARRANGE & ACT
        $response = $this->service->fallbackDosenResponse('jadwal mengajar', null, $this->dosen);

        // ASSERT
        $this->assertEquals(
            'Maaf Bapak/Ibu, tidak ada semester aktif saat ini. Silakan hubungi admin.',
            $response
        );
    }

    /**
     * TEST 4: Case-insensitivity check in student fallback.
     * ARRANGE: Setup a mixed-case query string.
     * ACT: Call fallbackResponse() with mixed-case keyword.
     * ASSERT: String should trigger the correct keyword check and contain semester name.
     */
    public function test_student_fallback_is_case_insensitive(): void
    {
        // ARRANGE & ACT
        $response = $this->service->fallbackResponse('JaDwAL', $this->semester);

        // ASSERT
        $this->assertStringContainsString('2025/2026-I', $response);
        $this->assertStringContainsString('1 jadwal aktif', $response);
    }

    /**
     * TEST 5: Case-insensitivity check in admin fallback.
     * ARRANGE: Setup mixed-case query.
     * ACT: Call fallbackAdminResponse() with mixed-case keyword.
     * ASSERT: String should match the 'statistik' keyword.
     */
    public function test_admin_fallback_is_case_insensitive(): void
    {
        // ARRANGE & ACT
        $response = $this->service->fallbackAdminResponse('StAtIsTiK', $this->semester);

        // ASSERT
        $this->assertStringContainsString('Statistik semester', $response);
    }

    /**
     * TEST 6: Case-insensitivity check in dosen fallback.
     * ARRANGE: Setup mixed-case query.
     * ACT: Call fallbackDosenResponse() with mixed-case keyword.
     * ASSERT: String should match the 'jadwal/mengajar' keyword.
     */
    public function test_dosen_fallback_is_case_insensitive(): void
    {
        // ARRANGE & ACT
        $response = $this->service->fallbackDosenResponse('MeNgAjAr', $this->semester, $this->dosen);

        // ASSERT
        $this->assertStringContainsString('1 jadwal mengajar aktif', $response);
    }

    /**
     * TEST 7: Keyword resolution priority for student fallback.
     * ARRANGE: Query contains multiple keywords (e.g. 'jadwal' and 'slot').
     * ACT: Call fallbackResponse().
     * ASSERT: High priority keyword 'jadwal' should match instead of 'slot'.
     */
    public function test_student_fallback_resolves_keywords_by_priority(): void
    {
        // ARRANGE & ACT
        $response1 = $this->service->fallbackResponse('tampilkan jadwal dan slot kosong', $this->semester);
        $response2 = $this->service->fallbackResponse('info slot ruangan kosong untuk pengajuan request', $this->semester);

        // ASSERT 1 (jadwal > slot)
        $this->assertStringContainsString('jadwal aktif', $response1);

        // ASSERT 2 (slot > request)
        $this->assertStringContainsString('Cek Slot Kosong', $response2);
    }

    /**
     * TEST 8: Keyword resolution priority for admin fallback.
     * ARRANGE: Query contains multiple admin keywords.
     * ACT: Call fallbackAdminResponse().
     * ASSERT: Higher priority keyword should be resolved first.
     */
    public function test_admin_fallback_resolves_keywords_by_priority(): void
    {
        // ARRANGE & ACT
        $response1 = $this->service->fallbackAdminResponse('statistik konflik', $this->semester);
        $response2 = $this->service->fallbackAdminResponse('statistik pengajuan request', $this->semester);

        // ASSERT 1 (konflik > statistik)
        $this->assertStringContainsString('potensi konflik', $response1);

        // ASSERT 2 (statistik > request)
        $this->assertStringContainsString('Statistik semester', $response2);
    }

    /**
     * TEST 9: Keyword resolution priority for dosen fallback.
     * ARRANGE: Query contains multiple dosen keywords.
     * ACT: Call fallbackDosenResponse().
     * ASSERT: Higher priority keyword should be resolved first.
     */
    public function test_dosen_fallback_resolves_keywords_by_priority(): void
    {
        // ARRANGE & ACT
        $response1 = $this->service->fallbackDosenResponse('jadwal mengajar dan request perubahan', $this->semester, $this->dosen);
        $response2 = $this->service->fallbackDosenResponse('request perubahan slot ruang', $this->semester, $this->dosen);

        // ASSERT 1 (jadwal > request)
        $this->assertStringContainsString('jadwal mengajar aktif', $response1);

        // ASSERT 2 (request > ruang)
        $this->assertStringContainsString('pengajuan perubahan jadwal', $response2);
    }

    /**
     * TEST 10: Count correctness in student fallback response.
     * ARRANGE: Default setup has 1 active schedule and 1 active room.
     * ACT: Query for schedules and rooms separately.
     * ASSERT: Returned responses contain the exact count from database.
     */
    public function test_student_fallback_reflects_correct_database_counts(): void
    {
        // ARRANGE & ACT
        $responseJadwal = $this->service->fallbackResponse('jadwal', $this->semester);
        $responseRuang = $this->service->fallbackResponse('slot kosong', $this->semester);

        // ASSERT
        $this->assertStringContainsString('1 jadwal aktif', $responseJadwal);
        $this->assertStringContainsString('1 ruangan aktif', $responseRuang);
    }

    /**
     * TEST 11: Count correctness in admin fallback response.
     * ARRANGE: Create a ChangeRequest record.
     * ACT: Query for statistics.
     * ASSERT: Returned responses reflect the new request count.
     */
    public function test_admin_fallback_reflects_correct_database_counts(): void
    {
        // ARRANGE
        ChangeRequest::create([
            'request_code' => 'REQ-20260630-TEST',
            'requester_id' => $this->student->id,
            'schedule_id' => $this->schedule->id,
            'semester_id' => $this->semester->id,
            'request_type' => 'TEMPORARY',
            'status' => 'PENDING_ASLAB',
            'reason' => 'Alasan pengajuan test request.',
        ]);

        // ACT
        $responseStatistik = $this->service->fallbackAdminResponse('statistik', $this->semester);

        // ASSERT
        $this->assertStringContainsString('Total Request: 1', $responseStatistik);
        $this->assertStringContainsString('Pending: 1', $responseStatistik);
    }

    /**
     * TEST 12: Count correctness in dosen fallback response.
     * ARRANGE: Setup additional classes or change requests.
     * ACT: Query fallbackDosenResponse() for schedules and requests.
     * ASSERT: Counts match the specific lecturer's assigned classes.
     */
    public function test_dosen_fallback_reflects_correct_database_counts(): void
    {
        // ARRANGE
        ChangeRequest::create([
            'request_code' => 'REQ-20260630-TEST',
            'requester_id' => $this->student->id,
            'schedule_id' => $this->schedule->id,
            'semester_id' => $this->semester->id,
            'request_type' => 'TEMPORARY',
            'status' => 'PENDING_ADMIN', // Pending validation
            'reason' => 'Alasan pengajuan test request.',
        ]);

        // ACT
        $responseJadwal = $this->service->fallbackDosenResponse('mengajar', $this->semester, $this->dosen);
        $responseRequest = $this->service->fallbackDosenResponse('request', $this->semester, $this->dosen);

        // ASSERT
        $this->assertStringContainsString('1 jadwal mengajar aktif', $responseJadwal);
        $this->assertStringContainsString('1 pengajuan perubahan jadwal', $responseRequest);
    }

    /**
     * TEST 13: Default catchall response for student fallback.
     * ARRANGE: Query contains no recognizable keywords.
     * ACT: Call fallbackResponse().
     * ASSERT: Returns default student greeting message.
     */
    public function test_student_fallback_returns_default_greeting_for_unknown_queries(): void
    {
        // ARRANGE & ACT
        $response = $this->service->fallbackResponse('halo, apa kabar?', $this->semester);

        // ASSERT
        $this->assertEquals(
            'Halo! Saya adalah AI Assistant SARS. Saya bisa membantu kamu dengan informasi tentang jadwal, slot kosong, pengajuan request, dan notifikasi. Silakan tanyakan sesuatu yang spesifik!',
            $response
        );
    }

    /**
     * TEST 14: Default catchall response for admin fallback.
     * ARRANGE: Query contains no recognizable keywords.
     * ACT: Call fallbackAdminResponse().
     * ASSERT: Returns default admin greeting message.
     */
    public function test_admin_fallback_returns_default_greeting_for_unknown_queries(): void
    {
        // ARRANGE & ACT
        $response = $this->service->fallbackAdminResponse('test admin message', $this->semester);

        // ASSERT
        $this->assertEquals(
            'Halo Admin! Saya adalah AI Assistant SARS. Saya bisa membantu dengan analisis konflik, statistik request, manajemen jadwal, dan informasi ruangan. Silakan tanyakan sesuatu yang spesifik!',
            $response
        );
    }

    /**
     * TEST 15: Default catchall response for dosen fallback.
     * ARRANGE: Query contains no recognizable keywords.
     * ACT: Call fallbackDosenResponse().
     * ASSERT: Returns default dosen greeting message containing the user's name.
     */
    public function test_dosen_fallback_returns_default_greeting_for_unknown_queries(): void
    {
        // ARRANGE & ACT
        $response = $this->service->fallbackDosenResponse('test dosen greeting', $this->semester, $this->dosen);

        // ASSERT
        $this->assertEquals(
            'Selamat siang Bapak/Ibu Dr. Jane Doe. Saya adalah AI Assistant SARS. Saya siap membantu Bapak/Ibu untuk memeriksa jadwal mengajar, ketersediaan ruangan/slot kosong, serta status pengajuan perubahan kelas yang mempengaruhi mata kuliah Anda. Silakan tanyakan hal yang ingin diketahui!',
            $response
        );
    }
}
