"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import PlatformAdminSidebar from "./PlatformAdminSidebar";
import {
    Activity,
    CheckCircle2,
    Clock3,
    DollarSign,
    Eye,
    FileImage,
    Package,
    Pencil,
    PieChart,
    QrCode,
    RefreshCw,
    Sparkles,
    TrendingUp,
    Users,
    X,
} from "lucide-react";

type Plan = "Starter" | "Business" | "Enterprise";
type PaymentStatus = "PENDING" | "APPROVED" | "REJECTED";
type ReviewAction = "approve" | "reject" | null;

type GCashPaymentSettings = {
    accountName: string;
    gcashNumber: string;
    instruction: string;
    qrImage: string;
};

const PAYMENT_SETTINGS_STORAGE_KEY = "stocknbook_platform_gcash_settings";

const defaultGcashPaymentSettings: GCashPaymentSettings = {
    accountName: "StockNBook Admin",
    gcashNumber: "0917 123 4567",
    instruction: "Include your store name",
    qrImage: "/gcash-qr.png",
};

type PaymentRequest = {
    id: string;
    storeName: string;
    ownerName: string;
    ownerEmail: string;
    businessId: string;
    currentPlan: Plan;
    requestedPlan: Plan;
    amount: number;
    referenceNumber: string;
    paymentDate: string;
    submittedAt: string;
    status: PaymentStatus;
    proofFileName: string;
};

type ExpiringSubscription = {
    storeName: string;
    ownerEmail: string;
    plan: Plan;
    expirationDate: string;
    daysLeft: number;
    initials: string;
};

const initialPaymentRequests: PaymentRequest[] = [
    {
        id: "PAY-20260626-001",
        storeName: "ABC Party Supplies",
        ownerName: "Juan Dela Cruz",
        ownerEmail: "abcparty@gmail.com",
        businessId: "BUS-00015",
        currentPlan: "Starter",
        requestedPlan: "Business",
        amount: 499,
        referenceNumber: "1234567890123",
        paymentDate: "June 26, 2026",
        submittedAt: "June 26, 2026, 10:30 AM",
        status: "PENDING",
        proofFileName: "gcash-proof-abc-party.jpg",
    },
    {
        id: "PAY-20260626-002",
        storeName: "Happy Events",
        ownerName: "Maria Santos",
        ownerEmail: "happyevents@gmail.com",
        businessId: "BUS-00019",
        currentPlan: "Business",
        requestedPlan: "Enterprise",
        amount: 1299,
        referenceNumber: "9827345610123",
        paymentDate: "June 26, 2026",
        submittedAt: "June 26, 2026, 9:15 AM",
        status: "PENDING",
        proofFileName: "gcash-proof-happy-events.jpg",
    },
    {
        id: "PAY-20260625-003",
        storeName: "Party World",
        ownerName: "Anne Reyes",
        ownerEmail: "partyworld@gmail.com",
        businessId: "BUS-00023",
        currentPlan: "Starter",
        requestedPlan: "Business",
        amount: 499,
        referenceNumber: "6248091345780",
        paymentDate: "June 25, 2026",
        submittedAt: "June 25, 2026, 4:45 PM",
        status: "PENDING",
        proofFileName: "gcash-proof-party-world.jpg",
    },
    {
        id: "PAY-20260625-004",
        storeName: "Fiesta Supplier",
        ownerName: "Rina Flores",
        ownerEmail: "fiesta.supplier@gmail.com",
        businessId: "BUS-00027",
        currentPlan: "Starter",
        requestedPlan: "Business",
        amount: 499,
        referenceNumber: "7713259874601",
        paymentDate: "June 25, 2026",
        submittedAt: "June 25, 2026, 2:20 PM",
        status: "PENDING",
        proofFileName: "gcash-proof-fiesta-supplier.jpg",
    },
    {
        id: "PAY-20260625-005",
        storeName: "J&P Party Needs",
        ownerName: "Jose Panganiban",
        ownerEmail: "jnpparty@gmail.com",
        businessId: "BUS-00031",
        currentPlan: "Business",
        requestedPlan: "Enterprise",
        amount: 1299,
        referenceNumber: "4561237890412",
        paymentDate: "June 25, 2026",
        submittedAt: "June 25, 2026, 1:05 PM",
        status: "PENDING",
        proofFileName: "gcash-proof-jp-party-needs.jpg",
    },
];

const expiringSubscriptions: ExpiringSubscription[] = [
    {
        storeName: "Party World",
        ownerEmail: "partyworld@gmail.com",
        plan: "Enterprise",
        expirationDate: "June 29, 2026",
        daysLeft: 3,
        initials: "PW",
    },
    {
        storeName: "CE Events Supply",
        ownerEmail: "ceevents@gmail.com",
        plan: "Business",
        expirationDate: "July 2, 2026",
        daysLeft: 6,
        initials: "CE",
    },
    {
        storeName: "ABC Party Supplies",
        ownerEmail: "abcparty@gmail.com",
        plan: "Business",
        expirationDate: "July 3, 2026",
        daysLeft: 7,
        initials: "AB",
    },
    {
        storeName: "Fiesta Supplier",
        ownerEmail: "fiesta.supplier@gmail.com",
        plan: "Business",
        expirationDate: "July 4, 2026",
        daysLeft: 8,
        initials: "FS",
    },
];

type PlanDistributionRow = {
    plan: Plan;
    count: number;
    barColor: string;
    trackColor: string;
};

const planDistribution: PlanDistributionRow[] = [
    { plan: "Starter", count: 8, barColor: "#16834A", trackColor: "#E6F7EE" },
    { plan: "Business", count: 7, barColor: "#A56607", trackColor: "#FFF8E8" },
    { plan: "Enterprise", count: 3, barColor: "#6D35D4", trackColor: "#F1EBFF" },
];

type ActivityTone = "purple" | "green" | "gold";

type ActivityItem = {
    id: string;
    title: string;
    detail: string;
    time: string;
    tone: ActivityTone;
    icon: ReactNode;
};

const ACTIVITY_TONE_STYLE: Record<ActivityTone, { bg: string; text: string }> = {
    purple: { bg: "bg-[#F1EBFF]", text: "text-[#6D35D4]" },
    green: { bg: "bg-[#E6F7EE]", text: "text-[#16834A]" },
    gold: { bg: "bg-[#FFF8E8]", text: "text-[#A56607]" },
};

const recentActivity: ActivityItem[] = [
    {
        id: "act-1",
        title: "Fiesta Supplier submitted payment proof",
        detail: "Requesting upgrade to Business",
        time: "20 min ago",
        tone: "purple",
        icon: <FileImage size={15} />,
    },
    {
        id: "act-2",
        title: "Happy Events upgraded to Enterprise",
        detail: "Payment approved by admin",
        time: "2 hours ago",
        tone: "green",
        icon: <CheckCircle2 size={15} />,
    },
    {
        id: "act-3",
        title: "Party World subscription renewed",
        detail: "Business plan, valid until June 2027",
        time: "5 hours ago",
        tone: "gold",
        icon: <RefreshCw size={15} />,
    },
    {
        id: "act-4",
        title: "New store registered: J&P Party Needs",
        detail: "Starter plan, pending verification",
        time: "1 day ago",
        tone: "purple",
        icon: <Sparkles size={15} />,
    },
    {
        id: "act-5",
        title: "ABC Party Supplies payment approved",
        detail: "Upgraded from Starter to Business",
        time: "1 day ago",
        tone: "green",
        icon: <CheckCircle2 size={15} />,
    },
];

function PlanBadge({ plan }: { plan: Plan }) {
    const badgeStyle =
        plan === "Starter"
            ? "border-[#B7E5C2] bg-[#E6F6EA] text-[#226B36]"
            : plan === "Business"
                ? "border-[#F4D79A] bg-[#FFF8E8] text-[#A56607]"
                : "border-[#D8C5F3] bg-[#F1EBFF] text-[#6D35D4]";

    return (
        <span className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold ${badgeStyle}`}>
            {plan}
        </span>
    );
}

function TopKpiCard({
                        title,
                        value,
                        trend,
                        icon,
                        iconClass,
                    }: {
    title: string;
    value: string | number;
    trend: string;
    icon: ReactNode;
    iconClass: string;
}) {
    return (
        <article className="flex min-h-[128px] items-center gap-5 rounded-[16px] border border-[#E6DDF0] bg-white px-5 py-5 shadow-sm">
            <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${iconClass}`}>
                {icon}
            </span>
            <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold leading-5 text-[#4B3E55]">{title}</p>
                <p className="mt-2 truncate text-[26px] font-bold leading-none tracking-[-0.03em] text-[#1A1220]">{value}</p>
                <div className="mt-2 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#E6F7EE] px-2 py-0.5 text-[11px] font-bold text-[#16834A]">
                        <TrendingUp size={12} /> {trend}
                    </span>
                    <span className="text-[11px] text-[#8A7D92]">vs last period</span>
                </div>
            </div>
        </article>
    );
}

export default function PlatformAdminDashboardPage() {
    const [paymentRequests, setPaymentRequests] = useState(initialPaymentRequests);
    const [selectedPayment, setSelectedPayment] = useState<PaymentRequest | null>(null);
    const [reviewAction, setReviewAction] = useState<ReviewAction>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [gcashSettings, setGcashSettings] = useState<GCashPaymentSettings>(defaultGcashPaymentSettings);
    const [gcashSettingsForm, setGcashSettingsForm] = useState<GCashPaymentSettings>(defaultGcashPaymentSettings);
    const [isGcashSettingsOpen, setIsGcashSettingsOpen] = useState(false);

    useEffect(() => {
        try {
            const savedSettings = window.localStorage.getItem(PAYMENT_SETTINGS_STORAGE_KEY);
            if (!savedSettings) return;
            const parsedSettings = JSON.parse(savedSettings) as Partial<GCashPaymentSettings>;
            const resolvedSettings = { ...defaultGcashPaymentSettings, ...parsedSettings };
            setGcashSettings(resolvedSettings);
            setGcashSettingsForm(resolvedSettings);
        } catch {}
    }, []);

    function openGcashSettings() {
        setGcashSettingsForm(gcashSettings);
        setIsGcashSettingsOpen(true);
    }

    function closeGcashSettings() {
        setGcashSettingsForm(gcashSettings);
        setIsGcashSettingsOpen(false);
    }

    function handleGcashQrUpload(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file || !file.type.startsWith("image/")) return;

        const fileReader = new FileReader();
        fileReader.onload = () => {
            const uploadedImage = String(fileReader.result || "");
            if (!uploadedImage) return;
            setGcashSettingsForm((current) => ({ ...current, qrImage: uploadedImage }));
        };
        fileReader.readAsDataURL(file);
    }

    function saveGcashSettings() {
        const savedSettings: GCashPaymentSettings = {
            accountName: gcashSettingsForm.accountName.trim() || defaultGcashPaymentSettings.accountName,
            gcashNumber: gcashSettingsForm.gcashNumber.trim() || defaultGcashPaymentSettings.gcashNumber,
            instruction: gcashSettingsForm.instruction.trim() || defaultGcashPaymentSettings.instruction,
            qrImage: gcashSettingsForm.qrImage || defaultGcashPaymentSettings.qrImage,
        };

        setGcashSettings(savedSettings);
        setGcashSettingsForm(savedSettings);

        try {
            window.localStorage.setItem(PAYMENT_SETTINGS_STORAGE_KEY, JSON.stringify(savedSettings));
        } catch {}

        setIsGcashSettingsOpen(false);
    }

    const pendingCount = paymentRequests.filter((p) => p.status === "PENDING").length;

    const filteredPayments = useMemo(() => {
        return paymentRequests.filter((p) => p.status === "PENDING");
    }, [paymentRequests]);

    function openPaymentReview(payment: PaymentRequest) {
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
        setPaymentRequests((curr) =>
            curr.map((p) => (p.id === selectedPayment.id ? { ...p, status: "APPROVED" } : p))
        );
        closePaymentReview();
    }

    function confirmRejection() {
        if (!selectedPayment || !rejectionReason) return;
        setPaymentRequests((curr) =>
            curr.map((p) => (p.id === selectedPayment.id ? { ...p, status: "REJECTED" } : p))
        );
        closePaymentReview();
    }

    return (
        <div className="flex min-h-screen bg-[#FFFDF8] font-sans text-[#1A1220]">
            <PlatformAdminSidebar onOpenSettings={openGcashSettings} />

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="sticky top-0 z-20 border-b border-[#E9E0EF] bg-[#FFFDF8]/95 font-sans backdrop-blur">
                    <div className="flex min-h-[88px] flex-wrap items-center justify-between gap-4 px-6 py-3">
                        <div className="min-w-0">
                            <h1 className="truncate text-[25px] font-bold tracking-[-0.02em] text-[#1A1220]">
                                Admin Dashboard
                            </h1>
                            <p className="mt-1 truncate text-[12px] text-[#7A6A84]">
                                Overview of your SaaS platform
                            </p>
                        </div>
                    </div>
                </header>

                <section className="flex-1 overflow-y-auto px-6 py-5 font-sans">
                    <div className="mx-auto max-w-none space-y-3.5">

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <TopKpiCard
                                title="Total Users / Stores"
                                value="18"
                                trend="12.0%"
                                icon={<Users size={22} />}
                                iconClass="bg-[#F1EBFF] text-[#6D35D4]"
                            />
                            <TopKpiCard
                                title="Active Subscriptions"
                                value="18"
                                trend="8.0%"
                                icon={<Package size={22} />}
                                iconClass="bg-[#E6F7EE] text-[#16834A]"
                            />
                            <TopKpiCard
                                title="Monthly Revenue"
                                value="₱10,986"
                                trend="24.5%"
                                icon={<DollarSign size={22} />}
                                iconClass="bg-[#FFF8E8] text-[#A56607]"
                            />
                            <TopKpiCard
                                title="Pending Verifications"
                                value={pendingCount}
                                trend="5.2%"
                                icon={<Clock3 size={22} />}
                                iconClass="bg-[#FFF0F0] text-[#C32F2F]"
                            />
                        </div>

                        <div className="grid gap-3.5 lg:grid-cols-2">
                            <div className="rounded-[16px] border border-[#E6DDF0] bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between gap-3 border-b border-[#EEE8F2] pb-4">
                                    <div className="min-w-0">
                                        <h2 className="truncate text-[18px] font-bold leading-6 text-[#24152F]">Payment Verification</h2>
                                        <p className="mt-0.5 truncate text-[9px] leading-5 text-[#8A7D92]">Verify GCash proof for new plan approvals</p>
                                    </div>
                                    <button
                                        type="button"
                                        className="shrink-0 rounded-lg border border-[#E6DDF0] bg-[#FAF8FF] px-4 py-2 text-[10px] font-semibold text-[#6D35D4] transition hover:bg-[#F3EEFF]"
                                    >
                                        View all
                                    </button>
                                </div>

                                <div className="mt-4 space-y-3">
                                    {filteredPayments.slice(0, 4).map((item) => (
                                        <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#E6DDF0] p-3 transition hover:bg-[#FAF8FF]">
                                            <div className="flex min-w-0 flex-1 items-center gap-3">
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F1EBFF] text-xs font-bold text-[#6D35D4]">
                                                {item.storeName.substring(0, 2).toUpperCase()}
                                            </span>
                                                <div className="min-w-0">
                                                    <p className="truncate text-[13px] font-semibold leading-5 text-[#30243A]">{item.storeName}</p>
                                                    <p className="truncate text-[10px] font-medium text-[#806A8C]">{item.ownerEmail}</p>
                                                </div>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-3">
                                                <PlanBadge plan={item.requestedPlan} />
                                                <button
                                                    type="button"
                                                    onClick={() => openPaymentReview(item)}
                                                    className="inline-flex items-center gap-1 rounded-xl bg-[#2B174C] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1B0D31]"
                                                >
                                                    <Eye size={13} /> Review
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-[16px] border border-[#E6DDF0] bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between gap-3 border-b border-[#EEE8F2] pb-4">
                                    <div className="min-w-0">
                                        <h2 className="truncate text-[18px] font-bold leading-6 text-[#24152F]">Renewal Watch</h2>
                                        <p className="mt-0.5 truncate text-[9px] leading-5 text-[#8A7D92]">Stores expiring within the next 7 days</p>
                                    </div>
                                    <button
                                        type="button"
                                        className="shrink-0 rounded-lg border border-[#E6DDF0] bg-[#FAF8FF] px-4 py-2 text-[10px] font-semibold text-[#6D35D4] transition hover:bg-[#F3EEFF]"
                                    >
                                        View all
                                    </button>
                                </div>

                                <div className="mt-4 space-y-3">
                                    {expiringSubscriptions.map((sub) => (
                                        <div key={sub.storeName} className="flex items-center justify-between gap-3 rounded-xl border border-[#E6DDF0] p-3 transition hover:bg-[#FAF8FF]">
                                            <div className="flex min-w-0 flex-1 items-center gap-3">
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFF8E8] text-xs font-bold text-[#A56607]">
                                                {sub.initials}
                                            </span>
                                                <div className="min-w-0">
                                                    <p className="truncate text-[13px] font-semibold leading-5 text-[#30243A]">{sub.storeName}</p>
                                                    <p className="truncate text-[10px] font-medium text-[#806A8C]">Expires {sub.expirationDate}</p>
                                                </div>
                                            </div>
                                            <span className="shrink-0 rounded-full bg-[#FFF0F0] px-2.5 py-1 text-[10px] font-bold text-[#C32F2F]">
                                            {sub.daysLeft}d left
                                        </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-3.5 lg:grid-cols-2">
                            <div className="rounded-[16px] border border-[#E6DDF0] bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between gap-3 border-b border-[#EEE8F2] pb-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F1EBFF] text-[#6D35D4]">
                                            <PieChart size={18} />
                                        </span>
                                        <div className="min-w-0">
                                            <h2 className="truncate text-[18px] font-bold leading-6 text-[#24152F]">Plan Distribution</h2>
                                            <p className="mt-0.5 truncate text-[9px] leading-5 text-[#8A7D92]">How your 18 stores break down by plan</p>
                                        </div>
                                    </div>
                                    <span className="shrink-0 rounded-full bg-[#FAF8FF] px-3 py-1 text-[10px] font-bold text-[#6D35D4]">
                                        18 total
                                    </span>
                                </div>

                                <div className="mt-5 space-y-4">
                                    {planDistribution.map((row) => {
                                        const percent = Math.round((row.count / 18) * 100);
                                        return (
                                            <div key={row.plan}>
                                                <div className="flex items-center justify-between text-[12px]">
                                                    <span className="font-semibold text-[#30243A]">{row.plan}</span>
                                                    <span className="font-bold text-[#1A1220]">
                                                        {row.count} <span className="font-medium text-[#8A7D92]">({percent}%)</span>
                                                    </span>
                                                </div>
                                                <div
                                                    className="mt-1.5 h-2.5 w-full rounded-full"
                                                    style={{ backgroundColor: row.trackColor }}
                                                >
                                                    <div
                                                        className="h-2.5 rounded-full transition-all"
                                                        style={{ width: `${percent}%`, backgroundColor: row.barColor }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-5 grid grid-cols-3 gap-3 border-t border-[#EEE8F2] pt-4">
                                    {planDistribution.map((row) => (
                                        <div key={row.plan} className="rounded-xl border border-[#E6DDF0] px-3 py-2.5 text-center">
                                            <p className="text-[18px] font-bold leading-none" style={{ color: row.barColor }}>
                                                {row.count}
                                            </p>
                                            <p className="mt-1 text-[10px] font-semibold text-[#8A7D92]">{row.plan}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-[16px] border border-[#E6DDF0] bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between gap-3 border-b border-[#EEE8F2] pb-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E6F7EE] text-[#16834A]">
                                            <Activity size={18} />
                                        </span>
                                        <div className="min-w-0">
                                            <h2 className="truncate text-[18px] font-bold leading-6 text-[#24152F]">Recent Activity</h2>
                                            <p className="mt-0.5 truncate text-[9px] leading-5 text-[#8A7D92]">Latest actions across the platform</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 space-y-3">
                                    {recentActivity.map((item, index) => (
                                        <div key={item.id} className="relative flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <span
                                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${ACTIVITY_TONE_STYLE[item.tone].bg} ${ACTIVITY_TONE_STYLE[item.tone].text}`}
                                                >
                                                    {item.icon}
                                                </span>
                                                {index < recentActivity.length - 1 && (
                                                    <span className="mt-1 w-px flex-1 bg-[#EEE8F2]" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1 pb-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="truncate text-[13px] font-semibold leading-5 text-[#30243A]">{item.title}</p>
                                                    <span className="shrink-0 whitespace-nowrap text-[10px] font-medium text-[#8A7D92]">{item.time}</span>
                                                </div>
                                                <p className="truncate text-[11px] text-[#8A7D92]">{item.detail}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[16px] border border-[#E6DDF0] bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between border-b border-[#EEE8F2] pb-4">
                                <div className="flex min-w-0 flex-1 items-center gap-3">
                                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F1EBFF] text-[#6D35D4]">
                                    <QrCode size={22} />
                                </span>
                                    <div className="min-w-0">
                                        <h3 className="truncate text-[18px] font-bold leading-6 text-[#24152F]">GCash Platform Payment Settings</h3>
                                        <p className="mt-0.5 truncate text-[9px] leading-5 text-[#8A7D92]">Manage payment QR and instructions shown to store owners</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={openGcashSettings}
                                    className="inline-flex h-[42px] shrink-0 items-center gap-2 rounded-xl bg-[#2B174C] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1B0D31]"
                                >
                                    <Pencil size={14} /> Edit GCash Settings
                                </button>
                            </div>

                            <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row">
                                <img
                                    src={gcashSettings.qrImage}
                                    alt="GCash QR Code"
                                    className="h-28 w-28 rounded-xl border border-[#E6DDF0] bg-[#FAF8FF] p-2 object-contain"
                                />
                                <div className="space-y-2 text-xs">
                                    <p><span className="font-semibold text-[#8A7D92]">Account Name:</span> <strong className="text-[#1A1220]">{gcashSettings.accountName}</strong></p>
                                    <p><span className="font-semibold text-[#8A7D92]">GCash Number:</span> <strong className="text-[#1A1220]">{gcashSettings.gcashNumber}</strong></p>
                                    <p><span className="font-semibold text-[#8A7D92]">Instructions:</span> <strong className="text-[#1A1220]">{gcashSettings.instruction}</strong></p>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>
            </div>

            {isGcashSettingsOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-[18px] border border-[#E6DDF0] bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#EEE8F2] pb-4">
                            <h3 className="text-lg font-bold text-[#1A1220]">Edit GCash Details</h3>
                            <button type="button" onClick={closeGcashSettings} className="text-[#806A8C] hover:text-[#1A1220]">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mt-4 space-y-4 text-xs">
                            <div className="flex items-center gap-4">
                                <img src={gcashSettingsForm.qrImage} alt="Preview" className="h-20 w-20 rounded-lg border border-[#E6DDF0] p-1 object-contain" />
                                <label className="cursor-pointer rounded-xl border border-[#E6DDF0] bg-[#FAF8FF] px-3.5 py-2 text-xs font-semibold text-[#6D35D4] transition hover:bg-[#F1EBFF]">
                                    Upload New QR
                                    <input type="file" accept="image/*" onChange={handleGcashQrUpload} className="hidden" />
                                </label>
                            </div>

                            <label className="block space-y-1">
                                <span className="font-semibold text-[#1A1220]">Account Name</span>
                                <input
                                    value={gcashSettingsForm.accountName}
                                    onChange={(e) => setGcashSettingsForm((c) => ({ ...c, accountName: e.target.value }))}
                                    className="w-full rounded-xl border border-[#E6DDF0] p-2.5 outline-none transition focus:border-[#2B174C]"
                                />
                            </label>

                            <label className="block space-y-1">
                                <span className="font-semibold text-[#1A1220]">GCash Number</span>
                                <input
                                    value={gcashSettingsForm.gcashNumber}
                                    onChange={(e) => setGcashSettingsForm((c) => ({ ...c, gcashNumber: e.target.value }))}
                                    className="w-full rounded-xl border border-[#E6DDF0] p-2.5 outline-none transition focus:border-[#2B174C]"
                                />
                            </label>

                            <label className="block space-y-1">
                                <span className="font-semibold text-[#1A1220]">Instruction</span>
                                <input
                                    value={gcashSettingsForm.instruction}
                                    onChange={(e) => setGcashSettingsForm((c) => ({ ...c, instruction: e.target.value }))}
                                    className="w-full rounded-xl border border-[#E6DDF0] p-2.5 outline-none transition focus:border-[#2B174C]"
                                />
                            </label>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button type="button" onClick={closeGcashSettings} className="rounded-xl border border-[#E6DDF0] px-4 py-2 text-xs font-semibold text-[#7A6A84] hover:bg-[#FAF8FF]">
                                Cancel
                            </button>
                            <button type="button" onClick={saveGcashSettings} className="rounded-xl bg-[#2B174C] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#1B0D31]">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-[18px] border border-[#E6DDF0] bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#EEE8F2] pb-4">
                            <div>
                                <h3 className="text-lg font-bold text-[#1A1220]">Review Payment</h3>
                                <p className="text-xs text-[#8A7D92]">{selectedPayment.storeName} ({selectedPayment.requestedPlan} Plan)</p>
                            </div>
                            <button type="button" onClick={closePaymentReview} className="text-[#806A8C] hover:text-[#1A1220]">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mt-4 space-y-3 text-xs">
                            <p><span className="font-semibold text-[#8A7D92]">Reference Number:</span> <strong className="text-[#1A1220]">{selectedPayment.referenceNumber}</strong></p>
                            <p><span className="font-semibold text-[#8A7D92]">Amount Submitted:</span> <strong className="text-[#1A1220]">₱{selectedPayment.amount}</strong></p>
                            <p><span className="font-semibold text-[#8A7D92]">Payment Date:</span> <strong className="text-[#1A1220]">{selectedPayment.paymentDate}</strong></p>

                            <div className="rounded-xl border border-dashed border-[#E6DDF0] bg-[#FAF8FF] p-4 text-center">
                                <FileImage size={24} className="mx-auto text-[#6D35D4]" />
                                <p className="mt-1 font-bold text-[#1A1220]">{selectedPayment.proofFileName}</p>
                                <p className="text-[10px] text-[#8A7D92]">GCash Receipt Proof</p>
                            </div>
                        </div>

                        {reviewAction === null && (
                            <div className="mt-6 flex justify-end gap-3">
                                <button type="button" onClick={() => setReviewAction("reject")} className="rounded-xl bg-[#FFF0F0] px-4 py-2 text-xs font-semibold text-[#C32F2F]">
                                    Reject Payment
                                </button>
                                <button type="button" onClick={() => setReviewAction("approve")} className="rounded-xl bg-[#16834A] px-4 py-2 text-xs font-semibold text-white">
                                    Approve Payment
                                </button>
                            </div>
                        )}

                        {reviewAction === "approve" && (
                            <div className="mt-6 rounded-xl bg-[#E6F7EE] p-4">
                                <p className="text-xs font-bold text-[#16834A]">Confirm Plan Activation?</p>
                                <div className="mt-3 flex justify-end gap-2">
                                    <button type="button" onClick={() => setReviewAction(null)} className="rounded-lg border border-[#E6DDF0] bg-white px-3 py-1.5 text-xs font-semibold text-[#1A1220]">Cancel</button>
                                    <button type="button" onClick={confirmApproval} className="rounded-lg bg-[#16834A] px-3 py-1.5 text-xs font-semibold text-white">Confirm</button>
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
                                    <option value="Payment not found">Payment not found</option>
                                    <option value="Incorrect amount">Incorrect amount</option>
                                    <option value="Invalid reference number">Invalid reference number</option>
                                </select>
                                <div className="flex justify-end gap-2">
                                    <button type="button" onClick={() => setReviewAction(null)} className="rounded-lg border border-[#E6DDF0] bg-white px-3 py-1.5 text-xs font-semibold text-[#1A1220]">Cancel</button>
                                    <button type="button" disabled={!rejectionReason} onClick={confirmRejection} className="rounded-lg bg-[#C32F2F] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">Confirm Rejection</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}