import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
    rect: {
        display: "inline-block",
        margin: "0 10px 0 0",
        height: 8,
        width: 8,
        borderRadius: "50%",
        backgroundColor: "white"
    },
    button: {
        height: "100%"
    },
}))

function SoundLevelDisplayer({audioLevel}) {
    const classes = useStyles()
    const baseGreen = "#00d2aa"
    const isGreen = (threshHold) => {
        return audioLevel > threshHold
    }

    return (
        <div style={{display: 'inline-block', margin: '0 auto'}}>
            <div className={classes.rect} style={isGreen(0) ? {opacity: 1, backgroundColor: baseGreen} : null}/>
            <div className={classes.rect} style={isGreen(0.01) ? {opacity: 0.88, backgroundColor: baseGreen} : null}/>
            <div className={classes.rect} style={isGreen(0.025) ? {opacity: 0.80, backgroundColor: baseGreen} : null}/>
            <div className={classes.rect} style={isGreen(0.05) ? {opacity: 0.72, backgroundColor: baseGreen} : null}/>
            <div className={classes.rect} style={isGreen(0.075) ? {opacity: 0.64, backgroundColor: baseGreen} : null}/>
            <div className={classes.rect} style={isGreen(0.1) ? {opacity: 0.56, backgroundColor: baseGreen} : null}/>
            <div className={classes.rect} style={isGreen(0.15) ? {opacity: 0.48, backgroundColor: baseGreen} : null}/>
            <div className={classes.rect} style={isGreen(0.2) ? {opacity: 0.40, backgroundColor: baseGreen} : null}/>
            <div className={classes.rect} style={isGreen(0.3) ? {opacity: 0.32, backgroundColor: baseGreen} : null}/>
            <div className={classes.rect} style={isGreen(0.4) ? {opacity: 0.24, backgroundColor: baseGreen} : null}/>
            <div className={classes.rect} style={isGreen(0.5) ? {opacity: 0.16, backgroundColor: baseGreen} : null}/>
            <div className={classes.rect} style={isGreen(0.7) ? {opacity: 0.08, backgroundColor: baseGreen} : null}/>
        </div>
    );
}

export default SoundLevelDisplayer; 