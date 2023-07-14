import { Creator } from "@careerfairy/shared-lib/groups/creators"
import AddRoundedIcon from "@mui/icons-material/AddRounded"
import {
   Avatar,
   Divider,
   ListItemIcon,
   ListItemText,
   MenuItem,
} from "@mui/material"
import { FieldProps } from "formik"
import Image from "next/image"
import React, { FC, useCallback } from "react"
import { sxStyles } from "types/commonTypes"
import BrandedTextField from "../inputs/BrandedTextField"

export const addNewCreatorId = "add-new-creator"

const styles = sxStyles({
   menuItem: {
      p: 2,
   },
   listicon: {
      mr: 1,
   },
})

type SelectCreatorDropDownProps = {
   creators: Creator[]
   submitForm?: () => void
   onClickAddNewCreator?: () => void
} & FieldProps<
   string,
   {
      creatorId: string
   }
>

const SelectCreatorDropDown: FC<SelectCreatorDropDownProps> = ({
   field,
   form,
   creators,
   submitForm,
   onClickAddNewCreator,
   ...props
}) => {
   const handleChange = useCallback(
      async (event: React.ChangeEvent<HTMLInputElement>) => {
         const newValue = event.target.value

         // Use Formik's setFieldValue to change value
         // Second parameter to setFieldValue is 'shouldValidate', if true it triggers a validation
         // @ts-ignore
         await form.setFieldValue(field.name, newValue, false)

         submitForm?.()
      },
      [field, form, submitForm]
   )

   return (
      <BrandedTextField
         id="creator-select"
         select
         fullWidth
         {...field}
         {...props}
         onChange={handleChange}
      >
         <MenuItem
            value={addNewCreatorId}
            key={addNewCreatorId}
            sx={styles.menuItem}
         >
            <ListItemIcon sx={styles.listicon}>
               <Avatar>
                  <AddRoundedIcon />
               </Avatar>
            </ListItemIcon>
            <ListItemText primary={"Create a new creator"} />
         </MenuItem>
         <Divider />
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
