import React, {useEffect, useState} from 'react';
import {Fab, Grow} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import ScrollToTopIcon from '@material-ui/icons/ExpandLessRounded';

const useStyles = makeStyles(theme => ({
    scrollTop: {
        position: "fixed",
        bottom: "20px",
        right: "5%",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        [theme.breakpoints.down("sm")]: {
            width: 50,
            height: 50,
        },

    },
}));
const ScrollToTop = () => {
    const classes = useStyles()
    const [showScroll, setShowScroll] = useState(false)

    useEffect(() => {
        window.addEventListener('scroll', checkScrollTop)
        return () => window.removeEventListener('scroll', checkScrollTop)
    }, [showScroll]);


    const checkScrollTop = () => {
        if (!showScroll && window.pageYOffset > 400) {
            setShowScroll(true)
        } else if (showScroll && window.pageYOffset <= 400) {
            setShowScroll(false)
        }
    };

    const scrollTop = () => {
        window.scrollTo({top: 0, behavior: 'smooth'});
    };


    return (
        <Grow in={showScroll}>
            <Fab
                className={classes.scrollTop}
                onClick={scrollTop}
                color="primary"
                aria-label="scroll-to-top"
            >
                <ScrollToTopIcon fontSize="large"/>
            </Fab>
        </Grow>
    );
}

export default ScrollToTop;