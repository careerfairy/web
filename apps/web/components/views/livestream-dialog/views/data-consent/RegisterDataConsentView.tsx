import { GroupWithPolicy } from "@careerfairy/shared-lib/src/groups"
import { LivestreamGroupQuestionsMap } from "@careerfairy/shared-lib/src/livestreams"
import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material"
import CircularLogo from "components/views/common/logos/CircularLogo"
import { Form, Formik } from "formik"
import Image from "next/legacy/image"
import { useCallback } from "react"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import { sxStyles } from "../../../../../types/commonTypes"
import useIsMobile from "../../../../custom-hook/useIsMobile"
import useSnackbarNotifications from "../../../../custom-hook/useSnackbarNotifications"
import { SuspenseWithBoundary } from "../../../../ErrorBoundary"
import { getResizedUrl } from "../../../../helperFunctions/HelperFunctions"

import { validate } from "components/views/common/registration-modal/steps/LivestreamGroupQuestionForm/util"
import Link from "../../../common/Link"
import BaseDialogView, {
   HeroContent,
   HeroTitle,
   MainContent,
} from "../../BaseDialogView"
import { useLiveStreamDialog, ViewKey } from "../../LivestreamDialog"
import RegistrationPreConditions from "../../RegistrationPreConditions"
import useRegistrationHandler from "../../useRegistrationHandler"
import GroupConsentDataFetching from "./GroupConsentDataFetching"
import LivestreamGroupQuestionsSelector from "./LivestreamGroupQuestionsSelector"
import RegisterDataConsentViewSkeleton from "./RegisterDataConsentViewSkeleton"

const styles = sxStyles({
   logoWrapper: {
      p: 1,
      background: "white",
      borderRadius: 2,
      display: "flex",
      width: 130,
      boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)",
   },
   contentOffset: {
      mt: { xs: -11, md: -15 },
      width: "100%",
   },
   consentText: {
      fontSize: 16,
      textAlign: "center",
      color: "neutral.800",
   },
   btn: {
      boxShadow: "none",
      padding: "8px 58px",
      transition: (theme) => theme.transitions.create(["opacity"]),
   },
   btnCancel: {
      textTransform: "none",
      padding: "8px 58px",
      color: (theme) => theme.brand.black[700],
   },
   fullWidth: {
      width: "100%",
   },
   heroContent: {
      height: { xs: "229px", md: "366px" },
   },
   actionButtons: {
      width: {
         xs: "100%",
         md: "auto",
      },
   },
   avatar: {
      borderRadius: { xs: "70px", md: "91px" },
      border: "1.5px solid",
      borderColor: (theme) => theme.brand.white[400],
   },
   policyLink: {
      marginLeft: "4px",
      textDecoration: "none",
   },
   minHeight: {
      minHeight: { xs: "300px", md: "400px" },
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
                           sx={styles.heroContent}
                        >
                           <Stack
                              alignItems="center"
                              justifyContent={"center"}
                              pt={3}
                              pb={9}
                           >
                              <HeroTitle>
                                 {livestream.company}
                                 <br />
                                 would like to know more about you
                              </HeroTitle>
                           </Stack>
                        </HeroContent>
                     }
                     mainContent={
                        <MainContent sx={styles.minHeight}>
                           <Stack
                              alignItems="center"
                              spacing={5}
                              sx={styles.contentOffset}
                              px={isMobile ? 1 : 5}
                           >
                              <Stack
                                 spacing={isMobile ? 3 : 8}
                                 alignItems="center"
                                 sx={styles.fullWidth}
                              >
                                 <Stack
                                    spacing={4}
                                    alignItems="center"
                                    sx={styles.fullWidth}
                                 >
                                    <CircularLogo
                                       src={getResizedUrl(
                                          livestream.companyLogoUrl,
                                          "lg"
                                       )}
                                       alt={livestream.company}
                                       size={isMobile ? 80 : 136}
                                       sx={styles.avatar}
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
                                                   groupQuestions={
                                                      groupQuestions
                                                   }
                                                   setFieldValue={setFieldValue}
                                                />
                                             )
                                          )}
                                       </Stack>
                                    ) : null}
                                 </Stack>

                                 {policiesToAccept ? (
                                    <ConsentText
                                       groupsWithPolicies={groupsWithPolicies}
                                    />
                                 ) : null}
                              </Stack>

                              {isMobile ? null : (
                                 <ActionButtons
                                    disabled={Object.keys(errors).length > 0}
                                    policiesToAccept={policiesToAccept}
                                    onClickPrimary={handleSubmit}
                                 />
                              )}
                           </Stack>
                        </MainContent>
                     }
                     hideBottomDivider
                     fixedBottomContent={
                        isMobile ? (
                           <ActionButtons
                              disabled={Object.keys(errors).length > 0}
                              policiesToAccept={policiesToAccept}
                              onClickPrimary={handleSubmit}
                           />
                        ) : null
                     }
                  />
               </Form>
            )
         }}
      </Formik>
   )
}

type ActionButtonProps = {
   disabled: boolean
   policiesToAccept: boolean
   onClickPrimary?: () => void
}

const ActionButtons = ({
   disabled,
   policiesToAccept,
   onClickPrimary,
}: ActionButtonProps) => {
   const { goToView, onRegisterSuccess } = useLiveStreamDialog()

   return (
      <Box sx={styles.actionButtons}>
         <PrimarySecondaryButtons
            disabled={disabled}
            primaryText={
               policiesToAccept ? "Accept & Proceed" : "Answer & Proceed"
            }
            typeSubmit
            onClickSecondary={
               onRegisterSuccess
                  ? undefined
                  : () => goToView("livestream-details")
            }
            onClickPrimary={onClickPrimary}
         />
      </Box>
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
      <Stack spacing={1}>
         {groupsWithPolicies.map((group) => (
            <Typography key={group.id} sx={styles.consentText}>
               Your information (full name, email address, university
               affiliation) will be transferred to the organiser when you
               register to one or more of their live streams. The data
               protection notice of the organiser applies. You can find it
               <Link
                  target="_blank"
                  href={group.privacyPolicyUrl}
                  rel="noreferrer"
                  sx={styles.policyLink}
               >
                  here
               </Link>
               .
            </Typography>
         ))}
      </Stack>
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
      <Stack direction="column" spacing={1.5}>
         <Button
            disabled={disabled || loading}
            sx={styles.btn}
            type={typeSubmit ? "submit" : undefined}
            onClick={onClickPrimary ? onClickPrimary : undefined}
            variant="contained"
            disableElevation
            size="medium"
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
