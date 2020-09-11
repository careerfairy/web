import React, {Fragment } from 'react'
import { Button, Image, Grid, Modal } from 'semantic-ui-react';


import { withFirebase } from 'data/firebase';
import UserCategorySelector from 'UserCategorySelector';

const GroupInfoModal = (props) => {

    let categorySelectors = props.categoriesWithElements.map( category => {
        return (
            <Grid.Column key={ category.id } width={8}>
                <div style={{ margin: '15px 0' }}>   
                    <UserCategorySelector userData={props.userData} group={props.group} category={category}/>
                </div>
            </Grid.Column>     
        )
    });
    
    return (
        <Fragment>
            <Modal open={props.open}>
                <Modal.Header>
                    Update group
                </Modal.Header>
                <Modal.Content>
                    <Image src={props.group.logoUrl} style={{ maxWidth: '200px', margin: '0 auto', maxHeight: '100px' }}/>
                    { categorySelectors }
                    <Button content='Confirm' primary fluid onClick={props.closeModal}/>
                </Modal.Content>
            </Modal>
        </Fragment>
    );
};

export default withFirebase(GroupInfoModal);