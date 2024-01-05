import { Stack, Typography } from "@mui/material"
import { WarningIcon } from "./WarningIcon"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      height: "309px",
      marginTop: "-21px",
   },
   container: {
      width: {
         xs: "100%",
         md: "34%",
      },
      alignItems: "center",
      textAlign: "center",
   },
   icon: {
      fontSize: 48,
   },
   header: {
      color: "#7A7A8E",
      fontWeight: 600,
      fontSize: "1.425rem",
      lineHeight: "30px",
   },
   body: {
      color: "#9999B1",
      fontWeight: 400,
      fontSize: "1.15rem",
      lineHeight: "27px",
   },
})

const EmptyDataCheckerForMostSomething = () => {
   return (
      <Stack direction="row" sx={styles.root}>
         <Stack direction="column" spacing={3} sx={styles.container}>
            <WarningIcon sx={styles.icon} />
            <Typography sx={styles.header}>Not enough content yet</Typography>
            <Typography sx={styles.body}>
               More content is needed before displaying the top performing
               Sparks from your company.
            </Typography>
         </Stack>
      </Stack>
   )
}

export default EmptyDataCheckerForMostSomething
