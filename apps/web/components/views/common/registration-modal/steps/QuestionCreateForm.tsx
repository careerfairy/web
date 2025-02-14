import {
   maxQuestionLength,
   minQuestionLength,
} from "@careerfairy/shared-lib/constants/forms"
import {
   Button,
   DialogActions,
   DialogContent,
   DialogTitle,
   Grid,
   Slide,
   TextField,
} from "@mui/material"
import makeStyles from "@mui/styles/makeStyles"
import { livestreamService } from "data/firebase/LivestreamService"
import { recommendationServiceInstance } from "data/firebase/RecommendationService"
import { rewardService } from "data/firebase/RewardService"
import { useFormik } from "formik"
import { useRouter } from "next/router"
import { useContext } from "react"
import { AnalyticsEvents } from "util/analyticsConstants"
import { questionIcon } from "../../../../../constants/svgs"
import { RegistrationContext } from "../../../../../context/registration/RegistrationContext"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import { dataLayerLivestreamEvent } from "../../../../../util/analyticsUtils"
import GroupLogo from "../common/GroupLogo"

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
            await livestreamService.createQuestion(
               livestreamService.getLivestreamRef(livestream?.id),
               {
                  title: values.questionTitle,
                  author: authenticatedUser.uid,
                  displayName: userPresenter?.getDisplayName?.() || null,
                  badges: [],
               }
            )

            rewardService
               .userAction("LIVESTREAM_USER_ASKED_QUESTION", livestream?.id)
               .then(() => console.log("Rewarded Question Asked"))
               .catch(console.error)

            recommendationServiceInstance.createdQuestion(livestream, userData)

            customHandleNext()

            dataLayerLivestreamEvent(
               AnalyticsEvents.EventRegistrationQuestionSubmit,
               livestream
            )
         } catch (e) {
            console.error(e)
         }
      },
      validate: (values) => {
         const errors: { questionTitle?: string } = {}
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
                     {/* eslint-disable-next-line @next/next/no-img-element */}
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
