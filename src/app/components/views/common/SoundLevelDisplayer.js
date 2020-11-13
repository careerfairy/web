import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
    rect: {
        display: "inline-block",
        margin: "0 10px 0 0",
        height: 8,
        width: 8,
        borderRadius: "50%",
        backgroundColor: "#eaeaea"
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
            <div className={classes.rect} style={isGreen(0.01) ? {opacity: 0.95, backgroundColor: baseGreen} : null}/>
            <div className={classes.rect} style={isGreen(0.025) ? {opacity: 0.9, backgroundColor: baseGreen} : null}/>
            <div className={classes.rect} style={isGreen(0.05) ? {opacity: 0.85, backgroundColor: baseGreen} : null}/>
            <div className={classes.rect} style={isGreen(0.075) ? {opacity: 0.8, backgroundColor: baseGreen} : null}/>
            <div className={classes.rect} style={isGreen(0.1) ? {opacity: 0.75, backgroundColor: baseGreen} : null}/>
            <div className={classes.rect} style={isGreen(0.15) ? {opacity: 0.7, backgroundColor: baseGreen} : null}/>
            <div className={classes.rect} style={isGreen(0.2) ? {opacity: 0.65, backgroundColor: baseGreen} : null}/>
            <div className={classes.rect} style={isGreen(0.3) ? {opacity: 0.6, backgroundColor: baseGreen} : null}/>
            <div className={classes.rect} style={isGreen(0.4) ? {opacity: 0.55, backgroundColor: baseGreen} : null}/>
            <div className={classes.rect} style={isGreen(0.5) ? {opacity: 0.5, backgroundColor: baseGreen} : null}/>
            <div className={classes.rect} style={isGreen(0.7) ? {opacity: 0.45, backgroundColor: baseGreen} : null}/>
        </div>
    );
}

export default SoundLevelDisplayer; 