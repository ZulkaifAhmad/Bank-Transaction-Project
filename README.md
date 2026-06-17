# 🏦 Bank Transaction Project

A secure RESTful banking API built with **Node.js**, **Express 5**, and **MongoDB**. It supports user authentication, account management, and atomic fund transfers with full ledger tracking and email notifications.

## ✨ Features

- **User Authentication** — Register, Login, and Logout with JWT-based cookie authentication
- **Token Blocklisting** — Invalidated tokens are stored and auto-expire after 3 days (TTL index)
- **Account Management** — Create accounts, fetch balances, and list all accounts
- **Atomic Transactions** — Fund transfers use MongoDB sessions to ensure ACID compliance
- **Double-Entry Ledger** — Every transaction creates both a CREDIT and DEBIT ledger entry
- **Idempotency** — Duplicate transactions are prevented via unique idempotency keys
- **Immutable Ledger** — Ledger records cannot be modified, deleted, or updated once created
- **System User** — A privileged system account can seed initial funds into user accounts
- **Email Notifications** — Registration, login, and transaction alerts via [Resend](https://resend.com)

## 🛠️ Tech Stack

| Layer          | Technology                                          |
| -------------- | --------------------------------------------------- |
| Runtime        | Node.js (ES Modules)                                |
| Framework      | Express 5                                           |
| Database       | MongoDB + Mongoose 9                                |
| Authentication | JSON Web Tokens (`jsonwebtoken`) + Cookie Parser    |
| Password Hash  | bcryptjs                                            |
| Email          | Resend SDK                                          |
| Dev Server     | Nodemon                                             |

## 📁 Project Structure

```
Bank Transaction Project/
├── server.js                          # Entry point — starts server & connects DB
├── package.json
├── .env                               # Environment variables (not committed)
├── .gitignore
└── src/
    ├── app.js                         # Express app setup & route mounting
    ├── config/
    │   └── db.js                      # MongoDB connection
    ├── schema/
    │   ├── user.schema.js             # User model (name, email, password, systemUser)
    │   ├── account.schema.js          # Account model (user, status, currency, getBalance)
    │   ├── transaction.schema.js      # Transaction model (from, to, amount, status, idempotencyKey)
    │   ├── ledger.schema.js           # Ledger model (immutable double-entry records)
    │   └── blocklist.schema.js        # Blocklisted JWT tokens (TTL: 3 days)
    ├── controller/
    │   ├── auth.controller.js         # Register, Login, Logout
    │   ├── account.controller.js      # Create account, get balance, list accounts
    │   └── transaction.controller.js  # Create transaction, initial fund seeding
    ├── middleware/
    │   └── auth.middleware.js          # authUser & authSystemUser JWT guards
    ├── router/
    │   ├── auth.router.js             # /api/auth routes
    │   ├── account.router.js          # /api/account routes
    │   └── transaction.router.js      # /api/transaction routes
    └── services/
        └── email.service.js           # SendEmail & SendTransactionEmail (Resend)
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Resend API Key** — [Get one here](https://resend.com)

### Installation

```bash
# Clone the repository
git clone https://github.com/ZulkaifAhmad/Bank-Transaction-Project.git
cd Bank-Transaction-Project

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/bank-transaction
JWT_SECRET=your_jwt_secret_here
RESEND_API_KEY=re_your_resend_api_key
```

### Run the Server

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

## 📡 API Endpoints

### Authentication — `/api/auth`

| Method | Endpoint     | Auth | Description                  |
| ------ | ------------ | ---- | ---------------------------- |
| POST   | `/register`  | ❌    | Register a new user          |
| POST   | `/login`     | ❌    | Login with email/name + password |
| POST   | `/logout`    | 🍪    | Logout and blocklist token   |

#### Register

```json
POST /api/auth/register
{
  "name": "JohnDoe",
  "email": "john@example.com",
  "password": "secure123"
}
```

#### Login

```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "secure123"
}
```

---

### Accounts — `/api/account`

> All routes require authentication (JWT cookie).

| Method | Endpoint           | Auth | Description                  |
| ------ | ------------------ | ---- | ---------------------------- |
| POST   | `/create`          | 🔒    | Create an account for the logged-in user |
| POST   | `/get-balance/:id` | 🔒    | Get balance of an account    |
| POST   | `/get-accounts`    | 🔒    | List all accounts            |

#### Create Account

```json
POST /api/account/create
// No body required — account is linked to the authenticated user
```

#### Get Balance

```
POST /api/account/get-balance/664abc123def456789012345
```

---

### Transactions — `/api/transaction`

| Method | Endpoint                | Auth        | Description                  |
| ------ | ----------------------- | ----------- | ---------------------------- |
| POST   | `/create-transaction`   | 🔒 User     | Transfer funds between accounts |
| POST   | `/system/initial-funds` | 🔒 System   | Seed initial funds from system account |

#### Create Transaction

```json
POST /api/transaction/create-transaction
{
  "fromAccount": "664abc123def456789012345",
  "toAccount": "664def456abc789012345678",
  "amount": 500,
  "status": "PENDING",
  "idempotencyKey": "txn-unique-key-001"
}
```

#### Seed Initial Funds (System User Only)

```json
POST /api/transaction/system/initial-funds
{
  "toAccount": "664abc123def456789012345",
  "amount": 10000,
  "idempotencyKey": "seed-unique-key-001"
}
```

## 🗃️ Data Models

### User

| Field      | Type     | Notes                                |
| ---------- | -------- | ------------------------------------ |
| name       | String   | Required, unique, min 5 chars        |
| email      | String   | Required, unique, validated format   |
| password   | String   | Hashed with bcryptjs (10 rounds)     |
| systemUser | Boolean  | Default `false`, immutable, hidden   |

### Account

| Field    | Type     | Notes                                |
| -------- | -------- | ------------------------------------ |
| user     | ObjectId | Ref → `users`, indexed              |
| status   | String   | `ACTIVE` / `FROZEN` / `CLOSED`       |
| currency | String   | Default `INR`                        |

### Transaction

| Field          | Type     | Notes                                |
| -------------- | -------- | ------------------------------------ |
| fromAccount    | ObjectId | Ref → `accounts`, indexed            |
| toAccount      | ObjectId | Ref → `accounts`, indexed            |
| amount         | Number   | Required, min 0                      |
| status         | String   | `PENDING` / `COMPLETED` / `FAILED` / `REVERSED` |
| idempotencyKey | String   | Required, unique, indexed            |

### Ledger

| Field       | Type     | Notes                                |
| ----------- | -------- | ------------------------------------ |
| account     | ObjectId | Ref → `accounts`, immutable          |
| amount      | Number   | Immutable                            |
| transaction | ObjectId | Ref → `transactions`, immutable      |
| type        | String   | `DEBIT` / `CREDIT`, immutable        |

> ⚠️ All ledger fields are **immutable**. Delete, update, and replace operations are blocked at the schema level.

### BlocklistToken

| Field | Type     | Notes                                  |
| ----- | -------- | -------------------------------------- |
| token | String   | The invalidated JWT                    |
| user  | ObjectId | Ref → `users`                          |

> Tokens auto-expire after **3 days** via a MongoDB TTL index.

## 🔐 Authentication Flow

```
Register/Login → JWT created → Stored in HTTP cookie
       ↓
Every protected request → Cookie extracted → JWT verified → Blocklist checked
       ↓
Logout → Token added to blocklist → Cookie cleared
```

## 💸 Transaction Flow

```
1. Validate accounts exist and are ACTIVE
2. Check idempotency (prevent duplicate transactions)
3. Verify sender has sufficient balance
4. Start MongoDB session (atomic transaction)
   ├─ Create Transaction (status: PENDING)
   ├─ Create Ledger entries (CREDIT + DEBIT)
   └─ Update Transaction (status: COMPLETED)
5. Commit session
6. Send email notification
```

If any step fails, the entire session is **aborted** — no partial writes.

## 📧 Email Notifications

Emails are sent via [Resend](https://resend.com) for:

| Event                    | Recipient |
| ------------------------ | --------- |
| User Registration        | User      |
| User Login               | User      |
| Transaction Success      | User      |
| Transaction Failure      | User      |

## 📄 License

ISC
