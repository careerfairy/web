import React, {useEffect, useState} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {AppBar, Badge, Box, Button, Checkbox, IconButton, Toolbar, Tooltip} from "@material-ui/core";
import {MainLogo} from "../../../components/logos";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import Brightness7Icon from "@material-ui/icons/Brightness7";
import PropTypes from 'prop-types';
import Logo from "./Logo";
import {useThemeToggle} from "../../../context/theme/ThemeContext";
import {useAuth} from "../../../HOCs/AuthProvider";
import {withFirebase} from "../../../context/firebase";
import {useCurrentStream} from "../../../context/stream/StreamContext";
import PeopleIcon from "@material-ui/icons/People";
import HowToRegRoundedIcon from "@material-ui/icons/HowToRegRounded";
import NewFeatureHint from "../../../components/util/NewFeatureHint";
import useJoinTalentPool from "../../../components/custom-hook/useJoinTalentPool";
import ViewerBreakoutRoomModal from "./ViewerBreakoutRoomModal";

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
        color: theme.palette.primary.main,
    },
    floatingWrapper:{
        position: 'absolute',
        top: theme.spacing(2.5),
        right: theme.spacing(2.5),
        zIndex: 120,

    }
}));

const ViewerTopBar = ({firebase, mobile, numberOfViewers, showAudience, showMenu}) => {

    const classes = useStyles()
    const {toggleTheme, themeMode} = useThemeToggle()
    const {currentLivestream} = useCurrentStream()
    const {userIsInTalentPool, handlers:{joinTalentPool,leaveTalentPool}} = useJoinTalentPool()
    const [breakoutRoomModalOpen, setBreakoutRoomModalOpen] = useState(false);

    const handleOpenBreakoutRoomModal = () => {
        setBreakoutRoomModalOpen(true)
    }

    const handleCloseBreakoutRoomModal = () => {
        setBreakoutRoomModalOpen(false)
    }

    if (mobile && !showMenu) {
        return (
            <React.Fragment>
            <div className={classes.floatingWrapper}>
            <IconButton onClick={showAudience} className={classes.floatingViewCount}>
                <Badge max={999999} color="secondary" badgeContent={numberOfViewers}>
                    <NewFeatureHint
                        onClick={showAudience}
                        tooltipText="Click here to see who's joined the stream since the start"
                        localStorageKey="hasSeenAudienceDrawer"
                        tooltipTitle="Hint"
                    >
                        <PeopleIcon/>
                    </NewFeatureHint>
                </Badge>
            </IconButton>
            </div>
                <ViewerBreakoutRoomModal
                    open={breakoutRoomModalOpen}
                    onClose={handleCloseBreakoutRoomModal}
                    handleOpen={handleOpenBreakoutRoomModal}
                />
            </React.Fragment>
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
        <React.Fragment>
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
                    <NewFeatureHint
                        onClick={showAudience}
                        tooltipText="Click here to see who's joined the stream since the start"
                        localStorageKey="hasSeenAudienceDrawer"
                        tooltipTitle="Hint"
                    >
                        <Box className={classes.viewCount}>
                            <Tooltip title="See who joined">
                                <Button color="primary" size="large"
                                        startIcon={<Badge max={999999} color="secondary" badgeContent={numberOfViewers}>
                                            <PeopleIcon/>
                                        </Badge>} onClick={showAudience}>
                                    See who joined
                                </Button>
                            </Tooltip>
                        </Box>
                    </NewFeatureHint>
                </Box>
                {!currentLivestream.hasNoTalentPool &&
                <Button
                    children={userIsInTalentPool ? 'Leave Talent Pool' : 'Join Talent Pool'}
                    variant="contained"
                    className={classes.joinButton}
                    startIcon={<HowToRegRoundedIcon/>}
                    icon={userIsInTalentPool ? 'delete' : 'handshake outline'}
                    onClick={userIsInTalentPool ? () => leaveTalentPool() : () => joinTalentPool()}
                    color={userIsInTalentPool ? "default" : "primary"}/>}
            </Toolbar>
        </AppBar>
            <ViewerBreakoutRoomModal
                open={breakoutRoomModalOpen}
                onClose={handleCloseBreakoutRoomModal}
                handleOpen={handleOpenBreakoutRoomModal}
            />
        </React.Fragment>
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

