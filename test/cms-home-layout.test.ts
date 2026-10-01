import assert from "node:assert/strict";
import test from "node:test";

import {
  moveItem,
  toggleSectionVisibility,
  type HomeSection,
} from "../src/pages/cms-home/home-layout.ts";

const sections: HomeSection[] = [
  { key: "hero", isVisible: true },
  { key: "departments", isVisible: true },
  { key: "services", isVisible: false },
];

test("sube una sección un puesto sin tocar las demás", () => {
  const moved = moveItem(sections, 1, -1);

  assert.deepEqual(
    moved.map((section) => section.key),
    ["departments", "hero", "services"],
  );
  assert.deepEqual(
    sections.map((section) => section.key),
    ["hero", "departments", "services"],
  );
});

test("no mueve la primera hacia arriba ni la última hacia abajo", () => {
  assert.equal(moveItem(sections, 0, -1), sections);
  assert.equal(moveItem(sections, 2, 1), sections);
});

test("ordena los destacados igual que las secciones", () => {
  assert.deepEqual(moveItem(["p1", "p2", "p3"], 2, -1), ["p1", "p3", "p2"]);
});

test("oculta y vuelve a mostrar una sección sin cambiar su puesto", () => {
  const hidden = toggleSectionVisibility(sections, "hero");
  const shown = toggleSectionVisibility(hidden, "hero");

  assert.deepEqual(hidden[0], { key: "hero", isVisible: false });
  assert.deepEqual(shown[0], { key: "hero", isVisible: true });
  assert.deepEqual(
    hidden.map((section) => section.key),
    ["hero", "departments", "services"],
  );
});
