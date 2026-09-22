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
- ⏳ Frontend: **Next.js** rules will be added later

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

# Next.js Placeholder

Frontend rules will be added later.

Until then, do not invent frontend-specific architecture rules in this document unless a task requires them.

Future frontend concerns may include:

- Next.js App Router
- Server vs Client Components
- API client conventions
- React Query / server state
- Form validation
- Authentication state
- UI component structure

These rules are intentionally deferred.
