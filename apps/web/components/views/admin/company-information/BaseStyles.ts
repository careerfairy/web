import { sxStyles } from "types/commonTypes"

const COLORS = {
   DARK_GRAY: "#2C2C2C",
   LIGHT_GRAY: "#5F5F5F",
   CAPTION_GRAY: "#9999B1",
}

export default sxStyles({
   chipInput: {
      "& .MuiFilledInput-root": {
         pb: 1,
         pt: 3,
      },
      "& .MuiChip-root": {
         backgroundColor: "secondary.main",
         color: "white",
         m: 0.625,
         "& svg": {
            color: "inherit",
         },
      },
   },
   saveBtn: {
      textTransform: "none",
   },
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
