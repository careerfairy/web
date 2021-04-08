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

    if (groupData.groupId === 'EllidQJoeiKjrXp55n3m') {

        let murparkLogo = "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-logos%2Fmurpark-logo.png?alt=media&token=13e3a087-a53d-4ace-83b8-6b4b539ef269";
        let soundportalLogo = "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-logos%2Fsoundportal-logo.png?alt=media&token=8acbf9d6-8e28-44c5-be07-4334e86e0db6";

        return (
            <Grid xs={12} sm={12} md={4} lg={4} xl={4} item className={classes.root}>

                <Card className={clsx(classes.card, {
                    [classes.mobile]: mobile
                })} style={{padding: '40px 0'}}>
                    <CardContent>
                        <div style={{position: 'relative', padding: '40px', marginBottom: '30px'}}>
                            <img src={groupData.logoUrl} style={{maxWidth: '100%'}}
                                 alt={`${groupData.universityName} logo`}/>
                        </div>
                        <div style={{position: 'relative', padding: '40px', marginBottom: '30px'}}>
                            <div style={{marginBottom: '20px', fontWeight: '800'}}>Gewinnspiel gesponsert von:</div>
                            <img src={murparkLogo} style={{maxWidth: '70%'}}
                                 alt={`${groupData.universityName} logo`}/>
                        </div>
                        <div style={{position: 'relative', padding: '40px', marginBottom: '30px'}}>
                            <div style={{marginBottom: '20px', fontWeight: '800'}}>Medienpartner:</div>
                            <img src={soundportalLogo} style={{maxWidth: '70%'}}
                                 alt={`${groupData.universityName} logo`}/>
                        </div>
                    </CardContent>
                </Card>
            </Grid>
        )
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
                                <SizeMe>{({size}) => (
                                    <StackGrid
                                        style={{marginTop: 10}}
                                        duration={20}
                                        columnWidth={"100%"}
                                        gridRef={grid => setGrid(grid)}>
                                        {groupData.categories.map(category => {
                                            if (category.name.toLowerCase() !== "level of study") {
                                                return (
                                                    <CategoryCard width={size.width} mobile={mobile} key={category.id}
                                                                  category={category}
                                                                  handleToggleActive={handleToggleActive}/>
                                                )
                                            }
                                        })}
                                    </StackGrid>
                                )}</SizeMe>
                            </Box>
                        </CardContent>}
                    </Card>
                </div>
            </Sticky>
            {/*</Grid>*/}
        </Grid>
    )
};

export default GroupCategories;
