import { Container, Grid } from "@mui/material"
import { Box } from "@mui/system"
import { memo } from "react"
import { sxStyles } from "types/commonTypes"
import { TalentPoolPageProvider } from "./TalentPoolPageProvider"
import TalentTable from "./users/TalentTable"

const styles = sxStyles({
   gridItem: {
      display: "flex",
   },
})

const AnalyticsTalentPoolPageContent = () => {
   // All necessary providers can be added here
   return (
      <TalentPoolPageProvider>
         <MemoizedPageContent />
      </TalentPoolPageProvider>
   )
}

const PageContent = () => {
   return (
      <Box py={2}>
         <Container maxWidth={false}>
            <Grid container spacing={spacing}>
               <Grid xs={12} item style={styles.gridItem}>
                  <TalentTable />
               </Grid>
            </Grid>
         </Container>
      </Box>
   )
}

const spacing = 3
const MemoizedPageContent = memo(PageContent)

export default AnalyticsTalentPoolPageContent
