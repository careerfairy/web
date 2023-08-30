import { useMediaQuery } from "@mui/material"
import { useTheme } from "@mui/material/styles"

const useSparksFeedIsFullScreen = (): boolean => {
   const theme = useTheme()
   return useMediaQuery(theme.breakpoints.down("sparksFullscreen"))
}

export default useSparksFeedIsFullScreen
