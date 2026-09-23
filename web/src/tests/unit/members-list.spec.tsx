import { Suspense } from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MembersList } from "@/pages/orgs/$slug/members/-components/members-list";
import type { Member } from "@/types/member";

const { getMembersHttp } = vi.hoisted(() => ({
  getMembersHttp: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  useParams: () => ({ slug: "my-org" }),
}));

vi.mock("nuqs", async (importOriginal) => ({
  ...(await importOriginal<typeof import("nuqs")>()),
  useQueryState: () => [0, vi.fn()],
}));

vi.mock("@/http/organization/get-members.http", () => ({ getMembersHttp }));

vi.mock("@/pages/orgs/$slug/members/-components/member-card", () => ({
  MemberCard: ({ member }: { member: Member }) => (
    <div data-testid="member-card">{member.user.name}</div>
  ),
}));

vi.mock("@/pages/orgs/$slug/members/-components/members-pagination", () => ({
  MembersPagination: ({
    totalPages,
    totalCount,
  }: {
    totalPages: number;
    totalCount: number;
  }) => <div data-testid="pagination">{`${totalCount} total, ${totalPages} pages`}</div>,
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

const member = (id: string, name: string): Member => ({
  id,
  role: "member",
  createdAt: "2024-01-01T00:00:00.000Z",
  user: { id: `user-${id}`, name, email: `${id}@test.dev`, avatarUrl: null, bio: null },
});

describe("MembersList", () => {
  beforeEach(() => {
    getMembersHttp.mockReset();
  });

  it("should fetch the current organization's members at the page from the URL", async () => {
    getMembersHttp.mockResolvedValue({
      members: [],
      meta: { totalCount: 0, totalPages: 1 },
    });

    renderWithClient(<MembersList />);

    await screen.findByTestId("pagination");
    expect(getMembersHttp).toHaveBeenCalledWith({ orgSlug: "my-org", pageIndex: 0 });
  });

  it("should render a card per member and forward the totals to the pagination", async () => {
    getMembersHttp.mockResolvedValue({
      members: [member("1", "Ada Lovelace"), member("2", "Grace Hopper")],
      meta: { totalCount: 13, totalPages: 2 },
    });

    renderWithClient(<MembersList />);

    expect(await screen.findAllByTestId("member-card")).toHaveLength(2);
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByTestId("pagination")).toHaveTextContent("13 total, 2 pages");
  });

  it("should suspend, showing the nearest fallback, while the data has not loaded yet", () => {
    getMembersHttp.mockReturnValue(new Promise(() => {}));

    renderWithClient(<MembersList />);

    expect(screen.getByTestId("fallback")).toBeInTheDocument();
    expect(screen.queryByTestId("member-card")).not.toBeInTheDocument();
    expect(screen.queryByTestId("pagination")).not.toBeInTheDocument();
  });
});
