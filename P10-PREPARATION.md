# P10: Unit Test Minimal dan Pola AAA - Persiapan & Panduan

## Apa P10 Itu?
**P10 adalah module untuk menulis automated test** dengan pola AAA (Arrange-Act-Assert). Tujuan: verifikasi kode otomatis setiap saat, detect bug awal, aman refactor, dokumentasi behavior.

---

## Deliverables P10
1. **Minimal 3 unit test** di folder `tests/` - follow pola AAA
2. **Screenshot hasil running test** (Pass/Fail count)
3. **Issue "[SUBMISSION] P10 Evidence"** dengan link ke file test + screenshot

---

## Jadwal Kerja Saat Praktikum
**Durasi: 100 menit (2 x 50 menit)**

| Tahap | Waktu | Apa |
|-------|-------|-----|
| 1 | 15 min | Setup framework testing (Pest), verify bisa run |
| 2 | 10 min | Identifikasi 3-5 fungsi kritis yang bisa ditest |
| 3 | 45 min | **Tulis 3+ unit test, follow AAA pattern** |
| 4 | 30 min | Run test, screenshot, debug kalo fail, upload evidence |

---

## Stack Project Ini
- **Framework**: Laravel 13 + Pest (PHP testing framework)
- **Database**: PostgreSQL/MySQL via Supabase
- **Frontend**: React + Vite
- **AI**: Streaming responses, conflict detection

---

## Fungsi Kritis yang Siap Ditest

### 1. `ChangeRequest::generateCode()` ✓ PURE FUNCTION
**File**: `app/Models/ChangeRequest.php`
```php
public static function generateCode(): string
```
**Apa**: Generate unique request code CR-YYYYMMDD-XXXX
**Kenapa test**: 
- Pure function (no side effects), format konsisten, unique setiap call
- Edge case: duplicate check, date format

**Contoh test name**:
- `it('generates unique request code with correct format')`
- `it('generates different codes for subsequent calls')`
- `it('prevents duplicate codes')`

---

### 2. `AiAssistantService::timeRangesOverlap()` ✓ UTILITY FUNCTION
**File**: `app/Services/AiAssistantService.php` (line 612)
```php
private function timeRangesOverlap(string $start1, string $end1, string $start2, string $end2): bool
```
**Apa**: Detect jika dua time range overlap (critical untuk conflict detection)
**Kenapa test**:
- Business logic: jadwal bentrok atau tidak → affects approval decision
- Berbagai case: overlap awal, overlap akhir, fully overlap, no overlap, edge time

**Contoh test name**:
- `it('returns true when time ranges overlap')`
- `it('returns false when time ranges dont overlap')`
- `it('detects edge case where end1 equals start2')`

---

### 3. `Schedule::scopeOverlappingTime()` ✓ QUERY BUILDER
**File**: `app/Models/Schedule.php` (line 77)
```php
public function scopeOverlappingTime($query, string $start, string $end)
```
**Apa**: Query schedule yang waktu-nya overlap dengan time range tertentu
**Kenapa test**:
- Query logic: filter schedule yang conflict
- Database: verify query generate hasil benar

**Contoh test name**:
- `it('returns schedules with overlapping time')`
- `it('returns empty when no overlapping schedules')`
- `it('handles exact time boundaries correctly')`

---

### 4. (Optional) `ChangeRequest::generateCode()` + Duplicate Check
**Kombinasi**: Test flow unique code generation
- Test: buat 100 codes, pastiin semua unique

---

## AAA Pattern Explained

```php
<?php

use App\Models\ChangeRequest;

test('generates unique request code with correct format', function () {
    // ARRANGE: Setup data & conditions
    // (kalau butuh mock database, fake data, etc setup di sini)
    
    // ACT: Eksekusi function yang ditest
    $code = ChangeRequest::generateCode();
    
    // ASSERT: Verify hasil match expectation
    expect($code)->toMatch('/^CR-\d{8}-[A-Z0-9]{4}$/');
});
```

**Breakdown**:
1. **ARRANGE**: Prepare semua yg dibutuh (setup data, mock, conditions)
2. **ACT**: Jalankan function/method yg mau ditest
3. **ASSERT**: Verify outputnya sesuai expected (use `expect()` di Pest)

---

## Pest Framework Cheat Sheet

**Basic test**:
```php
test('description of test', function () {
    $result = someFunction();
    expect($result)->toBe(expectedValue);
});
```

**Common expectations**:
```php
expect($value)->toBe($expected);              // exact match
expect($value)->toEqual($expected);           // loose match
expect($value)->toBeTrue();                   // boolean true
expect($value)->toBeFalse();                  // boolean false
expect($value)->toBeNull();                   // null
expect($string)->toMatch('/regex/');          // regex match
expect($array)->toContain('item');            // array contains
expect($array)->toHaveLength(3);              // array size
```

**Database testing**:
```php
use Illuminate\Foundation\Testing\RefreshDatabase;

// Inside test:
$this->assertDatabaseHas('users', ['email' => 'test@test.com']);
$this->assertDatabaseMissing('users', ['id' => 999]);
```

---

## Langkah Setup (Saat Praktikum)

### Step 1: Verify Pest Already Installed
```bash
cd src/SARS-Project
composer show pestphp/pest
```
✓ Sudah ada. Framework ready.

### Step 2: Create Tests Folder (Jika Belum Ada)
```bash
mkdir -p tests/Unit
```

### Step 3: Copy Test Boilerplate (Sudah Disediakan)
File test akan dibuat di: `tests/Unit/`

### Step 4: Run Test
```bash
php artisan test
```
✓ Semua tests execute. Screenshot hasilnya.

---

## Prep Checklist (Sebelum Praktikum)

- [ ] Baca file ini sampai paham AAA pattern
- [ ] Cek 3 fungsi target sudah di-identify (ChangeRequest, AiAssistant, Schedule)
- [ ] Faham test structure (Arrange-Act-Assert)
- [ ] Siap nulis 3 test cases minimal
- [ ] Setup: `mkdir -p tests/Unit`
- [ ] Run: `php artisan test` verify bisa execute

---

## Target Saat Praktikum

✅ **MUST HAVE (Passing Grade)**:
- 3+ unit test written
- Follow AAA pattern jelas
- Semua test pass
- Screenshot hasil

✅ **NICE TO HAVE (Higher Grade)**:
- 5+ test (happy case + edge cases)
- Test coverage mencakup error cases
- Test name super descriptive
- Code clean, comments jelas

---

## Red Flags / Common Mistakes

❌ **Jangan**:
- Test yang terlalu kompleks (1 test = 1 behavior only)
- Skip arrange phase (data setup penting!)
- Assert tanpa arrange (test jadi random)
- Test yg bergantung satu sama lain (must be independent)
- Hardcode value di test (use variables, factories)

✅ **Do**:
- 1 test = 1 fokus
- Arrange clearly
- Descriptive test names
- Independent tests
- Use Pest methods (`expect()`)

---

## Helpful Commands During Practical

```bash
# Run all tests
php artisan test

# Run specific test file
php artisan test tests/Unit/ChangeRequestTest.php

# Run with verbose output
php artisan test --verbose

# Run single test
php artisan test tests/Unit/ChangeRequestTest.php --filter=generateCode
```

---

## Contoh Full Test File (Template)

Lihat `tests/Unit/ChangeRequestTest.php` (akan dibuat di step praktikum)

Struktur:
```php
<?php

namespace Tests\Unit;

use App\Models\ChangeRequest;
use Tests\TestCase;

class ChangeRequestTest extends TestCase
{
    // Test 1
    test('generates unique code with correct format', function () {
        // ARRANGE
        // ACT
        // ASSERT
    });

    // Test 2
    test('generates different codes on subsequent calls', function () {
        // ARRANGE
        // ACT
        // ASSERT
    });

    // Test 3
    test('prevents duplicate codes', function () {
        // ARRANGE
        // ACT
        // ASSERT
    });
}
```

---

## Grading Rubric Cheat Sheet

| Aspek | Bobot | Min untuk Pass |
|-------|-------|---|
| Setup & Config | 15% | Framework installed, script ada |
| Unit Test Quality | 40% | 3+ test, AAA consistent, descriptive names |
| Test Results | 25% | Semua pass |
| On Time | 20% | Tepat waktu delivery |

---

## Siap? GO TO PRAKTIKUM!

Bawa:
- [ ] File ini dibaca
- [ ] 3 fungsi target di-identify
- [ ] AAA pattern paham
- [ ] Siap tulis test

Saat praktikum:
1. Setup Pest (15 min)
2. Identify functions (10 min)
3. Write 3+ tests (45 min)
4. Run & screenshot (30 min)

**Target: 3+ passing tests + screenshot + issue submitted.**

Good luck! 🚀
