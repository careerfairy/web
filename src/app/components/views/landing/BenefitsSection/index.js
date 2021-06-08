import PropTypes from "prop-types";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Section from "components/views/common/Section";
import SectionHeader from "components/views/common/SectionHeader";
import SectionContainer from "../../common/Section/Container";
import {
   engageShape,
   measureShape,
   reachShape,
} from "../../../../constants/images";
import BenefitCard from "./BenefitCard";
import { Grid } from "@material-ui/core";
import MuiGridFade from "../../../../materialUI/animations/MuiGridFade";

const useStyles = makeStyles((theme) => ({
   subTitle: {
      color: theme.palette.text.secondary,
      fontWeight: 500,
   },
   benefitsWrapper: {},
   // title: {
   //    fontSize: "4.5rem",
   //    fontWeight: 500,
   //    [theme.breakpoints.down("xs")]: {
   //       fontSize: "3.5rem",
   //    },
   // },
}));

const benefitsData = [
    {
        name: "Fun career events",
        description:
            "A highly interactive format " +
            "developed for a young " +
            "audience worldwide",
        imageUrl: engageShape,
    },
    {
        name: "Reach more talents",
        description:
            "We promote your events to " +
            "the CareerFairy community " +
            "and universities",
        imageUrl: reachShape,
    },
    {
        name: "Measure the success",
        description:
            "Demonstrate the success of " +
            "your events through " +
            "detailed analytics",
        imageUrl: measureShape,
    },
];

const BenefitsSection = (props) => {
    const classes = useStyles();

    return (
        <Section
            big={props.big}
            color={props.color}
            backgroundImageClassName={props.backgroundImageClassName}
            backgroundImage={props.backgroundImage}
            backgroundImageOpacity={props.backgroundImageOpacity}
            backgroundColor={props.backgroundColor}
        >
            <SectionContainer>
                <SectionHeader
                    color={props.color}
                    // titleClassName={classes.title}
                    subTitleClassName={classes.subTitle}
                    title={props.title}
                    subtitle={props.subtitle}
                />
                <Grid
                    justify="space-around"
                    container
                    spacing={2}
                    className={classes.benefitsWrapper}
                >
                    {benefitsData.map(({name, imageUrl, description}, index) => (
                        <Grid item xs={12} sm={6} md={4} key={name}>
                            <MuiGridFade
                              index={index}
                              up
                            >
                                <BenefitCard
                                    name={name}
                                    imageUrl={imageUrl}
                                    description={description}
                                />
                            </MuiGridFade>
                        </Grid>
                    ))}
                </Grid>
            </SectionContainer>
        </Section>
    );
};

export default BenefitsSection;

BenefitsSection.propTypes = {
    backgroundColor: PropTypes.any,
    backgroundImage: PropTypes.any,
    backgroundImageClassName: PropTypes.any,
    backgroundImageOpacity: PropTypes.any,
    big: PropTypes.any,
    color: PropTypes.any,
    subtitle: PropTypes.any,
    title: PropTypes.any,
};
