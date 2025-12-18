# Irish Limited Company Bookkeeping Prototype

This is a React-based prototype for an Irish Limited Company bookkeeping application.

## Tech Stack

- **Framework**: React + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **Testing**: Vitest + React Testing Library

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## Testing

This project uses **Vitest** for unit and integration testing.

### Running Tests

-   **Run all tests**:
    ```bash
    npm test
    ```

-   **Run tests in watch mode**:
    ```bash
    npm run test:watch
    ```

-   **Run E2E tests (Playwright)**:
    ```bash
    npm run test:e2e
    ```

### Writing Tests

-   Tests are located in the `tests/` directory.
-   Unit tests should be placed in `tests/unit/`.
-   Naming convention: `*.test.ts` or `*.test.tsx`.

### CI/CD Integration

Tests are automatically run during the build process:
```bash
npm run build
```
This command runs `npm run test` before building the application. If any test fails, the build will fail.

## Folder Structure

-   `client/src`: Frontend source code
-   `tests`: Unit and E2E tests
-   `server`: Backend (Mockup mode - do not modify)
