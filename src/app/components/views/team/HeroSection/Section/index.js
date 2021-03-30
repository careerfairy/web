import PropTypes from 'prop-types'
import React from "react";
import BackgroundImage from "./BackgroundImage";
import {makeStyles} from "@material-ui/core/styles";
import clsx from "clsx";

const useStyles = makeStyles(theme => ({
    sectionComponent: {
        backgroundColor: theme.palette.navyBlue.main,
        display: "block",
        position: "relative",
        [theme.breakpoints.up("sm")]: {
            paddingTop: 160,
            paddingBottom: 160
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
        // Passed to section element
        ...otherProps
    } = props;

    const classes = useStyles()

    return (
        <section
            className={
                // "SectionComponent hero section is-block is-relative" +
                clsx(classes.sectionComponent, {
                    [classes.isWhite]: color === "white"
                })
            }
            {...otherProps}
        >
            {backgroundImage && (
                <BackgroundImage
                    image={backgroundImage}
                    opacity={backgroundImageOpacity}
                    repeat={backgroundImageRepeat}
                />
            )}
            {props.children}
        </section>
    );
}
Section.propTypes = {
    backgroundImage: PropTypes.string,
    backgroundImageOpacity: PropTypes.number,
    backgroundImageRepeat: PropTypes.bool,
    children: PropTypes.any,
    color: PropTypes.string
}

export default Section;

