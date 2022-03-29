import React from "react"

import LandingPage from "../../pages/index"
import { render, screen } from "../test-utils"

describe("Landing Page Tests", () => {
   it("Should render main header section", () => {
      render(<LandingPage />)
      expect(screen.getByText("Our Next Events")).toBeInTheDocument()
   })
   it("Should render the book a demo button with a link to the demo portal", () => {
      render(<LandingPage />)
      expect(screen.getAllByText("Book a Demo")[0]).toHaveAttribute(
         "href",
         "https://library.careerfairy.io/demo-request-1"
      )
   })
})
