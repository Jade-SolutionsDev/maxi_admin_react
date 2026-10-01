import assert from "node:assert/strict";
import test from "node:test";

import {
  fromDateTimeLocal,
  noticeScheduleState,
  toDateTimeLocal,
  versionInForceAt,
  type CmsTextVersion,
} from "../src/pages/cms-pages/cms-text.ts";

const version = (n: number, publishedAt: string): CmsTextVersion => ({
  id: `v${n}`,
  version: n,
  title: "Términos y condiciones",
  content: `Versión ${n}`,
  publishedAt,
  publishedBy: "Ana Pérez",
});

// Como las devuelve la API: la más reciente primero.
const versions = [
  version(3, "2026-09-20T10:00:00.000Z"),
  version(2, "2026-06-01T10:00:00.000Z"),
  version(1, "2026-01-15T10:00:00.000Z"),
];

test("encuentra lo que decía el texto cuando alguien compró", () => {
  const atPurchase = versionInForceAt(
    versions,
    new Date("2026-07-04T18:30:00.000Z"),
  );

  assert.equal(atPurchase?.version, 2);
});

test("una compra justo al publicar ya ve la versión nueva", () => {
  assert.equal(
    versionInForceAt(versions, new Date("2026-06-01T10:00:00.000Z"))?.version,
    2,
  );
});

test("antes de la primera publicación no había texto", () => {
  assert.equal(
    versionInForceAt(versions, new Date("2025-12-31T00:00:00.000Z")),
    null,
  );
});

test("no depende del orden en que lleguen las versiones", () => {
  assert.equal(
    versionInForceAt(
      [...versions].reverse(),
      new Date("2026-09-30T00:00:00.000Z"),
    )?.version,
    3,
  );
});

test("convierte fechas entre la API y el selector de fecha y hora", () => {
  const local = toDateTimeLocal("2026-10-07T13:45:00.000Z");

  assert.match(local, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  assert.equal(fromDateTimeLocal(local), "2026-10-07T13:45:00.000Z");
  assert.equal(toDateTimeLocal(null), "");
  assert.equal(fromDateTimeLocal(""), null);
});

test("dice si un aviso está programado, visible o terminado", () => {
  const now = new Date("2026-10-08T12:00:00.000Z");

  assert.equal(
    noticeScheduleState({ startsAt: null, endsAt: null }, now),
    "live",
  );
  assert.equal(
    noticeScheduleState(
      { startsAt: "2026-10-09T00:00:00.000Z", endsAt: null },
      now,
    ),
    "scheduled",
  );
  assert.equal(
    noticeScheduleState(
      { startsAt: null, endsAt: "2026-10-08T12:00:00.000Z" },
      now,
    ),
    "ended",
  );
});
