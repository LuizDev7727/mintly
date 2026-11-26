import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IntegrationCard } from "@/pages/_auth/sign-up/onboarding/-components/integration-card";

describe("IntegrationCard", () => {
  it("should call onConnect when clicking Connect in the default state", async () => {
    const onConnect = vi.fn();

    render(
      <IntegrationCard
        name="YouTube"
        icon={null}
        state="default"
        onConnect={onConnect}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Connect" }));

    expect(onConnect).toHaveBeenCalledTimes(1);
  });

  it("should disable the action and ask to check the new tab while connecting", () => {
    render(<IntegrationCard name="YouTube" icon={null} state="connecting" />);

    expect(screen.getByRole("button", { name: /connecting/i })).toBeDisabled();
    expect(screen.getByText("Check the new tab")).toBeInTheDocument();
  });

  it("should show Connected without a button once connected", () => {
    render(<IntegrationCard name="YouTube" icon={null} state="connected" />);

    expect(screen.getByText("Connected")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("should show Coming soon without a button for unavailable platforms", () => {
    render(<IntegrationCard name="TikTok" icon={null} state="coming-soon" />);

    expect(screen.getByText("Coming soon")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
