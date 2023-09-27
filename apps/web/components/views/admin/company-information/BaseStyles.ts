import { sxStyles } from "types/commonTypes"

export default sxStyles({
   section: {
      display: "flex",
      alignItems: "flex-start",
      gap: "16px",
      alignSelf: "stretch",
      paddingY: 2,
      fontFamily: "Poppins",
      flexDirection: "row",
      width: "-webkit-fill-available",
      ":child": {
         flexGrow: 1,
         flex: 1,
      },
      h3: {
         color: "#2C2C2C",
         fontSize: "24px",
         fontweight: "600",
      },
      h4: {
         color: "#2C2C2C",
         fontFamily: "Poppins",
         fontSize: "18px",
         fontWeight: 500,
      },
      p: {
         color: "#5F5F5F",
         fontSize: "16px",
         fontWeight: "400",
      },
      h5: {
         color: "#5F5F5F",
         fontSize: "16px",
         fontWeight: 400,
      },
      caption: {
         color: "#9999B1",
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
