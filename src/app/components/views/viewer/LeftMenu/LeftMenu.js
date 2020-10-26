import React, {Fragment, useEffect, useState} from 'react';
import {makeStyles, useTheme} from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import SwipeableViews from "react-swipeable-views";
import {ButtonComponent} from "../comment-container/ButtonComponent";
import ChevronLeftRoundedIcon from "@material-ui/icons/ChevronLeftRounded";
import {Fab} from "@material-ui/core";
import ChatCategory from "../../streaming/comment-container/categories/ChatCategory";
import QuestionCategory from "../comment-container/categories/QuestionCategory";
import PollCategory from "../comment-container/categories/PollCategory";
import HandRaiseCategory from "../comment-container/categories/HandRaiseCategory";


const useStyles = makeStyles(theme => ({
    root: {
        position: "relative",
        height: "100%",
        width: "100%",
    },
    closeBtn: {
        position: "fixed",
        top: 10,
        right: 10,
        textAlign: "center",
        zIndex: 9100,
    }
}))

function a11yProps(index) {
    return {
        id: `full-width-tab-${index}`,
        'aria-controls': `full-width-tabpanel-${index}`,
    };
}

function TabPanel({children, value, index, ...other}) {

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box>
                    {children}
                </Box>
            )}
        </div>
    );
}


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

        useEffect(() => {
            if (selectedState === "questions") {
                setValue(0)
            } else if (selectedState === "polls") {
                setValue(1)
            } else if (selectedState === "chat") {
                setValue(2)
            } else if (selectedState === "hand") {
                setValue(3)
            }
        }, [selectedState])

        function handleStateChange(state) {
            if (!showMenu) {
                setShowMenu(true);
            }
            setSelectedState(state);
        }

        const handleChange = (event, newValue) => {
            setValue(newValue);
        }


        if (!showMenu) {
            return (
                <Fragment>
                    <ButtonComponent isMobile={isMobile} handleStateChange={handleStateChange} {...props}/>
                </Fragment>
            );
        }

        const views = [
            <TabPanel value={value} index={0} dir={theme.direction}>
                <QuestionCategory livestream={livestream} selectedState={selectedState} user={user}
                                  userData={userData}/>
            </TabPanel>,
            <TabPanel value={value} index={1} dir={theme.direction}>
                <PollCategory livestream={livestream} selectedState={selectedState}
                              setSelectedState={setSelectedState} setShowMenu={setShowMenu}
                              streamer={streamer} user={user} userData={userData}/>
            </TabPanel>,
            <TabPanel value={value} index={2} dir={theme.direction}>
                <ChatCategory livestream={livestream} selectedState={selectedState} user={user}
                              userData={userData} isStreamer={false}/>
            </TabPanel>,
            <TabPanel value={value} index={3} dir={theme.direction}>
                <HandRaiseCategory livestream={livestream} selectedState={selectedState} user={user}
                                   userData={userData} handRaiseActive={handRaiseActive}
                                   setHandRaiseActive={setHandRaiseActive}/>
            </TabPanel>
        ]


        return (
            <>
                {isMobile && <Fab size='large' color='secondary' onClick={toggleShowMenu}>
                    <ChevronLeftRoundedIcon/>
                </Fab>}
                <SwipeableViews
                    containerStyle={{WebkitOverflowScrolling: 'touch'}}
                    axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                    index={value}
                    className={classes.root}
                    onChangeIndex={handleChange}>
                    {views}
                </SwipeableViews>
                <ButtonComponent selectedState={selectedState} handleStateChange={handleStateChange}
                                 isMobile={isMobile} {...props}/>
            </>
        );
    };

export default LeftMenu;
