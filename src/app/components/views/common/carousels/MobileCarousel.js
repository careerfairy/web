import React from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import PropTypes from "prop-types";
import SwipeableViews from "react-swipeable-views";
import SpeakerInfoCard from "../stream-cards/SpeakerInfoCard";
import { autoPlay } from "react-swipeable-views-utils";
import { Typography } from "@material-ui/core";

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    padding: theme.spacing(1),
  },
  arrow: {
    [theme.breakpoints.down("md")]: {
      display: ["none", "!important"],
    },
    zIndex: 1,
    "&:before": {
      display: ["none", "!important"],
    },
  },
  title: {
    color: theme.palette.common.white,
  },
}));

const MobileCarousel = ({ data, title }) => {
  const classes = useStyles();
  const theme = useTheme();
  const [activeStep, setActiveStep] = React.useState(0);
  const maxSteps = data.length;

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  return (
    <div className={classes.root}>
      {title && <Typography gutterBottom variant="h5" className={classes.title}>{title}</Typography>}
      <AutoPlaySwipeableViews
        axis={theme.direction === "rtl" ? "x-reverse" : "x"}
        index={activeStep}
        onChangeIndex={handleStepChange}
        slideStyle={{
          display: "flex",
          alignItems: "flex-end"
        }}
        enableMouseEvents
      >
        {data.map((speaker, index) => (
          <div key={speaker.label}>
            {Math.abs(activeStep - index) <= 2 ? (
              <SpeakerInfoCard
                imgPath={speaker.imgPath}
                label={speaker.label}
                subLabel={speaker.subLabel}
              />
            ) : null}
          </div>
        ))}
      </AutoPlaySwipeableViews>
      {/*<MobileStepper*/}
      {/*  steps={maxSteps}*/}
      {/*  position="static"*/}
      {/*  variant="dots"*/}
      {/*  activeStep={activeStep}*/}
      {/*/>*/}
    </div>
  );
};

export default MobileCarousel;

MobileCarousel.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      imgPath: PropTypes.string,
      subLabel: PropTypes.string,
    })
  ),
  title: PropTypes.string,
};
