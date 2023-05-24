import BaseDialogView, { HeroContent, MainContent } from "../../BaseDialogView"
import Box from "@mui/material/Box"
import { JobHeaderSkeleton } from "./main-content/JobHeader"
import Stack from "@mui/material/Stack"
import { JobDescriptionSkeleton } from "./main-content/JobDescription"

const JobDetailsViewSkeleton = () => {
   return (
      <BaseDialogView
         heroContent={
            <HeroContent noMinHeight>
               <Box
                  sx={{
                     height: {
                        xs: 100,
                        md: 185,
                     },
                  }}
               />
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
