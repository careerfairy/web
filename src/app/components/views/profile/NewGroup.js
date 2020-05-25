import { useEffect, useState, Fragment } from 'react'
import { Container, Header as SemanticHeader, Button, Dropdown, Form, Image, Grid } from 'semantic-ui-react';
import { Formik } from 'formik';
import { useRouter } from 'next/router';

import { withFirebase } from '../../../data/firebase';
import GroupJoinModal from './GroupJoinModal';

const NewGroup = (props) => {

    const [openJoinModal, setOpenJoinModal] = useState(false);
    const router = useRouter();

    function joinGroup(group) {
        props.firebase.joinGroup(props.userData.userEmail, props.group.id, props.categories);
    }

    return (               
        <Fragment key={props.group.id}>
            <Grid.Column width={4}>
                <div className='group-selector'>
                    <Image src={props.group.logoUrl} style={{ position: 'absolute', top: '35%', left: '50%', transform: 'translate(-50%, -50%)', maxWidth: '60%', maxHeight: '85px'}}/>
                    <div style={{ position: 'absolute', top: '65%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', textAlign: 'center', fontWeight: '500', color: 'rgb(80,80,80)'}}>{props.group.description}</div>
                    <Button content='Join' icon='add' style={{ position: 'absolute', left: '50%', bottom: '12px', width: '90%', transform: 'translateX(-50%)'}} onClick={() => setOpenJoinModal(true)} primary basic/>
                </div>
                <GroupJoinModal userData={props.userData} group={props.group} open={openJoinModal} closeModal={() => setOpenJoinModal(false)}/>
            </Grid.Column>
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

export default withFirebase(NewGroup);