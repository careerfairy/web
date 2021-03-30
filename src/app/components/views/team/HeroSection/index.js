import PropTypes from 'prop-types'
import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Container} from "@material-ui/core";
import Section from "./Section";
import SectionHeader from "./SectionHeader";

const useStyles = makeStyles(theme => ({
    container: {
        zIndex: 1,
        "&.MuiContainer-root": {
            position: "relative"
        }
    },
}));

const HeroSection = (props) => {

    const classes = useStyles()

    return (
        <Section
            color={props.color}
            backgroundImage={props.backgroundImage}
            backgroundImageOpacity={props.backgroundImageOpacity}
        >
            <Container className={classes.container}>
                <SectionHeader
                    color={props.color}
                    title={props.title}
                    subtitle={props.subtitle}
                />
            </Container>
        </Section>
    );
};

HeroSection.propTypes = {
    backgroundImage: PropTypes.string,
    backgroundImageOpacity: PropTypes.number,
    color: PropTypes.string,
    subtitle: PropTypes.string,
    title: PropTypes.string
}
export default HeroSection;

