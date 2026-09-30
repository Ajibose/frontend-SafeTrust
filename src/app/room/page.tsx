"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import {
  RoomPhotos,
  AdditionalRoomPhotos,
  RoomDetailsCard,
  RoomActionBar,
  MobileBookingCard,
  RoomBookingCard,
  BookingConfirmation,
  AmenitiesCard,
  LocationCard,
  HostCard,
  PolicyCard,
} from "@/components/rooms";
import { useRouter } from "next/navigation";
import { NavigationHeader } from "@/components/navigation/NavigationHeader";

const additionalImages = [
  "/img/room1.png",
  "/img/room2.png",
  "/img/hotel/hotel1.jpg",
];

const breadcrumbs = [
  { label: "Search", href: "/dashboard/search" },
  { label: "Shikara Hotel", isCurrentPage: true },
];

export default function RoomPage() {
  const router = useRouter();
  // Static demo room: no dynamic hotel id is available on /room yet.
  // Keep the id explicit here so the booking link does not silently drift.
  const hotelId = "1";
  const [isLoading] = useState(false);
  const [mobileBookingOpen, setMobileBookingOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(24);

  // Simulated auth state
  const isAuthenticated = false;

  const handleLike = () => {
    if (!isAuthenticated) {
      alert("Please login to save this room");
      return;
    }
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handleContact = () => {
    if (!isAuthenticated) {
      alert("Please login to contact the host");
      return;
    }
    console.log("Contact form opened");
  };

  const handleReport = () => {
    if (!isAuthenticated) {
      alert("Please login to report this listing");
      return;
    }
    console.log("Report form opened");
  };

  const [bookingData, setBookingData] = useState<{
    bookingId: string;
    checkIn: Date;
    checkOut: Date;
    guestCount: number;
    totalPrice: number;
  } | null>(null);

  const handleBookingStart = () => {
    console.log("Booking process started");
  };

  const handleBookingComplete = (bookingId: string) => {
    console.log("Booking completed:", bookingId);

    setBookingData({
      bookingId,
      checkIn: new Date(),
      checkOut: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      guestCount: 1,
      totalPrice: 120.54,
    });
  };

  const handleBookingError = (error: string) => {
    console.error("Booking error:", error);
  };

  const handleViewBooking = () => {
    if (bookingData) {
      router.push(`/hotels/${hotelId}/book?bookingId=${bookingData.bookingId}`);
    }
  };

  return (
    <div className="container mx-auto pb-8 max-w-7xl min-h-screen bg-background">
      {/* Navigation/Page Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <NavigationHeader
          breadcrumbs={breadcrumbs}
          backButtonFallback="/search"
        />
      </div>

      {/* Main content */}
      <h1 className="px-4 md:px-6 text-2xl font-bold my-4 lg:mb-6">
        Room Gallery
      </h1>

      {/* 1. Photo Gallery Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Main Room Photos */}
        <div className="lg:col-span-8 space-y-6 px-2 md:px-6">
          <RoomPhotos />
        </div>

        {/* Additional Hotel Images */}
        <div className="lg:col-span-4">
          <AdditionalRoomPhotos images={additionalImages} />
        </div>
      </div>

      {/* 2. Room Information Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main content - Room Details */}
        <div className="xl:col-span-2 space-y-8">
          {/* Room Basic Details */}
          <RoomDetailsCard isLoading={isLoading} />
          {/* Action Bar */}
          <RoomActionBar
            isLiked={isLiked}
            likeCount={likeCount}
            onLike={handleLike}
            onContact={handleContact}
            onReport={handleReport}
          />
          {/* Amenities */}
          <AmenitiesCard isLoading={isLoading} />
          {/* Location */}
          <LocationCard isLoading={isLoading} />
          {/* Host Information */}
          <HostCard isLoading={isLoading} />
          {/* Policies and Rules */}
          <PolicyCard isLoading={isLoading} />
        </div>

        {/* Sidebar - Booking Card */}
        <div className="xl:col-span-1">
          <div className="hidden xl:block sticky top-24">
            <div className="lg:col-span-4">
              {bookingData ? (
                <BookingConfirmation
                  bookingId={bookingData.bookingId}
                  hotelName="Shikara Hotel"
                  hotelId={hotelId}
                  checkIn={bookingData.checkIn}
                  checkOut={bookingData.checkOut}
                  guestCount={bookingData.guestCount}
                  totalPrice={bookingData.totalPrice}
                  onViewBooking={handleViewBooking}
                />
              ) : (
                <RoomBookingCard
                  roomId="room_001"
                  basePrice={2}
                  onBookingStart={handleBookingStart}
                  onBookingComplete={handleBookingComplete}
                  onBookingError={handleBookingError}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Mobile Modals */}
      {/* <MobileRoomGallery
          images={roomImages}
          isOpen={mobileGalleryOpen}
          onClose={() => setMobileGalleryOpen(false)}
          initialImageIndex={selectedImageIndex}
        /> */}
      <MobileBookingCard
        isOpen={mobileBookingOpen}
        onClose={() => setMobileBookingOpen(false)}
      />
    </div>
  );
}
