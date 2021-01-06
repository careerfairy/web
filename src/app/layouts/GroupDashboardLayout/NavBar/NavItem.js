import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {
    Button,
    ListItem,
    makeStyles
} from '@material-ui/core';
import {useRouter} from "next/router";
import Link from '../../../materialUI/NextNavLink'


const useStyles = makeStyles((theme) => ({
    item: {
        display: 'flex',
        paddingTop: 0,
        paddingBottom: 0
    },
    button: {
        color: theme.palette.text.secondary,
        fontWeight: theme.typography.fontWeightMedium,
        justifyContent: 'flex-start',
        letterSpacing: 0,
        padding: '10px 8px',
        textTransform: 'none',
        width: '100%',
        textDecoration: "none !important",
        "&.active": {
            color: theme.palette.primary.main,
            '& $title': {
                fontWeight: theme.typography.fontWeightMedium
            },
            '& $icon': {
                color: theme.palette.primary.main
            }
        }
    },
    icon: {
        marginRight: theme.spacing(1)
    },
    title: {
        marginRight: 'auto'
    },

}));

const NavItem = ({
                     className,
                     href,
                     icon: Icon,
                     title,
                     ...rest
                 }) => {
    const classes = useStyles();
    const {asPath} = useRouter()

    return (
        <ListItem
            className={clsx(classes.item, className)}
            disableGutters
            {...rest}
        >
                <Button
                    href={href}
                    component={Link}
                    className={classes.button}
                >
                    {Icon && (
                        <Icon
                            className={classes.icon}
                            size="20"
                        />
                    )}
                    <span className={classes.title}>
          {title}
        </span>
                </Button>
        </ListItem>
    );
};

NavItem.propTypes = {
    className: PropTypes.string,
    href: PropTypes.string,
    icon: PropTypes.elementType,
    title: PropTypes.string
};

export default NavItem;
