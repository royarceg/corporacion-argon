import { render, screen } from "@testing-library/react";

function Hello() {
  return <h1>Hola ARGON</h1>;
}

test("el arnés de React Testing Library funciona", () => {
  render(<Hello />);
  expect(screen.getByText("Hola ARGON")).toBeInTheDocument();
});
