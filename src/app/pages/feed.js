import {GlobalBackground} from "../materialUI/GlobalBackground/GlobalBackGround";
import Head from "next/head";
import Header from "../components/views/header/Header";
import {Box, Container, useMediaQuery, useTheme} from "@material-ui/core";
import Footer from "../components/views/footer/Footer";
import {useEffect, useState} from "react";
import MobileFeed from "../components/views/feed/MobileFeed";
import {makeStyles} from "@material-ui/core/styles";
import GroupsCarousel from "../components/views/feed/GroupsCarousel/GroupsCarousel";
import Loader from "../components/views/loader/Loader";
import {withFirebase} from "../data/firebase";
import DesktopFeed from "../components/views/feed/DesktopFeed/DesktopFeed";

const useStyles = makeStyles((theme) => ({
    content: {}
}));

const feed = ({firebase}) => {
    const classes = useStyles()
    const theme = useTheme()
    const [loading, setLoading] = useState(false)
    const [groupData, setGroupData] = useState({})
    const [userGroups, setUserGroups] = useState([])
    const [userData, setUserData] = useState(null)
    const [user, setUser] = useState(null);
    const mobile = useMediaQuery(theme.breakpoints.down('xs'));

    useEffect(() => {
        firebase.auth.onAuthStateChanged(user => {
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
            const unsubscribe = firebase.listenToUserData(user.email, querySnapshot => {
                setLoading(false);
                let user = querySnapshot.data();
                user.id = querySnapshot.id;
                if (user) {
                    setUserData(user);
                }
            })
            return () => unsubscribe
        }
    }, [user]);

    if (user === null || userData == null || loading === true) {
        return <Loader/>;
    }

    const handleSetGroup = (groupObj) => {
        setGroupData(groupObj)
    }

    return (
        <GlobalBackground>
            <Head>
                <title key="title">CareerFairy | Feed</title>
            </Head>
            <Header classElement='relative white-background'/>
            <Container disableGutters>
                <GroupsCarousel mobile={mobile} handleSetGroup={handleSetGroup} groupIds={userData.groupIds}/>
                <Box className={classes.content}>
                    {mobile ? <MobileFeed groupData={groupData}/> : <DesktopFeed groupData={groupData}/>}
                </Box>
            </Container>
            <Footer/>
        </GlobalBackground>
    );
};

export default withFirebase(feed);
