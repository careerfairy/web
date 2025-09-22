import { Box } from "@mui/material"
import { renderMultiSectionDigitalClockTimeView } from "@mui/x-date-pickers"
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker"
import useIsMobile from "components/custom-hook/useIsMobile"
import { FormBrandedTextField } from "components/views/common/inputs/BrandedTextField"
import { useField } from "formik"
import { useRef } from "react"
import { sxStyles } from "types/commonTypes"

const FIELD_NAME = "general.startDate"

const styles = sxStyles({
   datePickerDesktop: (theme) => ({
      ".MuiButton-text": {
         color: `${theme.palette.secondary.main} !important`,
      },
      ".MuiButton-text:hover, .MuiPickersDay-root:hover, .MuiPickersDay-root:focus":
         {
            backgroundColor: "rgb(137 42 186 / 4%) !important",
         },
      ".Mui-selected": {
         backgroundColor: `${theme.palette.secondary.main} !important`,
      },
      ".Mui-selected:hover": {
         backgroundColor: `${theme.palette.secondary.dark} !important`,
      },
      ".Mui-selected:focus": {
         backgroundColor: `${theme.palette.secondary.main} !important`,
      },
      ".MuiDigitalClock-item:hover": {
         backgroundColor: "rgb(137 42 186 / 4%) !important",
      },
   }),
   datePickerMobile: (theme) => ({
      "&.MuiPickersLayout-root": {
         display: "block",
      },
      ".MuiTab-root.Mui-selected": {
         color: `${theme.palette.secondary.main}`,
      },
      ".MuiTabs-indicator": {
         backgroundColor: `${theme.palette.secondary.main} !important`,
      },
      ".MuiPickersDay-root:hover, .MuiPickersDay-root:focus": {
         backgroundColor: "rgb(137 42 186 / 4%) !important",
      },
      ".MuiPickersDay-root.Mui-selected, .MuiPickersYear-yearButton.Mui-selected":
         {
            backgroundColor: `${theme.palette.secondary.main} !important`,
         },
      ".MuiDialogActions-root": {
         ".MuiButton-text": {
            color: `${theme.palette.secondary.main}`,
         },
      },
      ".MuiMultiSectionDigitalClock-root": {
         justifyContent: "center",
         ".Mui-selected": {
            backgroundColor: `${theme.palette.secondary.main} !important`,
         },
         ".MuiMenuItem-root": {
            fontSize: "1.1rem",
            fontWeight: 600,
         },
         ".Mui-disabled": {
            color: `${theme.palette.secondary.light}`,
         },
      },
      ".MuiClock-root": {
         ".MuiClock-pin, .MuiClockPointer-root, .MuiClockPointer-thumb": {
            borderColor: `${theme.palette.secondary.main} !important`,
            backgroundColor: `${theme.palette.secondary.main} !important`,
         },
      },
   }),
   icon: {
      svg: {
         color: (theme) => theme.palette.secondary.main,
      },
   },
})

type CustomInputFieldProps = {
   fieldName: string
}

const CustomInputField = (params, { fieldName }: CustomInputFieldProps) => {
   const [{ onBlur }, ,] = useField(fieldName)

   return (
      <FormBrandedTextField
         {...params}
         name={fieldName}
         type="text"
         fullWidth
         sx={styles.icon}
         placeholder="Insert date"
         requiredText="(required)"
         onBlur={async () => {
            await onBlur({ target: { name: fieldName } })
         }}
      />
   )
}

type StartDateTimePickerProps = {
   fieldName?: string
   label?: string
   toolbarTitle?: string
}

const StartDateTimePicker = ({
   fieldName = FIELD_NAME,
   label = "Start date",
   toolbarTitle = "Select live stream start date",
}: StartDateTimePickerProps) => {
   const isMobile = useIsMobile()
   const [field, , helpers] = useField(fieldName)
   const anchorRef = useRef<HTMLDivElement>(null)

   const layoutStyles = isMobile
      ? styles.datePickerMobile
      : styles.datePickerDesktop

   return (
      <Box ref={anchorRef}>
         <DateTimePicker
            name={fieldName}
            label={label}
            localeText={isMobile ? { toolbarTitle } : null}
            disablePast
            ampm={false}
            openTo="day"
            viewRenderers={{
               // @ts-ignore
               hours: renderMultiSectionDigitalClockTimeView,
               // @ts-ignore
               minutes: renderMultiSectionDigitalClockTimeView,
            }}
            format={"dd/MM/yyyy HH:mm"}
            slotProps={{
               layout: {
                  sx: layoutStyles,
               },
               popper: {
                  anchorEl: anchorRef.current,
                  placement: "bottom-start",
                  modifiers: [
                     {
                        name: "preventOverflow",
                        enabled: true,
                        options: {
                           boundary: "viewport",
                        },
                     },
                  ],
               },
            }}
            slots={{
               textField: (params) =>
                  CustomInputField(
                     { ...params, ref: anchorRef },
                     { fieldName }
                  ),
            }}
            value={field.value}
            onChange={async (newValue) => {
               await helpers.setValue(newValue)
            }}
         />
      </Box>
   )
}

export default StartDateTimePicker
