import React, { useEffect, useState } from "react"
import { Autocomplete, Box, Chip, TextField } from "@mui/material"
import { convertArrayOfObjectsToDictionaryByProp } from "../../../../../data/util/AnalyticsUtil"

const styles = {
   inputWrapper: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      "& .MuiTextField-root": {
         minWidth: "300px",
         borderRadius: (theme) => theme.spacing(2),
      },
   },
}
const CategoryCard = ({ category, handleToggleActive }) => {
   const [optionsMap, setOptionsMap] = useState({})
   const [arrayOfOptionIds, setArrayOfOptionIds] = useState([])
   const [value, setValue] = useState([])

   useEffect(() => {
      handleSetActiveOptions()
      if (category?.options?.length) {
         const newOptionsMap = convertArrayOfObjectsToDictionaryByProp(
            category.options,
            "id"
         )
         setArrayOfOptionIds(category.options.map(({ id }) => id))
         setOptionsMap(newOptionsMap)
      }
   }, [category?.options])

   const handleSetActiveOptions = () => {
      const activeOptions =
         category?.options
            ?.filter((option) => option.active)
            .map((option) => option.id) || []
      setValue(activeOptions)
   }

   return (
      <Autocomplete
         multiple
         options={arrayOfOptionIds}
         value={value}
         onChange={(e, value) => handleToggleActive(value, category.id)}
         getOptionLabel={(option) => optionsMap[option]?.name}
         filterSelectedOptions
         renderInput={(params) => (
            <Box sx={styles.inputWrapper}>
               <TextField
                  {...params}
                  variant="standard"
                  label={category.name}
                  placeholder="Choose options"
               />
            </Box>
         )}
         renderTags={(value, getTagProps) =>
            value.map((option, index) => (
               <Chip
                  key={option}
                  label={optionsMap[option]?.name}
                  {...getTagProps({ index })}
               />
            ))
         }
      />
   )
}

export default CategoryCard
