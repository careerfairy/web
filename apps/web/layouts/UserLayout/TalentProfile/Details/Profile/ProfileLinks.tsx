import { ProfileLink } from "@careerfairy/shared-lib/users"
import { getSubstringWithEllipsis } from "@careerfairy/shared-lib/utils"
import { Box, Button, Stack, Typography } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import useIsMobile from "components/custom-hook/useIsMobile"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { useUserLinks } from "components/custom-hook/user/useUserLinks"
import CircularLogo from "components/views/common/logos/CircularLogo"
import { userRepo } from "data/RepositoryInstances"
import Link from "next/link"
import normalizeUrl from "normalize-url"
import { Fragment, useCallback, useState } from "react"
import { ExternalLink, Link as FeatherLink } from "react-feather"
import { useFormContext } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import {
   TalentProfileItemTypes,
   closeCreateDialog,
   openCreateDialog,
   setEditing,
} from "store/reducers/talentProfileReducer"
import {
   talentProfileCreateLinkOpenSelector,
   talentProfileEditingLinkOpenSelector,
   talentProfileIsEditingLinkSelector,
} from "store/selectors/talentProfileSelectors"
import { sxStyles } from "types/commonTypes"
import { getIconUrl } from "util/CommonUtil"
import { ConfirmDeleteItemDialog } from "../ConfirmDeleteItemDialog"
import { EmptyItemView } from "./EmptyItemView"
import { ProfileItemCard } from "./ProfileItemCard"
import { ProfileSection } from "./ProfileSection"
import { BaseProfileDialog } from "./dialogs/BaseProfileDialog"
import { LinkFormFields, LinkFormProvider } from "./forms/LinksForm"
import {
   CreateLinkSchemaType,
   LinkFormValues,
   getInitialLinkValues,
} from "./forms/schemas"

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

   linkTitle: {
      fontWeight: 600,
      color: (theme) => theme.palette.neutral[800],
   },
   linkUrl: {
      fontWeight: 400,
      color: (theme) => theme.palette.neutral[600],
   },
   buttonLink: {
      p: 0,
      m: 0,
      color: "transparent",
      "&:hover": {
         backgroundColor: "unset",
      },
   },
   circularLogo: {
      mr: 1.5,
   },
})

type Props = {
   showAddIcon?: boolean
}

export const ProfileLinks = ({ showAddIcon }: Props) => {
   const dispatch = useDispatch()

   const handleAdd = useCallback(() => {
      dispatch(openCreateDialog({ type: TalentProfileItemTypes.Link }))
   }, [dispatch])

   return (
      <ProfileSection
         showAddIcon={showAddIcon}
         title="Links"
         handleAdd={handleAdd}
      >
         <ProfileLinksDetails />
      </ProfileSection>
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
      formState: { isValid, isSubmitting },
      reset,
      handleSubmit,
   } = useFormContext<CreateLinkSchemaType>()

   const handleCloseLinkDialog = useCallback(() => {
      dispatch(closeCreateDialog({ type: TalentProfileItemTypes.Link }))
      reset(getInitialLinkValues())
   }, [dispatch, reset])

   const onSubmit = async (data: LinkFormValues) => {
      try {
         const newLink: ProfileLink = {
            ...data,
            id: data?.id,
            url: normalizeUrl(data.url, { stripProtocol: true }),
            authId: userData.authId,
         }

         if (!data?.id) {
            await userRepo.createUserLink(userData.id, newLink)
         } else {
            await userRepo.updateUserLink(userData.id, newLink)
         }

         handleCloseLinkDialog()
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
            isSubmitting={isSubmitting}
            saveText={saveText}
         >
            <LinkFormFields />
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
               icon={<Box component={FeatherLink} sx={styles.icon} />}
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
   const { successNotification } = useSnackbarNotifications()
   const isMobile = useIsMobile()
   const isExtraSmall = useIsMobile(350)
   const { userData } = useAuth()
   const [isDeleting, setIsDeleting] = useState<boolean>(false)
   const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] =
      useState<boolean>(false)
   const dispatch = useDispatch()
   const { reset } = useFormContext<CreateLinkSchemaType>()

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

      await userRepo.deleteLink(userData.id, link.id)

      setIsDeleting(false)
      setIsConfirmDeleteDialogOpen(false)
      successNotification("Link deleted")
   }, [link, userData.id, successNotification])

   const linkUrlValue = normalizeUrl(
      getSubstringWithEllipsis(
         link.url,
         isMobile ? (isExtraSmall ? 20 : 30) : 80
      ),
      { stripProtocol: true }
   )

   const normalizedLink = normalizeUrl(link.url, { forceHttps: true })

   // Treat linkedin url's as an exception due to bad favicon quality
   const faviconSrc = isLinkedInUrl(normalizedLink)
      ? "/linkedin-favicon2.png"
      : getIconUrl(normalizedLink)

   return (
      <Fragment>
         <ConfirmDeleteItemDialog
            open={isConfirmDeleteDialogOpen}
            title="Delete link?"
            description="Are you sure you want to delete your link?"
            handleDelete={handleDelete}
            isDeleting={isDeleting}
            onClose={() => setIsConfirmDeleteDialogOpen(false)}
         />
         <ProfileItemCard
            editText={"Edit link"}
            deleteText={"Delete link"}
            handleEdit={handleEdit}
            handleDelete={() => setIsConfirmDeleteDialogOpen(true)}
         >
            <Button // MUI Button
               href={normalizedLink}
               target="_blank"
               LinkComponent={Link} // NextJS Link
               sx={styles.buttonLink}
            >
               <CircularLogo
                  src={faviconSrc}
                  alt={`${link.title} icon`}
                  sx={styles.circularLogo}
                  size={48}
               />
               <Stack>
                  <Typography variant="brandedBody" sx={styles.linkTitle}>
                     {link.title}
                  </Typography>
                  <Stack spacing={0.5} direction={"row"} alignItems={"center"}>
                     <Typography variant="xsmall" sx={styles.linkUrl}>
                        {linkUrlValue}
                     </Typography>
                     <Link href={normalizedLink} target="_blank">
                        <Box
                           component={ExternalLink}
                           width={"12px"}
                           height={"12px"}
                           color="neutral.600"
                        />
                     </Link>
                  </Stack>
               </Stack>
            </Button>
         </ProfileItemCard>
      </Fragment>
   )
}

const isLinkedInUrl = (url: string) => url.includes("linkedin.")
