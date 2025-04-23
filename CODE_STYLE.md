# Code Style Guide for 12More

This document describes the code style conventions used in this project. It should be followed for all new code and when refactoring existing code.

## UI Components
- Use [shadcn/ui](https://ui.shadcn.com/) components for all modal, dialog, and similar UI elements.
- Prefer the shadcn `Dialog` component (see `/components/ui/dialog.jsx`) for modals and popups.
- Maintain consistency by using shadcn components for new UI features where available.

## Form Validation & Usage Patterns

### Zod for Schema Validation
- Use [Zod](https://zod.dev/) to define validation schemas for forms, ensuring strong runtime validation and clear error messages.
- Place Zod schemas near the top of the file for visibility, e.g.:
  ```js
  const profileFormSchema = z.object({
    phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Please enter a valid mobile phone number (e.g., +12345678901)." })
      .min(10, { message: "Mobile Phone Number must be 10 digits." })
      .max(15, { message: "Mobile Phone Number must not exceed 10 digits." }),
  });
  ```
- Use descriptive custom error messages in Zod schemas for better user feedback.

### React Hook Form Integration
- Use [react-hook-form](https://react-hook-form.com/) for form state management.
- Integrate Zod schemas with React Hook Form using `zodResolver` from `@hookform/resolvers/zod`:
  ```js
  const form = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });
  ```
- Use the `Form` and related shadcn/ui components (`FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`, `FormDescription`) for structure and accessibility.
- Use `mode: "onChange"` for instant validation feedback as the user types.

### shadcn/ui Components for Forms
- Use shadcn/ui form primitives for all form elements:
  - `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`, `FormDescription`
  - Input components like `Input`, `Button` from shadcn/ui
- Compose forms as:
  ```jsx
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormField ... />
      <Button type="submit">Submit</Button>
    </form>
  </Form>
  ```
- Use `FormMessage` to show validation errors and `FormDescription` for helpful hints.
- Use shadcn/ui `Dialog` for modals, with `DialogHeader`, `DialogTitle`, and `DialogDescription` for structure.

### Additional Best Practices
- Debounce user search inputs in forms to avoid excessive API calls.
- Use `defaultValues` for form initialization and controlled input handling.
- Use React state and hooks to manage loading, searching, and submission states for responsive UI.
- Place form and modal logic within the same component for clarity unless shared across multiple pages.

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

## Database: MongoDB

- **Database:** This project uses MongoDB as its primary database, accessed via Mongoose ODM.
- **Connect Strategy:**
  - All database operations use a shared async connect utility located at `/src/lib/mongodb/mongoose.js`.
  - The `connect` function ensures a single connection per process using `mongoose.connection.readyState` to prevent duplicate connections.
  - Usage: `await connect();` before any DB operation in server actions or services.
  - The MongoDB URI is provided via the `MONGODB_URI` environment variable, and the database name is set as `twelve-more-app`.
- **Model Locations:**
  - All Mongoose models are defined in `/src/lib/models/`.
  - Example model files include:
    - `user.model.js`
    - `post.model.js`
    - `community.model.js`
    - `organization.model.js`
    - `parish.model.js`
    - `contact.model.js`
    - `zipcode.model.js`
  - Each model file exports a default Mongoose model instance (e.g., `export default User;`).
- **Best Practices:**
  - Always ensure `await connect();` is called before any Mongoose model operation in server actions.
  - Use lean queries (`.lean()`) when returning plain JS objects for serialization.
  - Keep all schema definitions and model logic in the `/src/lib/models/` directory for maintainability.

---
Feel free to update this guide as your team or codebase evolves.

---

# Project Code Notes

## Main Navigation Location
- The main navigation for the app is implemented in the `LeftSidebar` component (`/src/components/LeftSidebar.jsx`).
- If you need to add global navigation links (such as a link to a user settings page), update the `LeftSidebar` component.

## Settings Page Location
- The recommended location for a global user settings page is `/src/app/(main)/settings/page.jsx`.
- Add a link to this settings page in the `LeftSidebar` for easy access by all users.
