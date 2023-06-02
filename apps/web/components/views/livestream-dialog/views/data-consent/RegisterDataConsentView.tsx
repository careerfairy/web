import { LivestreamGroupQuestionsMap } from "@careerfairy/shared-lib/src/livestreams"
import { Box, Button, Stack, Typography } from "@mui/material"
import { Form, Formik } from "formik"
import { useCallback } from "react"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import { sxStyles } from "../../../../../types/commonTypes"
import useIsMobile from "../../../../custom-hook/useIsMobile"
import useSnackbarNotifications from "../../../../custom-hook/useSnackbarNotifications"
import { SuspenseWithBoundary } from "../../../../ErrorBoundary"
import { getResizedUrl } from "../../../../helperFunctions/HelperFunctions"
import { validate } from "../../../common/registration-modal/steps/LivestreamGroupQuestionForm/util"
import BaseDialogView, { HeroContent, MainContent } from "../../BaseDialogView"
import { useLiveStreamDialog } from "../../LivestreamDialog"
import RegistrationPreConditions from "../../RegistrationPreConditions"
import useRegistrationHandler from "../../useRegistrationHandler"
import GroupConsentDataFetching from "./GroupConsentDataFetching"
import RegisterDataConsentViewSkeleton from "./RegisterDataConsentViewSkeleton"
import Image from "next/image"
import { GroupWithPolicy } from "@careerfairy/shared-lib/src/groups"
import Link from "../../../common/Link"
import LivestreamGroupQuestionsSelector from "./LivestreamGroupQuestionsSelector"

const styles = sxStyles({
   title: {
      textAlign: "center",
      fontWeight: 500,
      lineHeight: 1.3,
      fontSize: {
         xs: "1.9rem",
         sm: "2.571rem",
      },
      maxWidth: 655,
   },
   logoWrapper: {
      p: 1,
      background: "white",
      borderRadius: 2,
      display: "flex",
      width: 130,
      boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)",
   },
   contentOffset: {
      mt: -13,
   },
   consentText: {
      fontSize: 12,
   },
   btn: {
      boxShadow: "none",
      fontSize: 14,
      padding: "9px 45px",
      "&:disabled": {
         backgroundColor: "#E8E8E8",
         color: "#999999",
      },
      textTransform: "none",
      transition: (theme) => theme.transitions.create(["opacity"]),
   },
   btnCancel: {
      textTransform: "none",
      color: "#ABABAB",
      padding: "5px 0",
   },
   fullWidth: {
      width: "100%",
   },
})

/**
 * UI for the user to answer the group questions and give consent
 */
const GroupQuestionsForm = () => {
   const { livestream, goToView, registrationState } = useLiveStreamDialog()
   const { userData, authenticatedUser } = useAuth()
   const isMobile = useIsMobile()
   const { groupsWithPolicies, answers } = registrationState
   const { completeRegistrationProcess } = useRegistrationHandler()
   const { errorNotification } = useSnackbarNotifications()

   console.log("here GroupQuestionsForm", registrationState)

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
                           onBackPosition={"top-left"}
                           onBackClick={() => goToView("livestream-details")}
                           noMinHeight
                        >
                           <Stack
                              alignItems="center"
                              justifyContent={"center"}
                              pt={3}
                              pb={9}
                           >
                              <HostTitle companyName={livestream.company} />
                           </Stack>
                        </HeroContent>
                     }
                     mainContent={
                        <MainContent>
                           <Stack
                              alignItems="center"
                              spacing={5}
                              sx={styles.contentOffset}
                              px={isMobile ? 1 : 5}
                           >
                              <HostImage
                                 imageUrl={livestream.companyLogoUrl}
                                 alt={livestream.company}
                              />
                              {Object.keys(values).length ? (
                                 <Stack spacing={2} sx={styles.fullWidth}>
                                    {Object.values(values).map(
                                       (groupQuestions) => (
                                          <LivestreamGroupQuestionsSelector
                                             key={groupQuestions.groupId}
                                             errors={errors}
                                             touched={touched}
                                             handleBlur={handleBlur}
                                             groupQuestions={groupQuestions}
                                             setFieldValue={setFieldValue}
                                          />
                                       )
                                    )}
                                 </Stack>
                              ) : null}

                              {groupsWithPolicies?.length ? (
                                 <ConsentText
                                    groupsWithPolicies={groupsWithPolicies}
                                 />
                              ) : null}

                              <Buttons
                                 disabled={Object.keys(errors).length > 0}
                              />
                           </Stack>
                        </MainContent>
                     }
                  />
               </Form>
            )
         }}
      </Formik>
   )
}

const HostTitle = ({ companyName }: { companyName: string }) => {
   return (
      <Typography
         align="center"
         variant={"h3"}
         component="h1"
         sx={styles.title}
      >
         {companyName}
         <br />
         Would Like To Know More About You
      </Typography>
   )
}

const HostImage = ({ imageUrl, alt }: { imageUrl: string; alt: string }) => {
   return (
      <Box sx={styles.logoWrapper}>
         <Image
            src={getResizedUrl(imageUrl, "lg")}
            width={130}
            height={130}
            objectFit={"contain"}
            alt={alt}
         />
      </Box>
   )
}

const ConsentText = ({
   groupsWithPolicies,
}: {
   groupsWithPolicies: GroupWithPolicy[]
}) => {
   return (
      <Box>
         <Typography sx={styles.consentText}>
            Your information (first name, last name, university affiliation)
            will be transferred to the organiser when you register to one or
            more of their live streams. The data protection notice of the
            organiser applies:
            {groupsWithPolicies.map((group) => (
               <Link
                  key={group.id}
                  target="_blank"
                  style={{ marginLeft: "10px" }}
                  href={group.privacyPolicyUrl}
                  rel="noreferrer"
               >
                  {group.universityName}
               </Link>
            ))}
         </Typography>
      </Box>
   )
}

const Buttons = ({ disabled }: { disabled: boolean }) => {
   const { goToView } = useLiveStreamDialog()
   return (
      <Stack direction="column" spacing={1}>
         <Button
            disabled={disabled}
            sx={styles.btn}
            type="submit"
            variant="contained"
            disableElevation
            size="small"
            color="secondary"
         >
            Accept & Proceed
         </Button>
         <Button
            // variant="text"
            color="grey"
            disableRipple
            fullWidth={false}
            disableElevation
            sx={styles.btnCancel}
            onClick={() => goToView("livestream-details")}
         >
            Cancel
         </Button>
      </Stack>
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
