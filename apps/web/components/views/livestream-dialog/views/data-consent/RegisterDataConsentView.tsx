import { LivestreamGroupQuestionsMap } from "@careerfairy/shared-lib/src/livestreams"
import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material"
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
import { useLiveStreamDialog, ViewKey } from "../../LivestreamDialog"
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
      fontSize: 16,
      textAlign: "center",
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

const NEXT_VIEW: ViewKey = "register-ask-questions"
const PREVIOUS_VIEW: ViewKey = "livestream-details"

/**
 * UI for the user to answer the group questions and give consent
 */
const GroupQuestionsForm = () => {
   const { livestream, goToView, registrationState, onRegisterSuccess } =
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
               onRegisterSuccess ? onRegisterSuccess() : goToView(NEXT_VIEW)
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
         onRegisterSuccess,
         userData,
      ]
   )

   const goToPrevious = useCallback(() => {
      goToView(PREVIOUS_VIEW)
   }, [goToView])

   const policiesToAccept = groupsWithPolicies?.length > 0

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
                           onBackClick={
                              onRegisterSuccess ? undefined : goToPrevious
                           }
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
                                             // @ts-ignore
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

                              {policiesToAccept ? (
                                 <ConsentText
                                    groupsWithPolicies={groupsWithPolicies}
                                 />
                              ) : null}

                              <PrimarySecondaryButtons
                                 disabled={Object.keys(errors).length > 0}
                                 primaryText={
                                    policiesToAccept
                                       ? "Accept & Proceed"
                                       : "Answer & Proceed"
                                 }
                                 typeSubmit
                                 onClickSecondary={
                                    onRegisterSuccess
                                       ? undefined
                                       : () => goToView("livestream-details")
                                 }
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

export const HostImage = ({
   imageUrl,
   alt,
}: {
   imageUrl: string
   alt: string
}) => {
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
            Your information (full name, email address, university affiliation)
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

type ButtonProps = {
   disabled?: boolean
   loading?: boolean
   typeSubmit?: boolean
   onClickPrimary?: () => void
   onClickSecondary: () => void
   primaryText: string
   secondaryText?: string
}

export const PrimarySecondaryButtons = ({
   disabled,
   loading,
   typeSubmit,
   onClickPrimary,
   onClickSecondary,
   primaryText,
   secondaryText = "Cancel",
}: ButtonProps) => {
   return (
      <Stack direction="column" spacing={1}>
         <Button
            disabled={disabled || loading}
            sx={styles.btn}
            type={typeSubmit ? "submit" : undefined}
            onClick={onClickPrimary ? onClickPrimary : undefined}
            variant="contained"
            disableElevation
            size="small"
            color="secondary"
            startIcon={
               loading ? (
                  <CircularProgress size={10} color="inherit" />
               ) : undefined
            }
         >
            {primaryText}
         </Button>
         {onClickSecondary ? (
            <Button
               disabled={disabled || loading}
               onClick={onClickSecondary}
               color="grey"
               disableRipple
               fullWidth={false}
               disableElevation
               sx={styles.btnCancel}
            >
               {secondaryText}
            </Button>
         ) : null}
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
