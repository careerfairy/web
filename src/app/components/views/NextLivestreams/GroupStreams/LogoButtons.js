import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import ButtonBase from '@material-ui/core/ButtonBase';
import Typography from '@material-ui/core/Typography';


const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        justifyContent: "center",
        flexWrap: 'wrap',
        minWidth: 250,
        padding: "1rem",
        paddingTop: 0,
        width: '100%',
    },
    image: {
        position: 'relative',
        height: 200,
        flex: 1,
        minWidth: 200,
        margin: "0.5rem",
        [theme.breakpoints.down('xs')]: {
            width: '100% !important', // Overrides inline-style
            height: 100,
        },
        '&:hover, &$focusVisible': {
            zIndex: 1,
            '& $imageBackdrop': {
                opacity: 0.15,
            },
            '& $imageMarked': {
                opacity: 0,
            },
            '& $imageTitle': {
                border: '4px solid currentColor',
            },
        },
    },

    focusVisible: {
        opacity: 0.3
    },
    imageButton: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.palette.common.white,
    },
    imageSrc: {
        width: "100%",
        height: "100%",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        maxWidth: "80%",
        maxHeight: "80%"
    },
    imageBackdrop: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        borderRadius: 5,
        backgroundColor: theme.palette.common.black,
        opacity: 0.6,
        transition: theme.transitions.create('opacity'),
    },
    imageTitle: {
        position: 'relative',
        padding: `${theme.spacing(2)}px ${theme.spacing(4)}px ${theme.spacing(1) + 6}px`,
    },
    imageMarked: {
        height: 3,
        width: 18,
        backgroundColor: theme.palette.common.white,
        position: 'absolute',
        bottom: -2,
        left: 'calc(50% - 9px)',
        transition: theme.transitions.create('opacity'),
    },
}));

const LogoButtons = ({groups, setGroup}) => {
    console.log("-> groups", groups);
    const classes = useStyles();

    return (
        <div className={classes.root}>
            {groups.map((group) => (
                <ButtonBase
                    focusRipple
                    onClick={() => setGroup(group)}
                    key={group.universityName}
                    className={classes.image}
                    focusVisibleClassName={classes.focusVisible}
                >
                    <div
                        className={classes.imageSrc}
                        style={{
                            backgroundImage: `url(${group.logoUrl})`,
                        }}
                    />
                    <span className={classes.imageBackdrop}/>
                    <span className={classes.imageButton}>
            <Typography
                component="span"
                variant="subtitle1"
                color="inherit"
                className={classes.imageTitle}
            >
              {group.universityName}
                <span className={classes.imageMarked}/>
            </Typography>
          </span>
                </ButtonBase>
            ))}
        </div>);
}

export default LogoButtons
