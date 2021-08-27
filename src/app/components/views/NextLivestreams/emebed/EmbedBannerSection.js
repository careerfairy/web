import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import GroupBannerSection from "../GroupBannerSection";

const useStyles = makeStyles((theme) => ({}));

const EmbedBannerSection = ({
  color,
  title,
  value,
  groupLogo,
  handleChange,
  backgroundColor,
  backgroundImage,
  backgroundImageOpacity,
}) => {
  const classes = useStyles();

  return (
    <GroupBannerSection
      color={color}
      title={title}
      value={value}
      big={false}
      groupLogo={groupLogo}
      handleChange={handleChange}
      backgroundColor={backgroundColor}
      backgroundImage={backgroundImage}
      backgroundImageOpacity={backgroundImageOpacity}
    />
  );
};

export default EmbedBannerSection;
