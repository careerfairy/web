import React, {useState, useEffect} from 'react';
import {
    Container,
    Grid,
    Typography,
    TextField,
    FormControl,
    Collapse,
    FormHelperText,
    Switch,
    FormControlLabel, Button
} from "@material-ui/core";
import {Formik, withFormik} from 'formik';
import {v4 as uuidv4} from 'uuid';
import {withFirebase} from "../../../context/firebase";
import ImageSelect from "./ImageSelect/ImageSelect";
import {makeStyles} from "@material-ui/core/styles";
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import {
    DateTimePicker,
    MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import SpeakerForm from "./SpeakerForm/SpeakerForm";
import MultiGroupSelect from "./MultiGroupSelect/MultiGroupSelect";


const useStyles = makeStyles(theme => ({
    root: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 700,
        background: "white",
    },
    form: {
        width: "100%"
    },
    switch: {
        placeItems: "center",
        borderRadius: 4,
        width: "100%",
        height: "100%",
        border: "1px solid rgba(0, 0, 0, 0.3)",
        display: "flex",
        justifyContent: "center"
    },

}));

const speakerObj = {
    avatarUrl: '',
    firstName: '',
    lastName: '',
    position: '',
    background: ''
}

const id = uuidv4()
const NewLivestreamForm = ({firebase}) => {
    const classes = useStyles()
    const [formData, setFormData] = useState({
        logoUrl: '',
        backgroundUrl: '',
        company: '',
        companyId: '',
        title: '',
        targetBackgrounds: [],
        universities: [],
        groupIds: [],
        startDate: new Date(),
        hiddenLivestream: false,
        speakers: {
            [id]: speakerObj,
        }
        ,
        summary: ''
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

    const getDownloadUrl = (fileElement) => {
        if (fileElement) {
            return 'https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/' + fileElement.replace('/', '%2F') + '?alt=media';
        } else {
            console.log("-> no fileElement", fileElement);
            return '';
        }
    }

    return allFetched ? (
        <Container className={classes.root}>
            <Typography variant="h3" align="center" gutterBottom>Create a Livestream</Typography>
            <Formik
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
                    })
                    return errors;
                }}
                onSubmit={(values, {setSubmitting}) => {
                    setSubmitting(true)
                    // let livestream = buildLivestreamObject(values);
                    // let speakers = buildSpeakersArray(values);
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
                  }) => {

                    const handleAddSpeaker = () => {
                        const newValues = {...values}
                        newValues.speakers[uuidv4()] = speakerObj
                        setValues(newValues)
                    }

                    const handleError = (key, fieldName) => {
                        const baseError = errors && errors.speakers && errors.speakers[key] && errors.speakers[key][fieldName]
                        const baseTouched = touched && touched.speakers && touched.speakers[key] && touched.speakers[key][fieldName]
                        return baseError && baseTouched && baseError
                    }

                    const handleDeleteSpeaker = (key) => {
                        const newFormData = {...formData}
                        delete newFormData.speakers[key]
                        setFormData(newFormData)
                    }
                    return (
                        <form className={classes.form} onSubmit={handleSubmit}>
                            <Grid spacing={2} container>
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
                                <Grid xs={7} sm={7} md={4} lg={4} xl={4} item>
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
                                      item>
                                    <div className={classes.switch}>
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
                                    </div>
                                </Grid>
                                <Grid xs={12} sm={12} md={6} lg={6} xl={6} item>
                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                        <DateTimePicker inputVariant="outlined" fullWidth variant="outlined"
                                                        label="Livestream Start Date" value={values.startDate}
                                                        onChange={(value) => {
                                                            setFieldValue('startDate', new Date(value), true)
                                                        }}/>
                                    </MuiPickersUtilsProvider>
                                </Grid>
                                {Object.keys(values.speakers).map((key, index) => {
                                    return (
                                        <Grid key={key} xs={12} sm={12} md={12} lg={12} xl={12} item>
                                            <SpeakerForm objectKey={key}
                                                         index={index}
                                                         handleDeleteSpeaker={handleDeleteSpeaker}
                                                         errors={errors}
                                                         firstNameError={handleError(key, "firstName")}
                                                         lastNameError={handleError(key, "lastName")}
                                                         positionError={handleError(key, "position")}
                                                         backgroundError={handleError(key, "background")}
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
                                        </Grid>
                                    )
                                })}
                                <Grid xs={12} sm={12} md={12} lg={12} xl={12} item>
                                    <Button startIcon={<PersonAddIcon/>} onClick={handleAddSpeaker} type="button"
                                            color="primary" fullWidth>
                                        Add a Speaker
                                    </Button>
                                </Grid>
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
                                                      setFieldValue={setFieldValue}
                                                      value={values.groupIds}
                                                      groups={existingGroups} />
                                </Grid>
                            </Grid>
                            <Button type="submit" color="primary" variant="contained" fullWidth>
                                Submit
                            </Button>
                        </form>
                    )
                }}
            </Formik>
        </Container>
    ) : null;
};

export default withFirebase(NewLivestreamForm);
