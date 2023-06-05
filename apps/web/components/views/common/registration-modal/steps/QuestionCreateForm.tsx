import React, { useContext } from "react"
import makeStyles from "@mui/styles/makeStyles"
import GroupLogo from "../common/GroupLogo"
import {
   Button,
   DialogActions,
   DialogContent,
   DialogTitle,
   Grid,
   Slide,
   TextField,
} from "@mui/material"
import { RegistrationContext } from "../../../../../context/registration/RegistrationContext"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import { useRouter } from "next/router"
import { useFirebaseService } from "../../../../../context/firebase/FirebaseServiceContext"
import { useFormik } from "formik"
import { questionIcon } from "../../../../../constants/svgs"
import {
   maxQuestionLength,
   minQuestionLength,
} from "../../../../../constants/forms"
import { dataLayerLivestreamEvent } from "../../../../../util/analyticsUtils"
import { recommendationServiceInstance } from "data/firebase/RecommendationService"
import { rewardService } from "data/firebase/RewardService"

const useStyles = makeStyles((theme) => ({
   root: {
      width: "100%",
      display: "flex",
   },
   gridContainer: {
      width: "100%",
   },
   actions: {
      alignSelf: "flex-end",
   },
   imgGrid: {
      background: theme.palette.primary.main,
      overflow: "hidden",
   },
   imgWrapper: {
      width: "100%",
      height: "100%",
      position: "relative",
      "& img": {
         position: "absolute",
         objectFit: "contain",
         maxWidth: "100%",
         maxHeight: "100%",
         transform: "translate(-50%, -50%)",
         top: "50%",
         left: "50%",
         padding: theme.spacing(2),
      },
   },
   details: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
   },
   content: {
      width: "100%",
   },
}))

const QuestionCreateForm = () => {
   const { handleNext, livestream, handleGoToLast } =
      useContext(RegistrationContext)
   const classes = useStyles()
   const { replace } = useRouter()
   const { createLivestreamQuestion } = useFirebaseService()
   const { authenticatedUser, userData, userPresenter } = useAuth()

   const {
      handleChange,
      values,
      touched,
      handleSubmit,
      errors,
      handleBlur,
      isSubmitting,
   } = useFormik({
      initialValues: {
         questionTitle: "",
      },
      onSubmit: async (values) => {
         if (!authenticatedUser) {
            return replace("/signup")
         }
         try {
            await createLivestreamQuestion(livestream?.id, {
               title: values.questionTitle,
               author: authenticatedUser.email,
               displayName: userPresenter?.getDisplayName?.() || null,
            })

            rewardService
               .userAction("LIVESTREAM_USER_ASKED_QUESTION", livestream?.id)
               .then((_) => console.log("Rewarded Question Asked"))
               .catch(console.error)

            recommendationServiceInstance.createdQuestion(livestream, userData)

            customHandleNext()

            dataLayerLivestreamEvent(
               "event_registration_question_submit",
               livestream
            )
         } catch (e) {}
      },
      validate: (values) => {
         let errors: { questionTitle?: string } = {}
         if (!values.questionTitle) {
            errors.questionTitle = "Please enter a title"
         }
         if (values.questionTitle.length < minQuestionLength) {
            errors.questionTitle = `Must be at least ${minQuestionLength} characters`
         }
         if (values.questionTitle.length > maxQuestionLength) {
            errors.questionTitle = `Must be less than ${maxQuestionLength} characters`
         }
         return errors
      },
   })

   const customHandleNext = () => {
      const isAlreadyInTalentPool =
         userData?.talentPools &&
         livestream &&
         userData.talentPools.includes(livestream?.companyId)
      if (livestream?.hasNoTalentPool || isAlreadyInTalentPool) {
         // go to final step
         handleGoToLast()
      } else {
         // go to next talent pool step
         handleNext()
      }
      dataLayerLivestreamEvent("event_registration_question_skip", livestream)
   }

   return (
      <div className={classes.root}>
         <Grid
            justifyContent="center"
            className={classes.gridContainer}
            container
         >
            <Grid className={classes.details} item xs={12} sm={8}>
               <GroupLogo logoUrl={livestream?.companyLogoUrl} />
               {/* @ts-ignore */}
               <DialogTitle align="center">
                  ASK YOUR QUESTION. GET THE ANSWER DURING THE LIVE STREAM.
               </DialogTitle>
               <DialogContent className={classes.content}>
                  <TextField
                     variant="outlined"
                     id="questionTitle"
                     name="questionTitle"
                     label="Your Question"
                     value={values.questionTitle}
                     placeholder={"What would like to ask our speaker?"}
                     // @ts-ignore
                     maxLength="170"
                     error={
                        touched.questionTitle
                           ? Boolean(errors.questionTitle)
                           : null
                     }
                     helperText={
                        touched.questionTitle ? errors.questionTitle : null
                     }
                     inputProps={{ maxLength: maxQuestionLength }}
                     fullWidth
                     onBlur={handleBlur}
                     onChange={handleChange}
                     disabled={isSubmitting}
                  />
               </DialogContent>
               <DialogActions className={classes.actions}>
                  <Button
                     variant="text"
                     disabled={isSubmitting}
                     size="large"
                     onClick={customHandleNext}
                     color="primary"
                     autoFocus
                  >
                     Skip
                  </Button>
                  {/* @ts-ignore */}
                  <Button
                     variant="contained"
                     size="large"
                     onClick={handleSubmit}
                     color="primary"
                     autoFocus
                     disabled={isSubmitting}
                  >
                     Submit
                  </Button>
               </DialogActions>
            </Grid>
            <Grid className={classes.imgGrid} item sm={4}>
               <Slide timeout={700} direction="up" in>
                  <div className={classes.imgWrapper}>
                     <img
                        src={questionIcon}
                        alt="question prompt illustration"
                     />
                  </div>
               </Slide>
            </Grid>
         </Grid>
      </div>
   )
}

export default QuestionCreateForm
