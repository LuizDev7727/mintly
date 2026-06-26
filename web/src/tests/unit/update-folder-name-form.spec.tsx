import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UpdateFolderNameForm } from "@/pages/orgs/$slug/channels/$channel/-components/update-folder-name-form";

vi.mock("@tanstack/react-router", () => ({
  useParams: () => ({ slug: "my-org", channel: "my-channel" }),
}));

vi.mock("nuqs", () => ({
  useQueryState: () => ["", vi.fn()],
}));

vi.mock("@/http/folder/update-folder.http", () => ({
  updateFolderHttp: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("sonner", () => ({
  toast: vi.fn(),
}));

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("UpdateFolderNameForm", () => {
  it("should have the button disabled when the folder name has not changed", () => {
    renderWithClient(
      <UpdateFolderNameForm folderId="123" folderName="My Folder" />,
    );

    expect(screen.getByRole("button", { name: /update folder/i })).toBeDisabled();
  });

  it("should enable the button when the folder name is changed", async () => {
    const user = userEvent.setup();

    renderWithClient(
      <UpdateFolderNameForm folderId="123" folderName="My Folder" />,
    );

    const input = screen.getByPlaceholderText("My Folder");
    await user.clear(input);
    await user.type(input, "New Folder Name");

    expect(screen.getByRole("button", { name: /update folder/i })).toBeEnabled();
  });

  it("should disable the button again if the name is changed back to the original", async () => {
    const user = userEvent.setup();

    renderWithClient(
      <UpdateFolderNameForm folderId="123" folderName="My Folder" />,
    );

    const input = screen.getByPlaceholderText("My Folder");
    await user.clear(input);
    await user.type(input, "New Folder Name");
    await user.clear(input);
    await user.type(input, "My Folder");

    expect(screen.getByRole("button", { name: /update folder/i })).toBeDisabled();
  });
});
