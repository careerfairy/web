import React from "react"
import makeStyles from "@mui/styles/makeStyles"
import { Chip, TextField } from "@mui/material"
import Autocomplete from "@mui/material/Autocomplete"

const useStyles = makeStyles((theme) => ({
   root: {
      paddingBottom: 0,
      paddingTop: 14,
   },
   card: {
      // padding: "1em",
      overflow: "auto",
   },
   actions: {
      display: "flex",
      flexFlow: "column",
   },
}))
const GroupCategorySelect = ({
   group,
   handleSetGroupCategories,
   targetCategories,
   isSubmitting,
}) => {
   const handleMultiSelect = (event, selectedOptions) => {
      const optionIdsArray = selectedOptions.map((option) => option.id)
      handleSetGroupCategories(group.groupId, optionIdsArray)
   }

   const handleValue = () => {
      if (
         targetCategories[group.groupId] &&
         targetCategories[group.groupId].length
      ) {
         let selectedOptions = []
         targetCategories[group.groupId].forEach((optionId) => {
            const targetOption = group.flattenedOptions.find(
               (flatOption) => flatOption.id === optionId
            )
            if (targetOption) {
               selectedOptions.push(targetOption)
            }
         })
         return selectedOptions
      } else {
         return []
      }
   }

   const label = group.flattenedOptions.length
      ? `Specify target audiences for ${group.universityName}`
      : `${group.universityName} has no options`

   return (
      <Autocomplete
         id="groupIds"
         name="groupIds"
         multiple
         value={handleValue()}
         disabled={!group.flattenedOptions.length || isSubmitting}
         options={group.flattenedOptions || []}
         onChange={handleMultiSelect}
         getOptionLabel={(option) => option.name}
         renderInput={(params) => (
            <TextField
               {...params}
               variant="outlined"
               label={label}
               placeholder="Add another option"
            />
         )}
         renderTags={(value, getTagProps) =>
            value.map((option, index) => (
               <Chip
                  key={option.id}
                  variant="outlined"
                  label={option.name}
                  {...getTagProps({ index })}
               />
            ))
         }
      />
   )
}

export default GroupCategorySelect
