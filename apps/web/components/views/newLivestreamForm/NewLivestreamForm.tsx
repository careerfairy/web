import React, { Fragment, useContext, useEffect, useState } from "react"
import DeleteIcon from "@mui/icons-material/Delete"
import {
   Button,
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
import { useFirebaseService } from "../../../context/firebase/FirebaseServiceContext"
import ImageSelect from "./ImageSelect/ImageSelect"
import makeStyles from "@mui/styles/makeStyles"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker"
import SpeakerForm from "./SpeakerForm/SpeakerForm"
import { useRouter } from "next/router"
import FormGroup from "./FormGroup"
import ErrorContext from "../../../context/error/ErrorContext"
import {
   buildLivestreamObject,
   getDownloadUrl,
   getStreamSubCollectionSpeakers,
   handleAddSection,
   handleDeleteSection,
   handleErrorSection,
   handleFlattenOptions,
   languageCodes,
   validateStreamForm,
} from "../../helperFunctions/streamFormFunctions"
import { useAuth } from "../../../HOCs/AuthProvider"
import { LanguageSelect } from "../../helperFunctions/streamFormFunctions/components"
import MultiListSelect from "../common/MultiListSelect"
import { useGroups, useInterests } from "../../custom-hook/useCollection"
import StreamDurationSelect from "../draftStreamForm/StreamDurationSelect"
import GroupCategorySelect from "./GroupCategorySelect/GroupCategorySelect"
import { DEFAULT_STREAM_DURATION_MINUTES } from "../../../constants/streams"
import { LivestreamJobAssociation } from "@careerfairy/shared-lib/dist/livestreams"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import JobSelectorCategory from "../draftStreamForm/JobSelector/JobSelectorCategory"
import FieldsOfStudyMultiSelector from "../draftStreamForm/TargetFieldsOfStudy/FieldsOfStudyMultiSelector"
import LevelsOfStudyMultiSelector from "../draftStreamForm/TargetFieldsOfStudy/LevelsOfStudyMultiSelector"
import Stack from "@mui/material/Stack"
import Box from "@mui/material/Box"
import { makeLivestreamEventDetailsUrl } from "@careerfairy/shared-lib/src/utils/urls"

const useStyles = makeStyles((theme) => ({
   root: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      minHeight: "90vh",
      borderRadius: 5,
      marginBottom: 30,
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
}))

const speakerObj = {
   avatar: "",
   firstName: "",
   lastName: "",
   position: "",
   background: "",
}

const NewLivestreamForm = () => {
   const router = useRouter()
   const firebase = useFirebaseService()
   const { userData, authenticatedUser } = useAuth()

   const {
      query: { livestreamId, draftStreamId, absolutePath, groupId },
      push,
   } = router
   const classes = useStyles()

   const { setGeneralError } = useContext(ErrorContext)
   const [selectedGroups, setSelectedGroups] = useState([])
   const [selectedInterests, setSelectedInterests] = useState([])
   const [selectedJobs, setSelectedJobs] = useState<LivestreamJobAssociation[]>(
      []
   )
   const [fetchingBackgrounds, setFetchingBackgrounds] = useState(true)
   const [fetchingLogos, setFetchingLogos] = useState(true)
   const [fetchingAvatars, setFetchingAvatars] = useState(true)
   const [allFetched, setAllFetched] = useState(false)
   const [updateMode, setUpdateMode] = useState(undefined)
   const [targetCategories, setTargetCategories] = useState({})

   const { data: existingGroups, isLoading: fetchingGroups } = useGroups()
   const { data: existingInterests, isLoading: fetchingInterests } =
      useInterests()

   const [existingLogos, setExistingLogos] = useState([])
   const [existingAvatars, setExistingAvatars] = useState([])
   const [existingBackgrounds, setExistingBackgrounds] = useState([])
   const [formData, setFormData] = useState<any>({
      companyLogoUrl: "",
      backgroundImageUrl: "",
      company: "",
      companyId: "",
      title: "",
      targetCategories: {},
      interestsIds: [],
      groupIds: [],
      start: new Date(),
      hidden: false,
      summary: "",
      speakers: { [uuidv4()]: speakerObj },
      language: languageCodes[0],
      duration: DEFAULT_STREAM_DURATION_MINUTES,
      targetFieldsOfStudy: [],
      targetLevelsOfStudy: [],
      questionsDisabled: false,
   })

   useEffect(() => {
      // If there are no relevant IDs and ur not a super admin, get lost...
      if (
         !(livestreamId || draftStreamId) &&
         !isAuthenticating()
         // && !hasPermissionToCreate()
      ) {
         //re-direct! if no Ids in query!
         // replace("/")
      }
      if ((livestreamId || draftStreamId) && allFetched) {
         ;(async () => {
            const targetId = livestreamId || draftStreamId
            const forLivestream = targetId === livestreamId
            const targetCollection = livestreamId
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
               let livestream = livestreamQuery.data()
               if (forLivestream) {
                  livestream.id = livestreamId
               }
               const newFormData = {
                  ...(forLivestream && { id: livestreamId }),
                  companyLogoUrl: livestream.companyLogoUrl || "",
                  backgroundImageUrl: livestream.backgroundImageUrl || "",
                  company: livestream.company || "",
                  companyId: livestream.companyId || "",
                  duration:
                     livestream.duration || DEFAULT_STREAM_DURATION_MINUTES,
                  title: livestream.title || "",
                  groupIds: livestream.groupIds || [],
                  targetCategories: {},
                  interestsIds: livestream.interestsIds || [],
                  start: livestream.start.toDate() || new Date(),
                  hidden: livestream.hidden || false,
                  summary: livestream.summary || "",
                  speakers: getStreamSubCollectionSpeakers(
                     livestream,
                     speakerQuery
                  ),
                  language: livestream.language || languageCodes[0],
                  targetFieldsOfStudy: livestream.targetFieldsOfStudy ?? [],
                  targetLevelsOfStudy: livestream.targetLevelsOfStudy ?? [],
                  questionsDisabled: Boolean(livestream.questionsDisabled),
               }
               setFormData(newFormData)
               setSelectedInterests(
                  existingInterests.filter((i) =>
                     newFormData.interestsIds.includes(i.id)
                  )
               )
               setSelectedJobs(livestream.jobs || [])
               setSelectedGroups(
                  existingGroups
                     .filter((g) => newFormData.groupIds.includes(g.id))
                     .map(groupAddFlattenOptions)
               )
               setTargetCategories(livestream.targetCategories || {})
               if (forLivestream) {
                  setUpdateMode(true)
               }
            } else {
               // If you're not a super admin and the Ids dont return any relevant draft or stream, get lost...
               if (!hasPermissionToCreate()) {
                  //re-direct if no queries were found!
                  // replace("/")
               }
            }
         })()
      } else {
         if (groupId) {
            setSelectedGroups(
               existingGroups
                  .filter((g) => [groupId].includes(g.id))
                  .map(groupAddFlattenOptions)
            )
         }
         setUpdateMode(false)
      }
   }, [
      livestreamId,
      allFetched,
      draftStreamId,
      groupId,
      existingInterests,
      existingGroups,
   ])

   useEffect(() => {
      handleGetFiles("mentors-pictures", setFetchingAvatars, setExistingAvatars)
      handleGetFiles(
         "illustration-images",
         setFetchingBackgrounds,
         setExistingBackgrounds
      )
      handleGetFiles("company-logos", setFetchingLogos, setExistingLogos)
   }, [firebase])

   useEffect(() => {
      if (
         !fetchingBackgrounds &&
         !fetchingLogos &&
         !fetchingAvatars &&
         !fetchingGroups &&
         !fetchingInterests
      ) {
         setAllFetched(true)
      }
   }, [
      fetchingAvatars,
      fetchingBackgrounds,
      fetchingLogos,
      fetchingGroups,
      fetchingInterests,
   ])

   const handleSelectGroups = (groups) => {
      setSelectedGroups(groups.map(groupAddFlattenOptions))
   }

   const groupAddFlattenOptions = (group) => {
      return { ...group, flattenedOptions: handleFlattenOptions(group) }
   }

   const handleSetGroupCategories = (groupId, targetOptionIds) => {
      const newTargetCategories = { ...targetCategories }
      newTargetCategories[groupId] = targetOptionIds
      setTargetCategories(newTargetCategories)
   }

   const handleGetFiles = (path, setFetchingCallback, setDataCallback) => {
      firebase
         .getStorageRef()
         .child(path)
         .listAll()
         .then((res) => {
            let fileItems = []
            res.items.forEach((itemRef) => {
               fileItems.push(itemRef)
            })
            let options = fileItems.map((file) => {
               return { text: file.name, value: getDownloadUrl(file.fullPath) }
            })
            setFetchingCallback(false)
            setDataCallback(options)
         })
   }

   const handleSubmitForm = async (values, { setSubmitting }) => {
      try {
         setGeneralError("")
         setSubmitting(true)
         const livestream: any = buildLivestreamObject(
            values,
            updateMode,
            livestreamId as string,
            firebase
         )

         if (selectedJobs.length) {
            livestream.jobs = selectedJobs
            livestream.hasJobs = selectedJobs.length > 0
         }

         let id
         if (updateMode) {
            id = livestream.id
            if (!livestream.author) {
               livestream.author = {
                  email: authenticatedUser.email,
               }
            }
            await firebase.updateLivestream(livestream, "livestreams", {})
         } else {
            const author = {
               email: authenticatedUser.email,
            }
            id = await firebase.addLivestream(
               livestream,
               "livestreams",
               author,
               {}
            )
         }
         if (absolutePath) {
            return push({
               pathname: absolutePath as string,
            })
         } else if (values.hidden && values.groupIds.length) {
            return push(
               `/next-livestreams?careerCenterId=${values.groupIds[0]}&livestreamId=${id}`
            )
         } else {
            return push(makeLivestreamEventDetailsUrl(id))
         }
      } catch (e) {
         console.error(e)
         setGeneralError("Something went wrong")
      }
   }

   const hasPermissionToCreate = () => {
      return Boolean(userData?.isAdmin)
   }

   const isAuthenticating = () => {
      return Boolean(!authenticatedUser.isLoaded && authenticatedUser.isEmpty)
   }

   return (
      <Container className={classes.root}>
         {allFetched && updateMode !== undefined ? (
            <Formik
               initialValues={formData}
               enableReinitialize
               validate={(values) => validateStreamForm(values, false)}
               onSubmit={handleSubmitForm}
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
               }) => (
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
                     <FormGroup>
                        <Grid xs={7} sm={7} md={10} lg={10} xl={10} item>
                           <FormControl fullWidth>
                              <TextField
                                 name="title"
                                 variant="outlined"
                                 fullWidth
                                 id="title"
                                 label="Live Stream Title"
                                 inputProps={{ maxLength: 1000 }}
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
                                 in={Boolean(errors.title && touched.title)}
                              >
                                 {errors.title}
                              </Collapse>
                           </FormControl>
                        </Grid>
                        <Grid
                           xs={5}
                           sm={5}
                           md={2}
                           lg={2}
                           xl={2}
                           style={{ display: "grid", placeItems: "center" }}
                           item
                        >
                           <FormControlLabel
                              labelPlacement="start"
                              label="Hidden"
                              control={
                                 <Switch
                                    checked={values.hidden}
                                    onChange={handleChange}
                                    color="primary"
                                    id="hidden"
                                    disabled={isSubmitting}
                                    name="hidden"
                                    inputProps={{
                                       "aria-label": "primary checkbox",
                                    }}
                                 />
                              }
                           />
                        </Grid>
                        <Grid xs={12} sm={12} md={6} lg={6} xl={6} item>
                           <ImageSelect
                              getDownloadUrl={getDownloadUrl}
                              firebase={firebase}
                              setFieldValue={setFieldValue}
                              isSubmitting={isSubmitting}
                              path="company-logos"
                              label="Logo"
                              handleBlur={handleBlur}
                              formName="companyLogoUrl"
                              isSuperAdmin={userData?.isAdmin}
                              value={values.companyLogoUrl}
                              options={existingLogos}
                              loading={fetchingLogos}
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
                              firebase={firebase}
                              setFieldValue={setFieldValue}
                              isSubmitting={isSubmitting}
                              path="illustration-images"
                              isSuperAdmin={userData.isAdmin}
                              label="Company Background"
                              handleBlur={handleBlur}
                              formName="backgroundImageUrl"
                              value={values.backgroundImageUrl}
                              options={existingBackgrounds}
                              loading={fetchingBackgrounds}
                              error={
                                 errors.backgroundImageUrl &&
                                 touched.backgroundImageUrl &&
                                 errors.backgroundImageUrl
                              }
                              isAvatar={false}
                           />
                        </Grid>
                        <Grid xs={12} sm={12} md={6} lg={6} xl={6} item>
                           <FormControl fullWidth>
                              <TextField
                                 name="company"
                                 variant="outlined"
                                 fullWidth
                                 id="company"
                                 label="Company Name"
                                 inputProps={{ maxLength: 500 }}
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
                                 in={Boolean(errors.company && touched.company)}
                              >
                                 {errors.company}
                              </Collapse>
                           </FormControl>
                        </Grid>
                        <Grid xs={12} sm={12} md={6} lg={6} xl={6} item>
                           <FormControl fullWidth>
                              <TextField
                                 name="companyId"
                                 variant="outlined"
                                 fullWidth
                                 id="companyId"
                                 label="Company ID"
                                 inputProps={{ maxLength: 1000 }}
                                 onBlur={handleBlur}
                                 value={values.companyId}
                                 disabled={isSubmitting}
                                 error={Boolean(
                                    errors.companyId &&
                                       touched.companyId &&
                                       errors.companyId
                                 )}
                                 onChange={handleChange}
                              />
                              <Collapse
                                 style={{ color: "red" }}
                                 in={Boolean(
                                    errors.companyId && touched.companyId
                                 )}
                              >
                                 {errors.companyId}
                              </Collapse>
                           </FormControl>
                        </Grid>
                        <Grid xs={12} sm={6} md={4} item>
                           <LocalizationProvider dateAdapter={AdapterDateFns}>
                              <DateTimePicker
                                 renderInput={(params) => (
                                    <TextField fullWidth {...params} />
                                 )}
                                 disabled={isSubmitting}
                                 label="Live Stream Start Date"
                                 value={values.start}
                                 onChange={(value) => {
                                    setFieldValue(
                                       "start",
                                       new Date(value),
                                       true
                                    )
                                 }}
                              />
                           </LocalizationProvider>
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
                        <Grid xs={12} sm={12} md={12} lg={12} xl={12} item>
                           <FormControl fullWidth>
                              <TextField
                                 name="summary"
                                 variant="outlined"
                                 fullWidth
                                 multiline
                                 id="summary"
                                 label="Summary"
                                 rows={2}
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
                                 in={Boolean(errors.summary && touched.summary)}
                              >
                                 {errors.summary}
                              </Collapse>
                           </FormControl>
                        </Grid>

                        {userData?.isAdmin && (
                           <Grid xs={12}>
                              <Stack direction="row" spacing={2}>
                                 <Box pl={2} display="flex" alignItems="center">
                                    Settings only for CF Admins:
                                 </Box>
                                 <Tooltip
                                    placement="top"
                                    arrow
                                    title={
                                       <Typography>
                                          By disabling questions the
                                          participants will no longer be able to
                                          use the Q&A section during the
                                          livestream and create questions during
                                          the registration process.
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
                              </Stack>
                           </Grid>
                        )}
                     </FormGroup>
                     {Object.keys(values.speakers).map((key, index) => {
                        return (
                           <Fragment key={key}>
                              <div className={classes.speakersLabel}>
                                 <Typography variant="h4">{`Speaker ${
                                    index + 1
                                 }`}</Typography>
                                 {!!index && (
                                    <Fab
                                       size="small"
                                       color="secondary"
                                       onClick={() =>
                                          handleDeleteSection(
                                             "speakers",
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
                                    setValues={setValues}
                                    speakerObj={speakerObj}
                                    handleAddSpeaker={handleAddSection}
                                    objectKey={key}
                                    index={index}
                                    firstNameError={handleErrorSection(
                                       "speakers",
                                       key,
                                       "firstName",
                                       errors,
                                       touched
                                    )}
                                    lastNameError={handleErrorSection(
                                       "speakers",
                                       key,
                                       "lastName",
                                       errors,
                                       touched
                                    )}
                                    positionError={handleErrorSection(
                                       "speakers",
                                       key,
                                       "position",
                                       errors,
                                       touched
                                    )}
                                    backgroundError={handleErrorSection(
                                       "speakers",
                                       key,
                                       "background",
                                       errors,
                                       touched
                                    )}
                                    getDownloadUrl={getDownloadUrl}
                                    loading={fetchingAvatars}
                                    speaker={values.speakers[key]}
                                    values={values}
                                    firebase={firebase}
                                    setFieldValue={setFieldValue}
                                    isSubmitting={isSubmitting}
                                    handleBlur={handleBlur}
                                    options={existingAvatars}
                                 />
                              </FormGroup>
                           </Fragment>
                        )
                     })}
                     <Typography style={{ color: "white" }} variant="h4">
                        Groups & Audience:
                     </Typography>
                     <FormGroup>
                        <Grid xs={12} sm={12} md={12} lg={12} xl={12} item>
                           <MultiListSelect
                              inputName="groupIds"
                              onSelectItems={handleSelectGroups}
                              selectedItems={selectedGroups}
                              allValues={existingGroups}
                              disabled={isSubmitting}
                              getLabelFn={mapGroupLabel}
                              setFieldValue={setFieldValue}
                              inputProps={{
                                 label: "Add some Groups",
                                 placeholder: "Add partner groups",
                              }}
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
                                    targetCategories={targetCategories}
                                    isSubmitting={isSubmitting}
                                    group={group}
                                 />
                              </Grid>
                           )
                        })}
                     </FormGroup>

                     <Typography style={{ color: "white" }} variant="h4">
                        Event Categories:
                     </Typography>
                     <FormGroup>
                        <Grid xs={12} sm={12} md={12} lg={12} xl={12} item>
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

                     <Typography style={{ color: "white" }} variant="h4">
                        Target Students:
                     </Typography>

                     <FormGroup>
                        <Grid xs={12} item>
                           <FieldsOfStudyMultiSelector
                              selectedItems={values.targetFieldsOfStudy}
                              setFieldValue={setFieldValue}
                           />
                        </Grid>

                        <Grid xs={12} item>
                           <LevelsOfStudyMultiSelector
                              selectedItems={values.targetLevelsOfStudy}
                              setFieldValue={setFieldValue}
                           />
                        </Grid>
                     </FormGroup>

                     <SuspenseWithBoundary hide>
                        {selectedGroups.length > 0 && (
                           <JobSelectorCategory
                              groupId={selectedGroups[0].id} // we only support a single group for now
                              onSelectItems={setSelectedJobs}
                              selectedItems={selectedJobs}
                              sectionRef={null}
                              classes={null}
                           />
                        )}
                     </SuspenseWithBoundary>

                     <Button
                        type="submit"
                        disabled={isSubmitting}
                        size="large"
                        className={classes.submit}
                        endIcon={
                           isSubmitting && (
                              <CircularProgress size={20} color="inherit" />
                           )
                        }
                        variant="contained"
                        fullWidth
                     >
                        <Typography variant="h4">
                           {updateMode
                              ? isSubmitting
                                 ? "Updating"
                                 : "Update Live Stream"
                              : isSubmitting
                              ? "Saving"
                              : "Create Live Stream"}
                        </Typography>
                     </Button>
                  </form>
               )}
            </Formik>
         ) : (
            <CircularProgress style={{ marginTop: "30vh", color: "white" }} />
         )}
      </Container>
   )
}

const mapGroupLabel = (obj) => obj.universityName

export default NewLivestreamForm
