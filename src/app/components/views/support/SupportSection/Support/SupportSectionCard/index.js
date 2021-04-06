import PropTypes from 'prop-types'
import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Card, CardActionArea, CardContent, CardHeader, CardMedia, Typography} from "@material-ui/core";

const useStyles = makeStyles(theme => ({
    media: {
        height: 200,
        backgroundSize: "contain"
    },
}));

const SupportSectionCard = ({section: {description, href, image, title}}) => {

    const classes = useStyles()

    return (
        <Card align="center">
            <CardActionArea href={href}>
                <CardMedia
                    className={classes.media}
                    image={image}
                    title="Contemplative Reptile"
                />
                <CardHeader title={title}/>
                <CardContent>
                    <Typography variant="body1">
                        {description}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default SupportSectionCard;

SupportSectionCard.propTypes = {
    section: PropTypes.shape({
        title: PropTypes.string,
        description: PropTypes.string,
        href: PropTypes.string,
    }).isRequired
}