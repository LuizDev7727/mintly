import { render, screen } from "@testing-library/react";

test("should render Hello World", () => {
  render(<p>Hello World</p>);
  expect(screen.getByText("Hello World")).toBeInTheDocument();
});
