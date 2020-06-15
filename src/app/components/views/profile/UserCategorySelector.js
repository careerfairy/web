import { useEffect, useState, Fragment } from 'react'
import { Container, Header as SemanticHeader, Button, Dropdown, Form, Image, Grid, Modal } from 'semantic-ui-react';

import { withFirebase } from '../../../data/firebase';

const UserCategorySelector = (props) => {

    useEffect(() => {
        props.firebase.listenToUserGroupCategoryValue(props.userData.userEmail, props.group.id, props.category.id, querySnapshot => {
            let currentElement = querySnapshot.data();
            if (currentElement) {
                props.updateValue(currentElement.value);
            }
        })
    },[props.category]);

    function getCategoryCurrentValue() {
        if (props.categoriesWithElements) {
            let category = props.categoriesWithElements.find( category => category.id === props.category.id );
            let selectedElement = category.elements.find( element => element.selected === true );
            return selectedElement ? selectedElement.id : null;
        }
    }

    return (
        <div style={{ textAlign: 'center' }}>
            <label style={{ display: 'block', marginBottom: '10px', textTransform: "uppercase", fontSize: '0.8em', fontWeight: '700', color: 'rgb(0, 210, 170)'}}>{ props.category.name }</label>
            <Dropdown value={getCategoryCurrentValue()} style={{ width: '80%' }} onChange={(event, {value}) => { props.updateValue(value) }} options={props.category.elements.map( element => { return { text: element.name, value: element.id }; })} selection/>
        </div>
    )
};

export default withFirebase(UserCategorySelector);