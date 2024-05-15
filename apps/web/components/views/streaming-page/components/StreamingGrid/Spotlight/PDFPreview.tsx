import { LivestreamPresentation } from "@careerfairy/shared-lib/livestreams"
import {
   Box,
   ButtonBase,
   Collapse,
   IconButton,
   LinearProgress,
   Stack,
   Typography,
   linearProgressClasses,
} from "@mui/material"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import { useMemo } from "react"
import { CheckCircle, X as DeleteIcon, File as FileIcon } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      p: 1.5,
      width: "100%",
      justifyContent: "flex-start",
      position: "relative",
   },
   iconWrapper: {
      borderRadius: "50%",
      background: (theme) => theme.brand.white[500],
      border: (theme) => `1px solid ${theme.palette.neutral[50]}`,
      width: 41,
      height: 41,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      "& svg": {
         color: "#7A7A8E",
         width: 25.625,
         height: 25.625,
      },
   },
   progress: {
      flex: 1,
      backgroundColor: (theme) => theme.brand.black[400],
      borderRadius: "6px",
      [`& .${linearProgressClasses.bar}`]: {
         borderRadius: "6px",
      },
   },
   uploadedText: {
      textAlign: "center",
      display: "flex",
      alignItems: "center",
   },
   checkCircle: {
      width: 14,
      height: 14,
      color: "success.700",
   },
   deleteButton: {
      position: "absolute",
      top: 0,
      right: 0,
      p: 0.8,
      "& button": {
         p: 0.2,
         m: -0.2,
      },
      "& svg": {
         width: 24,
         height: 24,
      },
   },
})

type Props = {
   data: LivestreamPresentation | File
   uploadProgress: number
   fileUpLoaded: boolean
}

export const PDFPreview = ({ data, uploadProgress, fileUpLoaded }: Props) => {
   const details = useMemo(() => getDetails(data), [data])

   return (
      <ButtonBase
         sx={styles.root}
         {...(uploadProgress < 0 && {
            href: details.downloadUrl,
            component: "a",
            target: "_blank",
         })}
      >
         <Stack width="100%" spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
               <Box sx={styles.iconWrapper}>
                  <FileIcon />
               </Box>
               <Stack alignItems="flex-start">
                  <Typography
                     variant="medium"
                     sx={getMaxLineStyles(1)}
                     color="neutral.700"
                  >
                     {details.fileName}
                  </Typography>
                  <Typography variant="xsmall" color="neutral.400">
                     {details.fileSize.toFixed(2)} MB
                  </Typography>
               </Stack>
            </Stack>
            <ProgressBar
               progress={uploadProgress}
               fileUpLoaded={fileUpLoaded}
            />
         </Stack>
         <Box sx={styles.deleteButton}>
            <IconButton>
               <DeleteIcon />
            </IconButton>
         </Box>
      </ButtonBase>
   )
}

type ProgressBarProps = {
   progress: number
   fileUpLoaded: boolean
}

const ProgressBar = ({ progress, fileUpLoaded }: ProgressBarProps) => {
   if (fileUpLoaded) {
      return (
         <Collapse unmountOnExit in={fileUpLoaded}>
            <Stack
               direction="row"
               alignItems="center"
               justifyContent="center"
               spacing={1}
            >
               <Box sx={styles.checkCircle} component={CheckCircle} />
               <Typography
                  sx={styles.uploadedText}
                  variant="xsmall"
                  color="neutral.700"
               >
                  File uploaded
               </Typography>
            </Stack>
         </Collapse>
      )
   }

   return (
      <Collapse unmountOnExit in={progress > 0}>
         <Stack direction="row" alignItems="center" spacing={2}>
            <LinearProgress
               sx={styles.progress}
               variant="determinate"
               value={progress}
            />
            <Typography variant="small" color="neutral.700">
               {progress}%
            </Typography>
         </Stack>
      </Collapse>
   )
}

const getDetails = (data: File | LivestreamPresentation) => {
   if (data instanceof File) {
      return {
         fileName: data.name,
         fileSize: data.size / 1024 / 1024,
         downloadUrl: URL.createObjectURL(data),
      }
   } else {
      return {
         fileName: data.fileName,
         fileSize: Number.isFinite(data.fileSize)
            ? data.fileSize / 1024 / 1024
            : 0,
         downloadUrl: data.downloadUrl,
      }
   }
}
