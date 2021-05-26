import {fade, makeStyles} from "@material-ui/core/styles";

const usePulseStyles = makeStyles(theme => ({
    pulseAnimate: {
        animation: `$pulse 1.2s infinite`
    },
    "@keyframes pulse": {
        "0%": {
            MozBoxShadow: `0 0 0 0 ${fade(theme.palette.primary.main, 1)}`,
            boxShadow: `0 0 0 0 ${fade(theme.palette.primary.main, 1)}`
        },
        "70%": {
            MozBoxShadow: `0 0 0 15px ${fade(theme.palette.primary.main, 0)}`,
            boxShadow: `0 0 0 15px ${fade(theme.palette.primary.main, 0)}`
        },
        "100%": {
            MozBoxShadow: `0 0 0 0 ${fade(theme.palette.primary.main, 0)}`,
            boxShadow: `0 0 0 0 ${fade(theme.palette.primary.main, 0)}`
        }
    },
}));

export default usePulseStyles