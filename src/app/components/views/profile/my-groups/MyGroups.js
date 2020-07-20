import { useEffect, useState, Fragment } from 'react'
import { Container, Header as SemanticHeader, Button, Dropdown, Form, Menu, Grid } from 'semantic-ui-react';
import { Formik } from 'formik';
import { useRouter } from 'next/router';
import { withFirebase } from '../../../../data/firebase';

import Head from 'next/head';
import UserUtil from '../../../../data/util/UserUtil';
import CurrentGroup from '../CurrentGroup';
import NewGroup from '../NewGroup';

const UserProfile = (props) => {

    const router = useRouter();

    const [groups, setGroups] = useState([]);

    useEffect(() => {
        props.firebase.getCareerCenters().then(querySnapshot => {
            let careerCenters = [];
            querySnapshot.forEach(doc => {
                let careerCenter = doc.data();
                careerCenter.id = doc.id;
                careerCenters.push(careerCenter);
            })
            setGroups(careerCenters);
        });
    }, []);

    let existingGroupElements = [];

    if (props.userData && props.userData.groupIds) {
        existingGroupElements = groups.filter(group => props.userData.groupIds.indexOf(group.id) > -1).map(group => {
            return <CurrentGroup group={group} userData={props.userData} key={group.id}/>
        });
    }

    return (
        <Fragment>
            <h3 style={{ color: 'rgb(160,160,160)', margin: '0 0 10px 0', fontWeight: '300' }}>My Groups</h3>
            <Grid style={{ padding: '20px 0 0 0' }} stackable>
                {existingGroupElements}
            </Grid>
            <div className={ existingGroupElements.length > 0 ? 'hidden' : ''} style={{ margin: '30px 0', fontSize: '1.1em' }}>
                You are currently not a member of any career group.
            </div>
            <style jsx>{`
                    .hidden {
                        display: none;
                    }

                    .greyBackground {
                        background-color: rgb(250,250,250);
                        height: 100%;
                    }

                    .field-error {
                        margin-top: 10px;
                        color: red;
                    }

                    #profileContainer {
                        padding: '30px 0'
                    }
                `}</style>
        </Fragment>
    );
};

export default withFirebase(UserProfile);