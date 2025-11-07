import {
   BusinessFunctionsTagValues,
   ContentTopicsTagValues,
} from "@careerfairy/shared-lib/constants/tags"
import { Box, Stack, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import FileUploader, {
   FileUploaderProps,
} from "components/views/common/FileUploader"
import { Option } from "components/views/common/inputs/ControlledBrandedAutoComplete"
import { ControlledBrandedMultiChip } from "components/views/common/inputs/ControlledBrandedMultiChip"
import { ControlledBrandedTextField } from "components/views/common/inputs/ControlledBrandedTextField"
import { Plus } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   container: {
      display: "flex",
      flexDirection: "column",
      gap: 1.5,
      width: "100%",
   },
   label: {
      color: "neutral.800",
      fontWeight: 600,
   },
   imagesContainer: {
      display: "flex",
      gap: 1.5,
      width: "100%",
   },
   previewImage: {
      width: { xs: "auto", md: "230px" },
      height: { xs: "auto", md: "129px" },
      maxHeight: { xs: "95px", md: "none" },
      aspectRatio: "230/129",
      borderRadius: "8px",
      objectFit: "cover",
      flexShrink: 0,
   },
   uploadArea: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 0.375,
      width: { xs: "auto", md: "230px" },
      maxWidth: { xs: "none", md: "230px" },
      height: { xs: "100%", md: "129px" },
      aspectRatio: "230/129",
      backgroundColor: (theme) => theme.brand.white[500],
      border: (theme) => `1px solid ${theme.palette.neutral[50]}`,
      borderRadius: "8px",
      flexShrink: 0,
      cursor: "pointer",
   },
   plusIcon: {
      width: "34px",
      height: "34px",
      color: "neutral.700",
      "& svg": {
         width: "100%",
         height: "100%",
      },
   },
   uploadText: {
      color: "neutral.700",
      textAlign: "center",
   },
   categoriesContainer: {
      display: "flex",
      flexDirection: "column",
      gap: 1.5,
      width: "100%",
   },
   categoriesTitle: {
      color: "neutral.800",
      fontWeight: 600,
   },
   categoriesDropdownContainer: {
      display: "flex",
      flexDirection: "column",
      gap: 1,
      width: "100%",
   },
})

export const RecordingFormFields = () => {
   return (
      <Stack spacing={1}>
         <ControlledBrandedTextField
            name="title"
            label="Recording title"
            fullWidth
         />
         <ControlledBrandedTextField
            name="summary"
            label="Recording description"
            multiline
            rows={8}
            fullWidth
         />
      </Stack>
   )
}

type RecordingBannerFieldsProps = {
   backgroundImageUrl?: string
   fileUploaderProps: FileUploaderProps
}

export const RecordingBannerFields = ({
   backgroundImageUrl,
   fileUploaderProps,
}: RecordingBannerFieldsProps) => {
   const isMobile = useIsMobile()
   return (
      <Box sx={styles.container}>
         <Typography
            variant={isMobile ? "medium" : "brandedH5"}
            sx={styles.label}
         >
            Banner image
         </Typography>
         <Box sx={styles.imagesContainer}>
            {backgroundImageUrl ? (
               <Box
                  component="img"
                  src={backgroundImageUrl}
                  alt="Banner preview"
                  sx={styles.previewImage}
               />
            ) : (
               <Box
                  sx={[
                     styles.previewImage,
                     {
                        backgroundColor: (theme) => theme.palette.grey[300],
                     },
                  ]}
               />
            )}
            <FileUploader {...fileUploaderProps}>
               <Box sx={styles.uploadArea}>
                  <Box sx={styles.plusIcon}>
                     <Plus />
                  </Box>
                  <Typography variant="xsmall" sx={styles.uploadText}>
                     Upload new banner
                  </Typography>
               </Box>
            </FileUploader>
         </Box>
      </Box>
   )
}

export const RecordingCategoriesFields = () => {
   const isMobile = useIsMobile()
   // Convert GroupOption format (id, name) to Option format (id, value) for autocomplete
   const contentTopicsOptions: Option[] = ContentTopicsTagValues.map((tag) => ({
      id: tag.id,
      value: tag.name,
   }))

   const businessFunctionsOptions: Option[] = BusinessFunctionsTagValues.map(
      (tag) => ({
         id: tag.id,
         value: tag.name,
      })
   )

   return (
      <Box sx={styles.categoriesContainer}>
         <Typography
            variant={isMobile ? "medium" : "brandedH5"}
            sx={styles.categoriesTitle}
         >
            Recording categories
         </Typography>
         <Box sx={styles.categoriesDropdownContainer}>
            <ControlledBrandedMultiChip
               name="contentTopics"
               options={contentTopicsOptions}
               label="Live stream content topics"
               matchId
               required
            />
            <ControlledBrandedMultiChip
               name="businessFunctions"
               options={businessFunctionsOptions}
               label="Presented business functions"
               matchId
               required
            />
         </Box>
      </Box>
   )
}
