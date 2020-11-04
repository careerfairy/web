import React, { useEffect, useState} from 'react';
import {withFirebase} from "../../../../context/firebase";
import ButtonComponent from "../sharedComponents/ButtonComponent";
import PollCategory from "./categories/PollCategory";
import HandRaiseCategory from "./categories/HandRaiseCategory";
import QuestionCategory from "../sharedComponents/QuestionCategory";
import {makeStyles, useTheme} from "@material-ui/core/styles";
import {TabPanel} from "../../../../materialUI/GlobalPanels/GlobalPanels";
import SwipeableViews from "react-swipeable-views";

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


const states = ["questions", "polls", "hand"]
const LeftMenu = ({showMenu, livestream, streamer, setShowMenu, toggleShowMenu, ...props}) => {
    const theme = useTheme()
    const classes = useStyles()
    const [selectedState, setSelectedState] = useState("questions");
    const [value, setValue] = useState(0);


    useEffect(() => {
        if (!typeof window === 'object') {
            return false;
        }

        function handleResize() {
            if (window.innerWidth < 996) {
                setShowMenu(false);
            }
            if (window.innerWidth > 1248) {
                setShowMenu(true);
            }
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (selectedState === "questions") {
            setValue(0)
        } else if (selectedState === "polls") {
            setValue(1)
        } else if (selectedState === "hand") {
            setValue(2)
        }
    }, [selectedState, showMenu])

    function handleStateChange(state) {
        if (!showMenu) {
            setShowMenu(true);
        }
        setSelectedState(state);
    }

    const handleChange = (event) => {
        setValue(event);
        setSelectedState(states[event])
    }

    const views = [
        <TabPanel key={0} value={value} index={0} dir={theme.direction}>
            <QuestionCategory showMenu={showMenu} streamer={streamer} {...props} livestream={livestream} selectedState={selectedState}/>
        </TabPanel>,
        <TabPanel key={1} value={value} index={1} dir={theme.direction}>
            <PollCategory showMenu={showMenu} livestream={livestream} selectedState={selectedState} streamer={streamer}/>
        </TabPanel>,
        <TabPanel key={2} value={value} index={2} dir={theme.direction}>
            <HandRaiseCategory livestream={livestream} selectedState={selectedState}/>
        </TabPanel>
    ]

    return (
        <>
            <SwipeableViews
                containerStyle={{WebkitOverflowScrolling: 'touch'}}
                axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                index={value}
                className={classes.root}
                onChangeIndex={handleChange}>
                {views}
            </SwipeableViews>
            <ButtonComponent
                setShowMenu={setShowMenu}
                streamer={streamer}
                selectedState={selectedState}
                showMenu={showMenu}
                handleStateChange={handleStateChange} {...props}/>
        </>
    )
};

export default withFirebase(LeftMenu);
