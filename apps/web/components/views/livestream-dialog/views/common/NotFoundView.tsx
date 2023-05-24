import React, { FC } from "react"
import BaseDialogView, { MainContent } from "../../BaseDialogView"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import Image from "next/image"
import { useLiveStreamDialog } from "../../LivestreamDialog"
import Button from "@mui/material/Button"
import { sxStyles } from "../../../../../types/commonTypes"

const styles = sxStyles({
   btn: {
      boxShadow: "none",
      py: 0.75,
      px: 2.5,
      fontSize: "1.214rem",
      fontWeight: 400,
      textTransform: "none",
   },
   goBackBtn: {
      ml: "auto",
   },
})

type EmptyJobDetailsViewProps = {
   title: string
   description: string
}

const NotFoundView: FC<EmptyJobDetailsViewProps> = ({ description, title }) => {
   return (
      <BaseDialogView
         mainContent={
            <MainContent>
               <Stack sx={{ mt: 3 }} spacing={3}>
                  <Typography variant="h4" textAlign="center" fontWeight="bold">
                     {title}
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
                     {description}
                  </Typography>
               </Stack>
            </MainContent>
         }
         fixedBottomContent={<GoBackButton />}
      />
   )
}

export const GoBackButton: FC = () => {
   const { handleBack } = useLiveStreamDialog()

   return (
      <Button
         variant="contained"
         sx={[styles.goBackBtn, styles.btn]}
         onClick={handleBack}
         color="primary"
         disableElevation
         size="small"
      >
         Back
      </Button>
   )
}

export default NotFoundView
