# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is "THE-BIGGEST-REACT-COURSE-ON-THE-INTERNET" - a comprehensive React learning repository containing 22+ modules covering React fundamentals through advanced patterns and professional development practices. Each module follows a progressive learning structure with exercises, live coding examples, and real-world projects.

## Common Development Commands

### Basic Development (Most Projects)
```bash
npm run dev          # Start development server with Vite
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint for code quality
```

### Testing
```bash
npm test            # Run tests with Jest/Vitest
npm run test:watch  # Run tests in watch mode
```

### Component Library Development
```bash
npm run storybook   # Start Storybook for component documentation
npm run build       # Build library for distribution
```

### Monorepo Projects
```bash
yarn install        # Install dependencies for all packages
yarn workspaces     # Manage workspace dependencies
```

## Repository Structure

### Module Organization
- **`01. Fundamentals`** - Core React concepts (Components, JSX, Props, State, Events)
- **`02. React Hooks`** - useState, useEffect, useRef, useReducer, Custom Hooks, Context API
- **`03. Beginners Projects`** - Practical applications (Todo, Meals API, Calculator, Forms)
- **`04. React w TypeScript`** - Type safety in React components and hooks
- **`05. React with TypeScript Projects`** - Real-world projects with TypeScript
- **`06. UI Libraries`** - DaisyUI, Radix, Shadcn UI integrations
- **`07. React Hook Form`** - Form handling with validation
- **`08. Advance Hooks & React 19`** - Latest React features (use, useTransition, useActionState)
- **`09. Framer Motion`** - Animation library with 10 practical projects
- **`10. Zustand`** - Lightweight state management with 10 projects
- **`11. Redux Toolkit`** - Modern Redux patterns including RTK Query and MERN apps
- **`12. React Design Patterns`** - HOC, Render Props, Compound Components, Factory Pattern
- **`13. TanStack Query`** - Server state management and data fetching
- **`14. Unit Testing`** - Jest setup, testing patterns, TDD, async testing
- **`15. React Testing`** - React Testing Library integration
- **`16. Storybook`** - Component documentation and testing
- **`17. Small Packages`** - Utility libraries (Style Dictionary, CLSX, CVA)
- **`18. Build Your Own Component Library`** - Rollup, TypeScript, Storybook, Tailwind
- **`19. Monorepos`** - Workspace management with Yarn
- **`20. React Design System`** - Complete design system with tokens and components
- **`21. React Auth`** - Full-stack authentication system
- **`22. React Native`** - Mobile development fundamentals

### Project Structure Pattern
Each module typically contains:
- **`live coding/`** - Step-by-step implementation examples
- **`exercise/`** - Practice problems with solutions in `solution/` subfolder
- **`Project/`** or **`Projects/`** - Complete applications demonstrating concepts

## Technology Stack

### Core Technologies
- **React 18-19** with modern hooks and features
- **TypeScript** for type safety (advanced modules)
- **Vite** as primary build tool
- **ESLint** for code quality
- **Tailwind CSS** for styling

### State Management Evolution
- **Local State** - useState, useRef for component state
- **Context API** - For prop drilling solutions
- **Redux Toolkit** - Complex state management with RTK Query
- **Zustand** - Lightweight state management
- **TanStack Query** - Server state management and caching

### Testing Stack
- **Jest** + **React Testing Library** for component testing
- **Vitest** for fast unit testing
- **Storybook** for component documentation and visual testing

### Build Tools
- **Vite** for development and production builds
- **Rollup** for component library bundling
- **Yarn Workspaces** for monorepo management

## Development Patterns

### Component Architecture
- **Component-based architecture** with clear separation of concerns
- **Custom hooks** for logic extraction and reusability
- **TypeScript interfaces** for prop typing and type safety
- **Compound components** for flexible component composition

### File Organization
- **Feature-based organization** in larger projects
- **Component colocation** with related styles and types
- **Hook extraction** for reusable logic
- **Type definitions** in dedicated `types/` folders

### State Management Patterns
- **Local state** for component-specific data
- **Context API** for theme, user authentication, and app-wide state
- **Redux Toolkit** for complex state with async actions
- **Zustand** for simple, lightweight state management
- **TanStack Query** for server state and caching

## Key Architectural Decisions

### Learning Progression
1. **Fundamentals first** - Build strong foundation with core concepts
2. **Progressive complexity** - Each module builds upon previous knowledge
3. **Real-world applications** - Practical projects demonstrate patterns
4. **Modern best practices** - Up-to-date with latest React features

### Code Quality Standards
- **TypeScript adoption** throughout advanced modules
- **ESLint configuration** for consistent code style
- **Component reusability** patterns
- **Performance optimization** techniques

### Testing Philosophy
- **User-centric testing** with accessibility-first approach
- **Component interaction testing** with realistic user scenarios
- **Async testing** for data fetching and API calls
- **Test-driven development** patterns in appropriate modules

## Working with This Repository

### For Learning and Reference
- Each module is self-contained with its own dependencies
- Start with fundamentals if new to React
- Follow the numbered progression for optimal learning
- Use live coding examples to understand implementation steps

### For Development Work
- Navigate to specific module/project directory
- Install dependencies with `npm install` or `yarn`
- Use `npm run dev` to start development servers
- Check individual `package.json` for module-specific scripts

### For Code Analysis
- Focus on one module at a time due to repository size
- Each module demonstrates specific concepts and patterns
- Compare different approaches across modules (e.g., state management)
- Note the evolution from basic patterns to advanced architectural solutions

## Important Notes

- This is an educational repository with progressive learning modules
- Each module may use different dependencies and tooling versions
- Projects range from simple exercises to full-stack applications
- The repository demonstrates multiple approaches to common problems
- Modern React features and patterns are emphasized throughout
- TypeScript usage increases in advanced modules
- Testing is integrated progressively through the learning path