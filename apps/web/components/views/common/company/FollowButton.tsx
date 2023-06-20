import React, { FC, useMemo } from "react"
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
import Link from "../Link"
import { useFirestoreDocument } from "../../../custom-hook/utils/useFirestoreDocument"
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
} & Omit<ButtonProps, "onClick">
const AuthedFollowButton: FC<Props> = ({ group, disabled, ...buttonProps }) => {
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
         id={"follow-button"}
         loading={isMutating || status === "loading"}
         disabled={isMutating || disabled || status === "loading"}
         onClick={handleClick}
         startIcon={
            companyFollowedData ? (
               <FollowedIcon fontSize={"small"} />
            ) : (
               <FollowIcon fontSize={"small"} />
            )
         }
         {...buttonProps}
         variant={companyFollowedData ? "outlined" : "contained"}
      >
         {companyFollowedData ? "Following" : "Follow"}
      </LoadingButton>
   )
}

const NonAuthedFollowButton: FC<ButtonProps> = ({ ...buttonProps }) => {
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
         <Button
            {...buttonProps}
            variant="contained"
            data-testid="non-authed-follow-button"
         >
            Follow
         </Button>
      </Link>
   )
}

const FollowButton: FC<Props> = ({ group, ...buttonProps }) => {
   const { isLoggedIn, isLoadingAuth } = useAuth()

   const mergedProps = useMemo(
      () => Object.assign({}, defaultButtonProps, buttonProps),
      [buttonProps]
   )

   if (isLoadingAuth) {
      return null
   }

   if (isLoggedIn) {
      return <AuthedFollowButton group={group} {...mergedProps} />
   }
   return <NonAuthedFollowButton {...mergedProps} />
}

const defaultButtonProps: ButtonProps = {
   sx: {
      fontSize: {
         xs: "0.75rem",
         md: "0.875rem",
      },
   },
   variant: "contained",
   size: "small",
}

export default FollowButton
