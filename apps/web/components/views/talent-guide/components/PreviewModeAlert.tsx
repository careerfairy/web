import { alpha } from "@mui/material"
import Box from "@mui/material/Box"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      bgcolor: (theme) => alpha(theme.palette.warning.main, 0.95),
      color: "white",
      position: "fixed",
      top: 0,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 9999,
      py: 0.75,
      px: 2,
      borderRadius: "0 0 8px 8px",
      textAlign: "center",
      transition: "all 0.2s ease",
      display: "flex",
      alignItems: "center",
      gap: 1,
      fontSize: "0.875rem",
      boxShadow: 2,
      "&:hover": {
         bgcolor: (theme) => theme.palette.warning.main,
         transform: "translateX(-50%) translateY(2px)",
      },
   },
   text: {
      fontWeight: "bold",
   },
   bullet: {
      opacity: 0.9,
   },
})

export const PreviewModeAlert = () => {
   return (
      <Box component="a" href="/api/exit-preview" sx={styles.root}>
         <Box component="span" sx={styles.text}>
            Preview Mode Active
         </Box>
         <Box component="span" sx={styles.bullet}>
            •
         </Box>
         <Box component="span">Click to exit</Box>
      </Box>
   )
}
