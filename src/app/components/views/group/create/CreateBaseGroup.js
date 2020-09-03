import React, {useEffect, useState, Fragment} from 'react'
import {Image, Form} from 'semantic-ui-react';
import {useRouter} from 'next/router';
import {withFirebase} from '../../../../data/firebase';
import CircularProgress from '@material-ui/core/CircularProgress';
import PublishIcon from '@material-ui/icons/Publish';
import TextField from '@material-ui/core/TextField';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import {Formik, Field, Form as UiForm} from 'formik';
import FilePickerContainer from '../../../../components/ssr/FilePickerContainer';
import {Button, Input} from "@material-ui/core";

const placeholder = "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/group-logos%2Fplaceholder.png?alt=media&token=242adbfc-8ebb-4221-94ad-064224dca266"

const CreateBaseGroup = ({handleNext, activeStep, handleBack, handleReset, firebase, setCareerCenterRef, setBaseGroupInfo, baseGroupInfo}) => {

    const [user, setUser] = useState(null);
    const [filePickerError, setFilePickerError] = useState(null)
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

    function uploadLogo(location, fileObject, callback) {
        var storageRef = firebase.getStorageRef();
        let fullPath = location + '/' + fileObject.name;
        let companyLogoRef = storageRef.child(fullPath);

        var uploadTask = companyLogoRef.put(fileObject);

        uploadTask.on('state_changed',
            function (snapshot) {
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                switch (snapshot.state) {
                    case 'paused':
                        console.log('Upload is paused');
                        break;
                    case 'running':
                        console.log('Upload is running');
                        break;
                    default:
                        break;
                }
            }, function (error) {
                switch (error.code) {
                    case 'storage/unauthorized':
                        // User doesn't have permission to access the object
                        break;

                    case 'storage/canceled':
                        // User canceled the upload
                        break;

                    case 'storage/unknown':
                        // Unknown error occurred, inspect error.serverResponse
                        break;
                    default:
                        break;
                }
            }, function () {
                // Upload completed successfully, now we can get the download URL
                uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
                    callback(downloadURL);
                    console.log('File available at', downloadURL);
                });
            });
    }

    return (
        <Fragment>

            <div className='padding-vertical'>
                <h1 className='center thin teal large'>Create a Career Group</h1>
                <Formik
                    initialValues={{
                        logoUrl: baseGroupInfo.logoUrl||'',
                        universityName: baseGroupInfo.universityName ||'',
                        description: baseGroupInfo.description ||''
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
                            description: values.description,
                            test: false,
                            universityName: values.universityName
                        }

                        setBaseGroupInfo(careerCenter)
                        handleNext()
                        setSubmitting(false);

                        // firebase.createCareerCenter(careerCenter).then(careerCenterRef => {
                        // setCareerCenterRef(careerCenterRef)
                        //     console.log("career center has been asaved in state!", careerCenterRef)
                        //     // router.push('/group/' + careerCenterRef.id + '/admin');
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
                                            onChange={(fileObject) => setFieldValue('logoUrl', URL.createObjectURL(fileObject), true)
                                                // fileObject => {
                                                //     uploadLogo('group-logos', fileObject, (newUrl) => {
                                                //         setFieldValue('logoUrl', newUrl, true);
                                                //     })
                                                // }
                                            }

                                            onError={errMsg => (setFilePickerError(errMsg))}
                                        >
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
                                    style={{height: 50, marginBottom: 30, marginTop: 20}}
                                    onBlur={handleBlur}
                                    helperText={touched.description && errors.description}
                                    disabled={isSubmitting}
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

                    .center {
                        text-align: center;
                    }

                    .thin {
                        font-weight: 300;
                    }
                    
                    .field-error {
                      margin-top: 10px;
                    }

                    .large {
                        font-size: calc(1.2em + 1.5vw);
                    }

                    .padding-vertical {
                        padding-top: 50px;
                        padding-bottom: 50px;
                        max-width: 600px;
                        margin: 0 auto;
                    }
                    .teal {
                        color: rgb(0, 210, 170);
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
