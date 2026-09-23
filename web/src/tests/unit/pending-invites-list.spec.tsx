import { Suspense } from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PendingInvitesList } from "@/pages/orgs/$slug/members/-components/pending-invites-list";
import type { PendingInvite } from "@/types/pending-invite";

const { getOrganizationPendingInvitesHttp, state } = vi.hoisted(() => ({
  getOrganizationPendingInvitesHttp: vi.fn(),
  state: { currentPage: 0 },
}));

vi.mock("@tanstack/react-router", () => ({
  useParams: () => ({ slug: "my-org" }),
}));

vi.mock("nuqs", async (importOriginal) => ({
  ...(await importOriginal<typeof import("nuqs")>()),
  useQueryState: () => [state.currentPage, vi.fn()],
}));

vi.mock("@/http/organization/get-organization-pending-invites.http", () => ({
  getOrganizationPendingInvitesHttp,
}));

vi.mock("@/pages/orgs/$slug/members/-components/pending-invite-member-card", () => ({
  PendingInviteMemberCard: ({ inviteMember }: { inviteMember: PendingInvite }) => (
    <div data-testid="pending-card">{inviteMember.email}</div>
  ),
}));

vi.mock("@/pages/orgs/$slug/members/-components/pending-invites-pagination", () => ({
  PendingInvitesPagination: ({
    totalPages,
    totalCount,
  }: {
    totalPages: number;
    totalCount: number;
  }) => <div data-testid="pagination">{`${totalCount} total, ${totalPages} pages`}</div>,
}));

vi.mock("@/pages/orgs/$slug/members/-components/empty-pending-invites", () => ({
  EmptyPendingInvites: () => <div>No pending invites</div>,
}));

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<div data-testid="fallback" />}>{ui}</Suspense>
    </QueryClientProvider>,
  );
}

const invite = (id: string, email: string): PendingInvite => ({
  id,
  email,
  role: null,
  createdAt: "2024-01-01T00:00:00.000Z",
});

describe("PendingInvitesList", () => {
  beforeEach(() => {
    getOrganizationPendingInvitesHttp.mockReset();
    state.currentPage = 0;
  });

  it("should fetch the current organization's pending invites at the page from the URL", async () => {
    getOrganizationPendingInvitesHttp.mockResolvedValue({
      pendingInvites: [invite("a", "new@test.dev")],
      meta: { totalCount: 1, totalPages: 1 },
    });

    renderWithClient(<PendingInvitesList />);

    await screen.findByTestId("pagination");
    expect(getOrganizationPendingInvitesHttp).toHaveBeenCalledWith({
      orgSlug: "my-org",
      pageIndex: 0,
    });
  });

  it("should render a card per invite and forward the totals to the pagination", async () => {
    getOrganizationPendingInvitesHttp.mockResolvedValue({
      pendingInvites: [invite("a", "new@test.dev"), invite("b", "other@test.dev")],
      meta: { totalCount: 2, totalPages: 1 },
    });

    renderWithClient(<PendingInvitesList />);

    expect(await screen.findAllByTestId("pending-card")).toHaveLength(2);
    expect(screen.getByText("new@test.dev")).toBeInTheDocument();
    expect(screen.getByTestId("pagination")).toHaveTextContent("2 total, 1 pages");
  });

  it("should show the empty state on the first page when there are no invites", async () => {
    getOrganizationPendingInvitesHttp.mockResolvedValue({
      pendingInvites: [],
      meta: { totalCount: 0, totalPages: 1 },
    });

    renderWithClient(<PendingInvitesList />);

    expect(await screen.findByText("No pending invites")).toBeInTheDocument();
    expect(screen.queryByTestId("pagination")).not.toBeInTheDocument();
  });

  it("should not show the empty state on a later page with no invites", async () => {
    // e.g. the total shrank (an invite was accepted) while viewing page 2.
    state.currentPage = 1;
    getOrganizationPendingInvitesHttp.mockResolvedValue({
      pendingInvites: [],
      meta: { totalCount: 12, totalPages: 1 },
    });

    renderWithClient(<PendingInvitesList />);

    await screen.findByTestId("pagination");
    expect(screen.queryByText("No pending invites")).not.toBeInTheDocument();
  });

  it("should suspend, showing the nearest fallback, while the data has not loaded yet", () => {
    getOrganizationPendingInvitesHttp.mockReturnValue(new Promise(() => {}));

    renderWithClient(<PendingInvitesList />);

    expect(screen.getByTestId("fallback")).toBeInTheDocument();
    expect(screen.queryByTestId("pending-card")).not.toBeInTheDocument();
    expect(screen.queryByText("No pending invites")).not.toBeInTheDocument();
  });
});
