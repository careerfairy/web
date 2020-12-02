import React, {Fragment, useContext, useEffect, useState} from 'react';
import DeleteIcon from '@material-ui/icons/Delete';
import {
    Button,
    CircularProgress,
    Collapse,
    Container,
    FormControl,
    Grid,
    TextField,
    Typography
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
import Fab from "@material-ui/core/Fab";
import ErrorContext from "../../../context/error/ErrorContext";


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
    whiteBtn: {
        color: theme.palette.primary.main,
        background: "white",
        margin: theme.spacing(1),
        "&:hover": {
            color: 'white',
            background: theme.palette.primary.main,
        }
    }
}));

const speakerObj = {
    avatar: '',
    firstName: '',
    lastName: '',
    position: '',
    background: ''
}


const mainSpeakerId = uuidv4()
const DraftStreamForm = ({firebase, setSubmitted, submitted}) => {
    const router = useRouter()
    const {
        query: {careerCenterIds, draftStreamId},
    } = router;

    const classes = useStyles()

    const {setGeneralError} = useContext(ErrorContext);
    const [targetCategories, setTargetCategories] = useState({})
    const [selectedGroups, setSelectedGroups] = useState([])
    const [updateMode, setUpdateMode] = useState(undefined)

    const [allFetched, setAllFetched] = useState(false)

    const [draftId, setDraftId] = useState("")

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
        speakers: {
            [mainSpeakerId]: speakerObj,
        },
    })


    const handleSetGroupIds = async (UrlIds, draftStreamGroupIds) => {
        const totalGroups = [...new Set([...UrlIds, ...draftStreamGroupIds])]
        if (totalGroups.length) {
            const totalExistingGroups = await firebase.getCareerCentersByGroupId(totalGroups)
            const totalFlattenedGroups = totalExistingGroups.map(group => ({
                    ...group,
                    selected: true,
                    flattenedOptions: handleFlattenOptions(group)
                }))
            const flattenedDraftGroups = totalFlattenedGroups.filter(flattenedGroupObj => draftStreamGroupIds.some(draftId => flattenedGroupObj.id === draftId))
            setExistingGroups(totalFlattenedGroups)
            setSelectedGroups(flattenedDraftGroups)
            const arrayOfActualGroupIds = totalExistingGroups.map(groupObj => groupObj.id)
            setFormData({...formData, groupIds: arrayOfActualGroupIds})
        }
    }

    useEffect(() => {
        if (draftStreamId) {
            (async () => {
                const targetId = draftStreamId
                const targetCollection = "draftLivestreams"
                const livestreamQuery = await firebase.getStreamById(targetId, targetCollection)
                const speakerQuery = await firebase.getStreamSpeakers(targetId, targetCollection)
                if (livestreamQuery.exists) {
                    let livestream = livestreamQuery.data()
                    const newFormData = {
                        id: targetId,
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
                        speakers: {
                            [mainSpeakerId]: speakerObj,
                        },
                    }
                    setFormData(newFormData)
                    if (careerCenterIds) {
                        const arrayOfUrlIds = careerCenterIds.split(",")
                        await handleSetGroupIds(arrayOfUrlIds, livestream.groupIds)
                    } else {
                        await handleSetGroupIds([], livestream.groupIds)
                    }
                    // handleSetDefaultGroups(livestream.groupIds)
                    setTargetCategories(livestream.targetCategories || {})
                    if (!speakerQuery.empty) {
                        const mainSpeakerFlattenedName = livestream.mainSpeakerName.split(/[ ]+/).join("")
                        speakerQuery.forEach(query => {
                            let speaker = query.data()
                            speaker.id = query.id
                            const flattenedFirstName = speaker.firstName.split(/[ ]+/).join("")
                            const flattenedLastName = speaker.lastName.split(/[ ]+/).join("")
                            const flattenedFullName = flattenedFirstName + flattenedLastName
                            if (flattenedFullName !== mainSpeakerFlattenedName) {
                                handleAddSpeaker(newFormData, setFormData, speaker)
                            } else {
                                handleAddMainSpeaker(newFormData, setFormData, speaker)
                            }
                        })
                    }
                    setAllFetched(true)
                    setUpdateMode(true)
                }
            })()
        } else if (careerCenterIds) {
            handleSetOnlyUrlIds()
        }
    }, [draftStreamId])

    const handleSetOnlyUrlIds = async () => {
        const arrayOfUrlIds = careerCenterIds.split(",")
        await handleSetGroupIds(arrayOfUrlIds, [])
        setAllFetched(true)
    }


    const handleAddTargetCategories = (arrayOfIds) => {
        const oldTargetCategories = {...targetCategories}
        const newTargetCategories = {}
        arrayOfIds.forEach(id => {
            if (!oldTargetCategories[id]) {
                newTargetCategories[id] = []
            } else {
                newTargetCategories[id] = oldTargetCategories[id]
            }
        })
        setTargetCategories(newTargetCategories)
    }

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
    const handleAddSpeaker = (values, setCallback, obj) => {
        const newValues = {...values}
        newValues.speakers[uuidv4()] = obj
        setCallback(newValues)
    }

    const handleAddMainSpeaker = (values, setCallback, obj) => {
        const newValues = {...values}
        newValues.speakers[mainSpeakerId] = obj
        setCallback(newValues)
    }

    const handleFlattenOptions = (group) => {
        let optionsArray = []
        if (group.categories && group.categories.length) {
            group.categories.forEach(category => {
                if (category.options && category.options.length) {
                    category.options.forEach(option => optionsArray.push(option))
                }
            })
        }
        return optionsArray
    }

    const buildLivestreamObject = (values) => {
        return {
            ...(updateMode && {id: draftStreamId}),// only adds id: livestreamId field if there's actually a valid id, which is when updateMode is true
            backgroundImageUrl: values.backgroundImageUrl,
            company: values.company,
            companyId: values.companyId,
            title: values.title,
            companyLogoUrl: values.companyLogoUrl,
            mainSpeakerAvatar: values.speakers[mainSpeakerId].avatar,
            mainSpeakerBackground: values.speakers[mainSpeakerId].background,
            mainSpeakerPosition: values.speakers[mainSpeakerId].position,
            mainSpeakerName: values.speakers[mainSpeakerId].firstName + ' ' + values.speakers[mainSpeakerId].lastName,
            registeredUsers: [],
            start: firebase.getFirebaseTimestamp(values.start),
            targetGroups: [],
            targetCategories: targetCategories,
            type: 'upcoming',
            test: false,
            groupIds: values.groupIds,
            hidden: values.hidden,
            universities: [],
            summary: values.summary
        }
    }

    const buildSpeakersArray = (values) => {
        return Object.keys(values.speakers).map((key) => {
            return {
                avatar: values.speakers[key].avatar,
                background: values.speakers[key].background,
                firstName: values.speakers[key].firstName,
                lastName: values.speakers[key].lastName,
                position: values.speakers[key].position
            }
        });
    }


    const handleError = (key, fieldName, errors, touched) => {
        const baseError = errors?.speakers?.[key]?.[fieldName]
        const baseTouched = touched?.speakers?.[key]?.[fieldName]
        return baseError && baseTouched && baseError
    }

    const handleDeleteSpeaker = (key, values, setCallback) => {
        const newValues = {...values}
        delete newValues.speakers[key]
        setCallback(newValues)
    }

    const SuccessMessage = (
        <>
            <Typography variant="h5" align="center" style={{color: "white"}}>Thanks for your
                submission, the code for your created draft is <b>{draftId}</b>, please save it somewhere.
                We will review the draft and get back to
                you as soon as possible!</Typography>
            <div style={{display: "flex", justifyContent: "space-between"}}>
                <Button className={classes.whiteBtn} variant="contained" href="/profile">
                    To Profile
                </Button>
                <Button className={classes.whiteBtn} variant="contained" href="/next-livestreams">
                    To Next Livestreams
                </Button>
            </div>
        </>
    )

    return (<Container className={classes.root}>
        {allFetched ? (submitted ? SuccessMessage : <Formik
            initialValues={formData}
            enableReinitialize
            validate={values => {
                let errors = {speakers: {}};
                if (!values.companyLogoUrl) {
                    errors.companyLogoUrl = 'Required';
                }
                if (!values.backgroundImageUrl) {
                    errors.backgroundImageUrl = 'Required';
                }
                if (!values.company) {
                    errors.company = 'Required';
                }
                if (!values.title) {
                    errors.title = 'Required';
                }

                Object.keys(values.speakers).forEach((key) => {
                    errors.speakers[key] = {}
                    if (!values.speakers[key].firstName) {
                        errors.speakers[key].firstName = 'Required';
                    }
                    if (!values.speakers[key].lastName) {
                        errors.speakers[key].lastName = 'Required';
                    }
                    if (!values.speakers[key].position) {
                        errors.speakers[key].position = 'Required';
                    }
                    if (!values.speakers[key].background) {
                        errors.speakers[key].background = 'Required';
                    }
                    if (!Object.keys(errors.speakers[key]).length) {
                        delete errors.speakers[key]
                    }
                })
                if (!Object.keys(errors.speakers).length) {
                    delete errors.speakers
                }
                return errors;
            }}
            onSubmit={async (values, {setSubmitting}) => {
                try {
                    setGeneralError("")
                    setSubmitting(true)
                    const livestream = buildLivestreamObject(values);
                    const speakers = buildSpeakersArray(values);
                    let id;
                    if (updateMode) {
                        id = livestream.id
                        await firebase.updateLivestream(livestream, "draftLivestreams")
                        console.log("-> Draft livestream was updated with id", id);
                    } else {
                        id = await firebase.addDraftLivestream(livestream)
                        console.log("-> Draft livestream was created with id", id);
                    }
                    setDraftId(id)
                    setSubmitted(true)
                    window.scrollTo({top: 0, left: 0, behavior: 'smooth'})
                } catch (e) {
                    console.log("-> e", e);
                    setGeneralError("Something went wrong")
                }
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
                  validateForm
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
                    <Grid xs={12} sm={12} md={6} lg={6} xl={6} item>
                        <FormControl fullWidth>
                            <TextField
                                name="company"
                                variant="outlined"
                                fullWidth
                                id="company"
                                label="Company Name"
                                inputProps={{maxLength: 70}}
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
                                name="title"
                                variant="outlined"
                                fullWidth
                                id="title"
                                label="Livestream Title"
                                inputProps={{maxLength: 70}}
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
                            value={values.companyLogoUrl}
                            error={errors.companyLogoUrl && touched.companyLogoUrl && errors.companyLogoUrl}/>
                    </Grid>
                    <Grid xs={12} sm={12} md={6} lg={6} xl={6} item>
                        <ImageSelect
                            getDownloadUrl={getDownloadUrl} values={values} firebase={firebase}
                            setFieldValue={setFieldValue} isSubmitting={isSubmitting}
                            path="illustration-images"
                            label="Company Background" handleBlur={handleBlur}
                            formName="backgroundImageUrl"
                            value={values.backgroundImageUrl}
                            error={errors.backgroundImageUrl && touched.backgroundImageUrl && errors.backgroundImageUrl}/>
                    </Grid>
                    <Grid xs={12} sm={12} md={12} lg={12} xl={12} item>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <DateTimePicker
                                inputVariant="outlined" fullWidth variant="outlined"
                                disabled={isSubmitting}
                                label="Livestream Start Date" value={values.start}
                                onChange={(value) => {
                                    setFieldValue('start', new Date(value), true)
                                }}/>
                        </MuiPickersUtilsProvider>
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
                                inputProps={{maxLength: 500}}
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
                                    variant="h4">{index === 0 ? "Main Speaker:" : `Speaker ${index + 1}:`}</Typography>
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
                                    speaker={values.speakers[key]}
                                    values={values}
                                    touched={touched}
                                    firebase={firebase}
                                    setFieldValue={setFieldValue}
                                    isSubmitting={isSubmitting}
                                    path="mentors-pictures"
                                    handleBlur={handleBlur}/>
                            </FormGroup>
                        </Fragment>)
                })}
                <Typography style={{color: "white"}} variant="h4">Group Info:</Typography>
                {!!existingGroups.length && <FormGroup>
                    <Grid xs={12} sm={12} md={12} lg={12} xl={12} item>
                        <MultiGroupSelect
                            handleChange={handleChange}
                            handleBlur={handleBlur}
                            values={values}
                            isSubmitting={isSubmitting}
                            selectedGroups={selectedGroups}
                            handleAddTargetCategories={handleAddTargetCategories}
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
                </FormGroup>}
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    size="large"
                    className={classes.submit}
                    endIcon={isSubmitting && <CircularProgress size={20} color="inherit"/>}
                    variant="contained" fullWidth>
                    <Typography variant="h4">
                        {isSubmitting ? "Submitting" : updateMode ? "Update Draft" : "Submit Draft"}
                    </Typography>
                </Button>
            </form>)}
        </Formik>) : <CircularProgress style={{marginTop: "30vh", color: "white"}}/>}
    </Container>);
};


export default withFirebase(DraftStreamForm);
