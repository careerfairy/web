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
   loading?: boolean
}

const ColorizedAvatar = ({
   firstName,
   lastName,
   imageUrl,
   loading,
   sx,
   ...rest
}: ColorizedAvatarProps) => {
   const avaProps = useMemo(
      () => stringAvatar(firstName, lastName),
      [firstName, lastName]
   )

   return (
      <Avatar
         sx={[
            imageUrl ? null : avaProps.sx,
            ...(Array.isArray(sx) ? sx : [sx]),
         ]}
         {...rest}
         alt={loading ? "" : `${firstName || ""} ${lastName || ""}`}
         src={imageUrl}
      >
         {loading ? "" : avaProps.children}
      </Avatar>
   )
}

export default ColorizedAvatar
