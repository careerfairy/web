import { ThemeProvider, CssBaseline, createTheme } from "@mui/material"
import { Preview } from "@storybook/react"
import { themeOptions } from "@careerfairy/shared-ui"

export const baseStorybookPreview: Preview = {
   parameters: {
      actions: { argTypesRegex: "^on[A-Z].*" },
      controls: {
         // Description toggle
         // expanded: true,
         matchers: {
            color: /(background|color)$/i,
            date: /Date$/,
         },
      },
   },
}

export const baseStorybookPreviewMui: Preview = {
   ...baseStorybookPreview,
   decorators: [
      (Story) => (
         <ThemeProvider theme={createTheme(themeOptions)}>
            <CssBaseline />
            <Story />
         </ThemeProvider>
      ),
   ],
}
