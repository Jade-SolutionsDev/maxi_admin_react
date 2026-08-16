# MaxiHabana Backoffice — Design System

Visual and UX system of record for `maxi_admin_react`. **Scope:** how screens look
and behave. For stack, commands, architecture and domain rules see the root
`AGENTS.md`, `CLAUDE.md` and `MaxiHabana_KnowledgeBase.md`; for shadcn/registry
rules see `maxi_admin_react/AGENTS.md`.

> This document describes what is **actually in the code**. If you change a
> pattern here, update this file in the same commit.

---

## 1. Design tokens

Tokens live in `src/index.css` as raw HSL triplets on `:root` / `.dark`, exposed
to Tailwind v4 through the `@theme inline` block. **Always use the token
utilities (`bg-primary`, `text-muted-foreground`, `border-border`) — never
hardcode hex.** `bg-primary` *is* the brand emerald.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--primary` | `160 84% 39%` (emerald) | `158 64% 46%` | Brand, primary buttons, active nav, icon tiles |
| `--accent` | `174 72% 31%` (teal) | — | Secondary accent |
| `--background` | `38 60% 98%` (cream) | dark slate | App canvas |
| `--card` | `0 0% 100%` | dark slate | Cards, tables, modals |
| `--muted` / `--muted-foreground` | `210 40% 96%` / `215 16% 47%` | | Subdued surfaces, helper text |
| `--border` / `--input` | `214 32% 91%` | `220 15% 22%` | Hairlines, control borders |
| `--destructive` | `0 84% 60%` | `0 72% 51%` | Delete, errors, the required `*` |
| `--ring` | same as primary | | Focus rings |

Radius: `--radius: 0.625rem` (10px) → `rounded-md` = 8px (**controls**),
`rounded-lg` = 10px (**cards/sections**), `rounded-xl` = 14px (image cards).
Shadows: `shadow-card`, `shadow-card-hover`, `shadow-dropdown`, `shadow-sidebar`.

**Dark mode is fully supported** and class-based (`.dark` on `<html>`).
`ThemeProvider` resolves `"system"` to a concrete light/dark and exposes
`resolvedTheme` — any component that picks colors **in JS** (charts, logo swaps)
must read `resolvedTheme`, never the raw `theme` (which can be the literal
string `"system"`).

Typography: **Geist Variable** (`@fontsource-variable/geist`). Don't introduce
another family.

Decorative "blobs" are `rounded-full bg-primary opacity-10` — there is no
`blur-*` anywhere; the softness is opacity alone.

---

## 2. Layout shell

`Layout` → `SidebarProvider` + `Sidebar` + `SidebarInset` (`TopBar` + page).

- Sidebar `16rem`, collapsed `4.5rem`, mobile sheet `18rem`.
- Page padding `p-6 lg:p-8`. `SidebarInset` carries `min-w-0` so a wide table
  scrolls itself instead of pushing the whole page sideways.
- `TopBar`: page title + breadcrumb, ⌘K global search, notifications, locale,
  theme toggle, user menu.

---

## 3. Component map

| Location | What | Rule |
|---|---|---|
| `src/components/ui/*` | shadcn primitives (27 files) | **Don't overwrite** without an explicit ask — registry output |
| `src/components/admin/*` | shadcn-admin-kit components + ours | Extend here |
| `src/pages/**` | screens | PascalCase files |

Filenames: **kebab-case** under `components/`, **PascalCase** for pages.
Search the shadcn registry before hand-rolling a new primitive.

---

## 4. Forms — the authority for new forms

**A new resource form is `ResourceFormModal` + one fields component. Nothing
else.** Do not re-create a Dialog, a header, a toolbar, a Save button or a
loading skeleton — that duplication was removed on purpose (it had reached six
copies of `SaveButton`).

### 4.1 Modal anatomy

```tsx
<ResourceFormModal
  mode={mode} id={id} onClose={() => navigate("/categories")}
  icon={<Tags className="h-5 w-5" />}
  title={translate(isEdit ? "shared.actions.edit_title" : "shared.actions.create_title", { name })}
  subtitle={translate(isEdit ? "categories.form.edit_subtitle" : "categories.form.create_subtitle")}
  callout={{ title: …, description: … }}
  transform={sanitizeCategory}
>
  <CategoryFormFields mode={mode} />
</ResourceFormModal>
```

The shell owns, and deliberately does **not** expose as props:

- Width `sm:max-w-3xl`, and the `p-0 gap-0` that cancels `DialogContent`'s
  built-in padding/grid.
- The **scroll chain** — `DialogContent(flex flex-col h-[85vh] sm:h-auto
  sm:max-h-[85vh])` → `SimpleForm(flex-1 min-h-0 … max-w-none)` → body
  `flex-1 overflow-y-auto`. Every class there is load-bearing; `max-w-none`
  specifically cancels `SimpleForm`'s default `max-w-lg`.
- Header: tinted `h-11 w-11 rounded-2xl bg-primary/10 text-primary` icon tile,
  title, subtitle, two clipped decorative blobs.
- `mutationMode="pessimistic"`, the Cancel button, and the submit label
  (`shared.actions.save` on create, `shared.actions.save_changes` on edit).
- The edit-loading skeleton.

Pass-throughs to ra-core: `transform`, `redirect`, `defaultValues`,
`mutationOptions`, `resource`, plus `open` for a state-driven (non-routed) modal.

### 4.2 Field anatomy

Label (+ red `*` when required) → control with a tinted leading icon tile →
muted helper text.

```tsx
<TextInput
  source="name"
  label={translate("list.fields.name")}
  validate={required()}
  icon={<Tag />}                          // tinted tile
  placeholder={translate("categories.form.placeholders.name")}
  helperText="categories.form.hints.name" // i18n key; renders muted underneath
/>
```

- **`icon` is supported on `TextInput`, `NumberInput`, `SelectInput`,
  `AutocompleteInput`.** `BooleanInput` is a Switch + label — documented
  exception, no icon.
- The tile (`FormInputIcon`) is an **absolute overlay** inset by the control's
  1px border (`inset-y-px left-px w-9 rounded-l-md bg-primary/10`), paired with
  `pl-12` on the control. It is `pointer-events-none` so clicks reach the
  control. This preserves the control's own border, radius, focus ring and
  `aria-invalid` styling.
- ⚠️ **The `relative` wrapper must stay OUTSIDE `FormControl`.** `FormControl` is
  a Radix `Slot`: it merges `id` / `aria-describedby` / `aria-invalid` onto its
  immediate child. Wrap the input inside it and the wrapper silently steals
  them — label-click focus and invalid styling break with no error thrown.
- The required `*` is automatic: ra-core's `<FieldTitle isRequired>` emits
  `<span aria-hidden> *</span>` and `FormLabel` colors it destructive. Just keep
  passing `isRequired` from `useInput()`. **Never hand-write an asterisk in an
  admin input.**
- `helperText` takes an **i18n key** (auto-translated) and renders as
  `FormDescription`, already wired to `aria-describedby`.

### 4.3 Grids and sections

- Short fields pair up in `grid gap-4 sm:grid-cols-2`. **Opt in per fields
  component** — the shell never imposes a grid (the stock-location coverage
  selector needs full width and passes `stacked`).
- Group related fields with `FormSection` (`icon`, `title`, `subtitle`). Separate
  sections with `className="border-t pt-5"`.

### 4.4 Images

`ImageUploadInput` renders a dashed **click-or-drop** zone when empty, and a
preview + "Subir nueva imagen" + destructive "Quitar imagen" when set. Pass
`recommendedSize="1200 x 800"`; accepted formats and the size cap come from
`src/lib/uploads.ts` (`ACCEPTED_IMAGE_LABEL`, `MAX_IMAGE_SIZE_LABEL`) so the
limit is written **once**. The cap is **2 MB**, mirroring the backend — if you
need more, change the constant *and* the API, never just the copy.

Multi-image forms wrap each input in `rounded-xl border border-border p-4`
inside a `FormSection`, with a device icon in the label.

### 4.5 Create vs edit

Create shows only what the user must decide; **ordering and status
(`sortOrder`, `isActive`, `featured`) are edit-only**. Because those inputs then
don't register on create, the `sanitize*` transform must default them
(`data.sortOrder ?? 0`, `data.isActive ?? true`) rather than sending `undefined`
and trusting an unverified backend default.

---

## 5. Lists / tables

- **Rows are clickable** and open the record's detail (`rowClick` on
  `DataTable`, returning `false` for non-navigable synthetic rows). Rows are
  keyboard-operable (`role="button"`, `tabIndex`, Enter/Space).
- **No action buttons in rows.** Record actions live in the detail view. See
  `docs/ux-clickable-rows-and-row-actions.md` for the rationale, the trade-offs
  and the documented exceptions.
- First column is `#` (`RowNumberField`) — continuous across pages.
- Booleans render as read-only `BooleanField`; editing happens in the form.
- The card grows with content up to the viewport, then the **table body** scrolls
  with a sticky header while pagination stays pinned (`max-h-[calc(...)]` +
  `flex-auto` — `flex-1` would collapse a short table to nothing).
- Headers are uppercase — including sortable ones, which need `uppercase` on the
  sort `<button>` because it doesn't inherit the `<th>`'s `text-transform`.

---

## 6. Detail views

Routed at `/[resource]/:id` inside the list's `<Outlet>`, so the list stays
mounted behind. Modal for compact records (users, products, taxonomy), full page
for dense ones (orders, clients, stock-locations, inventory) — a known
inconsistency, tracked as debt.

Actions sit in a footer (`DialogFooter`) or a page action bar, using
`ConfirmActionButton` for anything destructive.

---

## 7. i18n

`es` is the **default** locale; `es.json` and `en.json` must stay in **lockstep**
(identical key sets). Verify before committing:

```bash
python3 -c "
import json
def k(d,p=''):
  for a,b in d.items():
    yield from (k(b,p+a+'.') if isinstance(b,dict) else iter([p+a]))
a,b=[set(k(json.load(open(f'src/i18n/{x}.json')))) for x in ('es','en')]
print(sorted(a^b) or 'in lockstep')"
```

Conventions:

- `resources.<r>.name` / `name_plural` — entity names only.
- `list.fields.<field>` — column and label text, shared across resources.
- `shared.*` — resource-agnostic UI (`shared.actions.*`, `shared.upload.*`,
  `shared.form.*`, `shared.status.*`).
- `<resource>.form.{create_subtitle,edit_subtitle,note,images_title,images_hint,sections.*,hints.<field>,placeholders.<field>}`
  — form copy.
- Interpolate values (`%{max}`, `%{name}`) instead of baking numbers or names
  into translations.

---

## 8. Checklist for a new screen

1. Reuse an existing `components/admin` component; search the shadcn registry
   before writing a primitive. Don't overwrite `components/ui/*`.
2. Form? → `ResourceFormModal` + a fields component, with icons, `helperText`,
   `sm:grid-cols-2` and `FormSection`. Never rebuild the shell.
3. List? → `List` + `DataTable` with `rowClick`, a `#` column, no row actions.
4. Colors from tokens; check **light and dark**.
5. Every string in `es.json` **and** `en.json`; run the lockstep check.
6. Destructive action → `ConfirmActionButton`.
7. Keyboard: labels focus their control; custom clickables are focusable and
   Enter/Space-activatable.
8. `yarn build && yarn lint` — there is **no frontend test runner**, so verify by
   driving the UI.

---

## 9. CMS resources (Contenido)

The CMS group (`cms-pages`, `cms-banners`, `cms-services`, `cms-staff`,
`cms-settings`) manages the storefront's editorial content. It follows the
standard CustomRoutes + `ResourceFormModal` + detail-modal shape (§4-§6), with
three deliberate additions:

- **Settings singleton page** (`src/pages/cms-settings/CmsSettingsPage.tsx`):
  the only one-record resource in the app. No list/create/delete — a custom
  route loads the whole document via the dataProvider custom verbs
  `getSiteSettings()` / `updateSiteSettings()` (GET/PATCH `cms/settings`) and
  PATCHes it back complete (last write wins). Built on ra-core `Form` +
  `FormSection`s and a plain submit `Button` (no SaveContext). Copy this page,
  not a resource modal, if another singleton ever appears.
- **Banner dimension capture** (`src/pages/cms-banners/CmsBannerFormModal.tsx`):
  the storefront builds `next/image` srcsets from each variant's intrinsic
  `width`/`height`, so `BannerVariantField` watches the uploaded URL and reads
  `naturalWidth`/`naturalHeight` off an `Image()` into hidden form fields.
  Editors never type dimensions; the API rejects missing/zero dims.
- **Icon allowlist sync** (`src/pages/cms-services/service-icons.ts`): service
  icons are lucide names, offered via `SelectInput`. The list MUST mirror the
  storefront's `src/feature/home/constants/service-icons.ts` map — the
  storefront falls back to a generic icon for unknown names, so a name added
  here without the storefront counterpart renders as the fallback.

CMS uploads pass `uploadPrefix="cms"` to `ImageUploadInput` so images land in
the `cms/` storage folder (backend allowlists `taxonomy` | `cms`). All five
resources are admin-only in `authProvider.canAccess` — they sit in the same
case group as `users`/`clients`, NOT in `MANAGED_MODULES`.

The CMS group renders as ONE sidebar entry with a routed tab strip
(`src/pages/cms-shared/CmsTabsNav.tsx`, sidebar `activePrefix: "/cms-"`).
Service icons use `IconPickerInput` (visual radio grid over the allowlist, not
a name dropdown). Legal links in the settings page pick their target from the
ACTIVE pages list (`SelectInput` fed by `useGetList("cms-pages")`) — slugs are
never typed by hand. `MandatoryPagesAlert` (cms-pages) warns when a
storefront-referenced slug (sobre-nosotros, terminos-y-condiciones,
politica-de-privacidad, politica-de-reembolso) has no active page and links to
the create form with title+slug prefilled; the API frees a page's slug on
soft-delete so recreation lands on the canonical slug.
