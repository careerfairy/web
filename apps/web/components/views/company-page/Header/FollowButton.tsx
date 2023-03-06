import React, { FC } from "react"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { CompanyFollowed, UserData } from "@careerfairy/shared-lib/users"
import FollowIcon from "@mui/icons-material/AddRounded"
import useSWRMutation from "swr/mutation"
import { groupRepo } from "../../../../data/RepositoryInstances"
import { Group } from "@careerfairy/shared-lib/groups"
import useSnackbarNotifications from "../../../custom-hook/useSnackbarNotifications"
import LoadingButton from "@mui/lab/LoadingButton"
import FollowedIcon from "@mui/icons-material/CheckRounded"
import { Button, ButtonProps } from "@mui/material"
import { useRouter } from "next/router"
import Link from "../../common/Link"
import { useFirestoreDocument } from "../../../custom-hook/utils/useFirestoreDocument"
import { IColors } from "../../../../types/commonTypes"
import { useMountedState } from "react-use"

type Arguments = {
   arg: {
      userData: UserData
      group: Group
      type: "follow" | "unfollow"
   }
}
const toggleFollowCompany = (
   key: string,
   { arg: { userData, type, group } }: Arguments
) => {
   if (type === "follow") {
      return groupRepo
         .followCompany(userData, group)
         .then(() => "followed" as const)
   } else {
      return groupRepo
         .unfollowCompany(userData.id, group.id)
         .then(() => "unfollowed" as const)
   }
}

type Props = {
   group: Group
   color?: Exclude<IColors, "inherit" | "action" | "disabled">
   noIcon?: boolean
}
const AuthedFollowButton: FC<Props> = ({ group, color, noIcon }) => {
   const { userData, authenticatedUser } = useAuth()
   const { errorNotification, successNotification } = useSnackbarNotifications()

   const { trigger, isMutating } = useSWRMutation(
      `toggle-follow-company-${group.id}`,
      toggleFollowCompany,
      {
         onSuccess: (action) => {
            if (action === "followed") {
               successNotification(
                  `You are now following ${group.universityName}`
               )
            } else {
               successNotification("You have unfollowed this company")
            }
         },
         onError: (err) => {
            errorNotification(err.message)
         },
         throwOnError: false, // We don't want to throw an error, we want to handle it ourselves in the onError callback above
      }
   )

   const { data: companyFollowedData, status } =
      useFirestoreDocument<CompanyFollowed>(
         "userData",
         [authenticatedUser.email, "companiesUserFollows", group.id],
         {
            suspense: false,
            idField: "id",
         }
      )

   const handleClick = () => {
      if (authenticatedUser) {
         return trigger({
            userData,
            group,
            type: companyFollowedData ? "unfollow" : "follow",
         })
      }
   }

   return (
      <LoadingButton
         loading={isMutating || status === "loading"}
         disabled={isMutating || status === "loading"}
         onClick={handleClick}
         startIcon={
            noIcon ? null : companyFollowedData ? (
               <FollowedIcon fontSize={"small"} />
            ) : (
               <FollowIcon fontSize={"small"} />
            )
         }
         {...buttonProps(color)}
      >
         {companyFollowedData ? "Followed" : "Follow"}
      </LoadingButton>
   )
}

const NonAuthedFollowButton: FC<{
   color?: Exclude<IColors, "inherit" | "action" | "disabled">
}> = ({ color }) => {
   const { asPath } = useRouter()
   const isMounted = useMountedState()

   return (
      <Link
         href={{
            pathname: "/signup",
            query: {
               // To prevent a server mismatch error as hashes do not exist on serverside asPath
               absolutePath: isMounted() ? asPath : asPath.split("#", 1)[0],
            },
         }}
      >
         <Button {...buttonProps(color)}>Follow</Button>
      </Link>
   )
}

const FollowButton: FC<Props> = ({
   group,
   color = "primary",
   noIcon = false,
}) => {
   const { isLoggedIn } = useAuth()

   if (isLoggedIn) {
      return <AuthedFollowButton group={group} color={color} noIcon={noIcon} />
   }
   return <NonAuthedFollowButton color={color} />
}

const buttonProps = (
   color: Exclude<IColors, "inherit" | "action" | "disabled">
): ButtonProps => ({
   sx: {
      fontSize: {
         xs: "0.75rem",
         md: "0.875rem",
      },
   },
   variant: "contained",
   size: "small",
   color: color,
})

export default FollowButton
