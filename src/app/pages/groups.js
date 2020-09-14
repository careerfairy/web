import {useEffect, useState} from 'react'
import Grid from '@material-ui/core/Grid';
import {useRouter} from 'next/router';
import {withFirebase} from '../data/firebase';
import Header from '../components/views/header/Header';
import Loader from '../components/views/loader/Loader';

import Head from 'next/head';
import NewGroup from '../components/views/profile/NewGroup';
import Footer from '../components/views/footer/Footer';
import {Container, Grow, Typography} from "@material-ui/core";
import {GlobalBackground} from "../materialUI/GlobalBackground/GlobalBackGround";

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
                    if (user) {
                        setUserData(user);
                    }
                });
        }
    }, [user]);

    useEffect(() => {
        props.firebase.listenToGroups(querySnapshot => {
            let careerCenters = [];
            querySnapshot.forEach(doc => {
                let careerCenter = doc.data();
                careerCenter.id = doc.id;
                careerCenters.push(careerCenter);
            })
            setGroups(careerCenters);
        });
    }, []);

    if (user === null || userData === null || loading === true) {
        return <Loader/>;
    }

    let moreGroupElements = [];

    moreGroupElements = groups.map(group => {
        return (
            <Grow key={group.id} in={Boolean(group)} timeout={600}>
                <Grid item xs={12} sm={6} md={4} lg={4}>
                    <NewGroup group={group} userData={userData}/>
                </Grid>
            </Grow>
        )
    });

    return (
        <GlobalBackground>
            <Head>
                <title key="title">CareerFairy | Join Groups</title>
            </Head>
            <Header classElement='relative white-background'/>
            <Container>
                <Typography align="center" variant="h3" gutterBottom>Join A New Career Group</Typography>
                <Grid style={{marginBottom: 50}} container spacing={3}>
                    {moreGroupElements}
                </Grid>
            </Container>
            <Footer/>
        </GlobalBackground>
    );
};

export default withFirebase(JoinGroup);