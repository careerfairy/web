import { PublicCreator } from "@careerfairy/shared-lib/groups/creators"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { Box, Grid } from "@mui/material"
import SparkFetchWrapper from "HOCs/spark/SparkFetchWrapper"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import useFirebaseDelete from "components/custom-hook/utils/useFirebaseDelete"
import ExitIcon from "components/views/common/icons/ExitIcon"
import { BrandedTextFieldField } from "components/views/common/inputs/BrandedTextField"
import { Form, Formik, useFormikContext } from "formik"
import { useGroup } from "layouts/GroupDashboardLayout"
import ConfirmationDialog, {
   ConfirmationDialogAction,
} from "materialUI/GlobalModals/ConfirmationDialog"
import { FC, useCallback, useMemo } from "react"
import { useSelector } from "react-redux"
import {
   sparksCachedSparkFormValues,
   sparksFormSelectedCreator,
   sparksSelectedSparkId,
} from "store/selectors/adminSparksSelectors"
import { sxStyles } from "types/commonTypes"
import SparksDialog, { useSparksForm } from "../SparksDialog"
import CreatorCard from "./components/CreatorCard"
import SparkCategorySelect from "./components/SparkCategorySelect"
import SparkVisibilitySelect from "./components/SparkVisibilitySelect"
import { SubmittingOverlay } from "./components/SubmittingOverlay"
import VideoUpload from "./components/VideoUpload"
import useSparkFormSubmit, { SparkFormValues } from "./hooks/useSparkFormSubmit"
import CreateOrEditSparkViewSchema from "./schemas/CreateOrEditSparkViewSchema"

const styles = sxStyles({
   flex: {
      display: "flex",
   },
   formWrapper: {
      border: "1px solid #ECECEC",
      borderRadius: 4,
      backgroundColor: "white",
      p: 1.5,
   },
   exitIcon: {
      width: 68,
      height: 68,
   },
})

const getInitialSparkValues = (
   spark: Spark,
   selectedCreator: PublicCreator,
   cachedFormValues: SparkFormValues
): SparkFormValues => {
   if (cachedFormValues) {
      return {
         ...cachedFormValues,
         // If the user has selected a creator, that creator has priority over the cached creator
         creator: selectedCreator ?? cachedFormValues.creator ?? null,
      }
   }

   return {
      categoryId: spark?.category.id ?? "",
      question: spark?.question ?? "",
      video: spark?.video ?? null,
      published:
         spark?.published !== undefined
            ? spark.published
               ? "true"
               : "false"
            : "true",
      id: spark?.id ?? "",
      // If the user has selected a creator, that creator has priority over the current Spark's creator
      creator: selectedCreator ?? spark?.creator ?? null,
   }
}

const CreateOrEditSparkView = () => {
   const { goToSelectCreatorView } = useSparksForm()
   const { group } = useGroup()

   const selectedCreator = useSelector(sparksFormSelectedCreator)
   const selectedSparkId = useSelector(sparksSelectedSparkId)
   const cachedFormValues = useSelector(sparksCachedSparkFormValues)

   const { handleSubmit, isLoading } = useSparkFormSubmit(group.id)

   const handleBack = useCallback(() => {
      goToSelectCreatorView()
   }, [goToSelectCreatorView])

   if (isLoading) {
      return <SubmittingOverlay />
   }

   return (
      <SparkFetchWrapper
         sparkId={selectedSparkId}
         groupId={group.id}
         shouldFetch={Boolean(selectedSparkId)}
      >
         {(spark) => (
            <SparksDialog.Container
               width={"calc(100% - 46px)"}
               onMobileBack={() => handleBack()}
            >
               <SparksDialog.Content>
                  {spark ? (
                     <SparksDialog.Title>
                        Edit your{" "}
                        <Box component="span" color="secondary.main">
                           Spark
                        </Box>
                     </SparksDialog.Title>
                  ) : (
                     <SparksDialog.Title>
                        Spark{" "}
                        <Box component="span" color="secondary.main">
                           details
                        </Box>
                     </SparksDialog.Title>
                  )}
                  <SparksDialog.Subtitle>
                     It’s time to upload and set up your Spark
                  </SparksDialog.Subtitle>
                  <Box mt={3} />
                  <Box mt={"auto"} />
                  <Formik
                     initialValues={getInitialSparkValues(
                        spark,
                        selectedCreator,
                        cachedFormValues
                     )}
                     validationSchema={CreateOrEditSparkViewSchema}
                     enableReinitialize
                     onSubmit={handleSubmit}
                     validateOnMount
                  >
                     <FormComponent />
                  </Formik>
                  <SparksDialog.ActionsOffset />
                  <Box mb={"auto"} />
               </SparksDialog.Content>
            </SparksDialog.Container>
         )}
      </SparkFetchWrapper>
   )
}

const FormComponent: FC = () => {
   const cachedFormValues = useSelector(sparksCachedSparkFormValues)

   const { values, dirty, isSubmitting, isValid, submitForm } =
      useFormikContext<SparkFormValues>()

   const [deleteFiles] = useFirebaseDelete()

   const { goToSelectCreatorView, handleCacheSparksFormValues } =
      useSparksForm()

   const [isOpen, handleOpen, handleClose] = useDialogStateHandler()

   const isEditing = Boolean(values.id)

   const handleBack = useCallback(
      (shouldSave: boolean) => {
         if (shouldSave) {
            handleCacheSparksFormValues(values)
         } else {
            const isCreatingNewSpark = !isEditing
            if (isCreatingNewSpark) {
               // Delete the video that were uploaded since we are not saving the spark
               deleteFiles([
                  values.video?.url,
                  values.video?.thumbnailUrl,
               ]).catch(console.error)
            }
            handleCacheSparksFormValues(null)
         }
         goToSelectCreatorView()
         handleClose()
      },
      [
         deleteFiles,
         goToSelectCreatorView,
         handleCacheSparksFormValues,
         handleClose,
         isEditing,
         values,
      ]
   )

   const primaryAction = useMemo<ConfirmationDialogAction>(
      () => ({
         text: "Yes, keep progress",
         callback: () => handleBack(true),
         color: "secondary",
         variant: "contained",
      }),
      [handleBack]
   )

   const secondaryAction = useMemo<ConfirmationDialogAction>(
      () => ({
         text: "No, don’t save",
         callback: () => handleBack(false),
         color: "grey",
         variant: "outlined",
      }),
      [handleBack]
   )

   return (
      <>
         {values.creator ? (
            <CreatorCard
               onClick={() => handleBack(true)}
               creator={values.creator}
            />
         ) : (
            <SparksDialog.Button
               variant="contained"
               color="secondary"
               onClick={() => handleBack(true)}
            >
               Choose Creator
            </SparksDialog.Button>
         )}
         <Box mt={2} />
         <Box component={Form} sx={styles.formWrapper}>
            <Grid container spacing={1.5}>
               <Grid item xs={12} md={4}>
                  <VideoUpload editing={isEditing} name="video" />
               </Grid>
               <Grid item xs={12} md={8}>
                  <Grid container spacing={1.5} alignItems="stretch">
                     <Grid item xs={12}>
                        <SparkCategorySelect name="categoryId" />
                     </Grid>
                     <Grid item xs={12}>
                        <BrandedTextFieldField
                           name="question"
                           label="Question"
                           placeholder="Insert Spark question"
                           fullWidth
                           multiline
                           rows={10}
                        />
                     </Grid>
                     <Grid item xs={12}>
                        <SparkVisibilitySelect name="published" />
                     </Grid>
                  </Grid>
               </Grid>
            </Grid>
            <SparksDialog.Actions>
               <SparksDialog.Button
                  color="grey"
                  variant="outlined"
                  onClick={handleOpen}
               >
                  Back
               </SparksDialog.Button>
               <SparksDialog.Button
                  variant="contained"
                  onClick={submitForm}
                  // Disable the button if:
                  // 1. A submit action is ongoing (isSubmitting === true),
                  // 2. The form is invalid (!isValid), or
                  // 3. There are no changes to the form and the cachedFormValues are null
                  // which means that the user has not started editing the form yet
                  disabled={
                     isSubmitting || !isValid || (!dirty && !cachedFormValues)
                  }
                  loading={isSubmitting}
               >
                  {values.id ? "Save changes" : "Create"}
               </SparksDialog.Button>
            </SparksDialog.Actions>
         </Box>
         <ConfirmationDialog
            open={isOpen}
            handleClose={handleClose}
            description="We understand that sometimes we need to take a step back. For it, would you like to keep your current progress?"
            title="You’ve started your creation"
            icon={<ExitIcon sx={styles.exitIcon} color="secondary" />}
            primaryAction={primaryAction}
            secondaryAction={secondaryAction}
         />
      </>
   )
}

export default CreateOrEditSparkView
