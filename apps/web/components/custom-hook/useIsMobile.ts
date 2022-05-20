import { useTheme } from "@mui/material/styles"
import { useMediaQuery } from "@mui/material"

const useIsMobile = (): boolean => {
   const theme = useTheme()
   return useMediaQuery(theme.breakpoints.down("md"))
}

export default useIsMobile
