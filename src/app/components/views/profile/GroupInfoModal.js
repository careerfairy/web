import { useEffect, useState, Fragment } from 'react'
import { Container, Header as SemanticHeader, Button, Dropdown, Form, Image, Grid, Modal } from 'semantic-ui-react';
import { Formik } from 'formik';
import { useRouter } from 'next/router';

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
        <style jsx>{`
            
        `}</style>
        </Fragment>
    );
};

export default withFirebase(GroupInfoModal);