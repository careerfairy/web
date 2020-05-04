import { useEffect, useState } from 'react'
import { Container, Header as SemanticHeader, Button, Dropdown, Form } from 'semantic-ui-react';
import { Formik } from 'formik';
import { useRouter } from 'next/router';

import { UNIVERSITY_SUBJECTS } from '../data/StudyFieldData';
import { UNIVERSITY_SPECIFIC_SUBJECTS } from '../data/UniversitySpecificFieldsData';
import { UNIVERSITY_NAMES } from '../data/UniversityData';
import { STUDY_LEVELS } from '../data/StudyLevelData';
import { withFirebase } from '../data/firebase';
import Header from '../components/views/header/Header';
import Loader from '../components/views/loader/Loader';

import Head from 'next/head';
import UserUtil from '../data/util/UserUtil';

const UserProfile = (props) => {

    const router = useRouter();

    const generic_subjects = UNIVERSITY_SUBJECTS;
    const specific_subjects = UNIVERSITY_SPECIFIC_SUBJECTS;
    const universities = UNIVERSITY_NAMES;
    const levels = STUDY_LEVELS;

    const [loading, setLoading] = useState(false)
    const [userData, setUserData] = useState(null)
    const [user, setUser] = useState(null);
    const [initialValues, setInitialValues] = useState(null);
    const [selectField, setSelectField] = useState(generic_subjects);
    
    useEffect(() => {
       if (userData) {
            setInitialValues({ firstName: userData.firstName, lastName: userData.lastName, university: userData.university, fieldOfStudy: userData.faculty, levelOfStudy: userData.levelOfStudy });
            updateSelectFields(userData.university);
       } else {
            setInitialValues({ firstName: '', lastName: '', university: null, fieldOfStudy: null, levelOfStudy: null });
       }
    }, [userData]);

    useEffect(() => {
        props.firebase.auth.onAuthStateChanged(user => {
            debugger;
            if (user) {
                setUser(user);
            }  else {
                router.replace('/login');
            }
        })
    }, []);

    useEffect(() => {
        setLoading(true);
        if (user) {
            props.firebase.getUserData(user.email)
            .then(querySnapshot => {
                setLoading(false);
                let user = querySnapshot.data();
                if (user) {
                    setUserData(user);
                }
            }).catch(error => {
                setLoading(false);
                console.log(error);
            });
        }
    },[user]);

    function updateSelectFields(university) {
        if (specific_subjects.hasOwnProperty(university)) {
            setSelectField(specific_subjects[university]);
        } else {
            setSelectField(generic_subjects);
        }
    }

    function logout() {
        setLoading(true);
        props.firebase.doSignOut().then(() => {
            router.replace('/login');
        });
    }

    if (user === null || loading === true) {
        return <Loader/>;
    }

    return (
            <div className='greyBackground'>
                <Head>
                    <title key="title">CareerFairy | My Profile</title>
                </Head>
                <Header classElement='relative white-background'/>
                <Container textAlign='left'>
                    <h1 style={{ color: 'rgb(0, 210, 170)', margin: '30px 0 20px 0' }}>{ userData ? 'Your Profile' : 'Complete Your Profile'}</h1>
                    <h3 style={{ color: 'rgb(150,150,150)', margin: '20px 0 40px 0' }} className={userData ? 'hidden' : ''}>so we can show you the jobs and speakers that matter most to you</h3>
                    <Formik
                        initialValues={initialValues}
                        enableReinitialize={true}
                        validate={values => {
                            let errors = {};
                            if (!values.firstName) {
                                    errors.firstName = 'Required';
                            } else if (!/^\D+$/i.test(values.firstName)) {
                                errors.firstName = 'Please enter a valid first name';
                            }
                            if (!values.lastName) {
                                errors.lastName = 'Required';
                            } else if (!/^\D+$/i.test(values.lastName)) {
                                errors.lastName = 'Please enter a valid last name';
                            }
                            if (!values.university) {
                                errors.university = 'Please select a university';
                            } 
                            if (!values.fieldOfStudy) {
                                errors.fieldOfStudy = 'Please select a field of study';
                            }
                            if (!values.levelOfStudy) {
                                errors.fieldOfStudy = 'Please select a level of study';
                            }
                            return errors;
                        }}
                        onSubmit={(values, { setSubmitting }) => {
                            setSubmitting(true);
                            props.firebase.setUserData(user.email, values.firstName, values.lastName, values.university, values.fieldOfStudy, values.levelOfStudy)
                            .then(() => {
                                if (!userData || !UserUtil.userProfileIsComplete(userData)) {
                                    if (values.university === 'ethzurich' || values.university === 'epflausanne' || values.university === 'unizurich'|| values.university === 'unilausanne') {
                                        if (values.university === 'ethzurich') {
                                            return router.push('/next-livestreams?university=polyefair');
                                        }
                                        return router.push('/next-livestreams' + (values.university ? ('?university=' + values.university) : ''));
                                    } else {
                                        return router.push('/next-livestreams');
                                    }
                                }
                                setSubmitting(false);
                            }).catch(error => {
                                setSubmitting(false);
                                console.log(error);
                            });
                        }}
                        >
                        {({
                            values,
                            errors,
                            touched,
                            handleChange,
                            setFieldValue,
                            handleBlur,
                            handleSubmit,
                            isSubmitting,
                            /* and other goodies */
                        }) => (
                            <Form onSubmit={handleSubmit} style={{ textAlign: 'left'}} size='big'>
                                <Form.Group widths='equal'>
                                    <Form.Field>
                                        <label>Email</label>
                                        <input type='text' name='email' disabled value={user.email}/>
                                    </Form.Field>
                                    <Form.Field>
                                    </Form.Field>
                                </Form.Group>
                                <Form.Group widths='equal'>
                                    <Form.Field>
                                        <label>First Name</label>
                                        <input type='text' name='firstName' placeholder='Your first name' onChange={handleChange} onBlur={handleBlur} value={values.firstName} disabled={isSubmitting} />
                                        <div className='field-error'>
                                            {errors.firstName && touched.firstName && errors.firstName}
                                        </div>
                                    </Form.Field>
                                    <Form.Field>
                                        <label>Last Name</label>
                                        <input type='text' name='lastName' placeholder='Your last name' onChange={handleChange} onBlur={handleBlur} value={values.lastName} disabled={isSubmitting} />
                                        <div className='field-error'>
                                            {errors.lastName && touched.lastName && errors.lastName}
                                        </div>
                                    </Form.Field>
                                </Form.Group>
                                <Form.Group widths='equal'>
                                    <Form.Field>
                                        <label>Select your place of study</label>
                                        <Dropdown placeholder='Select University' value={values.university} onChange={(event, {value}) => { setFieldValue('university', value, true); updateSelectFields(value); setFieldValue('fieldOfStudy', null, false)}} compact selection options={universities}/>
                                        <div className='field-error'>
                                            {errors.university && touched.university && errors.university}
                                        </div>
                                    </Form.Field>
                                    <Form.Field>
                                        <label>Select your field of expertise</label>
                                        <Dropdown placeholder='Select Field of Study' value={values.fieldOfStudy} onChange={(event, {value}) => { setFieldValue('fieldOfStudy', value, true) }} compact selection options={selectField}/>
                                        <div className='field-error'>
                                            {errors.university && touched.university && errors.university}
                                        </div>
                                    </Form.Field>
                                    <Form.Field>
                                        <label>Select your level of study</label>
                                        <Dropdown placeholder='Select Field of Study' value={values.levelOfStudy} onChange={(event, {value}) => { setFieldValue('levelOfStudy', value, true) }} compact selection options={levels}/>
                                        <div className='field-error'>
                                            {errors.university && touched.university && errors.university}
                                        </div>
                                    </Form.Field>
                                </Form.Group>
                                <Button id='submitButton' color='teal' type='submit'  size='big' content={ userData && UserUtil.userProfileIsComplete(userData) ? 'Save Changes' : 'Create Account'} loading={isSubmitting}/>
                            </Form>
                        )}
                        </Formik>
                    <Button onClick={logout} color='teal' basic content='Logout' style={{ margin: '10px 0' }}/>
                </Container>
                <style jsx>{`
                    .hidden {
                        display: none;
                    }

                    .greyBackground {
                        background-color: rgb(250,250,250);
                        height: 100vh;
                    }

                    .field-error {
                        margin-top: 10px;
                        color: red;
                    }

                    #profileContainer {
                        padding: '30px 0'
                    }
                `}</style>
            </div>
    );
};

export default withFirebase(UserProfile);