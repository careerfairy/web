import PropTypes from 'prop-types'
import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import Section from "components/views/common/Section";
import {Container, Grid} from "@material-ui/core";
import SectionHeader from "components/views/common/SectionHeader";
import {analyticsPreviewImage, analyticsSVG, rectangle1} from "../../../../constants/images";
import {getResizedUrl} from "../../../helperFunctions/HelperFunctions";
import clsx from "clsx";

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
        position: "relative"
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
    graphicIllustration: {
        width: "100%",
        height: "auto",
        maxWidth: 600,
    },
    analyticsPreviewImage: {
        zIndex: 1,
        width: "100%",
        height: "auto",
        maxWidth: 1200,
        marginTop: "-2%",
        boxShadow: theme.shadows[15]
    },
    imagesWrapper: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
    },
    analyticsImage:{
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right bottom",
    },
    backgroundRectangle:{
        position: "absolute",
        bottom: "-13%",
        right:"-50%",
        width: "100%",
        height: "auto"
    }
}));

const AnalyticsSection = (props) => {

    const classes = useStyles()

    return (
        <Section
            className={classes.section}
            big={props.big}
            color={props.color}
            backgroundImageClassName={clsx(props.backgroundImageClassName, classes.analyticsImage)}
            backgroundImage={props.backgroundImage}
            backgroundImageOpacity={props.backgroundImageOpacity}
            backgroundColor={props.backgroundColor}
        >
            <img className={classes.backgroundRectangle} alt="background-rectangle" src={rectangle1}/>
            <Container className={classes.container}>
                <SectionHeader
                    color={props.color}
                    subTitleClassName={classes.subTitle}
                    titleClassName={classes.title}
                    title={props.title}
                    subtitle={props.subtitle}
                />
                <div className={classes.imagesWrapper}>
                    <img className={classes.graphicIllustration} src={analyticsSVG} alt="analytics"/>
                    <img className={classes.analyticsPreviewImage} src={analyticsPreviewImage} alt="analytics"/>
                </div>
            </Container>
        </Section>
    );
};

export default AnalyticsSection;

AnalyticsSection.propTypes = {
    backgroundColor: PropTypes.any,
    backgroundImage: PropTypes.any,
    backgroundImageClassName: PropTypes.any,
    backgroundImageOpacity: PropTypes.any,
    big: PropTypes.any,
    color: PropTypes.any,
    subtitle: PropTypes.any,
    title: PropTypes.any,
}