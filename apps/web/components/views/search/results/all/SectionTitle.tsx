import { Box, Typography } from "@mui/material"
import { sxStyles } from "types/commonTypes"
const styles = sxStyles({
   sectionHeader: {
      display: "flex",
      alignItems: "center",
   },
   sectionTitle: {
      fontWeight: 600,
      color: "text.primary",
   },
})

export const SectionTitle = ({ title }: { title: string }) => {
   return (
      <Box sx={styles.sectionHeader} id={`${title}-section`}>
         <Typography variant="brandedH4" sx={styles.sectionTitle}>
            {title}
         </Typography>
      </Box>
   )
}
