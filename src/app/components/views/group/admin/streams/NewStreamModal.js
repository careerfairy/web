import React, {Fragment, useState} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {AppBar, Dialog, Slide} from "@material-ui/core";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import DraftStreamForm from "../../../draftStreamForm/DraftStreamForm";
import {withFirebase} from "../../../../../context/firebase";

const useStyles = makeStyles(theme => ({

    title: {
        marginLeft: theme.spacing(2),
        flex: 1,
    },
    background: {
        backgroundColor: theme.palette.primary.dark,
    },
    appBar: {
        backgroundColor: theme.palette.navyBlue.main,
        marginBottom: theme.spacing(2)
    }
}));


const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const NewStreamModal = ({group, open, onClose, firebase}) => {

    const classes = useStyles()
    const [submitted, setSubmitted] = useState(false)

    const handleSaveChanges = () => {

    }

    return (
        <Dialog
            TransitionComponent={Transition}
            onClose={onClose}
            fullScreen
            open={open}
            PaperProps={{
                className: classes.background
            }}
        >
            <AppBar className={classes.appBar} position="sticky">
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
                        <CloseIcon/>
                    </IconButton>
                    <Typography variant="h6" className={classes.title}>
                        New Draft / Stream
                    </Typography>
                    <Button autoFocus color="inherit" onClick={handleSaveChanges}>
                        publish
                    </Button>
                    <Button autoFocus color="inherit" onClick={handleSaveChanges}>
                        save changes
                    </Button>
                </Toolbar>
            </AppBar>
            <DraftStreamForm group={group} submitted={submitted} setSubmitted={setSubmitted}/>
        </Dialog>
    );
};

export default withFirebase(NewStreamModal);
