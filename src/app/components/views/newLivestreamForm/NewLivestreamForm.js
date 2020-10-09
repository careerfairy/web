import React, {useState} from 'react';
import {Container, Grid, Typography} from "@material-ui/core";
import {Formik} from 'formik';
import {v4 as uuidv4} from 'uuid';

const speakerObj = {
    id: uuidv4(),
    avatarUrl: '',
    firstName: '',
    lastName: '',
    position: '',
    background: ''
}

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
            speakerObj
        ],
        summary: ''
    })

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

export default NewLivestreamForm;
