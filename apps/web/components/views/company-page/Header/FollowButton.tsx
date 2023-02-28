import React, { FC, useMemo } from "react"
import { useFirestore, useFirestoreDocData } from "reactfire"
import { doc } from "firebase/firestore"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
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

   const firestore = useFirestore()

   const followRef = useMemo(
      () =>
         doc(
            firestore,
            "userData",
            authenticatedUser.email,
            "companiesUserFollows",
            group.id
         ).withConverter(createGenericConverter<CompanyFollowed>()),
      [firestore, group.id, authenticatedUser.email]
   )

   const { data: companyFollowedData, status } = useFirestoreDocData(
      followRef,
      {
         idField: "id",
         suspense: false,
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
      <Button
         component={Link}
         // @ts-ignore
         href={{
            pathname: "/signup",
            query: {
               absolutePath: asPath,
            },
         }}
         {...buttonProps}
      >
         Follow
      </Button>
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
