import { Container, Grid } from "@mui/material"
import { Box } from "@mui/system"
import { memo } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   gridItem: {
      display: "flex",
   },
})

const AnalyticsFeedbackPageContent = () => {
   // Providers can be added here
   return <MemoizedPageContent />
}

const PageContent = () => {
   return (
      <Box py={2}>
         <Container maxWidth={false}>
            <Grid container spacing={spacing}></Grid>
         </Container>
      </Box>
   )
}

const spacing = 3
const MemoizedPageContent = memo(PageContent)

export default AnalyticsFeedbackPageContent
