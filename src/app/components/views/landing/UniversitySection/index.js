import PropTypes from "prop-types";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Section from "components/views/common/Section";
import SectionHeader from "components/views/common/SectionHeader";
import landingUniversities from "../../../../constants/landingUniversities";
import SectionContainer from "../../common/Section/Container";

const useStyles = makeStyles((theme) => ({
   subTitle: {
      color: theme.palette.text.secondary,
      fontWeight: 500,
   },
   imagesWrapper: {
      display: "flex",
      flexWrap: "wrap",
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
   },
   universityLogo: {
      width: "auto",
      height: "50px",
      margin: theme.spacing(2),
      transition: theme.transitions.create("transform", {
         duration: theme.transitions.duration.short,
         easing: theme.transitions.easing.easeInOut,
      }),
      "&:hover": {
         transform: "scale(1.1) rotate(1deg)",
      },
   },
}));

const UniversitySection = (props) => {
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
               subTitleClassName={classes.subTitle}
               title={props.title}
               subtitle={props.subtitle}
            />
            <div className={classes.imagesWrapper}>
               {landingUniversities.map(
                  ({ name, imageUrlDark, imageUrlMain, website }) => (
                     <a key={name} target="_blank" href={website}>
                        <img
                           className={classes.universityLogo}
                           src={imageUrlMain}
                           alt={name}
                        />
                     </a>
                  )
               )}
            </div>
         </SectionContainer>
      </Section>
   );
};

export default UniversitySection;

UniversitySection.propTypes = {
   backgroundColor: PropTypes.any,
   backgroundImage: PropTypes.any,
   backgroundImageClassName: PropTypes.any,
   backgroundImageOpacity: PropTypes.any,
   big: PropTypes.any,
   color: PropTypes.any,
   subtitle: PropTypes.any,
   title: PropTypes.any,
};
