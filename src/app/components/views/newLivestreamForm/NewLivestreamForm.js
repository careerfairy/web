import React, {useState} from 'react';
import {Container, Grid, Typography} from "@material-ui/core";
import {Formik} from 'formik';


const NewLivestreamForm = () => {

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
            {
                avatarUrl: '',
                firstName: '',
                lastName: '',
                position: '',
                background: ''
            }
        ],

        summary: ''
    })

    const handleAddSpeaker = () => {

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
                    if (!values.mainSpeakerFirstName) {
                        errors.mainSpeakerFirstName = 'Required';
                    }
                    if (!values.mainSpeakerLastName) {
                        errors.mainSpeakerLastName = 'Required';
                    }
                    if (!values.mainSpeakerPosition) {
                        errors.mainSpeakerPosition = 'Required';
                    }
                    if (!values.mainSpeakerBackground) {
                        errors.mainSpeakerBackground = 'Required';
                    }

                    if (values.secondSpeakerPresent) {
                        if (!values.secondSpeakerFirstName) {
                            errors.secondSpeakerFirstName = 'Required';
                        }
                        if (!values.secondSpeakerFirstName) {
                            errors.secondSpeakerFirstName = 'Required';
                        }
                        if (!values.secondSpeakerLastName) {
                            errors.secondSpeakerLastName = 'Required';
                        }
                        if (!values.secondSpeakerPosition) {
                            errors.secondSpeakerPosition = 'Required';
                        }
                        if (!values.secondSpeakerBackground) {
                            errors.secondSpeakerBackground = 'Required';
                        }
                    }

                    if (values.thirdSpeakerPresent) {
                        if (!values.thirdSpeakerFirstName) {
                            errors.thirdSpeakerFirstName = 'Required';
                        }
                        if (!values.thirdSpeakerFirstName) {
                            errors.thirdSpeakerFirstName = 'Required';
                        }
                        if (!values.thirdSpeakerLastName) {
                            errors.thirdSpeakerLastName = 'Required';
                        }
                        if (!values.thirdSpeakerPosition) {
                            errors.thirdSpeakerPosition = 'Required';
                        }
                        if (!values.thirdSpeakerBackground) {
                            errors.thirdSpeakerBackground = 'Required';
                        }
                    }
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

export default NewLivestreamForm;
