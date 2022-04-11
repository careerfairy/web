import React from "react"

import LandingPage from "../../pages/index"
import { render, screen } from "../test-utils"

describe("Landing Page Tests", () => {
   it("Should render the 'View Upcoming Livestreams' button with a link to the next livestreams page", () => {
      render(<LandingPage />)
      expect(
         screen.getAllByText("View Upcoming Livestreams")[0]
      ).toHaveAttribute("href", "/next-livestreams")
   })
})
