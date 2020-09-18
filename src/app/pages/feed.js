import {GlobalBackground} from "../materialUI/GlobalBackground/GlobalBackGround";
import Head from "next/head";
import Header from "../components/views/header/Header";
import {Box, Container, useMediaQuery, useTheme} from "@material-ui/core";
import Footer from "../components/views/footer/Footer";
import {useState} from "react";
import MobileFeed from "../components/views/feed/MobileFeed";
import DesktopFeed from "../components/views/feed/DesktopFeed";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    content: {

    }
}));

const feed = () => {
    const classes = useStyles()
    const theme = useTheme()
    const [groupData, setGroupData] = useState({})
    const [userGroups, setUserGroups] = useState([])
    const mobile = useMediaQuery(theme.breakpoints.down('xs'));

    return (
        <GlobalBackground>
            <Head>
                <title key="title">CareerFairy | Feed</title>
            </Head>
            <Header classElement='relative white-background'/>
            <Container disableGutters>
                <Box className={classes.content}>
                    {mobile ? <MobileFeed/> : <DesktopFeed/>}
                </Box>
            </Container>
            <Footer/>
        </GlobalBackground>
    );
};

export default feed;
