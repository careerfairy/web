import {
   JobType,
   PublicCustomJob,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import React, { useCallback, useMemo } from "react"
import {
   Avatar,
   Box,
   Divider,
   ListItemIcon,
   ListItemText,
   MenuItem,
   Stack,
   Typography,
} from "@mui/material"
import AddRoundedIcon from "@mui/icons-material/AddRounded"
import { sxStyles } from "types/commonTypes"
import BaseStyles from "components/views/admin/company-information/BaseStyles"
import { FormBrandedAutocomplete } from "components/views/common/inputs/BrandedAutocomplete"
import { props } from "lodash/fp"
import { useLivestreamFormValues } from "../../../../useLivestreamFormValues"
import { useDispatch } from "react-redux"
import { openJobsDialog } from "store/reducers/adminJobsReducer"
import useIsMobile from "components/custom-hook/useIsMobile"

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
   input: {
      ".MuiInputBase-root": {
         paddingX: "12px",
      },
      input: {
         padding: "0 !important",
      },
   },
   optionElementContainer: {
      width: { xs: "85%", md: "100%" },
      padding: "16px",
   },
   optionTitle: {
      fontSize: { xs: "14px", md: "16px" },
      width: "600",
      fontWeight: "bold",
      marginBottom: 1,
   },
   optionInfo: {
      fontSize: { xs: "12px", md: "14px" },
   },
   ellipsis: {
      overflow: "hidden",
      textOverflow: "ellipsis",
   },
})

type Props = {
   fieldId: string
   label: string
   placeholder: string
   options: PublicCustomJob[]
   values?: PublicCustomJob[]
}

const SelectorCustomJobsDropDown = ({
   fieldId,
   label,
   placeholder,
   options,
   values,
}: Props) => {
   const { setFieldValue, isSubmitting } = useLivestreamFormValues()
   const dispatch = useDispatch()
   const isMobile = useIsMobile()

   const renderCreateNewJobOption = useMemo(
      () => (
         <>
            <MenuItem
               sx={styles.menuItem}
               onMouseDown={() => dispatch(openJobsDialog())}
            >
               <ListItemIcon sx={styles.listIcon}>
                  <Avatar sx={styles.addNewJobAvatar}>
                     <AddRoundedIcon />
                  </Avatar>
               </ListItemIcon>
               <ListItemText primary={"Create a new job opening"} />
            </MenuItem>
            {options?.length ? <Divider /> : null}
         </>
      ),
      [dispatch, options?.length]
   )

   const onChangeHandler = async (_, selectedOptions: PublicCustomJob[]) => {
      await setFieldValue(fieldId, selectedOptions)
   }

   const getOptionElement = useCallback(
      (job: PublicCustomJob) => (
         <Box sx={styles.optionElementContainer}>
            <Typography sx={styles.optionTitle}>{job.title}</Typography>

            <Stack spacing={2} direction={"row"}>
               <Typography sx={styles.optionInfo}>
                  {isMobile ? getMobileJobType(job.jobType) : job.jobType}
               </Typography>

               <Divider orientation="vertical" flexItem />

               <Typography sx={[styles.optionInfo, styles.ellipsis]}>
                  {job.postingUrl}
               </Typography>
            </Stack>
         </Box>
      ),
      [isMobile]
   )

   return (
      <FormBrandedAutocomplete
         name={fieldId}
         value={values}
         options={options}
         isOptionEqualToValue={isOptionEqualToValue}
         getOptionLabel={getLabelFn}
         sx={BaseStyles.chipInput}
         textFieldProps={{
            name: fieldId,
            label: label,
            fullWidth: true,
            placeholder: placeholder,
            sx: styles.input,
         }}
         onChange={onChangeHandler}
         multiple
         disableCloseOnSelect
         initialOptionSection={renderCreateNewJobOption}
         getOptionElement={getOptionElement}
         disabled={isSubmitting}
         limit={5}
         {...props}
      />
   )
}

const getLabelFn = (value: PublicCustomJob) => {
   return value.title
}

const isOptionEqualToValue = (
   option: PublicCustomJob,
   value: PublicCustomJob
): boolean => option.id === value.id

const getMobileJobType = (jobType: JobType): string => {
   if (jobType === "Graduate Programme") {
      return "Grad. Programme"
   }

   return jobType
}

export default SelectorCustomJobsDropDown
