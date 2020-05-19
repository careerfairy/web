import { useEffect, useState, Fragment } from 'react'
import { Container, Header as SemanticHeader, Button, Dropdown, Form, Image, Grid, Modal } from 'semantic-ui-react';

import { withFirebase } from '../../../data/firebase';

const UserCategorySelector = (props) => {

    const [currentSelection, setCurrentSelection] = useState([]);

    useEffect(() => {
        props.firebase.listenToUserGroupCategoryValue(props.userData.userEmail, props.group.id, props.category.id, querySnapshot => {
            setCurrentSelection(querySnapshot.data().value);
            console.log(querySnapshot.data().value);
        })
    },[props.category]);

    function updateUserCategory(value) {
        props.firebase.updateUserGroupCategoryValue(props.userData.userEmail, props.group.id, props.category.id, value);
    }   

    return (
        <div>
            <label style={{ marginBottom: '10px', textTransform: "uppercase", fontSize: '0.8em', fontWeight: '700', color: 'rgb(0, 210, 170)'}}>{ props.category.name }</label>
            <Dropdown value={currentSelection} onChange={(event, {value}) => { updateUserCategory(value) }} options={props.category.elements.map( element => { return { text: element.name, value: element.id }; })} selection fluid/>
        </div>
    )
};

export default withFirebase(UserCategorySelector);