"use client";

import { useMemo, useState } from "react";
import PlatformAdminSidebar from "../dashboard/PlatformAdminSidebar";
import { History, ToggleLeft, ToggleRight } from "lucide-react";
import {
    AdminHeader,
    AdminPageShell,
    AdminSection,
    Card,
    GhostButton,
    Modal,
    PlanBadge,
    SearchInput,
    SelectFilter,
    StatusPill,
} from "../_components/AdminUI";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Plan = "Starter" | "Business" | "Enterprise";
type SubStatus = "Active" | "Expiring" | "Expired" | "Cancelled";

interface PlanChange {
    date: string; // ISO
    from: string;
    to: string;
}

interface Subscription {
    id: string;
    storeName: string;
    plan: Plan;
    startDate: string; // ISO
    renewalDate: string; // ISO
    autoRenew: boolean;
    status: SubStatus;
    history: PlanChange[];
}

// ---------------------------------------------------------------------------
// Mock data — matches the dashboard's Renewal Watch entries
// ---------------------------------------------------------------------------

const MOCK_SUBS: Subscription[] = [
    {
        id: "s1",
        storeName: "Party World",
        plan: "Enterprise",
        startDate: "2026-01-29",
        renewalDate: "2026-06-29",
        autoRenew: false,
        status: "Expiring",
        history: [],
    },
    {
        id: "s2",
        storeName: "CE Events Supply",
        plan: "Business",
        startDate: "2025-03-21",
        renewalDate: "2026-07-02",
        autoRenew: true,
        status: "Expiring",
        history: [{ date: "2025-09-01", from: "Starter", to: "Business" }],
    },
    {
        id: "s3",
        storeName: "ABC Party Supplies",
        plan: "Business",
        startDate: "2025-11-02",
        renewalDate: "2026-07-03",
        autoRenew: true,
        status: "Expiring",
        history: [],
    },
    {
        id: "s4",
        storeName: "Fiesta Supplier",
        plan: "Business",
        startDate: "2026-08-10",
        renewalDate: "2026-09-10",
        autoRenew: false,
        status: "Active",
        history: [],
    },
    {
        id: "s5",
        storeName: "Happy Events",
        plan: "Enterprise",
        startDate: "2025-06-14",
        renewalDate: "2026-08-14",
        autoRenew: true,
        status: "Active",
        history: [
            { date: "2025-06-14", from: "—", to: "Business" },
            { date: "2025-12-01", from: "Business", to: "Enterprise" },
        ],
    },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_TONE: Record<SubStatus, "green" | "gold" | "red" | "neutral"> = {
    Active: "green",
    Expiring: "gold",
    Expired: "red",
    Cancelled: "neutral",
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });
}

function daysUntil(iso: string) {
    return Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SubscriptionsPage() {
    const [subs] = useState<Subscription[]>(MOCK_SUBS);
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All statuses");
    const [historyFor, setHistoryFor] = useState<Subscription | null>(null);

    const filtered = useMemo(() => {
        return subs
            .filter((s) => {
                const matchesQuery = s.storeName.toLowerCase().includes(query.toLowerCase());
                const matchesStatus = statusFilter === "All statuses" || s.status === statusFilter;
                return matchesQuery && matchesStatus;
            })
            .sort((a, b) => new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime());
    }, [subs, query, statusFilter]);

    return (
        <div className="flex min-h-screen bg-[#FFFDF8] font-sans text-[#1A1220]">
            <PlatformAdminSidebar onOpenSettings={() => {}} />

            <AdminPageShell>
                <AdminHeader
                    title="Subscriptions"
                    subtitle="When each store&apos;s relationship needs action — renew, expire, or change"
                />

                <AdminSection>
                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="min-w-55 flex-1">
                            <SearchInput value={query} onChange={setQuery} placeholder="Search by store..." />
                        </div>
                        <SelectFilter
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={["All statuses", "Active", "Expiring", "Expired", "Cancelled"]}
                        />
                    </div>

                    {/* Table */}
                    <Card className="overflow-hidden p-0">
                        <table className="w-full text-left text-xs">
                            <thead>
                            <tr className="border-b border-[#EEE8F2] text-[10px] uppercase tracking-wide text-[#8A7D92]">
                                <th className="px-5 py-3 font-semibold">Store</th>
                                <th className="px-5 py-3 font-semibold">Plan</th>
                                <th className="px-5 py-3 font-semibold">Started</th>
                                <th className="px-5 py-3 font-semibold">Renews / expires</th>
                                <th className="px-5 py-3 font-semibold">Auto-renew</th>
                                <th className="px-5 py-3 font-semibold">Status</th>
                                <th className="px-5 py-3 text-right font-semibold">History</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filtered.map((s) => {
                                const days = daysUntil(s.renewalDate);
                                const urgent = s.status === "Expiring" && days <= 7;
                                return (
                                    <tr
                                        key={s.id}
                                        className="border-b border-[#F3EFE3] transition last:border-0 hover:bg-[#FAF8FF]"
                                    >
                                        <td className="px-5 py-4 text-[13px] font-semibold text-[#30243A]">{s.storeName}</td>
                                        <td className="px-5 py-4">
                                            <PlanBadge plan={s.plan} />
                                        </td>
                                        <td className="px-5 py-4 text-[#4B3E55]">{formatDate(s.startDate)}</td>
                                        <td className="px-5 py-4">
                                            <div className="text-[#4B3E55]">{formatDate(s.renewalDate)}</div>
                                            {(s.status === "Active" || s.status === "Expiring") && (
                                                <div className={`text-[9px] font-semibold ${urgent ? "text-[#C32F2F]" : "text-[#B0A2BE]"}`}>
                                                    {days >= 0 ? `${days}d left` : `${Math.abs(days)}d overdue`}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                        <span
                            className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${
                                s.autoRenew ? "text-[#16834A]" : "text-[#B0A2BE]"
                            }`}
                        >
                          {s.autoRenew ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                            {s.autoRenew ? "On" : "Off — needs manual renewal"}
                        </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <StatusPill label={s.status} tone={STATUS_TONE[s.status]} />
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <button
                                                onClick={() => setHistoryFor(s)}
                                                disabled={s.history.length === 0}
                                                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#7A6A84] hover:text-[#1A1220] disabled:cursor-not-allowed disabled:opacity-30"
                                            >
                                                <History size={13} />
                                                {s.history.length === 0 ? "None" : `${s.history.length} change${s.history.length > 1 ? "s" : ""}`}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                        {filtered.length === 0 && (
                            <div className="px-6 py-12 text-center text-xs text-[#B0A2BE]">
                                No subscriptions match these filters.
                            </div>
                        )}
                    </Card>
                </AdminSection>
            </AdminPageShell>

            {historyFor && (
                <Modal title={historyFor.storeName} subtitle="Plan change history" onClose={() => setHistoryFor(null)}>
                    <ol className="mb-5 space-y-3">
                        {historyFor.history.map((h) => (
                            <li key={`${h.date}-${h.to}`} className="flex items-center gap-3 text-xs">
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#6D35D4]" />
                                <span className="w-20 shrink-0 text-[10px] text-[#8A7D92]">{formatDate(h.date)}</span>
                                <span className="text-[#1A1220]">
                  {h.from} <span className="text-[#B0A2BE]">&rarr;</span>{" "}
                                    <strong>{h.to}</strong>
                </span>
                            </li>
                        ))}
                    </ol>
                    <GhostButton onClick={() => setHistoryFor(null)}>Close</GhostButton>
                </Modal>
            )}
        </div>
    );
}