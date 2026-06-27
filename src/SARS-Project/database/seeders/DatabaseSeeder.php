<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Room;
use App\Models\Semester;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ═══════════════════════════════════════════
        // ROLES
        // ═══════════════════════════════════════════
        $roles = [
            ['name' => 'Admin',      'slug' => 'admin',      'description' => 'Administrator sistem'],
            ['name' => 'Dosen',      'slug' => 'dosen',      'description' => 'Dosen pengajar'],
            ['name' => 'Aslab',      'slug' => 'aslab',      'description' => 'Asisten laboratorium'],
            ['name' => 'Mahasiswa',  'slug' => 'mahasiswa',  'description' => 'Mahasiswa'],
        ];

        foreach ($roles as $r) {
            Role::firstOrCreate(['slug' => $r['slug']], $r);
        }

        $adminRole      = Role::where('slug', 'admin')->first();
        $dosenRole      = Role::where('slug', 'dosen')->first();
        $aslabRole      = Role::where('slug', 'aslab')->first();
        $mahasiswaRole  = Role::where('slug', 'mahasiswa')->first();

        // ═══════════════════════════════════════════
        // MAIN ACCOUNTS (4 user utama)
        // ═══════════════════════════════════════════
        $mainUsers = [
            [
                'name'     => 'Revan',
                'email'    => 'revan@sars.test',
                'password' => 'password',
                'nim_nip'  => 'ADM001',
                'role'     => $adminRole,
            ],
            [
                'name'     => 'Bagas',
                'email'    => 'bagas@sars.test',
                'password' => 'password',
                'nim_nip'  => 'DSN001',
                'role'     => $dosenRole,
            ],
            [
                'name'     => 'Faris',
                'email'    => 'faris@sars.test',
                'password' => 'password',
                'nim_nip'  => 'ASL001',
                'role'     => $aslabRole,
            ],
            [
                'name'     => 'Zendin',
                'email'    => 'zendin@sars.test',
                'password' => 'password',
                'nim_nip'  => 'MHS001',
                'role'     => $mahasiswaRole,
            ],
        ];

        foreach ($mainUsers as $mu) {
            $role = $mu['role'];
            unset($mu['role']);
            $user = User::firstOrCreate(
                ['email' => $mu['email']],
                $mu
            );
            $user->roles()->syncWithoutDetaching([$role->id]);
        }

        // ═══════════════════════════════════════════
        // DOSEN PENGAMPU (16 dosen)
        // ═══════════════════════════════════════════
        $dosenList = [
            ['name' => 'Umi',              'email' => 'umi@sars.test',          'nim_nip' => 'DSN002'],
            ['name' => 'Heri',             'email' => 'heri@sars.test',         'nim_nip' => 'DSN003'],
            ['name' => 'Bambang',          'email' => 'bambang@sars.test',      'nim_nip' => 'DSN004'],
            ['name' => 'Esti',             'email' => 'esti@sars.test',         'nim_nip' => 'DSN005'],
            ['name' => 'Wiranto',          'email' => 'wiranto@sars.test',      'nim_nip' => 'DSN006'],
            ['name' => 'Fajar',            'email' => 'fajar@sars.test',        'nim_nip' => 'DSN007'],
            ['name' => 'Ery',              'email' => 'ery@sars.test',          'nim_nip' => 'DSN008'],
            ['name' => 'Dewi',             'email' => 'dewi@sars.test',         'nim_nip' => 'DSN009'],
            ['name' => 'Brilyan',          'email' => 'brilyan@sars.test',      'nim_nip' => 'DSN010'],
            ['name' => 'Afrizal',          'email' => 'afrizal@sars.test',      'nim_nip' => 'DSN011'],
            ['name' => 'Rini',             'email' => 'rini@sars.test',         'nim_nip' => 'DSN012'],
            ['name' => 'Endra',            'email' => 'endra@sars.test',        'nim_nip' => 'DSN013'],
            ['name' => 'Arif',             'email' => 'arif@sars.test',         'nim_nip' => 'DSN014'],
            ['name' => 'BaWi',             'email' => 'bawi@sars.test',         'nim_nip' => 'DSN015'],
            ['name' => 'Akhmad',           'email' => 'akhmad@sars.test',       'nim_nip' => 'DSN016'],
            ['name' => 'Fahmy',            'email' => 'fahmy@sars.test',        'nim_nip' => 'DSN017'],
            ['name' => 'Thofiq Odhi',      'email' => 'thofiq@sars.test',       'nim_nip' => 'DSN018'],
            ['name' => 'Shofie',           'email' => 'shofie@sars.test',       'nim_nip' => 'DSN019'],
            ['name' => 'Wisnu',            'email' => 'wisnu@sars.test',        'nim_nip' => 'DSN020'],
            ['name' => 'Aziz',             'email' => 'aziz@sars.test',         'nim_nip' => 'DSN021'],
            ['name' => 'Herdito',          'email' => 'herdito@sars.test',      'nim_nip' => 'DSN022'],
            ['name' => 'Wiharto',          'email' => 'wiharto@sars.test',      'nim_nip' => 'DSN023'],
            ['name' => 'Haryono',          'email' => 'haryono@sars.test',      'nim_nip' => 'DSN024'],
            ['name' => 'Zuhdi',            'email' => 'zuhdi@sars.test',        'nim_nip' => 'DSN025'],
            ['name' => 'Ristu',            'email' => 'ristu@sars.test',        'nim_nip' => 'DSN026'],
        ];

        foreach ($dosenList as $d) {
            $user = User::firstOrCreate(
                ['email' => $d['email']],
                array_merge($d, ['password' => 'password'])
            );
            $user->roles()->syncWithoutDetaching([$dosenRole->id]);
        }

        // ═══════════════════════════════════════════
        // SEMESTER AKTIF
        // ═══════════════════════════════════════════
        Semester::firstOrCreate(
            ['academic_year' => '2025/2026', 'term' => 'GENAP'],
            [
                'name'       => 'Semester Genap 2025/2026',
                'start_date' => '2026-02-01',
                'end_date'   => '2026-07-31',
                'is_active'  => true,
            ]
        );

        // ═══════════════════════════════════════════
        // RUANGAN
        // ═══════════════════════════════════════════
        $rooms = [
            ['code' => 'B4-10',        'name' => 'Ruang B4-10',              'capacity' => 40, 'building' => 'B4', 'floor' => 1, 'type' => 'KELAS'],
            ['code' => 'B4-11',        'name' => 'Ruang B4-11',              'capacity' => 40, 'building' => 'B4', 'floor' => 1, 'type' => 'KELAS'],
            ['code' => 'B4.06',        'name' => 'Ruang B4.06',              'capacity' => 40, 'building' => 'B4', 'floor' => 0, 'type' => 'KELAS'],
            ['code' => 'LAB4-TIK',     'name' => 'Lab 4 TIK Lt.4',          'capacity' => 30, 'building' => 'TIK', 'floor' => 4, 'type' => 'LABORATORIUM'],
            ['code' => 'LAB3-TIK',     'name' => 'Lab 3 TIK Lt.3',           'capacity' => 30, 'building' => 'TIK', 'floor' => 3, 'type' => 'LABORATORIUM'],
            ['code' => 'LAB-B4.04',    'name' => 'Lab B4.04',                'capacity' => 30, 'building' => 'B4', 'floor' => 0, 'type' => 'LABORATORIUM'],
            ['code' => 'LAB-B4.05',    'name' => 'Lab B4.05',                'capacity' => 30, 'building' => 'B4', 'floor' => 0, 'type' => 'LABORATORIUM'],
            ['code' => 'PASCA-1301',   'name' => 'Pasca 1301',               'capacity' => 40, 'building' => 'Pascasarjana', 'floor' => 3, 'type' => 'KELAS'],
            ['code' => 'PASCA-1304',   'name' => 'Pasca 1304',               'capacity' => 40, 'building' => 'Pascasarjana', 'floor' => 3, 'type' => 'KELAS'],
            ['code' => 'PASCA-1312',   'name' => 'Pasca 1312',               'capacity' => 40, 'building' => 'Pascasarjana', 'floor' => 3, 'type' => 'KELAS'],
        ];

        foreach ($rooms as $rm) {
            Room::firstOrCreate(['code' => $rm['code']], $rm);
        }

        // ═══════════════════════════════════════════
        // CALL SCHEDULE SEEDER
        // ═══════════════════════════════════════════
        $this->call(RealScheduleSeeder::class);
    }
}
