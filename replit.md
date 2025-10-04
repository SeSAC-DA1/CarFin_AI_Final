# CarFin AI - AI-Based Used Car Recommendation System

## Overview

CarFin AI is an AI-powered used car recommendation platform that helps users find their perfect vehicle through natural conversation. The system uses advanced AI collaboration and data-driven analysis to provide personalized recommendations from 150K+ real vehicle listings in under 1.2 seconds.

**Core Value Proposition:** "Tell us what you need, we'll find the perfect car" - AI analyzes your requirements and searches through 150K+ actual vehicle listings to deliver optimal recommendations with detailed 6-tab analysis dashboards.

**Tech Stack:**
- Frontend: React + TypeScript + Vite + TailwindCSS + shadcn/ui
- Backend: Express.js + Node.js
- Database: PostgreSQL (Neon serverless OR AWS RDS) with Drizzle ORM
- Cache: Redis/ElastiCache Valkey (optional)
- AI: Google Gemini 2.5 Flash (multi-agent system)
- Deployment: Replit OR AWS (EC2/ECS/Elastic Beanstalk)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Component-Based React Application**
- **Framework:** React 19 with TypeScript, built using Vite for fast development
- **Routing:** Wouter for lightweight client-side routing
- **State Management:** TanStack Query (React Query) for server state management
- **Styling:** TailwindCSS v4 with custom design system based on shadcn/ui (New York variant)

**Design System:**
- Korean-optimized typography using Pretendard Variable font (primary) and JetBrains Mono (monospace for prices/data)
- Dark mode mandatory throughout application
- Custom color palette with HSL-based theming (Primary: 59 89% 53%, Dark: 222 47% 11%)
- Responsive layouts with mobile-first breakpoints

**Key Pages:**
- `/` - Landing page with hero, stats, features, process, technology section (natural UX, no overt academic references)
- `/chat` - Main AI chat interface with guided question prompts and real-time recommendations

**Key Features Implemented (Dec 2024):**
- ✅ 6-Tab Data Analysis Modal: Overview, TCO, Reviews, Market Comparison, Safety/Inspection, Detailed Comparison
- ✅ Top 3 Horizontal Ranking Cards: Real vehicle photos, sale site URLs ("보러가기"), location badges
- ✅ Question Guidance System: Welcome message with example prompts to help users get accurate recommendations
- ✅ Natural UX/UI: Removed overt academic references, ChatGPT/Encar-style conversational interface
- ✅ WebSocket Real-time Streaming: TOPSIS ranking, multi-agent collaboration

**Component Architecture:**
- Reusable UI components from shadcn/ui library (@radix-ui primitives)
- Custom components: VehicleRecommendations (Top 3 cards), VehicleInsightsModal (6-tab dashboard), ChatInterface, MessageBubble, QuickReplyButtons
- Natural user journey design inspired by ChatGPT and Encar AI chatbot

### Backend Architecture

**Express.js Server with Vite Integration**
- Development mode uses Vite middleware for HMR
- Production serves pre-built static assets
- Request/response logging with timing metrics
- Error handling middleware for consistent error responses

**API Structure:**
- Routes registered via `registerRoutes()` in `server/routes.ts`
- All API endpoints prefixed with `/api`
- Session-based storage system (currently in-memory, expandable to database)

**Storage Layer:**
- Abstract `IStorage` interface for CRUD operations
- Current implementation: `MemStorage` (in-memory)
- Designed for future PostgreSQL integration with Drizzle ORM
- User management with UUID-based IDs

### Database Design

**Drizzle ORM Configuration:**
- **Dual-mode database support**:
  - **Development**: Neon serverless with WebSocket
  - **Production**: AWS RDS PostgreSQL with connection pooling
- Schema defined in `shared/schema.ts`
- Migrations output to `./migrations` directory
- Auto-detection based on `DB_TYPE` or DATABASE_URL hostname

**AWS RDS Integration (Production):**
- **TLS Security**: `rejectUnauthorized: true` with CA certificate validation
- **Connection Pooling**: max 20 connections, 2s timeout
- **Migration Script**: `scripts/export-to-rds.ts` with Parameterized Queries
- **Security**: SQL Injection prevention via prepared statements

**ElastiCache Valkey (Optional):**
- **Cache Layer**: Redis-compatible in-memory cache
- **TLS Security**: Certificate validation with CA bundle
- **Cache Strategy**: 5-minute TTL for vehicle data
- **Functions**: `getCached()`, `setCache()`, `deleteCache()`, `clearCachePattern()`

**Current Schema:**
- `users` table with id (UUID), username (unique), password
- Zod validation schemas for type-safe inserts
- Designed for multi-agent chat system expansion

**Planned Architecture (based on attached assets):**
- Vehicle listings table (150K+ records)
- User sessions and conversation history
- Agent collaboration logs
- TOPSIS scoring results

### Multi-Agent AI System

**Technical Foundation (Research-Based, Presented Naturally):**
1. **Multi-Agent Collaboration:** AI agents work together in real-time for accurate recommendations
2. **Personalized Re-ranking:** User feedback instantly influences recommendations
3. **Multi-Criteria Evaluation (TOPSIS):** 6-factor objective vehicle assessment

**Agent Architecture (Invisible to Users):**
- **Concierge Agent:** Conversation management and coordination
- **Needs Analyst:** User requirement analysis from conversation context
- **Data Analyst:** Market data, TCO, and vehicle data analysis

**User Experience:**
- Natural conversational interface (no technical jargon)
- Guided question prompts with examples
- Real-time progress indicators ("AI가 분석중입니다...")
- WebSocket streaming for instant responses

### Build & Deployment

**Development:**
- `npm run dev` - Runs Express server with Vite HMR on development mode
- TypeScript compilation with path aliases (@/, @shared/, @assets/)
- Incremental compilation with tsBuildInfo caching

**Production Build:**
- `npm run build` - Vite build for client + esbuild bundle for server
- Client output: `dist/public`
- Server output: `dist/index.js`
- ESM format with external package bundling

**Replit Optimizations:**
- Runtime error modal plugin for development
- Cartographer plugin for code navigation
- Dev banner for Replit environment
- Strict file system security settings

## External Dependencies

### AI & Machine Learning
- **@google/genai (^1.22.0):** Google Gemini API integration for multi-agent AI system
- Gemini 2.5 Flash model for agent responses
- Agent-to-agent (A2A) collaboration framework

### Database & ORM
- **@neondatabase/serverless (^0.10.4):** PostgreSQL serverless adapter with WebSocket support
- **pg (^8.13.1):** PostgreSQL client for AWS RDS (production)
- **drizzle-orm (^0.39.1):** TypeORM for database operations
- **drizzle-kit:** Database migrations and schema management
- **drizzle-zod (^0.7.0):** Zod schema integration for type safety
- **connect-pg-simple (^10.0.0):** PostgreSQL session store for Express

### Caching & Performance
- **ioredis (^5.4.2):** Redis client for ElastiCache Valkey
- Server-side caching with 5-minute TTL
- Vehicle data caching for sub-100ms response times

### UI Component Library
- **@radix-ui/react-*** (v1.x-2.x):** Comprehensive primitive components
  - Accordion, Alert Dialog, Avatar, Checkbox, Dialog, Dropdown Menu
  - Navigation Menu, Popover, Progress, Radio Group, Select, Slider
  - Tabs, Toast, Tooltip, and more
- **shadcn/ui configuration:** New York style variant with custom theming
- **lucide-react (^0.544.0):** Icon system
- **class-variance-authority (^0.7.1):** CVA for component variants
- **tailwind-merge + clsx:** Utility class composition

### Frontend Framework & Tooling
- **react (19.1.0) + react-dom (19.1.0):** Latest React version
- **@tanstack/react-query (^5.60.5):** Server state management
- **wouter:** Lightweight routing alternative to React Router
- **react-hook-form + @hookform/resolvers (^3.10.0):** Form management
- **date-fns (^3.6.0):** Date manipulation utilities

### Development Tools
- **vite:** Frontend build tool with React plugin
- **@vitejs/plugin-react:** React Fast Refresh support
- **@replit/vite-plugin-*:** Replit-specific development enhancements
- **esbuild:** Server-side bundling for production
- **tsx:** TypeScript execution for development server

### Validation & Utilities
- **zod:** Runtime type validation and schema definition
- **nanoid:** Unique ID generation
- **ws:** WebSocket library for Neon database connection