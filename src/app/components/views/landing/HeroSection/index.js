import PropTypes from "prop-types";
import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import Section from "components/views/common/Section";
import Typography from "@material-ui/core/Typography";
import {Grid, Hidden} from "@material-ui/core";
import HeroButton from "./HeroButton";
import Link from "materialUI/NextNavLink";
import {
    calendarIcon,
    laptopDemo,
    playIcon,
} from "../../../../constants/images";
import SvgIcon from "@material-ui/core/SvgIcon";
import LaptopVideo from "./LaptopVideo";
import Fade from 'react-reveal/Fade';
import Reveal from 'react-reveal/Reveal';
import HeroMessage from "./HeroMessage";

const useStyles = makeStyles((theme) => ({
    section: {
        padding: 0,
    },
    heroContainer: {
        minHeight: "calc(100vh - 60px)",
    },
    subTitle: {
        color: theme.palette.text.secondary,
        fontWeight: 500,
    },

    heroContent: {
        padding: theme.spacing(0, 5),
        maxWidth: 780,
    },
    heroContentWrapper: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
    },
    laptopVideoWrapper: {
        display: "flex",
        alignItems: "center"
    },
}));


const HeroSection = (props) => {
    const classes = useStyles();

    return (
        <Section
            big={props.big}
            className={classes.section}
            color={props.color}
            backgroundImageClassName={props.backgroundImageClassName}
            backgroundImage={props.backgroundImage}
            backgroundImageOpacity={props.backgroundImageOpacity}
            backgroundColor={props.backgroundColor}
        >
            <Grid className={classes.heroContainer} spacing={2} container>
                <Grid
                    className={classes.heroContentWrapper}
                    item
                    xs={12}
                    md={12}
                    lg={6}
                >
                    <Fade up>
                        <HeroMessage handleOpenCalendly={props.handleOpenCalendly}/>
                    </Fade>
                </Grid>
                <Grid
                    className={classes.laptopVideoWrapper}
                    item
                    xs={12}
                    md={12}
                    lg={6}
                >
                    <Fade down>
                        <LaptopVideo/>
                    </Fade>
                </Grid>
            </Grid>
        </Section>
    );
};

export default HeroSection;

HeroSection.propTypes = {
    backgroundColor: PropTypes.any,
    backgroundImage: PropTypes.any,
    backgroundImageClassName: PropTypes.any,
    backgroundImageOpacity: PropTypes.any,
    big: PropTypes.any,
    color: PropTypes.any,
    handleOpenCalendly: PropTypes.func,
    subtitle: PropTypes.any,
    title: PropTypes.any,
};
