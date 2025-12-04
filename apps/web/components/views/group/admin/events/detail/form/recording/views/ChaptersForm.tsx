import { yupResolver } from "@hookform/resolvers/yup"
import { LoadingButton } from "@mui/lab"
import { Box, Button } from "@mui/material"
import BrandedTextField from "components/views/common/inputs/BrandedTextField"
import { ControlledBrandedTextField } from "components/views/common/inputs/ControlledBrandedTextField"
import { useEffect, useState } from "react"
import { FormProvider, useForm, useFormContext } from "react-hook-form"
import { sxStyles } from "types/commonTypes"
import * as yup from "yup"

const styles = sxStyles({
   editForm: {
      border: "1px solid",
      borderColor: (theme) => theme.brand.white[500],
      borderRadius: "12px",
      p: 1,
      display: "flex",
      flexDirection: "column",
      gap: 1,
   },
   editFormFields: {
      display: "flex",
      flexDirection: "row",
      gap: 0.5,
      width: "100%",
      alignItems: "flex-start",
   },
   chapterNameField: {
      flexGrow: 1,
      minWidth: 0,
      flexBasis: 0,
      "& .MuiFilledInput-root": {
         backgroundColor: (theme) => theme.brand.white[300],
         borderColor: (theme) => theme.palette.secondary["100"],
      },
   },
   timeField: {
      width: "85px",
      flexShrink: 0,
      "& .MuiFilledInput-root": {
         backgroundColor: (theme) => theme.brand.white[300],
         borderColor: (theme) => theme.palette.secondary["100"],
      },
   },
   editFormActions: {
      display: "flex",
      flexDirection: "row",
      gap: 1,
      justifyContent: { xs: "center", md: "flex-end" },
      width: "100%",
   },
   cancelButton: {
      color: "neutral.600",
      px: 2,
      py: 1,
      borderRadius: "18px",
      flexGrow: { xs: 1, md: 0 },
      flexBasis: { xs: 0, md: "auto" },
      minWidth: { xs: 0, md: "auto" },
   },
   saveButton: {
      backgroundColor: "secondary.main",
      color: "white",
      px: 2,
      py: 1,
      borderRadius: "18px",
      flexGrow: { xs: 1, md: 0 },
      flexBasis: { xs: 0, md: "auto" },
      width: { xs: "auto", md: "82px" },
      minWidth: { xs: 0, md: "82px" },
      "&:hover": {
         backgroundColor: "secondary.dark",
      },
   },
})

const chapterFormSchema = yup.object({
   title: yup.string().required("Chapter name is required").trim(),
   startSec: yup
      .number()
      .typeError("Invalid format")
      .required("Start time is required"),
})

export type ChapterFormValues = yup.InferType<typeof chapterFormSchema>

type ChapterFormProps = {
   onCancel: () => void
   onSave: (data: ChapterFormValues) => void
   defaultValues?: ChapterFormValues
   isLoading?: boolean
}

/**
 * Converts seconds to time format (MM:SS or HH:MM:SS)
 */
export const formatSecondsToTime = (seconds: number): string => {
   const hours = Math.floor(seconds / 3600)
   const minutes = Math.floor((seconds % 3600) / 60)
   const secs = seconds % 60

   if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
         .toString()
         .padStart(2, "0")}`
   }

   return `${minutes}:${secs.toString().padStart(2, "0")}`
}

/**
 * Converts time format (MM:SS or HH:MM:SS) to seconds
 * Returns NaN for invalid time strings
 */
export const parseTimeToSeconds = (timeString: string): number => {
   const trimmed = timeString.trim()
   if (!trimmed) {
      return NaN
   }

   const parts = trimmed.split(":")
   if (parts.length < 2 || parts.length > 3) {
      return NaN
   }

   const numbers = parts.map(Number)
   if (numbers.some((n) => isNaN(n) || n < 0)) {
      return NaN
   }

   if (parts.length === 2) {
      // MM:SS format
      const [minutes, seconds] = numbers
      if (seconds >= 60) return NaN
      return minutes * 60 + seconds
   } else {
      // HH:MM:SS format
      const [hours, minutes, seconds] = numbers
      if (minutes >= 60 || seconds >= 60) return NaN
      return hours * 3600 + minutes * 60 + seconds
   }
}

const ChapterFormContent = ({
   onCancel,
   onSave,
   isLoading,
}: Omit<ChapterFormProps, "defaultValues">) => {
   const {
      handleSubmit,
      watch,
      setValue,
      formState: { errors, isValid },
   } = useFormContext<ChapterFormValues>()
   const startSec = watch("startSec")
   const [timeDisplay, setTimeDisplay] = useState(() =>
      formatSecondsToTime(startSec || 0)
   )

   useEffect(() => {
      if (!isNaN(startSec)) {
         setTimeDisplay(formatSecondsToTime(startSec))
      }
   }, [startSec])

   const handleTimeChange = (timeString: string) => {
      setTimeDisplay(timeString)
      const seconds = parseTimeToSeconds(timeString)
      setValue("startSec", seconds, { shouldValidate: true })
   }

   const timeError = errors.startSec?.message

   return (
      <Box sx={styles.editForm}>
         <Box sx={styles.editFormFields}>
            <ControlledBrandedTextField
               name="title"
               label="Chapter name"
               required
               InputLabelProps={{ required: false }}
               sx={styles.chapterNameField}
               placeholder="Add chapter title"
            />
            <BrandedTextField
               label="Time"
               required
               InputLabelProps={{ required: false }}
               value={timeDisplay}
               onChange={(e) => handleTimeChange(e.target.value)}
               sx={styles.timeField}
               error={Boolean(timeError)}
               helperText={timeError}
            />
         </Box>
         <Box sx={styles.editFormActions}>
            <Button
               variant="text"
               onClick={onCancel}
               sx={styles.cancelButton}
               disabled={isLoading}
            >
               Cancel
            </Button>
            <LoadingButton
               variant="contained"
               color="secondary"
               onClick={handleSubmit(onSave)}
               sx={styles.saveButton}
               loading={isLoading}
               disabled={!isValid || isLoading}
            >
               Save
            </LoadingButton>
         </Box>
      </Box>
   )
}

export const ChapterForm = ({
   onCancel,
   onSave,
   defaultValues,
   isLoading,
}: ChapterFormProps) => {
   const methods = useForm<ChapterFormValues>({
      defaultValues: defaultValues || {
         title: "",
         startSec: 0,
      },
      resolver: yupResolver(chapterFormSchema),
      mode: "onChange",
   })

   const hasDefaultValues = Boolean(defaultValues)
   const defaultTitle = defaultValues?.title
   const defaultStartSec = defaultValues?.startSec

   useEffect(() => {
      if (!hasDefaultValues) {
         return
      }

      methods.reset({
         title: defaultTitle ?? "",
         startSec: defaultStartSec ?? 0,
      })
   }, [defaultStartSec, defaultTitle, hasDefaultValues, methods])

   return (
      <FormProvider {...methods}>
         <ChapterFormContent
            onCancel={onCancel}
            onSave={onSave}
            isLoading={isLoading}
         />
      </FormProvider>
   )
}
