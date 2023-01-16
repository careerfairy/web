import React from "react"
import GroupBannerSection from "../GroupBannerSection"

const EmbedBannerSection = ({
   color = undefined,
   title = undefined,
   value = undefined,
   groupLogo = undefined,
   handleChange = undefined,
   backgroundColor = undefined,
   backgroundImage = undefined,
   tabsColor = undefined,
   backgroundImageOpacity = undefined,
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
