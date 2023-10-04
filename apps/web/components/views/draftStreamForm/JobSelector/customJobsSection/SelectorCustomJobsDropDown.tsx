import { PublicCustomJob } from "@careerfairy/shared-lib/groups/customJobs"
import MultiListSelect from "../../../common/MultiListSelect"
import React, { useMemo } from "react"
import {
   Avatar,
   Divider,
   ListItemIcon,
   ListItemText,
   MenuItem,
   Paper,
   Typography,
} from "@mui/material"
import AddRoundedIcon from "@mui/icons-material/AddRounded"
import { sxStyles } from "../../../../../types/commonTypes"

const styles = sxStyles({
   menuItem: {
      p: 2,
   },
   listIcon: {
      mr: 1,
   },
   addNewJobAvatar: {
      bgcolor: "#EFEFEF",
      color: "#9E9E9E",
      "& svg": {
         width: 24,
         height: 24,
      },
   },
   avatar: {
      width: 40,
      height: 40,
   },
})

type Props = {
   name: string
   label: string
   placeholder: string
   jobs: PublicCustomJob[]
   handleChange: (name: string, value: PublicCustomJob[]) => void
   handleOpenCreateJobForm: () => void
   values?: PublicCustomJob[]
   disabled: boolean
   isNewJobFormOpen: boolean
}

const SelectorCustomJobsDropDown = ({
   name,
   label,
   placeholder,
   disabled,
   jobs,
   handleChange,
   handleOpenCreateJobForm,
   values,
   isNewJobFormOpen,
}: Props) => {
   const renderCreateNewJobOption = useMemo(
      () => (
         <MenuItem sx={styles.menuItem} onMouseDown={handleOpenCreateJobForm}>
            <ListItemIcon sx={styles.listIcon}>
               <Avatar sx={styles.addNewJobAvatar}>
                  <AddRoundedIcon />
               </Avatar>
            </ListItemIcon>
            <ListItemText primary={"Create a new job opening"} />
         </MenuItem>
      ),
      [handleOpenCreateJobForm]
   )

   return (
      <MultiListSelect
         inputName={name}
         selectedItems={values.length === 0 ? [] : values}
         setFieldValue={handleChange}
         allValues={jobs}
         isCheckbox={true}
         inputProps={{
            label: label,
            placeholder: placeholder,
         }}
         chipProps={{
            variant: "contained",
            color: "secondary",
         }}
         getValueFn={getValueFn}
         getLabelFn={getLabelFn}
         getListLabelFn={getListLabelFn}
         checkboxColor="secondary"
         disabled={disabled}
         extraOptions={{
            PaperComponent: ({ children }) => (
               <Paper>
                  {isNewJobFormOpen ? null : renderCreateNewJobOption}
                  {jobs.length ? <Divider /> : null}
                  {children}
               </Paper>
            ),
            isOptionEqualToValue: (
               option: PublicCustomJob,
               value: PublicCustomJob
            ) => option.id === value.id,
         }}
      />
   )
}

const getListLabelFn = (option: PublicCustomJob) => (
   <Typography key={`${option.id}-label`}>{option.title}</Typography>
)

const getValueFn = (value: any) => {
   return value
}

const getLabelFn = (value: PublicCustomJob) => {
   return value.title
}

export default SelectorCustomJobsDropDown
