import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MembersTabs } from "@/pages/orgs/$slug/members/-components/members-tabs";

vi.mock("@/pages/orgs/$slug/members/-components/members-list", () => ({
  MembersList: () => <div data-testid="members-list">members list</div>,
}));

vi.mock("@/pages/orgs/$slug/members/-components/pending-invites-list", () => ({
  PendingInvitesList: () => <div data-testid="pending-invites-list">pending list</div>,
}));

const tab = (name: string) => screen.getByRole("tab", { name });

describe("MembersTabs", () => {
  it("should render a Members and a Pending tab, with no count in the label", () => {
    render(<MembersTabs />);

    expect(tab("Members")).toBeInTheDocument();
    expect(tab("Pending")).toBeInTheDocument();
  });

  it("should give each tab a decorative icon", () => {
    render(<MembersTabs />);

    for (const name of ["Members", "Pending"]) {
      expect(tab(name).querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("should open on the Members tab, rendering MembersList and not PendingInvitesList", () => {
    render(<MembersTabs />);

    expect(tab("Members")).toHaveAttribute("data-state", "active");
    expect(tab("Pending")).toHaveAttribute("data-state", "inactive");
    expect(screen.getByTestId("members-list")).toBeInTheDocument();
    expect(screen.queryByTestId("pending-invites-list")).not.toBeInTheDocument();
  });

  it("should render PendingInvitesList, and not MembersList, when the Pending tab is clicked", async () => {
    const user = userEvent.setup();
    render(<MembersTabs />);

    await user.click(tab("Pending"));

    expect(tab("Pending")).toHaveAttribute("data-state", "active");
    expect(tab("Members")).toHaveAttribute("data-state", "inactive");
    expect(screen.getByTestId("pending-invites-list")).toBeInTheDocument();
    expect(screen.queryByTestId("members-list")).not.toBeInTheDocument();
  });

  it("should go back to MembersList when the Members tab is clicked again", async () => {
    const user = userEvent.setup();
    render(<MembersTabs />);

    await user.click(tab("Pending"));
    await user.click(tab("Members"));

    expect(screen.getByTestId("members-list")).toBeInTheDocument();
    expect(screen.queryByTestId("pending-invites-list")).not.toBeInTheDocument();
  });

  it("should replace the primitive's default tab styles with the bordered, open-bottom look", () => {
    // ui/tabs.tsx ships a look we do not want here. members-tabs.tsx repeats the
    // primitive's own variants so tailwind-merge replaces those classes; this
    // reads the FINAL, merged className to prove it, since jsdom has no CSS.
    render(<MembersTabs />);

    for (const name of ["Members", "Pending"]) {
      const className = tab(name).className;

      // Replaced: shadow, dark-mode border and dark-mode translucent background.
      expect(className).not.toContain("tabs-list:data-active:shadow-sm");
      expect(className).not.toContain("dark:data-active:border-input");
      expect(className).not.toContain("dark:data-active:bg-input/30");
      expect(className).toContain("tabs-list:data-active:shadow-none");
      expect(className).toContain("dark:data-active:border-transparent");
      expect(className).toContain("dark:data-active:bg-background");

      // The primitive keeps `border-transparent`: the visible sides need a colour.
      expect(className).toContain("border-x-border");
      expect(className).toContain("border-t-border");
    }

    // The list must not keep the primitive's fixed height.
    const list = screen.getByRole("tablist");
    expect(list.className).not.toContain("group-data-horizontal/tabs:h-9");
    expect(list.className).toContain("group-data-horizontal/tabs:h-auto");
  });

  it("should keep the search field visible on both tabs", async () => {
    const user = userEvent.setup();
    render(<MembersTabs />);

    expect(screen.getByPlaceholderText("Search members...")).toBeInTheDocument();

    await user.click(tab("Pending"));

    expect(screen.getByPlaceholderText("Search members...")).toBeInTheDocument();
  });
});
