import React from "react"

import LandingPage from "../../../pages/index"
import { render, screen } from "@testing-library/react"

describe("tests", () => {
   it("should", () => {
      render(<LandingPage />)
      expect(screen.getByText("Our Next Events")).toBeInTheDocument()
   })
})
