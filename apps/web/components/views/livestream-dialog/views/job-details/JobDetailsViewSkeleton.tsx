import BaseDialogView, { HeroContent, MainContent } from "../../BaseDialogView"
import Box from "@mui/material/Box"
import { JobHeaderSkeleton } from "./main-content/JobHeader"
import Stack from "@mui/material/Stack"
import { JobDescriptionSkeleton } from "./main-content/JobDescription"

const JobDetailsViewSkeleton = () => {
   return (
      <BaseDialogView
         heroContent={
            <HeroContent>
               <Box height={185} />
            </HeroContent>
         }
         mainContent={
            <MainContent>
               <Stack spacing={2}>
                  <JobHeaderSkeleton />
                  <JobDescriptionSkeleton />
               </Stack>
            </MainContent>
         }
      />
   )
}

export default JobDetailsViewSkeleton
