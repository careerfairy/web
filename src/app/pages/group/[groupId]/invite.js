import { useEffect, useState } from 'react'
import { Container, Button, Image, Menu, Grid } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import { withFirebase } from '../../../context/firebase';
import Header from '../../../components/views/header/Header';
import Loader from '../../../components/views/loader/Loader';

import Head from 'next/head';
import Footer from '../../../components/views/footer/Footer';
import CategoryElement from '../../../components/views/group/admin/settings/Category/CategoryElement';
import Events from '../../../components/views/group/admin/events/Events';
import Settings from '../../../components/views/group/admin/settings/Settings';
import Members from '../../../components/views/group/admin/members/Members';

const GroupInvite = (props) => {
    
    const router = useRouter();
    const groupId = router.query.groupId;

    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);

    const [group, setGroup] = useState([]);
    const [menuItem, setMenuItem] = useState("events")

    useEffect(() => {
        if (groupId) {
            props.firebase.auth.onAuthStateChanged(user => {
                if (user) {
                    router.push('/group/' + groupId );
                }  
            })
        }
    }, [groupId]);

    useEffect(() => {
        if (groupId) {
            props.firebase.getCareerCenterById(groupId).then(querySnapshot => {
                let careerCenter = querySnapshot.data();
                careerCenter.id = querySnapshot.id;
                setGroup(careerCenter);
            });
        }        
    }, [groupId]);

    return (
            <div className='greyBackground'>
                <Head>
                <title key="title">CareerFairy | You're invited to join { group.universityName }</title>
                </Head>
                <Header classElement='relative white-background'/>
                <Container style={{ padding: '30px 0'}} textAlign='center'>
                    <Grid>
                        <Grid.Column width={6}>
                            <div className='image-outer-container'>
                                <div className='image-container'>
                                    <Image style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', margin: '0 auto 50px auto', maxHeight: '40%', maxWidth: '70%'}} src={group.logoUrl}/>
                                </div>
                            </div>
                        </Grid.Column>
                        <Grid.Column width={10} textAlign='left'>
                            <h1 className='group-name-label'>You have been invited to&nbsp;join</h1>
                            <h1 className='group-name'>{ group.universityName }</h1>
                        </Grid.Column>
                    </Grid>  
                    <div className='auth-selector'>
                        <Button content='Log in' size='huge' icon='sign-in' secondary onClick={() => router.push('/signup')}/>    
                        <div className='auth-selector-divider'>Or</div>
                        <Button content='Sign up' size='huge' icon='edit outline' primary onClick={() => router.push('/login')}/>
                    </div>
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

                    .white-box {
                        padding: 10px;
                        margin: 10px 0 10px 0;
                        text-align: left;
                    }

                    .image-outer-container {
                        max-width: 120px;
                        margin: 0 auto;
                    }

                    .image-container {
                        position: relative;
                        width: 100%;
                        padding-top: 95%;
                        border-radius: 50%;
                        border: 5px solid rgb(0, 210, 170);
                        background-color: white;
                        margin: 0 auto;
                        box-shadow: 0 0 5px rgb(200,200,200);
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

                    .group-name {
                        margin: 5px 0;
                        font-weight: 500;
                        font-size: calc(1.1em + 2vw);
                        color: rgb(0, 210, 170);
                        text-shado
                    }

                    .group-name-label {
                        margin: 5px 0;
                        font-weight: 500;
                        font-size: calc(1.1em + 1.3vw);
                        color: rgb(80,80,80);
                        text-shado
                    }

                    .sublabel {
                        margin: 40px 0 15px 0;
                        text-align: center;
                    }

                    .auth-selector {
                        padding: 50px;
                    }

                    .auth-selector-divider {
                        padding: 20px 0;
                    }

                    #profileContainer {
                        padding: 30px 0;
                    }
                `}</style>
            </div>
    );
};

export default withFirebase(GroupInvite);