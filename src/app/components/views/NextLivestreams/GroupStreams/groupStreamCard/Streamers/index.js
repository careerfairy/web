import {makeStyles, useTheme} from "@material-ui/core/styles";
import {speakerPlaceholder} from "../../../../../util/constants";
import React from "react";
import {Avatar, Typography} from "@material-ui/core";
import {getResizedUrl} from "../../../../../helperFunctions/HelperFunctions";
import {Item, Row} from "@mui-treasury/components/flex";
import {Info, InfoSubtitle, InfoTitle} from "@mui-treasury/components/info";
import {useNewsInfoStyles} from "@mui-treasury/styles/info/news";
import clsx from "clsx";

const useStyles = makeStyles(theme => ({
    previewRow: {
        width: "100%",
        justifyContent: "space-evenly"
    },
    avaLogoWrapper: {
        display: "flex",
        // flexDirection: "column",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center"
    },
    avatar: {
        width: 48,
        height: 48,
    },
    author: {
        zIndex: 1,
        position: 'relative',
        display: "flex",
        flexDirection: "column",
    },
    authorHovered: {
        // boxShadow: theme.shadows[3]
    },
}))
//
const Streamers = ({speakers, cardHovered, mobile}) => {

    const classes = useStyles({cardHovered})
    const theme = useTheme()
    return (
        <Row
            className={clsx(classes.author, {
                [classes.authorHovered]: cardHovered
            })}
            m={0}
            p={1}
            py={1}
            gap={3}
            bgcolor={theme.palette.navyBlue.main}
            // bgcolor={theme.palette.navyBlue.main}
        >
            <div className={classes.avaLogoWrapper}>
                {speakers?.map(speaker => (
                    <Row className={classes.previewRow} key={speaker.id}>
                        <Item>
                            <Avatar

                                className={classes.avatar}
                                src={getResizedUrl(speaker.avatar, "xs") || speakerPlaceholder}
                                alt={speaker.firstName}
                            />
                        </Item>
                        <Info style={{marginRight: "auto", color: theme.palette.common.white}} useStyles={useNewsInfoStyles}>
                            <InfoTitle>{`${speaker.firstName} ${speaker.lastName}`}</InfoTitle>
                            <InfoSubtitle>{speaker.position}</InfoSubtitle>
                        </Info>
                    </Row>
                ))}
            </div>
        </Row>
    )
    return (
        <div className={classes.streamers}>
            {speakers.map(speaker => {
                return (
                    <div key={speaker.id} className={classes.streamer}>
                        <Avatar
                            className={classes.avatar}
                            src={getResizedUrl(speaker.avatar, "xs") || speakerPlaceholder}
                            alt={speaker.firstName}/>
                        <Typography noWrap className={classes.name}>
                            {`${speaker.firstName} ${speaker.lastName}`}
                        </Typography>
                        <Typography className={classes.streamerPosition}>
                            {speaker.position}
                        </Typography>
                    </div>
                )
            })}
        </div>

    )
}

export default Streamers