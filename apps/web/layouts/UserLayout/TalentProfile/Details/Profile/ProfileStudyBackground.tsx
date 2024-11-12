import { Box, Button, Stack, Typography } from "@mui/material"
import { SchoolIcon } from "components/views/common/icons/SchoolIcon"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   title: {
      fontWeight: 600,
      color: (theme) => theme.palette.neutral[900],
   },
   emptyStudies: {
      p: "16px 12px",
      backgroundColor: (theme) => theme.brand.white[300],
      border: (theme) => `1px solid ${theme.brand.white[400]}`,
      borderRadius: "8px",
   },
   emptyDetailsRoot: {
      alignItems: "center",
      width: {
         xs: "280px",
         sm: "280px",
         md: "390px",
      },
   },
   emptyTitle: {
      fontWeight: 600,
      textAlign: "center",
   },
   emptyDescription: {
      fontWeight: 400,
      textAlign: "center",
   },
   addButton: {
      p: "8px 16px",
   },
   schoolIcon: {
      width: "36px",
      height: "36px",
   },
})
export const ProfileStudyBackground = () => {
   return (
      <Stack spacing={1.5}>
         <Typography variant="brandedBody" sx={styles.title}>
            Study background
         </Typography>
         <EmptyStudyBackground />
      </Stack>
   )
}

const EmptyStudyBackground = () => {
   return (
      <Box
         sx={styles.emptyStudies}
         display={"flex"}
         flexDirection="column"
         alignItems={"center"}
         justifyContent={"center"}
      >
         <Stack alignItems={"center"} spacing={2}>
            <Box color={"primary.main"}>
               <SchoolIcon sx={styles.schoolIcon} />
            </Box>
            <Stack spacing={2} sx={styles.emptyDetailsRoot}>
               <Stack alignItems={"center"}>
                  <Typography
                     sx={styles.emptyTitle}
                     color="neutral.800"
                     variant="brandedBody"
                  >
                     What did you study?
                  </Typography>
                  <Typography
                     sx={styles.emptyDescription}
                     color={"neutral.700"}
                     variant="small"
                  >
                     Share your formal education background with us, including
                     the school, programme, and field of study.
                  </Typography>
               </Stack>
               <Button
                  variant="contained"
                  color="primary"
                  sx={styles.addButton}
               >
                  Add study background
               </Button>
            </Stack>
         </Stack>
      </Box>
   )
}
