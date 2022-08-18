import PropTypes from "prop-types"
import React, { useState } from "react"
import * as actions from "../../../../../store/actions"
import { useTheme } from "@mui/material/styles"
import {
   Card,
   CardActions,
   CardHeader,
   TextField,
   Typography,
} from "@mui/material"
import { useDispatch, useSelector } from "react-redux"
import { DynamicColorButton } from "../../../../../materialUI/GlobalButtons/GlobalButtons"
import SaveIcon from "@mui/icons-material/Save"
import DeleteIcon from "@mui/icons-material/DeleteForever"
import SearchIcon from "@mui/icons-material/Search"
import AddDatasetIcon from "@mui/icons-material/PostAdd"
import DataSetDrawer from "./DataSetDrawer"

const Toolbar = ({ loading }) => {
   const {
      palette: { primary, secondary, error, navyBlue },
   } = useTheme()
   const dispatch = useDispatch()
   const currentFilterGroup = useSelector((state) => state.currentFilterGroup)
   const handleDeleteCurrentFilterGroup = () =>
      dispatch(actions.deleteFilterGroup())
   const handleSaveCurrentFilterGroup = () =>
      dispatch(actions.saveCurrentFilterGroup())
   const handleCreateNewFilterGroup = () =>
      dispatch(actions.createFilterGroup())
   const totalCount = useSelector(
      (state) => state.currentFilterGroup.data.totalStudentsData.count
   )
   const filteredCount = useSelector(
      (state) => state.currentFilterGroup.data.filteredStudentsData.count
   )
   const [datasetDrawerOpen, setDatasetDrawerOpen] = useState(false)
   const currentFilterGroupLabel = useSelector(
      (state) => state.currentFilterGroup.data.label || ""
   )
   const labelError = useSelector(
      (state) => state.currentFilterGroup.errors.labelError
   )
   const handleOpenDataSetDrawer = () => setDatasetDrawerOpen(true)
   const handleCloseDataSetDrawer = () => setDatasetDrawerOpen(false)
   const handleChange = (event) => {
      const value = event.target.value
      dispatch(actions.handleChangeFilterLabel(value))
   }

   const isEmpty =
      !currentFilterGroup.data.label &&
      !currentFilterGroup.data.filters.length &&
      !currentFilterGroup.data.id

   const buttons = [
      {
         disabled: isEmpty,
         label: "Save Current Dataset",
         onClick: () => handleSaveCurrentFilterGroup(),
         startIcon: <SaveIcon />,
         hide: false,
         color: primary.main,
      },
      {
         disabled: false,
         label: "Choose Another Dataset",
         onClick: () => handleOpenDataSetDrawer(),
         startIcon: <SearchIcon />,
         hide: false,
         color: secondary.main,
      },
      {
         disabled: false,
         label: "Create a new Dataset",
         onClick: () => handleCreateNewFilterGroup(),
         startIcon: <AddDatasetIcon />,
         hide: !currentFilterGroup.data?.id,
         color: navyBlue.main,
      },
      {
         disabled: false,
         label: "Delete Current Dataset",
         onClick: () => handleDeleteCurrentFilterGroup(),
         startIcon: <DeleteIcon />,
         hide: !currentFilterGroup.data?.id,
         color: error.main,
      },
   ].filter(({ hide }) => !hide)

   return (
      <Card>
         <CardHeader
            title={
               totalCount ? (
                  <React.Fragment>
                     {filteredCount && (
                        <Typography variant="h4">
                           Filtered Users {filteredCount}
                        </Typography>
                     )}
                     <Typography color="textSecondary" variant="h5">
                        Total users: {totalCount}
                     </Typography>
                  </React.Fragment>
               ) : (
                  "Make a query"
               )
            }
            subheader={
               <TextField
                  label="Label"
                  onChange={handleChange}
                  placeholder="please provide a label"
                  value={currentFilterGroupLabel}
                  variant="outlined"
                  error={Boolean(labelError)}
                  helperText={labelError && <span>This field is required</span>}
                  margin="dense"
               />
            }
         />
         <CardActions>
            {buttons.map(
               ({ startIcon, onClick, disabled, label, color }, index) => (
                  <DynamicColorButton
                     key={label}
                     disabled={loading || disabled}
                     startIcon={startIcon}
                     size="large"
                     variant="contained"
                     onClick={onClick}
                     color={color}
                  >
                     {label}
                  </DynamicColorButton>
               )
            )}
            <DataSetDrawer
               open={datasetDrawerOpen}
               onClose={handleCloseDataSetDrawer}
            />
         </CardActions>
      </Card>
   )
}

Toolbar.propTypes = {
   loading: PropTypes.bool.isRequired,
}

export default Toolbar
