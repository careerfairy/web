import React, {Fragment, useEffect, useState} from 'react';
import {
    Box,
    Button,
    CircularProgress,
    Collapse,
    Container,
    FormControl,
    FormControlLabel,
    FormHelperText,
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
    switch: {
        // placeItems: "center",
        // borderRadius: 4,
        // width: "100%",
        // height: "100%",
        // // border: "1px solid rgba(0, 0, 0, 0.3)",
        // display: "flex",
        // justifyContent: "center"
    },

}));

const speakerObj = {
    avatarUrl: '',
    firstName: '',
    lastName: '',
    position: '',
    background: ''
}

const mainSpeakerId = uuidv4()
const NewLivestreamForm = ({firebase}) => {
    const classes = useStyles()
    const [formData, setFormData] = useState({
        logoUrl: '',
        backgroundUrl: '',
        company: '',
        companyId: '',
        title: '',
        targetBackgrounds: [],
        targetCategories: {},
        universities: [],
        groupIds: [],
        startDate: new Date(),
        hiddenLivestream: false,
        summary: '',
        speakers: {
            [mainSpeakerId]: speakerObj,
        },
    })

    const [existingLogos, setExistingLogos] = useState([]);
    const [fetchingLogos, setFetchingLogos] = useState(true)
    const [existingBackgrounds, setExistingBackgrounds] = useState([]);
    const [fetchingBackgrounds, setFetchingBackgrounds] = useState(true)
    const [existingAvatars, setExistingAvatars] = useState([]);
    const [fetchingAvatars, setFetchingAvatars] = useState(true)
    const [existingGroups, setExistingGroups] = useState([]);
    const [fetchingGroups, setFetchingGroups] = useState([]);
    const [allFetched, setAllFetched] = useState(false)
    const [selectedGroups, setSelectedGroups] = useState([])
    const [targetCategories, setTargetCategories] = useState({})

    useEffect(() => {
        firebase.getStorageRef().child('company-logos').listAll().then(res => {
            let fileItems = [];
            res.items.forEach(itemRef => {
                fileItems.push(itemRef);
            });
            let logoOptions = fileItems.map(logoFile => {
                return {text: logoFile.name, value: getDownloadUrl(logoFile.fullPath)}
            });
            setFetchingLogos(false)
            setExistingLogos(logoOptions);
        });
    }, [firebase]);

    useEffect(() => {
        firebase.getStorageRef().child('illustration-images').listAll().then(res => {
            let fileItems = [];
            res.items.forEach(itemRef => {
                fileItems.push(itemRef);
            });
            let backgroundOptions = fileItems.map(backgroundFile => {
                return {text: backgroundFile.name, value: getDownloadUrl(backgroundFile.fullPath)}
            });
            setFetchingBackgrounds(false)
            setExistingBackgrounds(backgroundOptions);
        });
    }, [firebase]);

    useEffect(() => {
        firebase.getStorageRef().child('mentors-pictures').listAll().then(res => {
            let fileItems = [];
            res.items.forEach(itemRef => {
                fileItems.push(itemRef);
            });
            let avatarOptions = fileItems.map(backgroundFile => {
                return {text: backgroundFile.name, value: getDownloadUrl(backgroundFile.fullPath)}
            });
            setFetchingAvatars(false)
            setExistingAvatars(avatarOptions);
        });
    }, [firebase]);

    useEffect(() => {
        const unsubscribe = firebase.listenToGroups(querySnapshot => {
            let careerCenters = [];
            querySnapshot.forEach(doc => {
                let careerCenter = doc.data();
                careerCenter.id = doc.id;
                careerCenter.selected = false
                careerCenters.push(careerCenter);
            })
            setExistingGroups(careerCenters);
        });
        return () => unsubscribe();

    }, []);

    useEffect(() => {
        if (!fetchingBackgrounds && !fetchingLogos && !fetchingAvatars) {
            setAllFetched(true)
        }
    }, [fetchingAvatars, fetchingBackgrounds, fetchingLogos])

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
            backgroundImageUrl: values.backgroundUrl,
            company: values.company,
            companyId: values.companyId,
            title: values.title,
            companyLogoUrl: values.logoUrl,
            mainSpeakerAvatar: values.speakers[mainSpeakerId].avatarUrl,
            mainSpeakerBackground: values.speakers[mainSpeakerId].background,
            mainSpeakerPosition: values.speakers[mainSpeakerId].position,
            mainSpeakerName: values.speakers[mainSpeakerId].firstName + ' ' + values.speakers[mainSpeakerId].lastName,
            registeredUsers: [],
            start: firebase.getFirebaseTimestamp(values.startDate),
            targetGroups: [],
            targetCategories: targetCategories,
            type: 'upcoming',
            test: true,
            groupIds: values.groupIds,
            hidden: values.hiddenLivestream,
            universities: values.universities,
            summary: values.summary
        }
    }

    const buildSpeakersArray = (values) => {
        return Object.keys(values.speakers).map((key) => {
            return {
                avatar: values.speakers[key].avatarUrl,
                background: values.speakers[key].background,
                firstName: values.speakers[key].firstName,
                lastName: values.speakers[key].lastName,
                position: values.speakers[key].position
            }
        });
    }

    const handleAddSpeaker = (values, setCallback) => {
        const newValues = {...values}
        newValues.speakers[uuidv4()] = speakerObj
        setCallback(newValues)
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
                {allFetched ? <Formik
                        initialValues={formData}
                        validate={values => {
                            let errors = {speakers: {}};
                            if (!values.logoUrl) {
                                errors.logoUrl = 'Required';
                            }
                            if (!values.backgroundUrl) {
                                errors.backgroundUrl = 'Required';
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
                        onSubmit={(values) => {
                            const livestream = buildLivestreamObject(values);
                            const speakers = buildSpeakersArray(values);
                            console.log("-> speakers", speakers);
                            console.log("-> livestream", livestream);

                            //
                            // props.firebase.addLivestream(livestream).then(docRef => {
                            //     alert("added livestream with Id: " + docRef.id);
                            //     console.log("added livestream with Id: " + docRef.id);
                            //     speakers.forEach(speaker => {
                            //         props.firebase.addLivestreamSpeaker(docRef.id, speaker);
                            //     })
                            // });
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
                                        <Collapse in={Boolean(errors.title && touched.title)}>
                                            <FormHelperText error>
                                                {errors.title}
                                            </FormHelperText>
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
                                                checked={values.hiddenLivestream}
                                                onChange={handleChange}
                                                color="primary"
                                                id="hiddenLivestream"
                                                name="hiddenLivestream"
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
                                        submitting={isSubmitting}
                                        path="company-logos"
                                        label="Logo"
                                        handleBlur={handleBlur}
                                        formName="logoUrl"
                                        value={values.logoUrl}
                                        options={existingLogos}
                                        loading={fetchingLogos}
                                        error={errors.logoUrl && touched.logoUrl && errors.logoUrl}/>
                                </Grid>
                                <Grid xs={12} sm={12} md={6} lg={6} xl={6} item>
                                    <ImageSelect getDownloadUrl={getDownloadUrl} values={values} firebase={firebase}
                                                 setFieldValue={setFieldValue} submitting={isSubmitting}
                                                 path="illustration-images"
                                                 label="Company Background" handleBlur={handleBlur}
                                                 formName="backgroundUrl"
                                                 value={values.backgroundUrl} options={existingBackgrounds}
                                                 loading={fetchingBackgrounds}
                                                 error={errors.backgroundUrl && touched.backgroundUrl && errors.backgroundUrl}/>
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
                                        <Collapse in={Boolean(errors.company && touched.company)}>
                                            <FormHelperText error>
                                                {errors.company}
                                            </FormHelperText>
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
                                        <Collapse in={Boolean(errors.companyId && touched.companyId)}>
                                            <FormHelperText error>
                                                {errors.companyId}
                                            </FormHelperText>
                                        </Collapse>
                                    </FormControl>
                                </Grid>
                                <Grid xs={12} sm={12} md={12} lg={12} xl={12} item>
                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                        <DateTimePicker inputVariant="outlined" fullWidth variant="outlined"
                                                        label="Livestream Start Date" value={values.startDate}
                                                        onChange={(value) => {
                                                            setFieldValue('startDate', new Date(value), true)
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
                                                         submitting={isSubmitting}
                                                         path="mentors-pictures"
                                                         handleBlur={handleBlur}
                                                         options={existingAvatars}
                                            />
                                            {index === Object.keys(values.speakers).length - 1 &&
                                            <Grid xs={12} sm={12} md={12} lg={12} xl={12} item>
                                                <Button startIcon={<PersonAddIcon/>}
                                                        onClick={() => handleAddSpeaker(values, setValues)}
                                                        type="button" color="primary" variant="contained" fullWidth>
                                                    Add a Speaker
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
                                                   rowsMax={5}
                                                   inputProps={{maxLength: 200}}
                                                   onBlur={handleBlur}
                                                   value={values.summary}
                                                   disabled={isSubmitting}
                                                   error={Boolean(errors.summary && touched.summary && errors.summary)}
                                                   onChange={handleChange}/>
                                        <Collapse in={Boolean(errors.summary && touched.summary)}>
                                            <FormHelperText error>
                                                {errors.summary}
                                            </FormHelperText>
                                        </Collapse>
                                    </FormControl>
                                </Grid>
                                <Grid xs={12} sm={12} md={12} lg={12} xl={12} item>
                                    <MultiGroupSelect handleChange={handleChange}
                                                      handleBlur={handleBlur}
                                                      values={values}
                                                      handleAddTargetCategories={handleAddTargetCategories}
                                                      selectedGroups={selectedGroups}
                                                      handleFlattenOptions={handleFlattenOptions}
                                                      setSelectedGroups={setSelectedGroups}
                                                      setFieldValue={setFieldValue}
                                                      value={values.groupIds}
                                                      groups={existingGroups}/>
                                </Grid>
                                {selectedGroups.map(group => {
                                    return <Grid key={group.groupId} xs={12} sm={12} md={12} lg={12} xl={12} item>
                                        <GroupCategorySelect handleSetGroupCategories={handleSetGroupCategories}
                                                             group={group}/>
                                    </Grid>
                                })}
                            </Box>
                            <Box className={classes.formGroup} borderRadius={4} component={Grid} boxShadow={1} p={1}
                                 spacing={2} container>
                                <Grid xs={12} sm={12} md={12} lg={12} xl={12} item>
                                    <Button type="submit"
                                            style={{background: "rgb(44, 66, 81)", color: "white"}}
                                            variant="contained" fullWidth>
                                        Create Livestream
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
