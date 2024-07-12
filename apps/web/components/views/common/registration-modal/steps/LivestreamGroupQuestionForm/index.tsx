/* eslint-disable no-extra-semi */
import { LivestreamGroupQuestionsMap } from "@careerfairy/shared-lib/livestreams"
import {
   Box,
   Button,
   CircularProgress,
   DialogActions,
   DialogContent,
   DialogContentText,
   DialogTitle,
   Typography,
} from "@mui/material"
import Stack from "@mui/material/Stack"
import makeStyles from "@mui/styles/makeStyles"
import { RegistrationContext } from "context/registration/RegistrationContext"
import { Form, Formik } from "formik"
import { useContext, useEffect, useState } from "react"
import { useAuth } from "../../../../../../HOCs/AuthProvider"
import { groupRepo } from "../../../../../../data/RepositoryInstances"
import LivestreamGroupQuestionsSelector from "../../../../profile/LivestreamGroupQuestionsSelector"
import GroupLogo from "../../common/GroupLogo"
import {
   checkIfUserHasAnsweredAllLivestreamGroupQuestions,
   validate,
} from "./util"

const useStyles = makeStyles({
   actions: {
      display: "flex",
      flexFlow: "column",
      alignItems: "center",
   },
   loaderWrapper: {
      height: 200,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
   },
})

const LivestreamGroupQuestionForm = () => {
   const {
      group,
      groupsWithPolicies,
      livestream,
      completeRegistrationProcess,
      handleClose,
      gettingPolicyStatus,
      hasAgreedToAll: hasAgreedToAllPrivacyPolicies,
      onQuestionsAnswered,
      cancelable,
   } = useContext(RegistrationContext)

   const { userData } = useAuth()
   const classes = useStyles()

   const [checkingQuestions, setCheckingQuestions] = useState(true)
   const [registrationFormValues, setRegistrationFormValues] =
      useState<LivestreamGroupQuestionsMap>({})

   useEffect(() => {
      ;(async () => {
         try {
            if (!livestream || !userData?.userEmail || gettingPolicyStatus)
               return

            setCheckingQuestions(true)
            const answeredLivestreamGroupQuestions =
               await groupRepo.mapUserAnswersToLivestreamGroupQuestions(
                  userData,
                  livestream
               )
            const hasAnsweredAllQuestions =
               checkIfUserHasAnsweredAllLivestreamGroupQuestions(
                  answeredLivestreamGroupQuestions
               )

            if (hasAgreedToAllPrivacyPolicies && hasAnsweredAllQuestions) {
               await handleSubmit(answeredLivestreamGroupQuestions)
            } else {
               setRegistrationFormValues((prevState) =>
                  Object.assign(
                     {},
                     prevState,
                     answeredLivestreamGroupQuestions || {}
                  )
               )
            }
         } catch (e) {
            console.error(e)
         }
         setCheckingQuestions(false)
      })()
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [
      livestream?.groupQuestionsMap,
      userData?.userEmail,
      hasAgreedToAllPrivacyPolicies,
      gettingPolicyStatus,
   ])

   const handleSubmit = async (values: LivestreamGroupQuestionsMap) => {
      await completeRegistrationProcess(values)
      onQuestionsAnswered?.(values)
   }

   if (checkingQuestions || gettingPolicyStatus) {
      return (
         <div className={classes.loaderWrapper}>
            <CircularProgress />
         </div>
      )
   }

   return (
      <Formik
         initialValues={registrationFormValues}
         enableReinitialize
         onSubmit={handleSubmit}
         validate={validate}
         validateOnMount
      >
         {({
            handleSubmit,
            isSubmitting,
            values,
            setFieldValue,
            errors,
            handleBlur,
            touched,
            isValid,
         }) => {
            return (
               <Form
                  onSubmit={(e) => {
                     e.preventDefault()
                     handleSubmit()
                  }}
               >
                  <DialogTitle>
                     {`${livestream?.company} Would Like To Know More About You`}
                  </DialogTitle>
                  <GroupLogo
                     logoUrl={livestream?.companyLogoUrl}
                     alt={livestream?.company}
                  />
                  <DialogContent>
                     <Stack spacing={2}>
                        <DialogContentText gutterBottom align="center">
                           {group.description}
                        </DialogContentText>
                        <Stack spacing={2}>
                           {Object.values(values).map((groupQuestions) => (
                              <LivestreamGroupQuestionsSelector
                                 key={groupQuestions.groupId}
                                 /*// @ts-ignore*/
                                 errors={errors}
                                 touched={touched}
                                 handleBlur={handleBlur}
                                 groupQuestions={groupQuestions}
                                 setFieldValue={setFieldValue}
                              />
                           ))}
                        </Stack>
                        {!!groupsWithPolicies.length && (
                           <Box className={classes.actions}>
                              {groupsWithPolicies.map((group) => (
                                 <Typography
                                    key={group.id}
                                    style={{ fontSize: "0.8rem" }}
                                 >
                                    Your participant information (surname, first
                                    name, university affiliation) and the data
                                    above will be transferred to the organizer
                                    when you register for the event. The data
                                    protection notice of the organizer applies.
                                    You can find it
                                    <a
                                       target="_blank"
                                       style={{ marginLeft: 4 }}
                                       href={group.privacyPolicyUrl}
                                       rel="noreferrer"
                                    >
                                       here
                                    </a>
                                    .
                                 </Typography>
                              ))}
                           </Box>
                        )}
                     </Stack>
                  </DialogContent>
                  <DialogActions>
                     {Boolean(!livestream?.hasStarted && cancelable) && (
                        <Button size="large" color="grey" onClick={handleClose}>
                           Cancel
                        </Button>
                     )}
                     <Button
                        disabled={isSubmitting || !isValid}
                        type="submit"
                        variant="contained"
                        size="large"
                        endIcon={
                           Boolean(isSubmitting) && (
                              <CircularProgress size={20} color="inherit" />
                           )
                        }
                        color="primary"
                     >
                        {livestream?.hasStarted
                           ? "Enter event"
                           : "Attend Event"}
                     </Button>
                  </DialogActions>
               </Form>
            )
         }}
      </Formik>
   )
}

export default LivestreamGroupQuestionForm
