import React, {useEffect, useState} from 'react'
import {Container, Button, Image, Menu} from 'semantic-ui-react';
import {useRouter} from 'next/router';
import {withFirebase} from '../../../data/firebase';
import Header from '../../../components/views/header/Header';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import Loader from '../../../components/views/loader/Loader';


import Head from 'next/head';
import Footer from '../../../components/views/footer/Footer';
import CategoryElement from '../../../components/views/group/admin/CategoryElement';
import Events from '../../../components/views/group/admin/events/Events';
import Settings from '../../../components/views/group/admin/settings/Settings';
import Members from '../../../components/views/group/admin/members/Members';
import {Avatar, Card, CardMedia, Grid, IconButton, TextField} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles({
    root: {
        maxWidth: 345,
    },
    logo: {
        fontSize: '180px',
        width: 'auto',
        height: 'auto',
        boxShadow: '0 0 5px rgb(200,200,200)',
        border: '2px solid rgb(0, 210, 170)'
    }
});

const JoinGroup = (props) => {

    const classes = useStyles()

    const router = useRouter();
    const groupId = router.query.groupId;

    const [user, setUser] = useState(null);


    const [userData, setUserData] = useState(null);

    const [error, setError] = useState(null)
    const [editMode, setEditMode] = useState(false)

    const [group, setGroup] = useState([]);

    const [editData, setEditData] = useState({logoUrl: "", fileObj: "", universityName: ""})

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
            getCareerCenter()
        }
    }, [groupId]);

    useEffect(() => {
        if (editData.universityName.length && error) {
            setError(null)
        }
    }, [])

    const getCareerCenter = () => {
        return props.firebase.getCareerCenterById(groupId).then(querySnapshot => {
            let careerCenter = querySnapshot.data();
            careerCenter.id = querySnapshot.id;
            setGroup(careerCenter);
        });
    }

    const handleChangeName = (e) => {
        const value = e.target.value
        setEditData({...editData, universityName: value})
    }

    const handleSubmitName = async (e) => {
        e.preventDefault()
        if (!editData.universityName.length) return setError("Required")
        await props.firebase.updateCareerCenter(group.id, {universityName: editData.universityName})
        await getCareerCenter()
        setEditMode(false)
    }

    return (
        <div className='greyBackground'>
            <Head>
                <title key="title">CareerFairy | Join Groups</title>
            </Head>
            <Header classElement='relative white-background'/>
            <Container style={{padding: '30px 0'}} textAlign='center'>
                <div className='white-box'>
                    <Grid container>
                        <Grid item xs={6}>
                            <div className='image-outer-container'>
                                <Avatar src={group.logoUrl}
                                        className={classes.logo}
                                        title="Group logo"/>
                            </div>
                        </Grid>
                        <Grid item xs={6} direction="row"
                              container
                              alignItems="center">
                            {editMode ?
                                <form onSubmit={handleSubmitName}>
                                    <TextField style={{width: '70%'}}

                                               inputProps={{style: {fontSize: 'calc(1.1em + 2vw)'}}}
                                               defaultValue={group.universityName}
                                               onChange={handleChangeName}
                                               error={error}
                                    />
                                    <IconButton type="submit">
                                        <SaveIcon color="primary"/>
                                    </IconButton>
                                </form>
                                :
                                <>
                                    <h1 className='group-name'>{group.universityName}</h1>
                                    <IconButton onClick={() => setEditMode(true)}>
                                        {menuItem === 'settings' && <EditIcon color="primary"/>}
                                    </IconButton>
                                </>
                            }
                        </Grid>
                    </Grid>
                </div>
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
                    <Settings groupId={groupId}/>
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
                        margin: 20px 0 20px 0;
                        font-weight: 500;
                        font-size: calc(1.1em + 2vw);
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