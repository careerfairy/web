import React from "react"
import { Input, MenuItem } from "@mui/material"
import { Select } from "@mui/material"
import { FormControl } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { useCalendarManager } from "./TimelineCountriesManager"

const styles = sxStyles({
   select: {
      fontWeight: 900,
      fontSize: "20px",
   },
   selectList: {
      "& .Mui-selected": {
         backgroundColor: (theme) => theme.palette.grey.main + "!important",
         "& :hover": {
            backgroundColor: "grey.main",
         },
      },
   },
})

const AcademicYearSelector = () => {
   const { academicYear, setAcademicYear, academicYears } = useCalendarManager()

   const handleYearChange = (event) => {
      setAcademicYear(event.target.value)
   }

   return (
      <FormControl>
         <Select
            sx={styles.select}
            value={academicYear}
            input={<Input />}
            disableUnderline
            onChange={handleYearChange}
            inputProps={selectListCustomProps}
         >
            <MenuItem value={"previousYear"}>
               {academicYears.previousYear.name}
            </MenuItem>
            <MenuItem value={"currentYear"}>
               {academicYears.currentYear.name}
            </MenuItem>
            <MenuItem value={"nextYear"}>
               {academicYears.nextYear.name}
            </MenuItem>
         </Select>
      </FormControl>
   )
}

const selectListCustomProps = { MenuProps: { sx: styles.selectList } }

export default AcademicYearSelector
