import React, {Fragment, useEffect, useState} from 'react';
import {makeStyles, useTheme} from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import SwipeableViews from "react-swipeable-views";
import ChevronLeftRoundedIcon from "@material-ui/icons/ChevronLeftRounded";
import {Fab} from "@material-ui/core";
import ChatCategory from "../../streaming/comment-container/categories/ChatCategory";
import QuestionCategory from "../comment-container/categories/QuestionCategory";
import PollCategory from "../comment-container/categories/PollCategory";
import HandRaiseCategory from "../comment-container/categories/HandRaiseCategory";
import ButtonComponent from "./ButtonComponent";


const useStyles = makeStyles(theme => ({
    root: {
        position: "relative",
        height: "100%",
        backgroundColor: "rgb(220,220,220)",
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
    }
}))


function TabPanel({children, value, index, ...other}) {

    return (
        <div
            role="tabpanel"
            // hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            style={{height: "100%"}}
            aria-labelledby={`full-width-tab-${index}`}
            {...other}
        >
            {(
                <Box style={{height: "100%"}}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const states = ["questions", "polls", "hand", "chat"]
const LeftMenu =
    ({
         handRaiseActive,
         user,
         toggleShowMenu,
         setHandRaiseActive,
         userData,
         streamer,
         livestream,
         setShowMenu,
         showMenu,
         isMobile,
         ...props
     }) => {
        const theme = useTheme()
        const classes = useStyles()
        const [value, setValue] = useState(0);
        const [selectedState, setSelectedState] = useState("questions");
        const [disableSwitching, setDisableSwitching] = useState(false)
        console.log("-> disableSwitching", disableSwitching);

        useEffect(() => {
            if (!disableSwitching && selectedState === "questions") {
                setValue(0)
            } else if (selectedState === "polls") {
                setValue(1)
            } else if (!disableSwitching && selectedState === "hand") {
                setValue(2)
            } else if (!disableSwitching && selectedState === "chat") {
                setValue(3)
            }
        }, [selectedState, disableSwitching, showMenu, isMobile])

        useEffect(() => {
            if (!disableSwitching && selectedState === "chat" && showMenu && !isMobile) {
                setSelectedState("questions")
                setValue(0)
            }
        }, [selectedState, disableSwitching, showMenu, isMobile])

        function handleStateChange(state) {
            if (!showMenu) {
                setShowMenu(true);
            }
            if (!disableSwitching) {
                setSelectedState(state);
            } else {
                setSelectedState("polls")
            }
        }

        const handleChange = (event, newValue) => {
            setValue(event);
            setSelectedState(states[event])
        }

        const views = [
            <TabPanel key={0} value={value} index={0} dir={theme.direction}>
                <QuestionCategory livestream={livestream} selectedState={selectedState} user={user}
                                  userData={userData}/>
            </TabPanel>,
            <TabPanel key={1} value={value} index={1} dir={theme.direction}>
                <PollCategory livestream={livestream} selectedState={selectedState}
                              setDisableSwitching={setDisableSwitching} disableSwitching={disableSwitching}
                              setSelectedState={setSelectedState} setShowMenu={setShowMenu}
                              streamer={streamer} user={user} userData={userData}/>
            </TabPanel>,
            <TabPanel key={2} value={value} index={2} dir={theme.direction}>
                <HandRaiseCategory livestream={livestream} selectedState={selectedState} user={user}
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
            <>
                {isMobile && showMenu &&
                <Fab className={classes.closeBtn} size='large' color='secondary' onClick={toggleShowMenu}>
                    <ChevronLeftRoundedIcon/>
                </Fab>}
                <SwipeableViews
                    containerStyle={{WebkitOverflowScrolling: 'touch'}}
                    axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                    index={value}
                    disabled={disableSwitching}
                    className={classes.root}
                    onChangeIndex={handleChange}>
                    {views}
                </SwipeableViews>
                <ButtonComponent selectedState={selectedState} showMenu={showMenu} isMobile={isMobile}
                                 handleStateChange={handleStateChange} {...props}/>
            </>
        );
    };

export default LeftMenu;
