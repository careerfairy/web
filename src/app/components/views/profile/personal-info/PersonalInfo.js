import { useEffect, useState, Fragment } from 'react'
import { Container, Header as SemanticHeader, Button, Dropdown, Form, Image, Grid } from 'semantic-ui-react';
import { Formik } from 'formik';
import { useRouter } from 'next/router';

import { withFirebase } from '../../../../data/firebase';

const PersonalInfo = (props) => {

    function logout() {
        setLoading(true);
        props.firebase.doSignOut().then(() => {
            router.replace('/login');
        });
    }

    return (               
        <Fragment>
            <Formik
                initialValues={ props.userData ? { firstName: props.userData.firstName, lastName: props.userData.lastName } : { firstName: '', lastName: '' }}
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
                    return errors;
                }}
                onSubmit={(values, { setSubmitting }) => {
                    setSubmitting(true);
                    props.firebase.setUserData(props.userData.userEmail, values.firstName, values.lastName)
                    .then(() => {
                        return router.push('/next-livestreams');   
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
                    handleBlur,
                    handleSubmit,
                    isSubmitting,
                    /* and other goodies */
                }) => (
                    <Form onSubmit={handleSubmit} style={{ textAlign: 'left'}} size='big'>
                        <h3 style={{ color: 'rgb(160,160,160)', margin: '0 0 30px 0', fontWeight: '300' }}>Personal Infos</h3>
                        <Form.Group widths='equal'>
                            <Form.Field>
                                <label>Email</label>
                                <input type='text' name='email' disabled value={props.userData.userEmail}/>
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
                        <Button id='submitButton' color='teal' type='submit'  size='big' content={ props.userData ? 'Update' : 'Create Account'} loading={isSubmitting}/>
                    </Form>
                )}
            </Formik>
            <style jsx>{`
                .group-selector {
                    position: relative;
                    height: 250px;
                    border-radius: 15px;
                    background-color: white;
                    box-shadow: 0 0 2px lightgrey;
                }
            `}</style>
        </Fragment> 
    );
};

export default withFirebase(PersonalInfo);