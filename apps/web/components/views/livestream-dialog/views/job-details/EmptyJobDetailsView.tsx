import React, { FC } from "react"
import BaseDialogView, { MainContent } from "../../BaseDialogView"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { GoBackButton } from "./main-content/JobCTAButton"
import { sxStyles } from "../../../../../types/commonTypes"
import Box from "@mui/material/Box"
import Image from "next/image"

const EmptyJobDetailsView: FC = () => {
   return (
      <BaseDialogView
         mainContent={
            <MainContent>
               <Stack sx={{ mt: 3 }} spacing={3}>
                  <Typography variant="h4" textAlign="center" fontWeight="bold">
                     Job not found
                  </Typography>
                  <Box textAlign="center">
                     <Image
                        src="/illustrations/empty.svg"
                        width="600"
                        height="200"
                        alt="Empty search illustration"
                     />
                  </Box>
                  <Typography
                     variant="h6"
                     color="text.secondary"
                     textAlign="center"
                  >
                     The job you are looking for does not exist. It may have
                     been deleted or deleted or the link you followed may be
                     broken.
                  </Typography>
               </Stack>
            </MainContent>
         }
         fixedBottomContent={<GoBackButton />}
      />
   )
}

export default EmptyJobDetailsView
