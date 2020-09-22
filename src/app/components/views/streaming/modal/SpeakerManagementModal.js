import React, {useState, useEffect} from 'react';

import { withFirebase } from '../../../../context/firebase';
import { Modal, Input, Icon, Button, Form } from 'semantic-ui-react';

function SpeakerManagementModal(props) {

    const link = `https://testing.careerfairy.io/streaming/${props.livestreamId}/joining-streamer?pwd=qdhwuiehd7qw789d79w8e8dheiuhiqwdu`;

    return (
        <Modal open={props.open} onClose={() => props.setOpen(false)}>
            <Modal.Header><Icon name='user plus' color='darkgrey' size='large' style={{ marginRight: '20px'}}/>Invite additional speakers</Modal.Header>
            <Modal.Content>
                <p style={{ fontSize: '0.9em', margin: '0 0 20px 0' }}>You can invite up to 6 speakers to join your stream. You should do this before starting your stream, to ensure that all streamer have joined before the event starts. When an invited speaker has successfully joined, you will be able to see and hear him/her in the stream overview.</p>
                <div style={{ margin: '0 0 30px 0', border: '2px solid rgb(0, 210, 170)', padding: '20px', borderRadius: '10px', backgroundColor: 'rgb(252,252,252)', boxShadow: '0 0 2px grey' }} className='animated fadeIn'>
                    <Input type='text' value={link} readOnly style={{ margin: '0 0 5px 0', color: 'red', cursor: 'text'}} fluid />
                    <p style={{ marginBottom: '10px', color: 'rgb(80,80,80)', fontSize: '0.8em'}}>Please send this link to all individuals who should join your live stream.</p>
                </div>
            </Modal.Content>
            <Modal.Actions>
                <Button
                    content="OK"
                    icon='checkmark'
                    onClick={() => props.setOpen(false)}
                    primary
                />
            </Modal.Actions>
        </Modal>
    );
}

export default withFirebase(SpeakerManagementModal);