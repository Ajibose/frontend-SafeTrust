/** @jest-environment node */
import { execSync } from "node:child_process";

const GUEST_PATHS = [
  "src/app/rent",
  "src/app/guest",
  "src/app/page.tsx",
  "src/components/listings",
  "src/features/listings",
  "src/components/DestinationCarousel.tsx",
];

it("guest UI has no hard-coded orange", () => {
  const out = execSync(
    `git grep -nE "orange-[0-9]|accent-orange" -- ${GUEST_PATHS.join(" ")} ':!*.test.*' || true`,
  ).toString();
  expect(out).toBe("");
});
