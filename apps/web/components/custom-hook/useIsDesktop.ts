import { useMediaQuery } from "@mui/material"
import { useTheme } from "@mui/material/styles"
export const desktopProp = "md"

const useIsDesktop = () => {
   const theme = useTheme()
   return useMediaQuery(theme.breakpoints.up(desktopProp))
}

export default useIsDesktop
