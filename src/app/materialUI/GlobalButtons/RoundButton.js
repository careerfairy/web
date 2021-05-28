import PropTypes from 'prop-types'
import React, {useMemo} from 'react';
import {fade, makeStyles, useTheme} from "@material-ui/core/styles";
import {Button} from "@material-ui/core";
import clsx from "clsx";

const useStyles = makeStyles(theme => ({
    root: {
        padding: theme.spacing(2, 8),
        borderRadius: theme.spacing(4)
    },
    withGradient: {
        background: props => `linear-gradient(45deg, ${props.colors[0]} 30%, ${props.colors[1]} 90%)`,
        color: theme.palette.common.white,
        "&:hover": {
            boxShadow: props => `0 3px 5px 2px  ${fade(props.colors[1], 0.3)}`,
        }
    }
}));

const RoundButton = ({withGradient, className, color, ...props}) => {

    const {palette: {primary, secondary, grey}} = useTheme()
    const colors = useMemo(() => {
        if (color === "primary") {
            return [primary.main, primary.dark]
        }
        if (color === "secondary") {
            return [secondary.main, secondary.dark]
        }

        return [grey["300"], grey["700"]]
    }, [color, primary, secondary, grey])
    const classes = useStyles({colors})

    return (
        <Button
            color={color}
            className={clsx(className, classes.root, {
                [classes.withGradient]: withGradient
            })} {...props} />
    );
};

export default RoundButton;

RoundButton.propTypes = {
    className: PropTypes.string,
    withGradient: PropTypes.bool
}