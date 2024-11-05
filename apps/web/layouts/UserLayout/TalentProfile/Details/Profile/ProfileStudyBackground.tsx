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
   iconWrapper: {
      mb: 2,
   },
   emptyTitle: {
      fontWeight: 600,
   },
   emptyDescription: {
      fontWeight: 400,
      mb: 2,
   },
   addButton: {
      p: "8px 16px",
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

// const ProfileStudyBackgroundView = () => {
//     return (
//         <SuspenseWithBoundary fallback={<ProfileStudyBackgroundDetailsSkeleton />}>
//             <ProfileStudyBackgroundDetailsView />
//         </SuspenseWithBoundary>
//     )
// }

// const ProfileStudyBackgroundDetailsView = () => {
//     return (
//         <>
//         </>
//     )
// }
const EmptyStudyBackground = () => {
   return (
      <Box
         sx={styles.emptyStudies}
         display={"flex"}
         flexDirection="column"
         alignItems={"center"}
         justifyContent={"center"}
      >
         <Stack alignItems={"center"}>
            <Box color={"primary.main"} sx={styles.iconWrapper}>
               <SchoolIcon />
            </Box>
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
               Share your formal education background with us, including the
               school, program, and field of study.
            </Typography>
            <Button variant="contained" color="primary" sx={styles.addButton}>
               Add study background
            </Button>
         </Stack>
      </Box>
   )
}

// const ProfileStudyBackgroundDetailsSkeleton = () => {
//     return (
//         <>
//         </>
//     )
// }
