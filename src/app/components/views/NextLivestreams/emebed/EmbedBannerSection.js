import React from "react";
import GroupBannerSection from "../GroupBannerSection";

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
