import {GreyBackground} from "../materialUI/GlobalBackground/GlobalBackGround";
import Head from "next/head";
import Header from "../components/views/header/Header";
import {Container, useMediaQuery, useTheme} from "@material-ui/core";
import Footer from "../components/views/footer/Footer";
import {useEffect, useState} from "react";
import MobileFeed from "../components/views/feed/MobileFeed";
import GroupsCarousel from "../components/views/feed/GroupsCarousel/GroupsCarousel";
import Loader from "../components/views/loader/Loader";
import {withFirebase} from "../data/firebase";
import DesktopFeed from "../components/views/feed/DesktopFeed/DesktopFeed";
import {useRouter} from "next/router";


const feed = ({firebase}) => {
    const theme = useTheme()
    const router = useRouter();
    const [loading, setLoading] = useState(false)
    const [groupData, setGroupData] = useState({})
    const [userData, setUserData] = useState(null)
    const [user, setUser] = useState(null);
    const [value, setValue] = useState(0);
    const mobile = useMediaQuery(theme.breakpoints.down('sm'));

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


    const scrollToTop = () => {
        window.scrollTo(0, 0);
    }

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleResetView = () => {
        setValue(0)
    }

    const handleChangeIndex = (index) => {
        setValue(index);
    };

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
        handleResetView()
        scrollToTop()
    }

    const handleToggleActive = (categoryId, optionId) => {
        const newGroupData = {...groupData}
        const targetCategory = newGroupData.categories.find(category => category.id === categoryId)
        const targetOption = targetCategory.options.find(option => option.id === optionId)
        targetOption.active = !targetOption.active
        setGroupData(newGroupData)
        scrollToTop()
    }

    return (
        <GreyBackground>
            <Head>
                <title key="title">CareerFairy | Feed</title>
            </Head>
            <div style={{background: "rgb(44, 66, 81)"}}>
                <Header color="white"/>
            </div>
            <GroupsCarousel groupData={groupData} mobile={mobile} handleSetGroup={handleSetGroup}
                            groupIds={userData.groupIds}/>
            {/*<GroupBanner description={groupData.description} logoUrl={groupData.logoUrl}/>*/}
            <Container disableGutters>
                {!mobile &&
                <DesktopFeed alreadyJoined={groupData.alreadyJoined}
                             handleToggleActive={handleToggleActive}
                             userData={userData}
                             user={user}
                             mobile={mobile}
                             groupData={groupData}/>}
            </Container>
            {mobile &&

            <MobileFeed groupData={groupData}
                        user={user}
                        value={value}
                        handleChangeIndex={handleChangeIndex}
                        handleResetView={handleResetView}
                        handleChange={handleChange}
                        alreadyJoined={groupData.alreadyJoined}
                        handleToggleActive={handleToggleActive}
                        userData={userData}/>
            }
            <Footer/>
        </GreyBackground>
    );
};

export default withFirebase(feed);
