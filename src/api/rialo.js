// Frontend-only demo API shim.
// The demo App.jsx does not require a backend. This file is kept so existing imports do not break if you reuse older components.
const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getState() { await delay(); return { ok: true, mode: "frontend-only" }; }
export async function getRpcStatus() { await delay(); return { ok: true, network: "Rialo Devnet", rpc_url: "frontend-demo", checked_at: "now" }; }
export async function getBalance(pubkey) { await delay(); return { ok: true, network: "Rialo Devnet", pubkey, balance_raw: "2588", checked_at: "now" }; }
export async function createTransfer(payload) { await delay(); return { ok: true, operation: payload }; }
export async function requestAirdrop(payload) { await delay(); return { ok: true, operation: payload }; }
export async function encryptSecret(payload) { await delay(); return { ok: true, preview: `encrypted:${btoa(payload.secret || "").slice(0, 28)}...` }; }
export async function approveOperation(id, payload) { await delay(); return { ok: true, id, approval: payload }; }
export async function rejectOperation(id) { await delay(); return { ok: true, id, state: "Rejected" }; }
export async function guardCheck(payload) { await delay(); return { ok: true, request: payload, policy_result: { allowed: true, risk: "Low", reasons: ["Frontend demo check completed."], required_approvals: 0 } }; }
export async function getAddressBook() { await delay(); return { ok: true, address_book: [] }; }
export async function addAddressEntry(payload) { await delay(); return { ok: true, entry: payload }; }
export async function getUserProfile(userId) { await delay(); return { ok: true, profile: { user_id: userId } }; }
export async function getUserRequests(userId) { await delay(); return { ok: true, user_id: userId, requests: [] }; }
export async function createUserTransferRequest(payload) { await delay(); return { ok: true, operation: payload }; }
export async function createUserFaucetRequest(payload) { await delay(); return { ok: true, operation: payload }; }
export async function getRecurringPayments(userId) { await delay(); return { ok: true, user_id: userId, recurring_payments: [] }; }
export async function createRecurringPayment(payload) { await delay(); return { ok: true, recurring_payment: payload }; }
export async function cancelRecurringPayment(id) { await delay(); return { ok: true, id, status: "Cancelled" }; }
