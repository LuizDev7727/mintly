import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MembersPagination } from "@/pages/orgs/$slug/members/-components/members-pagination";

const { setCurrentPage, state } = vi.hoisted(() => ({
  setCurrentPage: vi.fn(),
  state: { currentPage: 0 },
}));

vi.mock("nuqs", async (importOriginal) => ({
  ...(await importOriginal<typeof import("nuqs")>()),
  useQueryState: () => [state.currentPage, setCurrentPage],
}));

const button = (name: string) => screen.getByRole("button", { name });

describe("MembersPagination", () => {
  beforeEach(() => {
    state.currentPage = 0;
    setCurrentPage.mockClear();
  });

  it("should show the total number of members and the current page", () => {
    render(<MembersPagination totalPages={3} totalCount={25} />);

    expect(screen.getByText("25 members")).toBeInTheDocument();
    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
  });

  it("should use the singular label for a single member", () => {
    render(<MembersPagination totalPages={1} totalCount={1} />);

    expect(screen.getByText("1 member")).toBeInTheDocument();
  });

  it("should disable the backward buttons on the first page", () => {
    render(<MembersPagination totalPages={3} totalCount={25} />);

    expect(button("First page")).toBeDisabled();
    expect(button("Previous page")).toBeDisabled();
    expect(button("Next page")).toBeEnabled();
    expect(button("Last page")).toBeEnabled();
  });

  it("should disable the forward buttons on the last page", () => {
    state.currentPage = 2;

    render(<MembersPagination totalPages={3} totalCount={25} />);

    expect(screen.getByText("Page 3 of 3")).toBeInTheDocument();
    expect(button("First page")).toBeEnabled();
    expect(button("Previous page")).toBeEnabled();
    expect(button("Next page")).toBeDisabled();
    expect(button("Last page")).toBeDisabled();
  });

  it("should disable every button when there is a single page", () => {
    render(<MembersPagination totalPages={1} totalCount={5} />);

    for (const name of ["First page", "Previous page", "Next page", "Last page"]) {
      expect(button(name)).toBeDisabled();
    }
  });

  it("should not break when the API reports zero pages", () => {
    render(<MembersPagination totalPages={0} totalCount={0} />);

    expect(screen.getByText("Page 1 of 1")).toBeInTheDocument();
    expect(screen.getByText("0 members")).toBeInTheDocument();
  });

  it("should go to the next and the last page", async () => {
    const user = userEvent.setup();

    render(<MembersPagination totalPages={4} totalCount={40} />);

    await user.click(button("Next page"));
    expect(setCurrentPage).toHaveBeenLastCalledWith(1);

    await user.click(button("Last page"));
    expect(setCurrentPage).toHaveBeenLastCalledWith(3);
  });

  it("should go to the previous and the first page", async () => {
    const user = userEvent.setup();
    state.currentPage = 2;

    render(<MembersPagination totalPages={4} totalCount={40} />);

    await user.click(button("Previous page"));
    expect(setCurrentPage).toHaveBeenLastCalledWith(1);

    await user.click(button("First page"));
    expect(setCurrentPage).toHaveBeenLastCalledWith(0);
  });
});
