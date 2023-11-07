import { screen } from "@testing-library/react"
import { renderWithTheme } from "@careerfairy/shared-ui"

import { StreamingPage } from "."

describe("apps", () => {
   describe("boilerplate-website", () => {
      describe("HomePage", () => {
         it("should render home page when no props are present", () => {
            renderWithTheme(<StreamingPage />)

            expect(screen.getByText("Home Page")).toBeInTheDocument()
         })
      })
   })
})
