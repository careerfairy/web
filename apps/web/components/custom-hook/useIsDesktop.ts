import { useMediaQuery } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { DefaultTheme } from "@mui/styles"
export const desktopProp = "md"

const useIsDesktop = () => {
   const theme = useTheme<DefaultTheme>()
   return useMediaQuery(theme.breakpoints.up(desktopProp))
}

export default useIsDesktop
