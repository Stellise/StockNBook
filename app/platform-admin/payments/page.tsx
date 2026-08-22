"use client";

import { useMemo, useState } from "react";
import PlatformAdminSidebar from "../dashboard/PlatformAdminSidebar";
import { Check, Eye, FileImage } from "lucide-react";
import {
    AdminHeader,
    AdminPageShell,
    AdminSection,
    AvatarBadge,
    Card,
    GhostButton,
    Modal,
    PlanBadge,
    PrimaryButton,
    SearchInput,
    SelectFilter,
    StatusPill,
} from "../_components/AdminUI";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Plan = "Starter" | "Business" | "Enterprise";
type PaymentStatus = "PENDING" | "APPROVED" | "REJECTED";
type ReviewAction = "approve" | "reject" | null;

interface Payment {
    id: string;
    storeName: string;
    ownerEmail: string;
    requestedPlan: Plan;
    amount: number; // PHP
    referenceNumber: string;
    paymentDate: string;
    submittedAt: string; // ISO
    status: PaymentStatus;
    proofFileName: string;
    rejectionReason?: string;
    initials: string;
}

// ---------------------------------------------------------------------------
// Mock data — same shape as the dashboard's payment queue
// ---------------------------------------------------------------------------

const MOCK_PAYMENTS: Payment[] = [
    {
        id: "PAY-20260819-001",
        storeName: "ABC Party Supplies",
        ownerEmail: "abcparty@gmail.com",
        requestedPlan: "Business",
        amount: 499,
        referenceNumber: "1234567890123",
        paymentDate: "August 19, 2026",
        submittedAt: "2026-08-19T09:12:00",
        status: "PENDING",
        proofFileName: "gcash-proof-abc-party.jpg",
        initials: "AB",
    },
    {
        id: "PAY-20260820-002",
        storeName: "Happy Events",
        ownerEmail: "happyevents@gmail.com",
        requestedPlan: "Enterprise",
        amount: 1299,
        referenceNumber: "9827345610123",
        paymentDate: "August 20, 2026",
        submittedAt: "2026-08-20T14:40:00",
        status: "PENDING",
        proofFileName: "gcash-proof-happy-events.jpg",
        initials: "HA",
    },
    {
        id: "PAY-20260818-003",
        storeName: "Party World",
        ownerEmail: "partyworld@gmail.com",
        requestedPlan: "Business",
        amount: 499,
        referenceNumber: "6248091345780",
        paymentDate: "August 18, 2026",
        submittedAt: "2026-08-18T11:05:00",
        status: "PENDING",
        proofFileName: "gcash-proof-party-world.jpg",
        initials: "PW",
    },
    {
        id: "PAY-20260817-004",
        storeName: "Fiesta Supplier",
        ownerEmail: "fiesta.supplier@gmail.com",
        requestedPlan: "Business",
        amount: 499,
        referenceNumber: "7713259874601",
        paymentDate: "August 17, 2026",
        submittedAt: "2026-08-17T16:22:00",
        status: "APPROVED",
        proofFileName: "gcash-proof-fiesta-supplier.jpg",
        initials: "FS",
    },
    {
        id: "PAY-20260814-005",
        storeName: "CE Events Supply",
        ownerEmail: "ceevents@gmail.com",
        requestedPlan: "Enterprise",
        amount: 1299,
        referenceNumber: "0012349999",
        paymentDate: "August 14, 2026",
        submittedAt: "2026-08-14T08:50:00",
        status: "REJECTED",
        proofFileName: "gcash-proof-ce-events.jpg",
        rejectionReason: "Incorrect amount",
        initials: "CE",
    },
];

const REJECTION_REASONS = ["Payment not found", "Incorrect amount", "Invalid reference number"];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_TONE: Record<PaymentStatus, "gold" | "green" | "red"> = {
    PENDING: "gold",
    APPROVED: "green",
    REJECTED: "red",
};

function formatDateTime(iso: string) {
    return new Date(iso).toLocaleString("en-PH", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function hoursPending(iso: string) {
    return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60));
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>(MOCK_PAYMENTS);
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("PENDING");
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [reviewAction, setReviewAction] = useState<ReviewAction>(null);
    const [rejectionReason, setRejectionReason] = useState("");

    const filtered = useMemo(() => {
        return payments.filter((p) => {
            const matchesQuery =
                p.storeName.toLowerCase().includes(query.toLowerCase()) || p.referenceNumber.includes(query);
            const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
            return matchesQuery && matchesStatus;
        });
    }, [payments, query, statusFilter]);

    const pendingCount = payments.filter((p) => p.status === "PENDING").length;

    function openPaymentReview(payment: Payment) {
        setSelectedPayment(payment);
        setReviewAction(null);
        setRejectionReason("");
    }

    function closePaymentReview() {
        setSelectedPayment(null);
        setReviewAction(null);
        setRejectionReason("");
    }

    function confirmApproval() {
        if (!selectedPayment) return;
        setPayments((curr) =>
            curr.map((p) => (p.id === selectedPayment.id ? { ...p, status: "APPROVED" } : p))
        );
        closePaymentReview();
    }

    function confirmRejection() {
        if (!selectedPayment || !rejectionReason) return;
        setPayments((curr) =>
            curr.map((p) => (p.id === selectedPayment.id ? { ...p, status: "REJECTED", rejectionReason } : p))
        );
        closePaymentReview();
    }

    return (
        <div className="flex min-h-screen bg-[#FFFDF8] font-sans text-[#1A1220]">
            <PlatformAdminSidebar onOpenSettings={() => {}} />

            <AdminPageShell>
                <AdminHeader title="Payments" subtitle="Verify GCash proof before approving a plan" />

                <AdminSection>
                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="min-w-55 flex-1">
                            <SearchInput
                                value={query}
                                onChange={setQuery}
                                placeholder="Search by store or reference number..."
                            />
                        </div>
                        <SelectFilter
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={["ALL", "PENDING", "APPROVED", "REJECTED"]}
                        />
                        <div className="ml-auto text-[11px]">
                            <span className="font-semibold text-[#A56607]">{pendingCount}</span>{" "}
                            <span className="text-[#8A7D92]">awaiting review</span>
                        </div>
                    </div>

                    {/* Table */}
                    <Card className="overflow-hidden p-0">
                        <table className="w-full text-left text-xs">
                            <thead>
                            <tr className="border-b border-[#EEE8F2] text-[10px] uppercase tracking-wide text-[#8A7D92]">
                                <th className="px-5 py-3 font-semibold">Store</th>
                                <th className="px-5 py-3 font-semibold">Plan / Amount</th>
                                <th className="px-5 py-3 font-semibold">Reference no.</th>
                                <th className="px-5 py-3 font-semibold">Submitted</th>
                                <th className="px-5 py-3 font-semibold">Status</th>
                                <th className="px-5 py-3 text-right font-semibold">Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filtered.map((p) => {
                                const stale = p.status === "PENDING" && hoursPending(p.submittedAt) > 24;
                                return (
                                    <tr
                                        key={p.id}
                                        className="border-b border-[#F3EFE3] transition last:border-0 hover:bg-[#FAF8FF]"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <AvatarBadge initials={p.initials} bg="bg-[#F1EBFF]" text="text-[#6D35D4]" />
                                                <div className="min-w-0">
                                                    <p className="truncate text-[13px] font-semibold leading-5 text-[#30243A]">
                                                        {p.storeName}
                                                    </p>
                                                    <p className="truncate text-[10px] font-medium text-[#806A8C]">{p.ownerEmail}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <PlanBadge plan={p.requestedPlan} />
                                            <div className="mt-1 text-[10px] text-[#8A7D92]">
                                                {"\u20B1"}
                                                {p.amount.toLocaleString("en-PH")}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 font-mono text-[10px] text-[#4B3E55]">{p.referenceNumber}</td>
                                        <td className="px-5 py-4 text-[#4B3E55]">
                                            {formatDateTime(p.submittedAt)}
                                            {stale && <div className="text-[9px] text-[#C32F2F]">pending 24h+</div>}
                                        </td>
                                        <td className="px-5 py-4">
                                            <StatusPill label={p.status} tone={STATUS_TONE[p.status]} />
                                            {p.status === "REJECTED" && p.rejectionReason && (
                                                <div className="mt-1 text-[9px] text-[#C32F2F]">{p.rejectionReason}</div>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <PrimaryButton onClick={() => openPaymentReview(p)}>
                                                <Eye size={13} /> Review
                                            </PrimaryButton>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                        {filtered.length === 0 && (
                            <div className="px-6 py-12 text-center text-xs text-[#B0A2BE]">
                                No payments match these filters.
                            </div>
                        )}
                    </Card>
                </AdminSection>
            </AdminPageShell>

            {selectedPayment && (
                <Modal
                    title="Review Payment"
                    subtitle={`${selectedPayment.storeName} (${selectedPayment.requestedPlan} Plan)`}
                    onClose={closePaymentReview}
                >
                    <div className="space-y-3 text-xs">
                        <p>
                            <span className="font-semibold text-[#8A7D92]">Reference Number:</span>{" "}
                            <strong className="text-[#1A1220]">{selectedPayment.referenceNumber}</strong>
                        </p>
                        <p>
                            <span className="font-semibold text-[#8A7D92]">Amount Submitted:</span>{" "}
                            <strong className="text-[#1A1220]">
                                {"\u20B1"}
                                {selectedPayment.amount}
                            </strong>
                        </p>
                        <p>
                            <span className="font-semibold text-[#8A7D92]">Payment Date:</span>{" "}
                            <strong className="text-[#1A1220]">{selectedPayment.paymentDate}</strong>
                        </p>

                        <div className="rounded-xl border border-dashed border-[#E6DDF0] bg-[#FAF8FF] p-4 text-center">
                            <FileImage size={24} className="mx-auto text-[#6D35D4]" />
                            <p className="mt-1 font-bold text-[#1A1220]">{selectedPayment.proofFileName}</p>
                            <p className="text-[10px] text-[#8A7D92]">GCash Receipt Proof</p>
                        </div>
                    </div>

                    {reviewAction === null && (
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setReviewAction("reject")}
                                className="rounded-xl bg-[#FFF0F0] px-4 py-2 text-xs font-semibold text-[#C32F2F]"
                            >
                                Reject Payment
                            </button>
                            <button
                                type="button"
                                onClick={() => setReviewAction("approve")}
                                className="rounded-xl bg-[#16834A] px-4 py-2 text-xs font-semibold text-white"
                            >
                                Approve Payment
                            </button>
                        </div>
                    )}

                    {reviewAction === "approve" && (
                        <div className="mt-6 rounded-xl bg-[#E6F7EE] p-4">
                            <p className="text-xs font-bold text-[#16834A]">Confirm Plan Activation?</p>
                            <div className="mt-3 flex justify-end gap-2">
                                <GhostButton onClick={() => setReviewAction(null)}>Cancel</GhostButton>
                                <button
                                    type="button"
                                    onClick={confirmApproval}
                                    className="rounded-lg bg-[#16834A] px-3 py-1.5 text-xs font-semibold text-white"
                                >
                  <span className="inline-flex items-center gap-1">
                    <Check size={13} /> Confirm
                  </span>
                                </button>
                            </div>
                        </div>
                    )}

                    {reviewAction === "reject" && (
                        <div className="mt-6 space-y-3 rounded-xl bg-[#FFF0F0] p-4">
                            <p className="text-xs font-bold text-[#C32F2F]">Select Rejection Reason</p>
                            <select
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full rounded-lg border border-[#E6DDF0] bg-white p-2 text-xs outline-none"
                            >
                                <option value="">Select reason...</option>
                                {REJECTION_REASONS.map((r) => (
                                    <option key={r} value={r}>
                                        {r}
                                    </option>
                                ))}
                            </select>
                            <div className="flex justify-end gap-2">
                                <GhostButton onClick={() => setReviewAction(null)}>Cancel</GhostButton>
                                <button
                                    type="button"
                                    disabled={!rejectionReason}
                                    onClick={confirmRejection}
                                    className="rounded-lg bg-[#C32F2F] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                                >
                                    Confirm Rejection
                                </button>
                            </div>
                        </div>
                    )}
                </Modal>
            )}
        </div>
    );
}