# Context

## Project Overview

### Description

This project is created to track time spent on different tasks.

User can start and stop tracker for a task.

## Tech Stack

- Framework: NextJS App Router
- Package Manager: pnpm

- Styling: TailwindCSS
- UI Components: Shadcn UI with Base UI
- Icons: lucide-react

- Database: IndexedDB

## Structure

- `app/` — Next.js App Router (layouts, pages, API routes, server actions)
- `components/` — React components
  - `components/ui` - UI components from shadcn
- `lib/types/` — TypeScript types and interfaces
- `lib/db.ts` - Database operations

# Instructions for AI Agents:

## Commands

- **DO NOT** run `dev` or `build` commands
- To **Install Shadcn Component** use `pnpm dlx shadcn@latest add <component-name>`

## Before making any changes

1. Read the code related to changes you are going to make
2. Create clarifying questions to understand the feature requirements and scope if needed under 'Questions' title, else put 'No Questions' under 'Questions' title.
3. If there are questions, display them to me, stop the process so i can send you next prompt with answers of that questions

## After changes

- Run `pnpm run lint && pnpm run typecheck` and fix any errors or warnings in the output

### Create Final output

1. **Summary**: What was implemented
2. **Validation**: Confirmation that lint and typecheck pass
3. **Wrong or Missing Context**: Tell me anything provided in this documentation was wrong or more could have been part of the context given to you because of which it would have been easier for you to implement these changes. If there is nothing missing, say "None"
4. **Commit Message**: A concise message describing the change which I can paste into git commit
