import { Skeleton, Typography } from "@mui/material"
import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import { MentorDetailLayout } from "components/views/mentor-page/MentorDetailLayout"
import BaseDialogView, { HeroContent, MainContent } from "../../BaseDialogView"
import { useLiveStreamDialog } from "../../LivestreamDialog"

const SpeakerDetailsViewSkeleton = () => {
   const { goToView } = useLiveStreamDialog()

   return (
      <BaseDialogView
         heroContent={
            <HeroContent
               noMinHeight
               onBackClick={() => goToView("livestream-details")}
               onBackPosition={"top-left"}
            >
               <Box height="112px" />
            </HeroContent>
         }
         mainContent={
            <MainContent>
               <Stack spacing={3} mb={3}>
                  <MentorDetailLayout.HeaderSkeleton fullWidth />
                  <Stack spacing={2}>
                     <Typography variant="brandedH5" width={"150px"}>
                        <Skeleton />
                     </Typography>
                     <Typography>
                        <Skeleton />
                        <Skeleton />
                        <Skeleton />
                     </Typography>
                  </Stack>
               </Stack>
            </MainContent>
         }
      />
   )
}

export default SpeakerDetailsViewSkeleton
