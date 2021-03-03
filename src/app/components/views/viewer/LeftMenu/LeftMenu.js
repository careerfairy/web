import PropTypes from 'prop-types'
import React, {useEffect, useState} from 'react';
import {fade, makeStyles, useTheme} from "@material-ui/core/styles";
import SwipeableViews from "react-swipeable-views";
import ChevronLeftRoundedIcon from "@material-ui/icons/ChevronLeftRounded";
import {Fab} from "@material-ui/core";
import ButtonComponent from "../../streaming/sharedComponents/ButtonComponent";
import QuestionCategory from "../../streaming/sharedComponents/QuestionCategory";
import PollCategory from "./categories/PollCategory";
import HandRaiseCategory from "./categories/HandRaiseCategory";
import ChatCategory from "../../streaming/LeftMenu/categories/ChatCategory";
import {TabPanel} from "../../../../materialUI/GlobalPanels/GlobalPanels";
import clsx from "clsx";
import {useAuth} from "../../../../HOCs/AuthProvider";


const useStyles = makeStyles(theme => ({
    root: {
        position: "absolute",
        boxShadow: theme.shadows[5],
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 101,
        [theme.breakpoints.up("mobile")]: {
            top: 55,
        },
        width: ({showMenu, isMobile}) => showMenu ? (isMobile ? "100%" : 280) : 0,
        transition: theme.transitions.create("width", {
            duration: theme.transitions.duration.shortest,
            easing: theme.transitions.easing.easeInOut
        }),
    },
    viewRoot: {
        position: "relative",
        height: "100%",
        // backgroundColor: theme.palette.background.default,
        "& .react-swipeable-view-container": {
            height: "100%"
        }
    },
    closeBtn: {
        position: "fixed",
        top: 10,
        right: 10,
        textAlign: "center",
        zIndex: 9100,
        background: theme.palette.type === "dark" && theme.palette.background.paper,
        "&:hover": {
            background: theme.palette.type === "dark" && theme.palette.background.default,
        },
        color: theme.palette.type === "dark" && theme.palette.secondary.main
    },
    slides: {
        // backgroundColor: theme.palette.background.default,
        overflow: "visible !important"
    },
    blur: {
        backgroundColor: fade(theme.palette.common.black, 0.2),
        backdropFilter: "blur(5px)",
    }
}))

const states = ["questions", "polls", "hand", "chat"]
const LeftMenu =
    ({
         handRaiseActive,
         toggleShowMenu,
         setHandRaiseActive,
         streamer,
         setSelectedState,
         handleStateChange,
         selectedState,
         livestream,
         setShowMenu,
         showMenu,
         isMobile,
         className,
         ...props
     }) => {
    const {userData, authenticatedUser: user} = useAuth()
        const theme = useTheme()
        const classes = useStyles({showMenu, isMobile})
        const [value, setValue] = useState(0);

        useEffect(() => {
            if (selectedState === "questions") {
                setValue(0)
            } else if (selectedState === "polls") {
                setValue(1)
            } else if (selectedState === "hand") {
                setValue(2)
            } else if (selectedState === "chat") {
                setValue(3)
            }
        }, [selectedState, showMenu, isMobile])
        useEffect(() => {
            if (selectedState === "chat" && showMenu && !isMobile) {
                setSelectedState("questions")
                setValue(0)
            }
        }, [selectedState, showMenu, isMobile])


        const handleChange = (event, newValue) => {
            setValue(newValue);
            setSelectedState(states[newValue])
        }

        const views = [
            <TabPanel key={0} value={value} index={0} dir={theme.direction}>
                <QuestionCategory showMenu={showMenu} streamer={streamer} livestream={livestream}
                                  isMobile={isMobile}
                                  selectedState={selectedState} user={user}
                                  userData={userData}/>
            </TabPanel>,
            <TabPanel key={1} value={value} index={1} dir={theme.direction}>
                <PollCategory livestream={livestream} selectedState={selectedState}
                              setSelectedState={setSelectedState} setShowMenu={setShowMenu}
                              streamer={streamer} user={user} userData={userData}/>
            </TabPanel>,
            <TabPanel key={2} value={value} index={2} dir={theme.direction}>
                <HandRaiseCategory streamer={streamer} livestream={livestream} selectedState={selectedState} user={user}
                                   userData={userData} handRaiseActive={handRaiseActive}
                                   setHandRaiseActive={setHandRaiseActive}/>
            </TabPanel>
        ]

        if (showMenu && isMobile) {
            views.push(<TabPanel key={3} value={value} index={3} dir={theme.direction}>
                <ChatCategory livestream={livestream} selectedState={selectedState} user={user}
                              userData={userData} isStreamer={false}/>
            </TabPanel>)
        }


        return (
            <div className={clsx(classes.root, className, {
                [classes.blur]: isMobile && showMenu
            })}>
                {isMobile && showMenu &&
                <Fab className={classes.closeBtn} size='large' color='secondary' onClick={toggleShowMenu}>
                    <ChevronLeftRoundedIcon/>
                </Fab>}
                <SwipeableViews
                    containerStyle={{WebkitOverflowScrolling: 'touch'}}
                    axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                    index={value}
                    animateTransitions
                    hysteresis={0.3}
                    slideClassName={classes.slides}
                    className={classes.viewRoot}
                    onChangeIndex={handleChange}>
                    {views}
                </SwipeableViews>

            </div>
        );
    };

LeftMenu.propTypes = {
  className: PropTypes.string,
  handRaiseActive: PropTypes.bool,
  handleStateChange: PropTypes.func.isRequired,
  isMobile: PropTypes.bool,
  livestream: PropTypes.object,
  selectedState: PropTypes.string.isRequired,
  setHandRaiseActive: PropTypes.func.isRequired,
  setSelectedState: PropTypes.func.isRequired,
  setShowMenu: PropTypes.func.isRequired,
  showMenu: PropTypes.bool.isRequired,
  streamer: PropTypes.any,
  toggleShowMenu: PropTypes.any,
  user: PropTypes.any,
  userData: PropTypes.any
}

export default LeftMenu;

