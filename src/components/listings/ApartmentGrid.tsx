"use client";

import type { HotelListing } from "@/@types/hotel";
import ApartmentCard from "./ApartmentCard";

interface ApartmentGridProps {
  apartments: HotelListing[];
  distances?: Record<string, number>;
  favorites?: string[];
  onToggleFavorite?: (id: string) => void;
}

export default function ApartmentGrid({
  apartments,
  distances,
  favorites,
  onToggleFavorite,
}: ApartmentGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {apartments.map((apartment, index) => (
        <ApartmentCard
          key={apartment.id}
          apartment={apartment}
          distanceKm={distances?.[apartment.id]}
          loading={index === 0 ? "eager" : "lazy"}
          isFavorite={favorites ? favorites.includes(apartment.id) : apartment.favorite}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}
