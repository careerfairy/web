import React from "react"
import GroupBannerSection from "../GroupBannerSection"

const EmbedBannerSection = ({
   color,
   title,
   value,
   groupLogo,
   handleChange,
   backgroundColor,
   backgroundImage,
   tabsColor,
   backgroundImageOpacity,
}) => {
   return (
      <GroupBannerSection
         color={color}
         title={title}
         value={value}
         big={false}
         disableSectionPadding
         groupLogo={groupLogo}
         tabsColor={tabsColor}
         handleChange={handleChange}
         backgroundColor={backgroundColor}
         backgroundImage={backgroundImage}
         backgroundImageOpacity={backgroundImageOpacity}
      />
   )
}

export default EmbedBannerSection
