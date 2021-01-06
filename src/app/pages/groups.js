import {useContext, useEffect, useState} from "react";
import Grid from "@material-ui/core/Grid";
import {useRouter} from "next/router";
import {withFirebase} from "../context/firebase";
import Header from "../components/views/header/Header";
import Loader from "../components/views/loader/Loader";

import Head from "next/head";
import NewGroup from "../components/views/profile/NewGroup";
import Footer from "../components/views/footer/Footer";
import {Container, Grow, Typography} from "@material-ui/core";
import {GlobalBackground} from "../materialUI/GlobalBackground/GlobalBackGround";
import Groups from "../components/views/groups/Groups";
import UserContext from "../context/user/UserContext";
import {useAuth} from "../HOCs/AuthProvider";

const JoinGroup = (props) => {
    const router = useRouter();
    const [groups, setGroups] = useState([]);
    const {userData, authenticatedUser: user, loading} = useAuth();

    useEffect(() => {
        if (user === null) {
            router.replace("/login");
        }
    }, [user]);

    useEffect(() => {
        if (userData) {
            const unsubscribe = props.firebase.listenToGroups((querySnapshot) => {
                let careerCenters = [];
                querySnapshot.forEach((doc) => {
                    let careerCenter = doc.data();
                    careerCenter.id = doc.id;
                    if (!userData.groupIds?.includes(careerCenter.id)) {
                        careerCenters.push(careerCenter);
                    }
                });
                setGroups(careerCenters);
            });
            return () => unsubscribe();
        }
    }, [userData]);

    if (user === null || userData === null || loading === true) {
        return <Loader/>;
    }

    return (
        <GlobalBackground>
            <Head>
                <title key="title">CareerFairy | Join Groups</title>
            </Head>
            <Header classElement="relative white-background"/>
            <Container>
                <Groups userData={userData} groups={groups}/>
            </Container>
            <Footer/>
        </GlobalBackground>
    );
};

export default withFirebase(JoinGroup);
