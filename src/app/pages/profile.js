import { useEffect, useState, Fragment } from 'react'
import { Container, Header as SemanticHeader, Button, Dropdown, Form, Menu, Grid } from 'semantic-ui-react';
import { Formik } from 'formik';
import { useRouter } from 'next/router';

import { UNIVERSITY_SUBJECTS } from '../data/StudyFieldData';
import { UNIVERSITY_SPECIFIC_SUBJECTS } from '../data/UniversitySpecificFieldsData';
import { UNIVERSITY_NAMES } from '../data/UniversityData';
import { STUDY_LEVELS } from '../data/StudyLevelData';
import { withFirebase } from '../data/firebase';
import Header from '../components/views/header/Header';
import Loader from '../components/views/loader/Loader';

import Head from 'next/head';
import UserUtil from '../data/util/UserUtil';
import NewGroup from '../components/views/profile/NewGroup';
import CurrentGroup from '../components/views/profile/CurrentGroup';
import PersonalInfo from '../components/views/profile/personal-info/PersonalInfo';
import MyGroups from '../components/views/profile/my-groups/MyGroups';

const UserProfile = (props) => {

    const router = useRouter();

    const [loading, setLoading] = useState(false)
    const [userData, setUserData] = useState(null)
    const [user, setUser] = useState(null);

    const [state, setState] = useState('personal');

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

    if (user === null || userData == null || loading === true) {
        return <Loader/>;
    }

    return (
            <div className='greyBackground'>
                <Head>
                    <title key="title">CareerFairy | My Profile</title>
                </Head>
                <Header classElement='relative white-background'/>
                <Container textAlign='left'>
                    <h3 style={{ color: 'rgb(80,80,80)', margin: '30px 0 20px 0' }}>{ userData ? 'Your Profile' : 'Complete Your Profile'}</h3>
                    <h3 style={{ color: 'rgb(150,150,150)', margin: '20px 0 40px 0' }} className={userData ? 'hidden' : ''}>so we can show you the jobs and speakers that matter most to you</h3>
                    <Menu tabular>
                        <Menu.Item
                        name='My Groups'
                        active={ state === 'groups' }
                        onClick={() => setState('groups')}
                        style={{ backgroundColor: 'rgb(250,250,250)'}}
                        />
                        <Menu.Item
                        name='Personal Information'
                        active={state === 'personal'}
                        onClick={() => setState('personal')}
                        style={{ backgroundColor: 'rgb(250,250,250)'}}
                        />
                    </Menu>
                    <div className={ state === 'personal' ? '' : 'hidden' }>
                        <PersonalInfo userData={userData}/>
                    </div>
                    <div className={ state === 'groups' ? '' : 'hidden'} >
                        <MyGroups userData={userData}/>
                    </div>
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