import React, {useState} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {AppBar, Badge, Box, Button, Checkbox, IconButton, Toolbar, Tooltip} from "@material-ui/core";
import {MainLogo} from "../../../components/logos";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import Brightness7Icon from "@material-ui/icons/Brightness7";
import PropTypes from 'prop-types';
import Logo from "./Logo";
import {useThemeToggle} from "../../../context/theme/ThemeContext";
import {useCurrentStream} from "../../../context/stream/StreamContext";
import PeopleIcon from "@material-ui/icons/People";
import HowToRegRoundedIcon from "@material-ui/icons/HowToRegRounded";
import NewFeatureHint from "../../../components/util/NewFeatureHint";
import useJoinTalentPool from "../../../components/custom-hook/useJoinTalentPool";
import ViewerBreakoutRoomModal from "./ViewerBreakoutRoomModal";
import BackToMainRoomIcon from "@material-ui/icons/ArrowBackIos";
import {useRouter} from "next/router";
import useStreamToken from "../../../components/custom-hook/useStreamToken";
import BreakoutRoomIcon from "@material-ui/icons/Widgets";
import {useDispatch, useSelector} from "react-redux";
import breakoutRoomsSelector from "../../../components/selectors/breakoutRoomsSelector";
import * as actions from 'store/actions'
import useStreamGroups from "../../../components/custom-hook/useStreamGroups";

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
    floatingButton: {
        color: theme.palette.primary.main,
        width: 48,
        height: 48
    },
    floatingWrapper: {
        position: 'absolute',
        top: theme.spacing(2.5),
        right: theme.spacing(2.5),
        zIndex: 120,
        display: "flex",
        alignItems: "baseline"

    }
}));

const localStorageAudienceDrawerKey = "hasSeenAudienceDrawer"
const ViewerTopBar = ({mobile, showAudience, showMenu}) => {
    const classes = useStyles()
    const {query: {livestreamId, breakoutRoomId}} = useRouter()
    const dispatch = useDispatch()
    const {toggleTheme, themeMode} = useThemeToggle()
    const links = useStreamToken({forStreamType: "mainLivestream"})

    const {currentLivestream} = useCurrentStream()
    const numberOfViewers = useSelector(state => currentLivestream?.hasStarted ? state.stream.stats.numberOfViewers : 0)
    const {userIsInTalentPool, handlers: {joinTalentPool, leaveTalentPool}} = useJoinTalentPool()
    const [breakoutRoomModalOpen, setBreakoutRoomModalOpen] = useState(false);
    const breakoutRoomOpen = useSelector(state =>
        Boolean(breakoutRoomsSelector(state.firestore.ordered[`Active BreakoutRooms of ${livestreamId}`])?.length)
    )
    const careerCenters = useStreamGroups(currentLivestream?.groupIds, firebase)


    const handleBackToMainRoom = () => {
        window.location.href = links.viewerLink
    }

    const handleOpenBreakoutRoomModal = () => {
        dispatch(actions.openViewerBreakoutModal())
    }


    if (mobile && !showMenu) {
        return (
            <React.Fragment>
                <div className={classes.floatingWrapper}>
                    {breakoutRoomId &&
                    <Tooltip title="Back to main room">
                        <Button onClick={handleBackToMainRoom}
                                style={{marginRight: 5}}
                                startIcon={<BackToMainRoomIcon/>}
                                color="secondary" variant="outlined">
                            Back
                        </Button>
                    </Tooltip>}
                    {breakoutRoomOpen &&
                    <Tooltip title="Checkout breakout rooms">
                        <IconButton className={classes.floatingButton} disabled={breakoutRoomModalOpen}
                                    onClick={handleOpenBreakoutRoomModal}>
                            <Badge color="secondary" badgeContent={"!"}>
                                <BreakoutRoomIcon/>
                            </Badge>
                        </IconButton>
                    </Tooltip>}
                    <Tooltip title="See who joined">
                    <IconButton onClick={showAudience} className={classes.floatingButton}>
                        <Badge max={999999} color="secondary" badgeContent={numberOfViewers}>
                            <NewFeatureHint
                                onClick={showAudience}
                                tooltipText="Click here to see who's joined the stream since the start"
                                localStorageKey={localStorageAudienceDrawerKey}
                                tooltipTitle="Hint"
                            >
                                <PeopleIcon/>
                            </NewFeatureHint>
                        </Badge>
                    </IconButton>
                    </Tooltip>
                </div>
                <ViewerBreakoutRoomModal
                    mobile={mobile}
                    localStorageAudienceDrawerKey={localStorageAudienceDrawerKey}
                    handleBackToMainRoom={handleBackToMainRoom}
                />
            </React.Fragment>
        )
    }

    if (mobile && showMenu) {
        return null
    }


    const logoElements = careerCenters.map(cc => {
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
                        {breakoutRoomId &&
                        <Tooltip title="Back to main room">
                            <Button onClick={handleBackToMainRoom}
                                    startIcon={<BackToMainRoomIcon/>}
                                    color="secondary" variant="contained">
                                Back
                            </Button>
                        </Tooltip>}
                        {breakoutRoomOpen &&
                        <Tooltip title="Checkout breakout rooms">
                            <IconButton disabled={breakoutRoomModalOpen} onClick={handleOpenBreakoutRoomModal}>
                                <Badge color="secondary" badgeContent={"!"}>
                                    <BreakoutRoomIcon
                                    />
                                </Badge>
                            </IconButton>
                        </Tooltip>}
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
                            localStorageKey={localStorageAudienceDrawerKey}
                            tooltipTitle="Hint"
                        >
                            <Box className={classes.viewCount}>
                                <Tooltip title="See who joined">
                                    <Button color="primary" size="large"
                                            startIcon={<Badge max={999999} color="secondary"
                                                              badgeContent={numberOfViewers}>
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
                localStorageAudienceDrawerKey={localStorageAudienceDrawerKey}
                handleBackToMainRoom={handleBackToMainRoom}
            />
        </React.Fragment>
    );
};

ViewerTopBar.propTypes = {
    mobile: PropTypes.bool.isRequired,
    showAudience: PropTypes.func.isRequired,
    showMenu: PropTypes.bool.isRequired,
    selectedState: PropTypes.string
}

export default ViewerTopBar;

