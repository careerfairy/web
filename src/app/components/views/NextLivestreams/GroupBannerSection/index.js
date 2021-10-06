import React from "react";
import { Avatar, Container, Paper } from "@material-ui/core";
import SectionHeader from "../../common/SectionHeader";
import Section from "../../common/Section";
import StreamsTab from "../StreamsTab";
import GroupBio from "./groupBio";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  container: {
    zIndex: 1,
    "&.MuiContainer-root": {
      position: "relative",
    },
  },
  logoWrapper: {
    maxWidth: 400,
    margin: "auto",
    height: 200,
    marginBottom: theme.spacing(2),
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
    paddingBottom: theme.spacing(1),
  },
  disableSectionPadding: {
    paddingTop: 0,
  },
}));

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
  const classes = useStyles();

  return (
    <Section
      className={clsx(classes.section, {
        [classes.disableSectionPadding]: disableSectionPadding,
      })}
      big={big}
      color={color}
      backgroundImageClassName={backgroundImageClassName}
      backgroundImage={backgroundImage}
      backgroundImageOpacity={backgroundImageOpacity}
      backgroundColor={backgroundColor}
    >
      <Container className={classes.container}>
        {groupLogo && (
          <Paper className={classes.logoWrapper}>
            <Avatar
              variant={"square"}
              className={classes.logo}
              src={groupLogo}
            />
          </Paper>
        )}
        <SectionHeader color={color} title={title} subtitle={subtitle} />
        {groupBio && <GroupBio groupBio={groupBio} />}
        <StreamsTab tabsColor={tabsColor} handleChange={handleChange} value={value} />
      </Container>
    </Section>
  );
};

export default GroupBannerSection;
