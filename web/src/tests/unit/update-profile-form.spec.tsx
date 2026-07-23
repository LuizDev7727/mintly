import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { UpdateProfileForm } from "@/components/profile/update-profile-form";

const updateUserMock = vi.fn().mockResolvedValue(undefined);

vi.mock("@/lib/auth", () => ({
  authClient: {
    updateUser: (...args: unknown[]) => updateUserMock(...args),
  },
}));

vi.mock("sonner", () => ({
  toast: vi.fn(),
}));

function renderForm(onSuccess = vi.fn()) {
  render(
    <Dialog open>
      <DialogContent>
        <UpdateProfileForm
          bio="Original bio"
          logo={null}
          name="Matt Welsh"
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>,
  );
}

describe("UpdateProfileForm", () => {
  beforeEach(() => {
    updateUserMock.mockClear();
  });

  it("should submit the updated name and bio", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    renderForm(onSuccess);

    const nameInput = screen.getByLabelText("Name");
    await user.clear(nameInput);
    await user.type(nameInput, "New Name");

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    expect(updateUserMock).toHaveBeenCalledWith(
      expect.objectContaining({ name: "New Name", bio: "Original bio" }),
    );
    expect(onSuccess).toHaveBeenCalled();
  });

  it("should show a validation error and not submit when name is cleared", async () => {
    const user = userEvent.setup();
    renderForm();

    const nameInput = screen.getByLabelText("Name");
    await user.clear(nameInput);

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(updateUserMock).not.toHaveBeenCalled();
  });
});
