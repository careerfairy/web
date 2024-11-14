import { StudyBackground } from "@careerfairy/shared-lib/users"
import { Box, Skeleton, Stack, Typography } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useIsMobile from "components/custom-hook/useIsMobile"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { useUniversityById } from "components/custom-hook/useUniversityById"
import { useUserStudyBackgrounds } from "components/custom-hook/user/useUserStudyBackgrounds"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import { SchoolIcon } from "components/views/common/icons/SchoolIcon"
import { userRepo } from "data/RepositoryInstances"
import { Timestamp } from "data/firebase/FirebaseInstance"
import { DateTime } from "luxon"
import { Fragment, useCallback, useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import {
   TalentProfileItemTypes,
   closeCreateDialog,
   openCreateDialog,
   setEditing,
} from "store/reducers/talentProfileReducer"
import {
   talentProfileCreateStudyBackgroundOpenSelector,
   talentProfileEditingStudyBackgroundOpenSelector,
   talentProfileIsEditingStudyBackgroundSelector,
} from "store/selectors/talentProfileSelectors"
import { sxStyles } from "types/commonTypes"
import { ConfirmDeleteItemDialog } from "../ConfirmDeleteItemDialog"
import { ConfirmEmptyStudyDatesDialog } from "../ConfirmEmptyStudyDatesDialog"
import { EmptyItemView } from "./EmptyItemView"
import { ProfileSection } from "./ProfileItem"
import { ProfileItemCard } from "./ProfileItemCard"
import { BaseProfileDialog } from "./dialogs/BaseProfileDialog"
import {
   StudyBackgroundFormFields,
   StudyBackgroundFormProvider,
} from "./forms/StudyBackgroundForm"
import {
   StudyBackgroundFormValues,
   getInitialStudyBackgroundValues,
} from "./forms/schemas"

const styles = sxStyles({
   emptyStudiesRoot: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      p: "16px 12px",
      backgroundColor: (theme) => theme.brand.white[300],
      border: (theme) => `1px solid ${theme.brand.white[400]}`,
      borderRadius: "8px",
   },
   schoolIcon: {
      width: "36px",
      height: "36px",
   },
   studyBackgroundSchoolIcon: {
      width: "40px",
      height: "40px",
      padding: "5px 5.833px 5px 5px",
      borderRadius: "70px",
      color: (theme) => theme.palette.neutral[200],
      backgroundColor: (theme) => theme.palette.neutral[50],
   },
   universityName: {
      fontWeight: 600,
      color: (theme) => theme.palette.neutral[800],
   },
   studyDomains: {
      fontWeight: 400,
      color: (theme) => theme.palette.neutral[700],
   },
   studyDates: {
      fontWeight: 400,
      color: (theme) => theme.palette.neutral[500],
   },
})

type Props = {
   showAddIcon: boolean
}

export const ProfileStudyBackground = ({ showAddIcon }: Props) => {
   const dispatch = useDispatch()

   const handleAddClick = useCallback(() => {
      dispatch(
         openCreateDialog({ type: TalentProfileItemTypes.StudyBackground })
      )
   }, [dispatch])

   return (
      <ProfileSection
         title={"Study background"}
         showAddIcon={showAddIcon}
         handleAdd={handleAddClick}
      >
         <StudyBackgroundDetails />
      </ProfileSection>
   )
}

const StudyBackgroundDetails = () => {
   const studyBackgroundToEdit = useSelector(
      talentProfileEditingStudyBackgroundOpenSelector
   )

   return (
      <StudyBackgroundFormProvider studyBackground={studyBackgroundToEdit}>
         <FormDialogWrapper />
      </StudyBackgroundFormProvider>
   )
}

const FormDialogWrapper = () => {
   const dispatch = useDispatch()
   const { userData } = useAuth()
   const { errorNotification, successNotification } = useSnackbarNotifications()

   const [isConfirmEmptyDatesOpen, setIsConfirmEmptyDatesOpen] =
      useState<boolean>(false)

   const createStudyBackgroundDialogOpen = useSelector(
      talentProfileCreateStudyBackgroundOpenSelector
   )

   const isEditingStudyBackground = useSelector(
      talentProfileIsEditingStudyBackgroundSelector
   )

   const {
      formState: { isValid, isSubmitting },
      reset,
      handleSubmit,
   } = useFormContext()

   const handleCloseStudyBackgroundDialog = useCallback(() => {
      dispatch(
         closeCreateDialog({ type: TalentProfileItemTypes.StudyBackground })
      )
      reset(getInitialStudyBackgroundValues())
      setIsConfirmEmptyDatesOpen(false)
   }, [dispatch, reset])

   const startedAt = useWatch({
      name: "startedAt",
   })

   const endedAt = useWatch({
      name: "endedAt",
   })

   const onSubmit = async (data: StudyBackgroundFormValues) => {
      try {
         const newStudyBackground: StudyBackground = {
            ...data,
            id: data?.id,
            startedAt: data.startedAt
               ? Timestamp.fromDate(data.startedAt)
               : null,
            endedAt: data.endedAt ? Timestamp.fromDate(data.endedAt) : null,
            authId: userData.authId,
         }

         if (!data?.id) {
            await userRepo.createUserStudyBackground(
               userData.id,
               newStudyBackground
            )
         } else {
            await userRepo.updateUserStudyBackground(
               userData.id,
               newStudyBackground
            )
         }

         handleCloseStudyBackgroundDialog()
         successNotification(
            `${data.id ? "Updated" : "Added a new"} study background 🎓`
         )
      } catch (error) {
         errorNotification(
            error,
            "We encountered a problem while adding your study background. Rest assured, we're on it!"
         )
      }
   }

   const handleSave = async () => handleSubmit(onSubmit)()

   const handleSaveButtonClick = () => {
      if (!startedAt && !endedAt) setIsConfirmEmptyDatesOpen(true)
      else handleSave()
   }

   const saveText = isEditingStudyBackground ? "Save" : "Add"

   return (
      <Fragment>
         <StudyBackgroundsList />
         <BaseProfileDialog
            title="Study Background"
            open={createStudyBackgroundDialogOpen}
            handleClose={handleCloseStudyBackgroundDialog}
            handleSave={handleSaveButtonClick}
            saveDisabled={!isValid}
            isSubmitting={isSubmitting}
            saveText={saveText}
         >
            <ConfirmEmptyStudyDatesDialog
               open={isConfirmEmptyDatesOpen}
               maybeLater={handleSave}
               onClose={() => setIsConfirmEmptyDatesOpen(false)}
               isSubmitting={isSubmitting}
            />
            <SuspenseWithBoundary fallback={<StudyBackgroundFormSkeleton />}>
               <StudyBackgroundFormFields />
            </SuspenseWithBoundary>
         </BaseProfileDialog>
      </Fragment>
   )
}

const StudyBackgroundsList = () => {
   const { data: studyBackgrounds } = useUserStudyBackgrounds()
   const dispatch = useDispatch()

   const handleAdd = useCallback(() => {
      dispatch(
         openCreateDialog({ type: TalentProfileItemTypes.StudyBackground })
      )
   }, [dispatch])

   if (!studyBackgrounds?.length)
      return (
         <Box sx={styles.emptyStudiesRoot}>
            <EmptyItemView
               title={"What did you study?"}
               description={
                  "Share your formal education background with us, including the school, programme, and field of study."
               }
               addButtonText={"Add study background"}
               handleAdd={handleAdd}
               icon={<SchoolIcon sx={styles.schoolIcon} />}
            />
         </Box>
      )

   return (
      <Stack spacing={1.5} width={"100%"}>
         {studyBackgrounds?.map((studyBackground) => (
            <StudyBackgroundCard
               studyBackground={studyBackground}
               key={studyBackground.id}
            />
         ))}
      </Stack>
   )
}

type StudyBackgroundCardProps = {
   studyBackground: StudyBackground
}

const StudyBackgroundCard = ({ studyBackground }: StudyBackgroundCardProps) => {
   const { userData } = useAuth()
   const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] =
      useState<boolean>(false)
   const [isDeleting, setIsDeleting] = useState<boolean>(false)
   const dispatch = useDispatch()
   const { reset } = useFormContext()

   const handleEdit = useCallback(() => {
      dispatch(
         setEditing({
            type: TalentProfileItemTypes.StudyBackground,
            data: studyBackground,
         })
      )
      reset(studyBackground)
   }, [dispatch, studyBackground, reset])

   const handleDelete = useCallback(async () => {
      setIsDeleting(true)

      await userRepo.deleteStudyBackground(userData.id, studyBackground.id)

      setIsDeleting(false)
      setIsConfirmDeleteDialogOpen(false)
   }, [studyBackground, userData.id])

   const university = useUniversityById(
      studyBackground.universityCountryCode,
      studyBackground.universityId
   )

   const startedAtYear = studyBackground.startedAt
      ? DateTime.fromJSDate(studyBackground.startedAt.toDate()).year
      : 0

   const endedAtYear = studyBackground.endedAt
      ? DateTime.fromJSDate(studyBackground.endedAt.toDate()).year
      : 0

   const hasStartedAtYear = Boolean(startedAtYear)
   const hasEndedAtYear = Boolean(endedAtYear)

   return (
      <Fragment>
         <ConfirmDeleteItemDialog
            open={isConfirmDeleteDialogOpen}
            title="Delete study background?"
            description="Are you sure you want to delete your study background?"
            handleDelete={handleDelete}
            isDeleting={isDeleting}
            onClose={() => setIsConfirmDeleteDialogOpen(false)}
         />
         <ProfileItemCard
            editText="Edit study background details"
            deleteText="Delete study background"
            handleEdit={handleEdit}
            handleDelete={() => setIsConfirmDeleteDialogOpen(true)}
         >
            <SchoolIcon sx={styles.studyBackgroundSchoolIcon} />
            <Stack spacing={0.5}>
               <Typography variant="brandedBody" sx={styles.universityName}>
                  {university?.name}
               </Typography>
               <Typography
                  variant="small"
                  sx={styles.studyDomains}
               >{`${studyBackground.levelOfStudy.name} degree, ${studyBackground.fieldOfStudy.name}`}</Typography>
               <ConditionalWrapper condition={hasStartedAtYear}>
                  <Typography variant="xsmall" sx={styles.studyDates}>
                     {startedAtYear}
                     {hasEndedAtYear ? `${" - "}${endedAtYear}` : null}
                  </Typography>
               </ConditionalWrapper>
            </Stack>
         </ProfileItemCard>
      </Fragment>
   )
}

const StudyBackgroundFormSkeleton = () => {
   const isMobile = useIsMobile()

   return (
      <Stack spacing={2} minWidth={isMobile ? "300px" : "500px"}>
         <Skeleton width={"100%"} height={"60px"} />
         <Skeleton width={"100%"} height={"60px"} />
         <Skeleton width={"100%"} height={"60px"} />
         <Skeleton width={"100%"} height={"60px"} />
         <Stack
            direction={isMobile ? "row" : "column"}
            width={"100%"}
            spacing={2}
            justifyContent={"space-between"}
         >
            <Skeleton width={"100%"} height={"60px"} />
            <Skeleton width={"100%"} height={"60px"} />
         </Stack>
      </Stack>
   )
}
