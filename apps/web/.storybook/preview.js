import "../styles.css"
import { ThemeProviderWrapper } from "../context/theme/ThemeContext"
import { brandedLightTheme, brandedDarkTheme } from "../materialUI"
import React, { useMemo } from "react"

const THEMES = {
   light: brandedLightTheme,
   dark: brandedDarkTheme,
}

export const withMuiTheme = (Story, context) => {
   // The theme global we just declared
   const { theme: themeKey } = context.globals

   // only recompute the theme if the themeKey changes
   const theme = useMemo(() => THEMES[themeKey] || THEMES["light"], [themeKey])

   return (
      <ThemeProviderWrapper key={themeKey} overrideTheme={theme}>
         <Story />
      </ThemeProviderWrapper>
   )
}

export const globalTypes = {
   theme: {
      name: "Theme",
      title: "Theme",
      description: "Theme for your components",
      defaultValue: "light",
      toolbar: {
         icon: "paintbrush",
         dynamicTitle: true,
         items: [
            { value: "light", left: "☀️", title: "Light mode" },
            { value: "dark", left: "🌙", title: "Dark mode" },
         ],
      },
   },
}

/** @type { import('@storybook/react').Preview } */
const preview = {
   parameters: {
      actions: { argTypesRegex: "^on[A-Z].*" },
      controls: {
         expanded: true, // Adds the description and default columns
         matchers: {
            color: /(background|color)$/i,
            date: /Date$/,
         },
      },
   },
}

export const decorators = [withMuiTheme]

export default preview
