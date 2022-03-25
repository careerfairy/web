import PropTypes from "prop-types"
import React from "react"
import AddIcon from "@mui/icons-material/AddSharp"
import { Button } from "@mui/material"
import CategoryAddModal from "./CategoryAddModal"

const AddOrRemoveCategoryButton = ({ disabled, ...props }) => {
   const [open, setOpen] = React.useState(false)
   const handleClose = () => setOpen(false)
   const handleOpen = () => setOpen(true)

   return (
      <React.Fragment>
         <Button
            onClick={handleOpen}
            variant="contained"
            disabled={disabled}
            color="primary"
            startIcon={<AddIcon />}
         >
            Add or remove categories
         </Button>
         <CategoryAddModal handleClose={handleClose} {...props} open={open} />
      </React.Fragment>
   )
}

AddOrRemoveCategoryButton.propTypes = {
   filterOptions: PropTypes.arrayOf(
      PropTypes.shape({
         categoryId: PropTypes.string,
         targetOptionIds: PropTypes.arrayOf(PropTypes.string),
      })
   ).isRequired,
   disabled: PropTypes.bool,
   groupCategories: PropTypes.arrayOf(
      PropTypes.shape({
         id: PropTypes.string,
         name: PropTypes.string,
      })
   ).isRequired,
}
export default AddOrRemoveCategoryButton
