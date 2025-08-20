# SCERT Backend

Backend API for the SCERT (State Council of Educational Research and Training) project.

## Features

- **Multi-level Approval Workflow**: Requisitions follow a structured approval process: School → Block → District → State
- **User Authentication & Authorization**: Role-based access control for different administrative levels
- **Book Management**: Comprehensive book catalog with category and subject classification
- **Stock Management**: Real-time inventory tracking across all levels
- **Backlog Management**: Track and manage book shortages and surpluses

## Multi-Level Approval System

The system implements a comprehensive approval workflow for book requisitions:

1. **School Level**: Schools create requisitions that start with `PENDING_BLOCK_APPROVAL` status
2. **Block Level**: Block administrators review and approve/reject requisitions
   - Approved requisitions move to `PENDING_DISTRICT_APPROVAL`
   - Rejected requisitions are marked as `REJECTED_BY_BLOCK`
3. **District Level**: District administrators review block-approved requisitions
   - Approved requisitions move to `PENDING_STATE_APPROVAL`
   - Rejected requisitions are marked as `REJECTED_BY_DISTRICT`
4. **State Level**: State administrators give final approval
   - Approved requisitions are marked as `APPROVED`
   - Rejected requisitions are marked as `REJECTED_BY_STATE`

For detailed API documentation, see [MULTILEVEL_APPROVAL.md](./MULTILEVEL_APPROVAL.md).

## Quick Start

1. Install dependencies:

   ```bash
   bun install
   ```

2. Set up environment variables:

   ```bash
   cp .env.example .env
   # Edit .env with your database URL and other configurations
   ```

3. Run database migrations:

   ```bash
   bun run db:migrate
   ```

4. Seed the database (optional):

   ```bash
   bun run db:seed
   ```

5. Start the development server:
   ```bash
   bun run --hot src/index.ts
   ```

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Requisitions (Multi-level Approval)

- `GET /api/requisitions` - Get all requisitions
- `POST /api/requisitions` - Create new requisition
- `GET /api/requisitions/:id` - Get requisition details
- `GET /api/requisitions/:id/timeline` - Get approval timeline
- `POST /api/requisitions/:id/approve/block` - Block level approval
- `POST /api/requisitions/:id/approve/district` - District level approval
- `POST /api/requisitions/:id/approve/state` - State level approval
- `GET /api/requisitions/pending/block/:blockCode` - Get pending block requisitions
- `GET /api/requisitions/pending/district/:district` - Get pending district requisitions
- `GET /api/requisitions/pending/state` - Get pending state requisitions

### Schools, Books, Stock Management

- `GET /api/schools` - List all schools
- `GET /api/books` - List all books
- `GET /api/stock` - Stock management endpoints
- `GET /api/blocks` - List all blocks
- `GET /api/districts` - List all districts

## Database Schema

The application uses PostgreSQL with Prisma ORM. Key models include:

- **Requisition**: Book requests with multi-level approval tracking
- **School**: Educational institutions with hierarchical organization
- **Book**: Book catalog with academic year and subject classification
- **Stock**: Inventory tracking across different administrative levels
- **Profile**: User profiles with role-based access

## Technology Stack

- **Runtime**: Bun
- **Framework**: Hono
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Better Auth

## Development

### Database Operations

```bash
# Run migrations
bun run db:migrate

# Reset database (development only)
bun prisma migrate reset

# Open Prisma Studio
bun run db:studio
```

### Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Request handlers
├── middlewares/    # Custom middleware
├── routes/         # API route definitions
└── libs/          # Utility functions
```
