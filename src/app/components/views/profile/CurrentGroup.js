import { useEffect, useState, Fragment } from 'react'
import { Container, Header as SemanticHeader, Button, Dropdown, Form, Image, Grid } from 'semantic-ui-react';
import { Formik } from 'formik';
import { useRouter } from 'next/router';

import { withFirebase } from '../../../data/firebase';
import GroupInfoModal from './GroupInfoModal';

const CurrentGroup = (props) => {

    const [userCategories, setUserCategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [categoriesWithElements, setCategoriesWithElements] = useState([]);

    const [openUpdateModal, setOpenUpdateModal] = useState(false);

    useEffect(() => {
        if (props.userData) {
            props.firebase.listenToUserGroupCategories(props.userData.userEmail, props.group.id, querySnapshot => {
                let userCategories = [];
                querySnapshot.forEach( doc => {
                    let category = doc.data();
                    category.id = doc.id;
                    userCategories.push(category);
                });
                setUserCategories(userCategories);
            })
        } 
    },[props.userData]);

    useEffect(() => {
        props.firebase.getGroupCategories(props.group.id).then(querySnapshot => {
            let categories = [];
            querySnapshot.forEach( doc => {
                let category = doc.data();
                category.id = doc.id;
                categories.push(category);
            });
            setCategories(categories);
        })
    },[]);

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

    let categorySelectors = categoriesWithElements.map( category => {
        let usersCategory = userCategories.find( userCategory => {
            return userCategory.categoryId === category.id;
        });
        let value = category.elements.find( element => {
            return element.id === usersCategory.value;
        })
        return (
            <Grid.Column key={ category.id } width={8}>
                <div style={{ margin: '15px 0' }}>   
                    <label style={{ marginBottom: '10px', textTransform: "uppercase", fontSize: '0.8em', fontWeight: '700', color: 'rgb(0, 210, 170)'}}>{ category.name }</label>
                    <div style={{ fontSize: '1.2em'}}>{ value.name }</div>
                </div>
            </Grid.Column>     
        )
    });

    return (
            <Fragment key={props.group.id}>
                <Grid.Column width={8}>
                    <div className='group-selector'>
                        <Grid className='middle aligned' stackable>
                            <Grid.Column width={8}>
                                <Image src={props.group.logoUrl} style={{ maxHeight: '80px'}}/>
                            </Grid.Column>
                            <Grid.Column width={8}>
                                <div style={{  fontWeight: '500', color: 'rgb(80,80,80)'}}>{props.group.description}</div>
                            </Grid.Column>
                        </Grid>
                        <Grid>
                            { categorySelectors }
                        </Grid>
                        <Button.Group style={{ position: 'absolute', left: '50%', bottom: '25px', width: '90%', transform: 'translateX(-50%)'}}>
                            <Button icon='calendar alternate outline' content='View Calendar'primary/>
                        </Button.Group>
                        <Dropdown item icon={{name: 'ellipsis vertical', size: 'large', color: 'grey'}} style={{ position: 'absolute', right: '10px', top: '20px'}}>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => setOpenUpdateModal(true)}>Update my data</Dropdown.Item>
                                <Dropdown.Item>Leave group</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                    <GroupInfoModal userData={props.userData} group={props.group} categoriesWithElements={categoriesWithElements} userCategories={userCategories} open={openUpdateModal} closeModal={() => setOpenUpdateModal(false)}/>
                </Grid.Column>
            <style jsx>{`
                .group-selector {
                    position: relative;
                    border-radius: 15px;
                    background-color: white;
                    box-shadow: 0 0 2px lightgrey;
                    padding: 30px 30px 100px 30px;
                }
            `}</style>
            </Fragment>
    );
};

export default withFirebase(CurrentGroup);