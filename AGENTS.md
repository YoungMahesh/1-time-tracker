# Context

## Project Overview

### Description

This project is created to track time spent on different tasks.

User can start and stop tracker for a task.

## Tech Stack

- Framework: NextJS v16 App Router
- Package Manager: pnpm

- Styling: TailwindCSS v4
- UI Components: Shadcn UI with Base UI
- Icons: lucide-react

- Database: IndexedDB

- Progressive Web App support: Service Worker file is built using using `scripts/build-sw.mjs`

## Structure

- `app/` — Next.js App Router (layouts, pages, API routes, server actions)
- `components/` — React components
  - `components/ui` - UI components from shadcn
- `lib/types/` — TypeScript types and interfaces
- `lib/db.ts` - Database operations
- `lib/context/` - React Contexts

# Instructions for AI Agents:

## Commands

- **DO NOT** run `dev` or `build` commands
- To **Install Shadcn Component** use `pnpm dlx shadcn@latest add <component-name>`

## After changes

- Run `pnpm run lint && pnpm run typecheck` and fix any errors or warnings in the output

### Create Final output

2. **Commit Message**: A concise message describing the change which I can paste into git commit
