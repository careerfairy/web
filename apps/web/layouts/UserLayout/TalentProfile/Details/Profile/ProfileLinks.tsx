import { Box, Stack, Typography } from "@mui/material"
import { Link } from "react-feather"
import { EmptyItemView } from "./EmptyItemView"
import { ProfileItem } from "./ProfileItem"

import { ProfileLink } from "@careerfairy/shared-lib/users"
import { useAuth } from "HOCs/AuthProvider"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useIsMobile from "components/custom-hook/useIsMobile"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { useUserLinks } from "components/custom-hook/user/useUserLinks"
import CircularLogo from "components/views/common/logos/CircularLogo"
import { userRepo } from "data/RepositoryInstances"
import { Fragment, useCallback, useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import {
   TalentProfileItemTypes,
   closeCreateDialog,
   closeDeleteConfirmationDialog,
   openCreateDialog,
   openDeleteConfirmationDialog,
   setEditing,
} from "store/reducers/talentProfileReducer"
import {
   talentProfileCreateLinkOpenSelector,
   talentProfileEditingLinkOpenSelector,
   talentProfileIsDeleteLinkDialogSelector,
   talentProfileIsEditingLinkSelector,
} from "store/selectors/talentProfileSelectors"
import { sxStyles } from "types/commonTypes"
import { getIconUrl } from "util/CommonUtil"
import { ConfirmDeleteItemDialog } from "../ConfirmDeleteItemDialog"
import { ProfileItemCard } from "./ProfileItemCard"
import { BaseProfileDialog } from "./dialogs/BaseProfileDialog"
import { LinkFormFields, LinkFormProvider } from "./forms/LinksForm"
import { LinkFormValues, getInitialLinkValues } from "./forms/schemas"

const styles = sxStyles({
   emptyLinksRoot: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      p: "16px 12px",
      backgroundColor: (theme) => theme.brand.white[300],
      border: (theme) => `1px solid ${theme.brand.white[400]}`,
      borderRadius: "8px",
   },
   icon: {
      width: "36px",
      height: "36px",
   },
})

type Props = {
   hasItems?: boolean
}

export const ProfileLinks = ({ hasItems }: Props) => {
   const dispatch = useDispatch()

   const handleAdd = useCallback(() => {
      dispatch(openCreateDialog({ type: TalentProfileItemTypes.Link }))
   }, [dispatch])

   return (
      <ProfileItem hasItems={hasItems} title="Links" handleAdd={handleAdd}>
         <ProfileLinksDetails />
      </ProfileItem>
   )
}

const ProfileLinksDetails = () => {
   const linkToEdit = useSelector(talentProfileEditingLinkOpenSelector)

   return (
      <LinkFormProvider link={linkToEdit}>
         <FormDialogWrapper />
      </LinkFormProvider>
   )
}

const FormDialogWrapper = () => {
   const dispatch = useDispatch()
   const { userData } = useAuth()
   const { errorNotification, successNotification } = useSnackbarNotifications()

   const createLinkDialogOpen = useSelector(talentProfileCreateLinkOpenSelector)

   const isEditingLink = useSelector(talentProfileIsEditingLinkSelector)

   const {
      formState: { isValid },
      reset,
      handleSubmit,
   } = useFormContext()

   const handleCloseLinkDialog = useCallback(() => {
      dispatch(closeCreateDialog({ type: TalentProfileItemTypes.Link }))
      reset(getInitialLinkValues())
   }, [dispatch, reset])

   const onSubmit = async (data: LinkFormValues) => {
      try {
         handleCloseLinkDialog()

         const newLink: ProfileLink = {
            ...data,
            id: data?.id,
            authId: userData.authId,
         }

         if (!data?.id) {
            await userRepo.createUserLink(userData.id, newLink)
         } else {
            await userRepo.updateUserLink(userData.id, newLink)
         }

         successNotification(`${data.id ? "Updated" : "Added a new"} link 🔗`)
      } catch (error) {
         errorNotification(
            error,
            "We encountered a problem while adding your link. Rest assured, we're on it!"
         )
      }
   }

   const handleSave = async () => handleSubmit(onSubmit)()

   const saveText = isEditingLink ? "Save" : "Add"

   return (
      <Fragment>
         <LinksList />
         <BaseProfileDialog
            title="Links"
            open={createLinkDialogOpen}
            handleClose={handleCloseLinkDialog}
            handleSave={handleSave}
            saveDisabled={!isValid}
            saveText={saveText}
         >
            <SuspenseWithBoundary fallback={<LinkFormSkeleton />}>
               <LinkFormFields />
            </SuspenseWithBoundary>
         </BaseProfileDialog>
      </Fragment>
   )
}

const LinksList = () => {
   const { data: userLinks } = useUserLinks()
   const dispatch = useDispatch()

   const handleAdd = useCallback(() => {
      dispatch(openCreateDialog({ type: TalentProfileItemTypes.Link }))
   }, [dispatch])

   if (!userLinks?.length)
      return (
         <Box sx={styles.emptyLinksRoot}>
            <EmptyItemView
               title={"Share your links"}
               description={
                  "Add any relevant links to your profile, such as your GitHub, portfolio, or personal website."
               }
               addButtonText={"Add links"}
               handleAdd={handleAdd}
               icon={<Box component={Link} sx={styles.icon} />}
            />
         </Box>
      )

   return (
      <Stack spacing={1.5} width={"100%"}>
         {userLinks.map((link) => (
            <LinkCard key={link.id} link={link} />
         ))}
      </Stack>
   )
}

type LinkCardProps = {
   link: ProfileLink
}

const LinkCard = ({ link }: LinkCardProps) => {
   const { userData } = useAuth()
   const [isDeleting, setIsDeleting] = useState<boolean>(false)
   const [iconUrl, setIconUrl] = useState<string>("")
   const isConfirmDeleteDialogOpen = useSelector(
      talentProfileIsDeleteLinkDialogSelector
   )
   const dispatch = useDispatch()
   const { reset } = useFormContext()

   const setDeleteDialog = useCallback(
      (open: boolean) => {
         const arg = { type: TalentProfileItemTypes.Link }
         const action = open
            ? () => openDeleteConfirmationDialog(arg)
            : () => closeDeleteConfirmationDialog(arg)
         dispatch(action())
      },
      [dispatch]
   )

   const handleEdit = useCallback(() => {
      dispatch(
         setEditing({
            type: TalentProfileItemTypes.Link,
            data: link,
         })
      )
      reset(link)
   }, [dispatch, link, reset])

   const handleDelete = useCallback(async () => {
      setIsDeleting(true)

      await userRepo.deleteStudyBackground(userData.id, link.id)

      setIsDeleting(false)
      setDeleteDialog(false)
   }, [link, userData.id, setDeleteDialog])

   useEffect(() => {
      const fetchIcon = async () => {
         const fetchedIconUrl = await getIconUrl(link.url)
         setIconUrl(fetchedIconUrl)
      }

      fetchIcon()
   }, [link.url])

   return (
      <Fragment>
         <ConfirmDeleteItemDialog
            open={isConfirmDeleteDialogOpen}
            title="Delete link?"
            description="Are you sure you want to delete your link?"
            handleDelete={handleDelete}
            isDeleting={isDeleting}
            onClose={() => setDeleteDialog(false)}
         />
         <ProfileItemCard
            dataTypeId={"link"}
            data={link}
            editText={"Edit link"}
            deleteText={"Delete link"}
            handleEdit={handleEdit}
            handleDelete={() => setDeleteDialog(true)}
         >
            <CircularLogo
               src={iconUrl || "/fallback-icon.png"}
               alt={`${link.title} icon`}
            />
            <Stack>
               <Typography>{link.title}</Typography>
               <Stack>
                  <Typography>{link.url}</Typography>
               </Stack>
            </Stack>
         </ProfileItemCard>
      </Fragment>
   )
}

const LinkFormSkeleton = () => {
   const isMobile = useIsMobile()

   return <Stack spacing={2} minWidth={isMobile ? "300px" : "500px"}></Stack>
}
