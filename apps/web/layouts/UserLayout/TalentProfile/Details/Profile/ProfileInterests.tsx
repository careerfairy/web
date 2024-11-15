import { ProfileInterest } from "@careerfairy/shared-lib/users"
import { Box } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { Fragment, useCallback, useMemo } from "react"
import { Heart } from "react-feather"
import { useFormContext } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import {
   TalentProfileItemTypes,
   closeCreateDialog,
   openCreateDialog,
} from "store/reducers/talentProfileReducer"
import { talentProfileCreateInterestOpenSelector } from "store/selectors/talentProfileSelectors"
import { sxStyles } from "types/commonTypes"
import { EmptyItemView } from "./EmptyItemView"
import { ProfileSection } from "./ProfileSection"
import { BaseProfileDialog } from "./dialogs/BaseProfileDialog"
import { InterestFormFields, InterestFormProvider } from "./forms/InterestsForm"
import { InterestFormValues } from "./forms/schemas"

const styles = sxStyles({
   emptyInterestsRoot: {
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
   showAddIcon?: boolean
}

export const ProfileInterests = ({ showAddIcon }: Props) => {
   const dispatch = useDispatch()

   const handleEdit = useCallback(() => {
      dispatch(openCreateDialog({ type: TalentProfileItemTypes.Interest }))
   }, [dispatch])

   return (
      <ProfileSection
         showAddIcon={showAddIcon}
         title="Interests"
         handleAdd={handleEdit}
      >
         <InterestFormProvider>
            <FormDialogWrapper />
         </InterestFormProvider>
      </ProfileSection>
   )
}

const FormDialogWrapper = () => {
   const dispatch = useDispatch()
   const { userData } = useAuth()
   const { errorNotification, successNotification } = useSnackbarNotifications()

   const createInterestDialogOpen = useSelector(
      talentProfileCreateInterestOpenSelector
   )

   // const isEditingInterest = useSelector(talentProfileIsEditingInterestSelector)

   const {
      formState: { isValid },
      reset,
      handleSubmit,
   } = useFormContext()

   useMemo(() => {
      const interest: ProfileInterest = {
         businessFunctionsTagIds: userData.businessFunctionsTagIds ?? [],
         contentTopicsTagIds: userData.contentTopicsTagIds ?? [],
      }

      reset(interest)
   }, [userData.businessFunctionsTagIds, userData.contentTopicsTagIds, reset])

   const handleCloseInterestDialog = useCallback(() => {
      dispatch(closeCreateDialog({ type: TalentProfileItemTypes.Interest }))
   }, [dispatch])

   const onSubmit = async (data: InterestFormValues) => {
      console.log("🚀 ~ onSubmit ~ data:", data)
      try {
         // TODO: update interests

         // if (!data?.id) {
         //     alert("Todo create interests")
         // } else {
         //     alert("Todo update interests")
         // }

         handleCloseInterestDialog()
         successNotification(`Saved interests 👓`)
      } catch (error) {
         errorNotification(
            error,
            "We encountered a problem while updating your interests. Rest assured, we're on it!"
         )
      }
   }

   const handleSave = async () => handleSubmit(onSubmit)()

   return (
      <Fragment>
         <InterestsList />
         <BaseProfileDialog
            title="Interests"
            open={createInterestDialogOpen}
            handleClose={handleCloseInterestDialog}
            handleSave={handleSave}
            saveDisabled={!isValid}
            saveText={"Save"}
         >
            <InterestFormFields />
         </BaseProfileDialog>
      </Fragment>
   )
}

const InterestsList = () => {
   // TODO-WG: Create hook in upper stack
   // const { data: userLinks } = useUserInterests()
   const dispatch = useDispatch()

   const handleEdit = useCallback(() => {
      dispatch(openCreateDialog({ type: TalentProfileItemTypes.Interest }))
   }, [dispatch])

   return (
      <Box sx={styles.emptyInterestsRoot}>
         <EmptyItemView
            title={"Interest check"}
            description={"Select the tags that best represent your interests."}
            addButtonText={"Select interests"}
            handleAdd={handleEdit}
            icon={<Box component={Heart} sx={styles.icon} />}
         />
      </Box>
   )
}
