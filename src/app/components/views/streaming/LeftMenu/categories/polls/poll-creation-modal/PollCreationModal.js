import React, {useState, useEffect} from 'react';
import AddIcon from '@material-ui/icons/Add';
import {withFirebase} from 'context/firebase';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import {
    DialogTitle,
    DialogContent,
    Dialog,
    Typography,
    Button,
    Fab,
    Box, Slide
} from '@material-ui/core';
import {BarChart} from "@material-ui/icons";
import CircularProgress from "@material-ui/core/CircularProgress";
import DialogActions from "@material-ui/core/DialogActions";
import TextField from "@material-ui/core/TextField";
import Grow from "@material-ui/core/Grow";

function PollCreationModal({open, handleClose, livestreamId, initialOptions, initialPoll, firebase}) {

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
                <Grow key={index} in>
                    <TextField
                        key={index}
                        value={option}
                        error={(option.trim() === '') && (error)}
                        label={`Option ${index + 1}`}
                        helperText={(option.trim() === '') && (error) && "Please fill or remove"}
                        variant="outlined"
                        margin="dense"
                        fullWidth
                        onChange={({currentTarget: {value}}) => updateOption(index, value)}
                        placeholder='Write down your option'
                        InputProps={options.length >= 3 ? {
                            endAdornment: <Box p={1}>
                                <Fab onClick={() => removeOption(index)} size="small" color="primary"
                                     style={{background: "red", width: 36, height: 36}}>
                                    <DeleteForeverIcon/>
                                </Fab>
                            </Box>
                        } : {}}/>
                </Grow>
            );
        }
        )
    ;

    return (
        <Dialog TransitionComponent={Slide} maxWidth="sm" fullWidth open={open} onClose={handleClose}>
            <DialogTitle disableTypography
                         style={{display: "flex", justifyContent: "center", alignItems: "flex-end"}} align="center">
                <BarChart color="primary" fontSize="large"/> <Typography color="primary"
                                                                         style={{fontSize: "1.8em", fontWeight: 500}}
                                                                         variant="h3">Create a
                Poll</Typography>
            </DialogTitle>
            <DialogContent>
                <TextField
                    label="Your Question"
                    value={question}
                    fullWidth
                    variant="outlined"
                    onChange={({currentTarget: {value}}) => setQuestion(value)}
                    placeholder='Write down your question or poll to your audience'
                />
                {optionElements}
                <Button startIcon={<AddIcon/>} variant="contained" color="secondary"
                        style={{marginTop: "1rem"}}
                        children='Add an Option' onClick={increaseNumberOfOptions}
                        disabled={options.length > 3}/>
                <DialogActions>
                    <Button children='Cancel' variant="contained"
                            onClick={handleClose}/>
                    <Button startIcon={loading && <CircularProgress size={20} color="inherit"/>} disabled={loading}
                            children={initialPoll ? 'Update Poll' : 'Create Poll'} color="primary"
                            variant="contained" onClick={savePoll}/>
                </DialogActions>
            </DialogContent>
        </Dialog>
    );
}

export default withFirebase(PollCreationModal);