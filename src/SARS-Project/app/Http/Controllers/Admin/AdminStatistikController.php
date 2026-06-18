<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Approval;
use App\Models\ChangeRequest;
use App\Models\Semester;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminStatistikController extends Controller
{
    public function index()
    {
        // ── Overview counts ──────────────────────────────────────────────
        $totalRequests = ChangeRequest::count();

        $totalApproved = ChangeRequest::where('status', 'APPROVED')->count();

        $totalRejected = ChangeRequest::whereIn('status', ['REJECTED_ADMIN', 'REJECTED_ASLAB'])->count();

        $denominator   = $totalApproved + $totalRejected;
        $approvalRate  = $denominator > 0
            ? round(($totalApproved / $denominator) * 100, 1)
            : 0.0;

        $pendingCount  = ChangeRequest::whereIn('status', ['PENDING_ASLAB', 'PENDING_ADMIN'])->count();

        // Average processing days: from change_request.created_at → approval.decided_at (ADMIN_DECISION)
        $avgProcessingDays = (float) round(
            Approval::where('stage', 'ADMIN_DECISION')
                ->join('change_requests', 'approvals.request_id', '=', 'change_requests.id')
                ->selectRaw('AVG(EXTRACT(EPOCH FROM (approvals.decided_at - change_requests.created_at)) / 86400) as avg_days')
                ->value('avg_days') ?? 0,
            1
        );

        $activeSemester = Semester::where('is_active', true)->value('name') ?? '-';

        // ── Status distribution ──────────────────────────────────────────
        $statusColorMap = [
            'APPROVED'       => 'success',
            'PENDING_ADMIN'  => 'warning',
            'PENDING_ASLAB'  => 'warning',
            'REJECTED_ADMIN' => 'danger',
            'REJECTED_ASLAB' => 'danger',
            'CANCELLED'      => 'muted',
        ];

        $statusLabelMap = [
            'APPROVED'       => 'Disetujui',
            'PENDING_ADMIN'  => 'Pending Admin',
            'PENDING_ASLAB'  => 'Pending Aslab',
            'REJECTED_ADMIN' => 'Ditolak Admin',
            'REJECTED_ASLAB' => 'Ditolak Aslab',
            'CANCELLED'      => 'Dibatalkan',
        ];

        $statusDistribution = ChangeRequest::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($row) => [
                'label' => $statusLabelMap[$row->status] ?? $row->status,
                'count' => (int) $row->count,
                'color' => $statusColorMap[$row->status] ?? 'muted',
            ])
            ->values()
            ->toArray();

        // ── Type distribution ────────────────────────────────────────────
        $typeCounts = ChangeRequest::selectRaw('request_type, COUNT(*) as count')
            ->groupBy('request_type')
            ->pluck('count', 'request_type');

        $typeDistribution = [
            'temporary' => (int) ($typeCounts['TEMPORARY'] ?? 0),
            'permanent' => (int) ($typeCounts['PERMANENT'] ?? 0),
        ];

        // ── Weekly trend (last 8 weeks) ──────────────────────────────────
        $startDate = Carbon::now()->startOfWeek()->subWeeks(7);
        
        $changeRequests = ChangeRequest::where('created_at', '>=', $startDate)->get(['created_at']);
        $approvals = Approval::where('decided_at', '>=', $startDate)->get(['stage', 'decision', 'decided_at']);

        $weeklyTrend = [];
        for ($i = 7; $i >= 0; $i--) {
            $weekStart = Carbon::now()->startOfWeek()->subWeeks($i);
            $weekEnd   = $weekStart->copy()->endOfWeek();

            $total = $changeRequests->filter(fn($cr) => $cr->created_at && $cr->created_at->between($weekStart, $weekEnd))->count();

            $approved = $approvals->filter(fn($a) => 
                $a->stage === 'ADMIN_DECISION' && 
                $a->decision === 'APPROVED' && 
                $a->decided_at && $a->decided_at->between($weekStart, $weekEnd)
            )->count();

            $rejected = $approvals->filter(fn($a) => 
                ($a->stage === 'ADMIN_DECISION' && $a->decision === 'REJECTED_ADMIN' && $a->decided_at && $a->decided_at->between($weekStart, $weekEnd)) ||
                ($a->stage === 'ASLAB_CHECK' && $a->decision === 'REJECTED_ASLAB' && $a->decided_at && $a->decided_at->between($weekStart, $weekEnd))
            )->count();

            $weeklyTrend[] = [
                'label'    => $weekStart->format('d M'),
                'total'    => (int) $total,
                'approved' => (int) $approved,
                'rejected' => (int) $rejected,
            ];
        }


        // ── Top rooms ────────────────────────────────────────────────────
        $topRooms = DB::table('change_requests')
            ->join('schedules', 'change_requests.schedule_id', '=', 'schedules.id')
            ->join('rooms', 'schedules.room_id', '=', 'rooms.id')
            ->selectRaw('rooms.code as room, COUNT(change_requests.id) as count')
            ->groupBy('rooms.id', 'rooms.code')
            ->orderByDesc('count')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'room'  => $row->room,
                'count' => (int) $row->count,
            ])
            ->values()
            ->toArray();

        // ── Top courses ──────────────────────────────────────────────────
        $topCourses = DB::table('change_requests')
            ->join('schedules', 'change_requests.schedule_id', '=', 'schedules.id')
            ->join('courses', 'schedules.course_id', '=', 'courses.id')
            ->selectRaw('courses.name as course, courses.code as code, COUNT(change_requests.id) as count')
            ->groupBy('courses.id', 'courses.name', 'courses.code')
            ->orderByDesc('count')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'course' => $row->course,
                'code'   => $row->code,
                'count'  => (int) $row->count,
            ])
            ->values()
            ->toArray();

        return Inertia::render('Admin/Statistik', [
            'overview' => [
                'totalRequests'     => $totalRequests,
                'totalApproved'     => $totalApproved,
                'totalRejected'     => $totalRejected,
                'approvalRate'      => $approvalRate,
                'pendingCount'      => $pendingCount,
                'avgProcessingDays' => $avgProcessingDays,
                'activeSemester'    => $activeSemester,
            ],
            'statusDistribution' => $statusDistribution,
            'typeDistribution'   => $typeDistribution,
            'weeklyTrend'        => $weeklyTrend,
            'topRooms'           => $topRooms,
            'topCourses'         => $topCourses,
        ]);
    }
}
