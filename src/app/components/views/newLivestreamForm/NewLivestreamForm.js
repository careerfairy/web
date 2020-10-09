import React, {useState, useEffect} from 'react';
import {Container, Grid, Typography} from "@material-ui/core";
import {Formik} from 'formik';
import {v4 as uuidv4} from 'uuid';
import {withFirebase} from "../../../context/firebase";

const speakerObj = {
    id: uuidv4(),
    avatarUrl: '',
    firstName: '',
    lastName: '',
    position: '',
    background: ''
}

const NewLivestreamForm = ({firebase}) => {

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
            console.log(fileItems);
            let logoOptions = fileItems.map(logoFile => {
                return {text: logoFile.name, value: logoFile.fullPath}
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
                return {text: backgroundFile.name, value: backgroundFile.fullPath}
            });
            setFetchingBackgrounds(false)
            setExistingBackgrounds(backgroundOptions);
        });
    }, [firebase]);

    const getDownloadUrl = (fileElement) => {
        if (fileElement) {
            return 'https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/' + fileElement.replace('/', '%2F') + '?alt=media';
        } else {
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
        <Container style={{flex: 1, display: "flex", minHeight: 700, marginBottom: 10}}>
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
                    <form id='signUpForm' onSubmit={handleSubmit}>
                        <Grid container>

                        </Grid>
                    </form>
                )}
            </Formik>
        </Container>
    );
};

export default withFirebase(NewLivestreamForm);
