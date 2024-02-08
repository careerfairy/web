import { useField } from "formik"
import { sxStyles } from "types/commonTypes"
import useIsMobile from "components/custom-hook/useIsMobile"
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker"
import { renderMultiSectionDigitalClockTimeView } from "@mui/x-date-pickers"
import BrandedTextField from "components/views/common/inputs/BrandedTextField"

const styles = sxStyles({
   datePickerDesktop: (theme) => {
      return {
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
      }
   },
   datePickerMobile: (theme) => {
      return {
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
      }
   },
   icon: {
      svg: {
         color: (theme) => theme.palette.secondary.main,
      },
   },
})

const CustomInputField = (params) => (
   <BrandedTextField
      {...params}
      placeholder="Insert date"
      sx={styles.icon}
      fullWidth
   />
)

const StartDateTimePicker = () => {
   const fieldName = "general.startDate"

   const isMobile = useIsMobile()
   const [{ onBlur, ...field }, , helpers] = useField(fieldName)

   const layoutStyles = isMobile
      ? styles.datePickerMobile
      : styles.datePickerDesktop

   return (
      <DateTimePicker
         name={fieldName}
         label="Live Stream Start Date"
         localeText={
            isMobile ? { toolbarTitle: "Select live stream start date" } : null
         }
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
         }}
         slots={{
            textField: CustomInputField,
         }}
         value={field.value}
         onChange={async (newValue) => {
            await helpers.setValue(newValue)
            await onBlur({ target: { name: fieldName } })
         }}
      />
   )
}

export default StartDateTimePicker
