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
    Box,
    Slide,
    CircularProgress,
    DialogActions,
    TextField,
    Grow,
} from '@material-ui/core';
import {BarChart} from "@material-ui/icons";
import {GlassDialog} from "../../../../../../../materialUI/GlobalModals";
import {v4 as uuidv4} from "uuid";

/**
 * Create Empty Option.
 * @return {({id: string, text: string})} Returns a newly generated empty option.
 */
const createEmptyOption = () => ({id: uuidv4(), text: ''})
const getInitialOptions = () => [createEmptyOption(), createEmptyOption()]

function PollCreationModal({open, handleClose, livestreamId, initialOptions, initialPoll, firebase}) {

    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(getInitialOptions());
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // console.log("-> initialPoll", initialPoll);
        if (initialPoll) {
            setQuestion(initialPoll.question);
            setOptions(initialPoll.options.map(option => option));
        }
    }, [initialPoll, open]);

    function increaseNumberOfOptions() {
        if (options.length > 3) {
            return;
        }
        setOptions([...options, createEmptyOption()]);
    }


    /**
     * @param {string} idToUpdate - Id of the option you with to update
     * @param {string} newValue - New text value of the option you wish to update
     */
    function updateOption(idToUpdate, newValue) {
        const updatedOptions = options.map(option => {
            if (option.id === idToUpdate) {
                return {...option, text: newValue};
            }
            return option;
        });
        setOptions(updatedOptions);
    }

    /**
     * @param {string} idToRemove - The id of the option you wish to remove
     */
    const removeOption = (idToRemove) => {
        const updatedOptions = options.filter((option) => idToRemove !== option.id);
        setOptions(updatedOptions);
    };

    const resetForm = () => {
        handleClose();
        setError(false);
        setQuestion('');
        setOptions(getInitialOptions());
        return setLoading(false);
    };

    function savePoll() {
        let emptyOption = options.some(option => option.text.trim() === '');
        if (emptyOption) {
            return setError(true);
        }

        setLoading(true);
        // const optionsObject = PollUtil.convertPollOptionNamesArrayToObject(options)
        if (initialPoll) {
            firebase.updateLivestreamPoll(livestreamId, initialPoll.id, question, options).then(() => {
                resetForm()
            });
        } else {
            firebase.createLivestreamPoll(livestreamId, question, options).then(() => {
                resetForm()
            });
        }
    }

    const optionElements = options.map(({id, text}, index) => {
            return (
                <Grow key={id} in>
                    <TextField
                        key={id}
                        value={text}
                        error={(text?.trim() === '') && (error)}
                        label={`Option ${index + 1}`}
                        helperText={(text?.trim() === '') && (error) && "Please fill or remove"}
                        variant="outlined"
                        margin="dense"
                        fullWidth
                        onChange={({currentTarget: {value}}) => updateOption(id, value)}
                        placeholder='Write down your option'
                        InputProps={options.length >= 3 ? {
                            endAdornment: <Box p={1}>
                                <Fab onClick={() => removeOption(id)} size="small" color="primary"
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
        <GlassDialog TransitionComponent={Slide} maxWidth="sm" fullWidth open={open} onClose={handleClose}>
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
        </GlassDialog>
    );
}

export default withFirebase(PollCreationModal);