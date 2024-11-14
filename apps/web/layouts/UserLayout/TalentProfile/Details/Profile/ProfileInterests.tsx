import { Box } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { Fragment, useCallback } from "react"
import { Heart } from "react-feather"
import { useFormContext } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import {
   TalentProfileItemTypes,
   closeCreateDialog,
   openCreateDialog,
} from "store/reducers/talentProfileReducer"
import {
   talentProfileCreateInterestOpenSelector,
   talentProfileEditingInterestOpenSelector,
   talentProfileIsEditingInterestSelector,
} from "store/selectors/talentProfileSelectors"
import { sxStyles } from "types/commonTypes"
import { EmptyItemView } from "./EmptyItemView"
import { ProfileSection } from "./ProfileSection"
import { BaseProfileDialog } from "./dialogs/BaseProfileDialog"
import { InterestFormFields, InterestFormProvider } from "./forms/InterestsForm"
import { InterestFormValues, getInitialInterestValues } from "./forms/schemas"

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

   const handleAdd = useCallback(() => {
      dispatch(openCreateDialog({ type: TalentProfileItemTypes.Interest }))
   }, [dispatch])

   return (
      <ProfileSection
         showAddIcon={showAddIcon}
         title="Interests"
         handleAdd={handleAdd}
      >
         <ProfileInterestsDetails />
      </ProfileSection>
   )
}

const ProfileInterestsDetails = () => {
   const interestToEdit = useSelector(talentProfileEditingInterestOpenSelector)

   return (
      <InterestFormProvider interest={interestToEdit}>
         <FormDialogWrapper />
      </InterestFormProvider>
   )
}

const FormDialogWrapper = () => {
   const dispatch = useDispatch()
   const { userData } = useAuth()
   console.log("🚀 ~ FormDialogWrapper ~ userData:", userData)
   const { errorNotification, successNotification } = useSnackbarNotifications()
   console.log(
      "🚀 ~ FormDialogWrapper ~ successNotification:",
      successNotification
   )

   const createInterestDialogOpen = useSelector(
      talentProfileCreateInterestOpenSelector
   )

   const isEditingInterest = useSelector(talentProfileIsEditingInterestSelector)

   const {
      formState: { isValid },
      reset,
      handleSubmit,
   } = useFormContext()

   const handleCloseInterestDialog = useCallback(() => {
      dispatch(closeCreateDialog({ type: TalentProfileItemTypes.Interest }))
      // TODO: always pass from user
      reset(getInitialInterestValues())
   }, [dispatch, reset])

   const onSubmit = async (data: InterestFormValues) => {
      console.log("🚀 ~ onSubmit ~ data:", data)
      try {
         handleCloseInterestDialog()

         // TODO: update interests

         // if (!data?.id) {
         //     alert("Todo create interests")
         // } else {
         //     alert("Todo update interests")
         // }

         // successNotification(`${data.id ? "Updated" : "Added "} interests 🔗`)
      } catch (error) {
         errorNotification(
            error,
            "We encountered a problem while updating your interests. Rest assured, we're on it!"
         )
      }
   }

   const handleSave = async () => handleSubmit(onSubmit)()

   const saveText = isEditingInterest ? "Save" : "Add"

   return (
      <Fragment>
         <InterestsList />
         <BaseProfileDialog
            title="Interests"
            open={createInterestDialogOpen}
            handleClose={handleCloseInterestDialog}
            handleSave={handleSave}
            saveDisabled={!isValid}
            saveText={saveText}
         >
            <InterestFormFields />
         </BaseProfileDialog>
      </Fragment>
   )
}

const InterestsList = () => {
   // const { data: userLinks } = useUserInterests()
   const dispatch = useDispatch()

   const handleAdd = useCallback(() => {
      dispatch(openCreateDialog({ type: TalentProfileItemTypes.Interest }))
   }, [dispatch])

   return (
      <Box sx={styles.emptyInterestsRoot}>
         <EmptyItemView
            title={"Interest check"}
            description={"Select the tags that best represent your interests."}
            addButtonText={"Select interests"}
            handleAdd={handleAdd}
            icon={<Box component={Heart} sx={styles.icon} />}
         />
      </Box>
   )
}
