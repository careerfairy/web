import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import Section from "../../common/Section";
import SectionHeader from "../../common/SectionHeader";
import {Container} from "@material-ui/core";

const useStyles = makeStyles(theme => ({
    container: {
        zIndex: 1,
        "&.MuiContainer-root": {
            position: "relative"
        },
        color: props => props.color
    },
}));

const SupportHeroSection = (props) => {

    const classes = useStyles({
        color: props.color
    })


    return (
        <Section
            color={props.color}
            big={props.big}
            backgroundImage={props.backgroundImage}
            backgroundImageOpacity={props.backgroundImageOpacity}
            backgroundColor={props.backgroundColor}
        >
            <Container className={classes.container}>
                <SectionHeader
                    color={props.color}
                    title={props.title}
                    hasSearch
                    subtitle={props.subtitle}
                />

            </Container>
        </Section>
    );
};

export default SupportHeroSection;
