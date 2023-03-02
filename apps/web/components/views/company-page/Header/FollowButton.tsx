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
}
const AuthedFollowButton: FC<Props> = ({ group }) => {
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
            companyFollowedData ? (
               <FollowedIcon fontSize={"small"} />
            ) : (
               <FollowIcon fontSize={"small"} />
            )
         }
         {...buttonProps}
      >
         {companyFollowedData ? "Followed" : "Follow"}
      </LoadingButton>
   )
}

const NonAuthedFollowButton = () => {
   const { asPath } = useRouter()

   return (
      <Link
         href={{
            pathname: "/signup",
            query: {
               absolutePath: asPath,
            },
         }}
      >
         <Button {...buttonProps}>Follow</Button>
      </Link>
   )
}

const FollowButton: FC<Props> = ({ group }) => {
   const { isLoggedIn } = useAuth()

   if (isLoggedIn) {
      return <AuthedFollowButton group={group} />
   }
   return <NonAuthedFollowButton />
}

const buttonProps: ButtonProps = {
   sx: {
      fontSize: {
         xs: "0.75rem",
         md: "0.875rem",
      },
   },
   variant: "contained",
   size: "small",
   color: "primary",
}

export default FollowButton
