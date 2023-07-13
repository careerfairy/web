import { Avatar, ListItemIcon, ListItemText, MenuItem } from "@mui/material"
import Image from "next/image"
import React, { FC } from "react"
import BrandedTextField, {
   type BrandedTextFieldProps,
} from "../inputs/BrandedTextField"
import AddRoundedIcon from "@mui/icons-material/AddRounded"
import { Divider } from "@mui/material"
import { Creator } from "@careerfairy/shared-lib/groups/creators"

type Props = {
   onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
   onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
   value?: string
   creators: Creator[]
} & BrandedTextFieldProps

const SelectCreatorDropDown: FC<Props> = (props) => {
   return (
      <BrandedTextField
         id="creator-select"
         select
         label="Search, select or create a new creator"
         fullWidth
         {...props}
      >
         <CreatorMenuItem
            key={"999"}
            value={"999"}
            primaryText={"Create a new creator"}
            icon={<AddRoundedIcon />}
         />
         <Divider />
         {props.creators.map((option) => (
            <CreatorMenuItem
               key={option.id}
               value={option.id}
               primaryText={`${option.firstName} ${option.lastName}`}
               secondaryText={option.position}
               avatarUrl={option.avatarUrl}
            />
         ))}
      </BrandedTextField>
   )
}

type CreatorMenuItemProps = {
   primaryText: string
   secondaryText?: string
   avatarUrl?: string
   icon?: React.ReactNode
   value: string
}

const CreatorMenuItem: FC<CreatorMenuItemProps> = ({
   primaryText,
   secondaryText,
   avatarUrl,
   icon,
   value,
}) => {
   const hasAvatar = avatarUrl || icon
   return (
      <MenuItem
         sx={{
            p: 2,
         }}
         value={value}
      >
         {hasAvatar ? (
            <ListItemIcon
               sx={{
                  mr: 1,
               }}
            >
               <Avatar>
                  {avatarUrl ? (
                     <Image
                        width={40}
                        height={40}
                        src={avatarUrl}
                        alt="avatar"
                     />
                  ) : (
                     icon
                  )}
               </Avatar>
            </ListItemIcon>
         ) : null}
         <ListItemText primary={primaryText} secondary={secondaryText} />
      </MenuItem>
   )
}

export default SelectCreatorDropDown
