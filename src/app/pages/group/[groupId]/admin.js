import React, {useEffect, useState} from 'react'
import {Container, Button, Image, Menu} from 'semantic-ui-react';
import {useRouter} from 'next/router';
import {withFirebase} from '../../../data/firebase';
import Header from '../../../components/views/header/Header';
import Head from 'next/head';
import Footer from '../../../components/views/footer/Footer';
import Events from '../../../components/views/group/admin/events/Events';
import Settings from '../../../components/views/group/admin/settings/Settings';
import Members from '../../../components/views/group/admin/members/Members';
import AdminHeader from "../../../components/views/group/admin/AdminHeader";


const JoinGroup = (props) => {


    const router = useRouter();
    const groupId = router.query.groupId;
    console.log("groupId", groupId)

    const [user, setUser] = useState(null);

    const [userData, setUserData] = useState(null);


    const [group, setGroup] = useState({});


    const [menuItem, setMenuItem] = useState("settings")

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
        if (groupId) {
            const unsubscribe = props.firebase.listenToCareerCenterById(groupId, querySnapshot => {
                let careerCenter = querySnapshot.data();
                careerCenter.id = querySnapshot.id;
                setGroup(careerCenter);
            })
        return () => unsubscribe()
        }
    }, [groupId]);


    return (
        <div className='greyBackground'>
            <Head>
                <title key="title">CareerFairy | Join Groups</title>
            </Head>
            <Header classElement='relative white-background'/>
            <Container style={{padding: '30px 0'}} textAlign='center'>
                <AdminHeader group={group} menuItem={menuItem}/>
                <Menu style={{textAlign: 'center', margin: '0 0 20px 0'}} compact secondary>
                    <Menu.Item
                        name="events"
                        active={menuItem === "events"}
                        onClick={() => {
                            setMenuItem("events")
                        }}
                    >
                        Live Streams
                    </Menu.Item>
                    <Menu.Item
                        name="members"
                        active={menuItem === "members"}
                        onClick={() => {
                            setMenuItem("members")
                        }}
                    >
                        Members
                    </Menu.Item>
                    <Menu.Item
                        name="settings"
                        active={menuItem === "settings"}
                        onClick={() => {
                            setMenuItem("settings")
                        }}
                    >
                        Settings
                    </Menu.Item>
                </Menu>
                <div className={menuItem === "events" ? '' : 'hidden'}>
                    <Events groupId={groupId} user={user} userData={userData} menuItem={menuItem}/>
                </div>
                <div className={menuItem === "members" ? '' : 'hidden'}>
                    <Members groupId={groupId}/>
                </div>
                <div className={menuItem === "settings" ? '' : 'hidden'}>
                    <Settings group={group} groupId={groupId}/>
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
                    
                    .title-container {
                      display: flex;
                      align-items: center;
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
                    
                    .sublabel {
                        margin: 40px 0 15px 0;
                        text-align: center;
                    }

                    #profileContainer {
                        padding: 30px 0;
                    }
                `}</style>
        </div>
    );
};

export default withFirebase(JoinGroup);