import { sxStyles } from "types/commonTypes"
import { styled } from "@mui/material/styles"
import Typography, { type TypographyProps } from "@mui/material/Typography"

const COLORS = {
   DARK_GRAY: "#2C2C2C",
   LIGHT_GRAY: "#5F5F5F",
   CAPTION_GRAY: "#9999B1",
}

export default sxStyles({
   section: {
      display: "flex",
      alignItems: "flex-start",
      gap: "16px",
      alignSelf: "stretch",
      paddingY: 2,
      flexDirection: "row",
      width: "-webkit-fill-available",
      ":child": {
         flexGrow: 1,
         flex: 1,
      },
      h3: {
         color: COLORS.DARK_GRAY,
         fontSize: "24px",
         fontweight: "600",
      },
      h4: {
         color: COLORS.DARK_GRAY,
         fontSize: "1.28571rem",
         fontWeight: 500,
      },
      p: {
         color: COLORS.LIGHT_GRAY,
         fontSize: "16px",
         fontWeight: "400",
      },
      h5: {
         color: COLORS.LIGHT_GRAY,
         fontSize: "1.14286rem",
         fontWeight: 400,
      },
      caption: {
         color: COLORS.CAPTION_GRAY,
         textAlign: "center",
         fontSize: "12px",
         fontWeight: 400,
         lineHeight: "141%",
      },
      ".section-left_column": {
         width: "400px",
         marginRight: "16px",
      },
      form: {
         display: "flex",
         flexDirection: "column",
         width: "-webkit-fill-available",
         gap: "12px",
      },
   },
})
