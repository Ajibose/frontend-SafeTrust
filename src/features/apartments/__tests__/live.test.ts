import { auth } from "@/lib/firebase";
import { liveApartments } from "../live";
import { sampleInput } from "../testing/fixtures";

jest.mock("@/lib/firebase", () => ({
  auth: {
    currentUser: null,
    authStateReady: jest.fn(() => Promise.resolve()),
  },
}));

const mockAuth = auth as unknown as {
  currentUser: { getIdToken: () => Promise<string> } | null;
};

const ID = "6f1c2a7e-1111-4222-8333-944455556666";

const row = {
  id: ID,
  name: "Escazú Loft",
  description: "Bright loft near the park.",
  price: 1100,
  warranty_deposit: 2200,
  address: sampleInput.address,
  coordinates: "(-84.06,9.93)",
  is_available: true,
  available_from: "2026-11-01T00:00:00+00:00",
  available_until: null,
  bedrooms: 2,
  bathrooms: 1,
  pet_friendly: false,
  created_at: "2026-10-21T12:00:00+00:00",
  apartment_images: [
    { image_url: "https://example.com/a.jpg" },
    { image_url: "https://example.com/b.jpg" },
  ],
};

type Call = { query: string; variables: Record<string, unknown> };

describe("liveApartments", () => {
  const fetchMock = jest.fn();
  const calls = (): Call[] =>
    fetchMock.mock.calls.map(([, init]) => JSON.parse(init.body));
  const respond = (...bodies: unknown[]) => {
    for (const body of bodies) {
      fetchMock.mockResolvedValueOnce({
        json: () => Promise.resolve(body),
      } as Response);
    }
  };

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock;
    mockAuth.currentUser = { getIdToken: () => Promise.resolve("id-token") };
  });

  it("is the live adapter", () => {
    expect(liveApartments.mode).toBe("live");
  });

  it("create inserts the apartment, then its images, then reads it back", async () => {
    respond(
      {
        data: { insert_apartments_one: { id: ID, created_at: row.created_at } },
      },
      { data: { insert_apartment_images: { affected_rows: 2 } } },
      { data: { apartments: [row] } },
    );

    const created = await liveApartments.create(sampleInput);

    expect(fetchMock).toHaveBeenCalledTimes(3);
    const [insert, images, read] = calls();
    expect(insert.query).toContain("insert_apartments_one");
    expect(insert.variables.object).toMatchObject({
      coordinates: "(-84.06,9.93)",
      warranty_deposit: 2200,
    });
    expect(insert.variables.object).not.toHaveProperty("owner_id");
    expect(images.query).toContain("insert_apartment_images");
    expect(images.variables).toEqual({
      objects: [
        { apartment_id: ID, image_url: "https://example.com/a.jpg" },
        { apartment_id: ID, image_url: "https://example.com/b.jpg" },
      ],
    });
    expect(read.variables).toEqual({ id: ID });
    expect(created).toMatchObject({
      id: ID,
      coordinates: { lat: 9.93, lng: -84.06 },
      imageUrls: sampleInput.imageUrls,
    });

    for (const [, init] of fetchMock.mock.calls) {
      expect(init.headers.Authorization).toBe("Bearer id-token");
      expect(
        Object.keys(init.headers).map((name) => name.toLowerCase()),
      ).not.toContain("x-hasura-admin-secret");
    }
  });

  it("create skips the image insert when there are no images", async () => {
    respond(
      {
        data: { insert_apartments_one: { id: ID, created_at: row.created_at } },
      },
      { data: { apartments: [{ ...row, apartment_images: [] }] } },
    );
    await liveApartments.create({ ...sampleInput, imageUrls: [] });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(calls()[1].query).not.toContain("insert_apartment_images");
  });

  it("listMine only asks for apartments that are not deleted", async () => {
    respond({ data: { apartments: [row] } });
    const list = await liveApartments.listMine();
    expect(calls()[0].query).toMatch(
      /deleted_at:\s*\{\s*_is_null:\s*true\s*\}/,
    );
    expect(calls()[0].query).not.toContain("owner_id");
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(ID);
  });

  it("get returns null when there is no row", async () => {
    respond({ data: { apartments: [] } });
    await expect(liveApartments.get(ID)).resolves.toBeNull();
  });

  it("get returns null for an id that is not a UUID, without a request", async () => {
    await expect(liveApartments.get("2")).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("update sets the fields, replaces the images, then reads it back", async () => {
    respond(
      {
        data: {
          update_apartments: { affected_rows: 1 },
          delete_apartment_images: { affected_rows: 2 },
          insert_apartment_images: { affected_rows: 1 },
        },
      },
      { data: { apartments: [row] } },
    );

    await liveApartments.update(ID, {
      ...sampleInput,
      imageUrls: ["https://example.com/c.jpg"],
    });

    const [update, read] = calls();
    expect(update.query).toContain("update_apartments");
    expect(update.query).toContain("delete_apartment_images");
    expect(update.query).toContain("insert_apartment_images");
    expect(update.variables).toMatchObject({
      id: ID,
      set: { coordinates: "(-84.06,9.93)" },
      images: [{ apartment_id: ID, image_url: "https://example.com/c.jpg" }],
    });
    expect(update.variables.set).not.toHaveProperty("owner_id");
    expect(read.variables).toEqual({ id: ID });
  });

  it("update fails when the apartment is missing or not yours", async () => {
    respond({
      data: {
        update_apartments: { affected_rows: 0 },
        delete_apartment_images: { affected_rows: 0 },
        insert_apartment_images: { affected_rows: 0 },
      },
    });
    await expect(liveApartments.update(ID, sampleInput)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("remove soft deletes with deleted_at", async () => {
    respond({ data: { update_apartments: { affected_rows: 1 } } });
    await liveApartments.remove(ID);
    const [remove] = calls();
    expect(remove.query).toContain("deleted_at: $at");
    expect(remove.query).not.toMatch(/delete_apartments/);
    expect(remove.variables.id).toBe(ID);
    expect(typeof remove.variables.at).toBe("string");
    expect(Number.isNaN(Date.parse(String(remove.variables.at)))).toBe(false);
  });

  it("passes backend refusals through with their message", async () => {
    respond({
      errors: [
        {
          message: "Apartment has active reservations",
          extensions: { code: "unexpected" },
        },
      ],
    });
    await expect(liveApartments.remove(ID)).rejects.toMatchObject({
      message: "Apartment has active reservations",
      code: "unexpected",
    });
  });

  it("maps constraint errors from create", async () => {
    respond({
      errors: [
        {
          message: 'violates check constraint "apartments_price_check"',
          extensions: { code: "constraint-violation" },
        },
      ],
    });
    await expect(liveApartments.create(sampleInput)).rejects.toMatchObject({
      code: "constraint-violation",
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
