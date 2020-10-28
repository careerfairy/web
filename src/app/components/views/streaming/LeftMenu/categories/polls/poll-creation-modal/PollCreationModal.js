import React, {useState, useEffect, Fragment} from 'react';
import AddIcon from '@material-ui/icons/Add';
import {withFirebase} from 'context/firebase';
import {Input, Icon, Modal} from 'semantic-ui-react';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import {
    DialogTitle,
    DialogContent,
    Dialog,
    Typography,
    ButtonGroup,
    Button,
    Paper,
    Fab,
    Box
} from '@material-ui/core';
import {BarChart, CloseRounded} from "@material-ui/icons";
import CircularProgress from "@material-ui/core/CircularProgress";
import DialogActions from "@material-ui/core/DialogActions";
import TextField from "@material-ui/core/TextField";
import Grow from "@material-ui/core/Grow";
import {makeStyles} from "@material-ui/core/styles";
import Collapse from "@material-ui/core/Collapse";

const useStyles = makeStyles(theme => ({
    modalPaper: {
        padding: theme.spacing(2)
    },
    dialog: {
        background: theme.palette.primary.main
    }
}))


function PollCreationModal({open, handleClose, livestreamId, initialOptions, initialPoll, firebase}) {
    const classes = useStyles()

    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialPoll) {
            setQuestion(initialPoll.question);
            setOptions(initialPoll.options.map(option => option.name));
        }
    }, [initialPoll, open]);

    function increaseNumberOfOptions() {
        if (options.length > 3) {
            return;
        }
        setOptions([...options, '']);
    }

    function updateOption(indexToUpdate, newValue) {
        const updatedOptions = options.map((value, index) => {
            if (index === indexToUpdate) {
                return newValue;
            } else {
                return value;
            }
        });
        setOptions(updatedOptions);
    }

    function removeOption(indexToRemove) {
        const updatedOptions = options.filter((value, index) => indexToRemove !== index);
        setOptions(updatedOptions);
    }

    function savePoll() {
        let emptyOption = options.some(option => option.trim() === '');
        if (emptyOption) {
            return setError(true);
        }

        setLoading(true);
        if (initialPoll) {
            firebase.updateLivestreamPoll(livestreamId, initialPoll.id, question, options).then(() => {
                handleClose();
                setError(false);
                setQuestion('');
                setOptions(['', '']);
                return setLoading(false);
            });
        } else {
            firebase.createLivestreamPoll(livestreamId, question, options).then(() => {
                handleClose();
                setError(false);
                setQuestion('');
                setOptions(['', '']);
                return setLoading(false);
            });
        }
    }

    const optionElements = options.map((option, index) => {

            return (
                <Collapse in>
                    <TextField value={option} error={(option.trim() === '') && (error)}
                               label={`Option ${index + 1}`}
                               helperText={(option.trim() === '') && (error) && "Please fill or remove"}
                               variant="outlined"
                               margin="dense"
                               onChange={({currentTarget: {value}}) => updateOption(index, value)}
                               placeholder='Write down your option'
                               InputProps={options.length >= 3 ? {
                                   endAdornment: <Box p={1}>
                                       <Fab onClick={() => removeOption(index)} size="small" color="primary"
                                            style={{background: "red", width: 36, height: 36}}>
                                           <DeleteForeverIcon/>
                                       </Fab>
                                   </Box>
                               } : {}}
                               fullWidth/>
                </Collapse>
            );
        }
        )
    ;

    return (
        <Fragment>
            <Dialog PaperProps={{className: classes.dialog}} maxWidth="sm" fullWidth open={open} onClose={handleClose}>
                <DialogTitle disableTypography
                             style={{display: "flex", justifyContent: "center", alignItems: "flex-end"}} align="center">
                    <BarChart style={{color: "white"}} fontSize="large"/> <Typography
                    style={{fontSize: "1.8em", fontWeight: 500, color: "white"}} variant="h3">Create a
                    Poll</Typography>
                </DialogTitle>
                <DialogContent>
                    <Paper className={classes.modalPaper}>
                            <TextField
                                label="Your Question"
                                value={question}
                                fullWidth
                                variant="outlined"
                                onChange={({currentTarget: {value}}) => setQuestion(value)}
                                placeholder='Write down your question or poll to your audience'
                            />
                        {optionElements}
                    </Paper>
                    <Button startIcon={<AddIcon/>} variant="contained" color="secondary"
                            style={{marginTop: "1rem", border: "2px solid white"}}
                            children='Add an Option' onClick={increaseNumberOfOptions}
                            disabled={options.length > 3}/>
                    <DialogActions>
                        <Button children='Cancel' style={{border: "2px solid white"}} variant="contained" onClick={handleClose}/>
                        <Button startIcon={loading && <CircularProgress size={20} color="inherit"/>} disabled={loading}
                                children={initialPoll ? 'Update Poll' : 'Create Poll'} color="primary"
                                variant="contained" onClick={savePoll} style={{border: "2px solid white"}}/>
                    </DialogActions>
                </DialogContent>
            </Dialog>
            <style jsx>{`
                .modal-title {
                    font-size: 1.8em;
                    text-align: center;
                    font-weight: 500;
                    color: rgb(80,80,80);
                    margin: 0 0 20px 0;
                }

                .modal-content {
                    width: 60%;
                    margin: 0 auto;
                    padding: 0 0 20px 0;
                }

                .modal-content-question {
                    margin: 20px 0;
                }

                .modal-content-options {
                    margin: 10px 0 20px 0;
                }

                .modal-content-option {
                    margin: 5px 0 10px 0;
                }

                .modal-content .label {
                    font-weight: 700;
                    margin-bottom: 3px;
                    color: rgb(80,80,80);
                }

                .modal-content .label.teal {
                    font-size: 1.3em;
                    color: rgb(0, 210, 170);
                    margin-bottom: 5px;
                }
          `}</style>
        </Fragment>
    );
}

export default withFirebase(PollCreationModal);