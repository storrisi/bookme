import { render, screen } from "@testing-library/react"
import CreateEvent from "./index"

test("renders learn react link", () => {
  render(<CreateEvent />)
  const linkElement = screen.getByText(/learn react/i)
  expect(linkElement).toBeInTheDocument()
})
