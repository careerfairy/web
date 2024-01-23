import {
   createTheme,
   ThemeProvider as MUIThemeProvider,
} from "@mui/material/styles"
import { render, RenderOptions, RenderResult } from "@testing-library/react"
import { createBrandedTheme } from "@careerfairy/config-mui"

type RenderWithTheme = (
   elm: React.ReactElement,
   renderOptions?: RenderOptions
) => RenderResult

const theme = createBrandedTheme({
   mode: "light",
})

export const renderWithTheme: RenderWithTheme = (component, renderOptions?) => {
   const wrapper: RenderOptions["wrapper"] = ({ children }) => (
      <MUIThemeProvider theme={theme}>{children}</MUIThemeProvider>
   )

   return render(component, {
      wrapper,
      ...renderOptions,
   })
}
