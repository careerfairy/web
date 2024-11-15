import {
   LanguageProficiency,
   LanguageProficiencyLabels,
} from "@careerfairy/shared-lib/constants/forms"
import { ProfileLanguage } from "@careerfairy/shared-lib/users"
import { Box, Stack, Typography } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { useUserLanguages } from "components/custom-hook/user/useUserLanguages"
import { languageCodesDict } from "components/helperFunctions/streamFormFunctions"
import { userRepo } from "data/RepositoryInstances"
import { Fragment, useCallback, useState } from "react"
import { Globe } from "react-feather"
import { useFormContext } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import {
   TalentProfileItemTypes,
   closeCreateDialog,
   openCreateDialog,
   setEditing,
} from "store/reducers/talentProfileReducer"
import {
   talentProfileCreateLanguageOpenSelector,
   talentProfileEditingLanguageOpenSelector,
   talentProfileIsEditingLanguageSelector,
} from "store/selectors/talentProfileSelectors"
import { sxStyles } from "types/commonTypes"
import { ConfirmDeleteItemDialog } from "../ConfirmDeleteItemDialog"
import { EmptyItemView } from "./EmptyItemView"
import { ProfileItemCard } from "./ProfileItemCard"
import { ProfileSection } from "./ProfileSection"
import { BaseProfileDialog } from "./dialogs/BaseProfileDialog"
import { LanguageFormFields, LanguageFormProvider } from "./forms/LanguagesForm"
import { LanguageFormValues, getInitialLanguageValues } from "./forms/schemas"

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
   language: {
      color: (theme) => theme.palette.neutral[800],
      fontWeight: 600,
   },
   proficiency: {
      color: (theme) => theme.palette.neutral[600],
      fontWeight: 400,
   },
})

type Props = {
   showAddIcon?: boolean
}

export const ProfileLanguages = ({ showAddIcon }: Props) => {
   const dispatch = useDispatch()

   const handleAdd = useCallback(() => {
      dispatch(openCreateDialog({ type: TalentProfileItemTypes.Language }))
   }, [dispatch])

   return (
      <ProfileSection
         showAddIcon={showAddIcon}
         title="Languages"
         handleAdd={handleAdd}
      >
         <ProfileLanguagesDetails />
      </ProfileSection>
   )
}

const ProfileLanguagesDetails = () => {
   const languageToEdit = useSelector(talentProfileEditingLanguageOpenSelector)

   return (
      <LanguageFormProvider language={languageToEdit}>
         <FormDialogWrapper />
      </LanguageFormProvider>
   )
}

const FormDialogWrapper = () => {
   const { data: languages } = useUserLanguages()
   const dispatch = useDispatch()
   const { userData } = useAuth()
   const { errorNotification, successNotification } = useSnackbarNotifications()

   const createLanguageDialogOpen = useSelector(
      talentProfileCreateLanguageOpenSelector
   )

   const isEditingLanguage = useSelector(talentProfileIsEditingLanguageSelector)

   const {
      formState: { isValid, isSubmitting },
      reset,
      handleSubmit,
   } = useFormContext()

   const handleCloseLanguageDialog = useCallback(() => {
      dispatch(closeCreateDialog({ type: TalentProfileItemTypes.Language }))
      reset(getInitialLanguageValues())
   }, [dispatch, reset])

   const onSubmit = async (data: LanguageFormValues) => {
      try {
         const newLanguage: ProfileLanguage = {
            ...data,
            id: data?.id,
            proficiency: data.proficiency as LanguageProficiency,
            authId: userData.authId,
         }

         if (!data?.id) {
            await userRepo.createLanguage(userData.id, newLanguage)
         } else {
            await userRepo.updateLanguage(userData.id, newLanguage)
         }

         handleCloseLanguageDialog()
         successNotification(
            `${data.id ? "Updated" : "Added a new"} language 🗣️`
         )
      } catch (error) {
         errorNotification(
            error,
            "We encountered a problem while adding your language. Rest assured, we're on it!"
         )
      }
   }

   const handleSave = async () => handleSubmit(onSubmit)()

   const alreadyExistingLanguages =
      languages?.map((language) => language.languageId) || []

   const saveText = isEditingLanguage ? "Save" : "Add"

   return (
      <Fragment>
         <LanguageList />
         <BaseProfileDialog
            title="Languages"
            open={createLanguageDialogOpen}
            handleClose={handleCloseLanguageDialog}
            handleSave={handleSave}
            saveDisabled={!isValid}
            isSubmitting={isSubmitting}
            saveText={saveText}
         >
            <LanguageFormFields filterLanguageIds={alreadyExistingLanguages} />
         </BaseProfileDialog>
      </Fragment>
   )
}

const LanguageList = () => {
   const { data: languages, hasItems } = useUserLanguages()

   const dispatch = useDispatch()

   const handleAdd = useCallback(() => {
      dispatch(openCreateDialog({ type: TalentProfileItemTypes.Language }))
   }, [dispatch])

   if (!hasItems)
      return (
         <Box sx={styles.emptyLinksRoot}>
            <EmptyItemView
               title="Language buffet"
               description="What languages can you feast on? Select all that apply."
               addButtonText={"Select languages"}
               handleAdd={handleAdd}
               icon={<Box component={Globe} sx={styles.icon} />}
            />
         </Box>
      )

   return (
      <Stack spacing={1.5} width={"100%"}>
         {languages?.map((language) => (
            <LanguageCard language={language} key={language.id} />
         ))}
      </Stack>
   )
}

type LanguageCardProps = {
   language: ProfileLanguage
}

const LanguageCard = ({ language }: LanguageCardProps) => {
   const { userData } = useAuth()
   const [isDeleting, setIsDeleting] = useState<boolean>(false)
   const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] =
      useState<boolean>(false)
   const dispatch = useDispatch()
   const { reset } = useFormContext()

   const handleEdit = useCallback(() => {
      dispatch(
         setEditing({
            type: TalentProfileItemTypes.Language,
            data: language,
         })
      )
      reset(language)
   }, [dispatch, language, reset])

   const handleDelete = useCallback(async () => {
      setIsDeleting(true)

      await userRepo.deleteLanguage(userData.id, language.id)

      setIsDeleting(false)
      setIsConfirmDeleteDialogOpen(false)
   }, [language, userData.id])

   return (
      <Fragment>
         <ConfirmDeleteItemDialog
            open={isConfirmDeleteDialogOpen}
            title="Delete language?"
            description="Are you sure you want to delete your language?"
            handleDelete={handleDelete}
            isDeleting={isDeleting}
            onClose={() => setIsConfirmDeleteDialogOpen(false)}
         />
         <ProfileItemCard
            editText={"Edit language"}
            deleteText={"Delete language"}
            handleEdit={handleEdit}
            handleDelete={() => setIsConfirmDeleteDialogOpen(true)}
         >
            <Stack direction={"row"} alignItems={"center"} spacing={0.5}>
               <Typography variant="brandedBody" sx={styles.language}>
                  {languageCodesDict[language.languageId].name}
               </Typography>
               <Typography variant="xsmall" sx={styles.proficiency}>
                  {`(${LanguageProficiencyLabels[language.proficiency]})`}
               </Typography>
            </Stack>
         </ProfileItemCard>
      </Fragment>
   )
}
