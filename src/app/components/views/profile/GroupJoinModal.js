import { Fragment, useState, useEffect } from 'react'
import { Button, Image, Grid, Modal } from 'semantic-ui-react';

import { withFirebase } from '../../../data/firebase';
import UserCategorySelector from './UserCategorySelector';

const GroupJoinModal = (props) => {

    const [categories, setCategories] = useState([]);
    const [categoriesWithElements, setCategoriesWithElements] = useState([]);

    useEffect(() => {
        if (props.open) {
            props.firebase.getGroupCategories(props.group.id).then(querySnapshot => {
                let categories = [];
                querySnapshot.forEach( doc => {
                    let category = doc.data();
                    category.id = doc.id;
                    categories.push(category);
                });
                setCategories(categories);
            })
        }
    },[props.open]);

    useEffect(() => {
        if (categories && categories.length > 0) {
            let categoriesWithElements = [];
            categories.forEach((category, index) => {
                props.firebase.getGroupCategoryElements(props.group.id, category.id).then(querySnapshot => {
                    let elements = [];
                    querySnapshot.forEach( doc => {
                        let element = doc.data();
                        element.id = doc.id;
                        elements.push(element);
                    });
                    category.elements = elements;
                    categoriesWithElements.push(category);
                    if (index + 1 === categories.length) {
                        setCategoriesWithElements(categoriesWithElements);
                    }
                });
            });
        }
    },[categories]);

    function setCategoryValue(categoryId, valueId) {
        let updatedCategories = [];
        categoriesWithElements.forEach( category => {
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
        setCategoriesWithElements(updatedCategories);
    }

    let categorySelectors = categoriesWithElements.map( category => {
        return (
            <Grid.Column key={ category.id } width={8}>
                <div style={{ margin: '15px 0' }}>   
                    <UserCategorySelector userData={props.userData} group={props.group} category={category} updateValue={(valueId) => setCategoryValue(category.id, valueId)}/>
                </div>
            </Grid.Column>     
        )
    });
    
    return (
        <Fragment>
            <Modal open={props.open}>
                <Modal.Header>
                    Join this group
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

export default withFirebase(GroupJoinModal);