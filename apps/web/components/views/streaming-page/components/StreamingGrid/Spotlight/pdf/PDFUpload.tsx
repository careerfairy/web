import { Box, Button, Stack, Typography } from "@mui/material"
import FileUploader, {
   FileUploaderProps,
} from "components/views/common/FileUploader"
import DividerWithText from "components/views/common/misc/DividerWithText"
import { forwardRef } from "react"
import { Upload } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      px: 1.75,
      py: 2,
      display: "flex",
      transition: (theme) => theme.transitions.create("background-color"),
      width: "100%",
      cursor: "pointer",
   },
   active: {
      backgroundColor: "neutral.100",
   },
   icon: {
      color: "neutral.400",
      width: 31,
      height: 31,
   },
   content: {
      width: "100%",
   },
})

type Props = {
   dragActive: boolean
} & FileUploaderProps

export const PDFUpload = forwardRef<HTMLDivElement, Props>(
   ({ dragActive, ...props }, ref) => {
      return (
         <Box ref={ref}>
            <FileUploader
               sx={[styles.root, dragActive && styles.active]}
               {...props}
            >
               <Stack
                  sx={styles.content}
                  spacing={3}
                  justifyContent="center"
                  alignItems="center"
               >
                  <Stack alignItems="center" spacing={2}>
                     <Box sx={styles.icon} component={Upload} />
                     <Stack spacing={1.5} alignItems="center">
                        <Typography variant="small" color="neutral.600">
                           Drop your file here
                        </Typography>
                        <DividerWithText
                           textPadding={1.25}
                           maxWidth={94}
                           verticalPadding={0}
                        >
                           <Typography variant="xsmall" color="neutral.400">
                              Or
                           </Typography>
                        </DividerWithText>
                        <Button color="primary" variant="contained">
                           Browse files
                        </Button>
                     </Stack>
                  </Stack>
                  <Typography
                     variant="xsmall"
                     textAlign="center"
                     color="neutral.400"
                  >
                     Documents must be in PDF format (.pdf). Maximum size: 20MB.
                  </Typography>
               </Stack>
            </FileUploader>
         </Box>
      )
   }
)

PDFUpload.displayName = "PDFUpload"
