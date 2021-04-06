import PropTypes from 'prop-types'
import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import clsx from "clsx";
import {Box} from "@material-ui/core";
import BackgroundImage from "../BackgroundImage";
import SupportNav from "../../support/SupportNav";

const useStyles = makeStyles(theme => ({
    sectionComponent: {
        backgroundColor: (props) => props.backgroundColor,
        display: "block",
        position: "relative",
        [theme.breakpoints.up("sm")]: {
            paddingTop: (props) => props.big ? 160 : 80,
            paddingBottom: (props) => props.big ? 160 : 80
        },
        [theme.breakpoints.down("sm")]: {
            paddingTop: 48,
            paddingBottom: 48
        },
    },
    isWhite: {
        borderTop: `1px solid ${theme.palette.text.secondary}`
    }
}));

const Section = (props) => {
    const {
        color,
        backgroundImage,
        backgroundImageOpacity,
        backgroundImageRepeat,
        children,
        backgroundColor,
        big,
        // Passed to section element
        ...otherProps
    } = props;

    const classes = useStyles({
        backgroundColor: backgroundColor,
        big: big
    })

    return (
        <Box
            component="section"
            className={
                clsx(classes.sectionComponent)
            }
            {...otherProps}
        >
            {props.children}
            {backgroundImage && (
                <BackgroundImage
                    image={backgroundImage}
                    opacity={backgroundImageOpacity}
                    repeat={backgroundImageRepeat}
                />
            )}
        </Box>
    );
}
Section.propTypes = {
    backgroundImage: PropTypes.string,
    backgroundImageOpacity: PropTypes.number,
    backgroundImageRepeat: PropTypes.bool,
    children: PropTypes.any,
    color: PropTypes.string,
    big: PropTypes.bool,
}

export default Section;

