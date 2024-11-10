import { StudyBackground } from "@careerfairy/shared-lib/users"
import { Box, Button, Skeleton, Stack, Typography } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useIsMobile from "components/custom-hook/useIsMobile"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { useUniversityById } from "components/custom-hook/useUniversityById"
import { useUserStudyBackgroundsSWR } from "components/custom-hook/user/useUserStudyBackgroundsSWR"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import { SchoolIcon } from "components/views/common/icons/SchoolIcon"
import { userRepo } from "data/RepositoryInstances"
import { Timestamp } from "data/firebase/FirebaseInstance"
import { DateTime } from "luxon"
import { Fragment, useCallback, useState } from "react"
import { PlusCircle } from "react-feather"
import { useFormContext, useWatch } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import {
   closeCreateStudyBackgroundDialog,
   openCreateStudyBackgroundDialog,
   setEditingStudyBackground,
} from "store/reducers/talentProfileReducer"
import {
   talentProfileCreateStudyBackgroundOpenSelector,
   talentProfileEditingStudyBackgroundOpenSelector,
   talentProfileIsEditingStudyBackgroundSelector,
} from "store/selectors/talentProfileSelectors"
import { sxStyles } from "types/commonTypes"
import { ConfirmDeleteItemDialog } from "../ConfirmDeleteItemDialog"
import { ConfirmEmptyStudyDatesDialog } from "../ConfirmEmptyStudyDatesDialog"
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
   titleRoot: {
      pr: "12px",
      alignItems: "center",
      justifyContent: "space-between",
   },
   title: {
      fontWeight: 600,
      color: (theme) => theme.palette.neutral[900],
   },
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
   emptyDetailsRoot: {
      alignItems: "center",
      width: {
         xs: "280px",
         sm: "280px",
         md: "390px",
      },
   },
   emptyTitle: {
      fontWeight: 600,
      textAlign: "center",
   },
   emptyDescription: {
      fontWeight: 400,
      textAlign: "center",
   },
   addButton: {
      p: "8px 16px",
   },
   schoolIcon: {
      width: "36px",
      height: "36px",
   },
   plusCircle: {
      width: "20px",
      height: "20px",
      color: (theme) => theme.palette.neutral[600],
      "&:hover": {
         cursor: "pointer",
      },
   },
   studyBackgroundSchoolIcon: {
      width: "40px",
      height: "40px",
      padding: "5px 5.833px 5px 5px",
      borderRadius: "70px",
      color: (theme) => theme.palette.neutral[200],
      backgroundColor: (theme) => theme.palette.neutral[50],
   },
   moreVerticalIcon: {
      color: (theme) => theme.palette.neutral[800],
      width: "20px",
      height: "20px",
   },
   studyBackgroundCard: {
      justifyContent: "space-between",
      p: "16px 10px 12px 12px",
      borderRadius: "8px",
      border: (theme) => `1px solid ${theme.brand.white[500]}`,
      backgroundColor: (theme) => theme.brand.white[100],
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
   studyBackgrounds: StudyBackground[]
}

export const ProfileStudyBackground = ({ studyBackgrounds }: Props) => {
   const dispatch = useDispatch()

   const handleAddClick = useCallback(() => {
      dispatch(openCreateStudyBackgroundDialog())
   }, [dispatch])

   return (
      <Stack spacing={1.5}>
         <Stack direction={"row"} sx={styles.titleRoot}>
            <Typography variant="brandedBody" sx={styles.title}>
               Study background
            </Typography>
            <ConditionalWrapper condition={Boolean(studyBackgrounds?.length)}>
               <Box
                  component={PlusCircle}
                  sx={styles.plusCircle}
                  onClick={handleAddClick}
               />
            </ConditionalWrapper>
         </Stack>
         <StudyBackgroundDetails />
      </Stack>
   )
}

const StudyBackgroundDetails = () => {
   const studyBackgroundToEdit = useSelector(
      talentProfileEditingStudyBackgroundOpenSelector
   )

   return (
      <StudyBackgroundFormProvider studyBackground={studyBackgroundToEdit}>
         <SuspenseWithBoundary>
            <FormDialogWrapper />
         </SuspenseWithBoundary>
      </StudyBackgroundFormProvider>
   )
}

const FormDialogWrapper = () => {
   const dispatch = useDispatch()
   const { userData } = useAuth()
   const { errorNotification, successNotification } = useSnackbarNotifications()

   const { data: userStudyBackgrounds, mutate: refreshStudyBackgrounds } =
      useUserStudyBackgroundsSWR()

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
      dispatch(closeCreateStudyBackgroundDialog())
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
         refreshStudyBackgrounds()
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

   const handleSave = () => handleSubmit(onSubmit)()

   const handleSaveButtonClick = () => {
      if (!startedAt && !endedAt) setIsConfirmEmptyDatesOpen(true)
      else handleSave()
   }

   const saveText = isEditingStudyBackground ? "Save" : "Add"

   return (
      <Fragment>
         <ConditionalWrapper
            condition={Boolean(!userStudyBackgrounds?.length)}
            fallback={
               <StudyBackgroundsList studyBackgrounds={userStudyBackgrounds} />
            }
         >
            <Box sx={styles.emptyStudiesRoot}>
               <EmptyStudyBackgroundView />
            </Box>
         </ConditionalWrapper>
         <BaseProfileDialog
            title="Study Background"
            open={createStudyBackgroundDialogOpen}
            handleClose={handleCloseStudyBackgroundDialog}
            handleSave={handleSaveButtonClick}
            saveDisabled={!isValid}
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

type StudyBackgroundsListProps = {
   studyBackgrounds: StudyBackground[]
}

const StudyBackgroundsList = ({
   studyBackgrounds,
}: StudyBackgroundsListProps) => {
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
   const { mutate: refreshStudyBackgrounds } = useUserStudyBackgroundsSWR()
   const dispatch = useDispatch()
   const { reset } = useFormContext()

   const handleEdit = useCallback(() => {
      dispatch(setEditingStudyBackground(studyBackground))
      reset(studyBackground)
   }, [dispatch, studyBackground, reset])

   const handleDelete = useCallback(async () => {
      setIsDeleting(true)

      await userRepo.deleteStudyBackground(userData.id, studyBackground.id)

      setIsDeleting(false)
      setIsConfirmDeleteDialogOpen(false)
      refreshStudyBackgrounds()
   }, [studyBackground, userData, refreshStudyBackgrounds])

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
   const hasBothYears = hasStartedAtYear && hasEndedAtYear

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
            dataTypeId="study-background"
            data={studyBackground}
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
               <ConditionalWrapper condition={hasBothYears}>
                  <Typography
                     variant="xsmall"
                     sx={styles.studyDates}
                  >{`${startedAtYear}${" - "}${endedAtYear}`}</Typography>
               </ConditionalWrapper>
            </Stack>
         </ProfileItemCard>
      </Fragment>
   )
}

const EmptyStudyBackgroundView = () => {
   const dispatch = useDispatch()

   const handleAddBackground = useCallback(() => {
      dispatch(openCreateStudyBackgroundDialog())
   }, [dispatch])

   return (
      <Stack alignItems={"center"} spacing={2}>
         <Box color={"primary.main"}>
            <SchoolIcon sx={styles.schoolIcon} />
         </Box>
         <Stack spacing={2} sx={styles.emptyDetailsRoot}>
            <Stack alignItems={"center"}>
               <Typography
                  sx={styles.emptyTitle}
                  color="neutral.800"
                  variant="brandedBody"
               >
                  What did you study?
               </Typography>
               <Typography
                  sx={styles.emptyDescription}
                  color={"neutral.700"}
                  variant="small"
               >
                  Share your formal education background with us, including the
                  school, programme, and field of study.
               </Typography>
            </Stack>
            <Button
               variant="contained"
               color="primary"
               sx={styles.addButton}
               onClick={handleAddBackground}
            >
               Add study background
            </Button>
         </Stack>
      </Stack>
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
