import PropTypes from 'prop-types'
import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import MoreVertIcon from '@material-ui/icons/MoreVert';
import CommentIcon from '@material-ui/icons/Comment';

import {
    Avatar,
    IconButton,
    ListItem,
    ListItemAvatar,
    ListItemSecondaryAction,
    ListItemText,
    Typography
} from "@material-ui/core";

const useStyles = makeStyles(theme => ({
    inline: {
        display: 'inline',
    },
}));

const User = ({user}) => {

    const classes = useStyles()

    return (
        <ListItem  button alignItems="flex-start">
            <ListItemAvatar>
                <Avatar alt={`${user.firstName} ${user.lastName}`} src={user.avatarUrl} >
                    {user.firstName ? `${user.firstName[0] + user.lastName[0]}` : ""}
                </Avatar>
            </ListItemAvatar>
            <ListItemText
                primary={user.firstName}
                secondary={
                    <React.Fragment>
                        <Typography
                            component="span"
                            variant="body2"
                            className={classes.inline}
                            color="textPrimary"
                        >
                            {/*Ali Connors*/}
                        </Typography>
                        {/*{" — I'll be in your neighborhood doing errands this…"}*/}
                    </React.Fragment>
                }
            />
            <ListItemSecondaryAction>
                <IconButton edge="end" aria-label="delete">
                    <CommentIcon />
                </IconButton>
            </ListItemSecondaryAction>
        </ListItem>
    );
};

User.propTypes = {
  user: PropTypes.object.isRequired
}
export default User;

