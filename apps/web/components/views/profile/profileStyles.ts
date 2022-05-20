import { sxStyles } from "../../../types/commonTypes"

export const styles = sxStyles({
   box: {
      width: "100%", // Fix IE 11 issue.
      backgroundColor: "background.paper",
      // borderRadius: "5px",
      marginTop: "20px",
      borderRadius: 0.8,
      p: 2,
   },
   title: {
      color: "text.secondary",
      textTransform: "uppercase",
      fontSize: "1.8rem",
      marginBottom: "30px",
   },
   subtitle: {
      fontSize: "1rem",
   },
})
