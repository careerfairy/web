import {Fragment, useState} from 'react'
import { Icon, Button, Modal, Header } from "semantic-ui-react";


function ButtonWithConfirm(props) {

    const [modalOpen, setModalOpen] = useState(false);

    function performConfirmAction() {
        props.buttonAction();
        setModalOpen(false);
    }

    return (
        <Fragment>
            <Button id={props.elementId} size='big' color='teal' onClick={() => setModalOpen(true)}>{ props.buttonLabel }</Button>
            <Modal open={modalOpen} onClose={() => setModalOpen(false)} centered={false}>
                <Modal.Content>
                    <Header>Just making sure</Header>
                    <Modal.Description>
                        <p>{props.confirmDescription}</p>
                    </Modal.Description>
                </Modal.Content>
                <Modal.Actions>
                    <Button basic color='grey' onClick={() => setModalOpen(false)}>
                        <Icon name='remove' /> Cancel
                    </Button>
                    <Button color='teal' onClick={performConfirmAction}>
                        <Icon name='checkmark'/> Confirm
                    </Button>
                </Modal.Actions>
            </Modal>
        </Fragment>
    );
}

export default ButtonWithConfirm;