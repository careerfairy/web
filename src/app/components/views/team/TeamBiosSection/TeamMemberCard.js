import {Card, CardContent, Collapse} from "@material-ui/core";
import BioAvatar from "./BioAvatar";
import Typography from "@material-ui/core/Typography";
import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import clsx from "clsx";
import {MultilineText} from "../../../helperFunctions/HelperFunctions";

const useStyles = makeStyles(theme => ({
    avatar: {
        width: theme.spacing(20),
        height: theme.spacing(20),
        marginBottom: theme.spacing(2),
        "& img": {
            transition: theme.transitions.create(['all'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.short,
            }),
        },

    },
    avatarHovered: {
        "& img": {
            transform: "scale(1.1)"
        },

    },
    greenBorder:{
      borderBottom: `${theme.spacing(0.5)}px solid ${theme.palette.primary.dark}`
    }
}));
export const TeamMemberCard = props => {

    const [hovered, setHovered] = React.useState(false);

    const classes = useStyles()

    const handleMouseEnter = () => {
        setHovered(true)
    }
    const handleMouseLeave = () => {
        setHovered(false)
    }

    return (
        <Card
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            raised={hovered}
                className={clsx({
                    [classes.greenBorder]: hovered
                })}
        >
            <CardContent
                align="center"
            >
                <BioAvatar hovered={hovered} person={props.person} classes={classes}/>
                <Typography variant="h5">
                    {props.person.name}
                </Typography>
                <Typography gutterBottom color="textSecondary" variant="subtitle1">
                    {props.person.role}
                </Typography>
                <Collapse in={hovered}>
                    <Typography paragraph>
                        <MultilineText text={props.person.bio}/>
                    </Typography>
                </Collapse>
            </CardContent>
        </Card>
    )
};