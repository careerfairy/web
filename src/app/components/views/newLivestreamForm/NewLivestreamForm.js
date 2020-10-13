import React, {Fragment, useEffect, useState} from 'react';
import {
    Box,
    Button,
    CircularProgress,
    Collapse,
    Container,
    FormControl,
    FormControlLabel,
    Grid,
    Switch,
    TextField,
    Typography
} from "@material-ui/core";
import {Formik} from 'formik';
import {v4 as uuidv4} from 'uuid';
import {withFirebase} from "../../../context/firebase";
import ImageSelect from "./ImageSelect/ImageSelect";
import {makeStyles} from "@material-ui/core/styles";
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import {DateTimePicker, MuiPickersUtilsProvider,} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import SpeakerForm from "./SpeakerForm/SpeakerForm";
import MultiGroupSelect from "./MultiGroupSelect/MultiGroupSelect";
import GroupCategorySelect from "./GroupCategorySelect/GroupCategorySelect";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import {useRouter} from "next/router";


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
    formGroup: {
        background: "white",
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(3),
    },
}));

const speakerObj = {
    avatar: '',
    firstName: '',
    lastName: '',
    position: '',
    background: ''
}

const mainSpeakerId = uuidv4()
const NewLivestreamForm = ({firebase}) => {
    const router = useRouter()
    const {
        query: {livestreamId},
    } = router;
    const classes = useStyles()

    const [targetCategories, setTargetCategories] = useState({})
    const [selectedGroups, setSelectedGroups] = useState([])

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
        speakers: {
            [mainSpeakerId]: speakerObj,
        },
    })

    useEffect(() => {
        if (livestreamId && allFetched) {
            (async () => {
                const livestreamQuery = await firebase.getLivestreamById(livestreamId)
                const speakerQuery = await firebase.getLivestreamSpeakers(livestreamId)
                if (livestreamQuery.exists) {

                    let livestream = livestreamQuery.data()
                    livestream.id = livestreamId
                    const newFormData = {
                        id: livestreamId,
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
                            [mainSpeakerId]: handleGetMainSpeaker(livestream),
                        },
                    }
                    setFormData(newFormData)
                    handleSetDefaultGroups(livestream.groupIds)
                    setTargetCategories(livestream.targetCategories || {})
                    if (!speakerQuery.empty) {
                        const mainSpeakerFirstName = livestream.mainSpeakerName.split(/[ ]+/)[0]
                        const mainSpeakerLastName = livestream.mainSpeakerName.split(/[ ]+/)[1]
                        speakerQuery.forEach(query => {
                            let speaker = query.data()
                            speaker.id = query.id
                            if (speaker.firstName !== mainSpeakerFirstName && speaker.lastName !== mainSpeakerLastName) {
                                handleAddSpeaker(newFormData, setFormData, speaker)
                            }
                        })
                    }
                    setUpdateMode(true)
                } else {
                    setUpdateMode(false)
                }
            })()
        }
    }, [livestreamId, allFetched])

    const handleAddSpeaker = (values, setCallback, obj) => {
        const newValues = {...values}
        newValues.speakers[uuidv4()] = obj
        setCallback(newValues)
    }

    const handleSetDefaultGroups = (arrayOfGroupIds) => {

        if (Array.isArray(arrayOfGroupIds)) {
            let groupsWithFlattenedOptions = []
            arrayOfGroupIds.forEach(id => {
                const targetGroup = existingGroups.find(group => group.groupId === id)
                if (targetGroup) {
                    targetGroup.flattenedOptions = handleFlattenOptions(targetGroup)
                    groupsWithFlattenedOptions.push(targetGroup)
                }
            })
            setSelectedGroups(groupsWithFlattenedOptions)
        }
    }

    const handleGetMainSpeaker = (streamObj) => {
        if (streamObj.mainSpeakerName.length) {
            const fullnameArray = streamObj.mainSpeakerName.split(/[ ]+/)
            return {
                firstName: fullnameArray[0],
                lastName: fullnameArray[1],
                avatar: streamObj.mainSpeakerAvatar,
                background: streamObj.mainSpeakerBackground,
                position: streamObj.mainSpeakerPosition
            }
        } else {
            return speakerObj
        }
    }

    useEffect(() => {
        handleGetFiles('mentors-pictures', setFetchingAvatars, setExistingAvatars)
        handleGetFiles('illustration-images', setFetchingBackgrounds, setExistingBackgrounds)
        handleGetFiles('company-logos', setFetchingLogos, setExistingLogos)
    }, [firebase])

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

    }, []);

    useEffect(() => {
        if (!fetchingBackgrounds && !fetchingLogos && !fetchingAvatars && !fetchingGroups) {
            setAllFetched(true)
        }
    }, [fetchingAvatars, fetchingBackgrounds, fetchingLogos, fetchingGroups])

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
            ...(updateMode && {id: livestreamId}),// only adds id: livestreamId field if there's actually a valid id, which is when updateMode is true
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
            test: true,
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
        const baseError = errors && errors.speakers && errors.speakers[key] && errors.speakers[key][fieldName]
        const baseTouched = touched && touched.speakers && touched.speakers[key] && touched.speakers[key][fieldName]
        return baseError && baseTouched && baseError
    }

    const handleDeleteSpeaker = (key, values, setCallback) => {
        const newValues = {...values}
        delete newValues.speakers[key]
        setCallback(newValues)
    }


    return (
        <>
            <Typography variant="h3" align="center" style={{marginTop: "1.5rem", color: "white"}}>Create a
                Livestream</Typography>
            <Container className={classes.root}>
                {(allFetched && updateMode !== undefined) ? <Formik
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
                            if (!values.companyId) {
                                errors.companyId = 'Required';
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
                            setSubmitting(true)
                            const livestream = buildLivestreamObject(values);
                            const speakers = buildSpeakersArray(values);
           
                            if (updateMode) {
                                const id = await firebase.updateLivestream(livestream, speakers)
                                console.log("-> Livestream was updated with id", id);
                            } else {
                                const id = await firebase.addLivestream(livestream, speakers)
                                console.log("-> Livestream was created with id", id);
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
                              /* and other goodies */
                          }) => (<form onSubmit={handleSubmit} className={classes.form}>
                            <Box className={classes.formGroup} borderRadius={4} component={Grid} boxShadow={1} p={1}
                                 spacing={2} container>
                                <Grid xs={7} sm={7} md={10} lg={10} xl={10} item>
                                    <FormControl fullWidth>
                                        <TextField name="title"
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
                                <Grid xs={5} sm={5} md={2} lg={2} xl={2}
                                      style={{display: "grid", placeItems: "center"}}
                                      item>
                                    <FormControlLabel
                                        labelPlacement="start"
                                        control={
                                            <Switch
                                                checked={values.hidden}
                                                onChange={handleChange}
                                                color="primary"
                                                id="hidden"
                                                disabled={isSubmitting}
                                                name="hidden"
                                                inputProps={{'aria-label': 'primary checkbox'}}
                                            />}
                                        label="Hidden"
                                    />
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
                                        options={existingLogos}
                                        loading={fetchingLogos}
                                        error={errors.companyLogoUrl && touched.companyLogoUrl && errors.companyLogoUrl}/>
                                </Grid>
                                <Grid xs={12} sm={12} md={6} lg={6} xl={6} item>
                                    <ImageSelect getDownloadUrl={getDownloadUrl} values={values} firebase={firebase}
                                                 setFieldValue={setFieldValue} isSubmitting={isSubmitting}
                                                 path="illustration-images"
                                                 label="Company Background" handleBlur={handleBlur}
                                                 formName="backgroundImageUrl"
                                                 value={values.backgroundImageUrl} options={existingBackgrounds}
                                                 loading={fetchingBackgrounds}
                                                 error={errors.backgroundImageUrl && touched.backgroundImageUrl && errors.backgroundImageUrl}/>
                                </Grid>
                                <Grid xs={12} sm={12} md={6} lg={6} xl={6} item>
                                    <FormControl fullWidth>
                                        <TextField name="company"
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
                                        <TextField name="companyId"
                                                   variant="outlined"
                                                   fullWidth
                                                   id="companyId"
                                                   label="Company ID"
                                                   inputProps={{maxLength: 70}}
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
                                <Grid xs={12} sm={12} md={12} lg={12} xl={12} item>
                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                        <DateTimePicker inputVariant="outlined" fullWidth variant="outlined"
                                                        disabled={isSubmitting}
                                                        label="Livestream Start Date" value={values.start}
                                                        onChange={(value) => {
                                                            setFieldValue('start', new Date(value), true)
                                                        }}/>
                                    </MuiPickersUtilsProvider>
                                </Grid>
                            </Box>

                            {Object.keys(values.speakers).map((key, index) => {
                                return (
                                    <Fragment key={key}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Typography style={{color: "white"}}
                                                        variant="h4">{index === 0 ? "Main Speaker" : `Speaker ${index + 1}`}</Typography>
                                            {!!index && <Button onClick={() => handleDeleteSpeaker(key, values, setValues)}
                                                                variant="contained" color="secondary"
                                                                startIcon={<HighlightOffIcon/>}>
                                                Delete</Button>}
                                        </Box>
                                        <Box className={classes.formGroup} borderRadius={4} component={Grid}
                                             boxShadow={1} spacing={2} p={1} container>
                                            <SpeakerForm objectKey={key}
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
                                                         options={existingAvatars}
                                            />
                                            {index === Object.keys(values.speakers).length - 1 &&
                                            <Grid xs={12} sm={12} md={12} lg={12} xl={12} item>
                                                <Button startIcon={<PersonAddIcon/>}
                                                        disabled={Object.keys(values.speakers).length >= 3 || isSubmitting}
                                                        onClick={() => handleAddSpeaker(values, setValues, speakerObj)}
                                                        type="button" color="primary" variant="contained" fullWidth>
                                                    {Object.keys(values.speakers).length >= 3 ? "3 Speakers Maximum" : "Add a Speaker"}
                                                </Button>
                                            </Grid>}
                                        </Box>
                                    </Fragment>
                                )
                            })}

                            <Box className={classes.formGroup} borderRadius={4} component={Grid} boxShadow={1} p={1}
                                 spacing={2} container>
                                <Grid xs={12} sm={12} md={12} lg={12} xl={12} item>
                                    <FormControl fullWidth>
                                        <TextField name="summary"
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
                                <Grid xs={12} sm={12} md={12} lg={12} xl={12} item>
                                    <MultiGroupSelect handleChange={handleChange}
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
                                        <GroupCategorySelect handleSetGroupCategories={handleSetGroupCategories}
                                                             targetCategories={targetCategories}
                                                             isSubmitting={isSubmitting}
                                                             group={group}/>
                                    </Grid>
                                })}
                            </Box>
                            <Box className={classes.formGroup} borderRadius={4} component={Grid} boxShadow={1} p={1}
                                 spacing={2} container>
                                <Grid xs={12} sm={12} md={12} lg={12} xl={12} item>
                                    <Button type="submit"
                                            disabled={isSubmitting}
                                            style={{background: "rgb(44, 66, 81)", color: "white"}}
                                            variant="contained" fullWidth>
                                        {updateMode ? "Update Livestream" : "Create Livestream"}
                                    </Button>
                                </Grid>
                            </Box>
                        </form>)}
                    </Formik> :
                    <CircularProgress style={{marginTop: "30vh", color: "white"}}/>}
            </Container>
        </>
    );
};

export default withFirebase(NewLivestreamForm);
