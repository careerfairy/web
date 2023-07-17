import { Creator } from "@careerfairy/shared-lib/groups/creators"
import AddRoundedIcon from "@mui/icons-material/AddRounded"
import {
   Avatar,
   Divider,
   ListItemIcon,
   ListItemText,
   MenuItem,
} from "@mui/material"
import { useField } from "formik"
import Image from "next/image"
import React, { FC, useCallback } from "react"
import { sxStyles } from "types/commonTypes"
import BrandedTextField, {
   type BrandedTextFieldProps,
} from "../inputs/BrandedTextField"

export const addNewCreatorId = "add-new-creator"

const styles = sxStyles({
   menuItem: {
      p: 2,
   },
   listicon: {
      mr: 1,
   },
   addNewCreatorAvatar: {
      bgcolor: "#EFEFEF",
      color: "#9E9E9E",
      "& svg": {
         width: 24,
         height: 24,
      },
   },
})

type SelectCreatorDropDownProps = BrandedTextFieldProps & {
   creators: Creator[]
   submitForm?: () => void
   onClickAddNewCreator?: () => void
}

const SelectCreatorDropDown: FC<SelectCreatorDropDownProps> = ({
   creators,
   submitForm,
   onClickAddNewCreator,
   name,
   ...props
}) => {
   const [field, meta, helpers] = useField<string>(name)

   const handleChange = useCallback(
      async (event: React.ChangeEvent<HTMLInputElement>) => {
         const newValue = event.target.value

         // Use Formik's setFieldValue to change value
         // Second parameter to setFieldValue is 'shouldValidate', if true it triggers a validation
         await helpers.setValue(newValue)

         submitForm?.()
      },
      [helpers, submitForm]
   )

   return (
      <BrandedTextField
         id="creator-select"
         select
         fullWidth
         {...field}
         {...props}
         onChange={handleChange}
         error={meta.touched ? Boolean(meta.error) : null}
         helperText={meta.touched ? meta.error : null}
         InputLabelProps={{
            shrink: false,
         }}
      >
         <MenuItem
            value={addNewCreatorId}
            key={addNewCreatorId}
            sx={styles.menuItem}
         >
            <ListItemIcon sx={styles.listicon}>
               <Avatar sx={styles.addNewCreatorAvatar}>
                  <AddRoundedIcon />
               </Avatar>
            </ListItemIcon>
            <ListItemText primary={"Create a new creator"} />
         </MenuItem>
         {creators.length ? <Divider /> : null}
         {creators.map(renderCreatorMenuItem)}
      </BrandedTextField>
   )
}

const renderCreatorMenuItem = (creator: Creator) => {
   return (
      <MenuItem key={creator.id} sx={styles.menuItem} value={creator.id}>
         <ListItemIcon sx={styles.listicon}>
            <Avatar>
               <Image
                  width={40}
                  height={40}
                  src={creator.avatarUrl}
                  alt="avatar"
               />
            </Avatar>
         </ListItemIcon>
         <ListItemText
            primary={`${creator.firstName} ${creator.lastName}`}
            secondary={creator.position}
         />
      </MenuItem>
   )
}

export default SelectCreatorDropDown
