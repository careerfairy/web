import React, {useState} from 'react'
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import {makeStyles} from "@material-ui/core/styles";
import {AttendButton, DetailsButton} from "../actionButtons";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Typography from "@material-ui/core/Typography";
import Streamers from "../Streamers";
import TargetOptions from "../../../GroupsCarousel/TargetOptions";
import {AvatarGroup} from "@material-ui/lab";
import {Collapse, Grow} from "@material-ui/core";


const useStyles = makeStyles(theme => {
    const paperColor = theme.palette.background.paper
    return ({
        buttonsWrapper: {
            display: "flex",
            justifyContent: "center",
            marginBottom: theme.spacing(1),
            flexWrap: "wrap",
            width: "100%"
        },
        detailsContent: {
            fontWeight: "bolder",
            fontSize: theme.spacing(2.2),
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        },
        mobileComponentRoot: {
            width: "100%",
            flex: ({openMoreDetails}) => openMoreDetails && 1,
            display: "flex",
            flexDirection: "column"
        },
        optionsWrapper: {
            overflowX: 'hidden',
            overflowY: 'auto',
            maxHeight: "40vh",
            padding: theme.spacing(1)
        },
        backgroundContent: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 1005,
            padding: theme.spacing(2),
            paddingTop: 0
        },
        details: {
            // background: theme.palette.navyBlue.main,
            display: "flex",
            flexDirection: "column",
            width: "100%",
            padding: 0,
            zIndex: 1004,
            boxShadow: theme.shadows[24],
            borderBottomRightRadius: `${theme.spacing(2.5)}px !important`,
            borderBottomLeftRadius: `${theme.spacing(2.5)}px !important`,
        },
        detailsAccordionRoot: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            "& p": {
                color: "white !important"
            },
            flex: 1,
            boxShadow: "none",
            // background: ({openMoreDetails}) => openMoreDetails ? theme.palette.navyBlue.main : "transparent",
            marginTop: 0,
            borderRadius: "0px !important",
            "& .MuiAccordion-root:before": {
                backgroundColor: "none"
            },
            "& .MuiAccordion-root, &.Mui-expanded": {
                margin: 0
            },

        },
        logosFrontWrapper: {
            borderRadius: "inherit",
            marginTop: theme.spacing(1),
            padding: theme.spacing(1),
            display: "flex",
            justifyContent: "space-evenly",
            width: "100%",
            background: paperColor,
            flex: 1
        },
        groupWrapper: {
            height: 50,
            position: "relative",
            display: "flex",
            width: "100%",
            justifyContent: "center",
        },
        summary: {
            "& .MuiAccordionSummary-expandIcon": {
                position: "absolute",
                right: 10,
            },
            "& .MuiAccordionSummary-root, &.Mui-expanded": {
                minHeight: 0,
            },
            "& .MuiAccordionSummary-content": {
                margin: 0
            }
        },
        streamerWrapper: {
            padding: theme.spacing(1)
        },
        accordionWrapper: {
            height: 50,
            display: "flex",
            width: "100%",
            position: "relative"
        }
    })
})

const MobileComponent = ({
                             handleOpenMoreDetails,
                             openMoreDetails,
                             checkIfRegistered,
                             groupData,
                             handleRegisterClick,
                             listenToUpcoming,
                             livestream,
                             user,
                             targetOptions,
                             speakerElements,
                             logoElements
                         }) => {
    const classes = useStyles({openMoreDetails})


    return (
        <div className={classes.mobileComponentRoot}>
            <div className={classes.buttonsWrapper}>
                <DetailsButton
                    groupData={groupData}
                    listenToUpcoming={listenToUpcoming}
                    livestream={livestream}/>
                <AttendButton
                    handleRegisterClick={handleRegisterClick}
                    checkIfRegistered={checkIfRegistered}
                    user={user}/>
            </div>
            <div className={classes.accordionWrapper}>
                <Accordion
                    className={classes.detailsAccordionRoot}
                    TransitionProps={{unmountOnExit: true}}
                    classes={{root: classes.detailsAccordionRoot}}
                    expanded={openMoreDetails}
                    onChange={handleOpenMoreDetails}>
                    <AccordionSummary
                        className={classes.summary}
                        expandIcon={<ExpandMoreIcon style={{color: openMoreDetails && "white"}}/>}
                        aria-controls="details-content"
                        id="panel1a-header">
                        <div className={classes.groupWrapper}>
                            <Grow in={!openMoreDetails}>
                                <AvatarGroup className={classes.detailsContent} max={3}>
                                    {speakerElements}
                                </AvatarGroup>
                            </Grow>
                            <Grow in={openMoreDetails}>
                                <Typography style={{color: openMoreDetails && "white"}} align="center"
                                            className={classes.detailsContent}>
                                    show Less
                                </Typography>
                            </Grow>
                        </div>
                    </AccordionSummary>
                    <AccordionDetails className={classes.details}>
                        <div className={classes.streamerWrapper}>
                            <Streamers speakers={livestream.speakers} cardHovered={openMoreDetails}/>
                        </div>
                        {!!targetOptions.length &&
                        <div className={classes.optionsWrapper}>
                            <TargetOptions options={targetOptions}/>
                        </div>}
                        <div className={classes.logosFrontWrapper}>
                            {logoElements}
                        </div>
                    </AccordionDetails>
                </Accordion>
            </div>
        </div>
    )
}

export default MobileComponent