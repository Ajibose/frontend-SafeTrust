import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import GuestSuggestionsPage from "./page";
import { useRouter } from "next/navigation";
import { APARTMENT_LISTINGS } from "@/lib/mockData/apartmentListings";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/features/listings", () => ({
  useSaveStay: () => ({
    isSaved: () => false,
    toggleSaved: jest.fn(),
    announcement: "",
  }),
  WishlistAnnouncer: () => null,
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: () => <div data-testid="mock-image" />,
}));

jest.mock("@/components/listings/HotelHeader", () => ({
  __esModule: true,
  default: () => <header data-testid="hotel-header" />,
}));

const mockPush = jest.fn();

describe("GuestSuggestionsPage – Message host", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it("renders the Message host link next to Book for the selected apartment", () => {
    render(<GuestSuggestionsPage />);

    expect(screen.getByRole("button", { name: /Book/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Message host/i })).toHaveAttribute(
      "href",
      `/dashboard/messages/new?listing=${APARTMENT_LISTINGS[0].id}`,
    );
  });

  it("targets the listing id of whichever apartment is selected", () => {
    render(<GuestSuggestionsPage />);

    fireEvent.click(
      screen.getByRole("button", {
        name: `Select ${APARTMENT_LISTINGS[1].name}`,
      }),
    );

    expect(screen.getByRole("link", { name: /Message host/i })).toHaveAttribute(
      "href",
      `/dashboard/messages/new?listing=${APARTMENT_LISTINGS[1].id}`,
    );
  });
});
