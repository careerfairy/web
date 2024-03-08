import React, { useCallback, useMemo } from "react"
import {
   Avatar,
   Divider,
   ListItemIcon,
   ListItemText,
   MenuItem,
   Stack,
   Typography,
} from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { LivestreamCreator } from "../questions/commons"
import AddRoundedIcon from "@mui/icons-material/AddRounded"
import { useLivestreamFormValues } from "../../useLivestreamFormValues"
import CreatorAvatar from "components/views/sparks/components/CreatorAvatar"
import BaseStyles from "components/views/admin/company-information/BaseStyles"
import { FormBrandedAutocomplete } from "components/views/common/inputs/BrandedAutocomplete"

const styles = sxStyles({
   menuItem: {
      p: 2,
   },
   listIcon: {
      mr: 1,
   },
   addNewAvatar: {
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
   handleCreateNew: () => void
   options: LivestreamCreator[]
   values?: LivestreamCreator[]
}

const SelectSpeakersDropDown = ({
   fieldId,
   label,
   placeholder,
   options,
   handleCreateNew,
   values,
}: Props) => {
   const { setFieldValue, isSubmitting } = useLivestreamFormValues()

   const renderCreateNewCreatorOption = useMemo(
      () => (
         <>
            <MenuItem sx={styles.menuItem} onMouseDown={handleCreateNew}>
               <ListItemIcon sx={styles.listIcon}>
                  <Avatar sx={styles.addNewAvatar}>
                     <AddRoundedIcon />
                  </Avatar>
               </ListItemIcon>
               <ListItemText primary={"Create a new contributor"} />
            </MenuItem>
            {options?.length ? <Divider /> : null}
         </>
      ),
      [handleCreateNew, options?.length]
   )

   const onChangeHandler = async (_, selectedOptions: LivestreamCreator[]) => {
      await setFieldValue(fieldId, selectedOptions)
   }

   const getOptionElement = useCallback(
      (speaker: LivestreamCreator) => (
         <Stack direction="row" padding="16px" gap="8px" width="100%">
            <CreatorAvatar
               creator={{
                  firstName: speaker.firstName,
                  lastName: speaker.lastName,
                  avatarUrl: speaker.avatarUrl,
               }}
               size={48}
            />
            <Stack direction="column" alignContent="center">
               <Typography fontSize="16px" lineHeight="24px">
                  {`${speaker.firstName} ${speaker.lastName}`}
               </Typography>
               {Boolean(speaker.position || speaker.email) && (
                  <Stack spacing={2} direction={"row"}>
                     {Boolean(speaker.position) && (
                        <Typography
                           fontSize="14px"
                           fontWeight={300}
                           lineHeight="24px"
                        >
                           {speaker.position}
                        </Typography>
                     )}

                     {Boolean(speaker.position && speaker.email) && (
                        <Divider orientation="vertical" flexItem />
                     )}

                     {Boolean(speaker.email) && (
                        <Typography
                           fontSize="14px"
                           fontWeight={300}
                           lineHeight="24px"
                           sx={[styles.optionInfo, styles.ellipsis]}
                        >
                           {speaker.email}
                        </Typography>
                     )}
                  </Stack>
               )}
            </Stack>
         </Stack>
      ),
      []
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
         initialOptionSection={renderCreateNewCreatorOption}
         getOptionElement={getOptionElement}
         disabled={isSubmitting}
         limit={5}
      />
   )
}

const getLabelFn = (value: LivestreamCreator) => {
   return `${value.firstName} ${value.lastName}`
}

const isOptionEqualToValue = (
   option: LivestreamCreator,
   value: LivestreamCreator
): boolean => option.id === value.id

export default SelectSpeakersDropDown
