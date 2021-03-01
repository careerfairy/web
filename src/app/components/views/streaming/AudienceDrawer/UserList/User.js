import PropTypes from 'prop-types'
import React, {memo} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Avatar, ListItem, ListItemAvatar, ListItemText, Tooltip, Typography} from "@material-ui/core";

const useStyles = makeStyles(theme => ({

    secondary: {
        // display: "inline"
    }
}));

const User = ({user, style, inTalentPool}) => {
console.log("-> inTalentPool", inTalentPool);
    const classes = useStyles()
    const {firstName, lastName, avatarUrl, universityName} = user
    return (
        <ListItem
            style={style}
            button alignItems="flex-start">
            <ListItemAvatar>
                <Avatar alt={`${firstName} ${lastName}`} src={avatarUrl}>
                    {firstName ? `${firstName[0] + lastName[0]}` : ""}
                </Avatar>
            </ListItemAvatar>
            <ListItemText
                disableTypography
                primary={
                        <Typography
                            noWrap
                            variant="body1"
                            className={classes.secondary}
                        >
                            {firstName}
                        </Typography>
                }
                secondary={
                    <Tooltip title={universityName || ""}>
                        <Typography
                            noWrap
                            color="textSecondary"
                            variant="body2"
                            className={classes.secondary}
                        >
                            {universityName}
                        </Typography>
                    </Tooltip>
                }
            />
            {/*<ListItemSecondaryAction>*/}
            {/*    <IconButton edge="end" aria-label="delete">*/}
            {/*        /!*<CommentIcon />*!/*/}
            {/*    </IconButton>*/}
            {/*</ListItemSecondaryAction>*/}
        </ListItem>
    );
};

User.propTypes = {
  inTalentPool: PropTypes.bool.isRequired,
  style: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired
}
export default memo(User);

