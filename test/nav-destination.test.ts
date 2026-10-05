import assert from "node:assert/strict";
import test from "node:test";

import { firstAccessibleDestination } from "../src/components/layout/nav-destination.ts";

const destinations = [
  { resource: "cms-home", path: "/cms-home" },
  { resource: "cms-pages", path: "/cms-pages" },
  { resource: "cms-banners", path: "/cms-banners" },
];

test("lleva a la primera pestaña que el rol puede ver", () => {
  assert.equal(
    firstAccessibleDestination(destinations, {
      "cms-home": false,
      "cms-pages": false,
      "cms-banners": true,
    })?.path,
    "/cms-banners",
  );
});

test("respeta el orden de las pestañas cuando puede ver varias", () => {
  assert.equal(
    firstAccessibleDestination(destinations, {
      "cms-home": true,
      "cms-banners": true,
    })?.path,
    "/cms-home",
  );
});

test("no ofrece destino cuando el rol no puede ver ninguna", () => {
  assert.equal(firstAccessibleDestination(destinations, {}), undefined);
  assert.equal(firstAccessibleDestination(destinations, undefined), undefined);
});
