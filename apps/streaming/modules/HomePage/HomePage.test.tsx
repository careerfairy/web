import { screen } from "@testing-library/react"

import { HomePage } from "./"
import { renderWithTheme } from "@careerfairy/ui"

describe("apps", () => {
   describe("boilerplate-website", () => {
      describe("HomePage", () => {
         it("should render home page when no props are present", () => {
            renderWithTheme(<HomePage />)

            expect(screen.getByText("Home Page")).toBeInTheDocument()
         })
      })
   })
})
