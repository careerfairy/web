import { ProfileLink } from "@careerfairy/shared-lib/users"
import { getSubstringWithEllipsis } from "@careerfairy/shared-lib/utils"
import { Box, Button, Stack, Typography } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import useIsMobile from "components/custom-hook/useIsMobile"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { useUserLinks } from "components/custom-hook/user/useUserLinks"
import { LINKEDIN_URL_REGEX } from "components/util/constants"
import CircularLogo from "components/views/common/logos/CircularLogo"
import { userRepo } from "data/RepositoryInstances"
import Link from "next/link"
import normalizeUrl from "normalize-url"
import { OptionsObject } from "notistack"
import { Fragment, useCallback, useMemo, useState } from "react"
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
import { AnalyticsEvents } from "util/analyticsConstants"
import { dataLayerEvent } from "util/analyticsUtils"
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

const NOTIFICATION_OPTIONS: OptionsObject = {
   anchorOrigin: {
      vertical: "top",
      horizontal: "left",
   },
}

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
   const isMobile = useIsMobile()
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

         // User has no linkedin url and the new url is valid (a linkedin url)
         if (!userData.linkedinUrl && LINKEDIN_URL_REGEX.test(data.url)) {
            await userRepo.updateAdditionalInformation(userData.id, {
               linkedinUrl: data.url,
            })
            dataLayerEvent(AnalyticsEvents.ProfileLinkedinUpload)
         } else {
            if (data?.id === "linkedin") {
               // User is updating their linkedin url, leaving it as a valid linkedin url or
               // changing it to an invalid linkedin url but still keeping it in the user links.

               // Either way the linkedinUrl must be updated, empty if the url is not valid and the url if it is valid.
               const isValidLinkedinUrl = LINKEDIN_URL_REGEX.test(data.url)

               await userRepo.updateAdditionalInformation(userData.id, {
                  linkedinUrl: isValidLinkedinUrl ? data.url : "",
               })

               if (isValidLinkedinUrl) {
                  dataLayerEvent(AnalyticsEvents.ProfileLinkedinUpload)
               }

               if (!isValidLinkedinUrl) {
                  // Since the linkedin url is not valid anymore, we create a new user link
                  await userRepo.createUserLink(userData.id, newLink)
                  dataLayerEvent(AnalyticsEvents.ProfileLinkUpload)
               }
            } else {
               // User is creating/updating a non-linkedin link
               if (!data?.id) {
                  await userRepo.createUserLink(userData.id, newLink)
               } else {
                  await userRepo.updateUserLink(userData.id, newLink)
               }
               dataLayerEvent(AnalyticsEvents.ProfileLinkUpload)
            }
         }

         handleCloseLinkDialog()
         successNotification(
            `${data.id ? "Updated" : "Added a new"} link 🔗`,
            undefined,
            isMobile ? NOTIFICATION_OPTIONS : undefined
         )
      } catch (error) {
         errorNotification(
            error,
            "We encountered a problem while adding your link. Rest assured, we're on it!",
            undefined,
            isMobile ? NOTIFICATION_OPTIONS : undefined
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
   const { userData } = useAuth()

   const { data: userStoredLinks } = useUserLinks()
   const dispatch = useDispatch()

   const handleAdd = useCallback(() => {
      dispatch(openCreateDialog({ type: TalentProfileItemTypes.Link }))
   }, [dispatch])

   const userLinks = useMemo(() => {
      return userData.linkedinUrl
         ? [
              {
                 title: "LinkedIn",
                 url: userData.linkedinUrl,
                 authId: userData.authId,
                 id: "linkedin",
              },
              ...userStoredLinks,
           ]
         : userStoredLinks
   }, [userStoredLinks, userData.linkedinUrl, userData.authId])

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

      if (link.id === "linkedin") {
         await userRepo.updateAdditionalInformation(userData.id, {
            linkedinUrl: null,
         })
      } else {
         await userRepo.deleteLink(userData.id, link.id)
      }

      setIsDeleting(false)
      setIsConfirmDeleteDialogOpen(false)
      successNotification(
         "Link deleted",
         undefined,
         isMobile ? NOTIFICATION_OPTIONS : undefined
      )
   }, [link, userData.id, successNotification, isMobile])

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
            href={normalizedLink}
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

export const isLinkedInUrl = (url: string) => url.includes("linkedin.")
