import { Fragment, useState, useEffect } from 'react'
import { Button, Image, Grid, Modal } from 'semantic-ui-react';

import { withFirebase } from 'data/firebase';
import UserCategorySelector from 'components/views/profile/UserCategorySelector';

const GroupJoinModal = ({group, firebase, open, userData, closeModal}) => {

    const [categories, setCategories] = useState([]);

    useEffect(() => {
        if(group) {
            setCategories(group.categories)
        }
    }, [group])



    function setCategoryValue(categoryId, valueId) {
        let updatedCategories = [];
        categories.forEach( category => {
            if (category.id === categoryId) {
                let elements = [];
                category.elements.forEach( element => {
                    if (element.id === valueId) {
                        element.selected = true;
                    } else {
                        element.selected = false;
                    }
                    elements.push(element);
                });
                category.elements = elements;
            }
            updatedCategories.push(category);
        });
        setCategories(updatedCategories);
    }

    let categorySelectors = categories.map( category => {
        return (
            <Grid.Column key={ category.id } width={8}>
                <div style={{ margin: '15px 0', textAlign: 'left' }}>
                    <UserCategorySelector userData={userData} group={group} category={category} updateValue={(valueId) => setCategoryValue(category.id, valueId)}/>
                </div>
            </Grid.Column>
        )
    });

    return (
        <Fragment>
            <Modal open={open} style={{ textAlign: 'center'}} onClose={closeModal}>
                <Modal.Content>
                    <h5 className={'header'}>Follow live streams from</h5>
                    <div style={{ position: 'relative', minHeight: '150px'}}>
                        <Image src={group.logoUrl} style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', maxWidth: '250px', width: '35%', maxHeight: '150px' }}/>
                    </div>
                    { categorySelectors }
                    <Button content='Join' fluid icon='add' primary size='large' style={{ marginTop: '40px' }} onClick={closeModal}/>
                    <Button content='Cancel' fluid size='small' primary basic style={{ marginTop: '10px' }} onClick={closeModal}/>
                </Modal.Content>
            </Modal>
        <style jsx>{`
            .header {
                text-align: center;
                margin-bottom: 40px;
                color: rgb(140,140,140);
                text-transform: uppercase;
            }
        `}</style>
        </Fragment>
    );
};

export default withFirebase(GroupJoinModal);