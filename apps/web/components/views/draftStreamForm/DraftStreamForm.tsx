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
   CircularProgress,
   Container,
   Grid,
   Typography,
} from "@mui/material"
import { Formik, FormikHelpers, FormikValues } from "formik"
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
   LivestreamPromotions,
   Speaker,
} from "@careerfairy/shared-lib/livestreams"
import { Group } from "@careerfairy/shared-lib/groups"
import { FieldOfStudy } from "@careerfairy/shared-lib/fieldOfStudy"
import StreamInfo from "./StreamForm/StreamInfo"
import SpeakersInfo from "./StreamForm/SpeakersInfo"
import TargetStudentsInfo from "./StreamForm/TargetStudentsInfo"
import EventCategoriesInfo from "./StreamForm/EventCategoriesInfo"
import HostAndQuestionsInfo from "./StreamForm/HostAndQuestionsInfo"
import StreamFormNavigator, {
   IStreamFormNavigatorSteps,
} from "./StreamForm/StreamFormNavigator"
import { useStreamCreationProvider } from "./StreamForm/StreamCreationProvider"
import PublishIcon from "@mui/icons-material/Publish"
import SaveIcon from "@mui/icons-material/Save"
import _ from "lodash"
import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
import { getMetaDataFromEventHosts } from "@careerfairy/shared-lib/livestreams/metadata"
import { PublicCustomJob } from "@careerfairy/shared-lib/groups/customJobs"

const useStyles = makeStyles((theme) =>
   createStyles({
      root: {
         flex: 1,
         display: "flex",
         flexDirection: "column",
         alignItems: "center",
         minHeight: "20vh",
         borderRadius: 5,
         marginBottom: ({ isGroupAdmin }: StyleProps) => !isGroupAdmin && 30,
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
      section: {
         padding: 0,
      },
      navBar: {
         [theme.breakpoints.down("lg")]: {
            position: ({ isOnDialog }: StyleProps) =>
               isOnDialog ? "absolute" : "sticky",
            top: 0,
            paddingTop: "90px !important",
            background: "white",
            zIndex: 999,
            height: "200px",
            alignItems: "end",
            width: ({ isOnDialog }: StyleProps) =>
               isOnDialog ? "90%" : "inherit",
            [theme.breakpoints.down("md")]: {
               width: ({ isOnDialog }: StyleProps) =>
                  isOnDialog ? "98%" : "inherit",
               height: ({ isOnDialog, canPublish }: StyleProps) =>
                  isOnDialog ? `${canPublish ? "280px" : "240px"} ` : "200px",
               paddingTop: ({ isOnDialog, canPublish }: StyleProps) =>
                  isOnDialog
                     ? `${canPublish ? "160px" : "130px"} !important`
                     : "80px !important",
            },
         },
         [theme.breakpoints.down("md")]: {
            overflowX: "scroll",
            overflowY: "hidden",
         },
      },
   })
)

type MetaData = Pick<
   LivestreamEvent,
   "companyCountries" | "companyIndustries" | "companySizes"
>

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

type StyleProps = {
   isGroupAdmin: boolean
   isOnDialog: boolean
   canPublish: boolean
}

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
      selectedJobs: LivestreamJobAssociation[],
      metaData: MetaData
   ) => void
   isActualLivestream?: boolean
   formRef: MutableRefObject<any>
   submitButtonRef?: MutableRefObject<any>
   saveChangesButtonRef?: MutableRefObject<any>
   currentStream?: LivestreamEvent
   canPublish?: boolean
   isOnDialog?: boolean
   isDraft?: boolean
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
   reasonsToJoinLivestream: string
   speakers: Record<string, Partial<Speaker>>
   customJobs?: PublicCustomJob[]
   status: {}
   language: {
      code: string
      name: string
      shortName: string
   }
   targetFieldsOfStudy: FieldOfStudy[]
   targetLevelsOfStudy: FieldOfStudy[]
   promotionChannelsCodes: OptionGroup[]
   promotionCountriesCodes: OptionGroup[]
   promotionUniversitiesCodes: OptionGroup[]
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
   submitButtonRef = useRef(),
   // eslint-disable-next-line react-hooks/rules-of-hooks
   saveChangesButtonRef = useRef(),
   currentStream,
   canPublish = true,
   isOnDialog = false,
   isDraft = true,
}: Props) => {
   const firebase = useFirebaseService()
   const router = useRouter()
   const { userData } = useAuth()
   const SPEAKER_LIMIT = userData?.isAdmin ? 15 : 10

   const streamInfoRef = useRef(null)
   const speakersInfoRef = useRef(null)
   const targetStudentsRef = useRef(null)
   // const promotionInfoRef = useRef(null)
   const questionsInfoRef = useRef(null)
   const eventCategoriesInfoRef = useRef(null)
   const jobInfoRef = useRef(null)
   const navRef = useRef(null)

   const initialSteps = useMemo(
      () =>
         [
            { label: "Stream Info", ref: streamInfoRef },
            { label: "Speakers", ref: speakersInfoRef },
            { label: "Target Students", ref: targetStudentsRef },
            // { label: "Promotion", ref: promotionInfoRef },
            { label: "Jobs", ref: jobInfoRef },
            { label: "Event Categories", ref: eventCategoriesInfoRef },
         ] as IStreamFormNavigatorSteps[],
      []
   )

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
      isOnDialog,
      canPublish,
   } as StyleProps)

   const [selectedGroups, setSelectedGroups] = useState<Group[]>([])
   const [selectedInterests, setSelectedInterests] = useState([])
   const [selectedJobs, setSelectedJobs] = useState<LivestreamJobAssociation[]>(
      []
   )
   const [allFetched, setAllFetched] = useState(false)
   const [updateMode, setUpdateMode] = useState(false)
   const { formHasChanged, setFormHasChanged, showPromotionInputs } =
      useStreamCreationProvider()

   const { data: existingInterests } = useInterests()

   const [draftId, setDraftId] = useState("")

   const [existingGroups, setExistingGroups] = useState([])
   const [formData, setFormData] = useState<DraftFormValues>({
      // add group logo if it has any and if it's not a university
      companyLogoUrl: group?.universityCode ? "" : group?.logoUrl || "",
      backgroundImageUrl: group?.universityCode
         ? ""
         : group?.bannerImageUrl || "",
      // add group name if it has any and if it's not a university
      company: group?.universityCode ? "" : group?.universityName || "",
      companyId: "",
      title: "",
      interestsIds: [],
      groupIds: [],
      start: new Date(),
      groupQuestionsMap: {},
      duration: 60,
      hidden: false,
      summary: "",
      reasonsToJoinLivestream: "",
      speakers: { [uuidv4()]: speakerObj },
      customJobs: [],
      status: {},
      language: languageCodes[0],
      targetFieldsOfStudy: [],
      targetLevelsOfStudy: [],
      promotionChannelsCodes: [],
      promotionCountriesCodes: [],
      promotionUniversitiesCodes: [],
      questionsDisabled: false,
   })

   const metaData = useMemo<MetaData>(
      () => getMetaDataFromEventHosts(selectedGroups),
      [selectedGroups]
   )

   const [steps, setSteps] = useState(initialSteps)
   const isPastStream = useMemo(
      () => currentStream?.hasEnded,
      [currentStream?.hasEnded]
   )

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
            const promotionQuery = await firebase.getStreamPromotions(
               targetId,
               targetCollection
            )
            let promotion
            if (promotionQuery.exists) {
               promotion = promotionQuery?.data() as LivestreamPromotions
            }

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
                  reasonsToJoinLivestream:
                     livestream.reasonsToJoinLivestream || "",
                  speakers: getStreamSubCollectionSpeakers(
                     livestream,
                     speakerQuery
                  ),
                  customJobs: livestream?.customJobs || [],
                  status: livestream.status || {},
                  // @ts-ignore
                  language: livestream.language || languageCodes[0],
                  targetFieldsOfStudy: livestream.targetFieldsOfStudy ?? [],
                  targetLevelsOfStudy: livestream.targetLevelsOfStudy ?? [],
                  promotionChannelsCodes:
                     promotion?.promotionChannelsCodes || [],
                  promotionCountriesCodes:
                     promotion?.promotionCountriesCodes || [],
                  promotionUniversitiesCodes:
                     promotion?.promotionUniversitiesCodes || [],
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

   // to handle the visibility of the Host and Questions Steps
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

   useEffect(() => {
      const closeAlert = (e) => {
         e.preventDefault()
         e.returnValue = ""
      }

      // add close alert only if the form has changed
      if (formHasChanged && !submitted) {
         window.addEventListener("beforeunload", closeAlert)
      } else {
         window.removeEventListener("beforeunload", closeAlert)
      }

      return () => {
         window.removeEventListener("beforeunload", closeAlert)
      }
   }, [formHasChanged, submitted])

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
            <Typography
               variant="h5"
               align="center"
               style={{ color: "primary" }}
            >
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
                  mb={2}
               >
                  <WarningIcon fontSize="large" color="primary" />
                  PLEASE SAVE THE FOLLOWING LINK BELOW SOMEWHERE
                  <WarningIcon fontSize="large" color="primary" />
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
                  justifyContent: "center",
                  marginTop: 16,
               }}
            >
               {userData && (
                  <Button
                     variant="contained"
                     href="/profile"
                     color="primary"
                     sx={{ m: 1 }}
                  >
                     To Profile
                  </Button>
               )}
               <Button
                  variant="contained"
                  href="/next-livestreams"
                  color="primary"
                  sx={{ m: 1 }}
               >
                  To Next Livestreams
               </Button>
               <Button
                  onClick={handleCopyDraftLink}
                  variant="contained"
                  color="primary"
                  sx={{ m: 1 }}
               >
                  Copy Direct Link
               </Button>
               <Button
                  onClick={() => setSubmitted(false)}
                  variant="contained"
                  color="primary"
                  sx={{ m: 1 }}
               >
                  Back to draft
               </Button>
            </div>
         </>
      )
   }

   const noValidation = useMemo(
      () => status === SAVE_WITH_NO_VALIDATION,
      [status]
   )

   // To handle the validation of the form
   const handleValidate = useCallback(
      (values) => {
         // saves on the context when the form has changed or if it gets back to the initial value, but only once per different status
         if (formHasChanged !== (_.isEqual(values, formData) === false)) {
            setFormHasChanged(!formHasChanged)
         }

         return validateStreamForm(values, isDraft, noValidation, isPastStream)
      },
      [
         formData,
         formHasChanged,
         isDraft,
         isPastStream,
         noValidation,
         setFormHasChanged,
      ]
   )

   // handle errors and redirect to the specific 1st error input
   const handleSubmitForm = async ({ handleSubmit, validateForm }) => {
      if (!isOnDialog) {
         handleSubmit()
      }
      const errors = await validateForm()

      if (Object.keys(errors).length) {
         let firstErrorId = Object.keys(errors)[0]

         if (typeof errors[firstErrorId] !== "string") {
            // If the 1st error is related to the speaker form
            const speakerErrorId = Object.keys(errors[firstErrorId])[0]
            firstErrorId = speakerErrorId
         }

         const errorElement = document.getElementById(firstErrorId)
         if (errorElement) {
            errorElement.scrollIntoView({ behavior: "smooth", block: "center" })
         }
      }
      if (isOnDialog) {
         handleSubmit()
      }
   }

   // filter values in order to save only the proper ones
   const filterValues = useCallback(
      (values): DraftFormValues => {
         // only save the promotions if the start date is after 30 days from now
         if (!showPromotionInputs) {
            return {
               ...values,
               promotionChannelsCodes: [],
               promotionCountriesCodes: [],
               promotionUniversitiesCodes: [],
            }
         }

         return values
      },
      [showPromotionInputs]
   )

   return (
      <Container className={classes.root} id="livestreamForm">
         {allFetched ? (
            <Grid container spacing={2}>
               {submitted ? null : (
                  <Grid
                     item
                     md={12}
                     lg={2}
                     className={classes.navBar}
                     ref={navRef}
                  >
                     <Box
                        sx={{
                           position: { lg: "fixed" },
                           marginTop: { lg: "10vh" },
                        }}
                     >
                        <StreamFormNavigator steps={steps} navRef={navRef} />
                     </Box>
                  </Grid>
               )}
               <Grid
                  item
                  md={12}
                  lg={submitted ? 12 : 10}
                  mt={
                     isOnDialog
                        ? { xs: "150px", md: "100px", lg: "unset" }
                        : "unset"
                  }
               >
                  {submitted ? (
                     <SuccessMessage />
                  ) : (
                     <Formik
                        initialValues={formData}
                        innerRef={formRef}
                        validate={handleValidate}
                        onSubmit={async (values, { setSubmitting }) => {
                           await onSubmit(
                              filterValues(values),
                              { setSubmitting },
                              updateMode,
                              draftStreamId as string,
                              setFormData,
                              setDraftId,
                              status,
                              setStatus,
                              selectedJobs,
                              metaData
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
                                    await handleSubmitForm({
                                       handleSubmit,
                                       validateForm,
                                    })
                                 }}
                                 className={classes.form}
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
                                    sectionRef={streamInfoRef}
                                    publishDate={currentStream?.created?.toDate?.()}
                                    isPastStream={isPastStream}
                                 />

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
                                    classes={classes}
                                    sectionRef={speakersInfoRef}
                                 />

                                 <TargetStudentsInfo
                                    targetFieldsOfStudy={
                                       values.targetFieldsOfStudy
                                    }
                                    targetLevelsOfStudy={
                                       values.targetLevelsOfStudy
                                    }
                                    setFieldValue={setFieldValue}
                                    classes={classes}
                                    sectionRef={targetStudentsRef}
                                 />

                                 {/* <PromotionInfo */}
                                 {/*    setFieldValue={setFieldValue} */}
                                 {/*    promotionChannelsCodes={ */}
                                 {/*       values.promotionChannelsCodes */}
                                 {/*    } */}
                                 {/*    promotionCountriesCodes={ */}
                                 {/*       values.promotionCountriesCodes */}
                                 {/*    } */}
                                 {/*    promotionUniversitiesCodes={ */}
                                 {/*       values.promotionUniversitiesCodes */}
                                 {/*    } */}
                                 {/*    classes={classes} */}
                                 {/*    sectionRef={promotionInfoRef} */}
                                 {/*    isPastStream={isPastStream} */}
                                 {/* /> */}

                                 <JobSelectorCategory
                                    groupId={values.groupIds[0]}
                                    onSelectItems={setSelectedJobs}
                                    selectedItems={selectedJobs}
                                    sectionRef={jobInfoRef}
                                    classes={classes}
                                    values={values}
                                    setFieldValue={setFieldValue}
                                    isSubmitting={isSubmitting}
                                 />

                                 <HostAndQuestionsInfo
                                    existingGroups={existingGroups}
                                    handleGroupSelect={handleGroupSelect}
                                    values={values}
                                    selectedGroups={selectedGroups}
                                    isSubmitting={isSubmitting}
                                    isNotAdmin={isNotAdmin}
                                    setFieldValue={setFieldValue}
                                    isGroupAdmin={isGroupAdmin}
                                    groupId={group?.id}
                                    classes={classes}
                                    sectionRef={questionsInfoRef}
                                 />

                                 <EventCategoriesInfo
                                    setSelectedInterests={setSelectedInterests}
                                    selectedInterests={selectedInterests}
                                    existingInterests={existingInterests}
                                    isSubmitting={isSubmitting}
                                    setFieldValue={setFieldValue}
                                    classes={classes}
                                    sectionRef={eventCategoriesInfoRef}
                                    errors={errors}
                                    touched={touched}
                                    handleBlur={handleBlur}
                                 />

                                 <Box
                                    display={isOnDialog ? "none" : "flex"}
                                    justifyContent="end"
                                    mr={3}
                                 >
                                    {canPublish && (
                                       <Button
                                          startIcon={
                                             <PublishIcon fontSize="large" />
                                          }
                                          type="submit"
                                          onClick={handleClickSubmitForApproval}
                                          disabled={isSubmitting || isPending()}
                                          size="large"
                                          endIcon={
                                             isSubmitting && (
                                                <CircularProgress
                                                   size={20}
                                                   color="inherit"
                                                />
                                             )
                                          }
                                          variant="contained"
                                          color="secondary"
                                          sx={{ marginRight: 2 }}
                                       >
                                          <Typography variant="h5">
                                             {isSubmitting
                                                ? "Submitting"
                                                : isPending()
                                                ? "Pending for Approval"
                                                : "Submit Draft for Approval"}
                                          </Typography>
                                       </Button>
                                    )}
                                    <Button
                                       startIcon={<SaveIcon fontSize="large" />}
                                       type="submit"
                                       ref={saveChangesButtonRef}
                                       disabled={isSubmitting}
                                       size="large"
                                       onClick={() => {
                                          setStatus(SAVE_WITH_NO_VALIDATION)
                                       }}
                                       endIcon={
                                          isSubmitting && (
                                             <CircularProgress
                                                size={20}
                                                color="inherit"
                                             />
                                          )
                                       }
                                       variant="contained"
                                       color="secondary"
                                    >
                                       <Typography variant="h5">
                                          {isSubmitting
                                             ? "Saving"
                                             : "Save changes"}
                                       </Typography>
                                    </Button>
                                    <Button
                                       type="submit"
                                       ref={submitButtonRef}
                                       sx={{ display: "none" }}
                                       onClick={handleClickSubmitForApproval}
                                    />
                                 </Box>
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
