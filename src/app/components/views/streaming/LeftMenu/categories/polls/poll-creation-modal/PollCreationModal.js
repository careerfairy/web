import React, {useState, useEffect, Fragment} from 'react';

import { withFirebase } from 'context/firebase';
import { Input, Icon, Button, Modal } from 'semantic-ui-react';
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";

function PollCreationModal({open, handleClose, livestreamId, initialOptions, initialPoll, firebase}) {

    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['','']);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialPoll) {
            setQuestion(initialPoll.question);
            setOptions(initialPoll.options.map(option => option.name));
        }
    }, [initalPoll, open]);

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
        const updatedOptions = options.filter((value, index) => indexToRemove !== index );
        setOptions(updatedOptions);
    }

    function savePoll() {
        let emptyOption = options.some( option => option.trim() === '');
        if (emptyOption) {
            return setError(true);
        }  

        setLoading(true);
        if (initialPoll) {
            firebase.updateLivestreamPoll(livestreamId, initialPoll.id, question, options).then(() => {
                handleClose();
                setError(false);
                setQuestion('');
                setOptions(['','']);
                return setLoading(false);
            });
        } else {
            firebase.createLivestreamPoll(livestreamId, question, options).then(() => {
                handleClose();
                setError(false);
                setQuestion('');
                setOptions(['','']);
                return setLoading(false);
            });
        }
    }

    const optionElements = options.map((option, index) => {
        if (options.length < 3) {
            return (
                <div className='modal-content-option animated fadeInDown' key={index}>
                    <div className='label'>Option { index + 1 }</div>
                    <Input value={option} error={(option.trim() === '') && (error)} onChange={() => updateOption(index, event.target.value)} placeholder='Write down your option' fluid/>
                    <style jsx>{`
                        .modal-content-option {
                            margin: 5px 0 10px 0;
                        }
    
                        .modal-content-option .label {
                            font-weight: 700;
                            margin-bottom: 3px;
                            color: rgb(80,80,80);
                        }
                    `}</style>
                </div>
            );
        } else {
            return(
                <div className='modal-content-option animated fadeInDown' key={index}>
                    <div className='label'>Option { index + 1 }</div>
                    <Input value={option} error={(option.trim() === '') && (error)} onChange={() => updateOption(index, event.target.value)} placeholder='Write down your option' action={{ icon: 'delete', color: 'red', onClick: () => removeOption(index) }} fluid/>
                    <style jsx>{`
                        .modal-content-option {
                            margin: 5px 0 10px 0;
                        }
    
                        .modal-content-option .label {
                            font-weight: 700;
                            margin-bottom: 3px;
                            color: rgb(80,80,80);
                        }
                    `}</style>
                </div>
            );
        }    
    });

    return (
        <Fragment>
            <Dialog open={open} onClose={handleClose}>
                <DialogContent>
                    <div className='modal-title'><Icon name='chart bar outline' color='teal'/> Create a Poll</div>
                    <div className='modal-content'>
                        <div className='modal-content-question'>
                            <div className='label teal'>Your Question</div>
                            <Input value={question} onChange={() => setQuestion(event.target.value)} placeholder='Write down your question or poll to your audience' fluid/>
                        </div>
                        <div className='modal-content-options'>
                            { optionElements }
                        </div>
                        <Button icon='add' content='Add an Option' onClick={increaseNumberOfOptions} style={{ margin: '0 0 20px 0'}} disabled={options.length > 3} secondary/>
                        <Button.Group fluid  widths='2' size='large'>
                            <Button content='Cancel' onClick={handleClose}/>
                            <Button loading={loading} content={initialPoll ? 'Update Poll' : 'Create Poll'} primary onClick={savePoll}/>
                        </Button.Group>
                    </div>
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