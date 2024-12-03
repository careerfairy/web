import { LanguageProficiency } from "@careerfairy/shared-lib/constants/forms"
import { ProfileLanguage } from "@careerfairy/shared-lib/users"
import { Box } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { userRepo } from "data/RepositoryInstances"
import { Fragment, useCallback } from "react"
import { Globe } from "react-feather"
import { useFormContext } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import {
   TalentProfileItemTypes,
   closeCreateDialog,
   openCreateDialog,
} from "store/reducers/talentProfileReducer"
import {
   talentProfileCreateLanguageOpenSelector,
   talentProfileEditingLanguageOpenSelector,
   talentProfileIsEditingLanguageSelector,
} from "store/selectors/talentProfileSelectors"
import { sxStyles } from "types/commonTypes"
import { EmptyItemView } from "./EmptyItemView"
import { ProfileItem } from "./ProfileItem"
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
})

type Props = {
   hasItems?: boolean
}

export const ProfileLanguages = ({ hasItems }: Props) => {
   const dispatch = useDispatch()

   const handleAdd = useCallback(() => {
      dispatch(openCreateDialog({ type: TalentProfileItemTypes.Language }))
   }, [dispatch])

   return (
      <ProfileItem hasItems={hasItems} title="Languages" handleAdd={handleAdd}>
         <ProfileLanguagesDetails />
      </ProfileItem>
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
            <LanguageFormFields />
         </BaseProfileDialog>
      </Fragment>
   )
}

const LanguageList = () => {
   const dispatch = useDispatch()

   const handleAdd = useCallback(() => {
      dispatch(openCreateDialog({ type: TalentProfileItemTypes.Language }))
   }, [dispatch])

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
}
