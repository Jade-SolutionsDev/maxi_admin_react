# MaxiHabana Backoffice — Design System & Build Plan

This document is the reference for the MaxiHabana admin backoffice. It covers the visual system, component patterns, auth model, and the implementation plan for the first slice: **authentication + user management**.

## Brand Foundation

The brand mark (`public/maxi-habana-logo.png`) is a dark wordmark with a single teal accent on the `i` dot and underline curve. The UI uses that dark/ink base with teal as the primary action color.

### Color Tokens

| Token | Hex | Usage |
|-------|-----|-------|
| `--ink` | `#101012` | Logo ink, sidebar background, primary text |
| `--charcoal` | `#1E1E24` | Elevated surfaces (cards, sidebar hover) |
| `--teal` | `#2DD4BF` | Primary accent, buttons, active nav, focus rings |
| `--teal-dark` | `#14B8A6` | Button hover, emphasis |
| `--teal-light` | `#5EEAD4` | Highlights, glows, badges |
| `--surface` | `#F8FAFC` | Main content background |
| `--panel` | `#FFFFFF` | Cards, dialogs, form panels |
| `--border` | `#E2E8F0` | Dividers, input borders |
| `--muted` | `#64748B` | Secondary text, placeholders |
| `--danger` | `#EF4444` | Delete, errors |
| `--success` | `#22C55E` | Save confirmations |

Dark mode is out of scope for the first slice; the default is a **light content area + dark sidebar** layout.

### Typography

Loaded from Google Fonts in `index.html`:

- **Display / Headings:** `Bricolage Grotesque` — distinctive, slightly quirky grotesque for page titles.
- **Body / UI:** `Plus Jakarta Sans` — clean, readable for tables and forms.
- **Mono:** `JetBrains Mono` — for IDs, emails, code snippets.

```css
:root {
  --font-display: 'Bricolage Grotesque', sans-serif;
  --font-body: 'Plus Jakarta Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

### Spacing & Radius

- Base unit: `4px`
- Card radius: `12px`
- Button radius: `8px`
- Input radius: `8px`
- Max content width: `1280px`
- Sidebar width: `260px`

## Layout

### Shell

```
┌─────────────────────────────────────────────┐
│  Sidebar  │  Top Bar                        │
│  (fixed)  │  (sticky)                       │
│           ├─────────────────────────────────┤
│           │                                 │
│  Logo     │  Content                        │
│           │                                 │
│  Nav      │  Page Title + Actions           │
│           │                                 │
│  User     │  Cards / Tables / Forms         │
│  Profile  │                                 │
└─────────────────────────────────────────────┘
```

- **Sidebar:** dark (`--ink`), shows logo at top, vertical nav links, user card at bottom with Clerk `<UserButton />`.
- **Top Bar:** breadcrumb / page title on the left; global actions (e.g. “New User”) on the right.
- **Content:** `padding: 32px`, max-width container, white cards on `--surface` background.

### Navigation

| Route | Label | Icon |
|-------|-------|------|
| `/` | Dashboard | `LayoutDashboard` |
| `/users` | Users | `Users` |

## Auth Model

The app uses **Clerk** for authentication and authorization.

### Roles

Only **admin** users can access the backoffice. Clerk’s `publicMetadata` stores the role:

```ts
user.publicMetadata = { role: 'admin' };
```

The `AuthProvider` checks the signed-in user’s role. If the role is not `admin`, show an unauthorized screen with a sign-out button.

### Flow

1. Wrap the router with `<ClerkProvider>`.
2. Use `<SignedIn>` / `<SignedOut>` to gate access.
3. Inside `<SignedIn>`, `AuthProvider` validates the admin role and exposes `isAdmin`, `isLoading`, `token`.
4. Protected routes redirect to `/login` when signed out.
5. The login page shows the Clerk `<SignIn />` component with email/password and a redirect to `/users` after sign-in.
6. API calls attach the Clerk JWT via `Authorization: Bearer <token>`.

### API Integration

- Backend expects `Authorization: Bearer <clerk-jwt>` on protected routes.
- Use `useAuth().getToken()` to retrieve the JWT.
- API base URL from `VITE_API_URL`.

## Components

### Shared Primitives

| Component | Location | Notes |
|-----------|----------|-------|
| `Button` | `src/components/ui/Button.tsx` | Variants: `primary`, `secondary`, `danger`, `ghost`. Sizes: `sm`, `md`, `lg`. |
| `Input` | `src/components/ui/Input.tsx` | Label + error message support. |
| `Select` | `src/components/ui/Select.tsx` | Native select styled to match inputs. |
| `Card` | `src/components/ui/Card.tsx` | White panel with shadow and padding slots. |
| `Modal` | `src/components/ui/Modal.tsx` | Headless-style overlay with confirm/cancel actions. |
| `Table` | `src/components/ui/Table.tsx` | `<table>` wrapper with hover rows and sticky header. |
| `Badge` | `src/components/ui/Badge.tsx` | For status: `active`, `inactive`, `admin`, etc. |
| `EmptyState` | `src/components/ui/EmptyState.tsx` | Illustration + message for empty lists. |
| `Spinner` | `src/components/ui/Spinner.tsx` | Teal spinner for loading states. |

### Layout Components

| Component | Location | Notes |
|-----------|----------|-------|
| `Sidebar` | `src/components/layout/Sidebar.tsx` | Fixed dark sidebar with nav and user button. |
| `TopBar` | `src/components/layout/TopBar.tsx` | Sticky bar with page title and primary action. |
| `AppShell` | `src/components/layout/AppShell.tsx` | Sidebar + main area wrapper. |

### Auth Components

| Component | Location | Notes |
|-----------|----------|-------|
| `AuthProvider` | `src/auth/AuthProvider.tsx` | Validates admin role, exposes auth context. |
| `ProtectedRoute` | `src/auth/ProtectedRoute.tsx` | Redirects signed-out users to `/login`. |
| `Unauthorized` | `src/auth/Unauthorized.tsx` | Shown when a user is signed in but not an admin. |

## Pages

| Page | Route | Purpose |
|------|-------|---------|
| `LoginPage` | `/login` | Clerk `<SignIn />` for admins. |
| `DashboardPage` | `/` | Placeholder with stats cards. |
| `UsersListPage` | `/users` | Searchable, paginated user table. |
| `UserCreatePage` | `/users/new` | Form to create a user. |
| `UserEditPage` | `/users/:id/edit` | Form to update a user. |

### Users Table Columns

- Name (first + last)
- Email
- Type (admin / provider / customer)
- Status (active / inactive)
- Created
- Actions (edit / delete)

### User Form Fields

- First name
- Last name
- Email
- Phone (optional)
- User type (select)
- Status (select)
- Password (only on create; optional on edit)

## State & Data

- Use **React Router** for routing.
- Use **Clerk React** for auth state.
- Use **TanStack Query** for server state (users list, mutations).
- Keep form state local with `useState`.

## Dependencies

Add the following (no new ones needed beyond these for the first slice):

```bash
pnpm add @clerk/clerk-react react-router-dom @tanstack/react-query lucide-react
```

Google Fonts link to add to `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

## Environment Variables

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:3000
```

## Build Order (First Slice)

1. Install dependencies and add fonts.
2. Replace Vite starter code with `index.css` tokens and a clean `main.tsx`.
3. Set up Clerk provider and router.
4. Build `AuthProvider`, `ProtectedRoute`, and `Unauthorized`.
5. Build layout primitives (`Sidebar`, `TopBar`, `AppShell`).
6. Build UI primitives (`Button`, `Input`, `Select`, `Card`, `Table`, `Badge`, `Modal`, `Spinner`).
7. Implement `LoginPage`.
8. Implement `UsersListPage` with delete confirmation.
9. Implement `UserCreatePage` and `UserEditPage`.
10. Wire API client with Clerk token.
11. Add `.env.example` and update `README.md`.

## Notes for Future Sessions

- Keep components in `src/components/ui/` and `src/components/layout/`.
- Keep pages in `src/pages/`.
- Keep API calls in `src/api/`.
- Keep auth logic in `src/auth/`.
- Do not add dark mode until the first slice is complete and stable.
- Avoid adding a UI component library; build the small set above from scratch using the tokens in this file.
