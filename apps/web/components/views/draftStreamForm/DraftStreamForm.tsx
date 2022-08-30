import React, { Fragment, useEffect, useRef, useState } from "react"
import DeleteIcon from "@mui/icons-material/Delete"
import {
   Box,
   Button,
   ButtonGroup,
   CircularProgress,
   Collapse,
   Container,
   Fab,
   FormControl,
   FormControlLabel,
   Grid,
   Switch,
   TextField,
   Tooltip,
   Typography,
} from "@mui/material"
import { Formik } from "formik"
import { v4 as uuidv4 } from "uuid"
import { withFirebase } from "../../../context/firebase/FirebaseServiceContext"
import ImageSelect from "./ImageSelect/ImageSelect"
import makeStyles from "@mui/styles/makeStyles"
import DateTimePicker from "@mui/lab/DateTimePicker"
import SpeakerForm from "./SpeakerForm/SpeakerForm"
import GroupCategorySelect from "./GroupCategorySelect/GroupCategorySelect"
import { useRouter } from "next/router"
import FormGroup from "./FormGroup"
import WarningIcon from "@mui/icons-material/Warning"
import {
   getDownloadUrl,
   getStreamSubCollectionSpeakers,
   handleAddSpeaker,
   handleDeleteSpeaker,
   handleError,
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
import { LanguageSelect } from "../../helperFunctions/streamFormFunctions/components"
import { useAuth } from "../../../HOCs/AuthProvider"
import StreamDurationSelect from "./StreamDurationSelect"
import { DEFAULT_STREAM_DURATION_MINUTES } from "../../../constants/streams"
import MultiListSelect from "../common/MultiListSelect"
import { useInterests } from "../../custom-hook/useCollection"
import { createStyles } from "@mui/styles"
import JobSelectorCategory from "./JobSelector/JobSelectorCategory"
import {
   LivestreamEvent,
   LivestreamJobAssociation,
} from "@careerfairy/shared-lib/dist/livestreams"
import { SuspenseWithBoundary } from "../../ErrorBoundary"

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
      },
      form: {
         width: "100%",
      },
      speakersLabel: {
         color: "white",
         display: "flex",
         alignItems: "center",
         justifyContent: "space-between",
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
   })
)

const speakerObj = {
   avatar: "",
   firstName: "",
   lastName: "",
   position: "",
   background: "",
}

const DraftStreamForm = ({
   firebase,
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
}) => {
   const router = useRouter()
   const { userData } = useAuth()
   const SPEAKER_LIMIT = userData?.isAdmin ? 15 : 10

   let {
      query: { careerCenterIds, draftStreamId },
      replace,
      pathname,
   } = router
   draftStreamId = draftStreamId || currentStream?.id
   const { enqueueSnackbar } = useSnackbar()
   const [status, setStatus] = useState("")
   const isGroupAdmin = () => Boolean(group?.id)
   const classes = useStyles({
      isGroupAdmin: isGroupAdmin(),
   })

   const [targetCategories, setTargetCategories] = useState({})
   const [selectedGroups, setSelectedGroups] = useState([])
   const [selectedInterests, setSelectedInterests] = useState([])
   const [selectedJobs, setSelectedJobs] = useState<LivestreamJobAssociation[]>(
      []
   )
   const [allFetched, setAllFetched] = useState(false)
   const [updateMode, setUpdateMode] = useState(false)

   const { data: existingInterests } = useInterests()

   const [draftId, setDraftId] = useState("")

   const [existingGroups, setExistingGroups] = useState([])
   const [formData, setFormData] = useState({
      companyLogoUrl: "",
      backgroundImageUrl: "",
      company: "",
      companyId: "",
      title: "",
      targetCategories: {},
      interestsIds: [],
      groupIds: [],
      start: new Date(),
      duration: 60,
      hidden: false,
      summary: "",
      speakers: { [uuidv4()]: speakerObj },
      status: {},
      language: languageCodes[0],
      questionsDisabled: false,
   })

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
            const targetId = draftStreamId
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
               let livestream: LivestreamEvent = livestreamQuery.data()
               const newFormData: any = {
                  id: targetId,
                  companyLogoUrl: livestream.companyLogoUrl || "",
                  backgroundImageUrl: livestream.backgroundImageUrl || "",
                  company: livestream.company || "",
                  companyId: livestream.companyId || "",
                  title: livestream.title || "",
                  targetCategories: {},
                  groupIds: livestream.groupIds || [],
                  interestsIds: livestream.interestsIds || [],
                  start: livestream.start.toDate() || new Date(),
                  duration:
                     livestream.duration || DEFAULT_STREAM_DURATION_MINUTES,
                  hidden: Boolean(livestream.hidden),
                  summary: livestream.summary || "",
                  speakers: getStreamSubCollectionSpeakers(
                     livestream,
                     speakerQuery
                  ),
                  status: livestream.status || {},
                  language: livestream.language || languageCodes[0],
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
               setTargetCategories(livestream.targetCategories || {})
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

   const isPending = () => {
      // @ts-ignore
      return Boolean(formData?.status?.pendingApproval === true)
   }

   const groupsSelected = () => {
      return Boolean(selectedGroups.length)
   }

   const buildHiddenMessage = () => {
      // Creates the group names string separated by commas and an "and" at the end
      const groupNames = selectedGroups
         .map((group) => group.universityName)
         .join(", ")
         .replace(/, ([^,]*)$/, " and $1")
      return `By enabling this you are making this stream only visible to members of ${groupNames}.`
   }

   const handleSetGroupCategories = (groupId, targetOptionIds) => {
      const newTargetCategories = { ...targetCategories }
      newTargetCategories[groupId] = targetOptionIds
      setTargetCategories(newTargetCategories)
   }

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

   const isNotAdmin = () => !Boolean(userData?.isAdmin || group?.id)

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
      <Container className={classes.root}>
         {allFetched ? (
            submitted ? (
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
                        targetCategories,
                        updateMode,
                        draftStreamId,
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
                           <Typography style={{ color: "white" }} variant="h4">
                              Stream Info:
                           </Typography>
                           <FormGroup container>
                              <Grid
                                 xs={groupsSelected() ? 7 : 12}
                                 sm={groupsSelected() ? 7 : 12}
                                 md={groupsSelected() ? 9 : 12}
                                 lg={groupsSelected() ? 9 : 12}
                                 xl={groupsSelected() ? 9 : 12}
                                 item
                              >
                                 <FormControl fullWidth>
                                    <TextField
                                       name="title"
                                       variant="outlined"
                                       fullWidth
                                       id="title"
                                       label="Livestream Title"
                                       inputProps={{ maxLength: 104 }}
                                       onBlur={handleBlur}
                                       value={values.title}
                                       disabled={isSubmitting}
                                       error={Boolean(
                                          errors.title &&
                                             touched.title &&
                                             errors.title
                                       )}
                                       onChange={handleChange}
                                    />
                                    <Collapse
                                       style={{ color: "red" }}
                                       in={Boolean(
                                          errors.title && touched.title
                                       )}
                                    >
                                       {errors.title}
                                    </Collapse>
                                 </FormControl>
                              </Grid>
                              {groupsSelected() && (
                                 <Grid
                                    xs={5}
                                    sm={5}
                                    md={3}
                                    lg={3}
                                    xl={3}
                                    style={{
                                       display: "grid",
                                       placeItems: "center",
                                    }}
                                    item
                                 >
                                    <Tooltip
                                       placement="top"
                                       arrow
                                       disableHoverListener={Boolean(
                                          !selectedGroups.length
                                       )}
                                       title={
                                          <Typography>
                                             {buildHiddenMessage()}
                                          </Typography>
                                       }
                                    >
                                       <FormControlLabel
                                          labelPlacement="start"
                                          label="Make Exclusive"
                                          disabled={Boolean(
                                             !selectedGroups.length
                                          )}
                                          control={
                                             <Switch
                                                checked={Boolean(values.hidden)}
                                                onChange={handleChange}
                                                disabled={Boolean(
                                                   !selectedGroups.length ||
                                                      isSubmitting
                                                )}
                                                color="primary"
                                                id="hidden"
                                                name="hidden"
                                                inputProps={{
                                                   "aria-label":
                                                      "primary checkbox",
                                                }}
                                             />
                                          }
                                       />
                                    </Tooltip>
                                 </Grid>
                              )}
                              <Grid xs={12} sm={12} md={6} lg={6} xl={6} item>
                                 <ImageSelect
                                    getDownloadUrl={getDownloadUrl}
                                    setFieldValue={setFieldValue}
                                    isSubmitting={isSubmitting}
                                    path="company-logos"
                                    label="Logo"
                                    formName="companyLogoUrl"
                                    value={values.companyLogoUrl}
                                    error={
                                       errors.companyLogoUrl &&
                                       touched.companyLogoUrl &&
                                       errors.companyLogoUrl
                                    }
                                    isAvatar={false}
                                 />
                              </Grid>
                              <Grid xs={12} sm={12} md={6} lg={6} xl={6} item>
                                 <ImageSelect
                                    getDownloadUrl={getDownloadUrl}
                                    setFieldValue={setFieldValue}
                                    isSubmitting={isSubmitting}
                                    path="illustration-images"
                                    label="Company Background"
                                    formName="backgroundImageUrl"
                                    value={values.backgroundImageUrl}
                                    error={
                                       errors.backgroundImageUrl &&
                                       touched.backgroundImageUrl &&
                                       errors.backgroundImageUrl
                                    }
                                    isAvatar={false}
                                 />
                              </Grid>
                              <Grid xs={12} sm={6} md={4} item>
                                 <DateTimePicker
                                    renderInput={(params) => (
                                       <TextField fullWidth {...params} />
                                    )}
                                    disabled={isSubmitting}
                                    label="Livestream Start Date"
                                    value={values.start}
                                    onChange={(value) => {
                                       setFieldValue(
                                          "start",
                                          new Date(value),
                                          true
                                       )
                                    }}
                                 />
                              </Grid>
                              <Grid xs={12} sm={6} md={4} item>
                                 <StreamDurationSelect
                                    value={values.duration}
                                    start={values.start}
                                    disabled={isSubmitting}
                                    label="Estimated Duration"
                                    setFieldValue={setFieldValue}
                                    fullWidth
                                    variant="outlined"
                                 />
                              </Grid>
                              <Grid xs={12} sm={12} md={4} item>
                                 <LanguageSelect
                                    value={values.language}
                                    setFieldValue={setFieldValue}
                                    name="language"
                                 />
                              </Grid>
                              <Grid xs={12} sm={12} item>
                                 <FormControl fullWidth>
                                    <TextField
                                       name="company"
                                       variant="outlined"
                                       fullWidth
                                       id="company"
                                       label="Company Name"
                                       inputProps={{ maxLength: 70 }}
                                       onBlur={handleBlur}
                                       value={values.company}
                                       disabled={isSubmitting}
                                       error={Boolean(
                                          errors.company &&
                                             touched.company &&
                                             errors.company
                                       )}
                                       onChange={handleChange}
                                    />
                                    <Collapse
                                       style={{ color: "red" }}
                                       in={Boolean(
                                          errors.company && touched.company
                                       )}
                                    >
                                       {errors.company}
                                    </Collapse>
                                 </FormControl>
                              </Grid>

                              <Grid xs={12} item>
                                 <FormControl fullWidth>
                                    <TextField
                                       name="summary"
                                       variant="outlined"
                                       fullWidth
                                       multiline
                                       id="summary"
                                       label="Summary"
                                       maxRows={10}
                                       inputProps={{ maxLength: 5000 }}
                                       onBlur={handleBlur}
                                       value={values.summary}
                                       disabled={isSubmitting}
                                       error={Boolean(
                                          errors.summary &&
                                             touched.summary &&
                                             errors.summary
                                       )}
                                       onChange={handleChange}
                                    />
                                    <Collapse
                                       style={{ color: "red" }}
                                       in={Boolean(
                                          errors.summary && touched.summary
                                       )}
                                    >
                                       {errors.summary}
                                    </Collapse>
                                 </FormControl>
                              </Grid>

                              {userData?.isAdmin && (
                                 <Grid xs={12}>
                                    <Tooltip
                                       placement="top"
                                       arrow
                                       title={
                                          <Typography>
                                             By disabling questions the
                                             participants will no longer be able
                                             to use the Q&A section during the
                                             livestream and create questions
                                             during the registration process.
                                          </Typography>
                                       }
                                    >
                                       <FormControlLabel
                                          labelPlacement="start"
                                          label="Disable Q&A"
                                          control={
                                             <Switch
                                                checked={Boolean(
                                                   values.questionsDisabled
                                                )}
                                                onChange={handleChange}
                                                disabled={Boolean(isSubmitting)}
                                                color="primary"
                                                id="questionsDisabled"
                                                name="questionsDisabled"
                                                inputProps={{
                                                   "aria-label":
                                                      "primary checkbox",
                                                }}
                                             />
                                          }
                                       />
                                    </Tooltip>
                                 </Grid>
                              )}
                           </FormGroup>
                           {Object.keys(values.speakers).map((key, index) => {
                              return (
                                 <Fragment key={key}>
                                    <div className={classes.speakersLabel}>
                                       <Typography variant="h4">
                                          {index === 0
                                             ? "Main Speaker:"
                                             : `Speaker ${index + 1}:`}
                                       </Typography>
                                       {!!index && (
                                          <Fab
                                             size="small"
                                             color="secondary"
                                             onClick={() =>
                                                handleDeleteSpeaker(
                                                   key,
                                                   values,
                                                   setValues
                                                )
                                             }
                                          >
                                             <DeleteIcon />
                                          </Fab>
                                       )}
                                    </div>
                                    <FormGroup>
                                       <SpeakerForm
                                          key={key}
                                          speakerLimit={SPEAKER_LIMIT}
                                          handleDeleteSpeaker={
                                             handleDeleteSpeaker
                                          }
                                          setValues={setValues}
                                          speakerObj={speakerObj}
                                          handleAddSpeaker={handleAddSpeaker}
                                          objectKey={key}
                                          index={index}
                                          firstNameError={handleError(
                                             key,
                                             "firstName",
                                             errors,
                                             touched
                                          )}
                                          lastNameError={handleError(
                                             key,
                                             "lastName",
                                             errors,
                                             touched
                                          )}
                                          positionError={handleError(
                                             key,
                                             "position",
                                             errors,
                                             touched
                                          )}
                                          backgroundError={handleError(
                                             key,
                                             "background",
                                             errors,
                                             touched
                                          )}
                                          getDownloadUrl={getDownloadUrl}
                                          speaker={values.speakers[key]}
                                          values={values}
                                          firebase={firebase}
                                          setFieldValue={setFieldValue}
                                          isSubmitting={isSubmitting}
                                          handleBlur={handleBlur}
                                          loading={false}
                                       />
                                    </FormGroup>
                                 </Fragment>
                              )
                           })}
                           {!!existingGroups.length && (
                              <>
                                 <Typography
                                    style={{ color: "white" }}
                                    variant="h4"
                                 >
                                    Groups & Audience:
                                 </Typography>
                                 <FormGroup>
                                    <Grid
                                       xs={12}
                                       sm={12}
                                       md={12}
                                       lg={12}
                                       xl={12}
                                       item
                                    >
                                       <MultiListSelect
                                          inputName="groupIds"
                                          onSelectItems={setSelectedGroups}
                                          selectedItems={selectedGroups}
                                          allValues={existingGroups}
                                          disabled={
                                             isSubmitting || isNotAdmin()
                                          }
                                          getLabelFn={mapGroupLabel}
                                          setFieldValue={setFieldValue}
                                          inputProps={{
                                             label: "Add some Groups",
                                             placeholder:
                                                "Add some partner groups",
                                          }}
                                          disabledValues={
                                             isNotAdmin()
                                                ? existingGroups.map(
                                                     (g) => g.id
                                                  )
                                                : [group?.id]
                                          }
                                       />
                                    </Grid>
                                    {selectedGroups.map((group) => {
                                       return (
                                          <Grid
                                             key={group.groupId}
                                             xs={12}
                                             sm={12}
                                             md={12}
                                             lg={12}
                                             xl={12}
                                             item
                                          >
                                             <GroupCategorySelect
                                                handleSetGroupCategories={
                                                   handleSetGroupCategories
                                                }
                                                targetCategories={
                                                   targetCategories
                                                }
                                                isSubmitting={isSubmitting}
                                                group={group}
                                             />
                                          </Grid>
                                       )
                                    })}
                                 </FormGroup>
                              </>
                           )}

                           <Typography style={{ color: "white" }} variant="h4">
                              Event Categories:
                           </Typography>
                           <FormGroup>
                              <Grid
                                 xs={12}
                                 sm={12}
                                 md={12}
                                 lg={12}
                                 xl={12}
                                 item
                              >
                                 <MultiListSelect
                                    inputName="interestsIds"
                                    onSelectItems={setSelectedInterests}
                                    selectedItems={selectedInterests}
                                    allValues={existingInterests}
                                    disabled={isSubmitting}
                                    limit={5}
                                    setFieldValue={setFieldValue}
                                    inputProps={{
                                       label: "Add some Categories",
                                       placeholder:
                                          "Choose 5 categories that best describe this event",
                                    }}
                                    chipProps={{
                                       variant: "outlined",
                                    }}
                                    isCheckbox={true}
                                 />
                              </Grid>
                           </FormGroup>

                           <SuspenseWithBoundary hide>
                              {values.groupIds.length > 0 && (
                                 <JobSelectorCategory
                                    groupId={values.groupIds[0]} // we only support a single group for now
                                    onSelectItems={setSelectedJobs}
                                    selectedItems={selectedJobs}
                                 />
                              )}
                           </SuspenseWithBoundary>

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
                                    {isSubmitting ? "Saving" : "Save changes"}
                                 </Typography>
                              </Button>
                           </ButtonGroup>
                        </form>
                     )
                  }}
               </Formik>
            )
         ) : (
            <CircularProgress style={{ margin: "auto", color: "white" }} />
         )}
      </Container>
   )
}

const mapGroupLabel = (obj) => obj.universityName

export default withFirebase(DraftStreamForm)
