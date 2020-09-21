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
    const [categories, setCategories] = useState([])
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

    }, [])

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
        const newGroupObj = {
            ...groupObj,
            alreadyJoined: userData.groupIds?.includes(groupObj.id)
        }
        if (newGroupObj.categories) {
            newGroupObj.categories.forEach(category => {
                category.options.forEach(option => (option.active = false))
            })
        }
        setGroupData(newGroupObj)
    }

    const handleToggleActive = (categoryId, optionId) => {
        const newGroupData = {...groupData}
        const targetCategory = newGroupData.categories.find(category => category.id === categoryId)
        const targetOption = targetCategory.options.find(option => option.id === optionId)
        targetOption.active = !targetOption.active
        setGroupData(newGroupData)
        console.log(newGroupData);
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
                    {mobile ?
                        <MobileFeed groupData={groupData}/>
                        :
                        <DesktopFeed alreadyJoined={groupData.alreadyJoined}
                                     handleToggleActive={handleToggleActive}
                                     userData={userData}
                                     groupData={groupData}/>}
                </Box>
            </Container>
            <Footer/>
        </GlobalBackground>
    );
};

export default withFirebase(feed);
