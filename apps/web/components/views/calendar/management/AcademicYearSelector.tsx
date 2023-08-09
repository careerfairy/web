import React, { useContext } from "react"
import { Input, MenuItem } from "@mui/material"
import { Select } from "@mui/material"
import { FormControl } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { CalendarManagerContext } from "./TimelineCountriesManager"

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
   const { academicYear, setAcademicYear, academicYears } = useContext(
      CalendarManagerContext
   )

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
            inputProps={{ MenuProps: { sx: styles.selectList } }}
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

export default AcademicYearSelector
