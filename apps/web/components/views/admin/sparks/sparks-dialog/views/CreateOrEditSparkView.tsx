import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { Box, Grid } from "@mui/material"
import CreatorFetchWrapper from "HOCs/creator/CreatorFetchWrapper"
import SparkFetchWrapper from "HOCs/spark/SparkFetchWrapper"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import { BrandedTextFieldField } from "components/views/common/inputs/BrandedTextField"
import { Form, Formik, useFormikContext } from "formik"
import { useGroup } from "layouts/GroupDashboardLayout"
import AreYouSureModal from "materialUI/GlobalModals/AreYouSureModal"
import { FC, useCallback } from "react"
import { useSelector } from "react-redux"
import {
   sparksCachedSparkFormValues,
   sparksSelectedCreatorId,
   sparksSelectedSparkId,
} from "store/selectors/adminSparksSelectors"
import { sxStyles } from "types/commonTypes"
import SparksDialog, { useSparksForm } from "../SparksDialog"
import CreatorCard from "./components/CreatorCard"
import SparkCategorySelect from "./components/SparkCategorySelect"
import SparkVisibilitySelect from "./components/SparkVisibilitySelect"
import VideoUpload from "./components/VideoUpload"
import useSparkFormSubmit, { SparkFormValues } from "./hooks/useSparkFormSubmit"
import CreateOrEditSparkViewSchema from "./schemas/CreateOrEditSparkViewSchema"
import { Creator } from "@careerfairy/shared-lib/groups/creators"

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
   questionTextField: {
      "& textarea": {
         height: "182px !important",
      },
   },
})

const getInitialSparkValues = (spark?: Spark): SparkFormValues => ({
   categoryId: spark?.category.id ?? "",
   question: spark?.question ?? "",
   videoFile: null,
   published: spark?.published ? "true" : "false",
   videoId: spark?.videoId ?? "",
   id: spark?.id ?? "",
   videoUrl: spark?.videoUrl ?? "",
})

const CreateOrEditSparkView = () => {
   const { goToSelectCreatorView } = useSparksForm()
   const { group } = useGroup()

   const selectedCreatorId = useSelector(sparksSelectedCreatorId)
   const selectedSparkId = useSelector(sparksSelectedSparkId)
   const cachedFormValues = useSelector(sparksCachedSparkFormValues)

   const { handleSubmit } = useSparkFormSubmit(group.id)

   const handleBack = useCallback(() => {
      goToSelectCreatorView()
   }, [goToSelectCreatorView])

   return (
      <CreatorFetchWrapper
         groupId={group.id}
         selectedCreatorId={selectedCreatorId}
         shouldFetch={Boolean(selectedCreatorId)}
      >
         {(creator) => (
            <SparkFetchWrapper
               sparkId={selectedSparkId}
               groupId={group.id}
               shouldFetch={Boolean(selectedSparkId)}
            >
               {(spark) => (
                  <SparksDialog.Container
                     width={652}
                     onMobileBack={() => handleBack()}
                  >
                     {spark ? (
                        <SparksDialog.Title pl={2}>
                           Edit your{" "}
                           <Box component="span" color="secondary.main">
                              Spark
                           </Box>
                        </SparksDialog.Title>
                     ) : (
                        <SparksDialog.Title pl={2}>
                           Spark{" "}
                           <Box component="span" color="secondary.main">
                              details
                           </Box>
                        </SparksDialog.Title>
                     )}
                     <SparksDialog.Subtitle>
                        {spark
                           ? "Please check if that’s the correct creator"
                           : "Insert your new creator details!"}
                     </SparksDialog.Subtitle>

                     {/* <Box pt={2} />  */}
                     <Formik
                        initialValues={
                           cachedFormValues || getInitialSparkValues(spark)
                        }
                        validationSchema={CreateOrEditSparkViewSchema}
                        enableReinitialize
                        onSubmit={handleSubmit}
                     >
                        <FormComponent creator={creator} />
                     </Formik>
                     <SparksDialog.ActionsOffset />
                  </SparksDialog.Container>
               )}
            </SparkFetchWrapper>
         )}
      </CreatorFetchWrapper>
   )
}

type FormComponentProps = {
   creator: Creator | null
}

const FormComponent: FC<FormComponentProps> = ({ creator }) => {
   const { values, dirty, isSubmitting, isValid, submitForm } =
      useFormikContext<SparkFormValues>()

   const { goToSelectCreatorView, handleCacheSparksFormValues } =
      useSparksForm()

   const [isOpen, handleOpen, handleClose] = useDialogStateHandler()

   const handleBack = useCallback(
      (shouldSave: boolean) => {
         if (shouldSave) {
            handleCacheSparksFormValues(values)
         } else {
            handleCacheSparksFormValues(null)
         }
         goToSelectCreatorView()
         handleClose()
      },
      [goToSelectCreatorView, handleCacheSparksFormValues, handleClose, values]
   )

   return (
      <>
         {creator ? (
            <CreatorCard onClick={() => handleBack(true)} creator={creator} />
         ) : (
            "No creator found"
         )}
         <Box mt={2} />
         <Box component={Form} sx={styles.formWrapper}>
            <Grid container spacing={1.5}>
               <Grid item xs={12} md={4.7}>
                  <VideoUpload name="videoFile" />
               </Grid>
               <Grid item xs={12} md={7.2}>
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
                           rows={8}
                           sx={styles.questionTextField}
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
                  disabled={isSubmitting || !dirty || !isValid}
                  loading={isSubmitting}
               >
                  {values.id ? "Save changes" : "Create"}
               </SparksDialog.Button>
            </SparksDialog.Actions>
         </Box>
         <AreYouSureModal
            open={isOpen}
            handleClose={() => handleBack(false)}
            handleConfirm={() => handleBack(true)}
            confirmButtonText="Yes, keep progress"
            closeButtonText="No, don't save"
            title="You’ve started your creation"
            message="We understand that sometimes we need to take a step back. For it, would you like to keep your current progress?"
         />
      </>
   )
}

export default CreateOrEditSparkView
