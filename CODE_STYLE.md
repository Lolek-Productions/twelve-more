# Code Style Guide for 12More

This document describes the code style conventions used in this project. It should be followed for all new code and when refactoring existing code.

## General Formatting
- **Indentation:** 2 spaces per indentation level.
- **Semicolons:** Omit semicolons at the end of statements (unless required for clarity).
- **Quotes:** Use double quotes (`"`) for JSX and JavaScript strings.
- **Trailing Commas:** Use trailing commas in multi-line objects, arrays, and function parameters where possible.
- **Line Length:** Limit lines to 100 characters where possible for readability.
- **Whitespace:** Use blank lines to separate logical sections of code.

## Naming Conventions
- **Files & Folders:**
  - Use `camelCase` for files containing React components (e.g., `MainContextProvider.jsx`).
  - Use `kebab-case` or `camelCase` for utility files and folders.
  - Use `index.js` or `page.jsx` for entry points in directories.
- **Variables & Functions:**
  - Use `camelCase` for variables and functions.
  - Use `PascalCase` for React components and classes.
  - Use `UPPER_CASE` for constants.
- **React Hooks:** Prefix custom hooks with `use` (e.g., `useMainContext`).

## Server Actions & Async Functions
- **Async Functions:**
  - Always use `async` functions for server actions that perform I/O, API calls, or database operations.
  - Use `await` for all asynchronous operations (e.g., API calls, DB queries, file I/O).
  - Handle errors with try/catch blocks and return clear error messages or throw as appropriate.
  - Prefer named exports for server actions (e.g., `export async function myAction(...) { ... }`).
  - Place `"use server";` at the top of server action files to indicate their context.
- **Return Statements:**
  - Always return plain serializable data: objects, strings, numbers, arrays, or base64-encoded buffers.
  - Never return class instances, functions, or non-serializable values.
  - For errors, either throw or return an object with an `error` property.
  - Example:
    ```js
    return { success: true, data };
    // or
    return { success: false, message: "..." };
    ```
- **Pages:**
  - Use Next.js App Router conventions (e.g., `page.jsx`, `layout.jsx`).
  - Organize routes in the `/app` directory using folder-based routing.
- **Context:**
  - Use React Context for shared state (e.g., `MainContextProvider`).
- **Server Actions:**
  - Use `"use server";` at the top of server action files.

## API & Service Patterns
- Place API/service logic in `/lib/services`.
- Use async/await for asynchronous code.
- Separate API routes and server actions for clarity.
- Use environment variables for API keys and secrets.

## Comments & Documentation
- Use JSDoc-style comments for functions and classes.
- Comment complex logic, but avoid obvious comments.
- Document assumptions and edge cases.

## Linting & Formatting
- Use ESLint for code linting (see `eslint` and related packages in `package.json`).
- Use Prettier for code formatting if configured (no config file found, but recommended for consistency).
- Fix lint errors before committing.

## Other Conventions
- Use environment variables via `.env.local` for secrets and configuration.
- Keep sensitive information out of source control.
- Use clear, descriptive commit messages.

---
Feel free to update this guide as your team or codebase evolves.
