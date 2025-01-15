import { PaletteMode } from "@mui/material"
import { ThemeOptions, createTheme } from "@mui/material/styles"
import { breakpoints } from "./breakpoints"
import { getComponents } from "./components"
import { legacyStyles } from "./legacy-styles"
import { brand, getPalette } from "./palette"
import { getTypography } from "./typography"

/**
 * This function generates the base theme without custom components/typography.
 * Custom components/typography are excluded because they rely on the theme generated from this base theme.
 * @param options - An object that includes the palette mode and optionally the font family.
 * @param options.mode - The palette mode, which can be either 'light' or 'dark'.
 * @param options.fontFamily - The font family to be used. If not provided, 'Poppins' is used as the default.
 * Both the palette mode and font family need to be set before initializing the theme with the createTheme function.
 */
export const createBrandedTheme = ({
   fontFamily = "Poppins,sans-serif",
   mode,
}: {
   mode: PaletteMode
   fontFamily?: string
}) => {
   const theme = {
      // example of custom theme property
      brand,

      // Palette
      palette: getPalette(mode),

      // Breakpoints
      breakpoints,

      // Initialize the typography with the default font family, needs to be set before initializing the theme
      typography: getTypography(fontFamily),

      legacy: legacyStyles,
   } satisfies ThemeOptions

   // Create the base theme, which is the theme without custom components/typography
   const baseTheme = createTheme(theme)

   // Create the full theme, which includes the base theme and custom components/typography
   return createTheme(baseTheme, {
      components: getComponents(baseTheme, fontFamily),
   })
}
