# AGENTS.md - Coding Agent Guidelines

This document provides guidelines for AI coding agents working in this repository.

## Project Overview

A React dashboard application for tracking cohort/student progress in a coding camp.
Built with Vite + React 18 + TypeScript + shadcn/ui + Tailwind CSS.

## Quick Reference

| Tool      | Command                              |
|-----------|--------------------------------------|
| Dev       | `npm run dev`                        |
| Build     | `npm run build`                      |
| Lint      | `npm run lint`                       |
| Test      | `npm run test`                       |
| Test (watch) | `npm run test:watch`              |

## Build & Development Commands

```bash
# Install dependencies
npm install

# Start development server (port 8080)
npm run dev

# Production build
npm run build

# Development build (unminified)
npm run build:dev

# Preview production build
npm run preview
```

## Testing

Testing uses Vitest with React Testing Library and jsdom environment.

```bash
# Run all tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Run a single test file
npx vitest run src/test/example.test.ts

# Run tests matching a pattern
npx vitest run --testNamePattern="should pass"

# Run tests in a specific directory
npx vitest run src/components/
```

Test files use the pattern: `*.test.ts` or `*.test.tsx` or `*.spec.ts` or `*.spec.tsx`
Test setup file: `src/test/setup.ts`

## Linting

```bash
# Run ESLint on all files
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

ESLint is configured with:
- TypeScript-ESLint recommended rules
- React Hooks rules (required)
- React Refresh rules (warns on non-constant exports)
- `@typescript-eslint/no-unused-vars` is disabled

## Project Structure

```
src/
  components/
    ui/           # shadcn/ui primitives (Button, Card, etc.)
    dashboard/    # Dashboard-specific components
  data/           # Data models and mock data
  lib/            # Utilities (cn helper)
  pages/          # Route page components
  test/           # Test setup and test files
  App.tsx         # Root component with providers
  main.tsx        # Entry point
```

## Code Style Guidelines

### Imports

Use the `@/` path alias for all src imports:

```tsx
// Correct
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Incorrect
import { Button } from "../components/ui/button";
import { cn } from "../../lib/utils";
```

Import order (not enforced but preferred):
1. React and external libraries
2. UI components from `@/components/ui/`
3. Custom components
4. Utilities and helpers
5. Data and types

### Component Patterns

Use arrow function components with default exports:

```tsx
const MyComponent = () => {
  return <div>Content</div>;
};

export default MyComponent;
```

For UI components with refs, use `React.forwardRef`:

```tsx
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return <button ref={ref} className={cn("...", className)} {...props} />;
  }
);
Button.displayName = "Button";
```

### Styling

Use Tailwind CSS classes exclusively. Combine classes with the `cn()` utility:

```tsx
import { cn } from "@/lib/utils";

<div className={cn(
  "base-classes here",
  isActive && "active-classes",
  className
)} />
```

Use CSS variables for colors (defined in `src/index.css`):
- Semantic colors: `text-foreground`, `bg-background`, `text-muted-foreground`
- Status colors: `text-status-red`, `bg-status-green/10`, etc.
- Component colors: `bg-card`, `border-input`, etc.

### TypeScript

TypeScript is configured with relaxed strictness:
- `noImplicitAny: false`
- `strictNullChecks: false`
- `noUnusedLocals: false`
- `noUnusedParameters: false`

Define types in the same file or in `src/data/` for shared types:

```tsx
export type StudentStatus = "Special Attention" | "Lagging" | "Ideal" | "Ahead";

export interface Student {
  id: number;
  name: string;
  status: StudentStatus;
}
```

### Naming Conventions

| Element       | Convention        | Example                    |
|---------------|-------------------|----------------------------|
| Components    | PascalCase        | `StudentGrid`, `KpiCards`  |
| Files (comp)  | PascalCase.tsx    | `StudentGrid.tsx`          |
| Files (util)  | camelCase.ts      | `dashboardData.ts`         |
| Variables     | camelCase         | `studentCount`             |
| Constants     | camelCase/UPPER   | `kpiConfig`, `MAX_COUNT`   |
| Types         | PascalCase        | `StudentStatus`            |
| CSS classes   | kebab-case        | `status-red`               |

### shadcn/ui Components

UI primitives live in `src/components/ui/`. These are from shadcn/ui and use:
- Radix UI primitives for accessibility
- `class-variance-authority` for variants
- Tailwind CSS for styling

To add new shadcn components: `npx shadcn@latest add [component-name]`

### React Query

Data fetching uses TanStack React Query. The `QueryClient` is set up in `App.tsx`.

### Routing

Uses React Router v6. Routes are defined in `App.tsx`:

```tsx
<Routes>
  <Route path="/" element={<Index />} />
  <Route path="*" element={<NotFound />} />
</Routes>
```

### Error Handling

- Use try/catch for async operations
- Display user-friendly errors via toast notifications (sonner or shadcn toast)
- Log errors to console in development

## Common Patterns

### Status colors mapping

```tsx
const getStatusColor = (status: StudentStatus): string => {
  switch (status) {
    case "Special Attention": return "status-red";
    case "Lagging": return "status-yellow";
    case "Ideal": return "status-green";
    case "Ahead": return "status-blue";
  }
};
```

### Card with header pattern

```tsx
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2 text-base">
      <Icon className="h-5 w-5 text-primary" />
      Title Text
    </CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

## Pre-commit Checklist

Before committing, ensure:
1. `npm run lint` passes (or has only acceptable warnings)
2. `npm run build` succeeds
3. `npm run test` passes
4. No console errors in browser dev tools
