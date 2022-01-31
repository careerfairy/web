import React from "react";
import { Avatar, Container, Paper } from "@mui/material";
import SectionHeader from "../../common/SectionHeader";
import Section from "../../common/Section";
import StreamsTab from "../StreamsTab";
import GroupBio from "./groupBio";

const styles = {
   container: {
      zIndex: 1,
      "&.MuiContainer-root": {
         position: "relative",
      },
   },
   logoWrapper: {
      maxWidth: "400px",
      margin: "auto",
      height: "200px",
      marginBottom: (theme) => theme.spacing(2),
      display: "grid",
      placeItems: "center",
   },
   logo: {
      width: "90%",
      height: "90%",
      "& img": {
         objectFit: "contain",
      },
   },
   section: {
      paddingBottom: (theme) => [theme.spacing(1), "!important"],
   },
   disableSectionPadding: {
      paddingTop: "0 !important",
   },
};

const GroupBannerSection = ({
   backgroundColor,
   backgroundImage,
   backgroundImageClassName,
   disableSectionPadding,
   backgroundImageOpacity,
   big,
   color,
   groupBio,
   groupLogo,
   handleChange,
   subtitle,
   title,
   tabsColor,
   value,
}) => {
   return (
      <Section
         sx={{
            ...styles.section,
            ...(disableSectionPadding && styles.disableSectionPadding),
         }}
         big={big}
         color={color}
         backgroundImageClassName={backgroundImageClassName}
         backgroundImage={backgroundImage}
         backgroundImageOpacity={backgroundImageOpacity}
         backgroundColor={backgroundColor}
      >
         <Container sx={styles.container}>
            {groupLogo && (
               <Paper sx={styles.logoWrapper}>
                  <Avatar variant={"square"} sx={styles.logo} src={groupLogo} />
               </Paper>
            )}
            <SectionHeader color={color} title={title} subtitle={subtitle} />
            {groupBio && <GroupBio groupBio={groupBio} />}
            <StreamsTab
               tabsColor={tabsColor}
               handleChange={handleChange}
               value={value}
            />
         </Container>
      </Section>
   );
};

export default GroupBannerSection;
