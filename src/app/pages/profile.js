import {useEffect, useState, Fragment} from 'react'
import {Container, Header as SemanticHeader, Button, Dropdown, Form, Menu, Grid} from 'semantic-ui-react';
import {useRouter} from 'next/router';
import {withFirebase} from '../data/firebase';
import Header from '../components/views/header/Header';
import Loader from '../components/views/loader/Loader';

import Head from 'next/head';
import PersonalInfo from '../components/views/profile/personal-info/PersonalInfo';
import MyGroups from '../components/views/profile/my-groups/MyGroups';

const UserProfile = (props) => {

    const router = useRouter();

    const [loading, setLoading] = useState(false)
    const [userData, setUserData] = useState(null)
    const [user, setUser] = useState(null);

    const [state, setState] = useState('groups');

    useEffect(() => {
        props.firebase.auth.onAuthStateChanged(user => {
            if (user) {
                setUser(user);
            } else {
                router.replace('/login');
            }
        })
    }, []);

    useEffect(() => {
        setLoading(true);
        if (user) {
            props.firebase.listenToUserData(user.email, querySnapshot => {
                setLoading(false);
                let user = querySnapshot.data();
                user.id = querySnapshot.id;
                if (user) {
                    setUserData(user);
                }
            })
        }
    }, [user]);

    if (user === null || userData == null || loading === true) {
        return <Loader/>;
    }

    return (
        <div className='greyBackground'>
            <Head>
                <title key="title">CareerFairy | My Profile</title>
            </Head>
            <Header classElement='relative white-background'/>
            <Container textAlign='left' style={{marginTop: '50px'}}>
                <Grid stackable>
                    <Grid.Column width='4'>
                        <h3 style={{
                            color: 'rgb(80,80,80)',
                            margin: '0 0 20px 0',
                            fontWeight: '300',
                            fontSize: '1.7em'
                        }}>{userData ? 'My Profile' : 'Complete My Profile'}</h3>
                        <Menu vertical>
                            <Menu.Item
                                name='Personal Information'
                                active={state === 'personal'}
                                onClick={() => setState('personal')}
                            />
                            <Menu.Item
                                name='My Groups'
                                active={state === 'groups'}
                                onClick={() => setState('groups')}
                            />
                        </Menu>
                    </Grid.Column>
                    <Grid.Column width='12'>
                        <div className={state === 'personal' ? '' : 'hidden'}>
                            <PersonalInfo userData={userData}/>
                        </div>
                        <div className={state === 'groups' ? '' : 'hidden'}>
                            <MyGroups userData={userData}/>
                        </div>
                    </Grid.Column>
                </Grid>
            </Container>
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

                    #profileContainer {
                        padding: '30px 0'
                    }
                `}</style>
        </div>
    );
};

export default withFirebase(UserProfile);