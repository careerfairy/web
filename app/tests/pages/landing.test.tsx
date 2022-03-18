import React from "react"

import LandingPage from "../../pages/index"
import { render, screen } from "../test-utils"

describe("Landing Page Tests", () => {
   it("Should render main header section", () => {
      render(<LandingPage />)
      expect(screen.getByText("Our Next Events")).toBeInTheDocument()
   })
})
