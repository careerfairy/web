import { LivestreamGroupQuestionsMap } from "@careerfairy/shared-lib/src/livestreams"
import { Box, Button, Stack, Typography } from "@mui/material"
import { Form, Formik } from "formik"
import { useCallback } from "react"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import useIsMobile from "../../../../custom-hook/useIsMobile"
import useSnackbarNotifications from "../../../../custom-hook/useSnackbarNotifications"
import { SuspenseWithBoundary } from "../../../../ErrorBoundary"
import { getResizedUrl } from "../../../../helperFunctions/HelperFunctions"
import { validate } from "../../../common/registration-modal/steps/LivestreamGroupQuestionForm/util"
import LivestreamGroupQuestionsSelector from "../../../profile/LivestreamGroupQuestionsSelector"
import BaseDialogView, { HeroContent } from "../../BaseDialogView"
import { useLiveStreamDialog } from "../../LivestreamDialog"
import RegistrationPreConditions from "../../RegistrationPreConditions"
import useRegistrationHandler from "../../useRegistrationHandler"
import HostInfo from "../livestream-details/HostInfo"
import LivestreamTitle from "../livestream-details/LivestreamTitle"
import GroupConsentDataFetching from "./GroupConsentDataFetching"
import RegisterDataConsentViewSkeleton from "./RegisterDataConsentViewSkeleton"

/**
 * UI for the user to answer the group questions and give consent
 */
const GroupQuestionsForm = () => {
   const { livestream, goToView, registrationState, livestreamPresenter } =
      useLiveStreamDialog()
   const { userData, authenticatedUser } = useAuth()
   const isMobile = useIsMobile()
   const { groupsWithPolicies, answers } = registrationState
   const { completeRegistrationProcess } = useRegistrationHandler()
   const { errorNotification } = useSnackbarNotifications()

   const handleSubmit = useCallback(
      async (values: LivestreamGroupQuestionsMap) => {
         completeRegistrationProcess(
            userData,
            authenticatedUser,
            livestream,
            groupsWithPolicies,
            values
         )
            .then(() => {
               goToView("register-ask-questions")
            })
            .catch((e) => {
               errorNotification(e)
            })
      },
      [
         authenticatedUser,
         completeRegistrationProcess,
         errorNotification,
         goToView,
         groupsWithPolicies,
         livestream,
         userData,
      ]
   )

   return (
      <Formik
         initialValues={answers}
         enableReinitialize
         onSubmit={handleSubmit}
         validate={validate}
         validateOnMount
      >
         {({
            handleSubmit,
            errors,
            values,
            touched,
            setFieldValue,
            handleBlur,
         }) => {
            return (
               <Form
                  onSubmit={(e) => {
                     e.preventDefault()
                     handleSubmit()
                  }}
               >
                  <BaseDialogView
                     heroContent={
                        <HeroContent
                           backgroundImg={getResizedUrl(
                              livestream.backgroundImageUrl,
                              "lg"
                           )}
                           onBackPosition={isMobile ? "top-left" : "top-right"}
                           onBackClick={() => {}}
                        >
                           <Stack
                              alignItems="center"
                              justifyContent={"center"}
                              spacing={2.5}
                           >
                              <HostInfo presenter={livestreamPresenter} />
                              <LivestreamTitle text={livestream.title} />
                           </Stack>
                        </HeroContent>
                     }
                     mainContent={
                        <Stack>
                           {!!groupsWithPolicies.length && (
                              <Box>
                                 {groupsWithPolicies.map((group) => (
                                    <Typography
                                       key={group.id}
                                       style={{ fontSize: "0.8rem" }}
                                    >
                                       {group.universityName}&nbsp; Your
                                       participant information (surname, first
                                       name, university affiliation) and the
                                       data above will be transferred to the
                                       organizer when you register for the
                                       event. The data protection notice of the
                                       organizer applies. You can find it
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
                           <Stack spacing={2}>
                              {Object.values(values).map((groupQuestions) => (
                                 <LivestreamGroupQuestionsSelector
                                    // @ts-ignore
                                    key={groupQuestions.groupId}
                                    errors={errors}
                                    touched={touched}
                                    handleBlur={handleBlur}
                                    groupQuestions={groupQuestions}
                                    setFieldValue={setFieldValue}
                                 />
                              ))}
                           </Stack>

                           <Button
                              type="submit"
                              variant="contained"
                              size="large"
                              color="primary"
                           >
                              Accept & Proceed
                           </Button>
                        </Stack>
                     }
                  />
               </Form>
            )
         }}
      </Formik>
   )
}

export const RegisterDataConsentView = () => {
   return (
      // confirm user is signed in & can register
      <RegistrationPreConditions>
         <SuspenseWithBoundary fallback={<RegisterDataConsentViewSkeleton />}>
            {/*  Fetch group consent status & questions / user answers */}
            <GroupConsentDataFetching>
               {/*  Render form UI */}
               <GroupQuestionsForm />
            </GroupConsentDataFetching>
         </SuspenseWithBoundary>
      </RegistrationPreConditions>
   )
}

export default RegisterDataConsentView
