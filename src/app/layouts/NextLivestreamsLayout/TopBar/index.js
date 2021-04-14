import React from 'react';
import clsx from 'clsx';
import {makeStyles, useTheme} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import {withFirebase} from "../../../context/firebase";
import {Button, Hidden, useMediaQuery} from "@material-ui/core";
import Zoom from '@material-ui/core/Zoom';
import Box from "@material-ui/core/Box";
import {useRouter} from "next/router";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import {MainLogo, MiniLogo} from "../../../components/logos";
import Link from "../../../materialUI/NextNavLink";
import AccountCircleOutlinedIcon from "@material-ui/icons/AccountCircleOutlined";
import MenuIcon from "@material-ui/icons/Menu";
import FilterIcon from '@material-ui/icons/Tune';
import {useDispatch} from "react-redux";
import * as actions from '../../../store/actions'
import {useAuth} from "../../../HOCs/AuthProvider";

const useStyles = makeStyles((theme) => ({

    toolbar: {
        display: "flex",
        justifyContent: "space-between"
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
    },
    root: {
        flexGrow: 1,
        background: theme.palette.navyBlue.main,
        zIndex: 1201
    },
    navLinks: {
        fontWeight: 600,
        opacity: 1,
        color: `${theme.palette.primary.contrastText} !important`,
        "&:hover": {
            textDecoration: "none !important",
        },
        "&:before": {
            content: '""',
            position: "absolute",
            width: "100%",
            height: 2,
            bottom: 0,
            left: "0",
            backgroundColor: theme.palette.common.white,
            visibility: "hidden",
            WebkitTransform: "scaleX(0)",
            transform: "scaleX(0)",
            transition: theme.transitions.create(['all'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.short,
            }),
        },
        "&:hover:before": {
            visibility: "visible",
            WebkitTransform: "scaleX(1)",
            transform: "scaleX(1)"
        }
    },
    indicator: {
        background: theme.palette.common.white,
        color: theme.palette.common.white
    },
    navIconButton: {
        color: "white !important",
        "&.MuiLink-underlineHover": {
            textDecoration: "none !important"
        }
    },
    active: {
        "&:before": {
            content: '""',
            position: "absolute",
            width: "100%",
            height: 2,
            bottom: 0,
            left: "0",
            backgroundColor: theme.palette.common.white,
            visibility: "visible",
            WebkitTransform: "scaleX(1)",
            transform: "scaleX(1)"
        },
    }
}));


const TopBar = ({
                    links,
                    className,
                    onMobileNavOpen,
                    currentGroup
                }) => {

    const theme = useTheme()
    const showHeaderLinks = useMediaQuery(theme.breakpoints.up('md'))
    const classes = useStyles();
    const {pathname} = useRouter()
    const dispatch = useDispatch()
    const {authenticatedUser} = useAuth()

    const handleToggleNextLivestreamsFilter = () => dispatch(actions.toggleNextLivestreamsFilter())

    return (
        <AppBar elevation={1} className={clsx(classes.root, className)}>
            <Toolbar className={classes.toolbar}>
                <Hidden smDown>
                    <MainLogo white/>
                </Hidden>
                <Hidden mdUp>
                    <MiniLogo/>
                </Hidden>

                <Hidden mdDown>
                    <Zoom unmountOnExit in={showHeaderLinks}>
                        <Tabs value={false} classes={{indicator: classes.indicator}}>
                            {links
                                .map((item) => {
                                    return (
                                        <Tab
                                            key={item.title}
                                            component={Link}
                                            className={clsx(classes.navLinks, {
                                                [classes.active]: pathname === item.href
                                            })}
                                            label={item.title}
                                            href={item.href}
                                        />
                                    )
                                })}
                        </Tabs>
                    </Zoom>
                </Hidden>
                <Box>
                    <Hidden mdDown>
                        {authenticatedUser.isLoaded && authenticatedUser.isEmpty ? (
                                <Button
                                    component={Link}
                                    href="/login"
                                    variant="contained"
                                    color="primary"
                                    className={classes.navIconButton}

                                >
                                    Login
                                </Button>
                        ) : (
                            <IconButton
                                component={Link}
                                className={classes.navIconButton}
                                href="/profile"
                            >
                                <AccountCircleOutlinedIcon/>
                            </IconButton>
                        )}
                    </Hidden>
                    <Hidden lgUp>
                        {currentGroup?.categories &&
                        <IconButton color="inherit" onClick={handleToggleNextLivestreamsFilter}>
                            <FilterIcon/>
                        </IconButton>}
                        <IconButton color="inherit" onClick={onMobileNavOpen}>
                            <MenuIcon/>
                        </IconButton>
                    </Hidden>
                </Box>
            </Toolbar>
        </AppBar>
    )
}
export default withFirebase(TopBar);
