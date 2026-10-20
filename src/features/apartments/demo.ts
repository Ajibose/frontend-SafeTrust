import {
  MOCK_APARTMENTS,
  type Apartment as MockApartment,
} from "@/lib/mockData/apartments";
import type {
  ApartmentInput,
  ApartmentsRepository,
  OwnedApartment,
} from "./repository";

const fromMock = (apartment: MockApartment): OwnedApartment => ({
  id: apartment.id,
  name: apartment.name,
  description: apartment.description ?? null,
  price: apartment.price,
  warrantyDeposit: apartment.warranty_deposit,
  address: {
    street: apartment.address.street ?? "",
    neighborhood: apartment.address.neighborhood ?? "",
    city: apartment.address.city ?? apartment.location,
    country: apartment.address.country ?? "",
  },
  coordinates: null,
  isAvailable: apartment.is_available,
  availableFrom: apartment.available_from,
  availableUntil: apartment.available_until ?? null,
  bedrooms: apartment.bedrooms,
  bathrooms: apartment.bathrooms,
  petFriendly: apartment.pet_friendly ?? false,
  imageUrls: apartment.image_urls ?? [],
  createdAt: apartment.created_at,
  offers: apartment.offers,
});

const copy = (apartment: OwnedApartment): OwnedApartment => ({
  ...apartment,
  address: { ...apartment.address },
  coordinates: apartment.coordinates && { ...apartment.coordinates },
  imageUrls: [...apartment.imageUrls],
});

const fromInput = (input: ApartmentInput) => ({
  ...input,
  address: { ...input.address },
  coordinates: input.coordinates && { ...input.coordinates },
  imageUrls: [...input.imageUrls],
});

// Demo persistence: this module's memory only, so it survives client-side
// navigation but not a reload. Nothing is sent anywhere.
let store: OwnedApartment[] = [];
let nextId = 1;

export function resetDemoApartments() {
  store = MOCK_APARTMENTS.map(fromMock);
  nextId = 1;
}
resetDemoApartments();

const notFound = () => new Error("Apartment not found");

export const demoApartments: ApartmentsRepository = {
  mode: "demo",

  async listMine() {
    return store.map(copy);
  },

  async get(id) {
    const apartment = store.find((item) => item.id === id);
    return apartment ? copy(apartment) : null;
  },

  async create(input) {
    const apartment: OwnedApartment = {
      ...fromInput(input),
      id: `demo-${nextId++}`,
      createdAt: new Date().toISOString(),
      offers: 0,
    };
    store = [apartment, ...store];
    return copy(apartment);
  },

  async update(id, input) {
    const current = store.find((item) => item.id === id);
    if (!current) throw notFound();
    const updated: OwnedApartment = { ...current, ...fromInput(input) };
    store = store.map((item) => (item.id === id ? updated : item));
    return copy(updated);
  },

  async remove(id) {
    if (!store.some((item) => item.id === id)) throw notFound();
    store = store.filter((item) => item.id !== id);
  },
};
