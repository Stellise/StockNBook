"use client";

import { useMemo, useState, type ReactNode } from "react";
import PlatformAdminSidebar from "../dashboard/PlatformAdminSidebar";
import { Ban, KeyRound, MoreVertical, Search, Trash2, Users as UsersIcon } from "lucide-react";
import {
    AdminHeader,
    AdminPageShell,
    AdminSection,
    AvatarBadge,
    Card,
    PlanBadge,
    SearchInput,
    SelectFilter,
    StatusPill,
} from "../_components/AdminUI";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Plan = "Starter" | "Business" | "Enterprise";
type AccountStatus = "Active" | "Trial" | "Suspended" | "Expired";

interface StoreUser {
    id: string;
    storeName: string;
    ownerName: string;
    email: string;
    plan: Plan;
    status: AccountStatus;
    signupDate: string; // ISO date
    lastActive: string; // ISO date
    inventoryItemCount: number;
    totalPaid: number; // lifetime, PHP
    initials: string;
}

// ---------------------------------------------------------------------------
// Mock data — same stores as the dashboard, swap for a real fetch later
// ---------------------------------------------------------------------------

const MOCK_USERS: StoreUser[] = [
    {
        id: "u1",
        storeName: "ABC Party Supplies",
        ownerName: "Juan Dela Cruz",
        email: "abcparty@gmail.com",
        plan: "Business",
        status: "Active",
        signupDate: "2025-11-02",
        lastActive: "2026-08-20",
        inventoryItemCount: 214,
        totalPaid: 5940,
        initials: "AB",
    },
    {
        id: "u2",
        storeName: "Happy Events",
        ownerName: "Maria Santos",
        email: "happyevents@gmail.com",
        plan: "Enterprise",
        status: "Active",
        signupDate: "2025-06-14",
        lastActive: "2026-08-21",
        inventoryItemCount: 892,
        totalPaid: 24500,
        initials: "HA",
    },
    {
        id: "u3",
        storeName: "Party World",
        ownerName: "Anne Reyes",
        email: "partyworld@gmail.com",
        plan: "Enterprise",
        status: "Active",
        signupDate: "2026-01-29",
        lastActive: "2026-08-15",
        inventoryItemCount: 156,
        totalPaid: 2970,
        initials: "PW",
    },
    {
        id: "u4",
        storeName: "Fiesta Supplier",
        ownerName: "Rina Flores",
        email: "fiesta.supplier@gmail.com",
        plan: "Business",
        status: "Trial",
        signupDate: "2026-08-10",
        lastActive: "2026-08-19",
        inventoryItemCount: 38,
        totalPaid: 0,
        initials: "FS",
    },
    {
        id: "u5",
        storeName: "CE Events Supply",
        ownerName: "Carmela Enriquez",
        email: "ceevents@gmail.com",
        plan: "Business",
        status: "Suspended",
        signupDate: "2025-03-21",
        lastActive: "2026-06-02",
        inventoryItemCount: 640,
        totalPaid: 18200,
        initials: "CE",
    },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });
}

function formatPeso(amount: number) {
    return `\u20B1${amount.toLocaleString("en-PH")}`;
}

function daysSince(iso: string) {
    return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
}

const STATUS_TONE: Record<AccountStatus, "green" | "purple" | "red" | "neutral"> = {
    Active: "green",
    Trial: "purple",
    Suspended: "red",
    Expired: "neutral",
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function UsersPage() {
    const [query, setQuery] = useState("");
    const [planFilter, setPlanFilter] = useState("All plans");
    const [statusFilter, setStatusFilter] = useState("All statuses");
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const filtered = useMemo(() => {
        return MOCK_USERS.filter((u) => {
            const q = query.toLowerCase();
            const matchesQuery =
                u.storeName.toLowerCase().includes(q) ||
                u.ownerName.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q);
            const matchesPlan = planFilter === "All plans" || u.plan === planFilter;
            const matchesStatus = statusFilter === "All statuses" || u.status === statusFilter;
            return matchesQuery && matchesPlan && matchesStatus;
        });
    }, [query, planFilter, statusFilter]);

    return (
        <div className="flex min-h-screen bg-[#FFFDF8] font-sans text-[#1A1220]">
            <PlatformAdminSidebar onOpenSettings={() => {}} />

            <AdminPageShell>
                <AdminHeader title="Users" subtitle="Every store on the platform, and whether it&apos;s healthy" />

                <AdminSection>
                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative min-w-55 flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B0A2BE]" />
                            <div className="pl-7">
                                <SearchInput value={query} onChange={setQuery} placeholder="Search by store, owner, or email..." />
                            </div>
                        </div>
                        <SelectFilter
                            value={planFilter}
                            onChange={setPlanFilter}
                            options={["All plans", "Starter", "Business", "Enterprise"]}
                        />
                        <SelectFilter
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={["All statuses", "Active", "Trial", "Suspended", "Expired"]}
                        />
                        <div className="ml-auto flex items-center gap-1.5 text-[11px] text-[#8A7D92]">
                            <UsersIcon size={13} />
                            <span className="font-semibold text-[#1A1220]">{filtered.length}</span> of {MOCK_USERS.length} stores
                        </div>
                    </div>

                    {/* Table */}
                    <Card className="overflow-hidden p-0">
                        <table className="w-full text-left text-xs">
                            <thead>
                            <tr className="border-b border-[#EEE8F2] text-[10px] uppercase tracking-wide text-[#8A7D92]">
                                <th className="px-5 py-3 font-semibold">Store</th>
                                <th className="px-5 py-3 font-semibold">Plan</th>
                                <th className="px-5 py-3 font-semibold">Status</th>
                                <th className="px-5 py-3 font-semibold">Signed up</th>
                                <th className="px-5 py-3 font-semibold">Last active</th>
                                <th className="px-5 py-3 font-semibold">Inventory</th>
                                <th className="px-5 py-3 font-semibold">Lifetime paid</th>
                                <th className="px-5 py-3 text-right font-semibold">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filtered.map((u) => {
                                const inactive = daysSince(u.lastActive) > 14;
                                return (
                                    <tr
                                        key={u.id}
                                        className="border-b border-[#F3EFE3] transition last:border-0 hover:bg-[#FAF8FF]"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <AvatarBadge initials={u.initials} bg="bg-[#F1EBFF]" text="text-[#6D35D4]" />
                                                <div className="min-w-0">
                                                    <p className="truncate text-[13px] font-semibold leading-5 text-[#30243A]">
                                                        {u.storeName}
                                                    </p>
                                                    <p className="truncate text-[10px] font-medium text-[#806A8C]">
                                                        {u.ownerName} &middot; {u.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <PlanBadge plan={u.plan} />
                                        </td>
                                        <td className="px-5 py-4">
                                            <StatusPill label={u.status} tone={STATUS_TONE[u.status]} />
                                        </td>
                                        <td className="px-5 py-4 text-[#4B3E55]">{formatDate(u.signupDate)}</td>
                                        <td className="px-5 py-4">
                        <span className={inactive ? "font-semibold text-[#C32F2F]" : "text-[#4B3E55]"}>
                          {formatDate(u.lastActive)}
                        </span>
                                            {inactive && <div className="text-[9px] text-[#C32F2F]">inactive 14d+</div>}
                                        </td>
                                        <td className="px-5 py-4 text-[#4B3E55]">{u.inventoryItemCount} items</td>
                                        <td className="px-5 py-4 font-semibold text-[#1A1220]">{formatPeso(u.totalPaid)}</td>
                                        <td className="relative px-5 py-4 text-right">
                                            <button
                                                onClick={() => setOpenMenuId(openMenuId === u.id ? null : u.id)}
                                                className="rounded-md p-1.5 hover:bg-[#F3EEFF]"
                                                aria-label={`Actions for ${u.storeName}`}
                                            >
                                                <MoreVertical className="h-4 w-4 text-[#8A7D92]" />
                                            </button>
                                            {openMenuId === u.id && (
                                                <div className="absolute right-5 top-11 z-10 w-52 rounded-xl border border-[#E6DDF0] bg-white py-1 text-left shadow-2xl">
                                                    <MenuAction icon={<KeyRound size={14} />} label="Reset password" />
                                                    <MenuAction
                                                        icon={<Ban size={14} />}
                                                        label={u.status === "Suspended" ? "Reactivate account" : "Suspend account"}
                                                        danger={u.status !== "Suspended"}
                                                    />
                                                    <MenuAction icon={<Trash2 size={14} />} label="Delete store" danger />
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                        {filtered.length === 0 && (
                            <div className="px-6 py-12 text-center text-xs text-[#B0A2BE]">
                                No stores match these filters.
                            </div>
                        )}
                    </Card>
                </AdminSection>
            </AdminPageShell>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Small components
// ---------------------------------------------------------------------------

function MenuAction({
                        icon,
                        label,
                        danger = false,
                    }: {
    icon: ReactNode;
    label: string;
    danger?: boolean;
}) {
    return (
        <button
            className={`flex w-full items-center gap-2 px-3 py-2 text-xs font-medium transition hover:bg-[#F3EFE3] ${
                danger ? "text-[#C32F2F]" : "text-[#1A1220]"
            }`}
        >
            {icon}
            {label}
        </button>
    );
}