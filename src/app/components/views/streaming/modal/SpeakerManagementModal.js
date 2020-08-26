import React, {useState, useEffect} from 'react';

import { withFirebase } from '../../../../context/firebase';
import { Modal, Input, Icon, Button, Form } from 'semantic-ui-react';
import { Formik } from 'formik';

function SpeakerManagementModal(props) {

    const [additionalSpeakers, setAdditionalSpeakers] = useState(false);

    useEffect(() => {
        if (props.livestreamId) {
            const unsubscribe = props.firebase.listenToLivestreamLiveSpeakers(props.livestreamId, querySnapshot => {
                let liveSpeakersList = [];
                querySnapshot.forEach(doc => {
                    let speaker = doc.data();
                    speaker.id = doc.id;
                    liveSpeakersList.push(speaker);
                });
                setAdditionalSpeakers(liveSpeakersList);
            });
            return () => unsubscribe();
        }
    }, [props.livestreamId]);

    useEffect(() => {
        if (props.livestreamId && Array.isArray(additionalSpeakers)) {
            if (!additionalSpeakers.some( speaker => speaker.id === (props.livestreamId))) {
                addASpeaker("Main Speaker", true);
            }
        } 
    }, [additionalSpeakers,props.livestreamId]);

    function addASpeaker(speakerName, main) {
        return props.firebase.createNewLivestreamSpeaker(props.livestreamId, speakerName, main);
    }

    function removeSpeaker(speakerId) {
        return props.firebase.deleteLivestreamSpeaker(props.livestreamId, speakerId);
    }

    let speakerElements = [];

    if (additionalSpeakers && additionalSpeakers.length > 0) {
        speakerElements = additionalSpeakers.filter(speaker => speaker.id !== props.livestreamId).map((speaker, index) => {
            let link = 'https://careerfairy.io/streaming/' + props.livestreamId + '/joining-streamer/' + speaker.id;
            return (
                <div key={speaker.id} style={{ margin: '0 0 30px 0', border: '2px solid rgb(0, 210, 170)', padding: '20px', borderRadius: '10px', backgroundColor: 'rgb(252,252,252)', boxShadow: '0 0 2px grey' }} className='animated fadeIn'>
                    <h3 style={{ color: 'rgb(0, 210, 170)'}}><Icon name='user' style={{margin: '0 10px 0 0'}}/>{ speaker.name } <Button content={'Remove ' + speaker.name } icon='remove' size='mini' onClick={() => removeSpeaker(speaker.id)} style={{ margin: '0 20px'}}/></h3>
                    <Input type='text' value={link} disabled style={{ margin: '0 0 5px 0', color: 'red'}} fluid />
                    <p style={{ marginBottom: '10px', color: 'rgb(80,80,80)', fontSize: '0.8em'}}>Please send this link to { speaker.name } to allow her/him to join your live stream.</p>
                </div>
            )
        })
    }

    return (
        <Modal open={props.open} onClose={() => props.setOpen(false)}>
            <Modal.Header>Invite speakers</Modal.Header>
            <Modal.Content>
                <p style={{ fontSize: '0.9em', margin: '0 0 20px 0' }}>You can invite up to 3 speakers to join your stream. You should do this before starting your stream, to ensure that all streamer have joined before the event starts. When an invited speaker has successfully joined, you will be able to see and hear him/her in the stream overview.</p>
                { speakerElements }
                <div>
                    <Formik
                        initialValues={{ newSpeakerName: '' }}
                        validate={values => {
                            let errors = {};
                            if (!values.newSpeakerName) {
                                errors.newSpeakerName = 'Please provide a name for the new speaker!';
                            }
                            return errors;
                        }}
                        onSubmit={(values, { setSubmitting, resetForm }) => {
                            setSubmitting(true);
                            addASpeaker(values.newSpeakerName, false)
                            .then(() => {
                                setSubmitting(false);
                                resetForm({});
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
                        }) => (
                            <Form onSubmit={handleSubmit} style={{ textAlign: 'left'}} size='big'>
                                <Form.Field>
                                    <label style={{ fontSize: '0.9em', textTransform: 'uppercase', marginBottom: '5px' }}>Add a Speaker</label>
                                    <Input  type='text' name='newSpeakerName' action={{ type: 'submit', content: 'Add a Speaker', icon: 'add', primary: true }} value={values.newSpeakerName} onChange={handleChange} onBlur={handleBlur} fluid primary style={{ margin: '5px 0 0 0'}} disabled={isSubmitting || additionalSpeakers.length > 3} placeholder="Enter the name of the speaker you want to invite"/>
                                    <div className='field-error' style={{ color: 'red', fontSize: '0.8em', margin: '10px 0'}}>
                                        {errors.newSpeakerName && touched.newSpeakerName && errors.newSpeakerName}
                                    </div>
                                </Form.Field>
                            </Form>
                            )}
                    </Formik>
                </div>
            </Modal.Content>
        </Modal>
    );
}

export default withFirebase(SpeakerManagementModal);