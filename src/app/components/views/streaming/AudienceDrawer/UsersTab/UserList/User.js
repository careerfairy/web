import PropTypes from 'prop-types'
import React, {memo} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {
    Avatar,
    IconButton,
    ListItem,
    ListItemAvatar,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Tooltip,
    Typography
} from "@material-ui/core";
import clsx from "clsx";
import HowToRegIcon from '@material-ui/icons/HowToReg';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import LinkedInIcon from '@material-ui/icons/LinkedIn';
import EmailIcon from '@material-ui/icons/Email';
import GetAppIcon from '@material-ui/icons/GetApp';
import {makeExternalLink} from "../../../../../helperFunctions/HelperFunctions";

const useStyles = makeStyles(theme => ({
    root: {
        borderRadius: theme.spacing(1),
    },
    highlighted: {
        "& .MuiAvatar-root": {
            backgroundColor: theme.palette.primary.dark,
            color: theme.palette.common.white
        },
        background: theme.palette.primary.main,
        "&:hover": {
            background: theme.palette.primary.dark,
            "& .MuiAvatar-root": {
                backgroundColor: theme.palette.primary.light,
            },
        }
    },
    menu: {
        background: theme.palette.background.paper
    },
    menuItem: {
        color: "inherit !important"
    },
    talentPoolIcon: {
        alignSelf: "center",
        marginTop: 0
    }
}));

const User = ({user, style, inTalentPool}) => {
        const classes = useStyles()
        const {firstName, lastName, avatarUrl, universityName, userEmail, userResume, linkedinUrl} = user
        const [anchorEl, setAnchorEl] = React.useState(null);
        const open = Boolean(anchorEl);

        const handleClick = (event) => {
            setAnchorEl(event.currentTarget);
        };

        const handleClose = () => {
            setAnchorEl(null);
        };

        const menuItems = [
            {
                label: "Send an Email",
                onClick: () => handleClose(),
                icon: <EmailIcon fontSize="small"/>,
                valid: true,
                href: `mailto:${userEmail}`
            },
            {
                label: "View LinkedIn Profile",
                onClick: () => handleClose(),
                icon: <LinkedInIcon fontSize="small"/>,
                valid: Boolean(linkedinUrl),
                href: `${makeExternalLink(linkedinUrl)}`
            },
            {
                label: "Download CV",
                onClick: () => handleClose(),
                icon: <GetAppIcon fontSize="small"/>,
                valid: Boolean(userResume),
                href: `${userResume}`,
                download: `${firstName} ${lastName} CV`
            },
        ]

        return (
            <ListItem
                className={clsx(classes.root, {
                    // [classes.highlighted]: inTalentPool
                })}
                style={style}
                button={inTalentPool} alignItems="flex-start">
                {inTalentPool &&
                <Tooltip color="primary" title="Is in talent pool">
                    <ListItemIcon className={classes.talentPoolIcon}>
                        <HowToRegIcon color="primary"/>
                    </ListItemIcon>
                </Tooltip>}
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
                            {inTalentPool ? `${firstName} ${lastName}` : `${firstName}`}
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
                {inTalentPool &&
                <ListItemIcon className={classes.talentPoolIcon}>
                    <IconButton edge="end" onClick={handleClick}>
                        <MoreVertIcon/>
                    </IconButton>
                </ListItemIcon>
                }
                <Menu
                    id="fade-menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={open}
                    onClose={handleClose}
                    PopoverClasses={{
                        paper: classes.menu
                    }}
                >
                    {menuItems.filter(item => item.valid).map(({label, icon, onClick, valid, href, download}) => (
                        <MenuItem
                            className={classes.menuItem}
                            target="_blank"
                            component={href ? "a" : "li"}
                            href={href}
                            disabled={!valid}
                            key={label}
                            download={download}
                            onClick={onClick}
                        >
                            <ListItemIcon>
                                {icon}
                            </ListItemIcon>
                            {label}
                        </MenuItem>
                    ))}
                </Menu>
            </ListItem>
        );
    }
;

User.propTypes = {
    inTalentPool: PropTypes.bool.isRequired,
    style: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired
}

export default memo(User);

