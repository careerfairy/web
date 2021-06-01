import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Avatar, Card, CardContent, CardHeader, Grid, Typography} from "@material-ui/core";
import {Rating} from "@material-ui/lab";

const useStyles = makeStyles(theme => ({
    root: {
        display: "flex",
        position: "relative",
        justifyContent: "center",
        padding: theme.spacing(5)
    },
    backgroundRect: {
        top: "50%",
        left: "56%",
        width: "86%",
        height: "94%",
        position: "absolute",
        transform: "translate(-50%, -50%)",
        background: "#E1F0EE",
        borderRadius: "50px",
        [theme.breakpoints.down("sm")]: {
            left: "50%",
            width: "100%",
        },
    },
    innerWrapper: {
        zIndex: 2,
        flex: 1,
        display: "flex",
        width: "90%"
    },
    wrapper: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%"
    },
    avatar: {
        width: 170,
        height: 170,
        borderRadius: theme.spacing(4),
        "& img": {
            objectFit: "contain"
        },
        boxShadow: theme.shadows[14]
    },
    cardHeaderWrapper: {
        display: "flex",
        flexWrap: "wrap"
    },
    cardTitle: {
        fontWeight: 600,
        marginRight: theme.spacing(2)
    },
    rating: {
        fontSize: theme.spacing(4),
    },
    cardReview: {
        marginBottom: theme.spacing(2)
    },
    cardAuthor: {
        fontWeight: 600
    },
    cardRoot: {
        background: "transparent",
        boxShadow: "none"
    }
}));

const TestimonialCard = ({avatarUrl, title, rating, position, name, reviewText}) => {

    const classes = useStyles()

    return (
        <div className={classes.root}>
            <div className={classes.backgroundRect}/>
            <div className={classes.innerWrapper}>
                <Grid container>
                    <Grid xs={12} md={4} lg={3} item>
                        <div className={classes.wrapper}>
                            <Avatar
                                src={avatarUrl}
                                variant="square"
                                className={classes.avatar}
                            />
                        </div>
                    </Grid>
                    <Grid xs={12} md={8} lg={9} item>
                        <div className={classes.wrapper}>
                            <Card className={classes.cardRoot}>
                                <CardHeader
                                    title={
                                        <div className={classes.cardHeaderWrapper}>
                                            <Typography component="h2" className={classes.cardTitle} variant="h5">
                                                {`"${title}"`}
                                            </Typography>
                                            <Rating
                                                defaultValue={2}
                                                className={classes.rating}
                                                name="testimonial-rating"
                                                value={rating}
                                            />
                                        </div>
                                    }
                                />
                                <CardContent>
                                    <Typography className={classes.cardReview} variant="body2" component="p">
                                        {reviewText}
                                    </Typography>
                                    <Typography
                                        component="h4"
                                        variant="subtitle1"
                                        className={classes.cardAuthor}
                                    >
                                        {name}
                                    </Typography>
                                    <Typography variant="body2"
                                                color="textSecondary"
                                                className={classes.cardAuthor}
                                                component="p">
                                        {position}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </div>
                    </Grid>
                </Grid>
            </div>
        </div>
    );
};

export default TestimonialCard;
