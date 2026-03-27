# Context

## Project Overview

### Name

0 Time Tracker

### Description

This project is created to track time spent on different tasks.

User can start and stop tracker for a task.

## Tech Stack

- Framework: NextJS App Router
- Styling: TailwindCSS
- Package Manager: pnpm
- UI Components: Shadcn UI with Base UI
- Database: IndexedDB

## Structure

- `app/` — Next.js App Router (layouts, pages, API routes, server actions)
- `components/` — React components
  - `components/ui` - UI components from shadcn
- `lib/types/` — TypeScript types and interfaces
- `lib/db.ts` - Database operations

## Validation

- **DO NOT** run `dev`, `build`, commands
- To **Install Shadcn Component** use `pnpm dlx shadcn@latest add <component-name>`

# Instructions for AI Agents:

## 1. Before making any changes

- Ask clarifying questions to understand the feature requirements and scope if needed under 'Questions' title, else put 'No Questions' under 'Questions' title.

## 2. During changes

- Check existing types and patterns to maintain consistency

## 3. After changes

- Run `pnpm run lint && pnpm run typecheck` and fix any errors or warnings in the output

### 4. Create Final output

1. **Summary**: What was implemented
2. **Validation**: Confirmation that lint and typecheck pass
3. **Wrong or Missing Context**: Tell me anything provided in this documentation was wrong or more could have been part of the context given to you because of which it would have been easier for you to implement these changes. If there is nothing missing, say "None"
4. **Improvement in README.md file**: Tell me if we can add or remove text from this file to make it more useful for future AI agent queries especially for you
5. **Commit Message**: A concise message describing the change which I can paste into git commit
