import React, {useState, useEffect} from 'react';
import {Container, Grid, Typography, TextField, FormControl, Collapse, FormHelperText} from "@material-ui/core";
import {Formik} from 'formik';
import {v4 as uuidv4} from 'uuid';
import {withFirebase} from "../../../context/firebase";
import ImageSelect from "./ImageSelect/ImageSelect";
import {makeStyles} from "@material-ui/core/styles";
import {
  DateTimePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import DateFnsUtils from '@date-io/date-fns';



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
    }
}));

const speakerObj = {
    id: uuidv4(),
    avatarUrl: '',
    firstName: '',
    lastName: '',
    position: '',
    background: ''
}

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
        startDate: new Date(),
        hiddenLivestream: false,
        speakers: [
            speakerObj
        ],
        summary: ''
    })

    const [existingLogos, setExistingLogos] = useState([]);
    const [fetchingLogos, setFetchingLogos] = useState(false)
    const [existingBackgrounds, setExistingBackgrounds] = useState([]);
    const [fetchingBackgrounds, setFetchingBackgrounds] = useState(false)

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
        newFormData.speakers.push(speakerObj)
        setFormData(newFormData)
    }

    const handleDeleteSpeaker = (id) => {
        const newFormData = {...formData}
        const speakers = newFormData.speakers
        const index = speakers.findIndex(speaker => speaker.id === id)
        if (index > -1) {
            speakers.splice(index, 1);
            newFormData.speakers = speakers
            setFormData(speakers)
        }
    }


    return (
        <Container className={classes.root}>
            <Typography variant="h3" align="center" gutterBottom>Create a Livestream</Typography>
            <Formik
                initialValues={formData}
                validate={values => {
                    let errors = {};
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

                    values.speakers.forEach((speaker, index) => {
                        if (!values.speakers[index].firstName) {
                            errors.values.speakers[index].firstName = 'Required';
                        }
                        if (!values.speakers[index].lastName) {
                            errors.values.speakers[index].lastName = 'Required';
                        }
                        if (!values.speakers[index].position) {
                            errors.values.speakers[index].position = 'Required';
                        }
                        if (!values.speakers[index].background) {
                            errors.values.speakers[index].background = 'Required';
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
                                <ImageSelect getDownloadUrl={getDownloadUrl} values={values} firebase={firebase}
                                             setFieldValue={setFieldValue} submitting={isSubmitting}
                                             path="company-logos"
                                             label="Logo" handleBlur={handleBlur} formName="logoUrl"
                                             value={values.logoUrl} options={existingLogos} loading={fetchingLogos}
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
                            <Grid xs={12} sm={12} md={6} lg={6} xl={6} item>
                                <FormControl fullWidth>
                                    <TextField name="title"
                                               variant="outlined"
                                               fullWidth
                                               id="title"
                                               label="Livestream Title"
                                               inputProps={{maxLength: 70}}
                                               onBlur={handleBlur}
                                               value={values.companyId}
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
                            <Grid xs={12} sm={12} md={6} lg={6} xl={6} item>
                                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                    <label className='login-label'>Livestream Start Date</label>
                                        <DateTimePicker value={values.startDate} onChange={(value) => {
                                            setFieldValue('startDate', new Date(value), true)
                                        }}/>
                                </MuiPickersUtilsProvider>
                            </Grid>
                        </Grid>
                    </form>
                )}
            </Formik>
        </Container>
    );
};

export default withFirebase(NewLivestreamForm);
