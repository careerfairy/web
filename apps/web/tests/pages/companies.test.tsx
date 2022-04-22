import React from "react"

import CompaniesPage from "../../pages/companies/index"
import { render, screen } from "../test-utils"

describe("Companies Page Tests", () => {
   it("Should render the 'Book a Demo' button with a valid link", () => {
      render(<CompaniesPage />)
      expect(screen.getAllByText("Book a Demo")[0]).toHaveAttribute(
         "href",
         "https://library.careerfairy.io/demo-request-1"
      )
   })
})
