# Clickable rows + actions-in-detail + row numbers — decision & research

_Status: implemented on `develop`. Requested by the analyst team; applied as a
mandate. This document records the UX rationale and the trade-offs vs. the
previous inline-action-button design in case the change needs to be revisited._

## What changed

- **Rows are clickable** and open the record's detail view (`/[resource]/:id`).
  Rows are also keyboard-operable (`role="button"`, `tabIndex`, Enter/Space).
- **Per-row action buttons and inline toggles were removed** and relocated into
  the detail view (delete, change-password, approve/reject, `isActive` /
  `isFeatured` toggles). Edit was already there.
- **Every list shows a row-number column** (`#`), continuous across pages.

Applies to: users, clients, departments, categories, products, stock-locations,
inventory, orders.

## Previous design

Each row exposed inline icon-buttons (edit / delete / view / change-password /
approve / reject / restore) and inline toggle switches; most rows were not
clickable; there were no row numbers.

## UX research (summary + sources)

- NN/g frames table use as three tasks — **find, compare, act**. Making the
  whole row clickable to a detail view directly supports "act/inspect", and a
  hover affordance signals that a secondary detail view exists (improves
  discoverability). ([NN/g](https://www.nngroup.com/articles/data-tables/),
  [Pencil & Paper](https://www.pencilandpaper.io/articles/ux-pattern-analysis-enterprise-data-tables))
- Table-action guidance: show ≤3 primary actions inline, push the rest to an
  overflow/detail (progressive disclosure); reveal actions on hover where
  possible. ([UX Design World](https://uxdworld.com/best-practices-for-providing-actions-in-data-tables/),
  [Eleken](https://www.eleken.co/blog-posts/table-design-ux))
- Trade-off — **"disclosure debt"**: burying frequently-used actions adds clicks
  and support load for power users even as it lowers per-row choice count
  (Hick's law). ([UX Tigers – progressive disclosure](https://www.uxtigers.com/post/progressive-disclosure),
  [Hick's law](https://www.parallelhq.com/blog/what-hick-s-law))
- Row numbers denote **position, not identity**; they only stay meaningful with
  deterministic ordering and continuous numbering across pages.
  ([pagination/ordering best practice](https://www.leadwithskills.com/blogs/pagination-filtering-sorting-large-datasets))

## Comparison

| Dimension | Before (inline action buttons) | Now (clickable row + actions in detail) |
|---|---|---|
| Discoverability of "open details" | Low (eye button only) | High (whole row, hover cursor) |
| Clicks to run a frequent action (delete/toggle) | 1–2 in place | 2–3 (open detail → act → confirm) |
| Power-user efficiency | High | Lower (disclosure debt) |
| At-a-glance status toggling | Yes (inline switch) | No (moved into detail) |
| Accidental / mis-clicks | Low | Higher (row is a big target; mitigated: opens a non-destructive detail) |
| Row visual density | Busy | Clean |
| Touch / mobile | Small tap targets | Better (large row target) |
| Consistency of detail view | Mixed | Still mixed (modal vs page — known debt) |
| Dev cost | — | Moderate, app-wide |

## Risks & mitigations (backfire analysis)

1. **Slower frequent actions / lost inline toggle** — deleting or flipping
   active/featured now takes an extra step. _Mitigation:_ keep/introduce bulk
   actions for status; make primary actions prominent in the detail; revisit a
   hover quick-action row if complaints arise.
2. **Keyboard / accessibility regression** — a bare `<tr onClick>` is not
   focusable, and the focusable action buttons were removed. _Mitigated in this
   change:_ rows get `role="button"`, `tabIndex`, and Enter/Space activation.
3. **Accidental navigation while selecting text** — _Mitigation:_ the detail
   view is non-destructive; destructive actions remain behind confirm dialogs.
4. **Discoverability of moved actions** — _Mitigation:_ detail views surface
   actions in a consistent footer / action bar.
5. **Inconsistent detail (modal vs page)** — clients/orders/stock-locations/
   inventory open a full page; users/products/departments/categories open a
   modal. Accepted for now; tracked as debt.

## Documented exceptions

- **Roles** — unchanged: it has no detail view yet, so its list keeps inline
  row actions. Revisit when a roles detail view exists.
- **Users, synthetic/deleted rows** — a pending **invitation** row is not a
  user, and a **soft-deleted** user is not returned by `GET /users/:id`, so
  neither is navigable. They keep their minimal inline actions
  (resend / revoke, restore). Normal and awaiting-approval users open the modal,
  which hosts edit / change-password / delete / approve / reject.

## Implementation notes (for maintainers)

- `RowNumberField` (`src/components/admin/row-number-field.tsx`) — reads
  `useListContext()` and computes `(page-1)*perPage + indexInData + 1`.
- `ConfirmActionButton` (`src/components/admin/confirm-action-button.tsx`) —
  shared confirm-then-run footer button used by the detail views.
- `rowClick` is a **DataTable** prop (not List): `rowClick={(id) => '/x/'+id}`,
  or the function form returning `false` for non-navigable rows (users).
- Row keyboard activation lives in `DataTableRow` (`data-table.tsx`).

**Recommendation:** proceed (per mandate) with the mitigations above — keep the
keyboard activation, and retain/expand bulk & status affordances so power users
don't accumulate disclosure debt.
