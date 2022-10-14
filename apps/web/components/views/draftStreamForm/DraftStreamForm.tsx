import React, {
   MutableRefObject,
   useCallback,
   useEffect,
   useMemo,
   useRef,
   useState,
} from "react"
import {
   Box,
   Button,
   ButtonGroup,
   CircularProgress,
   Container,
   Grid,
   Typography,
} from "@mui/material"
import { Formik, FormikValues } from "formik"
import { v4 as uuidv4 } from "uuid"
import { useFirebaseService } from "../../../context/firebase/FirebaseServiceContext"
import makeStyles from "@mui/styles/makeStyles"
import { useRouter } from "next/router"
import WarningIcon from "@mui/icons-material/Warning"
import {
   getStreamSubCollectionSpeakers,
   handleFlattenOptions,
   languageCodes,
   validateStreamForm,
} from "../../helperFunctions/streamFormFunctions"
import { copyStringToClipboard } from "../../helperFunctions/HelperFunctions"
import { useSnackbar } from "notistack"
import {
   SAVE_WITH_NO_VALIDATION,
   SUBMIT_FOR_APPROVAL,
} from "../../util/constants"
import { useAuth } from "../../../HOCs/AuthProvider"
import { DEFAULT_STREAM_DURATION_MINUTES } from "../../../constants/streams"
import { useInterests } from "../../custom-hook/useCollection"
import { createStyles } from "@mui/styles"
import JobSelectorCategory from "./JobSelector/JobSelectorCategory"
import {
   LivestreamEvent,
   LivestreamGroupQuestionsMap,
   LivestreamJobAssociation,
   Speaker,
} from "@careerfairy/shared-lib/dist/livestreams"
import { SuspenseWithBoundary } from "../../ErrorBoundary"
import { Group } from "@careerfairy/shared-lib/dist/groups"
import { FormikHelpers } from "formik/dist/types"
import { FieldOfStudy } from "@careerfairy/shared-lib/dist/fieldOfStudy"
import StreamInfo from "./StreamForm/StreamInfo"
import SpeakersInfo from "./StreamForm/SpeakersInfo"
import TargetStudentsInfo from "./StreamForm/TargetStudentsInfo"
import PromotionInfo from "./StreamForm/PromotionInfo"
import EventCategoriesInfo from "./StreamForm/EventCategoriesInfo"
import HostAndQuestionsInfo from "./StreamForm/HostAndQuestionsInfo"
import StreamFormNavigator, {
   IStreamFormNavigatorSteps,
} from "./StreamForm/StreamFormNavigator"
import Section from "../common/Section"
import { Option } from "../signup/utils"

const useStyles = makeStyles((theme) =>
   createStyles({
      root: {
         flex: 1,
         display: "flex",
         flexDirection: "column",
         alignItems: "center",
         minHeight: "20vh",
         borderRadius: 5,
         marginBottom: ({ isGroupAdmin }: any) => !isGroupAdmin && 30,
         maxWidth: "unset",
      },
      form: {
         width: "100%",
      },
      errorMessage: {
         color: "red",
         marginLeft: 8,
         marginTop: 4,
      },
      submit: {
         color: theme.palette.primary.main,
         background: "white",
         marginTop: theme.spacing(2),
         "&:hover": {
            color: "white",
            background: theme.palette.primary.main,
         },
      },
      whiteBtn: {
         color: theme.palette.primary.main,
         background: "white",
         margin: theme.spacing(1),
         "&:hover": {
            color: "white",
            background: theme.palette.primary.main,
         },
      },
      buttonGroup: {
         // @ts-ignore
         visibility: ({ isGroupAdmin }) => isGroupAdmin && "hidden",
         // @ts-ignore
         position: ({ isGroupAdmin }) => isGroupAdmin && "fixed",
      },
      section: {
         padding: 0,
      },
   })
)

export type ISpeakerObj = {
   avatar: string
   firstName: string
   lastName: string
   position: string
   background: string
   email: string
}

const speakerObj = {
   avatar: "",
   firstName: "",
   lastName: "",
   position: "",
   background: "",
   email: "",
} as ISpeakerObj

interface Props {
   group?: Group
   setSubmitted: (submitted: boolean) => void
   submitted: boolean
   onSubmit: (
      values: FormikValues,
      formikHandlers: {
         setSubmitting: FormikHelpers<DraftFormValues>["setSubmitting"]
      },
      updateMode: boolean,
      draftStreamId: string,
      setFormData: (data: any) => void,
      setDraftId: (id: string) => void,
      status: string,
      setStatus: (status: string) => void,
      selectedJobs: LivestreamJobAssociation[]
   ) => void
   isActualLivestream?: boolean
   formRef: MutableRefObject<any>
   saveChangesButtonRef?: MutableRefObject<any>
   currentStream?: LivestreamEvent
}

export interface DraftFormValues {
   id?: string
   companyLogoUrl: string
   backgroundImageUrl: string
   company: string
   companyId: string
   title: string
   interestsIds: string[]
   groupIds: string[]
   start: Date
   groupQuestionsMap: LivestreamGroupQuestionsMap
   duration: number
   hidden: boolean
   summary: string
   speakers: Record<string, Partial<Speaker>>
   status: {}
   language: {
      code: string
      name: string
      shortName: string
   }
   targetFieldsOfStudy: FieldOfStudy[]
   targetLevelsOfStudy: FieldOfStudy[]
   promotionChannels: Option[]
   promotionCountries: Option[]
   promotionUniversities: Option[]
   questionsDisabled: boolean
}

const DraftStreamForm = ({
   group,
   setSubmitted,
   submitted,
   onSubmit,
   isActualLivestream,
   // eslint-disable-next-line react-hooks/rules-of-hooks
   formRef = useRef(),
   // eslint-disable-next-line react-hooks/rules-of-hooks
   saveChangesButtonRef = useRef(),
   currentStream,
}: Props) => {
   const firebase = useFirebaseService()
   const router = useRouter()
   const { userData } = useAuth()
   const SPEAKER_LIMIT = userData?.isAdmin ? 15 : 10

   const streamInfoRef = useRef(null)
   const speakersInfoRef = useRef(null)
   const targetStudentsRef = useRef(null)
   const promotionInfoRef = useRef(null)
   const questionsInfoRef = useRef(null)
   const eventCategoriesInfoRef = useRef(null)
   const jobInfoRef = useRef(null)

   const initialSteps = [
      { label: "Stream Info", ref: streamInfoRef },
      { label: "Speakers", ref: speakersInfoRef },
      { label: "Target Students", ref: targetStudentsRef },
      { label: "Promotion", ref: promotionInfoRef },
      { label: "Event Categories", ref: eventCategoriesInfoRef },
   ] as IStreamFormNavigatorSteps[]

   let {
      query: { careerCenterIds, draftStreamId },
      replace,
      pathname,
   } = router
   draftStreamId = draftStreamId || currentStream?.id
   const { enqueueSnackbar } = useSnackbar()
   const [status, setStatus] = useState("")
   const classes = useStyles({
      isGroupAdmin: Boolean(group?.id),
   })

   const [selectedGroups, setSelectedGroups] = useState<Group[]>([])
   const [selectedInterests, setSelectedInterests] = useState([])
   const [selectedJobs, setSelectedJobs] = useState<LivestreamJobAssociation[]>(
      []
   )
   const [allFetched, setAllFetched] = useState(false) // TODO GS: change to false
   const [updateMode, setUpdateMode] = useState(false)

   const { data: existingInterests } = useInterests()

   const [draftId, setDraftId] = useState("")

   const [existingGroups, setExistingGroups] = useState([])
   const [formData, setFormData] = useState<DraftFormValues>({
      companyLogoUrl: "",
      backgroundImageUrl: "",
      company: "",
      companyId: "",
      title: "",
      interestsIds: [],
      groupIds: [],
      start: new Date(),
      groupQuestionsMap: {},
      duration: 60,
      hidden: false,
      summary: "",
      speakers: { [uuidv4()]: speakerObj },
      status: {},
      language: languageCodes[0],
      targetFieldsOfStudy: [],
      targetLevelsOfStudy: [],
      promotionChannels: [],
      promotionCountries: [],
      promotionUniversities: [],
      questionsDisabled: false,
   })

   const [steps, setSteps] = useState(initialSteps)
   const myRef = useRef(null)

   const handleSetGroupIds = async (
      UrlIds,
      draftStreamGroupIds,
      newFormData
   ) => {
      const initialGroups = [...new Set([...UrlIds, ...draftStreamGroupIds])]
      let mergedGroups = [...initialGroups]
      if (group?.partnerGroupIds?.length) {
         mergedGroups = [
            ...new Set([...mergedGroups, ...group.partnerGroupIds]),
         ]
      }
      if (mergedGroups.length) {
         let totalExistingGroups
         if (userData?.isAdmin) {
            const allGroupSnaps = await firebase.getAllCareerCenters()
            totalExistingGroups = allGroupSnaps.docs.map((doc) => ({
               id: doc.id,
               ...doc.data(),
            }))
         } else {
            totalExistingGroups = await firebase.getCareerCentersByGroupId(
               mergedGroups
            )
         }
         const totalFlattenedGroups = totalExistingGroups.map((group) => ({
            ...group,
            selected: false,
            flattenedOptions: handleFlattenOptions(group),
         }))

         let selectedGroups = []
         const targetSelectedGroupIds = [
            ...new Set([...UrlIds, ...draftStreamGroupIds]),
         ]
         targetSelectedGroupIds.forEach((id) => {
            const targetGroup = totalFlattenedGroups.find(
               (flattenedGroup) => flattenedGroup.groupId === id
            )
            if (targetGroup) {
               targetGroup.selected = true
               selectedGroups.push(targetGroup)
            }
         })
         if (!selectedGroups.length && group?.id) {
            selectedGroups.push({
               ...group,
               flattenedOptions: handleFlattenOptions(group),
               selected: true,
            })
         }

         setExistingGroups(totalFlattenedGroups)
         setSelectedGroups(selectedGroups)
         const arrayOfActualGroupIds = selectedGroups.map(
            (groupObj) => groupObj.id
         )
         setFormData({ ...newFormData, groupIds: arrayOfActualGroupIds })
      }
   }

   useEffect(() => {
      if (draftStreamId) {
         ;(async () => {
            setAllFetched(false)
            const targetId = draftStreamId as string
            const targetCollection = isActualLivestream
               ? "livestreams"
               : "draftLivestreams"
            const livestreamQuery = await firebase.getStreamById(
               targetId,
               targetCollection
            )
            const speakerQuery = await firebase.getStreamSpeakers(
               targetId,
               targetCollection
            )
            if (livestreamQuery.exists) {
               let livestream = livestreamQuery.data() as LivestreamEvent
               const newFormData: DraftFormValues = {
                  id: targetId,
                  companyLogoUrl: livestream.companyLogoUrl || "",
                  backgroundImageUrl: livestream.backgroundImageUrl || "",
                  company: livestream.company || "",
                  companyId: livestream.companyId || "",
                  title: livestream.title || "",
                  groupIds: livestream.groupIds || [],
                  interestsIds: livestream.interestsIds || [],
                  start: livestream.start.toDate() || new Date(),
                  groupQuestionsMap: livestream.groupQuestionsMap || {},
                  duration:
                     livestream.duration || DEFAULT_STREAM_DURATION_MINUTES,
                  hidden: Boolean(livestream.hidden),
                  summary: livestream.summary || "",
                  speakers: getStreamSubCollectionSpeakers(
                     livestream,
                     speakerQuery
                  ),
                  status: livestream.status || {},
                  // @ts-ignore
                  language: livestream.language || languageCodes[0],
                  targetFieldsOfStudy: livestream.targetFieldsOfStudy ?? [],
                  targetLevelsOfStudy: livestream.targetLevelsOfStudy ?? [],
                  promotionChannels: [], // TODO GS: get promotions
                  promotionCountries: [],
                  promotionUniversities: [],
                  questionsDisabled: Boolean(livestream.questionsDisabled),
               }
               setFormData(newFormData)
               setAllFetched(false)
               if (careerCenterIds) {
                  const arrayOfUrlIds = (careerCenterIds as string).split(",")
                  await handleSetGroupIds(
                     arrayOfUrlIds,
                     livestream.groupIds,
                     newFormData
                  )
               } else {
                  await handleSetGroupIds([], livestream.groupIds, newFormData)
               }
               setSelectedJobs(livestream.jobs || [])
               setSelectedInterests(
                  existingInterests.filter((i) =>
                     newFormData.interestsIds.includes(i.id)
                  )
               )
               setUpdateMode(true)
            } else {
               setUpdateMode(false)
               replace(pathname)
            }
            setAllFetched(true)
         })()
      } else if (careerCenterIds || group?.id) {
         ;(async function () {
            setAllFetched(false)
            await handleSetOnlyUrlIds()
            setAllFetched(true)
         })()
      }
   }, [draftStreamId, router, submitted, existingInterests])

   useEffect(() => {
      const isHostAndQuestionsStepVisible = steps.some(
         ({ label }) => label === "Host and Questions"
      )

      if (existingGroups?.length && !isHostAndQuestionsStepVisible) {
         // We want to add this section after the Jobs section
         // If the job section is not being shown, we should show it in its place.
         setSteps((prevSteps) => [
            ...prevSteps.slice(0, steps.length > 5 ? 5 : 4),
            {
               label: "Host and Questions",
               ref: questionsInfoRef,
            },
            ...prevSteps.slice(steps.length > 5 ? 5 : 4),
         ])
      } else if (
         existingGroups?.length === 0 &&
         isHostAndQuestionsStepVisible
      ) {
         setSteps((prevSteps) =>
            prevSteps.filter(({ label }) => label !== "Host and Questions")
         )
      }
   }, [existingGroups?.length])

   // TODO GS : fix this logic to add Jobs stepper
   // const handleShowJobSelector = useCallback(() => {
   //    // if (show) {
   //       // We want to add this section on the 5th position
   //       setSteps((prevSteps) => [
   //          ...prevSteps.slice(0,4),
   //          {
   //             label: "Job",
   //             ref: jobInfoRef,
   //          },
   //          ...prevSteps.slice(4)
   //       ])
   //    // }
   //    // else {
   //    //    setSteps((prevSteps) => prevSteps.filter(({label}) => label !== "Job"))
   //    // }
   // }, [])

   const isPending = () => {
      // @ts-ignore
      return Boolean(formData?.status?.pendingApproval === true)
   }

   const groupsSelected = useMemo(() => {
      return Boolean(selectedGroups.length)
   }, [selectedGroups.length])

   const handleSetOnlyUrlIds = async () => {
      // @ts-ignore
      const arrayOfUrlIds = careerCenterIds?.split(",") || [group.id]
      await handleSetGroupIds(arrayOfUrlIds, [], formData)
   }

   const getDirectLink = () => `/draft-stream?draftStreamId=${draftId}`
   const buildFullUrl = (localPath) => {
      let baseUrl = "https://careerfairy.io"
      if (window?.location?.origin) {
         baseUrl = window.location.origin
      }
      return `${baseUrl}${localPath}`
   }
   const handleCopyDraftLink = () => {
      const directLink = getDirectLink()
      const targetPath = buildFullUrl(directLink)
      copyStringToClipboard(targetPath)
      enqueueSnackbar("Link has been copied to your clipboard", {
         variant: "success",
         preventDuplicate: true,
      })
   }

   const handleClickSubmitForApproval = () => {
      setStatus(SUBMIT_FOR_APPROVAL)
   }

   const isNotAdmin = !Boolean(userData?.isAdmin || group?.id)
   const isGroupAdmin = useCallback(
      (groupId) => (group && group.id === groupId) || userData?.isAdmin,
      [group, userData?.isAdmin]
   )

   const handleGroupSelect = useCallback(
      (values: DraftFormValues, selectedGroups: Group[]) => {
         const selectedGroupIds = selectedGroups.map((group) => group.id)
         Object.keys(values.groupQuestionsMap).forEach((groupId) => {
            if (!selectedGroupIds.includes(groupId)) {
               delete values.groupQuestionsMap[groupId]
            }
         })

         setSelectedGroups(selectedGroups)
      },
      []
   )

   const SuccessMessage = () => {
      const directLink = getDirectLink()
      const targetPath = buildFullUrl(directLink)
      return (
         <>
            <Typography variant="h5" align="center" style={{ color: "white" }}>
               {status === SAVE_WITH_NO_VALIDATION
                  ? "Your changes have been saved under the following link:"
                  : "Thanks for your submission, the direct link to this draft you created is:"}
               <br />
               <br />
               <Box
                  fontWeight={600}
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
               >
                  <WarningIcon fontSize="large" />
                  PLEASE SAVE THE FOLLOWING LINK BELOW SOMEWHERE
                  <WarningIcon fontSize="large" />
               </Box>
               <a onClick={handleCopyDraftLink} href={directLink}>
                  {targetPath}
               </a>
               <br />
               <br />
               We will review the draft and get back to you as soon as possible!
            </Typography>
            <div
               style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 16,
               }}
            >
               {userData && (
                  <Button
                     className={classes.whiteBtn}
                     variant="contained"
                     href="/profile"
                  >
                     To Profile
                  </Button>
               )}
               <Button
                  className={classes.whiteBtn}
                  variant="contained"
                  href="/next-livestreams"
               >
                  To Next Livestreams
               </Button>
               <Button
                  onClick={handleCopyDraftLink}
                  className={classes.whiteBtn}
                  variant="contained"
               >
                  Copy Direct Link
               </Button>
               <Button
                  onClick={() => setSubmitted(false)}
                  className={classes.whiteBtn}
                  variant="contained"
               >
                  Back to draft
               </Button>
            </div>
         </>
      )
   }

   const noValidation = () => status === SAVE_WITH_NO_VALIDATION

   return (
      <Container className={classes.root} id="livestreamForm">
         {allFetched ? (
            <Grid container spacing={2} ref={myRef}>
               <Grid item xs={2}>
                  <Box sx={{ position: "fixed", marginTop: "10vh" }}>
                     <StreamFormNavigator steps={steps} />
                  </Box>
               </Grid>
               <Grid item xs={10}>
                  {submitted ? (
                     <SuccessMessage />
                  ) : (
                     <Formik
                        initialValues={formData}
                        innerRef={formRef}
                        enableReinitialize
                        validate={(values) =>
                           validateStreamForm(values, true, noValidation())
                        }
                        onSubmit={async (values, { setSubmitting }) => {
                           await onSubmit(
                              values,
                              { setSubmitting },
                              updateMode,
                              draftStreamId as string,
                              setFormData,
                              setDraftId,
                              status,
                              setStatus,
                              selectedJobs
                           )
                        }}
                     >
                        {({
                           values,
                           errors,
                           touched,
                           handleChange,
                           handleBlur,
                           handleSubmit,
                           isSubmitting,
                           setFieldValue,
                           setValues,
                           validateForm,
                           /* and other goodies */
                        }) => {
                           // @ts-ignore
                           return (
                              <form
                                 onSubmit={async (event) => {
                                    event.preventDefault()
                                    const error = await validateForm()
                                    if (Object.keys(error).length) {
                                       window.scrollTo({
                                          top: 0,
                                          left: 0,
                                          behavior: "smooth",
                                       })
                                    }
                                    handleSubmit()
                                 }}
                                 className={classes.form}
                              >
                                 <Section
                                    sectionRef={streamInfoRef}
                                    sectionId={"streamInfoSection"}
                                    className={classes.section}
                                 >
                                    <StreamInfo
                                       isGroupsSelected={groupsSelected}
                                       handleBlur={handleBlur}
                                       values={values}
                                       isSubmitting={isSubmitting}
                                       errors={errors}
                                       touched={touched}
                                       handleChange={handleChange}
                                       selectedGroups={selectedGroups}
                                       setFieldValue={setFieldValue}
                                       userData={userData}
                                       classes={classes}
                                    />
                                 </Section>

                                 <Section
                                    sectionRef={speakersInfoRef}
                                    sectionId={"speakersInfoSection"}
                                    className={classes.section}
                                 >
                                    <SpeakersInfo
                                       values={values}
                                       setValues={setValues}
                                       speakerLimit={SPEAKER_LIMIT}
                                       speakerObj={speakerObj}
                                       errors={errors}
                                       touched={touched}
                                       setFieldValue={setFieldValue}
                                       isSubmitting={isSubmitting}
                                       handleBlur={handleBlur}
                                    />
                                 </Section>

                                 <Section
                                    sectionRef={targetStudentsRef}
                                    sectionId={"targetStudentsSection"}
                                    className={classes.section}
                                 >
                                    <TargetStudentsInfo
                                       targetFieldsOfStudy={
                                          values.targetFieldsOfStudy
                                       }
                                       targetLevelsOfStudy={
                                          values.targetLevelsOfStudy
                                       }
                                       setFieldValue={setFieldValue}
                                    />
                                 </Section>

                                 <Section
                                    sectionRef={promotionInfoRef}
                                    sectionId={"PromotionSection"}
                                    className={classes.section}
                                 >
                                    <PromotionInfo
                                       setFieldValue={setFieldValue}
                                       promotionCountries={
                                          values.promotionCountries
                                       }
                                       promotionChannels={
                                          values.promotionChannels
                                       }
                                       promotionUniversities={
                                          values.promotionUniversities
                                       }
                                    />
                                 </Section>

                                 <SuspenseWithBoundary hide expected>
                                    {values.groupIds.length > 0 && (
                                       <Section
                                          sectionRef={jobInfoRef}
                                          sectionId={"JobSection"}
                                          className={classes.section}
                                       >
                                          <JobSelectorCategory
                                             groupId={values.groupIds[0]} // we only support a single group for now
                                             onSelectItems={setSelectedJobs}
                                             selectedItems={selectedJobs}
                                          />
                                       </Section>
                                    )}
                                 </SuspenseWithBoundary>

                                 <SuspenseWithBoundary hide expected>
                                    {!!existingGroups.length && (
                                       <Section
                                          sectionRef={questionsInfoRef}
                                          sectionId={"hostAndQuestionsSection"}
                                          className={classes.section}
                                       >
                                          <HostAndQuestionsInfo
                                             existingGroups={existingGroups}
                                             handleGroupSelect={
                                                handleGroupSelect
                                             }
                                             values={values}
                                             selectedGroups={selectedGroups}
                                             isSubmitting={isSubmitting}
                                             isNotAdmin={isNotAdmin}
                                             setFieldValue={setFieldValue}
                                             isGroupAdmin={isGroupAdmin}
                                             groupId={group?.id}
                                          />
                                       </Section>
                                    )}
                                 </SuspenseWithBoundary>

                                 <Section
                                    sectionRef={eventCategoriesInfoRef}
                                    sectionId={"eventCategorySection"}
                                    className={classes.section}
                                 >
                                    <EventCategoriesInfo
                                       setSelectedInterests={
                                          setSelectedInterests
                                       }
                                       selectedInterests={selectedInterests}
                                       existingInterests={existingInterests}
                                       isSubmitting={isSubmitting}
                                       setFieldValue={setFieldValue}
                                    />
                                 </Section>

                                 <ButtonGroup
                                    className={classes.buttonGroup}
                                    fullWidth
                                 >
                                    <Button
                                       type="submit"
                                       onClick={handleClickSubmitForApproval}
                                       disabled={isSubmitting || isPending()}
                                       size="large"
                                       className={classes.submit}
                                       endIcon={
                                          isSubmitting && (
                                             <CircularProgress
                                                size={20}
                                                color="inherit"
                                             />
                                          )
                                       }
                                       variant="contained"
                                    >
                                       <Typography variant="h4">
                                          {isSubmitting
                                             ? "Submitting"
                                             : isPending()
                                             ? "Pending for Approval"
                                             : "Submit Draft for Approval"}
                                       </Typography>
                                    </Button>
                                    <Button
                                       type="submit"
                                       ref={saveChangesButtonRef}
                                       disabled={isSubmitting}
                                       size="large"
                                       onClick={() => {
                                          setStatus(SAVE_WITH_NO_VALIDATION)
                                       }}
                                       className={classes.submit}
                                       endIcon={
                                          isSubmitting && (
                                             <CircularProgress
                                                size={20}
                                                color="inherit"
                                             />
                                          )
                                       }
                                       variant="contained"
                                    >
                                       <Typography variant="h4">
                                          {isSubmitting
                                             ? "Saving"
                                             : "Save changes"}
                                       </Typography>
                                    </Button>
                                 </ButtonGroup>
                              </form>
                           )
                        }}
                     </Formik>
                  )}
               </Grid>
            </Grid>
         ) : (
            <CircularProgress style={{ margin: "auto", color: "primary" }} />
         )}
      </Container>
   )
}

export default DraftStreamForm
