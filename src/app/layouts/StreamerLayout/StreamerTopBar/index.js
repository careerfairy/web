import React, {useState, Fragment, useEffect} from 'react';
import {makeStyles, useTheme} from "@material-ui/core/styles";
import {
    AppBar,
    Badge,
    Box,
    Button,
    Checkbox,
    Hidden,
    IconButton,
    Toolbar,
    Tooltip,
    Typography, useMediaQuery
} from "@material-ui/core";
import {MainLogo, MiniLogo} from "../../../components/logos";
import {StandartTooltip, TooltipButtonComponent, TooltipText, TooltipTitle} from "../../../materialUI/GlobalTooltips";
import ButtonWithConfirm from "../../../components/views/common/ButtonWithConfirm";
import StopIcon from "@material-ui/icons/Stop";
import PlayCircleFilledWhiteIcon from "@material-ui/icons/PlayCircleFilledWhite";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import OpenInBrowserIcon from "@material-ui/icons/OpenInBrowser";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import Brightness7Icon from "@material-ui/icons/Brightness7";
import PeopleIcon from "@material-ui/icons/People";
import {useThemeToggle} from "../../../context/theme/ThemeContext";
import SpeakerManagementModal from "../../../components/views/streaming/modal/SpeakerManagementModal";
import {useRouter} from "next/router";
import {useCurrentStream} from "../index";

const useStyles = makeStyles(theme => ({
    toolbar: {
        minHeight: 55,
        display: "flex",
        justifyContent: "space-between"
    },
    streamStatusText: {
        fontWeight: 600,
        color: ({hasStarted}) => hasStarted ? theme.palette.primary.main : theme.palette.warning.main
    },
    viewCount: {
        // background: theme.palette.primary.main,
        color: theme.palette.primary.main,
        padding: theme.spacing(1),
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    viewCountText: {
        fontWeight: 600,
        marginLeft: theme.spacing(0.5)
    },
}));

const StreamerTopBar = ({firebase, numberOfViewers, isMainStreamer}) => {
    const {currentLivestream} = useCurrentStream()

    const classes = useStyles()
    const theme = useTheme()
    const mobile = useMediaQuery(theme.breakpoints.down('md'))
    const {query: {livestreamId}} = useRouter()
    const {toggleTheme, themeMode} = useThemeToggle()

    const [streamStartTimeIsNow, setStreamStartTimeIsNow] = useState(false);
    const [hideTooltip, setHideTooltip] = useState(false);
    const [joiningStreamerLink, setJoiningStreamerLink] = useState("")
    const [speakerManagementOpen, setSpeakerManagementOpen] = useState(false);


    useEffect(() => {
        if (livestreamId) {
            let baseUrl = "https://careerfairy.io"
            if (window?.location?.origin) {
                baseUrl = window.location.origin
            }
            const link = `${baseUrl}/streaming/${livestreamId}/joining-streamer?pwd=qdhwuiehd7qw789d79w8e8dheiuhiqwdu`;
            setJoiningStreamerLink(link)
        }
    }, [livestreamId])

    useEffect(() => {
        if (currentLivestream.start) {
            let interval = setInterval(() => {
                if (dateIsInUnder2Minutes(currentLivestream.start.toDate())) {
                    setStreamStartTimeIsNow(true);
                    clearInterval(interval);
                }
            }, 1000)
        }
    }, [currentLivestream.start]);

    function dateIsInUnder2Minutes(date) {
        return new Date(date).getTime() - Date.now() < 1000 * 60 * 2 || Date.now() > new Date(date).getTime();
    }

    function setStreamingStarted(started) {
        firebase.setLivestreamHasStarted(started, currentLivestream.id);


    }

    return (
        <Fragment>
            <AppBar elevation={1} color="transparent">
                <Toolbar className={classes.toolbar}>
                    <Hidden smDown>
                        <MainLogo/>
                    </Hidden>
                    <Hidden mdUp>
                        <MiniLogo/>
                    </Hidden>
                    {isMainStreamer &&
                    <Fragment>
                        <StandartTooltip
                            arrow
                            open={!streamStartTimeIsNow && !hideTooltip}
                            interactive
                            placement='bottom'
                            title={
                                <React.Fragment>
                                    <TooltipTitle>Start Streaming</TooltipTitle>
                                    <TooltipText>
                                        The Start Streaming button will become active 2 minutes before the stream's
                                        official start time.
                                    </TooltipText>
                                    <TooltipButtonComponent onConfirm={() => setHideTooltip(true)} buttonText="Ok"/>
                                </React.Fragment>
                            }
                        >
                            <ButtonWithConfirm
                                color={currentLivestream.hasStarted ? theme.palette.error.main : theme.palette.primary.main}
                                fluid
                                hasStarted={currentLivestream.hasStarted}
                                mobile={mobile}
                                disabled={!streamStartTimeIsNow}
                                startIcon={currentLivestream.hasStarted ? <StopIcon/> : <PlayCircleFilledWhiteIcon/>}
                                buttonAction={() => setStreamingStarted(!currentLivestream.hasStarted)}
                                confirmDescription={currentLivestream.hasStarted ? 'Are you sure that you want to end your livestream now?' : 'Are you sure that you want to start your livestream now?'}
                                buttonLabel={currentLivestream.hasStarted ? `Stop ${mobile ? "" : "Streaming"}` : `Start ${mobile ? "" : "Streaming"}`}
                                tooltipTitle={currentLivestream.hasStarted ? `Click here to stop streaming` : `Click here to start streaming`}

                            />
                        </StandartTooltip>

                        {mobile ?
                            <Tooltip title="Invite an additional streamer">
                                <IconButton onClick={() => {
                                    setSpeakerManagementOpen(true)
                                }}>
                                    <PersonAddIcon color="inherit"/>
                                </IconButton>
                            </Tooltip>
                            :
                            <Button
                                children="Invite a streamer"
                                startIcon={<PersonAddIcon color="inherit"/>}
                                onClick={() => {
                                    setSpeakerManagementOpen(true)
                                }}
                            />}
                    </Fragment>
                    }
                    {mobile ?
                        <Tooltip
                            title={currentLivestream.hasStarted ? 'You are currently actively streaming' : 'You are currently not streaming'}>
                            <Typography className={classes.streamStatusText} variant="h5">
                                {currentLivestream.hasStarted ? 'LIVE' : 'NOT LIVE'}
                            </Typography>
                        </Tooltip>
                        :
                        <Box display="flex"
                             flexDirection="column"
                             justifyContent="center"
                        >
                            <Typography className={classes.streamStatusText} variant="h5">
                                {currentLivestream.hasStarted ? 'YOU ARE LIVE' : 'YOU ARE NOT LIVE'}
                            </Typography>
                            {currentLivestream.hasStarted ? '' : 'Press Start Streaming to begin'}
                        </Box>}
                    {isMainStreamer &&
                    <Fragment>
                        {mobile ?
                            <Tooltip title="Open Student View">
                                <IconButton target="_blank" href={`/streaming/${currentLivestream.id}/viewer`}>
                                    <OpenInBrowserIcon color="inherit"/>
                                </IconButton>
                            </Tooltip>
                            :
                            <Button
                                href={`/streaming/${currentLivestream.id}/viewer`}
                                target="_blank"
                                children="Open Student View"
                                startIcon={<OpenInBrowserIcon color="inherit"/>}
                            />
                        }
                    </Fragment>}
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
                            <Tooltip title="Number of viewers">
                                <Badge color="secondary" badgeContent={mobile ? numberOfViewers : 0}>
                                    <PeopleIcon/>
                                </Badge>
                            </Tooltip>
                            {!mobile &&
                            <Typography className={classes.viewCountText}>
                                Viewers : {numberOfViewers}
                            </Typography>}
                        </Box>
                    </Box>
                </Toolbar>
            </AppBar>
            <SpeakerManagementModal
                livestreamId={currentLivestream.id}
                open={speakerManagementOpen}
                joiningStreamerLink={joiningStreamerLink}
                setOpen={setSpeakerManagementOpen}
            />
        </Fragment>
    );
};

export default StreamerTopBar;
