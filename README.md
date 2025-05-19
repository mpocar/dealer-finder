# Dealer Finder

A monorepo containing both the frontend and backend applications for the Dealer Finder project.

## Project Structure

This monorepo is built with Turborepo and includes:

- **Frontend**: Next.js application in `apps/frontend`
- **Backend**: Encore TypeScript API in `apps/backend`
- **Shared packages**:
  - `packages/db`: Database models and utilities
  - `packages/ui`: Shared UI components
  - `packages/typescript-config`: Shared TypeScript configurations
  - `packages/eslint-config`: Shared ESLint configurations

## Prerequisites

- Node.js >= 18
- npm >= 10.2.3
- [Encore CLI](https://encore.dev/docs/install) (for backend development)

## Getting Started

1. Clone the repository:

   ```sh
   git clone <repository-url>
   cd dealer-finder
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Install the Encore CLI (if not already installed):
   ```sh
   curl -L https://encore.dev/install.sh | bash
   ```

## Development

Run the entire application (both frontend and backend) with a single command:

```sh
npm run dev
```

This will start:

- The frontend application (typically on http://localhost:3000)
- The backend Encore API service

### Running Individual Apps

If needed, you can run individual applications:

```sh
# Run only the frontend
cd apps/frontend
npm run dev

# Run only the backend
cd apps/backend
npm run dev  # or 'encore run'
```

## Building for Production

```sh
npm run build
```

## Other Commands

```sh
# Lint all applications and packages
npm run lint

# Type checking
npm run check-types

# Run tests
npm run test
```

## Using Vercel Remote Caching (Optional)

To enable Remote Caching:

```sh
npx turbo login
npx turbo link
```
