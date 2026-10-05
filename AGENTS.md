# AGENTS.md

## Project Overview

This repository is a monorepo for **Connectify**, a social mini application.

Current scope of this document:

- ✅ Backend API: **NestJS + TypeScript**
- ✅ Database: **PostgreSQL**
- ✅ ORM: **Drizzle ORM**
- ✅ Validation: **class-validator + class-transformer**
- ✅ Architecture: **practical Clean Architecture**
- ✅ Caching / queue / realtime infrastructure may be added incrementally
- ✅ Frontend: **Next.js + React + Tailwind CSS + shadcn/ui** (see [Frontend](#frontend))

The API should be designed as a maintainable, modular backend without introducing unnecessary abstraction.

---

## General Agent Rules

### 1. Inspect before changing

Before modifying code:

1. Inspect the existing repository structure.
2. Inspect the target module and its related files.
3. Inspect existing database schema, relations, migrations, DTOs, controllers, services, repositories, and tests.
4. Reuse existing conventions whenever they are reasonable.
5. Do not rewrite unrelated modules.

Never assume a file, schema, relation, or architectural layer exists without checking first.

### 2. Keep changes scoped

- Implement only what is required for the requested task.
- Avoid broad refactors unless explicitly requested.
- Do not modify database schemas or relations unless the task requires it.
- Do not change public API contracts without explaining the impact.
- Preserve backward compatibility where practical.

### 3. Prefer simple solutions

Do not introduce abstractions only to make the code look more "Clean Architecture" compliant.

Avoid unnecessary:

- Generic repositories
- Base CRUD services
- Abstract factories
- Service interfaces with only one trivial implementation
- Excessive domain objects
- Extra mapping layers with no meaningful purpose
- Design patterns without a concrete problem they solve

The architecture should make business logic easier to test, understand, and change — not increase ceremony for its own sake.

---

# API Architecture

## Preferred dependency flow

The backend should generally follow:

```text
HTTP Request
    ↓
Presentation / Controller
    ↓
Application / Use Case
    ↓
Domain / Domain Rules
    ↓
Repository Interface
    ↑
Infrastructure / Repository Implementation
    ↓
Drizzle ORM
    ↓
PostgreSQL
```

The dependency direction must be respected:

- Presentation may depend on Application.
- Application may depend on Domain abstractions.
- Infrastructure may implement Application/Domain interfaces.
- Domain must not depend on NestJS, Drizzle, PostgreSQL, HTTP, or infrastructure implementations.
- Controllers must not access Drizzle directly.
- Use cases must not contain Drizzle queries.
- Repository interfaces must not depend on a concrete database implementation.

---

## Recommended module structure

For modules with meaningful business logic, prefer:

```text
src/
├── modules/
│   └── <module>/
│       ├── presentation/
│       │   └── controllers/
│       │
│       ├── application/
│       │   ├── dto/
│       │   └── use-cases/
│       │
│       ├── domain/
│       │   ├── entities/
│       │   ├── repositories/
│       │   └── errors/
│       │
│       ├── infrastructure/
│       │   └── repositories/
│       │
│       └── <module>.module.ts
│
├── common/
│   ├── interceptors/
│   ├── filters/
│   ├── pipes/
│   ├── guards/
│   └── decorators/
│
└── infrastructure/
    └── database/
```

For a very simple module, do not force every folder or class to exist. Use the smallest structure that keeps responsibilities clear.

---

# Controllers

Controllers are responsible for HTTP concerns only.

Controllers may:

- Receive HTTP requests.
- Read route params, query params, body, headers, and authenticated user context.
- Apply DTOs.
- Call a use case.
- Return the use case result.

Controllers should not:

- Query Drizzle directly.
- Contain business rules.
- Perform complex data transformations.
- Contain multi-step application workflows.
- Implement database transactions directly unless there is a clearly documented architectural reason.

Preferred style:

```ts
@Post()
create(@Body() dto: CreatePostDto) {
  return this.createPostUseCase.execute(dto);
}
```

---

# Use Cases

A use case represents an **application action or workflow**.

Examples:

- CreateUser
- UpdateUser
- DeleteUser
- GetUsers
- CreatePost
- LikePost
- AddComment
- SendMessage

Use cases are responsible for coordinating application behavior.

A use case may:

- Validate application-level business conditions.
- Load entities through repository interfaces.
- Apply domain rules.
- Coordinate multiple repositories/services when necessary.
- Persist changes through repository interfaces.
- Return application-level results.

A use case should not:

- Know about HTTP.
- Import Drizzle query APIs.
- Depend on PostgreSQL-specific implementation details.
- Contain controller concerns.

For simple CRUD, a small use case is acceptable. Do not create unnecessary domain entities solely because a use case exists.

---

# Domain

The domain contains rules that describe the business concepts of Connectify.

Domain code should be framework-independent whenever practical.

Examples of domain rules:

- A post cannot have empty content.
- A user cannot like the same post more than once.
- A blocked user cannot perform certain interactions.
- A conversation must have valid participants.

Do not put simple database field definitions into domain code just for the sake of having entities.

Create a domain entity when the object has meaningful behavior or invariants that benefit from encapsulation.

Domain code must not depend on:

- NestJS
- Drizzle ORM
- PostgreSQL
- HTTP request/response objects
- Controllers

---

# DTO and Validation Rules

Use **NestJS DTO classes** for external API input.

Use:

- `class-validator`
- `class-transformer`

DTO responsibilities:

- Validate request shape and input constraints.
- Transform primitive query/param values when appropriate.
- Represent API contracts.

DTOs must not:

- Query the database.
- Contain business workflows.
- Contain Drizzle logic.

Prefer separate DTOs when responsibilities differ:

```text
CreateUserDto
UpdateUserDto
UserQueryDto
PaginationDto
```

Use `PartialType`, `PickType`, or `OmitType` when it improves consistency without making validation behavior confusing.

---

# Global Validation

Use a global `ValidationPipe` with safe defaults appropriate to the API, normally including:

```ts
new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
})
```

Do not duplicate global validation logic inside every controller unless the endpoint has special requirements.

Validation errors should have a consistent API error format.

---

# Pagination

Pagination must be explicit for collection endpoints that can grow over time.

## Default approach

Use **offset/page-based pagination** for basic CRUD and simple administrative/list endpoints.

Example:

```http
GET /users?page=1&limit=20
```

Recommended DTO shape:

```ts
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}
```

Convert page to offset in the application layer:

```text
page + limit
    ↓
offset = (page - 1) * limit
    ↓
repository
```

Repository APIs should preferably receive database-friendly pagination parameters such as `limit` and `offset`, rather than HTTP-specific `page` concepts.

## Cursor pagination

Use cursor-based pagination for use cases such as:

- Home feed
- Infinite scroll
- Large or frequently changing collections
- Message history
- Notification feeds

Do not introduce cursor pagination everywhere just for consistency. Choose pagination based on endpoint behavior.

---

# Repository Pattern

Repository interfaces represent the data access contract.

Infrastructure contains the implementation.

Example:

```ts
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findMany(params: FindManyUsersParams): Promise<PaginatedResult<User>>;
  create(data: CreateUserData): Promise<User>;
  update(id: string, data: UpdateUserData): Promise<User>;
  delete(id: string): Promise<void>;
}
```

Implementation:

```ts
export class DrizzleUserRepository implements UserRepository {
  // Drizzle-specific implementation
}
```

Rules:

- Prefer repository methods that represent meaningful data access operations.
- Do not expose raw Drizzle query builders outside infrastructure.
- Do not return database-specific types when an application/domain model is more appropriate.
- Keep repository interfaces small and focused.

---

# Drizzle ORM Rules

Use **Drizzle ORM** for database access.

Do not introduce Prisma unless explicitly requested.

Prefer Drizzle ORM queries over raw SQL.

Raw SQL is allowed only when:

1. Drizzle cannot reasonably express the required query, or
2. Raw SQL provides a clearly justified database-specific capability.

When raw SQL is used:

- Keep it inside infrastructure.
- Parameterize values.
- Document why Drizzle was insufficient.

Do not modify existing schema definitions merely to make a query easier.

Database schema changes must be intentional and accompanied by the appropriate migration.

---

# Database and Transactions

Keep transaction handling close to the infrastructure/data-access boundary unless a cross-repository application workflow requires explicit transaction orchestration.

Do not start transactions for every CRUD operation by default.

When multiple writes must succeed or fail together, explicitly identify the transactional boundary.

Never silently introduce destructive database operations.

Do not:

- Drop tables without explicit instruction.
- Delete production data as part of development tooling.
- Reset migrations casually.
- Change existing column semantics without reviewing impact.

---

# Interceptors

Custom interceptors are allowed for **cross-cutting concerns**.

Good use cases:

- Response transformation
- Request/response logging
- Execution timing
- Other concerns that should consistently wrap request handling

Do not use interceptors for:

- Business logic
- CRUD operations
- Database access
- Authorization rules
- Domain invariants

If an interceptor is only needed by one endpoint and adds significant complexity, reconsider whether it belongs in a pipe, guard, controller, or application service instead.

---

# Exception Handling

Use NestJS exceptions and exception filters appropriately.

Controllers should not repeatedly implement the same error formatting logic.

Prefer a consistent API error structure, for example:

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "User not found"
  }
}
```

Do not catch and rethrow exceptions without adding meaningful information.

Translate infrastructure-specific errors into application/API-friendly errors at the appropriate boundary.

---

# Authentication and Authorization

Authentication and authorization are separate concerns.

- Authentication determines who the caller is.
- Authorization determines whether the caller may perform an action.

Use NestJS Guards for request-level authentication/authorization concerns.

Business-specific authorization rules may belong in the application/domain layer when they depend on business state.

Do not put database-heavy authorization workflows directly inside controllers.

Never trust user-provided IDs, ownership fields, or role claims without server-side verification.

---

# API Response Design

Keep API response structures predictable.

Do not wrap every response or create multiple competing response formats without a reason.

A response interceptor may be used to standardize successful responses, but it must remain a presentation concern.

Do not hide important business errors inside a generic `success: false` response with HTTP 200. Use appropriate HTTP status codes.

---

# Error and Edge-Case Expectations

When implementing an endpoint, consider at minimum:

- Missing resource
- Invalid input
- Duplicate/conflicting data
- Unauthorized access
- Forbidden access
- Empty collections
- Pagination boundaries
- Race conditions for uniqueness-sensitive operations
- Database constraint failures

Do not rely only on DTO validation for business correctness.

---

# Testing

When tests exist, preserve them and update them with behavior changes.

Prefer testing business behavior at the use-case/domain level without requiring HTTP or a real database when practical.

Recommended layers:

```text
Unit tests
├── Domain rules
└── Use cases

Integration tests
└── Repository / database behavior

E2E tests
└── HTTP API behavior
```

Do not mock everything blindly. Mock boundaries that isolate the behavior under test.

---

# Naming Conventions

Prefer explicit names.

Examples:

```text
create-user.use-case.ts
update-user.use-case.ts
get-users.use-case.ts
user.repository.ts
drizzle-user.repository.ts
create-user.dto.ts
user.controller.ts
```

Use names that describe behavior rather than generic names such as:

```text
common.service.ts
base.service.ts
helper.ts
manager.ts
```

unless their responsibility is genuinely generic.

---

# API Design Guidelines

Prefer resource-oriented REST APIs.

Examples:

```http
POST   /users
GET    /users
GET    /users/:id
PATCH  /users/:id
DELETE /users/:id

POST   /posts
GET    /posts
GET    /posts/:id
PATCH  /posts/:id
DELETE /posts/:id
```

For actions that represent a domain operation, explicit action endpoints may be used when they make the intent clearer:

```http
POST /posts/:id/like
POST /posts/:id/unlike
POST /users/:id/follow
DELETE /users/:id/follow
```

Do not force every business operation into CRUD when it makes the API less expressive.

---

# Logging and Sensitive Data

Never log:

- Passwords
- Access tokens
- Refresh tokens
- Session secrets
- Sensitive personal data unless required

Logs should contain enough context to debug a request without exposing credentials.

---

# Security Defaults

Always assume request data is untrusted.

At minimum:

- Validate all external input.
- Enforce authorization server-side.
- Use parameterized queries.
- Avoid leaking internal database errors to API clients.
- Never return password hashes or credentials through normal user endpoints.
- Do not trust client-controlled ownership/user IDs.

---

# Environment and Configuration

Do not hardcode secrets, tokens, passwords, or environment-specific credentials.

Use environment variables/configuration for:

- Database credentials
- Redis configuration
- JWT/session secrets
- Third-party API keys
- Environment-specific URLs

Do not commit `.env` secrets.

---

# Redis / Queue / Realtime

These concerns should be introduced only when a feature requires them.

When adding Redis, queues, or realtime behavior:

- Keep infrastructure-specific code in infrastructure modules.
- Hide implementation details behind focused interfaces where useful.
- Do not make domain logic depend directly on Redis, BullMQ, WebSocket libraries, or transport details.
- Use asynchronous processing for work that does not need to block the request when appropriate.

Do not add a queue, cache, or realtime layer just for demonstration.

---

# API Implementation Workflow

When implementing a new feature, follow this order unless the existing codebase requires otherwise:

### Step 1 — Understand

Inspect:

- Existing module structure
- Relevant schemas/relations
- Existing APIs
- Existing repository patterns
- Existing DTO/validation conventions

### Step 2 — Design

Identify:

- Endpoint contract
- DTOs
- Use case(s)
- Domain rules, if any
- Repository operations
- Persistence changes, if any

### Step 3 — Implement

Prefer the smallest complete implementation:

```text
DTO
  ↓
Controller
  ↓
Use Case
  ↓
Repository Interface
  ↓
Drizzle Repository
```

Add Domain Entity/Rules only where business invariants justify them.

### Step 4 — Validate

Run relevant:

- Type checks
- Lint
- Unit tests
- Integration/E2E tests
- Migration checks when schema changes

### Step 5 — Review

Before finishing, check:

- No unnecessary dependencies were introduced.
- Controller is not doing business logic.
- Use case does not know about HTTP/Drizzle.
- Infrastructure does not leak into domain.
- Validation is applied correctly.
- Error handling is consistent.
- API behavior is backward-compatible unless intentionally changed.

---

# Current Reference Module

The existing `User` CRUD implementation should be treated as the first reference module.

When improving the architecture, use `User` to establish the project's conventions for:

- DTOs
- Validation
- Controllers
- Use cases
- Repository interfaces
- Drizzle repositories
- Pagination
- Error handling
- Response handling

After the reference implementation is stable, apply the same conventions incrementally to other modules.

Do not refactor every module at once unless explicitly requested.

---

# Frontend

## Stack

The web app lives in `apps/web`. Shared UI primitives live in `packages/ui`.

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** — theme tokens are CSS variables in `packages/ui/src/styles/globals.css`
- **shadcn/ui**, style `base-nova`, built on **Base UI** (`@base-ui/react`) — not Radix
- **lucide-react** for every icon
- **next-themes** for light/dark mode (`.dark` class on `<html>`)
- **Geist** (sans) and **Geist Mono** via `next/font/google`, already wired in `apps/web/app/layout.tsx`
- **zod** for client-side schemas

Do not add another component library, CSS-in-JS solution, icon set or font.

## Design reference

The approved UI design is the **Connectify** canvas: https://claude.ai/artifact/WY8veqMfwQyN7jF6cgCBRT

It contains Home, Profile, Messages (light + dark), Notifications, Search, mobile Feed/Inbox/Chat, Login/Register/Forgot/Reset and a **Design system** board (tokens, components, states).

When building a screen:

1. Match the corresponding artboard for layout, hierarchy, spacing and copy.
2. Take tokens and component styles from the Design system board — never from screenshots of other products.
3. Placeholder values written as `[like this]` in the design are not real copy; replace them with real data.
4. If the design and these rules disagree, these rules win; raise the difference instead of silently diverging.

---

## Where code goes

```text
packages/ui/src/
├── components/        # shadcn primitives only (button, input, dialog, …)
├── hooks/             # generic hooks with no product knowledge
├── lib/utils.ts       # cn()
└── styles/globals.css # ALL design tokens

apps/web/
├── app/                       # routes, layouts, loading/error/not-found files
│   ├── (auth)/                # login, register, forgot-password, reset-password
│   └── (app)/                 # authenticated shell: home, profile, messages, …
├── components/
│   ├── layout/                # AppShell, SidebarNav, BottomNav, RightRail
│   └── shared/                # product-wide composites: UserAvatar, EmptyState, …
├── features/
│   └── <feature>/             # posts, comments, profile, messages, notifications, search, auth
│       ├── components/        # feature UI (PostCard, Composer, MessageBubble, …)
│       ├── api/               # request functions + query hooks for this feature
│       ├── schemas/           # zod schemas / types for this feature
│       └── hooks/             # feature-specific client logic
└── lib/                       # api client, query client, socket client, env, formatters
```

Rules:

- `packages/ui` must not import from `apps/web`, call the API, or know about Connectify concepts (posts, users, messages).
- Add shadcn primitives with the shadcn CLI so they land in `packages/ui`; then adjust them to the tokens below. Do not hand-copy components from the internet.
- A component used by two or more features moves to `components/shared`. A primitive variant used everywhere (e.g. a new button size) goes into the primitive's `cva` variants, not a wrapper component.
- Never create a page-specific copy of an existing component (`ProfileButton`, `MessagesAvatar`). Extend the shared one with a prop or variant.
- File names are kebab-case (`post-card.tsx`); components are PascalCase named exports.

---

## Server vs Client Components

- Default to **Server Components**. Add `"use client"` only to the smallest component that needs state, effects, event handlers, browser APIs or realtime subscriptions.
- Pages and layouts fetch the initial data on the server and pass it down; interactive leaves (like button, composer, message input) are client components.
- Never import server-only code (secrets, cookies helpers) into a client component.
- Use `loading.tsx` with skeletons and `error.tsx` with a retry action for every route segment that fetches data.

## Data, state and the API

- All HTTP calls go through one API client in `apps/web/lib/api-client.ts` (base URL from env, credentials, JSON, error normalization). Components never call `fetch` with raw URLs.
- The client converts the API error shape (`{ success: false, error: { code, message } }`) into a typed `ApiError` with `status`, `code` and `message`. UI branches on `code`, never on message text.
- Server state on the client uses **TanStack Query** (add it when the first interactive data feature lands). Query keys live next to their feature in `features/<feature>/api`, e.g. `postKeys.feed()`, `postKeys.detail(id)`.
- Do not mirror server data into `useState` or a global store. Local UI state (open dialogs, drafts, selected tab) stays in the component; URL-worthy state (search query, active tab, conversation id) lives in the URL.
- Match backend pagination: **cursor-based infinite queries** for feed, comments, messages and notifications; page-based for simple lists.
- Keep TypeScript types for API responses in the feature's `schemas/`; validate untrusted shapes at the boundary with zod where it matters (auth, forms).

## Forms

- Validate with **zod**, mirroring the backend DTO constraints (length, required, format). The server stays the source of truth: show server field errors next to the field.
- Every input has a visible `<label>`; errors use `aria-invalid` + `aria-describedby` and appear below the field in `destructive` color.
- Submit buttons show a loading state (spinner + label, same width) and are disabled while submitting or when the form is invalid/empty.
- Never log, persist to localStorage, or put in the URL any password, token or reset code.

## Authentication state

- Auth uses httpOnly cookies set by the API. The client never reads or stores tokens.
- Route protection happens on the server (layout/middleware for `(app)`); client-side checks are for UX only.
- On a `401` from the API, clear the query cache and redirect to `/login?next=<current path>`.
- Auth pages (`(auth)` group) use a separate, simpler layout: wordmark top-left, single centered column max 400px, no sidebars.

## Realtime

- One socket connection, created in a client provider inside the `(app)` layout, in `apps/web/lib/socket.ts`. Feature code subscribes through small hooks (`useConversationEvents`, `useNotificationEvents`), never by touching the socket directly.
- Incoming events **update the TanStack Query cache** (append message, bump unread count, set presence). Components re-render from the cache; they don't keep their own copy.
- Realtime must never move content under the user's eyes:
  - New feed posts and notifications are announced with a pill ("2 new posts") and inserted only when the user clicks it.
  - Chat stays pinned to the bottom only if the user is already at the bottom; otherwise show a "New messages" jump button.
  - Unread counters and presence dots update in place.
- Typing indicators: send at most once every 3s while typing, expire after 5s without an event.
- Show a quiet "Reconnecting…" banner on socket loss; never block the UI.

## Optimistic interactions

Likes, follows, sending messages, posting and marking notifications read must feel instant:

1. Update the cache immediately (`onMutate`), saving the previous value.
2. Show in-flight state where meaningful (message at reduced opacity with "Sending…", post with "Posting…").
3. On error, roll back to the previous value and show a toast with **Retry**.
4. On settle, reconcile with the server response (real id, real counts).

Never block the button with a spinner for likes/follows. Counts use `font-mono tabular-nums` so they don't jitter.

---

## Design system

### Look

Clean, warm-neutral, one brand color. Familiar social patterns, but not a clone of Facebook, Instagram, X or Discord.

Avoid: gradients (except skeleton shimmer), heavy shadows, glassmorphism, emoji as icons, pill-shaped "bubble" everything, more than one accent color, decorative animation.

### Color tokens

All colors come from CSS variables in `packages/ui/src/styles/globals.css`, mapped onto the shadcn names. **Never hard-code hex/oklch values or use raw Tailwind palette classes (`bg-teal-600`, `text-gray-500`) in components.**

| Token (shadcn name) | Role | Light | Dark |
| --- | --- | --- | --- |
| `--background` | page ground | `#F6F6F3` | `#0E0F11` |
| `--card`, `--popover` | cards, menus, sidebars | `#FFFFFF` | `#16171A` |
| `--muted` | subtle fills (comment bubble, search field) | `#F1F1ED` | `#1D1E22` |
| `--accent` | hover fill for rows/ghost buttons | `#ECECE7` | `#24252A` |
| `--border`, `--input` | hairlines / input borders | `#E5E5DF` / `#D4D4CC` | `#28292E` / `#383A40` |
| `--foreground` | primary text | `#17181C` | `#ECECE8` |
| `--muted-foreground` | secondary text, meta, timestamps | `#676A72` | `#93969D` |
| `--primary` | brand teal: primary actions, selection, unread | `#0B6E63` | `#34B8A5` |
| `--primary-foreground` | text on primary | `#FFFFFF` | `#04201C` |
| `--ring` | focus ring | = primary | = primary |
| `--destructive` | delete, errors | `#B42833` | `#F0707A` |

Product-specific tokens (add next to the shadcn ones and register them in `@theme inline`):

| Token | Role | Light | Dark |
| --- | --- | --- | --- |
| `--brand-soft` | active nav item, selected conversation, chips | `#E2F0EC` | `#11302B` |
| `--brand-ink` | text/links on light surfaces in brand color | `#09594F` | `#6AD8C6` |
| `--unread` | background of unread notification rows | `#F3F8F6` | `#132421` |
| `--like` / `--like-soft` | liked heart only | `#C42F50` / `#FBE8EC` | `#F2728B` / `#3A1B23` |
| `--online` | presence dot | `#1E9150` | `#3FD07D` |
| `--avatar-1…5` + `--avatar-1…5-fg` | initials avatar tints (teal, amber, slate, rose, olive) | see canvas | see canvas |

Usage rules:

- Teal (`primary`) is the **only** brand color. Use it for primary buttons, active states, unread dots/badges and focus. Don't use it for decoration.
- `like` is reserved for the like action. `destructive` is reserved for destructive actions and errors.
- Status is never conveyed by color alone: online dots have an `aria-label`, unread rows also have a dot and bolder text.
- Text contrast must be ≥ 4.5:1 (3:1 for 24px+). Check new color pairs in both themes.

### Typography

Geist for everything; Geist Mono only for numbers that change in place (counts, times).

| Style | Size / weight | Use |
| --- | --- | --- |
| Display | 28px / 700, tracking -0.025em | auth page titles |
| Title | 22px / 650, tracking -0.02em | page titles (Home, Messages) |
| Heading | 15px / 650 | card and section headings |
| Body | 15px / 400, line-height 1.55 | posts, bios |
| Message | 14.5–15px / 400, line-height 1.45 | chat bubbles |
| Small | 13px | meta, buttons in lists, secondary text |
| Caption | 12px | timestamps, hints, field errors |

Use font weight and color for hierarchy before size. No all-caps labels.

### Spacing, radius, elevation

- Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 px (Tailwind `1 2 3 4 6 8`). Card padding 16px; page gutter 24px desktop, 16px mobile; gap between feed cards 16px.
- Radius: `--radius` = 10px (controls, inputs, buttons). Cards 14px (`rounded-xl`), small chips/badges 6px, avatars and pill buttons full. Chat bubbles 14px with a 4px "tail" corner on the last bubble of a group.
- Elevation: surfaces are flat with a 1px `border`. Shadows only on floating layers (menus, popovers, toasts, dialogs, the "new posts" pill).

### Icons

- lucide-react only, default `size-[18px]`–`size-5`, `strokeWidth` 1.9 for nav/actions.
- Icon-only buttons always have `aria-label` (and a Tooltip on desktop).
- Active nav items may use a lightly filled icon; everything else is stroke.

---

## Components

Reuse these; extend with variants instead of forking.

**Primitives (`packages/ui`):** Button, Input, Textarea, Label, Card, Dialog, AlertDialog, DropdownMenu, Popover, Tooltip, Tabs, Toast/Sonner, Skeleton, Switch, Checkbox, Badge, Separator, ScrollArea.

**Button variants:** `default` (primary teal), `outline`/`secondary`, `ghost`, `destructive` (solid red with white text for confirm-delete), `link`. Sizes: `sm` 32px, `default` 40px, `lg` 46px (auth forms), `icon` 40px. On touch layouts the hit area must be ≥ 44px even if the visual is smaller.

**Shared product components (`apps/web/components/shared`):**

- `UserAvatar` — initials or image, sizes 28/32/36/40/44/80/112, optional `presence="online" | "offline"` dot with label.
- `AvatarStack` — overlapping avatars with `+N`.
- `CountBadge` — unread count (mono, max `99+`); `UnreadDot`.
- `FollowButton` — `Follow` (primary) ↔ `Following` (outline), optimistic, `aria-pressed`.
- `EmptyState` — icon tile, title, one-line description, optional action.
- `ErrorState` — same layout with destructive icon and **Try again**.
- `NewItemsPill` — floating "N new posts / notifications" button for realtime inserts.
- `RelativeTime` — `<time dateTime>` with "12m", "3h", "Mon", "Sep 28".

**Feature components:** `PostCard`, `PostComposer`, `PostActions` (like/comment/share/save), `CommentThread` (one level of replies shown inline, "View all N comments"), `ProfileHeader`, `ConversationList`, `ConversationItem`, `MessageGroup`, `MessageBubble`, `TypingIndicator`, `MessageComposer`, `NotificationItem`, `SearchResults`.

Components receive data and callbacks through props; data fetching stays in the page or a feature hook, not inside presentational components.

---

## Layouts

### Breakpoints

Use Tailwind defaults: `md` 768px, `lg` 1024px, `xl` 1280px.

### Authenticated app shell

- **≥ xl:** three columns in a centered container (max-width 1320px, gap 32px): left nav (~240px), main column (max 680px), right rail (~320px).
- **lg:** left nav + main; right rail hidden (its content moves into pages where relevant, e.g. "Who to follow" in Search).
- **< md:** single column, sticky top bar (avatar · wordmark · messages) and a **bottom nav** with Home, Search, New post, Messages, Notifications (Alerts). Bottom nav is ≥ 64px tall and respects `env(safe-area-inset-bottom)`.
- Left nav: wordmark, Home, Search, Notifications (count), Messages (count), Profile, Settings, primary **New post** button, current-user card at the bottom. Active item = `brand-soft` background + `brand-ink` text + `aria-current="page"`.

### Page-specific

- **Home:** page title with For you / Following tabs, composer card, `NewItemsPill`, post cards, infinite scroll with a skeleton card at the end. Right rail: search field, Who to follow, Online now, Trending.
- **Profile:** cover band, 112px avatar overlapping the cover, name, handle, "Follows you" badge, bio, meta (location, link, joined), counts, mutual followers. Actions: Follow, Message, more menu. Tabs: Posts, Replies, Likes, Media; each with its own empty state.
- **Messages (desktop):** collapse the left nav to a 72px icon rail. Columns: conversation list (~340px) · active conversation (fills) · details panel (~300px, toggleable). Conversation rows show avatar + presence, name, preview (or "typing…" in brand color), time, unread badge; unread rows are bolder.
- **Messages (mobile):** inbox and conversation are separate routes; conversation hides the bottom nav, has a back button, and pins the composer to the bottom above the keyboard.
- **Chat thread:** messages grouped by sender and time; incoming bubbles on `card` with border, outgoing on `primary`; avatar on incoming groups; date separators ("Today"); a "New messages" divider; status under the last outgoing group (Sending… → Sent → Seen); Enter sends, Shift+Enter adds a new line; send button disabled when empty.
- **Notifications:** title + "Mark all as read"; tabs All / Unread / Comments & replies / Follows; sections "New" and "Earlier". Each row: actor avatar with a small type icon, text, quoted snippet, time, unread dot + `--unread` background. Follow rows show Follow back; message rows show Reply.
- **Search:** large search field; idle state = recent searches; tabs Top / People / Posts; matched terms highlighted with `<mark>`; skeletons while loading (debounce ~300ms); empty state with "Clear search".
- **Auth:** Login (email, password with show/hide, keep me logged in, forgot link), Register (display name, username with live availability, email, password with strength meter), Forgot password (email → "Check your inbox" state), Reset password (live requirement checklist, confirm match).

---

## UX states (required for every data-driven view)

| State | Rule |
| --- | --- |
| Loading | Skeletons shaped like the real content (avatar circle + text lines). Spinners only for small inline waits ("Loading older messages…"). Never a full-page spinner. |
| Empty | `EmptyState` with a specific title ("No messages yet"), one helpful sentence and, when possible, the next action. |
| Error | `ErrorState` or inline error with **Try again**. Keep already-loaded content visible. Never show raw server messages or stack traces. |
| Disabled | Opacity ~0.45 + `cursor-not-allowed`; explain why when it isn't obvious. |
| Hover | Rows/ghost buttons use `accent`; primary darkens slightly. No movement or scaling. |
| Focus | Visible 2px `ring` with 2px offset on every interactive element (`focus-visible`). Never remove outlines without a replacement. |
| Pending | In-flight items rendered in place with reduced opacity and a status word. |

---

## Accessibility

- Use real elements: `<button>` for actions, `<a>`/`<Link>` for navigation, `<input>` with `<label>`. Never put click handlers on `div`/`span`.
- Landmarks: `<nav aria-label="Primary">`, one `<main>`, `<aside>` for rails; one `<h1>` per page.
- Tabs use the Tabs primitive (`role="tab"`, `aria-selected`); toggles use `aria-pressed` (like, follow); the current nav item uses `aria-current="page"`.
- The chat message list is `role="log"` with `aria-live="polite"`; typing indicator is `role="status"`; toasts use `role="status"` (errors `role="alert"`).
- All images have meaningful `alt` (or `alt=""` if decorative); avatars of initials get the user's name as label.
- Respect `prefers-reduced-motion` (disable shimmer, typing bounce, transitions).
- Everything must be keyboard reachable in a logical order; dialogs trap focus and return it on close; destructive dialogs focus **Cancel** first.

## Copy and tone

- Friendly, short, sentence case. Buttons are verbs ("Post", "Send", "Follow back", "Mark all as read").
- Errors say what happened and what to do ("Couldn't like that post. Retry").
- Destructive confirmations name the object and the consequence ("Delete this post? It will be removed from everyone's feed, along with its 24 comments.").
- Never invent statistics or placeholder lorem ipsum in shipped UI.

## Theming

- Light and dark must both be correct for every component; test both before finishing.
- Theme switching uses `next-themes` (`attribute="class"`); never branch styles in JS on the current theme — use tokens and the `dark:` variant only when a token can't express it.

---

## Frontend workflow checklist

Before finishing a frontend task, check:

- The screen matches its artboard on the design canvas (layout, spacing, copy, states).
- Only tokens are used for color, radius and shadow; no raw hex or palette classes.
- Existing primitives/shared components were reused; no near-duplicate components were added.
- `"use client"` is limited to interactive leaves.
- Loading, empty, error, disabled, hover and focus states exist.
- Optimistic updates roll back on error with a Retry toast.
- Realtime updates don't shift content unexpectedly.
- Works at 375px, 768px and 1280px+ widths, in light and dark.
- Keyboard and screen-reader basics pass (labels, focus, landmarks, aria states).
- `pnpm --filter web lint` and `pnpm --filter web typecheck` pass.
