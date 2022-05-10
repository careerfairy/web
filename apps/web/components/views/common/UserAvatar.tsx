import { SxProps } from "@mui/material"
import { DefaultTheme } from "@mui/styles"
import { useAuth } from "HOCs/AuthProvider"
import React, { useMemo } from "react"
import ColorizedAvatar from "./ColorizedAvatar"
import { StylesProps } from "../../../types/commonTypes"
import Link from "./Link"
import { UserData } from "@careerfairy/shared-lib/dist/users"

type stringSizes = "small" | "medium" | "large"
interface Props {
   sx?: SxProps<DefaultTheme>
   size?: stringSizes | number | string
   differentUserData?: UserData
}
const small = 30
const medium = 50
const large = 80
const fontMultiplier = 0.5
const styles: StylesProps = {
   small: {
      width: small,
      height: small,
      fontSize: small * fontMultiplier,
   },
   medium: {
      width: medium,
      height: medium,
      fontSize: medium * fontMultiplier,
   },
   large: {
      width: large,
      height: large,
      fontSize: large * fontMultiplier,
   },
}
const sizes: stringSizes[] = ["small", "medium", "large"]
interface UserDataProps {
   firstName: string
   lastName: string
   imageUrl: string
}
const UserAvatar = ({ sx, size, differentUserData }: Props) => {
   const { userData } = useAuth()
   const data = useMemo<UserDataProps>(
      () => ({
         firstName: differentUserData?.firstName || userData?.firstName,
         lastName: differentUserData?.lastName || userData?.lastName,
         // @ts-ignore
         imageUrl: differentUserData?.imageUrl || userData?.imageUrl,
      }),
      [differentUserData, userData]
   )

   return (
      <ColorizedAvatar
         sx={[
            size
               ? sizes.includes(size as stringSizes)
                  ? styles[size as stringSizes]
                  : {
                       width: size,
                       height: size,
                       fontSize: `calc(${
                          typeof size === "string" ? size : `${size}px`
                       } * ${fontMultiplier})`,
                    }
               : undefined,
            ...(Array.isArray(sx) ? sx : [sx]),
         ]}
         firstName={data?.firstName}
         lastName={data?.lastName}
         // imageUrl={userData?.avatarUrl}
         onClick={(e) => e.stopPropagation()}
         // @ts-ignore
         component={differentUserData ? undefined : Link}
         noLinkStyle
         href={differentUserData ? undefined : "/profile"}
         imageUrl="https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60"
      />
   )
}

export default UserAvatar
