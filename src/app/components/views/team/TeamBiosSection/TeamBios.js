import PropTypes from 'prop-types'
import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Avatar, Card, CardContent, Grid} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles(theme => ({
    avatar: {
        width: theme.spacing(14),
        height: theme.spacing(14),
        marginBottom: theme.spacing(2)
    },
    gridItem:{
        display: "flex"
    }
}));

const TeamBios = ({people}) => {

    const classes = useStyles()

    return (
        <Grid container
              justify="center"
              spacing={3}>
            {people.map((person, index) => (
                <Grid
                    item
                    className={classes.gridItem}
                    xs={12}
                    sm={6}
                    md={4}
                    key={index}
                >
                    <Card>
                        <CardContent align="center">
                                <Avatar
                                    className={classes.avatar}
                                    src={person.avatar}
                                    alt={person.name}
                                />
                            <Typography variant="h5">
                                {person.name}
                            </Typography>
                            <Typography gutterBottom color="textSecondary" variant="subtitle1">
                                {person.role}
                            </Typography>
                            <Typography paragraph>
                                {person.bio}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

TeamBios.propTypes = {
    people: PropTypes.arrayOf(PropTypes.shape({
        avatar: PropTypes.string,
        name: PropTypes.string,
        role: PropTypes.string,
        bio: PropTypes.string,
        twitterUrl: PropTypes.string,
        facebookUrl: PropTypes.string,
        linkedinUrl: PropTypes.string,
    }))
}
export default TeamBios;

