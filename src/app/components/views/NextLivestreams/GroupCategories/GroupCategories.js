import React, {useEffect, useState} from 'react';
import {Box, Card, CardContent, CardMedia, Grid, Typography} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import CategoryCard from "./CategoryCard";
import {SizeMe} from "react-sizeme";
import StackGrid from "react-stack-grid";
import {MultilineText} from "../../../helperFunctions/HelperFunctions";
import clsx from "clsx";
import Sticky from 'react-stickynode';


const useStyles = makeStyles((theme) => ({
    root: {
        // height: "100%"
        // paddingBottom: 0,
        // paddingTop: ({mobile}) => mobile ? 0 : 14,
        // width: ({mobile}) => mobile ? "100%" : "40%",
        paddingTop: theme.spacing(3)
    },
    card: {
        borderRadius: theme.spacing(2),
        boxShadow: theme.shadows[4],
        overflowY: "auto",
        '&::-webkit-scrollbar': {
            width: '0.4em'
        },
        '&::-webkit-scrollbar-track': {
            boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
            webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)'
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,.1)',
        },
        maxHeight: "calc(100vh - 70px)",

    },
    mobile: {
        position: "static",
        top: "auto",
        maxHeight: "auto"
    },
    actions: {
        display: "flex",
        flexFlow: "column",
        '& > * + *': {
            marginTop: theme.spacing(3),
        },
    },
    media: {
        display: "flex",
        justifyContent: "center",
        backgroundColor: "white",
    },
    imageContainer: {
        position: "relative",
        width: "100%",
        height: "250px",
    },
    image: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        maxWidth: "90%",
        maxHeight: "90%",
        borderRadius: theme.spacing(1)
    },
    groupDescription: {
        padding: `0 ${theme.spacing(3)}px`,
    },
    cardWrapper: {
        paddingTop: props => props.isSticky && theme.spacing(10)
    }
}));

const GroupCategories = ({groupData, alreadyJoined, handleToggleActive, mobile, hasCategories}) => {

    const [isSticky, setIsSticky] = useState(false);
    const classes = useStyles({mobile, isSticky});
    const [grid, setGrid] = useState(null);


    useEffect(() => {
        if (grid) {
            setTimeout(() => {
                grid.updateLayout();
            }, 10);
        }
    }, [grid, groupData]);

    const handleStateChange = (status) => {
        if (status.status === Sticky.STATUS_FIXED) return setIsSticky(true)
        setIsSticky(false)
    }


    return (
        <Grid id="scroll-grid" item xs={12} sm={12} md={4} lg={4} xl={4} className={classes.root}>
            <Sticky onStateChange={handleStateChange} bottomBoundary="#scroll-grid" enabled={!mobile}>
                <div className={classes.cardWrapper}>
                    <Card className={clsx(classes.card, {
                        [classes.mobile]: mobile
                    })}>
                        <CardMedia className={classes.media}>
                            <div className={classes.imageContainer}>
                                <img src={groupData.logoUrl} className={classes.image}
                                     alt={`${groupData.universityName} logo`}/>
                            </div>
                        </CardMedia>
                        {groupData.extraInfo &&
                        <Typography component="div" variant="body1" className={classes.groupDescription}>
                            <MultilineText text={groupData.extraInfo}/>
                        </Typography>}
                        {!!hasCategories && <CardContent>
                            <Box className={classes.actions}>
                                {groupData.categories.map(category => {
                                    // if (category.name.toLowerCase() !== "level of study") {
                                    return (
                                        <CategoryCard
                                            mobile={mobile}
                                            key={category.id}
                                            category={category}
                                            groupData={groupData}
                                            handleToggleActive={handleToggleActive}
                                        />
                                    )
                                    // }
                                })}
                            </Box>
                        </CardContent>}
                    </Card>
                </div>
            </Sticky>
        </Grid>
    )
};

export default GroupCategories;
