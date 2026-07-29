import { useListContext, useRecordContext } from "ra-core";

/**
 * Absolute row number for a list row, continuous across pages:
 * `(page - 1) * perPage + positionInPage + 1`. The position is read from the
 * current list data (not a passed-in index), so it stays correct under sorting
 * and filtering. Use as the first column:
 *
 *   <DataTable.Col label="#" disableSort cellClassName="w-10 text-center">
 *     <RowNumberField />
 *   </DataTable.Col>
 */
export function RowNumberField() {
  const { data, page, perPage } = useListContext();
  const record = useRecordContext();
  if (!record || !data) return null;

  const index = data.findIndex((r) => r.id === record.id);
  if (index < 0) return null;

  return (
    <span className="tabular-nums text-muted-foreground">
      {(page - 1) * perPage + index + 1}
    </span>
  );
}
