import React, {useEffect, useState, Fragment} from 'react'
import {Image, Form} from 'semantic-ui-react';
import {useRouter} from 'next/router';
import {withFirebase} from '../../../../data/firebase';
import PublishIcon from '@material-ui/icons/Publish';
import TextField from '@material-ui/core/TextField';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import {Formik, Field, Form as UiForm} from 'formik';
import FilePickerContainer from '../../../../components/ssr/FilePickerContainer';
import {Button, Input} from "@material-ui/core";

const placeholder = "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/group-logos%2Fplaceholder.png?alt=media&token=242adbfc-8ebb-4221-94ad-064224dca266"

const CreateBaseGroup = ({handleNext, firebase, setBaseGroupInfo, baseGroupInfo}) => {

    const [filePickerError, setFilePickerError] = useState(null)
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        firebase.auth.onAuthStateChanged(user => {
            if (user) {
                setUser(user);
            } else {
                router.replace('/login');
            }
        })
    }, []);

    return (
        <Fragment>

            <div className='padding-vertical'>
                <h1 className='content-title'>Create a Career Group</h1>
                <Formik
                    initialValues={{
                        logoUrl: baseGroupInfo.logoUrl || "",
                        logoFile: baseGroupInfo.logoFileObj || null,
                        universityName: baseGroupInfo.universityName || "",
                        description: baseGroupInfo.description || ""
                    }}
                    validate={values => {
                        let errors = {};
                        if (!values.logoUrl) {
                            errors.logoUrl = 'Required';
                        }
                        if (!values.universityName) {
                            errors.universityName = 'Required'
                        }
                        if (!values.description) {
                            errors.description = 'Required'
                        }
                        return errors;
                    }}
                    onSubmit={(values, {setSubmitting}) => {
                        let careerCenter = {
                            adminEmail: user.email,
                            logoUrl: values.logoUrl,
                            logoFileObj: values.logoFileObj || baseGroupInfo.logoFileObj,
                            description: values.description,
                            test: false,
                            universityName: values.universityName
                        }
                        setBaseGroupInfo(careerCenter)
                        setSubmitting(false);
                        handleNext()
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
                        <UiForm id='signUpForm' onSubmit={handleSubmit}>
                            <Form.Group widths='equal'>
                                <Form.Field>
                                    <div style={{textAlign: 'center'}}>
                                        <div className='logo-element'>
                                            <Image style={{
                                                margin: '20px auto 20px auto',
                                                maxWidth: '100%',
                                                maxHeight: '250px'
                                            }} src={values.logoUrl.length ? values.logoUrl : placeholder}/>
                                        </div>
                                        <FilePickerContainer
                                            extensions={['jpg', 'jpeg', 'png']}
                                            maxSize={20}
                                            onBlur={handleBlur}
                                            onChange={(fileObject) => {
                                                setFieldValue('logoUrl', URL.createObjectURL(fileObject), true)
                                                setFieldValue('logoFileObj', fileObject, true)}}
                                            onError={errMsg => (setFilePickerError(errMsg))}>
                                            <Button variant="contained" size='large' endIcon={<PublishIcon/>}>
                                                Upload Your Logo
                                            </Button>
                                        </FilePickerContainer>
                                        <div className="field-error">
                                            {touched.logoUrl && errors.logoUrl &&
                                            <p className="error-text">Logo required</p>}
                                            {filePickerError && <p className="error-text">{filePickerError}</p>}
                                        </div>
                                    </div>
                                </Form.Field>
                            </Form.Group>
                            <Form.Group widths='equal'>
                                <Form.Field>
                                    <TextField
                                        id='groupName'
                                        value={values.universityName}
                                        onChange={handleChange}
                                        error={touched.universityName && errors.universityName}
                                        onBlur={handleBlur}
                                        disabled={isSubmitting}
                                        helperText={touched.universityName && errors.universityName}
                                        label="Group Name"
                                        name="universityName"
                                        fullWidth
                                    />
                                </Form.Field>
                            </Form.Group>
                            <Form.Field>
                                <TextField
                                    label="Description"
                                    onChange={handleChange}
                                    error={touched.description && errors.description}
                                    value={values.description}
                                    placeholder="Please describe the purpose of your group"
                                    style={{marginBottom: 30, marginTop: 20}}
                                    onBlur={handleBlur}
                                    helperText={touched.description && errors.description}
                                    disabled={isSubmitting}
                                    rows={2}
                                    rowsMax={10}
                                    name="description"
                                    multiline
                                    fullWidth
                                />
                            </Form.Field>
                            <Button size='large'
                                    variant="contained"
                                    disabled={isSubmitting}
                                    endIcon={<ArrowForwardIcon/>}
                                    color="primary"
                                    type="submit"
                                    fullWidth={true}
                            >
                                Next
                            </Button>
                        </UiForm>
                    )}
                </Formik>
            </div>
            <style jsx>{`
                    .hidden {
                        display: none;
                    }
                    
                    .error-text {
                      color: red;
                      font-weight: lighter;
                      font-size: 1rem;
                    }
                    
                    .content-title {
                      text-align: center;
                      font-weight: 300;
                      color: rgb(0, 210, 170);
                      font-size: calc(1.2em + 1.5vw);
                    }
                    
                    .field-error {
                      margin-top: 10px;
                    }

                    .padding-vertical {
                        padding-top: 50px;
                        padding-bottom: 50px;
                        max-width: 600px;
                        margin: 0 auto;
                    }

                    #signUpForm {
                        text-align: center;
                    }

                    .logo-element {
                        margin: 0 auto;
                    }

                    .login-label {
                        text-align: left;
                        color: rgb(80,80,80);
                        font-size: 1.2em;
                    }

                    .stylish-input {
                        font-size: 1.4em;
                        height: 50px;
                    }

                    .stylish-textarea {
                        font-family: 'Poppins';
                    }
                `}</style>
        </Fragment>

    );
};

export default withFirebase(CreateBaseGroup);
