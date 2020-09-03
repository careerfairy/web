import {useEffect, useState, Fragment} from 'react'
import {Image, Form} from 'semantic-ui-react';
import {useRouter} from 'next/router';
import {withFirebase} from '../../../../data/firebase';
import CircularProgress from '@material-ui/core/CircularProgress';
import PublishIcon from '@material-ui/icons/Publish';
import {Formik} from 'formik';
import FilePickerContainer from '../../../../components/ssr/FilePickerContainer';
import {Button} from "@material-ui/core";

const placeholder = "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/group-logos%2Fplaceholder.png?alt=media&token=242adbfc-8ebb-4221-94ad-064224dca266"

const CreateBaseGroup = ({handleNext, activeStep, handleBack, handleReset, firebase, setCareerCenterRef}) => {

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
                        logoUrl: '',
                        name: '',
                        description: ''
                    }}
                    validate={values => {
                        let errors = {};
                        if (!values.logoUrl) {
                            errors.logoUrl = 'Required';
                        }
                        return errors;
                    }}
                    onSubmit={(values, {setSubmitting}) => {
                        let careerCenter = {
                            adminEmail: user.email,
                            logoUrl: values.logoUrl,
                            description: values.description,
                            test: false,
                            universityName: values.name
                        }
                        // firebase.createCareerCenter(careerCenter).then(careerCenterRef => {
                        handleNext()
                        // setCareerCenterRef(careerCenterRef)
                        //     console.log("career center has been asaved in state!", careerCenterRef)
                        //     // router.push('/group/' + careerCenterRef.id + '/admin');
                        setSubmitting(false);
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
                        <Form id='signUpForm' onSubmit={handleSubmit}>
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
                                            onChange={fileObject => {
                                                uploadLogo('group-logos', fileObject, (newUrl) => {
                                                    setFieldValue('logoUrl', newUrl, true);
                                                })
                                            }}
                                            onError={errMsg => (setFilePickerError(errMsg))}
                                        >
                                            {/*{errors.logoUrl && <p>Required</p>}*/}
                                            <Button variant="contained" size='large' endIcon={<PublishIcon/>}>
                                                Upload Your Logo
                                            </Button>
                                        </FilePickerContainer>
                                    </div>
                                </Form.Field>
                            </Form.Group>
                            <Form.Group widths='equal'>
                                <Form.Field>
                                    <label className='login-label'>Group Name</label>
                                    <input id='company' type='text' className='stylish-input' name='name'
                                           placeholder='Your Group Name' onChange={handleChange} onBlur={handleBlur}
                                           value={values.name} disabled={isSubmitting}/>
                                    <div className='field-error'>
                                        {errors.name && touched.name && errors.name}
                                    </div>
                                </Form.Field>
                            </Form.Group>
                            <Form.Field>
                                <label className='login-label'>Description</label>
                                <textarea id='title' type='textarea' name='description' className='stylish-textarea'
                                          placeholder='Describe some characteristics shared by your members'
                                          onChange={handleChange} onBlur={handleBlur} value={values.description}
                                          disabled={isSubmitting}/>
                                <div className='field-error'>
                                    {errors.description && touched.description && errors.description}
                                </div>
                            </Form.Field>
                            <Button size='large'
                                    variant="contained"
                                    disabled={isSubmitting}
                                    endIcon={isSubmitting &&
                                    <CircularProgress color="inherit" size={25} variant="indeterminate"/>}
                                    color="primary"
                                    type="submit"
                                    fullWidth={true}
                            >
                                Next
                            </Button>
                        </Form>
                    )}
                </Formik>
            </div>
            <style jsx>{`
                    .hidden {
                        display: none;
                    }

                    .center {
                        text-align: center;
                    }

                    .thin {
                        font-weight: 300;
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
