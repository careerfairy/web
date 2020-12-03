import { useEffect, useState, Fragment } from 'react'
import { Container, Image, Grid, Form, Button } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import { withFirebase } from 'context/firebase';
import { Formik } from 'formik';

const SelectCompanyStep = (props) => {

    if (props.schedulingStep !== 1) {
        return null;
    }
    
    const router = useRouter();
    const groupId = router.query.groupId;

    return (    
            <Fragment> 
                <div>
                    <h2 className='schedule-events-label'>Schedule a live stream with { props.livestreamRequest.company.id }</h2>
                    <div className='internal'>
                        <div className='company-selector'>
                            <Image src={props.livestreamRequest.company.logoUrl} style={{ maxWidth: '200px', maxHeight: '100px', margin: '20px auto 40px auto'}}/>
                            <Formik
                                initialValues={{title: '', proposal: '' }}
                                enableReinitialize={true}
                                validate={values => {
                                    let errors = {};
                                    if (!values.email) {
                                        errors.email = 'Required';
                                    } else if (!/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i.test(values.email)) {
                                        errors.email = 'Please enter a valid email address';
                                    } 
                                    if (!values.title) {
                                        errors.title = 'Required';
                                    } 
                                    if (!values.proposal) {
                                        errors.proposal = 'Required';
                                    } 
                                    return errors;
                                }}
                                onSubmit={(values, { setSubmitting }) => {
                                    
                                }}
                                >
                                {({
                                    values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting
                                }) => (
                                    <Form onSubmit={handleSubmit} style={{ textAlign: 'left'}} size='big'>
                                         <Form.Group widths='equal'>
                                            <Form.Field>
                                                <label>Your Email address</label>
                                                <input type='text' name='email' onChange={handleChange} placeholder='Enter the email address that the company will reply to' onBlur={handleBlur} value={values.email}/>
                                                <div className='field-error'>
                                                    {errors.email && touched.email && errors.email}
                                                </div>
                                            </Form.Field>
                                        </Form.Group>
                                        <Form.Group widths='equal'>
                                            <Form.Field>
                                                <label>Livestream Title</label>
                                                <input type='text' name='title' onChange={handleChange} placeholder='Propose a topic for the live stream' onBlur={handleBlur} value={values.title}/>
                                                <div className='field-error'>
                                                    {errors.proposal && touched.proposal && errors.proposal}
                                                </div>
                                            </Form.Field>
                                        </Form.Group>
                                        <Form.Group widths='equal'>
                                            <Form.Field>
                                                <label className='login-label'>Proposal</label>
                                                <textarea id='title' type='textarea' name='proposal' className='stylish-textarea' placeholder='Tell the company what the livestream should be about and who should hold it' onChange={handleChange} onBlur={handleBlur} value={values.proposal} disabled={isSubmitting} />
                                                <div className='field-error'>
                                                    {errors.title && touched.title && errors.title}
                                                </div>
                                            </Form.Field>
                                        </Form.Group>
                                        <Button id='submitButton' color='teal' type='submit'  size='big' content='Next' loading={isSubmitting}/>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </div>
                </div>  
                <style jsx>{`
                    .hidden {
                        display: none;
                    }

                    .greyBackground {
                        background-color: rgb(250,250,250);
                        height: 100%;
                        min-height: 100vh;
                    }

                    .white-box {
                        padding: 10px;
                        margin: 10px 0 10px 0;
                        text-align: left;
                    }

                    .image-outer-container {
                        max-width: 80px;
                        margin: 0 auto;
                    }

                    .image-container {
                        position: relative;
                        width: 100%;
                        padding-top: 95%;
                        border-radius: 50%;
                        border: 5px solid rgb(0, 210, 170);
                        background-color: white;
                        margin: 0 auto 40px auto;
                        box-shadow: 0 0 5px rgb(200,200,200);
                    }

                    .stylish-textarea {
                        font-family: 'Poppins', sans-serif; 
                    }

                    .company-selector {
                        position: relative;
                        border-radius: 10px;
                        background-color: white;
                        box-shadow: 0 0 2px rgb(200,200,200);
                        padding: 30px 50px;
                    }

                    .schedule-events-label {
                        font-weight: 300;
                        margin: 30px 0;
                    }

                    .field-error {
                        margin-top: 10px;
                        color: red;
                    }

                    .join-group-title {
                        text-align: left;
                        margin: 0 0 30px 0;
                        font-weight: 700;
                        font-size: 1.3em;
                        color: rgb(80,80,80);
                    }

                    .group-name {
                        margin: 20px 0 20px 0;
                        font-weight: 500;
                        font-size: calc(1em + 1.4vw);
                        color: rgb(80,80,80);
                    }

                    #profileContainer {
                        padding: 30px 0;
                    }
            `}</style>
        </Fragment>   
    );
};

export default withFirebase(SelectCompanyStep);