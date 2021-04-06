import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import Section from "../../common/Section";
import SectionHeader from "../../common/SectionHeader";
import {Container} from "@material-ui/core";
import Support from "./Support";

const useStyles = makeStyles(theme => ({
    container: {
        zIndex: 1,
        "&.MuiContainer-root": {
            position: "relative"
        },
        color: props => props.color
    },
}));

const SupportSection = (props) => {

    const classes = useStyles({
        color: props.color
    })


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
                    hasSearch={props.hasSearch}
                    subtitle={props.subtitle}
                />
                <Support title={props.supportTitle}/>
            </Container>
        </Section>
    );
};

export default SupportSection;
