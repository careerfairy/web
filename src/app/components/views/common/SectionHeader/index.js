import PropTypes from 'prop-types'
import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import clsx from "clsx";
import {Typography} from "@material-ui/core";

const useStyles = makeStyles(theme => ({
    sectionHeader: {
        color: (props) => props.color,
        // Add bottom margin if element below
        "&:not(:last-child)": {
            marginBottom: "3rem"
        }
    },
    subtitle: {
        // Subtitle text generally isn't very long
        // so usually looks better to limit width.
        maxWidth: "700px",
        // So we can have max-width but still
        // have alignment controlled by text-align.
        display: "inline-block"
    }
}));

function SectionHeader(props) {
    const classes = useStyles({
        color: props.color
    })
    // Render nothing if no title or subtitle
    if (!props.title && !props.subtitle) {
        return null;
    }

    return (
        <header className={clsx(classes.sectionHeader, props.className)}>
            {props.title && (
                <Typography align="center" variant="h3">
                    {props.title}
                </Typography>
            )}

            {props.subtitle && (
                <Typography align="center" variant="subtitle1">
                    <span className={classes.subtitle}>{props.subtitle}</span>
                </Typography>
            )}
        </header>
    );
}

SectionHeader.propTypes = {
    className: PropTypes.string,
    subtitle: PropTypes.string,
    title: PropTypes.string,
    color: PropTypes.string,
}

export default SectionHeader;

