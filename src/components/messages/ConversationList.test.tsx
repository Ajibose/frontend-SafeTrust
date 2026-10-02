import { render, screen } from "@testing-library/react";
import { ConversationList } from "./ConversationList";
import { MOCK_CONVERSATIONS, MOCK_CURRENT_USER } from "@/lib/mockData/messages";

jest.mock("next/navigation", () => ({
  usePathname: () => "/dashboard/messages",
}));

describe("ConversationList", () => {
  it("renders the three stub conversations with apartment names", () => {
    render(
      <ConversationList
        conversations={MOCK_CONVERSATIONS}
        currentUserId={MOCK_CURRENT_USER.uid}
      />,
    );

    expect(screen.getByText("Downtown Loft Apartment")).toBeInTheDocument();
    expect(screen.getByText("Seaside Condo")).toBeInTheDocument();
    expect(screen.getByText("Cozy Cabin")).toBeInTheDocument();
  });

  it("links each conversation to its thread route", () => {
    render(
      <ConversationList
        conversations={MOCK_CONVERSATIONS}
        currentUserId={MOCK_CURRENT_USER.uid}
      />,
    );

    expect(screen.getByRole("link", { name: /downtown loft apartment/i })).toHaveAttribute(
      "href",
      "/dashboard/messages/conv-1",
    );
  });
});
