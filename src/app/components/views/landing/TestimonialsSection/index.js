import PropTypes from 'prop-types'
import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import Section from "components/views/common/Section";
import {Container, Grid} from "@material-ui/core";
import SectionHeader from "components/views/common/SectionHeader";
import TestimonialCard from "./TestimonialCard";

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
        // paddingBottom: theme.spacing(1)
    },
    bookingButton: {
        background: theme.palette.common.white,
        color: theme.palette.secondary.main,
        "&:hover": {
            color: theme.palette.common.white,
        }
    },
    bookADemoHeader: {
        marginBottom: [theme.spacing(2), "!important"]
    },
    testimonialsWrapper: {
        display: "flex",
        // border: "2px solid pink",
        width: "100%"
    }
}));

const TestimonialsSection = (props) => {

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
                    className={classes.bookADemoHeader}
                    title={props.title}
                    subtitle={props.subtitle}
                />
                <Grid container className={classes.testimonialsWrapper}>
                    <Grid item xs={12}>
                        <TestimonialCard
                            position="Employer Branding Expert @Accenture Germany"
                            name="Kristina Neidert"
                            rating={5}
                            avatarUrl={"https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/testimonial-avatars%2Fkristina.png?alt=media&token=ee0eca2f-4be8-4f1a-a1b1-f7da8d9bb48f"}
                            reviewText="Lorem Ipsum is simply dummy text of the printing
                            and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting,
                             remaining essentially unchanged."
                            title={"Amazing"}
                        />
                    </Grid>
                </Grid>
            </Container>
        </Section>
    );
};

export default TestimonialsSection;

TestimonialsSection.propTypes = {
    backgroundColor: PropTypes.any,
    backgroundImage: PropTypes.any,
    backgroundImageClassName: PropTypes.any,
    backgroundImageOpacity: PropTypes.any,
    big: PropTypes.any,
    color: PropTypes.any,
    subtitle: PropTypes.any,
    title: PropTypes.any,
}