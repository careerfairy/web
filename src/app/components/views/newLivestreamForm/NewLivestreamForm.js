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
import {Formik} from 'formik';
import {v4 as uuidv4} from 'uuid';
import {withFirebase} from "../../../context/firebase";
import ImageSelect from "./ImageSelect/ImageSelect";
import {makeStyles} from "@material-ui/core/styles";
import {
    DateTimePicker,
    MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import SpeakerForm from "./SpeakerForm/SpeakerForm";


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

const NewLivestreamForm = ({firebase}) => {
    const classes = useStyles()
    const id = uuidv4()
    const [formData, setFormData] = useState({
        logoUrl: '',
        backgroundUrl: '',
        company: '',
        companyId: '',
        title: '',
        targetBackgrounds: [],
        universities: [],
        startDate: new Date(),
        hiddenLivestream: false,
        speakers: {
            [uuidv4()]: speakerObj,
        }
        ,
        summary: ''
    })

    const [existingLogos, setExistingLogos] = useState([]);
    const [fetchingLogos, setFetchingLogos] = useState(false)
    const [existingBackgrounds, setExistingBackgrounds] = useState([]);
    const [fetchingBackgrounds, setFetchingBackgrounds] = useState(false)
    const [existingAvatars, setExistingAvatars] = useState([]);
    const [fetchingAvatars, setFetchingAvatars] = useState(false)

    useEffect(() => {
        firebase.getStorageRef().child('company-logos').listAll().then(res => {
            setFetchingLogos(true)
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
            setFetchingBackgrounds(true)
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
            setFetchingAvatars(true)
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

    const getDownloadUrl = (fileElement) => {
        if (fileElement) {
            return 'https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/' + fileElement.replace('/', '%2F') + '?alt=media';
        } else {
            console.log("-> no fileElement", fileElement);
            return '';
        }
    }

    const handleAddSpeaker = () => {
        const newFormData = {...formData}
        newFormData.speakers[uuidv4()] = speakerObj
        setFormData(newFormData)
    }

    const handleDeleteSpeaker = (id) => {
        const newFormData = {...formData}
        delete newFormData.speakers[id]
        setFormData(newFormData)
    }


    return (
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
                    if (!values.universities || values.universities.length < 1) {
                        errors.targetBackgrounds = 'Required';
                    }

                    Object.keys(values.speakers).forEach((key) => {
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
                    let livestream = buildLivestreamObject(values);
                    let speakers = buildSpeakersArray(values);

                    props.firebase.addLivestream(livestream).then(docRef => {
                        alert("added livestream with Id: " + docRef.id);
                        console.log("added livestream with Id: " + docRef.id);
                        speakers.forEach(speaker => {
                            props.firebase.addLivestreamSpeaker(docRef.id, speaker);
                        })
                    });
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
                      setFieldValue
                      /* and other goodies */
                  }) => (
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
                                             label="Company Background" handleBlur={handleBlur} formName="backgroundUrl"
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
                            {Object.keys(values.speakers).map((key) => {
                                return (
                                    <Grid key={key} xs={12} sm={12} md={12} lg={12} xl={12} item>
                                        <SpeakerForm objectKey={key}
                                                     errors={errors}
                                                     getDownloadUrl={getDownloadUrl}
                                                     loading={fetchingAvatars}
                                                     speaker={values.speakers[key]}
                                                     values={values}
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
                                <Button onClick={handleAddSpeaker} color="primary" variant="contained" fullWidth>
                                    Add Speaker
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                )}
            </Formik>
        </Container>
    );
};

export default withFirebase(NewLivestreamForm);
