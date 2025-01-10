# 🚀 Next.js TypeScript Full Stack Template with Turborepo, Cloudflare, and More

Hey! 👋 If you're looking to get started with a Next.js project using TypeScript and a bunch of cool modern tools, this template might be just what you need. It's all about getting your project up and running with a setup that's scalable and built for the long haul.

The whole idea here is to use a modular, plugin-like architecture which makes everything more manageable and flexible, especially as your project grows. ✨

---

Before you dive into this template, I just want to say that the tech stack is pretty modern, so it could help you make the development process smoother and adopt some best practices along the way. If you're into creating projects that are easy to maintain and scale, this setup should really resonate with you.

> Built upon the foundation laid by [Create T3 Turbo](https://github.com/t3-oss/create-t3-turbo) and [Cloudflare SaaS Stack](https://github.com/Dhravya/cloudflare-saas-stack).

## Features 💡

- **Monorepo Setup with [Turborepo](https://turbo.build/)**: Keep apps and packages organized.
- **Modular Architecture**: Build features as plugins/modules for easy management.
- **[Next.js 14](https://nextjs.org/)**: Leverage the latest features including [server actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations) for dynamic apps.
- **[Tailwind CSS](https://tailwindcss.com/)**: Rapidly style components with utility-first CSS.
- **Cloudflare Integration**:
  - **[Pages](https://developers.cloudflare.com/pages/)**: Effortless hosting for your app.
  - **[Queues](https://developers.cloudflare.com/queues/)**: (Optional) background task processing.
  - **[KV](https://developers.cloudflare.com/workers/runtime-apis/kv/)**: (Optional) key-value storage.
  - **[D1 Database](https://developers.cloudflare.com/d1/)**: Scalable SQLite-based database.
- **[NextAuth.js](https://next-auth.js.org/)**: Secure and fast authentication setup.
- **[Drizzle ORM](https://orm.drizzle.team/)**: Type-safe and simple ORM for database access.
- **[Hono 🔥](https://hono.dev/)**: For the worker app.
- **[Shadcn UI](https://ui.shadcn.com/)**: UI components.
- **[Zod](https://zod.dev/)**: Schema validation made easy.
- **[Hono RPC](https://hono.dev/docs/guides/rpc)**: Enable communication between apps.
- **[Esbuild](https://esbuild.github.io/)**: Fast bundling; used for glob imports.
- **[Bun](https://bun.sh/)**: Speedy package management.
- **[React Hook Form](https://react-hook-form.com/)**: Simplify form handling.
- **[React Query](https://tanstack.com/query/)**: Efficient server state management.
- **[Next Themes](https://github.com/pacocoursey/next-themes)**: Easy theme switching and dark mode.
- **[ESLint](https://eslint.org/) & [Prettier](https://prettier.io/)**: Keep the code clean and consistent.

## Project Structure 📂

### Apps 🤖

- **Admin**: A Next.js app with modules like auth, CRM, projects (a basic demo), and queue management. It uses NextAuth.js for authentication, React Query for data fetching, React Hook Form for form management, Next Themes for theme switching, and Hono RPC for inter-app communication.
- **Queue Worker**: A job/task orchestration app built with Hono. It leverages Cloudflare Queues, KV, and D1 Database to process background tasks.

### Packages 📦

- **db**: Contains database schemas and configurations using Drizzle ORM.
- **ui**: Houses shared UI components utilizing Shadcn.
- **validators**: Includes Zod schemas for data validation across apps.

### Tooling 🛠️

- **Esbuild**: For fast building and bundling.
- **ESLint & Prettier**: For code linting and formatting.
- **Tailwind CSS**: For styling components.
- **TSConfig**: Shared TypeScript configurations.

## Getting Started ✅

### Prerequisites

- **Bun**: Ensure Bun is installed as the package manager.
- **Turborepo**: Install Turborepo globally:

  ```bash
  npm install -g turbo
  ```

- **Wrangler CLI**: Install Wrangler globally for managing Cloudflare Workers and services:

  ```bash
  npm install -g wrangler
  ```

- **Cloudflare Account**: Required for deploying apps and using Cloudflare services.

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/SergioDep/cloudflare-turborepo-saas.git
   ```

2. **Install Dependencies**

   Navigate to the root of the project and run:

   ```bash
   bun install
   ```

3. **Environment Variables**

   - Copy the `.env.example` file to a new `.env` file:

     ```bash
     cp .env.example .env
     ```

   - Update the `.env` file with your own environment variables.

     - **NextAuth.js Configuration**: Set your Google Auth Client ID and Secret for authentication.

       ```env
       AUTH_SECRET=your_generated_auth_secret
       AUTH_GOOGLE_ID=your-google-client-id
       AUTH_GOOGLE_SECRET=your-google-client-secret
       ```

       - Generate `AUTH_SECRET` with:

         ```bash
         openssl rand -base64 32
         ```

         or

         ```bash
         bunx auth secret
         ```

       - For Google OAuth:
         - Create an OAuth app in the [Google API Console](https://console.developers.google.com/).
         - Set authorized origins and redirect URIs (e.g., `http://localhost:3000` and `http://localhost:3000/api/auth/callback/google`).

     - **Cloudflare Environment Variables**: Set your Cloudflare account details, this is required when using "db:migrate:prod" command so you can update your Cloudflare D1 database.

       ```env
       CLOUDFLARE_D1_ACCOUNT_ID=your-cloudflare-account-id
       CLOUDFLARE_D1_API_TOKEN=your-cloudflare-auth-token
       ```

### Configuration ⚙️

1. **Set Cloudflare Environment Variables**

   - Update the `wrangler.toml` files in each app (`admin`, `queue-worker`) with your Cloudflare account details.
   - Set your Database IDs, KV IDs, and any other bindings.
   - Use the command `bun run cf-typegen` (inside each package) to generate TypeScript types for Cloudflare environment variables.

2. **Database Setup**

   - Generate database types:

     ```bash
     bun run db:generate
     ```

   - Run migrations for development (after running the app for the first time to ensure the D1 database is created):

     ```bash
     bun run db:migrate:dev
     ```

   - For subsequent migrations in development:

     ```bash
     bun run db:migrate
     ```

   - For production migrations:

     ```bash
     bun run db:migrate:prod
     ```

### Running the Apps 🏃💨

- **Admin App**

  Start the admin app:

  ```bash
  bun run dev:admin
  ```

- **Queue Worker App**

  Start the queue worker app:

  ```bash
  bun run dev:queue-worker
  ```

### Automatic Deployement on Cloudflare ⚡

These screenshots can guide you through setting up and deploying the apps using Cloudflare services.

- **Creating Apps in Cloudflare Dashboard (Link both workers and pages with your github repo)** ![Cloudflare Dashboard](https://github.com/user-attachments/assets/325c39b1-529d-4edd-9d84-652ca2ed09ca)
- **Cloudflare Pages Build Setup** ![Build Setup](https://github.com/user-attachments/assets/3d58af28-ff59-4007-be16-024bc9410253)
- **Cloudflare Pages Environment Variables Configuration** ![Environment Variables](https://github.com/user-attachments/assets/31e83a55-fab4-47df-bbeb-b889c57747c4)
- **Cloudflare Queue Worker Build Configuration** ![Worker Build Config](https://github.com/user-attachments/assets/601a8ab4-cf89-43f0-8538-98fe2fab2a28)
- **Admin Dashboard View** ![!Admin View](https://github.com/user-attachments/assets/efea9fa5-ff8d-4476-95e0-977f4602b11e)

### Manual Deployment

You can deploy each app individually to Cloudflare:

1. **Navigate to the App Directory**

   ```bash
   cd apps/admin
   # or
   cd apps/queue-worker
   ```

2. **Deploy to Cloudflare**

   ```bash
   bun run deploy
   ```

   This command builds and deploys the app, linking databases and KV stores automatically.

## Known Issues ❗

- **Datepicker Component**: Its really buggy. I recommend to make a datepicker component.

## Modular Architecture 👀

The template promotes a plugin or modular architecture. This approach allows you to:

- **Extend Functionality Easily**: Add new features as separate modules without impacting existing code.
- **Maintain Codebase Efficiently**: Isolate and manage different parts of the application independently.
- **Promote Reusability**: Share modules across different apps within the monorepo.

But, you could not use it if you don't want to, just remove the "glob:"-like imports, and import your stuff manually. You can then erase the esbuild package.

## TODO 🔜:

- Wrap up server actions for cleaner handling.
- Build a basic landing page app.
- Set up access control / gateway logic for (queue) workers.
- Fix all the `tsconfig` mess ☠️, (maybe try `pnpm` or `nx`?).
- Add a React Native project example.
- Move auth to its own service app, (check out other libraries like `lucia`).

## Additional Notes 📝

- **Work in Progress**: This template is still under active development. While it's functional and I've used it in multiple projects, there may be bugs or missing documentation.
- **Configuration**: Ensure all IDs and environment variables are correctly set in the `wrangler.toml` files for each app.
- **Feedback Welcome**: If you encounter issues or have suggestions, feel free to open an issue or contribute ⭐ to the project.

Thats it. Hope it helps, and feel free to reach out if you’ve got any questions while you're using it! ✌️
