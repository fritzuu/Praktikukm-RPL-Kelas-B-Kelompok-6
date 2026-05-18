<?php

namespace App\Http\Controllers\Aslab;

use App\Http\Controllers\Controller;
use App\Models\Approval;
use App\Models\ChangeRequest;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AslabValidationController extends Controller
{
    /**
     * Display the validation queue for aslab.
     */
    public function index(Request $request): Response
    {
        // Pending requests waiting for aslab validation
        $pending = ChangeRequest::where('status', 'PENDING_ASLAB')
            ->with(['requester', 'schedule.course', 'schedule.room'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($cr) => [
                'id'            => (string) $cr->id,
                'requestCode'   => $cr->request_code,
                'requester'     => [
                    'name'   => $cr->requester->name,
                    'nimNip' => $cr->requester->nim_nip,
                    'email'  => $cr->requester->email,
                ],
                'schedule'      => [
                    'course' => $cr->schedule->course->name ?? '-',
                    'code'   => $cr->schedule->course->code ?? '-',
                    'room'   => $cr->schedule->room->code ?? '-',
                ],
                'requestType'   => $cr->request_type,
                'proposedDay'   => $cr->proposed_day,
                'proposedTime'  => substr($cr->proposed_start_time, 0, 5) . ' - ' . substr($cr->proposed_end_time, 0, 5),
                'reason'        => $cr->reason,
                'targetDate'    => $cr->target_date,
                'createdAt'     => $cr->created_at->translatedFormat('d M Y'),
                'createdAtDiff' => $cr->created_at->diffForHumans(),
            ])->values();

        // Recently validated (forwarded or rejected by aslab)
        $recentApprovals = Approval::where('actor_id', $request->user()->id)
            ->where('stage', 'ASLAB_CHECK')
            ->with(['changeRequest.requester', 'changeRequest.schedule.course', 'changeRequest.schedule.room'])
            ->orderByDesc('decided_at')
            ->limit(20)
            ->get()
            ->map(fn ($a) => [
                'id'          => (string) $a->id,
                'requestCode' => $a->changeRequest->request_code,
                'student'     => $a->changeRequest->requester->name,
                'course'      => $a->changeRequest->schedule->course->name ?? '-',
                'room'        => $a->changeRequest->schedule->room->code ?? '-',
                'decision'    => $a->decision,
                'notes'       => $a->notes,
                'decidedAt'   => Carbon::parse($a->decided_at)->translatedFormat('d M Y, H:i'),
            ])->values();

        return Inertia::render('Aslab/Validation', [
            'pending'  => $pending,
            'recent'   => $recentApprovals,
        ]);
    }

    /**
     * Forward a change request to admin.
     */
    public function forward(Request $request, int $id)
    {
        $request->validate([
            'notes' => 'nullable|string|max:500',
        ]);

        $cr = ChangeRequest::findOrFail($id);

        if ($cr->status !== 'PENDING_ASLAB') {
            return redirect()->back()->with('error', 'Request ini sudah tidak dalam status PENDING_ASLAB.');
        }

        // Create approval record
        Approval::create([
            'request_id' => $cr->id,
            'actor_id'   => $request->user()->id,
            'stage'      => 'ASLAB_CHECK',
            'decision'   => 'FORWARDED',
            'notes'      => $request->notes ?? 'Diteruskan ke Admin untuk keputusan akhir.',
            'decided_at' => Carbon::now(),
        ]);

        // Update change request status
        $cr->update(['status' => 'PENDING_ADMIN']);

        return redirect()->back()->with('success', 'Request berhasil diteruskan ke Admin.');
    }

    /**
     * Reject a change request.
     */
    public function reject(Request $request, int $id)
    {
        $request->validate([
            'notes' => 'required|string|min:5|max:500',
        ]);

        $cr = ChangeRequest::findOrFail($id);

        if ($cr->status !== 'PENDING_ASLAB') {
            return redirect()->back()->with('error', 'Request ini sudah tidak dalam status PENDING_ASLAB.');
        }

        Approval::create([
            'request_id' => $cr->id,
            'actor_id'   => $request->user()->id,
            'stage'      => 'ASLAB_CHECK',
            'decision'   => 'REJECTED',
            'notes'      => $request->notes,
            'decided_at' => Carbon::now(),
        ]);

        $cr->update(['status' => 'REJECTED']);

        return redirect()->back()->with('success', 'Request berhasil ditolak.');
    }
}
