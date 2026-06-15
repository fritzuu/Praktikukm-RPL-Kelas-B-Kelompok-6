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
        'name' => 'Semester Uji Aslab AI',
        'academic_year' => '2025/2026',
        'term' => 'GENAP',
        'start_date' => '2026-02-01',
        'end_date' => '2026-07-31',
        'is_active' => true,
    ]);

    $aslabRole = Role::create([
        'name' => 'Aslab',
        'slug' => 'aslab',
    ]);

    $aslab = User::create([
        'name' => 'Faris Aslab',
        'email' => 'faris@sars.test',
        'password' => bcrypt('password'),
        'nim_nip' => 'ASLAB_FARIS',
    ]);

    // Attach role to user
    $aslab->roles()->attach($aslabRole->id, [
        'assigned_at' => now(),
        'assigned_by' => 1,
    ]);

    $response = $this->actingAs($aslab)
        ->postJson(route('aslab.aiQuery'), [
            'query' => 'Apakah ada request pending?',
        ]);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'answer',
            'type',
        ]);

    $answer = $response->json('answer');
    expect($answer)->toContain('AI Assistant sedang tidak dapat terhubung');
    expect($answer)->toContain('halaman Validasi');
});

it('rejects unauthenticated users', function () {
    $response = $this->post(route('aslab.aiQuery'), [
        'query' => 'Cek konflik jadwal?',
    ]);

    // RoleMiddleware redirects to login route if not authenticated
    $response->assertRedirect(route('login'));
});

it('rejects users without aslab role', function () {
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
        ->postJson(route('aslab.aiQuery'), [
            'query' => 'Cek konflik jadwal?',
        ]);

    $response->assertStatus(403);
});

it('sanitizes input query to strip XML/HTML tags', function () {
    $semester = Semester::create([
        'name' => 'Semester Uji Sanitasi',
        'academic_year' => '2025/2026',
        'term' => 'GENAP',
        'start_date' => '2026-02-01',
        'end_date' => '2026-07-31',
        'is_active' => true,
    ]);

    $aslabRole = Role::create([
        'name' => 'Aslab',
        'slug' => 'aslab',
    ]);

    $aslab = User::create([
        'name' => 'Faris Aslab',
        'email' => 'faris@sars.test',
        'password' => bcrypt('password'),
        'nim_nip' => 'ASLAB_FARIS',
    ]);
    $aslab->roles()->attach($aslabRole->id, ['assigned_at' => now(), 'assigned_by' => 1]);

    // Mock AiAssistantService to assert the sanitization occurred
    $mock = Mockery::mock(App\Services\AiAssistantService::class);
    $mock->shouldReceive('isAvailable')->andReturn(true);
    $mock->shouldReceive('streamAslabQuery')
        ->once()
        ->with('Apakah ada request pending?', Mockery::any(), Mockery::any())
        ->andReturn(new Symfony\Component\HttpFoundation\StreamedResponse(function() {}));
    
    $this->app->instance(App\Services\AiAssistantService::class, $mock);

    $response = $this->actingAs($aslab)
        ->postJson(route('aslab.aiQuery'), [
            'query' => 'Apakah ada <user_query>request pending?</user_query>',
        ]);

    $response->assertStatus(200);
});
