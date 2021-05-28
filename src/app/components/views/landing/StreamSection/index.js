import PropTypes from 'prop-types'
import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import Section from "components/views/common/Section";
import {Container} from "@material-ui/core";
import SectionHeader from "components/views/common/SectionHeader";
import {analyticsPreviewImage, analyticsSVG, streamerImage} from "../../../../constants/images";
import {getResizedUrl} from "../../../helperFunctions/HelperFunctions";

const useStyles = makeStyles(theme => ({
    container: {
        zIndex: 1,
        "&.MuiContainer-root": {
            position: "relative"
        },
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
    },
    section: {
    },
    bookingButton: {
        background: theme.palette.common.white,
        color: theme.palette.secondary.main,
        "&:hover": {
            color: theme.palette.common.white,
        }
    },
    testimonialsWrapper: {
        display: "flex",
        width: "100%"
    },
    subTitle: {
        color: theme.palette.text.secondary,
        fontWeight: 500
    },
    title: {
    },
    streamerImage: {
        width: "100%",
        height: "auto",
        maxWidth: 1200,
        boxShadow: theme.shadows[15]
    },
    imagesWrapper: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
    }
}));

const StreamSection = (props) => {

    const classes = useStyles()

    return (
        <Section
            className={classes.section}
            big={props.big}
            color={props.color}
            backgroundImageClassName={props.backgroundImageClassName}
            backgroundImage={props.backgroundImage}
            backgroundImageOpacity={props.backgroundImageOpacity}
            backgroundColor={props.backgroundColor}
        >
            <Container className={classes.container}>
                <SectionHeader
                    color={props.color}
                    subTitleClassName={classes.subTitle}
                    titleClassName={classes.title}
                    title={props.title}
                    subtitle={props.subtitle}
                />
                <div className={classes.imagesWrapper}>
                    <img className={classes.streamerImage} src={streamerImage} alt="analytics"/>
                </div>
            </Container>
        </Section>
    );
};

export default StreamSection;

StreamSection.propTypes = {
    backgroundColor: PropTypes.any,
    backgroundImage: PropTypes.any,
    backgroundImageClassName: PropTypes.any,
    backgroundImageOpacity: PropTypes.any,
    big: PropTypes.any,
    color: PropTypes.any,
    subtitle: PropTypes.any,
    title: PropTypes.any,
}