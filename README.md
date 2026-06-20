# Rialo Guard Desk v0.4 — Secure Wallet & Agent Control Plane

Rialo Guard Desk is a unified operating layer for personal wallets, team treasury workflows, and AI-agent permissions on Rialo.

It combines wallet activity, transaction request management, policy enforcement, multi-party approvals, agent budgets, credential workflows, and audit visibility inside one browser-native control surface.

Rather than treating wallet actions as isolated clicks, Rialo Guard Desk treats every sensitive action as an operational workflow.

A transfer, swap, bridge request, recurring payment, or agent-triggered action can be reviewed against policy rules, routed to the appropriate approvers, recorded in an audit trail, and managed according to defined permissions and risk thresholds.

## Core Principles

**Review before execution**
Sensitive actions should be visible and understandable before they move forward.

**Apply policy before signing**
Limits, trusted addresses, approval thresholds, and agent permissions should shape the workflow before a transaction reaches a signing step.

**Limit before delegating**
AI agents and operational users should receive scoped authority, controlled budgets, and clear execution boundaries.

**Audit every critical action**
Teams should be able to understand who created, reviewed, approved, rejected, or modified every important request.

---

# Product Experience

## Public Website

The root route is a full-screen cinematic product website designed to introduce the Rialo Guard Desk ecosystem.

It presents the platform as a secure operating environment for users, teams, and autonomous agents, while giving visitors two clear entry points:

* **Enter Personal Wallet**
* **Open Team Guard**

The landing experience uses a dark cinematic visual system, full-screen motion media, Liquid Glass components, responsive navigation, and product-oriented storytelling.

The public site is designed to feel like a real product surface rather than a generic admin dashboard.

---

# Personal Wallet

## Wallet Workspace

The Personal Wallet workspace is the user-facing entry point for managing assets, account identity, and operational requests.

It provides:

* Wallet identity and local session state
* Network context and account verification status
* Portfolio overview and balance visibility
* Asset-level balance tiles
* Recent activity and request history
* Quick access to transfer, Swap, Bridge, and recurring actions
* Guard-aware routing for sensitive actions

The wallet workspace gives users a familiar asset-management experience while connecting directly to the broader Guard Desk security layer.

---

## Wallet Creation and Import

Rialo Guard Desk includes wallet creation, import, reset, and local session management flows.

Users can:

* Create a new wallet workspace
* Import an existing wallet identity into the local application session
* Reset wallet state
* View account information and wallet status
* Manage local wallet-related settings

The product is designed so that wallet identity is not separated from risk controls. Once a wallet is active, its actions can be evaluated by policies, approval requirements, trusted-address rules, and team-level limits.

---

## Portfolio and Asset Visibility

The portfolio view gives users a concise overview of their wallet environment.

It includes:

* Total portfolio balance
* Individual asset positions
* Wallet address display
* Network status
* Account verification state
* Recent operational activity
* Approved, pending, and rejected request counts

Instead of showing only balances, the portfolio view helps users understand the current operational state of their wallet.

For example, a user can immediately identify whether they have pending review requests, whether a previous action was rejected, or whether a sensitive operation requires additional approval.

---

## Transfer Requests

The transfer workflow allows users to create structured requests instead of treating every payment as an immediate isolated action.

A transfer request can include:

* Recipient address
* Transfer amount
* Asset context
* Notes or operational reason
* Request source
* Risk classification
* Policy outcomes
* Approval status

Before a request progresses, Rialo Guard Desk evaluates the operational context.

Risk evaluation can consider:

* Single-transaction value
* Daily spending limits
* Destination address status
* Trusted-address membership
* User or agent permissions
* Budget availability
* Approval requirements
* Existing policy conditions

Lower-risk actions can follow a lightweight path, while higher-risk actions can be routed to the Team Guard approval queue.

---

## Swap

The Swap module provides a structured exchange interface for asset conversion workflows.

Users can:

* Select source and destination assets
* Enter a swap amount
* Review estimated output
* Set slippage tolerance
* Review price impact
* Confirm the requested action
* Route high-risk activity into the Guard workflow

The Swap interface is designed to make important trading parameters visible rather than hiding them behind a single confirmation button.

The platform highlights operational factors such as:

* Input and output assets
* Expected output amount
* Slippage settings
* Price impact
* Value size
* Policy status
* Required approvals

This gives users and teams a clearer view of why a swap is permitted, restricted, or escalated for review.

---

## Bridge

The Bridge module provides a workflow for cross-network or cross-environment asset movement.

Bridge requests can include:

* Source environment
* Destination environment
* Input asset
* Output asset
* Destination address
* Estimated processing context
* Risk status
* Approval requirements

Bridge operations are treated as sensitive because they may involve destination-network selection, unfamiliar addresses, routing complexity, and asset movement across different environments.

For that reason, Bridge requests can be evaluated through the same policy and approval system used for transfers and swaps.

---

## Recurring Actions

Recurring Actions are designed for scheduled or repeatable workflows.

Possible use cases include:

* Recurring operational payments
* Team budget distributions
* Scheduled service payments
* Routine treasury actions
* Agent-triggered recurring requests
* Repeated internal settlement workflows

A recurring action can define:

* Frequency
* Amount
* Destination
* Operational note
* Approval conditions
* Policy boundaries
* Budget limits

The purpose of this module is to ensure that repeatable actions remain controlled over time.

A small recurring payment may appear low risk when viewed once, but it can become significant when evaluated across days, weeks, or months. Rialo Guard Desk therefore treats recurring actions as ongoing permissions that should remain visible, configurable, and auditable.

---

# Team Guard Desk

## Team Console

The Team Guard Desk is the shared control environment for teams managing sensitive wallet and agent activity.

It brings together:

* Operational requests
* Approval queues
* Policy controls
* Team roles
* Agent budgets
* Trusted addresses
* Vault workflows
* Audit history

The team console is designed for teams that need more than a single wallet confirmation step.

It supports the idea that different people should have different responsibilities in a financial or operational workflow.

---

## Roles and Permissions

Rialo Guard Desk supports a role-aware operating model.

### Admin

Admins manage the overall security environment.

Typical Admin capabilities include:

* Configuring policies
* Managing approval requirements
* Updating transaction limits
* Maintaining trusted addresses
* Managing agent budgets
* Reviewing audit information
* Pausing or enabling agents
* Managing workspace controls

### Operator

Operators can create operational requests.

Typical Operator actions include:

* Creating transfers
* Preparing swaps
* Initiating bridge requests
* Setting up recurring actions
* Submitting requests for review

An Operator does not need to have authority to approve every request they create.

### Reviewer

Reviewers evaluate requests that require oversight.

Typical Reviewer actions include:

* Reviewing risk details
* Approving or rejecting requests
* Checking policy matches
* Reviewing target addresses
* Reviewing request metadata
* Participating in multi-approver workflows

### Agent

Agents are permissioned automation identities.

An Agent can be assigned a limited operational scope, such as:

* Creating requests within a budget
* Using approved action types
* Operating only with trusted addresses
* Working within daily spending limits
* Requiring review for high-risk actions
* Being paused when abnormal activity is detected

This structure separates creation, review, policy management, and automation authority.

---

## Approval Queue

The Approval Queue is the central review surface for sensitive activity.

Requests can enter the queue when they exceed policy thresholds or require additional oversight.

Each request can display:

* Request type
* Request source
* Asset and amount
* Destination address
* Risk level
* Policy conditions triggered
* Approval progress
* Reviewer actions
* Current status
* Historical activity

Reviewers can approve or reject requests based on the available context.

For higher-risk actions, Rialo Guard Desk supports multi-approver workflows.

For example, a team can require a `2 of 3` approval threshold before a request can progress.

This helps reduce single-point decision risk and gives teams a more resilient process for important treasury or automation actions.

---

## Policy Controls

Policies define the operating boundaries of the system.

They allow teams to establish rules before an action becomes urgent.

Policy categories include:

### Single-Transaction Limits

Teams can define maximum allowed value for an individual action.

Requests that exceed this value can be escalated automatically.

### Daily Limits

Teams can define cumulative daily limits for wallets, users, or agents.

This prevents repeated small requests from bypassing a larger security boundary.

### Trusted Addresses

Known internal, partner, or operational addresses can be added to a trusted address list.

Trusted destinations can follow a lighter review path, while unknown destinations can require additional review.

### Risk Thresholds

Teams can decide which conditions automatically classify an action as high risk.

Examples include:

* Large transaction values
* Unknown destination addresses
* High-slippage swaps
* Cross-network bridge actions
* Agent-originated requests
* Requests beyond defined budgets

### Approval Requirements

Teams can specify how many approvals are required for different risk categories.

Lower-risk requests may require one reviewer, while high-risk requests may require multiple independent approvals.

---

## Address Book

The Address Book gives teams a structured way to manage known destinations.

It can be used for:

* Internal treasury addresses
* Team member wallets
* Partner payment addresses
* Vendor destinations
* Agent-approved addresses
* Operational settlement addresses

By separating trusted destinations from unknown destinations, the platform can reduce unnecessary review for known workflows while keeping unfamiliar requests visible and protected.

---

# AI Agent Controls

## Agent Budget Management

Rialo Guard Desk treats AI agents as operational identities with constrained authority.

Each agent can have a defined budget and execution scope.

Agent settings can include:

* Daily budget
* Remaining available budget
* Allowed request types
* Trusted address restrictions
* Approval requirements
* Active or paused status
* Activity history
* Policy boundaries

This allows teams to benefit from automation without giving an agent unlimited wallet control.

For example, an agent may be allowed to create low-value settlement requests, but any action above a threshold can be routed automatically to human review.

---

## Agent Status Controls

Team administrators can monitor and manage agents directly from the console.

Possible controls include:

* Enable agent
* Pause agent
* Review budget use
* Inspect recent activity
* Review request history
* Update permission scope
* Restrict action categories
* Require manual review for all actions

A pause action is especially important for incident response.

If a team observes unexpected activity, it can stop further automated request creation while maintaining full visibility into existing audit records.

---

# Vault

The Vault module provides an operational surface for handling sensitive credentials and protected configuration context.

It is intended for workflows involving:

* API credentials
* Agent service credentials
* Webhook secrets
* Operational tokens
* Protected configuration values
* Automation credentials

The Vault is positioned as part of the broader operational security model.

In a production integration, this module can be extended with encrypted storage, external key management, hardware-backed security, or TEE-compatible credential workflows.

---

# Audit Log

The Audit Log provides a searchable record of important product activity.

It captures events such as:

* Wallet actions
* Request creation
* Policy evaluations
* Approval decisions
* Rejection decisions
* Agent activity
* Policy updates
* Budget changes
* Address book updates
* Vault-related actions
* Workspace events

Each record can be reviewed with relevant metadata, including source, status, timestamp, action type, and contextual information.

The Audit Log supports:

* Search
* Filtering
* Request and event review
* Role-aware activity visibility
* CSV export

This gives teams a structured record for internal review, operational reporting, compliance workflows, incident analysis, and project governance.

---

# Current Release Architecture

Rialo Guard Desk v2 runs as a browser-native application with local session and workflow state.

The current release focuses on product workflows, user experience, policy orchestration, approval systems, agent controls, and audit visibility.

The interface is built to support future integration with:

* Rialo Devnet RPC
* External wallet signing flows
* Transaction lifecycle tracking
* On-chain transaction hashes
* Swap routing integrations
* Bridge routing integrations
* Multi-signature execution
* Timelocks
* Encrypted credential storage
* Secure agent identity and delegated execution

Real private keys, seed phrases, and production credentials should never be entered into the current release.

---

# Local Development

```bash
npm install
npm run dev
```

Open the Vite address printed in the terminal, usually:

```text
http://127.0.0.1:5173/
```

---

# Production Build

```bash
npm run build
```

The optimized static application is generated in:

```text
dist/
```

Deploy the contents of `dist/` to Vercel, Netlify, Cloudflare Pages, or an Nginx web root.

