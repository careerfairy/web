import { useEffect, useState } from 'react'
import { Container, Header as SemanticHeader, Button, Dropdown, Form } from 'semantic-ui-react';
import { Formik } from 'formik';

import { UNIVERSITY_SUBJECTS } from '../data/StudyFieldData';
import { UNIVERSITY_NAMES } from '../data/UniversityData';
import { withFirebase } from '../data/firebase';
import Header from '../components/views/header/Header';
import Loader from '../components/views/loader/Loader';

const UserProfile = (props) => {

    const [loading, setLoading] = useState(false)
    const [userData, setUserData] = useState(null)
    const [user, setUser] = useState(null);
    const [initialValues, setInitialValues] = useState(null);

    const subjects = UNIVERSITY_SUBJECTS;
    const universities = UNIVERSITY_NAMES;
    
    useEffect(() => {
       if (userData) {
            setInitialValues({ firstName: userData.firstName, lastName: userData.lastName, university: userData.university, fieldOfStudy: userData.faculty });
       } else {
            setInitialValues({ firstName: '', lastName: '', university: 'ethz', fieldOfStudy: 'PHYS' });
       }
    }, [userData]);

    useEffect(() => {
        debugger
        props.firebase.auth.onAuthStateChanged(user => {
            debugger;
            if (user !== null) {
                setUser(user);
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

    function logout() {
        props.firebase.doSignOut();
    }

    if (user === null || loading === true) {
        return <Loader/>;
    }

    return (
        <div>
            <Header color='teal'/>
                <Container id='profileContainer' textAlign='center'>
                    <SemanticHeader as='h1' color='teal' textAlign='left'>Your Profile</SemanticHeader>
                    <SemanticHeader as='h3' color='grey' textAlign='left'>This data helps us providing you with the best career suggestions!</SemanticHeader>
                    <Formik
                        initialValues={initialValues}
                        enableReinitialize={true}
                        validate={values => {
                            let errors = {};
                            if (!values.firstName) {
                                    errors.firstName = 'Required';
                            } else if (!/^[a-z ,.'-]+$/i.test(values.firstName)) {
                                errors.firstName = 'Please enter a valid first name';
                            }
                            if (!values.lastName) {
                                errors.lastName = 'Required';
                            } else if (!/^[a-z ,.'-]+$/i.test(values.lastName)) {
                                errors.lastName = 'Please enter a valid last name';
                            }
                            if (!values.university) {
                                errors.university = 'Required';
                            } 
                            if (!values.fieldOfStudy) {
                                errors.fieldOfStudy = 'Required';
                            }
                            return errors;
                        }}
                        onSubmit={(values, { setSubmitting }) => {
                            setSubmitting(true);
                            props.firebase.setUserData(user.email, values.firstName, values.lastName, values.university, values.fieldOfStudy)
                            .then(() => {
                                setSubmitting(false);
                                if (!props.userData) {
                                    router.push('/discover');
                                }
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
                            <Form onSubmit={handleSubmit} style={{ textAlign: 'left'}}>
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
                                        <label>Where are you studying/did you study?</label>
                                        <Dropdown placeholder='Select University' value={values.university} onChange={(event, {value}) => { setFieldValue('university', value, true) }} compact selection options={universities}/>
                                    </Form.Field>
                                    <Form.Field>
                                        <label>What is your field of study?</label>
                                        <Dropdown placeholder='Select Field of Study' value={values.fieldOfStudy} onChange={(event, {value}) => { setFieldValue('fieldOfStudy', value, true) }} compact selection options={subjects}/>
                                    </Form.Field>
                                </Form.Group>
                                <Button id='submitButton' color='teal' type='submit' content={props.user ? 'Save Changes' : 'Create Account'} loading={isSubmitting}/>
                            </Form>
                        )}
                        </Formik>
                    <Button onClick={logout} color='teal' basic content='Logout'/>
                </Container>
            </div>
    );
};

export default withFirebase(UserProfile);