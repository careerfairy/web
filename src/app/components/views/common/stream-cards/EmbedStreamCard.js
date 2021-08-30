import React, { useCallback, useEffect, useState } from "react";
import cx from "clsx";
import { alpha, makeStyles, useTheme } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import Box from "@material-ui/core/Box";
import CardMedia from "@material-ui/core/CardMedia";
import { useCoverCardMediaStyles } from "@mui-treasury/styles/cardMedia/cover";
import { Item, Row } from "@mui-treasury/components/flex";
import {
  getBaseUrl,
  getResizedUrl,
} from "../../../helperFunctions/HelperFunctions";
import {
  Button,
  Slide,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@material-ui/core";
import { AvatarGroup } from "@material-ui/lab";
import { MainLogo } from "../../../logos";
import RegisterIcon from "@material-ui/icons/AddToPhotosRounded";
import LibraryBooksIcon from "@material-ui/icons/LibraryBooks";
import EmbedTimeDisplay from "../time-display/EmbedTimeDisplay";
import MobileCarousel from "../carousels/MobileCarousel";

const useStyles = makeStyles((theme) => ({
  color: ({ color }) => ({
    "&:before": {
      backgroundColor: color,
    },
  }),
  root: {
    position: "relative",
    borderRadius: "1rem",
    "&:before": {
      transition: "0.2s",
      position: "absolute",
      width: "100%",
      height: "100%",
      content: '""',
      display: "block",
      borderRadius: "1rem",
      zIndex: 0,
      bottom: 0,
    },
    "&:hover": {
      "&:before": {
        bottom: -6,
      },
      "& $logo": {
        transform: "scale(1.1)",
        boxShadow: "0 6px 20px 0 rgba(0,0,0,0.38)",
      },
    },
  },
  cover: {
    borderRadius: "1rem",
    "&:before": {
      content: '""',
      borderRadius: "1rem",
      position: "absolute",
      left: "0",
      right: "0",
      top: "0",
      bottom: "0",
      background: alpha(theme.palette.common.black, 0.7),
    },
  },
  graphicHovered: {
    backgroundColor: `${theme.palette.primary.main} !important`,
  },
  graphic: {
    transition: theme.transitions.create(["background-color"], {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.standard,
    }),
    content: '""',
    display: "inline-block",
    position: "absolute",
    left: 0,
    top: 0,
    zIndex: 0,
    width: "100%",
    height: "100%",
    clipPath:
      "polygon(0% 100%, 0% 35%, 0.3% 33%, 1% 31%, 1.5% 30%, 2% 29%, 2.5% 28.4%, 3% 27.9%, 3.3% 27.6%, 5% 27%,95% 0%,100% 0%, 100% 100%)",
    borderRadius: "1rem",
    // backgroundColor: alpha(theme.palette.common.black, 0.4),
    //   backdropFilter: "blur(5px)",
  },
  content: ({ color }) => ({
    position: "relative",
    zIndex: 1,
    borderRadius: "1rem",
    "&:before": {},
  }),
  title: {
    fontSize: "1.25rem",
    fontWeight: 500,
    color: theme.palette.common.white,
    margin: 0,
    display: "-webkit-box",
    boxOrient: "vertical",
    lineClamp: 2,
    WebkitLineClamp: 2,
    wordBreak: "break-word",
    overflow: "hidden",
  },
  logo: {
    transition: `${theme.transitions.duration.standard}ms`,
    width: 100,
    height: 100,
    boxShadow: "0 4px 12px 0 rgba(0,0,0,0.24)",
    borderRadius: "1rem",
    background: theme.palette.common.white,
    "& img": {
      objectFit: "contain",
      maxWidth: "90%",
    },
  },
  miniAvatar: {
    height: 50,
    width: 50,
    boxShadow: theme.shadows[10],
  },
  team: {
    fontSize: "0.75rem",
    // color: theme.palette.primary.dark,
  },
  date: {
    color: theme.palette.common.white,
    backgroundColor: ({ color }) => color,
    opacity: 1,
    fontSize: "1rem",
    padding: "0.5rem",
    borderRadius: 12,
    border: "2px solid rgba(255,255,255, 1)",
  },
  careerFairyLogo: {
    width: 80,
  },
  carouselWrapper: {
    zIndex: 1,
    height: 150,
    width: "calc(100% - 72px)",
    display: "flex",
    alignItems: "flex-end",
  },
}));

const CustomCard = ({
  classes,
  cover,
  logo,
  title,
  brand,
  date,
  speakers,
  handleMouseEnter,
  handleMouseLeave,
  hovered,
  isPast,
  logoTooltip,
  showCarousel,
  actionLink,
}) => {
  const mediaStyles = useCoverCardMediaStyles();

  return (
    <Box
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cx(classes.root, classes.color)}
    >
      <Box position="absolute" zIndex={2} top={10} right={10}>
        <Item position={"right"}>
          <EmbedTimeDisplay date={date} />
        </Item>
      </Box>
      <CardMedia
        image={cover}
        className={classes.cover}
        classes={mediaStyles}
      />
      <Box
        style={{
          paddingLeft: 20,
          overflow: "hidden",
        }}
        height={150}
        display="flex"
        alignItems="flex-end"
        position="relative"
      >
        <Box position="absolute" className={classes.carouselWrapper}>
          <Slide direction="left" in={showCarousel} mountOnEnter unmountOnExit>
            <span>
              <MobileCarousel title="Speakers" data={speakers} />
            </span>
          </Slide>
        </Box>
        <Slide direction="right" in={!showCarousel} mountOnEnter unmountOnExit>
          <AvatarGroup max={4}>
            {speakers.map((speaker, index) => (
              <Avatar
                key={`${speaker.imgPath}-${index}`}
                className={classes.miniAvatar}
                alt={`${speaker.label}'s photo`}
                src={speaker.imgPath}
              />
            ))}
          </AvatarGroup>
        </Slide>
      </Box>
      <Box className={classes.content} p={2}>
        <div className={classes.graphic} />
        <Box position={"relative"} zIndex={1}>
          <Row p={0} alignItems="center" gap={2}>
            <Item>
              <Tooltip title={logoTooltip}>
                <Avatar className={classes.logo} src={logo} />
              </Tooltip>
            </Item>
            <Item position={"middle"}>
              <Tooltip title={title}>
                <Typography variant="h2" className={classes.title}>
                  {title}
                </Typography>
              </Tooltip>
            </Item>
          </Row>
          <Row
            mt={4}
            p={1}
            justifyContent="space-between"
            alignItems={"center"}
          >
            <Item>
              <div className={classes.team}>{brand}</div>
            </Item>
            <Item>
              <Button
                startIcon={isPast ? <LibraryBooksIcon /> : <RegisterIcon />}
                variant={"contained"}
                href={actionLink}
                color={isPast ? "secondary" : "primary"}
              >
                {isPast ? "Details" : "Register"}
              </Button>
            </Item>
          </Row>
        </Box>
      </Box>
    </Box>
  );
};

const EmbedStreamCard = React.memo(({ stream, isPast, currentGroup }) => {
  const {
    palette: { primary, secondary },
    breakpoints,
  } = useTheme();
  const mobile = useMediaQuery(breakpoints.down("sm"));

  const [hovered, setHovered] = useState(false);

  const [speakers, setSpeakers] = useState([]);
  const [showCarousel, setShowCarousel] = useState(false);
  const classes = useStyles({
    color: isPast ? secondary.main : primary.dark,
    hovered,
  });

  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => setHovered(false), []);

  const getStreamLink = useCallback((groupId, streamId) => {
    let link = getBaseUrl();
    if (groupId) {
      link += `/upcoming-livestream/${streamId}?groupId=${groupId}`;
    } else {
      link += `/upcoming-livestream/${streamId}`;
    }
    return link;
  }, []);

  useEffect(() => {
    const newSpeakers = stream.speakers?.map((speaker) => ({
      label: `${speaker.firstName} ${speaker.lastName}`,
      imgPath: getResizedUrl(speaker.avatar, "sm"),
      subLabel: `${speaker.position}`,
    }));
    setSpeakers(newSpeakers || []);
  }, [stream?.speakers]);

  useEffect(() => {
    setShowCarousel(Boolean(hovered && !mobile));
  }, [speakers, mobile, hovered]);

  return (
    <CustomCard
      classes={classes}
      showCarousel={showCarousel}
      handleMouseEnter={handleMouseEnter}
      handleMouseLeave={handleMouseLeave}
      speakers={speakers}
      isPast={isPast}
      actionLink={getStreamLink(currentGroup.id, stream.id)}
      logoTooltip={stream.company}
      hovered={hovered}
      brand={<MainLogo white className={classes.careerFairyLogo} />}
      date={stream.start.toDate()}
      cover={getResizedUrl(stream.backgroundImageUrl, "md")}
      logo={getResizedUrl(stream.companyLogoUrl, "xs")}
      title={stream.title}
    />
  );
});

export default EmbedStreamCard;
