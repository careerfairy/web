import { useEffect, useState, Fragment } from 'react'
import { Container, Header as SemanticHeader, Button, Dropdown, Form, Menu, Grid } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import { withFirebase } from '../data/firebase';
import Header from '../components/views/header/Header';
import Loader from '../components/views/loader/Loader';

import Head from 'next/head';
import NewGroup from '../components/views/profile/NewGroup';
import Footer from '../components/views/footer/Footer';

const JoinGroup = (props) => {

    const router = useRouter();
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(false);

    const [groups, setGroups] = useState([]);

    useEffect(() => {
        props.firebase.auth.onAuthStateChanged(user => {
            if (user) {
                setUser(user);
            }  else {
                router.replace('/login');
            }
        })
    }, []);

    useEffect(() => {
        setLoading(true);
        if (user) {
            props.firebase.getUserData(user.email)
            .then(querySnapshot => {
                setLoading(false);
                let user = querySnapshot.data();
                if (user) {
                    setUserData(user);
                }
            }).catch(error => {
                setLoading(false);
                console.log(error);
            });
        }
    },[user]);

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

    if (user === null || userData === null ||loading === true) {
        return <Loader/>;
    }

    let moreGroupElements = [];

    moreGroupElements = groups.filter(group => !userData.groupIds || userData.groupIds.indexOf(group.id) == -1).map(group => {
        return <NewGroup group={group} userData={userData} key={group.id} />
    });

    return (
            <div className='greyBackground'>
                <Head>
                    <title key="title">CareerFairy | Join Groups</title>
                </Head>
                <Header classElement='relative white-background'/>
                <Container textAlign='left' style={{ margin: '50px 0' }}>
                    <h1 className='join-group-title'>Join A New Career Group</h1>
                    <Grid stackable columns='3'>
                        { moreGroupElements }
                    </Grid>
                </Container>
                <Footer/>
                <style jsx>{`
                    .hidden {
                        display: none;
                    }

                    .greyBackground {
                        background-color: rgb(250,250,250);
                        height: 100%;
                        min-height: 100vh;
                    }

                    .field-error {
                        margin-top: 10px;
                        color: red;
                    }

                    .join-group-title {
                        text-align: left;
                        margin: 0 0 30px 0;
                        font-weight: 700;
                        font-size: 1.3em;
                        color: rgb(80,80,80);
                    }

                    #profileContainer {
                        padding: 30px 0;
                    }
                `}</style>
            </div>
    );
};

export default withFirebase(JoinGroup);