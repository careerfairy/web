import React, {useEffect, useState} from 'react';
import {fade, makeStyles, useTheme} from "@material-ui/core/styles";
import {
    AppBar,
    Badge,
    Box,
    Button,
    Checkbox,
    Fab, IconButton,
    Toolbar,
    Tooltip,
    Typography,
    useMediaQuery
} from "@material-ui/core";
import {MainLogo} from "../../../components/logos";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import Brightness7Icon from "@material-ui/icons/Brightness7";
import PeopleAltIcon from "@material-ui/icons/PeopleAlt";
import {useSelector} from "react-redux";
import {populate} from "react-redux-firebase";
import PropTypes from 'prop-types';
import Logo from "./Logo";
import {useThemeToggle} from "../../../context/theme/ThemeContext";
import {useAuth} from "../../../HOCs/AuthProvider";
import {withFirebase} from "../../../context/firebase";
import {useCurrentStream} from "../../../context/stream/StreamContext";
import PeopleIcon from "@material-ui/icons/People";

const useStyles = makeStyles(theme => ({
    joinButton: {
        marginLeft: theme.spacing(1)
    },
    toolbar: {
        minHeight: 55,
        display: "flex",
        justifyContent: "space-between"
    },
    viewCount: {
        // background: theme.palette.primary.main,
        color: theme.palette.primary.main,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: theme.spacing(0, 1)
    },
    viewCountText: {
        fontWeight: 600,
        marginLeft: theme.spacing(0.5)
    },
    floatingViewCount: {
        position: 'absolute',
        top: theme.spacing(2.5),
        right: theme.spacing(2.5),
        zIndex: 120,
        color: theme.palette.primary.main,
    }
}));

const ViewerTopBar = ({firebase, mobile, numberOfViewers, showAudience, showMenu}) => {

    const classes = useStyles()
    const {authenticatedUser, userData} = useAuth();
    const {toggleTheme, themeMode} = useThemeToggle()
    const [userIsInTalentPool, setUserIsInTalentPool] = useState(false);
    const {currentLivestream} = useCurrentStream()

    useEffect(() => {
        if (userData?.talentPools && currentLivestream && userData.talentPools.indexOf(currentLivestream.companyId) > -1) {
            setUserIsInTalentPool(true);
        } else {
            setUserIsInTalentPool(false);
        }
    }, [currentLivestream, userData]);

    function joinTalentPool() {
        if (!authenticatedUser) {
            return router.replace('/signup');
        }
        firebase.joinCompanyTalentPool(currentLivestream.companyId, authenticatedUser.email, currentLivestream.id);
    }

    function leaveTalentPool() {
        if (!authenticatedUser) {
            return router.replace('/signup');
        }
        firebase.leaveCompanyTalentPool(currentLivestream.companyId, authenticatedUser.email, currentLivestream.id);
    }


    if (mobile && !showMenu) {
        return (
            <Tooltip title="See who's here">
                <IconButton onClick={showAudience} size="small" className={classes.floatingViewCount}>
                    <Badge color="secondary" badgeContent={numberOfViewers}>
                        <PeopleIcon/>
                    </Badge>
                </IconButton>
            </Tooltip>
        )
    }

    if (mobile && showMenu) {
        return null
    }


    const logoElements = currentLivestream?.careerCenters?.map(cc => {
        return (
            <Logo
                key={cc.groupId}
                src={cc.logoUrl}
            />
        );
    }).filter(cc => cc.logoUrl || cc.groupId)


    return (
        <AppBar elevation={1} color="transparent">
            <Toolbar className={classes.toolbar}>
                <MainLogo/>
                {logoElements}
                <Box flexGrow={1}/>
                {currentLivestream.companyLogoUrl && <Logo
                    src={currentLivestream.companyLogoUrl}
                />}
                <Box display="flex" alignItems="center">
                    <Tooltip title={themeMode === "dark" ? "Switch to light theme" : "Switch to dark mode"}>
                        <Checkbox
                            checked={themeMode === "dark"}
                            onChange={toggleTheme}
                            icon={<Brightness4Icon/>}
                            checkedIcon={<Brightness7Icon/>}
                            color="default"
                        />
                    </Tooltip>
                    <Box className={classes.viewCount}>
                        <Tooltip title="Number of Viewers">
                            {/*    <IconButton color="primary" onClick={showAudience}>*/}
                            <Badge color="secondary" badgeContent={numberOfViewers}>
                                <PeopleIcon/>
                            </Badge>
                            {/*    </IconButton>*/}
                        </Tooltip>
                    </Box>
                </Box>
                {!currentLivestream.hasNoTalentPool &&
                <Button
                    children={userIsInTalentPool ? 'Leave Talent Pool' : 'Join Talent Pool'}
                    variant="contained"
                    className={classes.joinButton}
                    startIcon={<PeopleAltIcon/>}
                    icon={userIsInTalentPool ? 'delete' : 'handshake outline'}
                    onClick={userIsInTalentPool ? () => leaveTalentPool() : () => joinTalentPool()}
                    color={userIsInTalentPool ? "default" : "primary"}/>}
            </Toolbar>
        </AppBar>
    );
};

ViewerTopBar.propTypes = {
    firebase: PropTypes.object,
    mobile: PropTypes.bool.isRequired,
    numberOfViewers: PropTypes.number.isRequired,
    showAudience: PropTypes.func.isRequired,
    showMenu: PropTypes.bool.isRequired
}

export default withFirebase(ViewerTopBar);

