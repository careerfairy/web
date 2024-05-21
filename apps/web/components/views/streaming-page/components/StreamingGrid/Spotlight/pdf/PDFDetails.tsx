import { LivestreamPresentation } from "@careerfairy/shared-lib/livestreams"
import {
   Box,
   ButtonBase,
   ButtonBaseProps,
   IconButton,
   Stack,
   Typography,
   Zoom,
} from "@mui/material"
import { forwardRef, useMemo } from "react"
import {
   Check,
   Trash2 as DeleteIcon,
   Eye as EyeIcon,
   File as FileIcon,
} from "react-feather"
import { sxStyles } from "types/commonTypes"
import { BrandedTooltip } from "../../../BrandedTooltip"
import { PDFDetailsSkeleton } from "./PDFDetailsSkeleton"
import { ProgressBar } from "./ProgressBar"

const styles = sxStyles({
   root: {
      p: 1.5,
      width: "100%",
      justifyContent: "space-between",
      position: "relative",
      borderRadius: "8px",
      border: (theme) => `1px solid ${theme.brand.purple[100]}`,
      bgcolor: (theme) => theme.brand.white[300],
      overflow: "hidden",
      transition: (theme) =>
         theme.transitions.create(["border"], {
            duration: 100,
         }),
   },
   selected: {
      border: (theme) => `1.5px solid ${theme.palette.primary.main}`,
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
   deleteButton: {
      "& button": {
         p: 0.5,
         m: -0.5,
      },
      "& svg": {
         width: 20,
         height: 20,
      },
   },
   fileNameWrapper: {
      display: "flex",
      alignItems: "baseline",
   },
   fileName: {
      wordBreak: "break-word",
      textAlign: "left",
   },
   viewIcon: {
      width: 16,
      height: 16,
      textDecoration: "none",
      color: "neutral.700",
      "& svg": {
         width: 16,
         height: 16,
      },
   },
   checkbox: {
      ml: 2,
      p: 0.375,
      width: 24,
      height: 24,
      bgcolor: "neutral.50",
      borderRadius: "4px",
      display: "flex",
      color: (theme) => theme.palette.common.white,
      justifyContent: "center",
      alignItems: "center",
      transition: (theme) =>
         theme.transitions.create(["background-color", "color"]),
   },
   selectedCheckbox: {
      bgcolor: (theme) => theme.palette.primary.main,
   },
})

const getDetails = (data: File | LivestreamPresentation) => {
   if (!data) {
      return null
   }
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

type PDFProgressProps = {
   data: LivestreamPresentation | File
   uploadProgress?: number
   fileUpLoaded?: boolean
   isDeleting: boolean
   handleDelete: () => void
}

export const PDFProgress = forwardRef<HTMLDivElement, PDFProgressProps>(
   ({ data, uploadProgress, fileUpLoaded, isDeleting, handleDelete }, ref) => {
      const details = useMemo(() => getDetails(data), [data])

      if (!details) {
         return <PDFDetailsSkeleton />
      }

      return (
         <Box ref={ref} sx={styles.root}>
            <Stack width="100%" spacing={1}>
               <Stack
                  direction="row"
                  spacing={1}
                  justifyContent="space-between"
               >
                  <PDFDetails data={data} />
                  <Box sx={styles.deleteButton}>
                     <IconButton onClick={handleDelete} disabled={isDeleting}>
                        <DeleteIcon />
                     </IconButton>
                  </Box>
               </Stack>
               {Boolean(uploadProgress) && (
                  <ProgressBar
                     progress={uploadProgress}
                     fileUpLoaded={fileUpLoaded}
                  />
               )}
            </Stack>
         </Box>
      )
   }
)

PDFProgress.displayName = "PDFProgress"

type SelectablePDFDetailsProps = {
   data: File | LivestreamPresentation
   isSelected: boolean
   onClick: ButtonBaseProps["onClick"]
}

export const SelectablePDFDetails = ({
   data,
   isSelected,
   onClick,
}: SelectablePDFDetailsProps) => {
   return (
      <ButtonBase
         sx={[styles.root, isSelected && styles.selected]}
         onClick={onClick}
      >
         <PDFDetails data={data} allowDownload />
         <CustomCheckbox isSelected={isSelected} />
      </ButtonBase>
   )
}

type CustomCheckboxProps = {
   isSelected: boolean
}

const CustomCheckbox = ({ isSelected }: CustomCheckboxProps) => {
   return (
      <Box sx={[styles.checkbox, isSelected && styles.selectedCheckbox]}>
         <Zoom in={isSelected}>
            <Check />
         </Zoom>
      </Box>
   )
}

type PDFDetailsProps = {
   data: File | LivestreamPresentation
   allowDownload?: boolean
}

const PDFDetails = ({ data, allowDownload }: PDFDetailsProps) => {
   const details = useMemo(() => getDetails(data), [data])

   if (!details) {
      return <PDFDetailsSkeleton />
   }

   return (
      <Stack direction="row" spacing={1}>
         <span>
            <Box sx={styles.iconWrapper}>
               <FileIcon />
            </Box>
         </span>
         <Stack alignItems="flex-start">
            <Stack
               direction="row"
               justifyContent="start"
               spacing={1}
               sx={styles.fileNameWrapper}
            >
               <Typography
                  variant="medium"
                  sx={styles.fileName}
                  color="neutral.700"
               >
                  {details.fileName}
               </Typography>
               {Boolean(allowDownload) && (
                  <Box
                     href={details.downloadUrl}
                     download={details.fileName}
                     sx={styles.viewIcon}
                     target="_blank"
                     component="a"
                  >
                     <BrandedTooltip title="View file">
                        <Box component={EyeIcon} />
                     </BrandedTooltip>
                  </Box>
               )}
            </Stack>
            <Typography variant="xsmall" color="neutral.400">
               {details.fileSize.toFixed(2)} MB
            </Typography>
         </Stack>
      </Stack>
   )
}
