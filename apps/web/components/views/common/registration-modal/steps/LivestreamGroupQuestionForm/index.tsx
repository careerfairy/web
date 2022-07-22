import React, { useContext, useEffect, useState } from "react"
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
import makeStyles from "@mui/styles/makeStyles"
import { RegistrationContext } from "context/registration/RegistrationContext"
import { useAuth } from "../../../../../../HOCs/AuthProvider"
import GroupLogo from "../../common/GroupLogo"
import LivestreamGroupQuestionsSelector from "../../../../profile/LivestreamGroupQuestionsSelector"
import Stack from "@mui/material/Stack"
import { userRepo } from "../../../../../../data/RepositoryInstances"
import { LivestreamGroupQuestionsMap } from "@careerfairy/shared-lib/dist/livestreams"
import { Formik } from "formik"
import {
   checkIfUserHasAnsweredAllLivestreamGroupQuestions,
   validate,
} from "./util"

const useStyles = makeStyles((theme) => ({
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
}))
const LivestreamGroupQuestionForm = () => {
   const {
      group,
      groupsWithPolicies,
      livestream,
      completeRegistrationProcess,
      handleClose,
      gettingPolicyStatus,
      hasAgreedToAll,
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
            setCheckingQuestions(true)
            const answeredLivestreamGroupQuestions =
               await userRepo.mapUserAnswersToLivestreamGroupQuestionWithAnswers(
                  userData?.userEmail,
                  livestream.groupQuestionsMap
               )
            const hasAnsweredAllQuestions =
               checkIfUserHasAnsweredAllLivestreamGroupQuestions(
                  answeredLivestreamGroupQuestions
               )
            if (hasAgreedToAll && hasAnsweredAllQuestions) {
               await handleSubmit(answeredLivestreamGroupQuestions)
            } else {
               setRegistrationFormValues((prevState) =>
                  Object.assign({}, prevState, answeredLivestreamGroupQuestions)
               )
            }
         } catch (e) {}
         setCheckingQuestions(false)
      })()
   }, [livestream.groupQuestionsMap, userData?.userEmail, hasAgreedToAll])

   if (checkingQuestions || gettingPolicyStatus) {
      return (
         <div className={classes.loaderWrapper}>
            <CircularProgress />
         </div>
      )
   }

   const handleSubmit = async (values: LivestreamGroupQuestionsMap) => {
      await completeRegistrationProcess(values)
      onQuestionsAnswered?.(values)
   }

   return (
      <Formik
         initialValues={registrationFormValues}
         enableReinitialize
         onSubmit={handleSubmit}
         validate={validate}
      >
         {({
            handleSubmit,
            isSubmitting,
            values,
            setFieldValue,
            isValid,
            errors,
            handleBlur,
            touched,
         }) => {
            return (
               <>
                  <DialogTitle>
                     {livestream?.hasStarted && group?.universityName
                        ? `${group.universityName} Would Like To Know More About You`
                        : "Join live streams from"}
                  </DialogTitle>
                  <GroupLogo
                     logoUrl={livestream?.companyLogoUrl}
                     alt={livestream.company}
                  />
                  <DialogContent>
                     <DialogContentText align="center" noWrap>
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
                     <Box p={2} className={classes.actions}>
                        {groupsWithPolicies.map((group) => (
                           <Typography
                              key={group.id}
                              style={{ fontSize: "0.8rem" }}
                           >
                              Your participant information (surname, first name,
                              university affiliation) and the data above will be
                              transferred to the organizer when you register for
                              the event. The data protection notice of the
                              organizer applies. You can find it
                              <a
                                 target="_blank"
                                 style={{ marginLeft: 4 }}
                                 href={group.privacyPolicyUrl}
                              >
                                 here
                              </a>
                              .
                           </Typography>
                        ))}
                     </Box>
                  </DialogContent>
                  <DialogActions>
                     {!livestream?.hasStarted && cancelable && (
                        <Button size="large" color="grey" onClick={handleClose}>
                           Cancel
                        </Button>
                     )}
                     <Button
                        disabled={isSubmitting || !isValid}
                        variant="contained"
                        size="large"
                        endIcon={
                           isSubmitting && (
                              <CircularProgress size={20} color="inherit" />
                           )
                        }
                        onClick={handleSubmit as any}
                        color="primary"
                        autoFocus
                     >
                        {livestream?.hasStarted ? "Enter event" : "I'll attend"}
                     </Button>
                  </DialogActions>
               </>
            )
         }}
      </Formik>
   )
}

export default LivestreamGroupQuestionForm
