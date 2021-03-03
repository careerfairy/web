import React, {useEffect, useState} from 'react';
import {withFirebase} from "../../../../context/firebase";
import ButtonComponent from "../sharedComponents/ButtonComponent";
import PollCategory from "./categories/PollCategory";
import HandRaiseCategory from "./categories/HandRaiseCategory";
import QuestionCategory from "../sharedComponents/QuestionCategory";
import {makeStyles, useTheme} from "@material-ui/core/styles";
import {TabPanel} from "../../../../materialUI/GlobalPanels/GlobalPanels";
import SwipeableViews from "react-swipeable-views";
import clsx from "clsx";

const useStyles = makeStyles(theme => ({
    root: {},
    viewRoot: {
        position: "relative",
        height: "100%",
        // backgroundColor: "rgb(220,220,220)",
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
const LeftMenu = ({showMenu, livestream, streamer, setShowMenu, toggleShowMenu, className, ...props}) => {
    const theme = useTheme()
    const classes = useStyles()
    const [selectedState, setSelectedState] = useState("questions");
    const [value, setValue] = useState(0);
    const [sliding, setSliding] = useState(false);


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
        if (streamer) {
            setSliding(true)
        }
        setSelectedState(state);
    }

    const handleChange = (event) => {
        setSliding(true)
        setValue(event);
        setSelectedState(states[event])
    }

    const views = [
        <TabPanel key={0} value={value} index={0} dir={theme.direction}>
            <QuestionCategory
                sliding={sliding}
                showMenu={showMenu}
                streamer={streamer}
                isMobile={false}
                livestream={livestream}
                selectedState={selectedState}
            />
        </TabPanel>,
        <TabPanel key={1} value={value} index={1} dir={theme.direction}>
            <PollCategory sliding={sliding} showMenu={showMenu} livestream={livestream} selectedState={selectedState}
                          streamer={streamer}/>
        </TabPanel>,
        <TabPanel key={2} value={value} index={2} dir={theme.direction}>
            <HandRaiseCategory sliding={sliding} showMenu={showMenu} livestream={livestream}
                               selectedState={selectedState}/>
        </TabPanel>
    ]

    return (
        <div className={clsx(classes.root, className)}>
            <SwipeableViews
                containerStyle={{WebkitOverflowScrolling: 'touch'}}
                axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                index={value}
                onTransitionEnd={() => setSliding(false)}
                className={classes.viewRoot}
                onChangeIndex={handleChange}>
                {views}
            </SwipeableViews>
            <ButtonComponent
                setShowMenu={setShowMenu}
                streamer={streamer}
                setSliding={setSliding}
                selectedState={selectedState}
                showMenu={showMenu}
                handleStateChange={handleStateChange} {...props}/>
        </div>
    )
};

export default withFirebase(LeftMenu);
