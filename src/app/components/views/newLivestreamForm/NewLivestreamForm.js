import React, {Fragment, useContext, useEffect, useState} from 'react';
import DeleteIcon from '@material-ui/icons/Delete';
import {
    Button,
    CircularProgress,
    Collapse,
    Container,
    FormControl,
    FormControlLabel,
    Grid,
    Switch,
    TextField,
    Typography,
    Fab,
} from "@material-ui/core";
import {Formik} from 'formik';
import {v4 as uuidv4} from 'uuid';
import {withFirebase} from "../../../context/firebase";
import ImageSelect from "./ImageSelect/ImageSelect";
import {makeStyles} from "@material-ui/core/styles";
import {DateTimePicker, MuiPickersUtilsProvider,} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import SpeakerForm from "./SpeakerForm/SpeakerForm";
import MultiGroupSelect from "./MultiGroupSelect/MultiGroupSelect";
import GroupCategorySelect from "./GroupCategorySelect/GroupCategorySelect";
import {useRouter} from "next/router";
import FormGroup from "./FormGroup";
import ErrorContext from "../../../context/error/ErrorContext";
import {
    buildLivestreamObject,
    getStreamSubCollectionSpeakers,
    handleAddSpeaker,
    handleDeleteSpeaker,
    handleError,
    handleFlattenOptions, languageCodes,
    validateStreamForm
} from "../../helperFunctions/streamFormFunctions";
import {useAuth} from "../../../HOCs/AuthProvider";
import {LanguageSelect} from "../../helperFunctions/streamFormFunctions/components";


const useStyles = makeStyles(theme => ({
    root: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "90vh",
        borderRadius: 5,
        marginBottom: 30
    },
    form: {
        width: "100%"
    },
    speakersLabel: {
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
    },
    submit: {
        color: theme.palette.primary.main,
        background: "white",
        marginTop: theme.spacing(2),
        "&:hover": {
            color: 'white',
            background: theme.palette.primary.main,
        }
    },
}));

const speakerObj = {
    avatar: '',
    firstName: '',
    lastName: '',
    position: '',
    background: ''
}


const NewLivestreamForm = ({firebase}) => {
    const router = useRouter()
    const {userData, authenticatedUser} = useAuth()

    const {
        query: {livestreamId, draftStreamId, absolutePath, groupId},
        push, replace
    } = router;
    const classes = useStyles()

    const {setGeneralError} = useContext(ErrorContext);
    const [targetCategories, setTargetCategories] = useState({})
    const [selectedGroups, setSelectedGroups] = useState([])
    const [groupData, setGroupData] = useState(null);
    const [fetchingBackgrounds, setFetchingBackgrounds] = useState(true)
    const [fetchingLogos, setFetchingLogos] = useState(true)
    const [fetchingGroups, setFetchingGroups] = useState(true);
    const [fetchingAvatars, setFetchingAvatars] = useState(true)
    const [allFetched, setAllFetched] = useState(false)
    const [updateMode, setUpdateMode] = useState(undefined)

    const [existingLogos, setExistingLogos] = useState([]);
    const [existingAvatars, setExistingAvatars] = useState([]);
    const [existingBackgrounds, setExistingBackgrounds] = useState([]);
    const [existingGroups, setExistingGroups] = useState([]);
    const [formData, setFormData] = useState({
        companyLogoUrl: '',
        backgroundImageUrl: '',
        company: '',
        companyId: '',
        title: '',
        targetCategories: {},
        groupIds: [],
        start: new Date(),
        hidden: false,
        summary: '',
        speakers: {[uuidv4()]: speakerObj},
        language: languageCodes[0]
    })

    useEffect(() => {
        // If there are no relevant IDs and ur not a super admin, get lost...
        if (!(livestreamId || draftStreamId) && !isAuthenticating()
            // && !hasPermissionToCreate()
        ) {
            //re-direct! if no Ids in query!
            // replace("/")
        }
        if ((livestreamId || draftStreamId) && allFetched) {
            (async () => {
                const targetId = livestreamId || draftStreamId
                const forLivestream = (targetId === livestreamId)
                const targetCollection = livestreamId ? "livestreams" : "draftLivestreams"
                const livestreamQuery = await firebase.getStreamById(targetId, targetCollection)
                const speakerQuery = await firebase.getStreamSpeakers(targetId, targetCollection)
                if (livestreamQuery.exists) {
                    let livestream = livestreamQuery.data()
                    if (forLivestream) {
                        livestream.id = livestreamId
                    }
                    const newFormData = {
                        ...(forLivestream && {id: livestreamId}),
                        companyLogoUrl: livestream.companyLogoUrl || "",
                        backgroundImageUrl: livestream.backgroundImageUrl || "",
                        company: livestream.company || "",
                        companyId: livestream.companyId || "",
                        title: livestream.title || "",
                        targetCategories: {},
                        groupIds: livestream.groupIds || [],
                        start: livestream.start.toDate() || new Date(),
                        hidden: livestream.hidden || false,
                        summary: livestream.summary || "",
                        speakers: getStreamSubCollectionSpeakers(livestream, speakerQuery),
                        language: livestream.language || languageCodes[0]
                    }
                    setFormData(newFormData)
                    handleSetDefaultGroups(livestream.groupIds)
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
            if(groupId){
                handleSetDefaultGroups([groupId])
            }
            setUpdateMode(false)
        }
    }, [livestreamId, allFetched, draftStreamId, groupId])

    useEffect(() => {
        handleGetFiles('mentors-pictures', setFetchingAvatars, setExistingAvatars)
        handleGetFiles('illustration-images', setFetchingBackgrounds, setExistingBackgrounds)
        handleGetFiles('company-logos', setFetchingLogos, setExistingLogos)
    }, [firebase])

    useEffect(() => {
            const unsubscribe = firebase.listenToGroups(querySnapshot => {
                let careerCenters = [];
                querySnapshot.forEach(doc => {
                    let careerCenter = doc.data();
                    careerCenter.id = doc.id;
                    careerCenter.selected = false
                    careerCenters.push(careerCenter);
                })
                setFetchingGroups(false)
                setExistingGroups(careerCenters);
            });
            return () => unsubscribe();

    }, [groupId]);

    useEffect(() => {
        if (!fetchingBackgrounds && !fetchingLogos && !fetchingAvatars && !fetchingGroups) {
            setAllFetched(true)
        }
    }, [fetchingAvatars, fetchingBackgrounds, fetchingLogos, fetchingGroups])

    const handleSetGroupCategories = (groupId, targetOptionIds) => {
        const newTargetCategories = {...targetCategories}
        newTargetCategories[groupId] = targetOptionIds
        setTargetCategories(newTargetCategories)
    }

    const getDownloadUrl = (fileElement) => {
        if (fileElement) {
            return 'https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/' + fileElement.replace('/', '%2F') + '?alt=media';
        } else {
            console.log("-> no fileElement", fileElement);
            return '';
        }
    }


    const handleSetDefaultGroups = async (arrayOfGroupIds) => {
        if (Array.isArray(arrayOfGroupIds)) {
            let groupsWithFlattenedOptions = []
            arrayOfGroupIds.forEach(id => {
                const targetGroup = existingGroups.find(group => group.groupId === id)
                if (targetGroup) {
                    targetGroup.flattenedOptions = handleFlattenOptions(targetGroup)
                    groupsWithFlattenedOptions.push(targetGroup)
                }
            })

            // If ur not a super admin and ur also not an admin of any of the groups in the stream, get lost....
            if (!hasPermissionToEdit(groupsWithFlattenedOptions)) {
                // redirect if ur not a group admin!
                // replace("/")
            }
            setSelectedGroups(groupsWithFlattenedOptions)
        }
    }

    const handleGetFiles = (path, setFetchingCallback, setDataCallback) => {
        firebase.getStorageRef().child(path).listAll().then(res => {
            let fileItems = [];
            res.items.forEach(itemRef => {
                fileItems.push(itemRef);
            });
            let options = fileItems.map(file => {
                return {text: file.name, value: getDownloadUrl(file.fullPath)}
            });
            setFetchingCallback(false)
            setDataCallback(options);
        });
    }

    const handleSubmitForm = async (values, {setSubmitting}) => {
        try {
            setGeneralError("")
            setSubmitting(true)
            const livestream = buildLivestreamObject(values, targetCategories, updateMode, livestreamId, firebase);
            let id
            if (updateMode) {
                id = livestream.id
                if(!livestream.author){
                    livestream.author = {
                        email: authenticatedUser.email
                    }
                }
                await firebase.updateLivestream(livestream, "livestreams")
            } else {
                const author = {
                    email: authenticatedUser.email
                }
                id = await firebase.addLivestream(livestream, "livestreams", author)
            }
            if (absolutePath) {
                return push({
                    pathname: absolutePath,
                })
            } else if (values.hidden && values.groupIds.length) {
                return push(`/next-livestreams?careerCenterId=${values.groupIds[0]}&livestreamId=${id}`)
            } else {
                return push(`/upcoming-livestream/${id}`)
            }

        } catch (e) {
            setGeneralError("Something went wrong")
        }
    }

    const hasPermissionToEdit = (arrayOfGroups) => {
        return Boolean(
            userData.isAdmin
            || arrayOfGroups.some(group => group.adminEmail === authenticatedUser?.email
            ))
    }
    const hasPermissionToCreate = () => {
        return Boolean(userData?.isAdmin)
    }

    const isAuthenticating = () => {
        return Boolean(!authenticatedUser.isLoaded && authenticatedUser.isEmpty)
    }


    return (<Container className={classes.root}>
        {(allFetched && updateMode !== undefined) ? <Formik
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
                  }) => (<form onSubmit={async (event) => {
                    event.preventDefault()
                    const error = await validateForm()
                    if (Object.keys(error).length) {
                        window.scrollTo({top: 0, left: 0, behavior: 'smooth'})
                    }
                    handleSubmit()
                }} className={classes.form}>
                    <Typography style={{color: "white"}} variant="h4">Stream Info:</Typography>
                    <FormGroup>
                        <Grid xs={7} sm={7} md={10} lg={10} xl={10} item>
                            <FormControl fullWidth>
                                <TextField
                                    name="title"
                                    variant="outlined"
                                    fullWidth
                                    id="title"
                                    label="Live Stream Title"
                                    inputProps={{maxLength: 1000}}
                                    onBlur={handleBlur}
                                    value={values.title}
                                    disabled={isSubmitting}
                                    error={Boolean(errors.title && touched.title && errors.title)}
                                    onChange={handleChange}/>
                                <Collapse style={{color: "red"}} in={Boolean(errors.title && touched.title)}>
                                    {errors.title}
                                </Collapse>
                            </FormControl>
                        </Grid>
                        <Grid xs={5} sm={5} md={2} lg={2} xl={2}
                              style={{display: "grid", placeItems: "center"}}
                              item>
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
                                        inputProps={{'aria-label': 'primary checkbox'}}
                                    />}/>
                        </Grid>
                        <Grid xs={12} sm={12} md={6} lg={6} xl={6} item>
                            <ImageSelect
                                getDownloadUrl={getDownloadUrl}
                                values={values}
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
                                error={errors.companyLogoUrl && touched.companyLogoUrl && errors.companyLogoUrl}/>
                        </Grid>
                        <Grid xs={12} sm={12} md={6} lg={6} xl={6} item>
                            <ImageSelect
                                getDownloadUrl={getDownloadUrl} values={values} firebase={firebase}
                                setFieldValue={setFieldValue} isSubmitting={isSubmitting}
                                path="illustration-images"
                                isSuperAdmin={userData.isAdmin}
                                label="Company Background" handleBlur={handleBlur}
                                formName="backgroundImageUrl"
                                value={values.backgroundImageUrl} options={existingBackgrounds}
                                loading={fetchingBackgrounds}
                                error={errors.backgroundImageUrl && touched.backgroundImageUrl && errors.backgroundImageUrl}/>
                        </Grid>
                        <Grid xs={12} sm={12} md={6} lg={6} xl={6} item>
                            <FormControl fullWidth>
                                <TextField
                                    name="company"
                                    variant="outlined"
                                    fullWidth
                                    id="company"
                                    label="Company Name"
                                    inputProps={{maxLength: 500}}
                                    onBlur={handleBlur}
                                    value={values.company}
                                    disabled={isSubmitting}
                                    error={Boolean(errors.company && touched.company && errors.company)}
                                    onChange={handleChange}/>
                                <Collapse style={{color: "red"}} in={Boolean(errors.company && touched.company)}>
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
                                    inputProps={{maxLength: 1000}}
                                    onBlur={handleBlur}
                                    value={values.companyId}
                                    disabled={isSubmitting}
                                    error={Boolean(errors.companyId && touched.companyId && errors.companyId)}
                                    onChange={handleChange}/>
                                <Collapse style={{color: "red"}}
                                          in={Boolean(errors.companyId && touched.companyId)}>
                                    {errors.companyId}
                                </Collapse>
                            </FormControl>
                        </Grid>
                        <Grid xs={12} sm={7} md={8} item>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <DateTimePicker
                                    inputVariant="outlined" fullWidth variant="outlined"
                                    disabled={isSubmitting}
                                    label="Live Stream Start Date" value={values.start}
                                    onChange={(value) => {
                                        setFieldValue('start', new Date(value), true)
                                    }}/>
                            </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid xs={12} sm={5} md={4}  item>
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
                                    rowsMax={7}
                                    inputProps={{maxLength: 5000}}
                                    onBlur={handleBlur}
                                    value={values.summary}
                                    disabled={isSubmitting}
                                    error={Boolean(errors.summary && touched.summary && errors.summary)}
                                    onChange={handleChange}/>
                                <Collapse style={{color: "red"}} in={Boolean(errors.summary && touched.summary)}>
                                    {errors.summary}
                                </Collapse>
                            </FormControl>
                        </Grid>
                    </FormGroup>
                    {Object.keys(values.speakers).map((key, index) => {
                        return (
                            <Fragment key={key}>
                                <div className={classes.speakersLabel}>
                                    <Typography
                                        variant="h4">{`Speaker ${index + 1}`}</Typography>
                                    {!!index &&
                                    <Fab size="small" color="secondary"
                                         onClick={() => handleDeleteSpeaker(key, values, setValues)}>
                                        <DeleteIcon/>
                                    </Fab>}
                                </div>
                                <FormGroup>
                                    <SpeakerForm
                                        key={key}
                                        handleDeleteSpeaker={handleDeleteSpeaker}
                                        setValues={setValues}
                                        speakerObj={speakerObj}
                                        handleAddSpeaker={handleAddSpeaker}
                                        objectKey={key}
                                        index={index}
                                        errors={errors}
                                        firstNameError={handleError(key, "firstName", errors, touched)}
                                        lastNameError={handleError(key, "lastName", errors, touched)}
                                        positionError={handleError(key, "position", errors, touched)}
                                        backgroundError={handleError(key, "background", errors, touched)}
                                        getDownloadUrl={getDownloadUrl}
                                        loading={fetchingAvatars}
                                        speaker={values.speakers[key]}
                                        values={values}
                                        touched={touched}
                                        firebase={firebase}
                                        setFieldValue={setFieldValue}
                                        isSubmitting={isSubmitting}
                                        path="mentors-pictures"
                                        handleBlur={handleBlur}
                                        options={existingAvatars}/>
                                </FormGroup>
                            </Fragment>)
                    })}
                    <Typography style={{color: "white"}} variant="h4">Group Info:</Typography>
                    <FormGroup>
                        <Grid xs={12} sm={12} md={12} lg={12} xl={12} item>
                            <MultiGroupSelect
                                handleChange={handleChange}
                                handleBlur={handleBlur}
                                values={values}
                                isSuperAdmin={userData.isAdmin}
                                adminEmail={userData.userEmail}
                                isSubmitting={isSubmitting}
                                selectedGroups={selectedGroups}
                                setTargetCategories={setTargetCategories}
                                targetCategories={targetCategories}
                                handleFlattenOptions={handleFlattenOptions}
                                setSelectedGroups={setSelectedGroups}
                                setFieldValue={setFieldValue}
                                groups={existingGroups}/>
                        </Grid>
                        {selectedGroups.map(group => {
                            return <Grid key={group.groupId} xs={12} sm={12} md={12} lg={12} xl={12} item>
                                <GroupCategorySelect
                                    handleSetGroupCategories={handleSetGroupCategories}
                                    targetCategories={targetCategories}
                                    isSubmitting={isSubmitting}
                                    group={group}/>
                            </Grid>
                        })}
                    </FormGroup>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        size="large"
                        className={classes.submit}
                        endIcon={isSubmitting && <CircularProgress size={20} color="inherit"/>}
                        variant="contained" fullWidth>
                        <Typography variant="h4">
                            {updateMode ? isSubmitting ? "Updating" : "Update Live Stream" : isSubmitting ? "Saving" : "Create Live Stream"}
                        </Typography>
                    </Button>
                </form>)}
            </Formik> :
            <CircularProgress style={{marginTop: "30vh", color: "white"}}/>}
    </Container>);
};

export default withFirebase(NewLivestreamForm);
