import { Box, Grid, Stack } from "@mui/material"
import { ControlledBrandedTextField } from "components/views/common/inputs/ControlledBrandedTextField"
import { sxStyles } from "types/commonTypes"
import { RecordingPlayer } from "./RecordingPlayer"

const styles = sxStyles({
   container: {
      marginX: { xs: 1.5, md: 4 },
   },
   sectionContainer: {
      p: 1.5,
      borderRadius: 1.5,
      backgroundColor: (theme) => theme.brand.white[200],
   },
})

const RecordingForm = () => {
   return (
      <Box sx={styles.container}>
         <Stack rowGap={2}>
            <Grid
               container
               columnSpacing={2}
               rowSpacing={2}
               alignItems="flex-start"
            >
               <Grid item xs={12} md>
                  <Stack gap={1.5}>
                     <Box sx={styles.sectionContainer}>
                        <RecordingPlayer />
                     </Box>
                     <Box sx={styles.sectionContainer}>
                        <Stack spacing={1}>
                           <ControlledBrandedTextField
                              name="title"
                              label="Recording title"
                              fullWidth
                           />
                           <ControlledBrandedTextField
                              name="summary"
                              label="Recording description"
                              multiline
                              rows={8}
                              fullWidth
                           />
                        </Stack>
                     </Box>
                  </Stack>
               </Grid>
               <Grid item xs={12} md={4} lg={4} xl={3}>
                  <Box
                     sx={styles.sectionContainer}
                     // Placeholder for right side panel
                  />
               </Grid>
            </Grid>
         </Stack>
      </Box>
   )
}

export default RecordingForm
