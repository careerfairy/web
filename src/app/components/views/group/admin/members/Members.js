import { Fragment, useState, useEffect } from 'react';
import { Grid, Image, Button, Icon, Modal, Step, Input, Checkbox } from 'semantic-ui-react';
import { withFirebase } from 'data/firebase';

const Members = (props) => {

    const [modalOpened, setModalOpened] = useState(false);
    return(
        <Fragment>
            <div style={{ width: '100%', textAlign: 'left', margin: '0 0 20px 0'}}>
                <h3 className='sublabel'>Your Members</h3>
                <Button content='Invite Members' size='large' icon='add' primary style={{ float: 'right', verticalAlign: 'middle'}} onClick={() => setModalOpened(true) }/>       
            </div>
            <div style={{ padding: '150px 0'}}>
                <div>
                    You don't have any members yet.
                </div>      
            </div>
            <Modal open={modalOpened} onClose={() => setModalOpened(false) }>
                <Modal.Header>Invite members</Modal.Header>
                <Modal.Content>
                    Invite members by sending them the following link: <a href={'https://careerfairy.io/group/' + props.groupId}>{'https://careerfairy.io/group/' + props.groupId}</a> 
                </Modal.Content>
            </Modal>
            <style jsx>{`
                .hidden {
                    display: none;
                }
                
                .white-box {
                    background-color: white;
                    box-shadow: 0 0 5px rgb(190,190,190);
                    border-radius: 5px;
                    padding: 20px;
                    margin: 10px;
                    text-align: left;
                }

                .white-box-label {
                    font-size: 0.8em;
                    font-weight: 700;
                    color: rgb(160,160,160);
                    margin: 5px 0 5px 0; 
                }

                .white-box-title {
                    font-size: 1.2em;
                    font-weight: 700;
                    color: rgb(80,80,80);
                }

                .sublabel {
                    text-align: left;
                    display: inline-block;
                    vertical-align: middle;
                    margin: 9px 0;
                    color: rgb(80,80,80);
                }
            `}</style>
        </Fragment>
    );
}

export default withFirebase(Members);