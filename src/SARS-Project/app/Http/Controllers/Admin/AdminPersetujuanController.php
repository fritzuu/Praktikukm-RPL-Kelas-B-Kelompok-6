<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminPersetujuanController extends Controller
{
    /**
     * Display the admin approval/persetujuan page.
     *
     * Renders the Inertia page with pending requests (PENDING_ADMIN)
     * and recently decided requests for the history table.
     *
     * TODO: Backend partner — replace mock data with real queries
     *       from change_requests + approvals tables.
     */
    public function index()
    {
        // Placeholder — frontend uses mock data as fallback
        return Inertia::render('Admin/Persetujuan');
    }

    /**
     * Approve a change request.
     *
     * TODO: Backend partner — implement approval logic:
     *   1. Validate request is PENDING_ADMIN
     *   2. Create approval record (stage: ADMIN_DECISION, decision: APPROVED)
     *   3. If TEMPORARY: insert into schedule_overrides
     *   4. If PERMANENT: update schedules + snapshot to schedule_history
     *   5. Update change_request status to APPROVED
     *   6. Send notification to requester
     */
    public function approve(Request $request, $id)
    {
        $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        // TODO: implement approval logic

        return back()->with('success', 'Pengajuan berhasil disetujui.');
    }

    /**
     * Reject a change request.
     *
     * TODO: Backend partner — implement rejection logic:
     *   1. Validate request is PENDING_ADMIN
     *   2. Create approval record (stage: ADMIN_DECISION, decision: REJECTED_ADMIN)
     *   3. Update change_request status to REJECTED_ADMIN
     *   4. Send notification to requester with rejection reason
     */
    public function reject(Request $request, $id)
    {
        $request->validate([
            'notes' => 'required|string|min:5|max:1000',
        ]);

        // TODO: implement rejection logic

        return back()->with('success', 'Pengajuan berhasil ditolak.');
    }
}
