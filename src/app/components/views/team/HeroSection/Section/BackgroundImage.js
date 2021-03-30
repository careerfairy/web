import PropTypes from 'prop-types'
import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import clsx from "clsx";

const useStyles = makeStyles(theme => ({
    backgroundImage: {
        backgroundImage: (props) => `url(${props.image})`,
        opacity: (props) => props.opacity,
        backgroundPosition: "center center",
        backgroundSize: "cover",
        top: "0",
        left: "0",
        bottom: "0",
        right: "0",
        position: "absolute",
        zIndex: -1,
    },
    repeat: {
        backgroundSize: "auto",
        backgroundPosition: "0% 0%",
        backgroundRepeat: "true"
    }
}));

const BackgroundImage = ({image, opacity, repeat}) => {
    const classes = useStyles({
        opacity: opacity,
        image: image
    })
    return (
        <div
            className={clsx(classes.backgroundImage, {
                [classes.repeat]: repeat
            })}
        />
    );
}

export default BackgroundImage;

BackgroundImage.propTypes = {
    image: PropTypes.string,
    opacity: PropTypes.number,
    repeat: PropTypes.bool
}