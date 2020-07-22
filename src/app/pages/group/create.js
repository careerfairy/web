import { useEffect, useState } from 'react'
import { Container, Button, Image, Icon, Form, Header as SemanticHeader, Dropdown } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import { withFirebase } from '../../data/firebase';
import Header from '../../components/views/header/Header';

import Head from 'next/head';
import Footer from '../../components/views/footer/Footer';
import { Formik } from 'formik';
import FilePickerContainer from '../../components/ssr/FilePickerContainer';

const CreateGroup = (props) => {
    
    const router = useRouter();

    const [logoUrl, setLogoUrl] = useState('https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/group-logos%2Fplaceholder.png?alt=media&token=242adbfc-8ebb-4221-94ad-064224dca266')

    useEffect(() => {
        props.firebase.auth.onAuthStateChanged(user => {
            if (user) {
            }  else {
                router.replace('/login');
            }
        })
    }, []);

    function uploadLogo(location, fileObject, callback) {
        var storageRef = props.firebase.getStorageRef();
        let fullPath = location + '/' + fileObject.name;
        let companyLogoRef = storageRef.child(fullPath);

        var uploadTask = companyLogoRef.put(fileObject);

        uploadTask.on('state_changed',
            function(snapshot) {
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
            }, function(error) {    
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
            }, function() {
                // Upload completed successfully, now we can get the download URL
                uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                    callback(downloadURL, fullPath);
                    console.log('File available at', downloadURL);
                });
            });
    }

    return (
            <div className='greyBackground'>
                <Head>
                    <title key="title">CareerFairy | Create a group</title>
                </Head>
                <Header classElement='relative white-background'/>
                <Container textAlign='left'>
                    <div className='padding-vertical'>
                        <h1 className='center thin teal large'>Create a Career Group</h1>
                        <Formik
                            initialValues={{
                                logoUrl: '', 
                            }}
                            validate={values => {
                                let errors = {};
                                if (!values.logoUrl) {
                                    errors.logoUrl = 'Required';
                                } 
                                return errors;
                            }}
                            onSubmit={(values, { setSubmitting }) => {
                                
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
                                            <div style={{ textAlign: 'center'}}>
                                                <div className='logo-element'>
                                                    <Image style={{ margin: '20px auto 20px auto', maxWidth: '100%', maxHeight: '250px'}} src={logoUrl}/>
                                                </div>
                                                <FilePickerContainer
                                                    extensions={['jpg','jpeg','png']}
                                                    maxSize={20}
                                                    onChange={fileObject => {uploadLogo('group-logos', fileObject, (newUrl, fullPath) => { debugger; setFieldValue('logoUrl', fullPath, true); setLogoUrl(newUrl);})}}
                                                    onError={errMsg => ( console.log(errMsg) )}
                                                >
                                                    <Button size='huge'>Upload Your Logo</Button>
                                                </FilePickerContainer>
                                            </div>     
                                        </Form.Field>  
                                    </Form.Group>                                                   
                                    <Form.Group widths='equal'>
                                        <Form.Field>
                                            <label className='login-label'>Group Name</label>
                                            <input id='company' type='text' className='stylish-input' name='company' placeholder='Your Group Name' onChange={handleChange} onBlur={handleBlur} value={values.company} disabled={isSubmitting} />
                                            <div className='field-error'>
                                                {errors.company && touched.company && errors.company}
                                            </div>
                                        </Form.Field>
                                    </Form.Group>     
                                    <Form.Field>
                                        <label className='login-label'>Description</label>
                                        <textarea id='title' type='textarea' name='title' className='stylish-textarea' placeholder='Describe some characteristics shared by your members' onChange={handleChange} onBlur={handleBlur} value={values.title} disabled={isSubmitting} />
                                        <div className='field-error'>
                                            {errors.title && touched.title && errors.title}
                                        </div>
                                    </Form.Field>    
                                    <Button id='submitButton' type="submit" primary size='large' disabled={isSubmitting} loading={isSubmitting} fluid>Create Group</Button>
                                </Form>
                        )}
                        </Formik>
                    </div>
                </Container>
                <Footer/>
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
            </div>
    );
};

export default withFirebase(CreateGroup);