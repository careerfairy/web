import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import Section from "../../common/Section";
import SectionHeader from "../../common/SectionHeader";
import {Container} from "@material-ui/core";
import SupportSearch from "./SupportSearch";

const useStyles = makeStyles(theme => ({
    container: {
        zIndex: 1,
        "&.MuiContainer-root": {
            position: "relative"
        },

    },
}));

const SupportSection = (props) => {

    const classes = useStyles()

    return (
        <Section
            big
            color={props.color}
            backgroundImage={props.backgroundImage}
            backgroundImageOpacity={props.backgroundImageOpacity}
            backgroundColor={props.backgroundColor}
        >
            <Container className={classes.container}>

                <SectionHeader
                    color={props.color}
                    title={props.title}
                    subtitle={props.subtitle}
                />
                <SupportSearch/>
                {/*<Faq*/}
                {/*    items={}*/}
                {/*/>*/}
            </Container>
        </Section>
    );
};

export default SupportSection;
