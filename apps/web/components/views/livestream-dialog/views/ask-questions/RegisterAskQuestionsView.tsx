import { useEffect, useState } from "react"
import BaseDialogView, {
   HeroContent,
   HeroTitle,
   MainContent,
} from "../../BaseDialogView"
import { getResizedUrl } from "../../../../helperFunctions/HelperFunctions"
import { useLiveStreamDialog } from "../../LivestreamDialog"
import useIsMobile from "../../../../custom-hook/useIsMobile"
import Typography from "@mui/material/Typography"
import { sxStyles } from "../../../../../types/commonTypes"
import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import { InputBase } from "@mui/material"
import { LoadingButton } from "@mui/lab"
import { Field, Form, Formik } from "formik"
import * as Yup from "yup"
import {
   maxQuestionLength,
   minQuestionLength,
} from "@careerfairy/shared-lib/constants/forms"
import { QuestionsComponent } from "../livestream-details/main-content/Questions"
import Button from "@mui/material/Button"
import { useFirebaseService } from "../../../../../context/firebase/FirebaseServiceContext"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import { LivestreamQuestion } from "@careerfairy/shared-lib/livestreams"
import RegisterAskQuestionsViewSkeleton from "./RegisterAskQuestionsViewSkeleton"
import CircularLogo from "components/views/common/logos/CircularLogo"

const styles = sxStyles({
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
      mt: { xs: -7.8, md: -15 },
      height: "100%",
      display: "flex",
   },
   formInput: {
      fontSize: "1.143rem",
      border: "none",
      boxShadow: "none",
      "& textarea": {
         "&::placeholder": {
            color: "neutral.600",
            opacity: 1,
         },
      },
   },
   btn: {
      ml: "auto",
   },
   heroContent: {
      height: { xs: "229px", md: "366px" },
      justifyContent: "start",
      flex: "none",
   },
   mainContent: {
      px: { xs: "10px", md: "45px" },
      height: "100%",
      display: "flex",
      flexDirection: "column",
   },
   heroContentStack: {
      alignItems: "center",
      pb: 2,
      marginTop: -1,
   },
})

const RegisterAskQuestionsView = () => {
   const { livestream, goToView } = useLiveStreamDialog()
   const { userPresenter, authenticatedUser } = useAuth()
   const { createLivestreamQuestion } = useFirebaseService()

   const [newlyCreatedQuestions, setNewlyCreatedQuestions] = useState<
      LivestreamQuestion[]
   >([])

   const isMobile = useIsMobile()

   useEffect(() => {
      if (livestream.questionsDisabled) {
         goToView("register-join-talent-pool")
      }
   }, [livestream.questionsDisabled, goToView])

   if (livestream.questionsDisabled) {
      return <RegisterAskQuestionsViewSkeleton />
   }

   return (
      <BaseDialogView
         heroContent={
            <HeroContent
               backgroundImg={getResizedUrl(
                  livestream.backgroundImageUrl,
                  "lg"
               )}
               onBackPosition={"top-left"}
               onBackClick={() => goToView("livestream-details")}
               noMinHeight
               sx={styles.heroContent}
            >
               <Stack spacing={{ xs: 0.5, md: 3 }} sx={styles.heroContentStack}>
                  <CircularLogo
                     src={getResizedUrl(livestream.companyLogoUrl, "lg")}
                     alt={livestream.company}
                     size={isMobile ? 80 : 104}
                  />
                  <HeroTitle>
                     What questions should
                     <br />
                     the speaker answer?
                  </HeroTitle>
               </Stack>
            </HeroContent>
         }
         mainContent={
            <MainContent sx={styles.mainContent}>
               <Stack sx={styles.contentOffset} spacing={3}>
                  <Formik
                     initialValues={initialValues}
                     validationSchema={questionSchema}
                     onSubmit={async (values, helpers) => {
                        const newQuestion = await createLivestreamQuestion(
                           livestream.id,
                           {
                              title: values.question,
                              displayName:
                                 userPresenter?.getDisplayName?.() || null,
                              author: authenticatedUser.email,
                           }
                        )

                        // set newly created question to be displayed at the top of the list
                        setNewlyCreatedQuestions((prev) => [
                           newQuestion,
                           ...prev,
                        ])

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
                              error={errors.question ? touched.question : null}
                           />
                           <Typography sx={styles.errorText}>
                              {errors.question && touched.question
                                 ? errors.question
                                 : null}
                           </Typography>
                           <LoadingButton
                              sx={styles.btn}
                              disabled={!isValid || !dirty || isSubmitting}
                              loading={isSubmitting}
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
                  <QuestionsComponent
                     livestream={livestream}
                     userAddedQuestions={newlyCreatedQuestions}
                     infiniteScroll
                     responsive
                  />
               </Stack>
            </MainContent>
         }
         fixedBottomContent={
            <Button
               sx={styles.btn}
               variant="contained"
               disableElevation
               size="medium"
               fullWidth={isMobile}
               onClick={() => goToView("register-join-talent-pool")}
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
      .required("")
      .min(
         minQuestionLength,
         `Question must be at least ${minQuestionLength} characters long`
      )
      .max(
         maxQuestionLength,
         `Question must be less than ${maxQuestionLength} characters long`
      ),
})

const initialValues = {
   question: "",
} as const

export default RegisterAskQuestionsView
