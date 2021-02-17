import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {ButtonBase, Typography} from '@material-ui/core';
import {demoVideo} from "../../components/util/constants";


const useStyles = makeStyles((theme) => {
    const customTransition = theme.transitions.create("all", {
        easing: theme.transitions.easing.easeInOut,
        duration: theme.transitions.duration.standard,
    })
    return ({
        graphicButtonRoot: {
            display: 'flex',
            justifyContent: "center",
            flexWrap: 'wrap',
            minWidth: 250,
            padding: "1rem",
            paddingTop: 0,
            width: '100%',
        },
        video:{
          position: "absolute",
          width: "100%",
          height: "100%"
        },
        graphicButtonBase: {
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
                    // opacity: 0.15,
                },
                '& $buttonText': {
                    opacity: 1,
                },
                '& $underline': {
                    // opacity: 0,
                    width: "100%"
                },
                '& $imageTitle': {

                    marginTop: "10%"
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
            flexDirection: "column",
            alignItems: "center",
            justifyContent: 'space-between',
            color: theme.palette.common.white,
        },
        imageSrc: {
            width: "100%",
            height: "100%",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            maxWidth: "80%",
            maxHeight: "80%",
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
        },
        imageTitle: {
            position: 'relative',
            marginTop: "30%",
            transition: customTransition,
            padding: theme.spacing(1, 2, 0, 2)
        },
        buttonText: {
            transition: customTransition,
            opacity: 0,
            padding: theme.spacing(1)
        },
        underline: {
            height: 3,
            width: 18,
            transition: customTransition,
            backgroundColor: theme.palette.text.primary,
        },
    })
});

const GraphicButton = ({
                           buttonTitle,
                           buttonText = "",
                           onClick,
                           backgroundImageUrl,
    videoUrl
                       }) => {
    const classes = useStyles();

    return (
        <div className={classes.graphicButtonRoot}>
            <ButtonBase
                focusRipple
                onClick={onClick}
                className={classes.graphicButtonBase}
                focusVisibleClassName={classes.focusVisible}
            >
                <video loop autoPlay className={classes.video} src={videoUrl} />
                {/*<div*/}
                {/*    className={classes.imageSrc}*/}
                {/*    style={{*/}
                {/*        backgroundImage: `url(${backgroundImageUrl})`,*/}
                {/*    }}*/}
                {/*/>*/}
                <span className={classes.imageBackdrop}/>
                <span className={classes.imageButton}>
            <Typography
                component="div"
                variant="h4"
                color="inherit"
                className={classes.imageTitle}
            >
              {buttonTitle}
            </Typography>
                    <Typography
                        align="center"
                        variant="body1"
                        className={classes.buttonText}
                    >
                        {buttonText}
                    </Typography>
                <span className={classes.underline}/>
          </span>
            </ButtonBase>
        </div>);
}

export default GraphicButton