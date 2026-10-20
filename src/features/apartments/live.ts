import { gql, GraphQLError } from "@/lib/hasura/gql";
import { fromRow, toInsertObject, type ApartmentRow } from "./mappers";
import type { ApartmentsRepository } from "./repository";

// Rows are scoped to the signed-in host by Hasura's permissions (IC-08):
// queries never filter by owner_id and mutations never send it.
const FIELDS = /* GraphQL */ `
  id
  name
  description
  price
  warranty_deposit
  address
  coordinates
  is_available
  available_from
  available_until
  bedrooms
  bathrooms
  pet_friendly
  created_at
  apartment_images {
    image_url
  }
`;

const LIST_MINE = /* GraphQL */ `
  query MyApartments {
    apartments(
      where: { deleted_at: { _is_null: true } }
      order_by: { created_at: desc }
    ) {
      ${FIELDS}
    }
  }
`;

const GET = /* GraphQL */ `
  query MyApartment($id: uuid!) {
    apartments(
      where: { id: { _eq: $id }, deleted_at: { _is_null: true } }
      limit: 1
    ) {
      ${FIELDS}
    }
  }
`;

const INSERT = /* GraphQL */ `
  mutation CreateApartment($object: apartments_insert_input!) {
    insert_apartments_one(object: $object) {
      id
      created_at
    }
  }
`;

const INSERT_IMAGES = /* GraphQL */ `
  mutation AddApartmentImages($objects: [apartment_images_insert_input!]!) {
    insert_apartment_images(objects: $objects) {
      affected_rows
    }
  }
`;

// One request, so Hasura runs the three mutations in a single transaction.
const UPDATE = /* GraphQL */ `
  mutation UpdateApartment(
    $id: uuid!
    $set: apartments_set_input!
    $images: [apartment_images_insert_input!]!
  ) {
    update_apartments(
      where: { id: { _eq: $id }, deleted_at: { _is_null: true } }
      _set: $set
    ) {
      affected_rows
    }
    delete_apartment_images(where: { apartment_id: { _eq: $id } }) {
      affected_rows
    }
    insert_apartment_images(objects: $images) {
      affected_rows
    }
  }
`;

const SOFT_DELETE = /* GraphQL */ `
  mutation RemoveApartment($id: uuid!, $at: timestamptz!) {
    update_apartments(
      where: { id: { _eq: $id }, deleted_at: { _is_null: true } }
      _set: { deleted_at: $at }
    ) {
      affected_rows
    }
  }
`;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const notFound = () => new GraphQLError("Apartment not found", "NOT_FOUND");

const imageObjects = (id: string, urls: string[]) =>
  urls.map((url) => ({ apartment_id: id, image_url: url }));

export const liveApartments: ApartmentsRepository = {
  mode: "live",

  async listMine() {
    const { apartments } = await gql<{ apartments: ApartmentRow[] }>(LIST_MINE);
    return apartments.map(fromRow);
  },

  async get(id) {
    // A non-UUID can't be a live apartment; Hasura would reject the variable.
    if (!UUID.test(id)) return null;
    const { apartments } = await gql<{ apartments: ApartmentRow[] }>(GET, {
      id,
    });
    return apartments[0] ? fromRow(apartments[0]) : null;
  },

  async create(input) {
    const { insert_apartments_one } = await gql<{
      insert_apartments_one: { id: string; created_at: string };
    }>(INSERT, { object: toInsertObject(input) });
    const { id } = insert_apartments_one;
    if (input.imageUrls.length) {
      await gql(INSERT_IMAGES, { objects: imageObjects(id, input.imageUrls) });
    }
    const created = await this.get(id);
    if (!created) throw notFound();
    return created;
  },

  async update(id, input) {
    const { update_apartments } = await gql<{
      update_apartments: { affected_rows: number };
    }>(UPDATE, {
      id,
      set: toInsertObject(input),
      images: imageObjects(id, input.imageUrls),
    });
    if (!update_apartments.affected_rows) throw notFound();
    const updated = await this.get(id);
    if (!updated) throw notFound();
    return updated;
  },

  async remove(id) {
    const { update_apartments } = await gql<{
      update_apartments: { affected_rows: number };
    }>(SOFT_DELETE, { id, at: new Date().toISOString() });
    if (!update_apartments.affected_rows) throw notFound();
  },
};
