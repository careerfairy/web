import { LivestreamPresentation } from "@careerfairy/shared-lib/livestreams"
import {
   Box,
   ButtonBase,
   LinearProgress,
   Stack,
   Typography,
} from "@mui/material"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import { useMemo } from "react"
import { File as FileIcon } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      p: 1.5,
      width: "100%",
      justifyContent: "flex-start",
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
})

type Props = {
   data: LivestreamPresentation | File
   uploadProgress: number
}

export const PDFPreview = ({ data, uploadProgress }: Props) => {
   const details = useMemo(() => getDetails(data), [data])

   return (
      <ButtonBase
         sx={styles.root}
         href={details.downloadUrl}
         component="a"
         target="_blank"
      >
         <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={styles.iconWrapper}>
               <FileIcon />
            </Box>
            <Stack>
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
            {Boolean(uploadProgress) && (
               <ProgressBar progress={uploadProgress} />
            )}
         </Stack>
      </ButtonBase>
   )
}

const ProgressBar = ({ progress }: { progress: number }) => {
   return (
      <Stack spacing={0.5}>
         <LinearProgress variant="determinate" value={progress} />
         <Typography variant="small" color="neutral.400">
            {progress}%
         </Typography>
      </Stack>
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
