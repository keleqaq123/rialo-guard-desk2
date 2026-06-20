import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUpRight,
  Archive,
  BadgeCheck,
  BookUser,
  Cable,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CalendarDays,
  Star,
  Play,
  ArrowRight,
  ClipboardList,
  Copy,
  Droplets,
  FileKey2,
  Gauge,
  Globe2,
  Home,
  KeyRound,
  Layers3,
  LockKeyhole,
  Menu,
  Network,
  Plus,
  RefreshCcw,
  Repeat,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Terminal,
  UserRound,
  WalletCards,
  XCircle,
} from "lucide-react";

const USER_ID = "user_001";
const DEFAULT_WALLET = "5TAJ9oAsfZD4XccMFMA5KqkW1PyC89nqS89msHi7CcT";

const teamNav = [
  { key: "team-home", label: "Home", icon: Home },
  { key: "operations", label: "Operations", icon: ClipboardList },
  { key: "approval", label: "Approval Manager", icon: ShieldCheck, badge: "SAFETY" },
  { key: "guard", label: "Guard API", icon: Cable },
  { key: "address", label: "Address Book", icon: BookUser },
  { key: "policies", label: "Policies", icon: Layers3 },
  { key: "vault", label: "Vault & Audit", icon: KeyRound },
];

const userNav = [
  { key: "user-home", label: "User Home", icon: UserRound },
  { key: "wallet", label: "Built-in Wallet", icon: WalletCards },
  { key: "user-request", label: "New Request", icon: Send },
  { key: "recurring", label: "Recurring Payments", icon: Repeat },
  { key: "swap", label: "Swap / Bridge", icon: RefreshCcw },
  { key: "faucet", label: "Faucet / Balance", icon: Droplets },
];

const now = () => "now";
const id = (prefix) => `${prefix}_${Math.random().toString(16).slice(2, 26)}`;
const short = (value = "") => (value.length > 12 ? `${value.slice(0, 6)}...${value.slice(-5)}` : value || "—");
const maskSecret = (value = "") => (value.length > 18 ? `${value.slice(0, 8)}••••••${value.slice(-6)}` : "••••••");

function randomPrivateKey() {
  const chars = "abcdef0123456789";
  let out = "0x";
  for (let i = 0; i < 64; i += 1) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function deriveAddress(privateKey = "") {
  let hash = 2166136261;
  const input = String(privateKey || "rialo-wallet");
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const a = (hash >>> 0).toString(16).padStart(8, "0");
  const b = Math.abs(Array.from(input).reduce((sum, ch, i) => sum + ch.charCodeAt(0) * (i + 17), 0)).toString(16).padStart(8, "0");
  return `5TAJ${a}${b}${a}${b}`.slice(0, 44);
}

const initialAddressBook = [
  { label: "Treasury Wallet", address: DEFAULT_WALLET, list_type: "trusted" },
  { label: "API Provider", address: "api-provider", list_type: "trusted" },
  { label: "Payroll Wallet", address: "payroll-wallet", list_type: "trusted" },
  { label: "Blocked Wallet", address: "blocked_wallet", list_type: "blocked" },
];

const initialPolicies = [
  { name: "Daily transfer ceiling", value: "≤ 10,000 RIAL", status: "Active" },
  { name: "Unknown recipient review", value: "Manual approval", status: "Active" },
  { name: "Blocked recipient rule", value: "Deny execution", status: "Strict" },
  { name: "Recurring payment activation", value: "Approval required before activation", status: "Active" },
  { name: "Secret export", value: "Blocked", status: "Strict" },
];



const chainOptions = [
  { id: "rialo", name: "Rialo", subtitle: "Rialo Devnet", color: "bg-sky-500" },
  { id: "ethereum", name: "Ethereum", subtitle: "EVM", color: "bg-indigo-500" },
  { id: "solana", name: "Solana", subtitle: "SVM", color: "bg-emerald-500" },
  { id: "base", name: "Base", subtitle: "L2", color: "bg-blue-500" },
];

const tokenOptions = {
  rialo: ["USDC", "USDT", "RIAL"],
  ethereum: ["USDC", "USDT"],
  solana: ["USDC", "USDT"],
  base: ["USDC", "USDT"],
};

const initialSwapBalances = {
  rialo: { USDC: 2588.4, USDT: 1840.2, RIAL: 12000 },
  ethereum: { USDC: 850.25, USDT: 420.1 },
  solana: { USDC: 620.75, USDT: 300.5 },
  base: { USDC: 1000.0, USDT: 720.0 },
};

const tokenPrices = {
  USDC: 1,
  USDT: 1,
  RIAL: 0.25,
};

const seedOperations = [
  {
    id: "op_seed_transfer",
    type: "Transfer",
    target: short(DEFAULT_WALLET),
    recipient_raw: DEFAULT_WALLET,
    amount: "1 RIAL",
    amount_raw: 1,
    risk: "Medium",
    state: "Pending approval",
    time: "2m ago",
    policy_reasons: ["Transfer is waiting for manual review", "Approval-first execution is enabled"],
    required_approvals: 2,
    approvals: [],
    user_id: null,
  },
  {
    id: "op_seed_secret",
    type: "Secret encryption",
    target: "service-api-key",
    recipient_raw: null,
    amount: "—",
    amount_raw: null,
    risk: "Low",
    state: "Encrypted",
    time: "12m ago",
    policy_reasons: ["Secret was encrypted and only a preview is stored"],
    required_approvals: 0,
    approvals: [],
    user_id: null,
  },
];

function runPolicyCheck(addressBook, request) {
  const amount = Number(request.amount || 0);
  const recipient = String(request.recipient || "").trim();
  const reasons = [];
  let allowed = true;
  let risk = "Low";
  let required_approvals = 0;

  const blocked = addressBook.some((item) => item.address === recipient && item.list_type === "blocked");
  const trusted = addressBook.some((item) => item.address === recipient && item.list_type === "trusted");

  if (!recipient) {
    allowed = false;
    risk = "High";
    reasons.push("Recipient is required.");
  }

  if (blocked) {
    allowed = false;
    risk = "High";
    reasons.push("Recipient is on the blocked address list.");
  }

  if (!trusted && recipient && !blocked) {
    risk = risk === "High" ? risk : "Medium";
    required_approvals = Math.max(required_approvals, 1);
    reasons.push("Recipient is not in the trusted address book.");
  }

  if (amount > 10000) {
    risk = "High";
    required_approvals = Math.max(required_approvals, 2);
    reasons.push("Amount exceeds the high-value transfer threshold.");
  } else if (amount > 2000) {
    risk = risk === "High" ? risk : "Medium";
    required_approvals = Math.max(required_approvals, 1);
    reasons.push("Amount requires manual approval.");
  }

  if (request.operation_type?.toLowerCase().includes("recurring")) {
    required_approvals = Math.max(required_approvals, 1);
    reasons.push("Recurring payments require approval before activation.");
  }

  if (reasons.length === 0) reasons.push("All policy checks passed.");
  return { allowed, risk, reasons, required_approvals };
}

function operationFromPolicy({ type, recipient, amount, policy, user_id = null, amountLabel = null }) {
  const state = !policy.allowed ? "Blocked" : policy.required_approvals > 0 ? "Pending approval" : "Approved";
  return {
    id: id("op"),
    type,
    target: short(recipient),
    recipient_raw: recipient,
    amount: amountLabel || `${amount} RIAL`,
    amount_raw: Number(amount),
    risk: policy.risk,
    state,
    time: now(),
    policy_reasons: policy.reasons,
    required_approvals: policy.required_approvals,
    approvals: [],
    user_id,
  };
}

function tone(value = "") {
  const v = String(value).toLowerCase();
  if (v.includes("pending") || v.includes("waiting") || v.includes("review")) return "warn";
  if (v.includes("approved") || v.includes("encrypted") || v.includes("recorded") || v.includes("active")) return "good";
  if (v.includes("reject") || v.includes("block") || v.includes("cancel")) return "bad";
  return "neutral";
}

function StatusPill({ children, type = "neutral" }) {
  const styles = {
    good: "border-emerald-400/30 bg-emerald-400/12 text-emerald-700",
    warn: "border-amber-400/40 bg-amber-400/12 text-amber-700",
    bad: "border-red-400/30 bg-red-400/12 text-red-700",
    neutral: "border-sky-400/30 bg-sky-400/12 text-sky-700",
    dark: "border-white/10 bg-white/10 text-white",
  };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[type]}`}>{children}</span>;
}

function Toast({ toast, onClose }) {
  if (!toast) return null;
  return <div className="toast-shell fixed bottom-6 right-6 z-50 max-w-sm rounded-[24px] p-4"><div className="flex items-start gap-3">{toast.type === "bad" ? <XCircle className="mt-0.5 text-rose-300" size={19} /> : <CheckCircle2 className="mt-0.5 text-emerald-200" size={19} />}<div className="min-w-0 flex-1"><div className="text-sm font-medium text-white">{toast.title}</div><div className="mt-1 text-sm leading-5 text-white/50">{toast.body}</div></div><button onClick={onClose} className="text-white/30 transition hover:text-white">×</button></div></div>;
}

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [activePage, setActivePage] = useState("team-home");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [teamOpen, setTeamOpen] = useState(true);
  const [userOpen, setUserOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [addressBook, setAddressBook] = useState(initialAddressBook);
  const [operations, setOperations] = useState(seedOperations);
  const [selectedId, setSelectedId] = useState(seedOperations[0]?.id);
  const [policies] = useState(initialPolicies);
  const [vault, setVault] = useState({ name: "service-api-key", preview: "No encrypted secret yet" });
  const [timeline, setTimeline] = useState([
    { title: "Workspace ready", body: "Application workspace is active.", time: "now" },
    { title: "Policy engine loaded", body: "Address book, approval, recurring payment, and audit rules are active.", time: "now" },
  ]);
  const [recurring, setRecurring] = useState([
    {
      id: "rec_001",
      user_id: USER_ID,
      recipient: "api-provider",
      amount: 50,
      frequency: "monthly",
      start_date: "2026-06-01",
      end_date: "",
      status: "Pending approval",
      risk: "Medium",
      required_approvals: 1,
      policy_reasons: ["Recurring payment requires approval before activation.", "Recipient is checked by the policy engine."],
    },
  ]);
  const [balanceResult, setBalanceResult] = useState(null);
  const [swapBalances, setSwapBalances] = useState(initialSwapBalances);
  const [swapHistory, setSwapHistory] = useState([]);
  const [embeddedWallet, setEmbeddedWallet] = useState({
    address: DEFAULT_WALLET,
    privateKey: "",
    source: "Built-in wallet",
    imported: false,
  });
  const [guardResult, setGuardResult] = useState(null);
  const [addressRisk, setAddressRisk] = useState(null);
  const [toast, setToast] = useState(null);

  const selected = operations.find((item) => item.id === selectedId) || operations[0];
  const userRequests = operations.filter((item) => item.user_id === USER_ID);

  const metrics = useMemo(() => {
    const pending = operations.filter((op) => op.state.toLowerCase().includes("pending") || op.state.toLowerCase().includes("waiting")).length;
    const blocked = operations.filter((op) => /blocked|rejected/i.test(op.state)).length;
    const encrypted = operations.filter((op) => op.type === "Secret encryption").length;
    const trusted = addressBook.filter((item) => item.list_type === "trusted").length;
    return [
      { label: "Pending Reviews", value: pending, note: "Operations waiting for approval" },
      { label: "Trusted Addresses", value: trusted, note: "Allowed recipients" },
      { label: "Policy Blocks", value: blocked, note: "Rejected or blocked operations" },
      { label: "Secrets Encrypted", value: encrypted, note: "Vault preview records" },
    ];
  }, [operations, addressBook]);

  function notify(title, body, type = "good") {
    setToast({ title, body, type });
    window.clearTimeout(window.__rialoToastTimer);
    window.__rialoToastTimer = window.setTimeout(() => setToast(null), 2600);
  }

  function addTimeline(title, body) {
    setTimeline((cur) => [{ title, body, time: "now" }, ...cur].slice(0, 10));
  }

  function addOperation(operation) {
    setOperations((cur) => [operation, ...cur]);
    setSelectedId(operation.id);
  }

  function approveSelected({ approver, role }) {
    if (!selected) return;
    const name = approver?.trim() || "UI Reviewer";
    const required = Math.max(Number(selected.required_approvals || 0), 1);
    let finalState = selected.state;
    let updatedOperation = null;

    setOperations((cur) =>
      cur.map((op) => {
        if (op.id !== selected.id) return op;
        if (/approved|encrypted|recorded/i.test(op.state)) {
          updatedOperation = op;
          return op;
        }
        if (/blocked|rejected/i.test(op.state)) {
          updatedOperation = op;
          return op;
        }
        const duplicateCount = op.approvals.filter((item) => item.approver.startsWith(name)).length;
        const approvalName = duplicateCount ? `${name} #${duplicateCount + 1}` : name;
        const approvals = [...op.approvals, { approver: approvalName, role, time: "now" }];
        finalState = approvals.length >= required ? "Approved" : `Pending approval ${approvals.length}/${required}`;
        updatedOperation = { ...op, approvals, state: finalState, time: "now" };
        return updatedOperation;
      })
    );

    notify("Approval recorded", finalState === "Approved" ? "The operation is now approved." : `Approval progress updated for ${selected.id}.`);
    addTimeline("Approval recorded", `${name} approved ${selected.type} as ${role}.`);
  }

  function rejectSelected() {
    if (!selected) return;
    setOperations((cur) => cur.map((op) => (op.id === selected.id ? { ...op, state: "Rejected", time: "now" } : op)));
    notify("Operation rejected", `${selected.type} was rejected.`, "bad");
    addTimeline("Operation rejected", `${selected.id} was rejected from Approval Manager.`);
  }

  const pageProps = {
    activePage,
    setActivePage,
    addressBook,
    setAddressBook,
    operations,
    setOperations,
    selected,
    setSelectedId,
    policies,
    vault,
    setVault,
    timeline,
    addTimeline,
    recurring,
    setRecurring,
    metrics,
    userRequests,
    addOperation,
    approveSelected,
    rejectSelected,
    notify,
    guardResult,
    setGuardResult,
    addressRisk,
    setAddressRisk,
    balanceResult,
    setBalanceResult,
    swapBalances,
    setSwapBalances,
    swapHistory,
    setSwapHistory,
    embeddedWallet,
    setEmbeddedWallet,
  };

  if (showLanding) {
    return (
      <LandingPage
        onEnter={(destination = "team-home") => {
          setActivePage(destination);
          setShowLanding(false);
        }}
      />
    );
  }

  return (
    <div className="desk-shell min-h-screen overflow-x-hidden text-white">
      <CinematicBackdrop />
      <div className="desk-noise" aria-hidden="true" />
      <style>{`
        .thin-scroll::-webkit-scrollbar{width:6px;height:6px}.thin-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,.16);border-radius:999px}.thin-scroll::-webkit-scrollbar-track{background:transparent}
      `}</style>
      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        activePage={activePage}
        setActivePage={setActivePage}
        teamOpen={teamOpen}
        setTeamOpen={setTeamOpen}
        userOpen={userOpen}
        setUserOpen={setUserOpen}
        embeddedWallet={embeddedWallet}
      />
      <main className={`desk-main min-h-screen transition-all duration-500 ${sidebarOpen ? "pl-[276px]" : "pl-[72px]"}`}>
        <TopBar search={search} setSearch={setSearch} activePage={activePage} setActivePage={setActivePage} onBackToSite={() => setShowLanding(true)} />
        <div className="relative z-10 pt-[86px]">
          {activePage === "team-home" && <TeamHomePage {...pageProps} />}
          {activePage === "operations" && <OperationsPage {...pageProps} search={search} />}
          {activePage === "approval" && <ApprovalPage {...pageProps} search={search} />}
          {activePage === "guard" && <GuardPage {...pageProps} />}
          {activePage === "address" && <AddressBookPage {...pageProps} />}
          {activePage === "policies" && <PoliciesPage {...pageProps} />}
          {activePage === "vault" && <VaultAuditPage {...pageProps} />}
          {activePage === "user-home" && <UserHomePage {...pageProps} />}
          {activePage === "wallet" && <WalletPage {...pageProps} />}
          {activePage === "user-request" && <UserRequestPage {...pageProps} />}
          {activePage === "recurring" && <RecurringPage {...pageProps} />}
          {activePage === "swap" && <SwapBridgePage {...pageProps} />}
          {activePage === "faucet" && <FaucetPage {...pageProps} />}
        </div>
      </main>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}



function LandingPage({ onEnter }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [
    ["Personal Wallet", "wallet"],
    ["Team Guard", "team-home"],
    ["Approvals", "approval"],
    ["Audit", "vault"],
  ];
  return (
    <div className="landing-shell min-h-screen overflow-hidden bg-black text-white">
      <video className="landing-video" src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4" muted autoPlay loop playsInline preload="auto" />
      <div className="landing-bottom-blur" aria-hidden="true" />
      <div className="landing-vignette" aria-hidden="true" />
      <header className="relative z-20 flex items-center justify-between px-4 py-4 sm:px-6 md:px-12 md:py-6">
        <button onClick={() => onEnter("team-home")} className="landing-logo animate-blur-fade-up" style={{ animationDelay: "0ms" }}><span className="landing-logo-orb"><ShieldCheck size={15} /></span><span>Rialo <em>Guard</em></span></button>
        <nav className="hidden items-center gap-7 lg:flex">
          {links.map(([label, page], index) => <button key={page} onClick={() => onEnter(page)} className="animate-blur-fade-up text-sm text-white/76 transition hover:text-white" style={{ animationDelay: `${100 + index * 50}ms` }}>{label}</button>)}
        </nav>
        <div className="hidden items-center gap-2 sm:flex">
          <button onClick={() => onEnter("operations")} className="liquid-glass animate-blur-fade-up inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white" style={{ animationDelay: "350ms" }}>Explore <Search size={16} /></button>
          <button onClick={() => onEnter("wallet")} className="landing-user animate-blur-fade-up" style={{ animationDelay: "400ms" }}><UserRound size={17} /></button>
        </div>
        <button onClick={() => setMenuOpen((v) => !v)} className="landing-menu liquid-glass animate-blur-fade-up rounded-full p-2.5 lg:hidden" style={{ animationDelay: "350ms" }} aria-label="Toggle navigation">
          <Menu className={`absolute transition-all duration-500 ${menuOpen ? "rotate-180 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100"}`} size={18} />
          <XCircle className={`transition-all duration-500 ${menuOpen ? "rotate-0 scale-100 opacity-100" : "-rotate-180 scale-50 opacity-0"}`} size={18} />
        </button>
      </header>
      <div className={`landing-mobile-menu ${menuOpen ? "is-open" : ""}`}>
        <div className="mx-auto max-w-xl px-6 py-4">{links.map(([label, page], index) => <button key={page} onClick={() => onEnter(page)} className="landing-mobile-link" style={{ transitionDelay: `${index * 50}ms` }}>{label}<ChevronRight size={16} /></button>)}<div className="mt-3 flex gap-2 border-t border-white/10 pt-4 sm:hidden"><button onClick={() => onEnter("operations")} className="liquid-glass rounded-full px-4 py-2 text-sm">Explore</button><button onClick={() => onEnter("wallet")} className="liquid-glass rounded-full px-4 py-2 text-sm">Wallet</button></div></div>
      </div>
      <main className="relative z-10 flex min-h-[calc(100vh-86px)] flex-col justify-end px-4 pb-8 sm:px-6 md:px-12 md:pb-16">
        <div className="flex flex-col items-start gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <div className="animate-blur-fade-up flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/75 sm:text-sm" style={{ animationDelay: "300ms" }}><span className="inline-flex items-center gap-1.5"><Star size={15} fill="currentColor" />Safety-first execution</span><span className="inline-flex items-center gap-1.5"><Clock3 size={15} />Personal + team flows</span><span className="inline-flex items-center gap-1.5"><CalendarDays size={15} />Rialo Devnet demo</span></div>
            <h1 className="landing-title animate-blur-fade-up mt-6" style={{ animationDelay: "400ms" }}>Every move.<br className="hidden sm:block" /> <em>Guarded.</em></h1>
            <p className="animate-blur-fade-up mt-5 max-w-xl text-base leading-7 text-white/66 sm:text-lg" style={{ animationDelay: "500ms" }}>A cinematic personal wallet and team control desk for approvals, swap flows, agent budgets, and audit-ready onchain execution.</p>
            <div className="mt-7 flex flex-wrap gap-3 sm:mt-9"><button onClick={() => onEnter("wallet")} className="landing-primary animate-blur-fade-up" style={{ animationDelay: "600ms" }}><Play size={17} fill="currentColor" />Enter Personal Wallet</button><button onClick={() => onEnter("team-home")} className="liquid-glass animate-blur-fade-up rounded-full px-6 py-3 text-sm font-medium text-white" style={{ animationDelay: "700ms" }}>Open Team Guard</button></div>
          </div>
          <div className="flex gap-2"><button onClick={() => onEnter("wallet")} className="landing-arrow animate-blur-fade-up" style={{ animationDelay: "800ms" }}><ChevronLeft size={18} />Wallet</button><button onClick={() => onEnter("team-home")} className="landing-arrow animate-blur-fade-up" style={{ animationDelay: "900ms" }}>Team<ChevronRight size={18} /></button></div>
        </div>
      </main>
    </div>
  );
}

function CinematicBackdrop() {
  return (
    <div className="cinematic-backdrop" aria-hidden="true">
      <video
        className="cinematic-backdrop-video"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4"
        muted
        autoPlay
        loop
        playsInline
        preload="auto"
      />
      <div className="cinematic-shade" />
      <div className="ambient-light ambient-one" />
      <div className="ambient-light ambient-two" />
    </div>
  );
}

function Sidebar({ open, setOpen, activePage, setActivePage, teamOpen, setTeamOpen, userOpen, setUserOpen, embeddedWallet }) {
  const width = open ? "w-[276px]" : "w-[72px]";
  return (
    <aside className={`brand-rail fixed left-0 top-0 z-40 flex h-screen ${width} flex-col text-white transition-all duration-500`}>
      <div className="flex h-[86px] items-center justify-between px-4">
        <button onClick={() => setActivePage("team-home")} className="flex items-center gap-3 overflow-hidden text-left">
          <div className="logo-mark flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
            <ShieldCheck size={18} />
          </div>
          {open ? (
            <div>
              <div className="text-[15px] font-semibold tracking-[-0.035em]">Rialo <span className="text-white/55">Guard</span></div>
              <div className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.25em] text-white/35">Execution desk</div>
            </div>
          ) : null}
        </button>
        {open ? <button onClick={() => setOpen(false)} className="rounded-full p-2 text-white/35 transition hover:bg-white/[.07] hover:text-white"><ChevronLeft size={17} /></button> : null}
      </div>

      {!open ? (
        <div className="flex flex-1 flex-col items-center gap-2 py-4">
          <button onClick={() => setOpen(true)} className="liquid-glass rounded-full p-3 text-white"><Menu size={17} /></button>
          {[...teamNav, ...userNav].map((item) => {
            const Icon = item.icon;
            const selected = activePage === item.key;
            return <button key={item.key} onClick={() => setActivePage(item.key)} className={`nav-dot ${selected ? "is-active" : ""}`} title={item.label}><Icon size={17} /></button>;
          })}
        </div>
      ) : (
        <>
          <div className="px-4 pb-3">
            <div className="network-chip"><span className="network-pulse" />Rialo Devnet <span className="ml-auto text-white/35">live</span></div>
          </div>
          <div className="thin-scroll flex-1 overflow-y-auto px-3 pb-6">
            <CollapsibleNav title="Team console" open={teamOpen} setOpen={setTeamOpen} items={teamNav} activePage={activePage} setActivePage={setActivePage} />
            <CollapsibleNav title="Personal wallet" open={userOpen} setOpen={setUserOpen} items={userNav} activePage={activePage} setActivePage={setActivePage} />
          </div>
          <div className="mx-3 mb-4 rounded-[24px] bg-white/[.045] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.09)]">
            <div className="flex items-center gap-2 text-[11px] text-white/45"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,.8)]" />Wallet connected</div>
            <div className="mt-2 font-mono text-[10px] text-white/45">{short(embeddedWallet?.address || DEFAULT_WALLET)}</div>
            <div className="mt-3 flex items-end justify-between"><div><div className="text-[10px] uppercase tracking-[.16em] text-white/30">Portfolio</div><div className="mt-1 text-lg font-medium tracking-[-.04em] text-white">$6,429.10</div></div><button onClick={() => setActivePage("wallet")} className="liquid-glass rounded-full px-3 py-2 text-xs font-medium text-white">Open</button></div>
          </div>
        </>
      )}
    </aside>
  );
}

function CollapsibleNav({ title, open, setOpen, items, activePage, setActivePage }) {
  return (
    <div className="mt-4">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-3 py-2 text-[10px] font-medium uppercase tracking-[.2em] text-white/32 transition hover:text-white/70">
        {title}<ChevronDown size={14} className={`transition duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? <div className="mt-1 space-y-1">{items.map((item) => {
        const Icon = item.icon; const selected = activePage === item.key;
        return <button key={item.key} onClick={() => setActivePage(item.key)} className={`rail-link ${selected ? "is-active" : ""}`}><span className="flex items-center gap-3"><Icon size={16} /><span>{item.label}</span></span>{item.badge ? <span className="text-[9px] tracking-[.12em] text-[#f2ab86]">{item.badge}</span> : null}</button>;
      })}</div> : null}
    </div>
  );
}

function TopBar({ search, setSearch, activePage, onBackToSite }) {
  return (
    <header className="desk-topbar fixed left-0 right-0 top-0 z-30">
      <div className="liquid-glass mx-4 flex h-[58px] items-center justify-between gap-4 rounded-full px-4 sm:mx-6 sm:px-5 lg:mx-8">
        <div className="flex min-w-0 items-center gap-3 text-sm">
          <StatusPill type="good">Network live</StatusPill>
          <span className="hidden font-mono text-[11px] text-white/40 sm:inline">Rialo Devnet</span>
          <span className="hidden text-white/20 sm:inline">/</span>
          <span className="truncate text-[13px] font-medium text-white/75">{pageTitle(activePage)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="search-field hidden h-9 min-w-[240px] items-center gap-2 rounded-full px-3 md:flex">
            <Search size={15} className="text-white/35" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search workspace" className="w-full bg-transparent text-xs text-white outline-none placeholder:text-white/30" />
          </div>
          <button onClick={onBackToSite} className="site-link hidden rounded-full px-3 py-2 text-xs font-medium text-white/76 transition hover:text-white md:inline-flex">Site</button>
          <button onClick={() => window.location.reload()} className="liquid-glass hidden rounded-full px-4 py-2 text-xs font-medium text-white/85 transition hover:bg-white/[.08] sm:inline-flex"><RefreshCcw size={14} className="mr-2" />Reset</button>
          <button className="profile-orb" title="Workspace profile"><UserRound size={15} /></button>
        </div>
      </div>
    </header>
  );
}

function pageTitle(key) {
  const all = [...teamNav, ...userNav];
  return all.find((item) => item.key === key)?.label || "Console";
}

function PageShell({ eyebrow, title, subtitle, children, right }) {
  return (
    <section className="page-shell min-h-[calc(100vh-86px)] px-5 pb-10 pt-6 sm:px-8 lg:px-10">
      <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <div className="eyebrow-label">{eyebrow}</div>
          <h1 className="page-title mt-3">{title}</h1>
          {subtitle ? <p className="mt-3 max-w-2xl text-sm leading-6 text-white/48">{subtitle}</p> : null}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

function Card({ title, subtitle, children, right, className = "" }) {
  return (
    <div className={`glass-panel overflow-hidden rounded-[28px] ${className}`}>
      {(title || right) && <div className="flex items-start justify-between gap-4 px-6 pb-0 pt-6"><div>{title ? <h2 className="text-[15px] font-medium tracking-[-.02em] text-white">{title}</h2> : null}{subtitle ? <p className="mt-1 text-xs leading-5 text-white/42">{subtitle}</p> : null}</div>{right}</div>}
      <div className="p-6">{children}</div>
    </div>
  );
}

function DataRow({ label, value, mono = false, big = false }) {
  return <div className="data-row flex items-center justify-between gap-4 py-2.5 last:border-0"><span className="text-white/42">{label}</span><span className={`${mono ? "font-mono text-[11px]" : ""} ${big ? "text-lg font-medium" : ""} text-right text-white/86`}>{value}</span></div>;
}

function Input({ label, name, defaultValue, type = "text", ...props }) {
  return <label className="mt-4 block text-xs font-medium text-white/46">{label}<input name={name} type={type} defaultValue={defaultValue} className="desk-input mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none" {...props} /></label>;
}

function Select({ label, name, defaultValue, children }) {
  return <label className="mt-4 block text-xs font-medium text-white/46">{label}<select name={name} defaultValue={defaultValue} className="desk-input mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none">{children}</select></label>;
}

function MetricCard({ label, value, note, icon: Icon = Gauge, type = "neutral" }) {
  const accent = type === "good" ? "text-emerald-200" : type === "bad" ? "text-rose-200" : type === "warn" ? "text-amber-100" : "text-sky-200";
  return <div className="metric-card rounded-[26px] p-5"><div className="flex items-start justify-between"><div><div className="text-[11px] font-medium uppercase tracking-[.15em] text-white/38">{label}</div><div className="mt-3 text-4xl font-medium tracking-[-.06em] text-white">{value}</div></div><div className={`metric-icon ${accent}`}><Icon size={18} /></div></div><div className="mt-4 text-xs leading-5 text-white/42">{note}</div></div>;
}

function TeamHomePage({ metrics, operations, setActivePage, selected }) {
  return (
    <PageShell eyebrow="Team console · workspace 01" title="Guard every move before it reaches the chain." subtitle="A cinematic control surface for coordinated wallets, automated agents, and review-first execution.">
      <div className="command-hero relative overflow-hidden rounded-[34px] px-7 py-8 sm:px-10 sm:py-10">
        <video className="command-hero-video" src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_074625_a81f018a-956b-43fb-9aee-4d1508e30e6a.mp4" muted autoPlay loop playsInline preload="auto" />
        <div className="command-hero-wash" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
          <div className="max-w-2xl"><div className="inline-flex items-center gap-2 rounded-full bg-black/20 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[.16em] text-white/65 backdrop-blur-md"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />Policy engine online</div><h2 className="mt-5 max-w-xl text-3xl font-normal tracking-[-.055em] text-white sm:text-4xl">One calm place for every decision that matters.</h2><p className="mt-4 max-w-lg text-sm leading-6 text-white/63">Route transfers, agent actions, and vault events through a human-readable approval layer without losing execution speed.</p><div className="mt-7 flex flex-wrap gap-3"><button onClick={() => setActivePage("operations")} className="hero-primary">Open operations <ArrowUpRight size={15} /></button><button onClick={() => setActivePage("approval")} className="liquid-glass rounded-full px-5 py-3 text-sm font-medium text-white">Review queue</button></div></div>
          <div className="rounded-[26px] bg-black/20 p-5 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,.12)]"><div className="flex items-center justify-between text-[11px] uppercase tracking-[.15em] text-white/45"><span>Active guard</span><span className="text-emerald-200">Live</span></div><div className="mt-6 font-mono text-[11px] leading-6 text-white/70">{`guard.check({\n  operation: "${selected?.type || "Transfer"}",\n  risk: "${selected?.risk || "Medium"}",\n  approvals: "${selected?.approvals?.length || 0}/${selected?.required_approvals || 1}"\n})`}</div><div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-white/56"><span>Last evaluated</span><span>{selected?.time || "now"}</span></div></div>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{metrics.map((m, i) => <MetricCard key={m.label} {...m} icon={[ShieldCheck, BookUser, AlertTriangle, FileKey2][i]} type={i === 0 ? "warn" : i === 1 ? "good" : i === 2 ? "bad" : "neutral"} />)}</div>
      <div className="mt-7 grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <Card title="Quick routes" subtitle="Keep the most important parts of your workspace within reach."><div className="grid gap-3 md:grid-cols-3"><Feature icon={ClipboardList} title="Operations" body="Prepare a transfer and simulate policy before it leaves the workspace." onClick={() => setActivePage("operations")} /><Feature icon={ShieldCheck} title="Approval" body="Review high-signal actions with a clean, shared decision trail." onClick={() => setActivePage("approval")} /><Feature icon={WalletCards} title="Personal wallet" body="Move into the wallet, swap, bridge, and user request experience." onClick={() => setActivePage("wallet")} /></div></Card>
        <div className="editorial-card overflow-hidden rounded-[28px]"><img src="https://images.unsplash.com/photo-1639322537504-6427a16b0a28?auto=format&fit=crop&w=1300&q=85" alt="Abstract cryptographic sculpture" /><div className="editorial-card-overlay" /><div className="relative z-10 flex h-full flex-col justify-end p-6"><div className="text-[10px] uppercase tracking-[.2em] text-white/50">Rialo guard desk</div><div className="mt-2 max-w-sm text-2xl tracking-[-.045em] text-white">A quieter way to orchestrate onchain intent.</div><button onClick={() => setActivePage("vault")} className="mt-5 w-fit text-xs font-medium text-white/75 transition hover:text-white">Explore vault & audit →</button></div></div>
      </div>
    </PageShell>
  );
}

function Feature({ icon: Icon, title, body, onClick }) {
  return <button onClick={onClick} className="feature-tile rounded-[22px] p-5 text-left transition duration-500 hover:-translate-y-1"><div className="feature-icon"><Icon size={18} /></div><div className="mt-5 font-medium tracking-[-.025em] text-white">{title}</div><p className="mt-2 text-xs leading-5 text-white/44">{body}</p><div className="mt-5 text-xs text-white/52">Open →</div></button>;
}

function OperationsPage(props) {
  const { operations, addOperation, addressBook, notify, addTimeline, search } = props;
  const filtered = operations.filter((op) => [op.type, op.target, op.state, op.risk, op.id].join(" ").toLowerCase().includes(search.toLowerCase()));
  function create(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const recipient = form.get("recipient");
    const amount = Number(form.get("amount"));
    const policy = runPolicyCheck(addressBook, { operation_type: "Transfer", recipient, amount });
    const op = operationFromPolicy({ type: "Transfer", recipient, amount, policy });
    addOperation(op);
    addTimeline("Transfer created", `${amount} RIAL to ${short(recipient)} · ${policy.risk} risk.`);
    notify("Transfer created", "The operation was evaluated and added to the queue.");
    e.currentTarget.reset();
  }
  return (
    <PageShell eyebrow="Team Console" title="Operations" subtitle="Create operations and inspect the current execution queue.">
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card title="Create transfer" subtitle="This runs policy checks before adding the operation.">
          <form onSubmit={create}>
            <Input label="Recipient" name="recipient" defaultValue="unknown_wallet_001" required />
            <Input label="Amount" name="amount" type="number" defaultValue="3000" min="1" required />
            <button className="mt-4 w-full rounded-2xl bg-[#3B2A1F] px-4 py-3 font-semibold text-white hover:bg-[#4B382B]">Create operation</button>
          </form>
        </Card>
        <OperationList title="Operation queue" operations={filtered} {...props} />
      </div>
    </PageShell>
  );
}

function OperationList({ title, operations, selected, setSelectedId }) {
  return (
    <Card title={title} subtitle="Select an operation to inspect it.">
      <div className="thin-scroll max-h-[620px] overflow-auto">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="border-b border-[#E8DED0] text-xs uppercase tracking-[0.12em] text-[#75665B]"><tr><th className="px-3 py-3">Operation</th><th className="px-3 py-3">Target</th><th className="px-3 py-3">Amount</th><th className="px-3 py-3">Risk</th><th className="px-3 py-3">State</th><th className="px-3 py-3">Time</th></tr></thead>
          <tbody>{operations.map((op) => <tr key={op.id} onClick={() => setSelectedId(op.id)} className={`cursor-pointer border-b border-[#F1E8DC] hover:bg-[#FFF9F1] ${selected?.id === op.id ? "bg-sky-50" : ""}`}><td className="px-3 py-4"><div className="font-semibold text-[#2B211B]">{op.type}</div><div className="font-mono text-xs text-[#75665B]">{op.id}</div></td><td className="px-3 py-4 font-mono text-xs text-sky-700">{op.target}</td><td className="px-3 py-4">{op.amount}</td><td className="px-3 py-4">{op.risk}</td><td className="px-3 py-4"><StatusPill type={tone(op.state)}>{op.state}</StatusPill></td><td className="px-3 py-4 text-[#75665B]">{op.time}</td></tr>)}</tbody>
        </table>
      </div>
    </Card>
  );
}

function ApprovalPage(props) {
  const { operations, selected, approveSelected, rejectSelected, setSelectedId, search } = props;
  const filtered = operations.filter((op) => !/encrypted/i.test(op.state) && [op.type, op.target, op.state, op.risk, op.id].join(" ").toLowerCase().includes(search.toLowerCase()));
  const [approver, setApprover] = useState("UI Reviewer");
  const [role, setRole] = useState("Reviewer");
  return (
    <PageShell eyebrow="Team Console" title="Approval Manager" subtitle="Approve or reject pending operations.">
      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <OperationList title="Pending items" operations={filtered} {...props} />
        <Card title="Selected review" subtitle={selected?.id} right={<StatusPill type={tone(selected?.state)}>{selected?.state}</StatusPill>}>
          <div className="rounded-2xl border border-[#E8DED0] bg-[#FFF9F1] p-4">
            <DataRow label="Operation" value={selected?.type} />
            <DataRow label="Target" value={selected?.target} mono />
            <DataRow label="Amount" value={selected?.amount} big />
            <DataRow label="Approval" value={`${selected?.approvals?.length || 0} / ${selected?.required_approvals || 1}`} big />
          </div>
          <div className="mt-4 rounded-2xl border border-[#E8DED0] bg-white p-4"><div className="font-semibold">Policy reasons</div><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#75665B]">{(selected?.policy_reasons || []).map((r, i) => <li key={i}>{r}</li>)}</ul></div>
          <div className="mt-4 rounded-2xl border border-[#E8DED0] bg-[#FFF9F1] p-4">
            <div className="font-semibold">Approve as</div>
            <div className="mt-3 grid gap-3 md:grid-cols-2"><input value={approver} onChange={(e) => setApprover(e.target.value)} className="rounded-2xl border border-[#E8DED0] bg-white px-4 py-3 outline-none" /><select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-2xl border border-[#E8DED0] bg-white px-4 py-3 outline-none"><option>Reviewer</option><option>Admin</option><option>Owner</option><option>Security</option></select></div>
            <div className="mt-4 grid grid-cols-2 gap-3"><button onClick={() => approveSelected({ approver, role })} className="rounded-2xl bg-[#3B2A1F] px-4 py-3 font-semibold text-white hover:bg-[#4B382B]">Approve</button><button onClick={rejectSelected} className="rounded-2xl border border-[#E8DED0] bg-white px-4 py-3 font-semibold hover:bg-[#FFF9F1]">Reject</button></div>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}

function GuardPage({ addressBook, guardResult, setGuardResult, notify }) {
  function check(payload) {
    const result = runPolicyCheck(addressBook, payload);
    setGuardResult({ request: payload, policy_result: result });
    notify("Guard check complete", `${result.risk} risk · ${result.allowed ? "Allowed" : "Blocked"}`);
  }
  function submit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    check({ operation_type: form.get("operation_type"), recipient: form.get("recipient"), amount: Number(form.get("amount")) });
  }
  const p = guardResult?.policy_result;
  return (
    <PageShell eyebrow="Team Console" title="Guard API" subtitle="Run policy checks before execution.">
      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card title="External policy check" subtitle="Runs POST /guard/check policy logic.">
          <form onSubmit={submit}><Input label="Operation type" name="operation_type" defaultValue="Transfer" /><Input label="Recipient" name="recipient" defaultValue="unknown_wallet_001" required /><Input label="Amount" name="amount" type="number" defaultValue="3000" min="1" required /><button className="mt-4 w-full rounded-2xl bg-[#3B2A1F] px-4 py-3 font-semibold text-white">Run guard.check()</button></form>
          <div className="mt-5 flex flex-wrap gap-2"><button onClick={() => check({ operation_type: "Transfer", recipient: "unknown_wallet_001", amount: 3000 })} className="rounded-full border border-[#E8DED0] px-3 py-2 text-sm">Unknown recipient</button><button onClick={() => check({ operation_type: "Transfer", recipient: "api-provider", amount: 15000 })} className="rounded-full border border-[#E8DED0] px-3 py-2 text-sm">High value</button><button onClick={() => check({ operation_type: "Recurring payment", recipient: "api-provider", amount: 50 })} className="rounded-full border border-[#E8DED0] px-3 py-2 text-sm">Recurring</button></div>
        </Card>
        <Card title="Policy result" subtitle="Risk, status, reasons, and required approvals.">{p ? <><div className="flex items-center justify-between"><div className="text-3xl font-semibold">{p.risk}</div><StatusPill type={p.allowed ? "good" : "bad"}>{p.allowed ? "Allowed" : "Blocked"}</StatusPill></div><div className="mt-4 rounded-2xl border border-[#E8DED0] bg-[#FFF9F1] p-4"><DataRow label="Required approvals" value={p.required_approvals} /><ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#75665B]">{p.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul></div></> : <div className="rounded-2xl border border-[#E8DED0] bg-[#FFF9F1] p-4 text-[#75665B]">Run a guard check to preview policy risk.</div>}</Card>
      </div>
    </PageShell>
  );
}

function AddressBookPage({ addressBook, setAddressBook, notify, addressRisk, setAddressRisk }) {
  const trusted = addressBook.filter((i) => i.list_type === "trusted").length;
  const blocked = addressBook.filter((i) => i.list_type === "blocked").length;
  function save(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const entry = { label: form.get("label"), address: form.get("address"), list_type: form.get("list_type") };
    setAddressBook((cur) => [entry, ...cur.filter((i) => i.address !== entry.address)]);
    notify("Address saved", `${entry.label} was added as ${entry.list_type}.`);
    e.currentTarget.reset();
  }
  function test(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const result = runPolicyCheck(addressBook, { operation_type: "Transfer", recipient: form.get("test_address"), amount: Number(form.get("test_amount")) });
    setAddressRisk(result);
    notify("Risk test complete", `${result.risk} risk.`);
  }
  return (
    <PageShell eyebrow="Team Console" title="Address Book" subtitle="Manage trusted and blocked recipients for local policy checks.">
      <div className="mb-6 grid gap-4 md:grid-cols-3"><MetricCard label="Total" value={addressBook.length} note="All address records" icon={BookUser} /><MetricCard label="Trusted" value={trusted} note="Allowed recipients" icon={BadgeCheck} type="good" /><MetricCard label="Blocked" value={blocked} note="Denied recipients" icon={AlertTriangle} type="bad" /></div>
      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-6"><Card title="Add address"><form onSubmit={save}><Input label="Label" name="label" defaultValue=" Partner" required /><Input label="Address" name="address" defaultValue="partner-wallet" required /><Select label="Type" name="list_type" defaultValue="trusted"><option value="trusted">trusted</option><option value="blocked">blocked</option></Select><button className="mt-4 w-full rounded-2xl bg-[#3B2A1F] px-4 py-3 font-semibold text-white">Save address</button></form></Card><Card title="Risk test address"><form onSubmit={test}><Input label="Address" name="test_address" defaultValue="partner-wallet" /><Input label="Amount" name="test_amount" type="number" defaultValue="100" /><button className="mt-4 w-full rounded-2xl bg-[#3B2A1F] px-4 py-3 font-semibold text-white">Test risk</button></form>{addressRisk ? <div className="mt-4 rounded-2xl border border-[#E8DED0] bg-white p-4"><StatusPill type={addressRisk.allowed ? "good" : "bad"}>{addressRisk.allowed ? "Allowed" : "Blocked"}</StatusPill><ul className="mt-3 list-disc pl-5 text-sm text-[#75665B]">{addressRisk.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul></div> : null}</Card></div>
        <Card title="Current addresses"><div className="space-y-3">{addressBook.map((item) => <div key={item.address} className="flex items-center justify-between rounded-2xl border border-[#E8DED0] bg-[#FFF9F1] p-4"><div><div className="font-semibold">{item.label}</div><div className="font-mono text-xs text-[#75665B]">{item.address}</div></div><StatusPill type={item.list_type === "blocked" ? "bad" : "good"}>{item.list_type}</StatusPill></div>)}</div></Card>
      </div>
    </PageShell>
  );
}

function PoliciesPage({ policies }) {
  return <PageShell eyebrow="Team Console" title="Policies" subtitle="Policy rules used by the guard engine."><Card title="Policy rules">{policies.map((p) => <div key={p.name} className="mb-3 flex items-center justify-between rounded-2xl border border-[#E8DED0] bg-[#FFF9F1] p-4"><div><div className="font-semibold">{p.name}</div><div className="text-sm text-[#75665B]">{p.value}</div></div><StatusPill type={p.status === "Strict" ? "bad" : "good"}>{p.status}</StatusPill></div>)}</Card></PageShell>;
}

function VaultAuditPage({ vault, setVault, timeline, addTimeline, addOperation, notify }) {
  function encrypt(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = form.get("name");
    const secret = form.get("secret");
    const preview = `encrypted:${btoa(secret).slice(0, 28)}...`;
    setVault({ name, preview });
    addOperation({ id: id("op"), type: "Secret encryption", target: name, amount: "—", amount_raw: null, risk: "Low", state: "Encrypted", time: "now", policy_reasons: ["Secret encrypted.", "Encrypted preview is stored."], required_approvals: 0, approvals: [], user_id: null });
    addTimeline("Secret encrypted", `${name} encrypted in secure workspace mode.`);
    notify("Secret encrypted", "The encrypted preview was saved locally.");
    e.currentTarget.reset();
  }
  return <PageShell eyebrow="Team Console" title="Vault & Audit" subtitle="Encrypt secrets and review audit activity."><div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]"><Card title="Encrypt secret"><form onSubmit={encrypt}><Input label="Secret name" name="name" defaultValue="service-api-key" required /><label className="mt-3 block text-sm font-medium text-[#75665B]">Secret value<textarea name="secret" defaultValue="-secret-value" rows={5} className="mt-2 w-full rounded-2xl border border-[#E8DED0] bg-white px-4 py-3 outline-none" /></label><button className="mt-4 w-full rounded-2xl bg-[#3B2A1F] px-4 py-3 font-semibold text-white">Encrypt secret</button></form><div className="mt-4 rounded-2xl border border-[#E8DED0] bg-[#FFF9F1] p-4"><div className="font-semibold">{vault.name}</div><div className="mt-2 break-all font-mono text-xs text-sky-700">{vault.preview}</div></div></Card><Card title="Audit timeline">{timeline.map((t, i) => <div key={`${t.title}-${i}`} className="mb-4 flex gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-50 text-xs font-semibold text-sky-700">{i + 1}</div><div><div className="font-semibold">{t.title} <span className="font-mono text-xs text-[#75665B]">{t.time}</span></div><div className="text-sm text-[#75665B]">{t.body}</div></div></div>)}</Card></div></PageShell>;
}

function UserHomePage({ userRequests, recurring, setActivePage }) {
  const approved = userRequests.filter((r) => /approved|recorded/i.test(r.state)).length;
  const pending = userRequests.filter((r) => /pending|waiting/i.test(r.state)).length;
  const rejected = userRequests.filter((r) => /rejected|blocked/i.test(r.state)).length;
  return <PageShell eyebrow="Personal wallet · Rialo devnet" title="Your assets, in a safer flow." subtitle="Build, manage, and submit actions from a private wallet experience—then let Guard Desk route anything sensitive to the right people."><div className="personal-hero rounded-[32px] p-7 sm:p-9"><div className="grid gap-7 lg:grid-cols-[1.2fr_.8fr]"><div><div className="text-[10px] uppercase tracking-[.2em] text-white/42">Personal profile</div><div className="mt-4 text-3xl tracking-[-.055em] text-white">User <span className="text-white/45">workspace</span></div><div className="mt-3 font-mono text-xs text-white/45">{short(DEFAULT_WALLET)}</div><div className="mt-7 flex flex-wrap gap-3"><button onClick={() => setActivePage("wallet")} className="hero-primary">Open wallet <WalletCards size={15} /></button><button onClick={() => setActivePage("swap")} className="liquid-glass rounded-full px-5 py-3 text-sm font-medium text-white">Swap / Bridge</button></div></div><div className="rounded-[24px] bg-white/[.055] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.12)]"><div className="text-[10px] uppercase tracking-[.16em] text-white/42">Wallet balance</div><div className="mt-3 text-4xl font-medium tracking-[-.06em] text-white">$6,429<span className="text-white/35">.10</span></div><div className="mt-6 flex items-center justify-between text-xs text-white/50"><span>Rialo Devnet</span><StatusPill type="good">Verified</StatusPill></div></div></div></div><div className="mt-5 grid gap-3 md:grid-cols-3"><MetricCard label="Approved" value={approved} note="Completed or recorded" icon={BadgeCheck} type="good" /><MetricCard label="Pending" value={pending} note="Waiting for review" icon={Activity} type="warn" /><MetricCard label="Rejected" value={rejected} note="Blocked or rejected" icon={AlertTriangle} type="bad" /></div><div className="mt-7 grid gap-5 xl:grid-cols-[.88fr_1.12fr]"><Card title="Personal actions" subtitle="The normal wallet flow, with Guard Desk ready for anything sensitive."><div className="grid gap-3 sm:grid-cols-3"><Feature icon={WalletCards} title="Wallet" body="Create, import, and manage local demo wallet state." onClick={() => setActivePage("wallet")} /><Feature icon={Send} title="New request" body="Send a review-ready transfer request." onClick={() => setActivePage("user-request")} /><Feature icon={Repeat} title="Recurring" body="Set a scheduled action with policy controls." onClick={() => setActivePage("recurring")} /></div></Card><Card title="Recent activity" subtitle="Requests created in your wallet appear here.">{userRequests.length ? userRequests.map((item) => <div key={item.id} className="soft-row mb-3 rounded-[20px] p-4"><div className="flex justify-between gap-3"><div><div className="font-medium text-white">{item.type}</div><div className="mt-1 font-mono text-[10px] text-white/35">{item.id}</div></div><StatusPill type={tone(item.state)}>{item.state}</StatusPill></div><div className="mt-3 grid gap-1 text-sm"><DataRow label="Target" value={item.target} mono /><DataRow label="Amount" value={item.amount} /><DataRow label="Risk" value={item.risk} /></div></div>) : <div className="soft-row rounded-[20px] p-4 text-sm text-white/46">No user requests yet.</div>}</Card></div></PageShell>;
}

function WalletPage({ embeddedWallet, setEmbeddedWallet, swapBalances, setActivePage, notify, addTimeline }) {
  const [privateKeyInput, setPrivateKeyInput] = useState(embeddedWallet?.privateKey || "");
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const rialoBalances = swapBalances?.rialo || { USDC: 0, USDT: 0, RIAL: 0 };
  const totalUsd = Number(rialoBalances.USDC || 0) + Number(rialoBalances.USDT || 0) + Number(rialoBalances.RIAL || 0) * tokenPrices.RIAL;

  function importWallet(e) {
    e.preventDefault();
    const pk = String(privateKeyInput || "").trim();
    if (pk.length < 12) {
      notify("Invalid private key", "Enter a private key or generate one first.", "bad");
      return;
    }
    const address = deriveAddress(pk);
    setEmbeddedWallet({ address, privateKey: pk, source: "Imported private key", imported: true });
    addTimeline("Built-in wallet imported", `Wallet ${short(address)} was imported locally.`);
    notify("Wallet imported", "Built-in wallet is now active.");
  }

  function generateWallet() {
    const pk = randomPrivateKey();
    const address = deriveAddress(pk);
    setPrivateKeyInput(pk);
    setEmbeddedWallet({ address, privateKey: pk, source: "Generated wallet", imported: true });
    addTimeline("Wallet generated", `New local wallet ${short(address)} is active.`);
    notify("Wallet generated", "A local private key was created.");
  }

  function disconnectWallet() {
    setPrivateKeyInput("");
    setShowPrivateKey(false);
    setEmbeddedWallet({ address: DEFAULT_WALLET, privateKey: "", source: "Built-in wallet", imported: false });
    notify("Wallet reset", "Built-in wallet returned to the default address.");
  }

  async function copyAddress() {
    try {
      await navigator.clipboard?.writeText(embeddedWallet.address);
      notify("Address copied", short(embeddedWallet.address));
    } catch {
      notify("Copy unavailable", "Browser clipboard permission is not available.", "bad");
    }
  }

  return (
    <PageShell
      eyebrow="Personal wallet · local demo"
      title="Your wallet, without the noise."
      subtitle="Manage a local demo key, watch balances, and move into Swap / Bridge whenever you are ready. High-risk actions still route back through Guard Desk."
    >
      <section className="wallet-showcase relative overflow-hidden rounded-[34px]">
        <img className="wallet-showcase-image" src="https://images.unsplash.com/photo-1639322537504-6427a16b0a28?auto=format&fit=crop&w=1800&q=88" alt="Abstract network sculpture" />
        <div className="wallet-showcase-wash" />
        <div className="relative z-10 grid gap-7 p-6 sm:p-8 lg:grid-cols-[1.08fr_.92fr] lg:p-10">
          <div className="flex flex-col justify-between">
            <div>
              <div className="wallet-kicker"><span className="wallet-kicker-dot" />Rialo Devnet wallet</div>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="text-[11px] font-medium uppercase tracking-[.18em] text-white/48">Active address</span>
                <StatusPill type={embeddedWallet.imported ? "good" : "neutral"}>{embeddedWallet.imported ? "Imported locally" : "Demo wallet"}</StatusPill>
              </div>
              <div className="mt-3 max-w-xl break-all font-mono text-[13px] leading-6 text-sky-100/90 sm:text-sm">{embeddedWallet.address}</div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={copyAddress} className="liquid-glass rounded-full px-4 py-2.5 text-sm font-medium text-white">Copy address</button>
              <button onClick={() => setActivePage("swap")} className="wallet-primary rounded-full px-5 py-2.5 text-sm font-semibold">Open Swap / Bridge <ArrowUpRight size={15} /></button>
              <button onClick={() => setActivePage("faucet")} className="wallet-secondary rounded-full px-4 py-2.5 text-sm font-medium text-white/82">Faucet</button>
            </div>
          </div>
          <div className="wallet-portfolio-panel rounded-[26px] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div><div className="text-[10px] font-medium uppercase tracking-[.2em] text-white/45">Total portfolio</div><div className="mt-3 text-3xl font-medium tracking-[-.06em] text-white sm:text-[2.4rem]">${totalUsd.toFixed(2)}</div></div>
              <div className="wallet-orb"><WalletCards size={18} /></div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-2.5">
              <WalletBalanceTile token="USDC" value={Number(rialoBalances.USDC || 0).toFixed(2)} note="Rialo" tone="mint" />
              <WalletBalanceTile token="USDT" value={Number(rialoBalances.USDT || 0).toFixed(2)} note="Rialo" tone="blue" />
              <WalletBalanceTile token="RIAL" value={Number(rialoBalances.RIAL || 0).toFixed(0)} note="Native" tone="gold" />
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.05fr_.95fr]">
        <Card title="Activate wallet" subtitle="Import a local demo private key or create a new one for the presentation.">
          <form onSubmit={importWallet}>
            <label className="block text-xs font-medium text-white/46">
              Private key
              <textarea
                value={privateKeyInput}
                onChange={(e) => setPrivateKeyInput(e.target.value)}
                rows={4}
                placeholder="Paste a private key, for example 0x..."
                className="wallet-textarea mt-2 w-full rounded-[20px] px-4 py-3 font-mono text-xs outline-none"
              />
            </label>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <button className="wallet-primary rounded-full px-4 py-2.5 text-sm font-semibold">Import wallet</button>
              <button type="button" onClick={generateWallet} className="liquid-glass rounded-full px-4 py-2.5 text-sm font-medium text-white">Generate key</button>
              <button type="button" onClick={disconnectWallet} className="wallet-danger rounded-full px-4 py-2.5 text-sm font-medium">Reset</button>
            </div>
          </form>
        </Card>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
          <Card title="Key preview" subtitle="Masked until you explicitly reveal it.">
            <div className="wallet-key-preview rounded-[20px] px-4 py-3.5">
              <DataRow label="Source" value={embeddedWallet.source} />
              <DataRow label="Private key" value={embeddedWallet.privateKey ? (showPrivateKey ? embeddedWallet.privateKey : maskSecret(embeddedWallet.privateKey)) : "Not imported"} mono />
              <DataRow label="Address" value={short(embeddedWallet.address)} mono />
            </div>
            <button onClick={() => setShowPrivateKey((cur) => !cur)} disabled={!embeddedWallet.privateKey} className="mt-4 text-xs font-medium text-white/62 transition hover:text-white disabled:opacity-40">
              {showPrivateKey ? "Hide private key" : "Reveal private key"} →
            </button>
          </Card>
          <div className="wallet-note-card overflow-hidden rounded-[28px]">
            <img src="https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=900&q=85" alt="Digital flow" />
            <div className="wallet-note-overlay" />
            <div className="relative z-10 p-5"><div className="text-[10px] uppercase tracking-[.18em] text-white/56">Safety by design</div><p className="mt-3 max-w-xs text-sm leading-6 text-white/78">Sensitive transfers can be escalated to your team approval queue before they are carried out.</p><button onClick={() => setActivePage("approval")} className="mt-4 text-xs font-medium text-white/85 hover:text-white">View approval manager →</button></div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function WalletBalanceTile({ token, value, note, tone }) {
  return <div className={`wallet-balance-tile ${tone}`}><div className="text-[10px] font-medium tracking-[.14em] text-white/48">{token}</div><div className="mt-2 text-[1.35rem] font-medium tracking-[-.06em] text-white sm:text-[1.55rem]">{value}</div><div className="mt-1 text-[10px] text-white/42">{note}</div></div>;
}

function UserRequestPage({ addressBook, addOperation, addTimeline, notify, setActivePage }) {
  function submit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const recipient = form.get("recipient");
    const amount = Number(form.get("amount"));
    const policy = runPolicyCheck(addressBook, { operation_type: "User transfer request", recipient, amount });
    const op = operationFromPolicy({ type: "User transfer request", recipient, amount, policy, user_id: USER_ID });
    addOperation(op);
    addTimeline("User transfer request", `User requested ${amount} RIAL to ${short(recipient)}.`);
    notify("Request submitted", "Your request was routed to team approval.");
    setActivePage("user-home");
  }
  return <PageShell eyebrow="User Portal" title="New request" subtitle="Submit a transfer request for team review."><Card title="Submit transfer request"><form onSubmit={submit} className="max-w-2xl"><Input label="Recipient" name="recipient" defaultValue="unknown_wallet_001" required /><Input label="Amount" name="amount" type="number" defaultValue="3000" min="1" required /><Input label="Purpose" name="purpose" defaultValue="service payment" /><Input label="Memo" name="memo" defaultValue="payment request" /><button className="mt-4 rounded-2xl bg-[#3B2A1F] px-6 py-3 font-semibold text-white">Submit request</button></form></Card></PageShell>;
}

function RecurringPage({ recurring, setRecurring, addressBook, addOperation, notify, addTimeline }) {
  function create(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const recipient = form.get("recipient");
    const amount = Number(form.get("amount"));
    const frequency = form.get("frequency");
    const policy = runPolicyCheck(addressBook, { operation_type: "Recurring payment", recipient, amount });
    const item = { id: id("rec"), user_id: USER_ID, recipient, amount, frequency, start_date: form.get("start_date"), end_date: form.get("end_date"), status: !policy.allowed ? "Blocked" : policy.required_approvals ? "Pending approval" : "Active", risk: policy.risk, required_approvals: policy.required_approvals, policy_reasons: policy.reasons };
    setRecurring((cur) => [item, ...cur]);
    const op = operationFromPolicy({ type: "Recurring payment", recipient, amount, policy, user_id: USER_ID, amountLabel: `${amount} RIAL / ${frequency}` });
    addOperation(op);
    addTimeline("Recurring payment created", `${frequency} payment to ${short(recipient)} created.`);
    notify("Recurring payment created", `${item.status} · ${policy.risk} risk.`);
    e.currentTarget.reset();
  }
  function cancel(idValue) {
    setRecurring((cur) => cur.map((item) => item.id === idValue ? { ...item, status: "Cancelled" } : item));
    notify("Recurring payment cancelled", "The scheduled payment was cancelled.");
  }
  const active = recurring.filter((r) => r.status === "Active").length;
  const pending = recurring.filter((r) => /pending/i.test(r.status)).length;
  return <PageShell eyebrow="User Portal" title="Recurring payments" subtitle="Create scheduled user payments that require policy approval before activation."><div className="mb-6 grid gap-4 md:grid-cols-3"><MetricCard label="Total" value={recurring.length} note="All schedules" icon={Repeat} /><MetricCard label="Active" value={active} note="Live payments" icon={BadgeCheck} type="good" /><MetricCard label="Pending" value={pending} note="Awaiting approval" icon={Activity} type="warn" /></div><div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]"><Card title="Create recurring payment"><form onSubmit={create}><Input label="Recipient" name="recipient" defaultValue="api-provider" required /><Input label="Amount" name="amount" type="number" defaultValue="50" min="1" required /><Select label="Frequency" name="frequency" defaultValue="monthly"><option value="daily">daily</option><option value="weekly">weekly</option><option value="monthly">monthly</option></Select><Input label="Start date" name="start_date" type="date" /><Input label="End date" name="end_date" type="date" /><Input label="Purpose" name="purpose" defaultValue="subscription" /><button className="mt-4 w-full rounded-2xl bg-[#3B2A1F] px-4 py-3 font-semibold text-white">Create</button></form></Card><Card title="My recurring payments">{recurring.length ? recurring.map((item) => <div key={item.id} className="mb-3 rounded-2xl border border-[#E8DED0] bg-[#FFF9F1] p-4"><div className="flex justify-between"><div><div className="font-semibold">{item.amount} RIAL · {item.frequency}</div><div className="font-mono text-xs text-[#75665B]">{item.id}</div></div><StatusPill type={tone(item.status)}>{item.status}</StatusPill></div><div className="mt-3"><DataRow label="Recipient" value={item.recipient} mono /><DataRow label="Risk" value={item.risk} /><DataRow label="Approvals" value={item.required_approvals} /></div><ul className="mt-3 list-disc pl-5 text-sm text-[#75665B]">{item.policy_reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>{item.status !== "Cancelled" ? <button onClick={() => cancel(item.id)} className="mt-4 rounded-2xl border border-[#E8DED0] bg-white px-3 py-2 text-sm font-semibold">Cancel</button> : null}</div>) : <div className="text-[#75665B]">No recurring payments yet.</div>}</Card></div></PageShell>;
}


function SwapBridgePage({ swapBalances, setSwapBalances, swapHistory, setSwapHistory, addOperation, notify, addTimeline }) {
  const [mode, setMode] = useState("swap");
  const [fromChain, setFromChain] = useState("rialo");
  const [toChain, setToChain] = useState("ethereum");
  const [fromToken, setFromToken] = useState("USDC");
  const [toToken, setToToken] = useState("USDT");
  const [amount, setAmount] = useState("100");
  const [recipient, setRecipient] = useState(DEFAULT_WALLET);

  const fromTokens = tokenOptions[fromChain] || [];
  const toTokens = tokenOptions[mode === "swap" ? fromChain : toChain] || [];
  const bridgeCompatibleTokens = mode === "bridge" ? fromTokens.filter((token) => toTokens.includes(token)) : fromTokens;
  const safeFromToken = bridgeCompatibleTokens.includes(fromToken) ? fromToken : bridgeCompatibleTokens[0] || fromTokens[0];
  const safeToToken = mode === "bridge" ? safeFromToken : toTokens.includes(toToken) ? toToken : toTokens[0];
  const numericAmount = Number(amount || 0);
  const currentBalance = Number(swapBalances?.[fromChain]?.[safeFromToken] || 0);
  const bridgeFee = Math.max(numericAmount * 0.0015, numericAmount > 0 ? 0.05 : 0);
  const swapFee = numericAmount * 0.003;
  const outputAmount = useMemo(() => {
    if (!numericAmount || numericAmount <= 0) return 0;
    if (mode === "bridge") return Math.max(numericAmount - bridgeFee, 0);
    const fromPrice = tokenPrices[safeFromToken] || 1;
    const toPrice = tokenPrices[safeToToken] || 1;
    return Math.max((numericAmount * fromPrice) / toPrice - swapFee, 0);
  }, [numericAmount, mode, bridgeFee, swapFee, safeFromToken, safeToToken]);

  function switchFromChain(value) {
    setFromChain(value);
    const nextTokens = tokenOptions[value] || [];
    if (!nextTokens.includes(fromToken)) setFromToken(nextTokens[0] || "USDC");
    if (mode === "swap" && !nextTokens.includes(toToken)) setToToken(nextTokens[1] || nextTokens[0] || "USDT");
  }

  function switchToChain(value) {
    setToChain(value);
    const nextTokens = tokenOptions[value] || [];
    if (mode === "bridge" && !nextTokens.includes(toToken)) setToToken(nextTokens[0] || "USDC");
  }

  function useMax() {
    setAmount(String(Math.max(currentBalance, 0)));
  }

  function executeSwapBridge(e) {
    e.preventDefault();
    const amt = Number(amount || 0);
    if (!amt || amt <= 0) {
      notify("Invalid amount", "Enter an amount greater than zero.", "bad");
      return;
    }
    if (amt > currentBalance) {
      notify("Insufficient balance", `You have ${currentBalance.toFixed(2)} ${safeFromToken} on ${chainName(fromChain)}.`, "bad");
      return;
    }
    if (mode === "swap" && safeFromToken === safeToToken) {
      notify("Choose another token", "Swap requires two different tokens.", "bad");
      return;
    }
    if (mode === "bridge" && fromChain === toChain) {
      notify("Choose another chain", "Bridge transfer requires two different chains.", "bad");
      return;
    }

    const targetChain = mode === "swap" ? fromChain : toChain;
    const outputToken = mode === "swap" ? safeToToken : safeFromToken;
    const output = Number(outputAmount.toFixed(6));

    setSwapBalances((cur) => {
      const next = JSON.parse(JSON.stringify(cur));
      next[fromChain] = next[fromChain] || {};
      next[targetChain] = next[targetChain] || {};
      next[fromChain][safeFromToken] = Number((Number(next[fromChain][safeFromToken] || 0) - amt).toFixed(6));
      next[targetChain][outputToken] = Number((Number(next[targetChain][outputToken] || 0) + output).toFixed(6));
      return next;
    });

    const historyItem = {
      id: id(mode === "swap" ? "swap" : "bridge"),
      mode,
      fromChain,
      toChain: targetChain,
      fromToken: safeFromToken,
      toToken: outputToken,
      amount: amt,
      output,
      recipient: mode === "bridge" ? recipient : "self",
      status: "Completed",
      time: now(),
    };
    setSwapHistory((cur) => [historyItem, ...cur].slice(0, 10));

    const op = {
      id: id("op"),
      type: mode === "swap" ? "Token swap" : "Bridge transfer",
      target: mode === "swap" ? `${safeFromToken} → ${outputToken}` : `${chainName(fromChain)} → ${chainName(targetChain)}`,
      recipient_raw: mode === "bridge" ? recipient : DEFAULT_WALLET,
      amount: `${amt} ${safeFromToken}`,
      amount_raw: amt,
      risk: mode === "bridge" ? "Medium" : "Low",
      state: "Completed",
      time: now(),
      policy_reasons: [
        mode === "swap" ? "Swap executed." : "Bridge transfer created.",
        "Rialo chain supports USDC and USDT.",
      ],
      required_approvals: 0,
      approvals: [],
      user_id: USER_ID,
    };
    addOperation(op);
    addTimeline(mode === "swap" ? "Token swap completed" : "Bridge transfer completed", `${amt} ${safeFromToken} → ${output} ${outputToken}.`);
    notify(mode === "swap" ? "Swap completed" : "Bridge transfer completed", `${output} ${outputToken} received on ${chainName(targetChain)}.`);
  }

  return (
    <PageShell
      eyebrow="User Portal"
      title="Swap & Bridge"
      subtitle="Swap Rialo assets or bridge USDC and USDT across chains in secure workspace mode."
      right={<StatusPill type="neutral">Rialo supports USDC · USDT</StatusPill>}
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="overflow-hidden" title="Trading widget" subtitle="Swap and cross-chain bridge transfer.">
          <form onSubmit={executeSwapBridge} className="rounded-3xl border border-[#E8DED0] bg-[#FFF9F1] p-5">
            <div className="mb-5 inline-flex rounded-2xl bg-[#2B211B] p-1">
              <button type="button" onClick={() => setMode("swap")} className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${mode === "swap" ? "bg-white text-[#2B211B]" : "text-[#F8EBDD]"}`}>Swap</button>
              <button type="button" onClick={() => setMode("bridge")} className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${mode === "bridge" ? "bg-white text-[#2B211B]" : "text-[#F8EBDD]"}`}>Bridge</button>
            </div>

            <div className="rounded-3xl border border-[#E8DED0] bg-white p-5">
              <div className="mb-3 flex items-center justify-between text-sm text-[#75665B]">
                <span>{mode === "swap" ? "Sell" : "From"}</span>
                <span>Balance: {currentBalance.toFixed(2)} {safeFromToken}</span>
              </div>
              <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
                <ChainSelect value={fromChain} onChange={switchFromChain} />
                <TokenSelect chain={fromChain} value={safeFromToken} onChange={setFromToken} tokensOverride={mode === "bridge" ? bridgeCompatibleTokens : null} />
              </div>
              <div className="mt-4 flex items-center gap-3">
                <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" min="0" step="0.000001" className="w-full bg-transparent text-right text-5xl font-semibold text-[#2B211B] outline-none" placeholder="0.00" />
                <button type="button" onClick={useMax} className="rounded-full border border-[#E8DED0] bg-[#FFF9F1] px-3 py-2 text-xs font-semibold text-[#2B211B]">MAX</button>
              </div>
              <div className="mt-1 text-right text-sm text-[#75665B]">≈ ${(numericAmount * (tokenPrices[safeFromToken] || 1)).toFixed(2)}</div>
            </div>

            <div className="mx-auto -my-1 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E8DED0] bg-[#2B211B] text-white shadow-lg">
              <ArrowDown size={20} />
            </div>

            <div className="rounded-3xl border border-[#E8DED0] bg-white p-5">
              <div className="mb-3 flex items-center justify-between text-sm text-[#75665B]">
                <span>{mode === "swap" ? "Receive" : "To"}</span>
                <span>{mode === "bridge" ? "Cross-chain transfer" : "Same-chain swap"}</span>
              </div>
              <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
                {mode === "bridge" ? <ChainSelect value={toChain} onChange={switchToChain} /> : <ChainSelect value={fromChain} onChange={switchFromChain} disabled />}
                <TokenSelect chain={mode === "bridge" ? toChain : fromChain} value={safeToToken} onChange={setToToken} lockTo={mode === "bridge" ? safeFromToken : null} />
              </div>
              <div className="mt-4 text-right text-5xl font-semibold text-[#2B211B]">{outputAmount.toFixed(outputAmount >= 100 ? 2 : 6)}</div>
              <div className="mt-1 text-right text-sm text-[#75665B]">{mode === "swap" ? `Fee: ${swapFee.toFixed(4)} ${safeFromToken}` : `Bridge fee: ${bridgeFee.toFixed(4)} ${safeFromToken}`}</div>
            </div>

            {mode === "bridge" ? (
              <label className="mt-4 block text-sm font-medium text-[#75665B]">
                Recipient on destination chain
                <input value={recipient} onChange={(e) => setRecipient(e.target.value)} className="mt-2 w-full rounded-2xl border border-[#E8DED0] bg-white px-4 py-3 text-sm text-[#2B211B] outline-none focus:border-sky-300" />
              </label>
            ) : null}

            <button className="mt-5 w-full rounded-2xl bg-[#3B2A1F] px-4 py-4 text-base font-semibold text-white transition hover:bg-[#4B382B]">
              {mode === "swap" ? "Swap" : "Bridge transfer"}
            </button>
          </form>
        </Card>

        <div className="space-y-6">
          <Card title="Portfolio balances" subtitle="Balances update after swaps and bridge transfers.">
            <div className="grid gap-3 md:grid-cols-2">
              {chainOptions.map((chain) => (
                <div key={chain.id} className="rounded-2xl border border-[#E8DED0] bg-[#FFF9F1] p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-full ${chain.color}`} />
                    <div>
                      <div className="font-semibold text-[#2B211B]">{chain.name}</div>
                      <div className="text-xs text-[#75665B]">{chain.subtitle}</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {Object.entries(swapBalances[chain.id] || {}).map(([token, bal]) => (
                      <DataRow key={token} label={token} value={Number(bal).toFixed(2)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Swap / Bridge history" subtitle="Recent executions.">
            {swapHistory.length ? (
              <div className="space-y-3">
                {swapHistory.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-[#E8DED0] bg-[#FFF9F1] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-[#2B211B]">{item.mode === "swap" ? "Swap" : "Bridge transfer"}</div>
                        <div className="font-mono text-xs text-[#75665B]">{item.id}</div>
                      </div>
                      <StatusPill type="good">{item.status}</StatusPill>
                    </div>
                    <div className="mt-3 grid gap-1 text-sm">
                      <DataRow label="Route" value={`${chainName(item.fromChain)} → ${chainName(item.toChain)}`} />
                      <DataRow label="Sent" value={`${item.amount} ${item.fromToken}`} />
                      <DataRow label="Received" value={`${item.output} ${item.toToken}`} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-[#E8DED0] bg-[#FFF9F1] p-4 text-[#75665B]">No swap or bridge activity yet.</div>
            )}
          </Card>
        </div>
      </div>
    </PageShell>
  );
}

function chainName(idValue) {
  return chainOptions.find((item) => item.id === idValue)?.name || idValue;
}

function ChainSelect({ value, onChange, disabled = false }) {
  return (
    <label className="block text-sm font-medium text-[#75665B]">
      Chain
      <select disabled={disabled} value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-2xl border border-[#E8DED0] bg-[#FFF9F1] px-4 py-3 text-sm font-semibold text-[#2B211B] outline-none disabled:opacity-70">
        {chainOptions.map((chain) => <option key={chain.id} value={chain.id}>{chain.name}</option>)}
      </select>
    </label>
  );
}

function TokenSelect({ chain, value, onChange, lockTo = null, tokensOverride = null }) {
  const tokens = tokensOverride || tokenOptions[chain] || [];
  const selected = lockTo || value;
  return (
    <label className="block text-sm font-medium text-[#75665B]">
      Token
      <select disabled={Boolean(lockTo)} value={selected} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-2xl border border-[#E8DED0] bg-[#FFF9F1] px-4 py-3 text-sm font-semibold text-[#2B211B] outline-none disabled:opacity-70">
        {tokens.map((token) => <option key={token} value={token}>{token}</option>)}
      </select>
    </label>
  );
}

function FaucetPage({ addOperation, notify, addTimeline, balanceResult, setBalanceResult }) {
  const [wallet, setWallet] = useState(DEFAULT_WALLET);
  function record(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const recipient = form.get("wallet");
    const amount = Number(form.get("amount"));
    const op = { id: id("op"), type: "User faucet request", target: short(recipient), recipient_raw: recipient, amount: `${amount} RIAL`, amount_raw: amount, risk: "Low", state: "Recorded", time: "now", policy_reasons: ["Faucet request was recorded in secure workspace mode.", "Rialo devnet faucet request is recorded."], required_approvals: 0, approvals: [], user_id: USER_ID };
    addOperation(op);
    addTimeline("Faucet request recorded", `${amount} RIAL request for ${short(recipient)}.`);
    notify("Faucet request recorded", "The request was added to user activity.");
  }
  function checkBalance() {
    setBalanceResult({ network: "Rialo Devnet", pubkey: wallet, balance_raw: "2588", checked_at: "now" });
    notify("Balance checked", "Balance returned successfully.");
  }
  return <PageShell eyebrow="User Portal" title="Faucet / Balance" subtitle="Faucet record and balance check."><div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]"><Card title="Record faucet request"><form onSubmit={record}><label className="mt-3 block text-sm font-medium text-[#75665B]">Wallet address<input name="wallet" value={wallet} onChange={(e) => setWallet(e.target.value)} className="mt-2 w-full rounded-2xl border border-[#E8DED0] bg-white px-4 py-3 outline-none" /></label><Input label="Amount" name="amount" type="number" defaultValue="10" min="1" /><div className="mt-4 flex flex-wrap gap-3"><button className="rounded-2xl bg-[#3B2A1F] px-4 py-3 font-semibold text-white">Record request</button><button type="button" onClick={checkBalance} className="rounded-2xl border border-[#E8DED0] bg-white px-4 py-3 font-semibold">Check balance</button></div></form></Card><Card title="Balance result">{balanceResult ? <div className="space-y-2"><DataRow label="Network" value={balanceResult.network} /><DataRow label="Pubkey" value={short(balanceResult.pubkey)} mono /><DataRow label="Balance raw" value={balanceResult.balance_raw} big /><DataRow label="Checked at" value={balanceResult.checked_at} /></div> : <div className="rounded-2xl border border-[#E8DED0] bg-[#FFF9F1] p-4 text-[#75665B]">Enter a wallet address and check its balance.</div>}</Card></div></PageShell>;
}

export default App;
