import { TagValuesLookup } from "@careerfairy/shared-lib/constants/tags"
import { ProfileInterest } from "@careerfairy/shared-lib/users"
import { Box, Chip } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { userRepo } from "data/RepositoryInstances"
import { Fragment, useCallback, useMemo } from "react"
import { Edit3, Heart } from "react-feather"
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
   editIcon: {
      width: "20px",
      height: "20px",
      color: (theme) => theme.palette.neutral[700],
   },
   chip: {
      mr: 1,
      mb: 1,
      fontSize: "14px",
      fontWeight: 400,
      borderRadius: "60px",
      backgroundColor: (theme) => theme.palette.black[400],
      color: (theme) => theme.palette.neutral[800],
   },
})

type Props = {
   showAddIcon?: boolean
}

export const ProfileInterests = ({ showAddIcon }: Props) => {
   const { userData } = useAuth()
   const dispatch = useDispatch()

   const interests: ProfileInterest = useMemo(() => {
      return {
         businessFunctionsTagIds: userData.businessFunctionsTagIds ?? [],
         contentTopicsTagIds: userData.contentTopicsTagIds ?? [],
      }
   }, [userData.businessFunctionsTagIds, userData.contentTopicsTagIds])

   const handleEdit = useCallback(() => {
      dispatch(openCreateDialog({ type: TalentProfileItemTypes.Interest }))
   }, [dispatch])

   return (
      <ProfileSection
         title="Interests"
         handleAdd={handleEdit}
         showAddIcon={showAddIcon}
         addIcon={Edit3}
      >
         <InterestFormProvider interest={interests}>
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

   const {
      formState: { isValid, isSubmitting },
      reset,
      handleSubmit,
   } = useFormContext()

   const handleCloseInterestDialog = useCallback(() => {
      dispatch(closeCreateDialog({ type: TalentProfileItemTypes.Interest }))
      if (!isValid) {
         const interest: ProfileInterest = {
            businessFunctionsTagIds: userData.businessFunctionsTagIds ?? [],
            contentTopicsTagIds: userData.contentTopicsTagIds ?? [],
         }

         reset(getInitialInterestValues(interest))
      }
   }, [
      dispatch,
      reset,
      isValid,
      userData.businessFunctionsTagIds,
      userData.contentTopicsTagIds,
   ])

   const onSubmit = async (data: InterestFormValues) => {
      try {
         await userRepo.updateUserData(userData.id, {
            businessFunctionsTagIds: data.businessFunctionsTagIds,
            contentTopicsTagIds: data.contentTopicsTagIds,
         })

         handleCloseInterestDialog()
         reset(data)
         successNotification(`Saved interests 👁️`)
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
            isSubmitting={isSubmitting}
            saveText={"Save"}
         >
            <InterestFormFields />
         </BaseProfileDialog>
      </Fragment>
   )
}

const InterestsList = () => {
   const { userData } = useAuth()
   const dispatch = useDispatch()

   const handleEdit = useCallback(() => {
      dispatch(openCreateDialog({ type: TalentProfileItemTypes.Interest }))
   }, [dispatch])

   const allTagIds = useMemo(() => {
      const businessFunctionsTagIds = userData.businessFunctionsTagIds ?? []
      const contentTopicsTagIds = userData.contentTopicsTagIds ?? []
      return [...businessFunctionsTagIds, ...contentTopicsTagIds].sort((a, b) =>
         TagValuesLookup[a].localeCompare(TagValuesLookup[b])
      )
   }, [userData.businessFunctionsTagIds, userData.contentTopicsTagIds])

   if (!allTagIds.length)
      return (
         <Box sx={styles.emptyInterestsRoot}>
            <EmptyItemView
               title={"Interest check"}
               description={
                  "Select the tags that best represent your interests."
               }
               addButtonText={"Select interests"}
               handleAdd={handleEdit}
               icon={<Box component={Heart} sx={styles.icon} />}
            />
         </Box>
      )

   return (
      <Box>
         {allTagIds.map((tagId) => (
            <Chip sx={styles.chip} key={tagId} label={TagValuesLookup[tagId]} />
         ))}
      </Box>
   )
}
