import { FC, useState } from "react"
import BaseDialogView, { HeroContent, MainContent } from "../../BaseDialogView"
import { getResizedUrl } from "../../../../helperFunctions/HelperFunctions"
import { useLiveStreamDialog } from "../../LivestreamDialog"
import useIsMobile from "../../../../custom-hook/useIsMobile"
import Typography from "@mui/material/Typography"
import { sxStyles } from "../../../../../types/commonTypes"
import Box from "@mui/material/Box"
import Image from "next/image"
import Stack from "@mui/material/Stack"
import { InputBase } from "@mui/material"
import { LoadingButton } from "@mui/lab"
import { Field, Form, Formik } from "formik"
import * as Yup from "yup"
import {
   maxQuestionLength,
   minQuestionLength,
} from "../../../../../constants/forms"
import { QuestionsComponent } from "../livestream-details/main-content/Questions"
import Button from "@mui/material/Button"
import { useFirebaseService } from "../../../../../context/firebase/FirebaseServiceContext"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import { LivestreamQuestion } from "@careerfairy/shared-lib/livestreams"

const styles = sxStyles({
   title: {
      textAlign: "center",
      fontWeight: 500,
      fontSize: {
         xs: "1.4285rem",
         sm: "2.571rem",
      },
   },
   logoWrapper: {
      p: 1,
      background: "white",
      borderRadius: 2,
      display: "flex",
      width: 65,
   },
   questionForm: {
      width: "100%",
      borderRadius: 2,
      border: "1px solid #DCDCDC",
      boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.04)",
      p: 2.5,
      bgcolor: "background.paper",
      display: "flex",
      flexDirection: "column",
      position: "relative",
   },
   errorText: {
      position: "absolute",
      bottom: 0,
      left: 0,
      color: "error.main",
      p: 1,
   },
   contentOffset: {
      mt: -8,
   },
   formInput: {
      fontSize: "1.143rem",
      border: "none",
      boxShadow: "none",
   },
   btn: {
      ml: "auto",
      boxShadow: "none",
      py: 0.75,
      px: 2.5,
      fontSize: "1.214rem",
      fontWeight: 400,
      textTransform: "none",
   },
   questionListTitle: {
      fontSize: "1.2rem",
      fontWeight: 500,
   },
})

type Props = {}

const RegisterAskQuestionsView: FC<Props> = (props) => {
   const { livestream, closeDialog } = useLiveStreamDialog()
   const { userPresenter, authenticatedUser } = useAuth()
   const [newlyCreatedQuestion, setNewlyCreatedQuestion] =
      useState<LivestreamQuestion>(null)
   const { createLivestreamQuestion } = useFirebaseService()

   const isMobile = useIsMobile()

   return (
      <BaseDialogView
         heroContent={
            <HeroContent
               backgroundImg={getResizedUrl(
                  livestream.backgroundImageUrl,
                  "lg"
               )}
               onBackPosition={isMobile ? "top-left" : "top-right"}
               onBackClick={closeDialog}
               noMinHeight
            >
               <Stack alignItems="center" spacing={1.75} pb={2}>
                  <Box sx={styles.logoWrapper}>
                     <Image
                        src={getResizedUrl(livestream.companyLogoUrl, "lg")}
                        width={50}
                        height={50}
                        objectFit={"contain"}
                        alt={livestream.company}
                     />
                  </Box>
                  <Typography sx={styles.title} component="h1">
                     What questions should the speaker answer?
                  </Typography>
               </Stack>
            </HeroContent>
         }
         mainContent={
            <MainContent>
               <Stack sx={styles.contentOffset} spacing={2}>
                  <Formik
                     initialValues={initailValues}
                     validationSchema={questionSchema}
                     onSubmit={async (values, helpers) => {
                        const newQuestion = await createLivestreamQuestion(
                           livestream.id,
                           {
                              title: values.question,
                              displayName: userPresenter.getDisplayName(),
                              author: authenticatedUser.email,
                           }
                        )

                        // set newly created question to be displayed at the top of the list
                        setNewlyCreatedQuestion(newQuestion)

                        // reset form
                        helpers.resetForm()
                     }}
                  >
                     {({
                        errors,
                        touched,
                        handleSubmit,
                        isValid,
                        dirty,
                        isSubmitting,
                     }) => (
                        <Box
                           component={Form}
                           onSubmit={handleSubmit}
                           sx={styles.questionForm}
                        >
                           <Field
                              as={InputBase}
                              fullWidth
                              sx={styles.formInput}
                              name="question"
                              rows={2}
                              multiline
                              placeholder="Write your question"
                              error={errors.question && touched.question}
                              helperText={
                                 errors.question &&
                                 touched.question &&
                                 errors.question
                              }
                           />
                           <Typography sx={styles.errorText}>
                              {errors.question &&
                                 touched.question &&
                                 errors.question}
                           </Typography>
                           <LoadingButton
                              sx={styles.btn}
                              disabled={!isValid || !dirty || isSubmitting}
                              variant="contained"
                              disableElevation
                              size="small"
                              type="submit"
                           >
                              Submit
                           </LoadingButton>
                        </Box>
                     )}
                  </Formik>
                  <Typography
                     gutterBottom
                     component="h6"
                     sx={styles.questionListTitle}
                  >
                     Other users questions
                  </Typography>
                  <QuestionsComponent
                     livestream={livestream}
                     newlyCreatedQuestion={newlyCreatedQuestion}
                  />
               </Stack>
            </MainContent>
         }
         fixedBottomContent={
            <Button
               sx={styles.btn}
               variant="contained"
               disableElevation
               size="small"
               fullWidth={isMobile}
               color="secondary"
            >
               Next
            </Button>
         }
      />
   )
}

const questionSchema = Yup.object().shape({
   question: Yup.string()
      .required("This field is required")
      .min(
         minQuestionLength,
         `Question must be at least ${minQuestionLength} characters long`
      )
      .max(
         maxQuestionLength,
         `Question must be less than ${maxQuestionLength} characters long`
      ),
})

const initailValues = {
   question: "",
} as const

export default RegisterAskQuestionsView
