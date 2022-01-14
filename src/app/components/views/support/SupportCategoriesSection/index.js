import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Container} from "@material-ui/core";
import Section from "../../common/Section";
import SectionHeader from "../../common/SectionHeader";
import Support from "./Support";

const useStyles = makeStyles(theme => ({}));
const SupportCategoriesSection = (props) => {
    const classes = useStyles()

    return (
        <Section
            color={props.color}
            backgroundImage={props.backgroundImage}
            backgroundImageOpacity={props.backgroundImageOpacity}
        >
            <Container>
                <SectionHeader
                    title={props.title}
                    subtitle={props.subtitle}
                    color={props.color}
                    hasSearch={props.hasSearch}
                />
                <Support/>
            </Container>
        </Section>
    );
};

export default SupportCategoriesSection;
