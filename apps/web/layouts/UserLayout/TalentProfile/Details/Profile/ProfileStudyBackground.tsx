import { StudyBackground } from "@careerfairy/shared-lib/users"
import { Box, Button, Skeleton, Stack, Typography } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useIsMobile from "components/custom-hook/useIsMobile"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { useUserStudyBackgroundsSWR } from "components/custom-hook/user/useUserStudyBackgroundsSWR"
import { SchoolIcon } from "components/views/common/icons/SchoolIcon"
import { userRepo } from "data/RepositoryInstances"
import { Timestamp } from "data/firebase/FirebaseInstance"
import { Fragment, useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { sxStyles } from "types/commonTypes"
import { ConfirmEmptyStudyDatesDialog } from "../ConfirmEmptyStudyDatesDialog"
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
   title: {
      fontWeight: 600,
      color: (theme) => theme.palette.neutral[900],
   },
   studiesRoot: {
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
})

export const ProfileStudyBackground = () => {
   return (
      <Stack spacing={1.5}>
         <Typography variant="brandedBody" sx={styles.title}>
            Study background
         </Typography>
         <StudyBackgroundDetails />
      </Stack>
   )
}

const StudyBackgroundDetails = () => {
   const [studyBackgroundToEdit, setStudyBackgroundToEdit] =
      useState<StudyBackground>(null)
   const [studyBackgroundToDelete, setStudyBackgroundToDelete] =
      useState<StudyBackground>(null)
   // Leaving this here to prevent unused var, will be used in next stack
   console.log(
      "🚀 ~ StudyBackgroundDetails ~ studyBackgroundToDelete:",
      studyBackgroundToDelete
   )

   return (
      <StudyBackgroundFormProvider studyBackground={studyBackgroundToEdit}>
         <FormDialogWrapper
            handleEdit={setStudyBackgroundToEdit}
            handleDelete={setStudyBackgroundToDelete}
         />
      </StudyBackgroundFormProvider>
   )
}

type FormDialogWrapperProps = {
   handleEdit?: (studyBackground: StudyBackground) => void
   handleDelete?: (studyBackground: StudyBackground) => void
}

const FormDialogWrapper = ({
   handleDelete: setStudyBackgroundToDelete,
   handleEdit: setStudyBackgroundToEdit,
}: FormDialogWrapperProps) => {
   const { userData } = useAuth()
   const { errorNotification, successNotification } = useSnackbarNotifications()
   const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
   const [isConfirmEmptyDatesOpen, setIsConfirmEmptyDatesOpen] =
      useState<boolean>(false)

   const {
      formState: { isValid, isSubmitting },
      reset,
      handleSubmit,
   } = useFormContext()

   const startedAt = useWatch({
      name: "startedAt",
   })

   const endedAt = useWatch({
      name: "endedAt",
   })

   const handleClose = () => setIsDialogOpen(false)

   const onSubmit = async (data: StudyBackgroundFormValues) => {
      try {
         const newStudyBackground: StudyBackground = {
            ...data,
            id: null,
            startedAt: data.startedAt
               ? Timestamp.fromDate(data.startedAt)
               : null,
            endedAt: data.endedAt ? Timestamp.fromDate(data.endedAt) : null,
            authId: userData.authId,
         }

         await userRepo.createUserStudyBackground(
            userData.id,
            newStudyBackground
         )

         handleClose()
         reset(getInitialStudyBackgroundValues())
         successNotification("Added a new study background 🎓")
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

   return (
      <Fragment>
         <Box sx={styles.studiesRoot}>
            <SuspenseWithBoundary>
               <StudyBackgroundsList
                  handleAddBackground={() => setIsDialogOpen(true)}
                  handleEdit={setStudyBackgroundToEdit}
                  handleDelete={setStudyBackgroundToDelete}
               />
            </SuspenseWithBoundary>
         </Box>
         <BaseProfileDialog
            title="Study Background"
            open={isDialogOpen}
            handleClose={handleClose}
            handleSave={handleSaveButtonClick}
            saveDisabled={!isValid}
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
   handleEdit?: (studyBackground: StudyBackground) => void
   handleDelete?: (studyBackground: StudyBackground) => void
   handleAddBackground?: () => void
}

const StudyBackgroundsList = (props: StudyBackgroundsListProps) => {
   const { data: studyBackgrounds } = useUserStudyBackgroundsSWR()
   // TODO-WG: Remove
   console.log(
      "🚀 ~ StudyBackgroundsList ~ studyBackgrounds:",
      studyBackgrounds
   )

   // TODO-WG: Pass study backgrounds, not passing for easier testing while creating
   return <StudyBackgroundsListView {...props} />
}

type StudyBackgroundsListViewProps = StudyBackgroundsListProps & {
   studyBackgrounds?: StudyBackground[]
}

const StudyBackgroundsListView = (props: StudyBackgroundsListViewProps) => {
   const { studyBackgrounds = [], handleAddBackground } = props

   if (!studyBackgrounds.length)
      return (
         <EmptyStudyBackgroundView
            handleAddBackground={() =>
               handleAddBackground && handleAddBackground()
            }
         />
      )

   return <Box>{`${studyBackgrounds.length} study background(s)`}</Box>
}

type EmptyStudyBackgroundViewProps = {
   handleAddBackground: () => void
}

const EmptyStudyBackgroundView = ({
   handleAddBackground,
}: EmptyStudyBackgroundViewProps) => {
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
