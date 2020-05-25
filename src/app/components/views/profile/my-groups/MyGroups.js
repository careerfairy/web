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

    let moreGroupElements = [];
    let existingGroupElements = [];

    if (props.userData && props.userData.groupIds) {
        existingGroupElements = groups.filter(group => props.userData.groupIds.indexOf(group.id) > -1).map(group => {
            return <CurrentGroup group={group} userData={props.userData} key={group.id}/>
        });
        moreGroupElements = groups.filter(group => props.userData.groupIds.indexOf(group.id) == -1).map(group => {
            return <NewGroup group={group} userData={props.userData} key={group.id} />
        });
    } else {
        moreGroupElements = groups.map(group => {
            return <NewGroup group={group} userData={props.userData} key={group.id} />
        });
    }
    return (
        <Fragment>
            <h3 style={{ color: 'rgb(80,80,80)', margin: '50px 0 10px 0' }}>My Groups</h3>
            <Grid style={{ padding: '20px 0 0 0' }} stackable>
                {existingGroupElements}
            </Grid>
            <h3 style={{ color: 'rgb(80,80,80)', margin: '50px 0 10px 0' }}>Join New Groups</h3>
            <Grid style={{ padding: '20px 0 120px 0' }} stackable>
                {moreGroupElements}
            </Grid>
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