import Avatar, { AvatarProps } from "@mui/material/Avatar"
import { useMemo } from "react"
import { stringAvatar } from "../../../util/CommonUtil"

/**
 * Avatar that shows the user Initials if there is no image
 * The background color is set by the initials hash
 *
 * @param firstName
 * @param lastName
 * @param imageUrl
 * @constructor
 */

interface ColorizedAvatarProps extends AvatarProps {
   firstName: string
   lastName: string
   imageUrl?: string
}
const ColorizedAvatar = ({
   firstName,
   lastName,
   imageUrl,
   sx,
   ...rest
}: ColorizedAvatarProps) => {
   let name = ""
   if (firstName) {
      name += firstName.charAt(0)
   }

   if (lastName) {
      name += ` ${lastName.charAt(0)}`
   }
   const avaProps = useMemo(() => stringAvatar(firstName, lastName), [name])

   return (
      <Avatar
         sx={[avaProps.sx, ...(Array.isArray(sx) ? sx : [sx])]}
         {...rest}
         children={avaProps.children}
         alt={`${firstName || ""} ${lastName || ""}`}
         src={imageUrl}
      />
   )
}

export default ColorizedAvatar
