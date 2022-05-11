import { useAuth } from "HOCs/AuthProvider"
import React from "react"
import UserAvatar, { UserAvatarProps } from "./UserAvatar"

type Props = Omit<UserAvatarProps, "data">
const LoggedInUserAvatar = (props: Props) => {
   const { userData } = useAuth()
   return <UserAvatar {...props} data={userData} />
}

export default LoggedInUserAvatar
