import Avatar, { AvatarProps } from "@mui/material/Avatar"
import { useMemo } from "react"

function stringToColor(string: string) {
   let hash = 0
   let i

   /* eslint-disable no-bitwise */
   for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash)
   }

   let color = "#"

   for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff
      color += `00${value.toString(16)}`.slice(-2)
   }
   /* eslint-enable no-bitwise */

   return color
}

function stringAvatar(name: string) {
   const initials = name
      .split(" ")
      .map((word) => word[0])
      .join("")

   return {
      sx: {
         bgcolor: stringToColor(name),
      },
      children: initials,
   }
}

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
   const avaProps = useMemo(() => stringAvatar(name), [name])

   return (
      <Avatar
         sx={[avaProps.sx, ...(Array.isArray(sx) ? sx : [sx])]}
         {...rest}
         children={avaProps.children}
         alt={name}
         src={imageUrl}
      />
   )
}

export default ColorizedAvatar
