import { ThemeOptions, alpha } from "@mui/material"
import { common } from "./palette"
import { grey } from "@mui/material/colors"

export const legacyStyles = {
   whiteShadow:
      "0 12px 20px -10px rgb(255 255 255 / 28%), 0 4px 20px 0 rgb(0 0 0 / 12%), 0 7px 8px -5px rgb(255 255 255 / 20%)",
   boxShadows: {
      dark_8_25_10: `0px 8px 25px rgba(33, 32, 32, 0.1)`,
      dark_12_13: `0px 12px 13px ${alpha(common.black, 0.12)}`,
      grey_5_15: `0px 5px 15px ${alpha(grey[400], 1)}`,
   },
   dropShadows: {
      dark_6_12_12: "drop-shadow(0px 6px 12px rgba(0, 0, 0, 0.12))",
   },
   drawerWidth: { small: "256px", medium: "300px" },
   darkTextShadow:
      "0px 3px 3px rgba(0,0,0,0.4)," +
      "0px 8px 13px rgba(0,0,0,0.1)," +
      "0px 18px 23px rgba(0,0,0,0.1);",
} satisfies ThemeOptions["legacy"]
