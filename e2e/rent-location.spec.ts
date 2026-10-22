import type { Page } from "@playwright/test";
import { test, expect, expectHealthyPage, waitForHydration } from "./fixtures";

// Central San José. Emulated, so no test depends on the real device location.
const SAN_JOSE = { latitude: 9.93, longitude: -84.09 };

const listingNames = (page: Page) =>
  page
    .getByRole("article")
    .evaluateAll((cards) =>
      cards.map((card) => card.getAttribute("aria-label")),
    );

const distances = (page: Page) =>
  page
    .getByTestId("distance-label")
    .evaluateAll((labels) =>
      labels.map((label) => parseFloat(label.textContent ?? "")),
    );

/** Counts geolocation requests, i.e. how often the browser could prompt. */
const countLocationRequests = (page: Page) =>
  page.addInitScript(() => {
    const geolocation = navigator.geolocation;
    const original = geolocation.getCurrentPosition.bind(geolocation);
    (window as unknown as { __locationRequests: number }).__locationRequests =
      0;
    geolocation.getCurrentPosition = (...args) => {
      (window as unknown as { __locationRequests: number })
        .__locationRequests++;
      original(...args);
    };
  });

const locationRequests = (page: Page) =>
  page.evaluate(
    () =>
      (window as unknown as { __locationRequests: number }).__locationRequests,
  );

async function openRent(page: Page) {
  await page.goto("/rent");
  const button = page.getByRole("button", { name: "Use my location" });
  await waitForHydration(button);
  await expect(page.getByRole("article")).not.toHaveCount(0);
  return button;
}

test.describe("granted location", () => {
  test.beforeEach(async ({ context }) => {
    await context.grantPermissions(["geolocation"]);
    await context.setGeolocation(SAN_JOSE);
  });

  test("sorts nearest first, survives Back navigation and clears to relevance", async ({
    page,
  }) => {
    await countLocationRequests(page);
    const useLocation = await openRent(page);
    const relevanceOrder = await listingNames(page);

    await useLocation.click();
    const clear = page.getByRole("button", { name: "Clear location" });
    await expect(clear).toBeVisible();
    await expect
      .poll(() => new URL(page.url()).searchParams.get("sort"))
      .toBe("nearest");
    await expect(page.getByTestId("distance-label")).not.toHaveCount(0);
    const nearest = await distances(page);
    expect(nearest).toEqual([...nearest].sort((a, b) => a - b));
    expect(await locationRequests(page)).toBe(1);

    // Open a listing, then come back: the in-memory location is still there.
    await page.getByRole("article").first().getByRole("link").click();
    await expect.poll(() => new URL(page.url()).pathname).toMatch(/^\/rent\/./);
    await page.goBack();
    await expect(clear).toBeVisible();
    await expect
      .poll(() => new URL(page.url()).searchParams.get("sort"))
      .toBe("nearest");
    expect(await distances(page)).toEqual(nearest);
    expect(await locationRequests(page)).toBe(1);

    await clear.click();
    await expect(
      page.getByRole("button", { name: "Use my location" }),
    ).toBeVisible();
    await expect(page.getByTestId("distance-label")).toHaveCount(0);
    await expect
      .poll(() => new URL(page.url()).searchParams.get("sort"))
      .toBeNull();
    expect(await listingNames(page)).toEqual(relevanceOrder);
  });
});

test("denied location shows a persistent message and destinations still work", async ({
  page,
  context,
}) => {
  // No permission granted: the emulated browser rejects the request.
  await context.clearPermissions();
  const useLocation = await openRent(page);

  await useLocation.click();

  const status = page.getByTestId("location-status");
  await expect(status).toHaveAttribute("aria-live", "polite");
  await expect(status).toHaveText(/Location is blocked for this site/);
  await expect(
    page.getByRole("button", { name: "Use my location" }),
  ).toBeEnabled();
  await expect(page.getByTestId("distance-label")).toHaveCount(0);

  await page
    .getByRole("list", { name: "Destination choices" })
    .getByRole("button", { name: /^San José,/ })
    .click();
  await expect
    .poll(() => new URL(page.url()).searchParams.get("location"))
    .toBe("San José");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Available for rent in San José",
  );
  await expect(status).toHaveText(/Location is blocked for this site/);
  await expectHealthyPage(page);
});
