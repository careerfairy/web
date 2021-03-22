import PropTypes from 'prop-types'
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
    root: {
        // maxWidth: 345,
    },
});

const StreamCard = ({}) => {
    const classes = useStyles();
    return(
        <Card className={classes.root}>
            <CardActionArea>
                <CardMedia
                    component="img"
                    alt="Contemplative Reptile"
                    height="140"
                    image="/static/images/cards/contemplative-reptile.jpg"
                    title="Contemplative Reptile"
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                        Lizard
                    </Typography>
                    <Typography variant="body2" color="textSecondary" component="p">
                        Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging
                        across all continents except Antarctica
                    </Typography>
                </CardContent>
            </CardActionArea>
            <CardActions>
                <Button size="small" color="primary">
                    Share
                </Button>
                <Button size="small" color="primary">
                    Learn More
                </Button>
            </CardActions>
        </Card>
    )
}

StreamCard.propTypes = {
  stream: PropTypes.shape({
      author: PropTypes.shape({
          email: PropTypes.string,
          groupId: PropTypes.string
      }),
      backgroundImageUrl: PropTypes.string,
      company: PropTypes.string,
      companyId: PropTypes.string,
      companyLogoUrl: PropTypes.string,
      created: PropTypes.shape({
          seconds: PropTypes.number,
          nanoseconds: PropTypes.number
      }),
      currentSpeakerId: PropTypes.string,
      groupIds: PropTypes.array,
      hidden: PropTypes.bool,
      id: PropTypes.string,
      language: PropTypes.shape({
          code: PropTypes.oneOf(["en", "de", ])
      })
  }).isRequired
}

export default StreamCard

