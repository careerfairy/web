import React from 'react';
import {Avatar, Container, Paper} from "@material-ui/core";
import SectionHeader from "../../common/SectionHeader";
import Section from "../../common/Section";
import StreamsTab from "../StreamsTab";
import GroupBio from "./groupBio";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
    container: {
        zIndex: 1,
        "&.MuiContainer-root": {
            position: "relative"
        }
    },
    logoWrapper: {
        maxWidth: 400,
        margin: "auto",
        height: 200,
        marginBottom: theme.spacing(2),
        display: "grid",
        placeItems: "center"
    },
    logo: {
        width: "90%",
        height: "90%",
        "& img": {
            objectFit: "contain"
        }
    },
    section: {
        paddingBottom: theme.spacing(1)
    },
}));

const GroupBannerSection = (props) => {

    const classes = useStyles()

    return (
        <Section
            className={classes.section}
            big={props.big}
            color={props.color}
            backgroundImageClassName={props.backgroundImageClassName}
            backgroundImage={props.backgroundImage}
            backgroundImageOpacity={props.backgroundImageOpacity}
            backgroundColor={props.backgroundColor}
        >
            <Container className={classes.container}>
                <Paper className={classes.logoWrapper}>
                    <Avatar
                        variant={"square"}
                        className={classes.logo}
                        src={props.groupLogo}
                    />
                </Paper>
                <SectionHeader
                    color={props.color}
                    title={props.title}
                    subtitle={props.subtitle}
                />
                {props.groupBio && <GroupBio groupBio={props.groupBio}/>}
                <StreamsTab handleChange={props.handleChange} value={props.value}/>
            </Container>
        </Section>
    );
};

export default GroupBannerSection;
