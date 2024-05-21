import { LivestreamPresentation } from "@careerfairy/shared-lib/livestreams"
import { Box, Button, Stack, Typography } from "@mui/material"
import FileUploader, {
   FileUploaderProps,
} from "components/views/common/FileUploader"
import DividerWithText from "components/views/common/misc/DividerWithText"
import { Dispatch, Fragment, SetStateAction, forwardRef } from "react"
import { sxStyles } from "types/commonTypes"
import { SelectablePDFDetails } from "./PDFDetails"

const styles = sxStyles({
   root: {
      p: 3,
      display: "flex",
      transition: (theme) => theme.transitions.create("background-color"),
      width: "100%",
      cursor: "pointer",
      borderRadius: "8px",
      border: (theme) => `1px solid ${theme.brand.purple[100]}`,
      bgcolor: (theme) => theme.brand.white[300],
      overflow: "hidden",
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
   browseButton: {
      mt: 2.5,
   },
})

type Props = {
   dragActive: boolean
   pdfPresentation: LivestreamPresentation
   setReadyToShare: Dispatch<SetStateAction<boolean>>
   readyToShare: boolean
} & FileUploaderProps

export const PDFUpload = forwardRef<HTMLDivElement, Props>(
   (
      { dragActive, pdfPresentation, setReadyToShare, readyToShare, ...props },
      ref
   ) => {
      return (
         <Stack alignItems="center" spacing={2}>
            <Box width="100%" ref={ref}>
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
                     <Stack alignItems="center">
                        <Typography
                           variant="medium"
                           marginBottom={1}
                           color="neutral.600"
                        >
                           Choose a file or drag & drop it here
                        </Typography>
                        <Typography
                           variant="xsmall"
                           textAlign="center"
                           color="neutral.400"
                           maxWidth={280}
                        >
                           Documents must be in PDF format (.pdf). Maximum size:
                           20MB.
                        </Typography>
                        <Button
                           sx={styles.browseButton}
                           color="grey"
                           variant="outlined"
                        >
                           Browse files
                        </Button>
                     </Stack>
                  </Stack>
               </FileUploader>
            </Box>
            {Boolean(pdfPresentation) && (
               <Fragment>
                  <DividerWithText
                     textPadding={1.25}
                     maxWidth={"100%"}
                     verticalPadding={0}
                  >
                     <Typography
                        variant="xsmall"
                        sx={{ textWrap: "nowrap" }}
                        color="neutral.400"
                     >
                        Or select your last uploaded file
                     </Typography>
                  </DividerWithText>
                  <SelectablePDFDetails
                     data={pdfPresentation}
                     isSelected={readyToShare}
                     onClick={() => setReadyToShare((prev) => !prev)}
                  />
               </Fragment>
            )}
         </Stack>
      )
   }
)

PDFUpload.displayName = "PDFUpload"
