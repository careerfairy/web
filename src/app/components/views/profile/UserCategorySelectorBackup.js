import {useEffect, useState, Fragment} from 'react'
import {Container, Header as SemanticHeader, Button, Dropdown, Form, Image, Grid, Modal} from 'semantic-ui-react';

import {withFirebase} from 'data/firebase';

const UserCategorySelector = (props) => {

    const [hasError, setHasError] = useState(false);
    const [value, setValue] = useState(null);

    useEffect(() => {
        if (props.categoriesWithElements && props.checkError > 0) {
            let category = props.categoriesWithElements.find(category => category.id === props.category.id);
            let selectedElement = category.elements.find(element => element.selected === true);
            if (!selectedElement) {
                setHasError(true);
            }
        }
    }, [props.checkError]);

    useEffect(() => {
        props.firebase.listenToUserGroupCategoryValue(props.userData.userEmail, props.groupId, props.category.id, querySnapshot => {
            let currentElement = querySnapshot.data();
            if (currentElement) {
                props.updateValue(currentElement.value);
            }
        })
    }, [props.category]);

    useEffect(() => {
        debugger;
        if (props.categoriesWithElements) {
            let category = props.categoriesWithElements.find(category => category.id === props.category.id);
            let selectedElement = category.elements.find(element => element.selected === true);
            if (selectedElement) {
                setValue(selectedElement.id);
            }
        }
    }, [props.categoriesWithElements]);

    return (
        <Fragment>
            <div style={{textAlign: 'center'}}>
                <label style={{
                    display: 'block',
                    marginBottom: '10px',
                    textTransform: "uppercase",
                    fontSize: '0.9em',
                    fontWeight: '700',
                    color: 'rgb(100,100,100)'
                }}>{props.category.name}</label>
                <Dropdown value={value} error={hasError} size='big' onChange={(event, {value}) => {
                    props.updateValue(value)
                }} options={props.category.elements.map(element => {
                    return {text: element.name, value: element.id};
                })} selection fluid/>
                <div className={hasError ? '' : 'hidden'}
                     style={{textAlign: 'left', margin: '5px 0', color: 'red'}}>Please select a value
                </div>
            </div>
            <style jsx>{`
                .hidden {
                    display: none;
                }
            `}</style>
        </Fragment>
    )
};

export default withFirebase(UserCategorySelector);