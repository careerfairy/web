import { screen } from "@testing-library/react"
import { renderWithTheme } from "@careerfairy/ui"
import { Link } from "."

describe("Link", () => {
   it("should render link when no props are present", () => {
      renderWithTheme(<Link href="/test" />)

      expect(screen.getByRole("link")).toBeInTheDocument()
   })
})
