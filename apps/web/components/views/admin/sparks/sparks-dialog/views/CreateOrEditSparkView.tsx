import {
   Spark,
   SparkCategory,
   SparksCategories,
} from "@careerfairy/shared-lib/sparks/sparks"
import { Box, Grid } from "@mui/material"
import CreatorFetchWrapper from "HOCs/creator/CreatorFetchWrapper"
import SparkFetchWrapper from "HOCs/spark/SparkFetchWrapper"
import useUploadSparkVideo from "components/custom-hook/sparks/useUploadSparkVideo"
import { getVideoFileDuration } from "components/helperFunctions/validators/video"
import { BrandedTextFieldField } from "components/views/common/inputs/BrandedTextField"
import { Form, Formik } from "formik"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useCallback } from "react"
import { useSelector } from "react-redux"
import {
   sparksSelectedCreatorId,
   sparksSelectedSparkId,
} from "store/selectors/adminSparksSelectors"
import { sxStyles } from "types/commonTypes"
import * as yup from "yup"
import SparksDialog, { useSparksForm } from "../SparksDialog"
import CreatorCard from "./components/CreatorCard"
import SparkCategorySelect from "./components/SparkCategorySelect"
import SparkVisibilitySelect, {
   publishedOptions,
} from "./components/SparkVisibilitySelect"
import VideoUpload from "./components/VideoUpload"

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
})

type FormValues = {
   category: SparkCategory["id"] | ""
   question: string
   videoFile: File
   videoId: string
   published: "true" | "false" // visibility
}

const getInitialSparkValues = (spark?: Spark): FormValues => ({
   category: spark?.category.id ?? "",
   question: spark?.question ?? "",
   videoFile: null,
   published: spark?.published ? "true" : "false",
   videoId: spark?.videoId ?? "",
})

const CreateOrEditSparkView = () => {
   const { goToSelectCreatorView, goToCreatorSelectedView } = useSparksForm()
   const { group } = useGroup()
   const { handleUploadFile } = useUploadSparkVideo()

   const selectedCreatorId = useSelector(sparksSelectedCreatorId)
   const selectedSparkId = useSelector(sparksSelectedSparkId)

   const handleBack = useCallback(
      (callback?: () => void) => {
         goToSelectCreatorView()
         if (callback) callback()
      },
      [goToSelectCreatorView]
   )

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
                     <Box mt={4} />
                     {creator ? (
                        <CreatorCard
                           onClick={goToSelectCreatorView}
                           creator={creator}
                        />
                     ) : (
                        "No creator found"
                     )}
                     <Box pt={2} />
                     <Formik
                        initialValues={getInitialSparkValues(spark)}
                        validationSchema={CreateOrEditSparkViewSchema}
                        enableReinitialize
                        onSubmit={async (
                           values,
                           { setSubmitting, setFieldError }
                        ) => {
                           let videoUrl = spark.videoUrl
                           let sparkVideoId = spark.videoId

                           let creatorId = spark?.id
                           const isPublished = values.published === "true"

                           if (values.videoFile) {
                              const { url, videoId } = await handleUploadFile(
                                 values.videoFile
                              )

                              videoUrl = url
                              sparkVideoId = videoId
                           }

                           if (spark) {
                              // update spark
                           } else {
                              // create new spark
                           }

                           setSubmitting(false)

                           goToCreatorSelectedView(creatorId)
                        }}
                     >
                        {({
                           submitForm,
                           isSubmitting,
                           dirty,
                           isValid,
                           resetForm,
                        }) => (
                           <Box component={Form} sx={styles.formWrapper}>
                              <Grid container spacing={1.5}>
                                 <Grid sx={styles.flex} item xs={12} md={4.75}>
                                    <VideoUpload name="videoFile" />
                                 </Grid>
                                 <Grid item xs={12} md={7.25}>
                                    <Grid container spacing={1.5}>
                                       <Grid item xs={12}>
                                          <SparkCategorySelect name="category" />
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
                                    onClick={() => handleBack(resetForm)}
                                 >
                                    Back
                                 </SparksDialog.Button>
                                 <SparksDialog.Button
                                    variant="contained"
                                    onClick={submitForm}
                                    disabled={
                                       isSubmitting || !dirty || !isValid
                                    }
                                    loading={isSubmitting}
                                 >
                                    {spark ? "Save changes" : "Create"}
                                 </SparksDialog.Button>
                              </SparksDialog.Actions>
                           </Box>
                        )}
                     </Formik>
                     <SparksDialog.ActionsOffset />
                  </SparksDialog.Container>
               )}
            </SparkFetchWrapper>
         )}
      </CreatorFetchWrapper>
   )
}

const categories = Object.values(SparksCategories).map(
   (category) => category.id
)

const publishedValues = publishedOptions.map((option) => option.value)

const CreateOrEditSparkViewSchema = yup.object().shape({
   categoryId: yup.string().oneOf(categories).required(),
   question: yup.string().required().max(100).min(10),
   videoFile: yup.mixed<File>().when("videoId", {
      is: (videoId: string) => {
         return !videoId
      }, // if videoId is not set
      then: yup // then videoFile is required
         .mixed<File>()
         .required("Video is required")
         .test("videoFile", "Video is required", function (value) {
            return Boolean(value)
         })
         .test(
            "videoFile",
            "Video length should be between 10 and 60 seconds",
            async function (value) {
               try {
                  const duration = await getVideoFileDuration(value)
                  if (duration < 10 || duration > 60) {
                     // min 10 seconds, max 60 seconds
                     return this.createError({
                        message: `Invalid video length. Your video is ${duration.toFixed(
                           2
                        )} seconds long, but it should be between 10 and 60 seconds.`,
                     })
                  }
                  return true
               } catch (err) {
                  return this.createError({
                     message: err,
                  })
               }
            }
         ),
   }),
   videoId: yup.string().nullable(),
   published: yup.string().oneOf(publishedValues).required(),
})

export default CreateOrEditSparkView
