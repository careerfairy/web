import PropTypes from "prop-types"
import React, { useEffect } from "react"
import {
   Button,
   Chip,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   TextField,
} from "@mui/material"
import { Autocomplete } from "@mui/material"
import { convertArrayOfObjectsToDictionaryByProp } from "../../../../../../../../data/util/AnalyticsUtil"
import * as actions from "../../../../../../../../store/actions"
import { useDispatch } from "react-redux"

const Content = ({ groupCategories, handleClose, filterOptions, groupId }) => {
   const dispatch = useDispatch()
   const [groupCategoriesMap, setGroupCategoriesMap] = React.useState({})

   useEffect(() => {
      if (groupCategories?.length) {
         setGroupCategoriesMap(
            convertArrayOfObjectsToDictionaryByProp(groupCategories, "id")
         )
      }
   }, [groupCategories])

   const handleChange = (value, groupId) => {
      dispatch(actions.setFilterOptions(value, groupId))
   }

   return (
      <React.Fragment>
         <DialogTitle>Add a Category</DialogTitle>
         <DialogContent>
            <Autocomplete
               multiple
               id="tags-outlined"
               options={groupCategories.map(({ id }) => id)}
               value={filterOptions.map(({ categoryId }) => categoryId)}
               onChange={(e, value) => handleChange(value, groupId)}
               getOptionLabel={(option) => groupCategoriesMap[option]?.name}
               defaultValue={filterOptions.map(({ categoryId }) => categoryId)}
               filterSelectedOptions
               renderInput={(params) => (
                  <TextField
                     {...params}
                     variant="outlined"
                     label={name}
                     placeholder="Choose options"
                  />
               )}
               renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                     <Chip
                        label={groupCategoriesMap[option]?.name}
                        {...getTagProps({ index })}
                     />
                  ))
               }
            />
         </DialogContent>
         <DialogActions>
            <Button onClick={handleClose}>Close</Button>
         </DialogActions>
      </React.Fragment>
   )
}

Content.propTypes = {
   handleClose: PropTypes.any,
   filterOptions: PropTypes.arrayOf(
      PropTypes.shape({
         categoryId: PropTypes.string,
         targetOptionIds: PropTypes.arrayOf(PropTypes.string),
      })
   ).isRequired,
   groupCategories: PropTypes.arrayOf(
      PropTypes.shape({
         id: PropTypes.string,
         name: PropTypes.string,
      })
   ).isRequired,
   groupId: PropTypes.string.isRequired,
}
const CategoryAddModal = ({ handleClose, open, ...props }) => {
   const onClose = () => {
      handleClose()
   }

   return (
      <Dialog maxWidth="md" fullWidth open={open} onClose={onClose}>
         <Content handleClose={onClose} {...props} />
      </Dialog>
   )
}

export default CategoryAddModal

CategoryAddModal.propTypes = {
   handleClose: PropTypes.func.isRequired,
   open: PropTypes.bool.isRequired,
}
