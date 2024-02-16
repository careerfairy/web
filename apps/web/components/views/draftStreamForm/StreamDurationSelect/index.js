import React from "react"
import { useTheme } from "@mui/material/styles"
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material"
import useMediaQuery from "@mui/material/useMediaQuery"

const durations = [
   { minutes: 15, label: "15m" },
   { minutes: 30, label: "30m" },
   { minutes: 45, label: "45m" },
   {
      minutes: 60,
      label: "1h",
   },
   { minutes: 75, label: "1h15m" },
   { minutes: 90, label: "1h30m" },
   { minutes: 105, label: "1h45m" },
   {
      minutes: 120,
      label: "2h",
   },
   { minutes: 135, label: "2h15m" },
   { minutes: 150, label: "2h30m" },
   { minutes: 165, label: "2h45m" },
   {
      minutes: 180,
      label: "3h",
   },
]

//TODO add validation for min (15) and maximum(180) stream duration
const StreamDurationSelect = (props) => {
   const { disabled, label, setFieldValue, variant, value, fullWidth } = props
   const theme = useTheme()
   const mobile = useMediaQuery(theme.breakpoints.down("md"))

   return (
      <FormControl variant={variant} fullWidth={fullWidth} disabled={disabled}>
         <InputLabel id="duration-label">{label}</InputLabel>
         <Select
            labelId="duration-label"
            id="duration"
            name="duration"
            label={label}
            native={mobile}
            onChange={(event) => {
               const value = event.target.value
               setFieldValue("duration", Number(value))
            }}
            value={Number(value || 60)}
         >
            {durations.map((duration) =>
               mobile ? (
                  <option key={duration.minutes} value={duration.minutes}>
                     {duration.label}
                  </option>
               ) : (
                  <MenuItem key={duration.minutes} value={duration.minutes}>
                     {duration.label}
                  </MenuItem>
               )
            )}
         </Select>
      </FormControl>
   )
}

export default StreamDurationSelect
