import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import BaseDialogView, {
   MainContent,
} from "components/views/livestream-dialog/BaseDialogView"
import Image from "next/image"
import { FC } from "react"

type EmptyJobDetailsViewProps = {
   title: string
   description: string
}

export const CustomJobNotFoundView: FC<EmptyJobDetailsViewProps> = ({
   description,
   title,
}) => {
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
      />
   )
}
