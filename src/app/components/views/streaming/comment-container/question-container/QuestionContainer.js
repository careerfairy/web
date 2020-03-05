import React, {useState, useEffect} from 'react';
import {Input, Icon, Button, Label} from "semantic-ui-react";

import { withFirebase } from '../../../../../data/firebase';

function QuestionContainer(props) {
    
    const [newCommentTitle, setNewCommentTitle] = useState("");
    const [comments, setComments] = useState([]);

    useEffect(() => {
        if (props.livestream.id, props.question.id) {
            const unsubscribe = props.firebase.listenToQuestionComments(props.livestream.id, props.question.id, querySnapshot => {
                var commentsList = [];
                querySnapshot.forEach(doc => {
                    let comment = doc.data();
                    comment.id = doc.id;
                    commentsList.push(comment);
                });
                setComments(commentsList);
            });
            return () => unsubscribe();
        }
    }, [props.livestream.id, props.question.id]);

    function addNewComment() {
        const newComment = {
            title: newCommentTitle,
            author: 'STREAMER',
        }
        props.firebase.putQuestionComment(props.livestream.id, props.question.id, newComment)
            .then(() => {
                setNewCommentTitle("");
            }, error => {
                console.log("Error: " + error);
            })
    }

    function addNewCommentOnEnter(target) {
        if(target.charCode==13){
            addNewComment();   
        } 
    }

    function goToThisQuestion(nextQuestionId) {
        const currentQuestion = props.questions.find(question => question.type === 'current');
        if (currentQuestion) {
            props.firebase.goToNextLivestreamQuestion(currentQuestion.id, nextQuestionId, props.livestream.id);
        } else {
            props.firebase.goToNextLivestreamQuestion(null, nextQuestionId, props.livestream.id);
        }
    }

    
    let commentsElements = comments.map((comment, index) => {
        return (
            <div className='animated fadeInUp faster' key={index}>
                <div className='questionContainer'>
                    <div className='questionTitle'>
                        { comment.title }
                    </div>
                    <div className='questionAuthor'>
                        @{ comment.author }
                    </div>
                </div>
                <style jsx>{`
                    .questionContainer {
                        position: relative;
                        padding: 15px;
                        margin: 10px 0;
                        background-color: white;
                        color: black;
                        border-radius: 20px;
                        box-shadow: 0 0 5px rgb(180,180,180);
                        word-break: break-word;
                    }

                    .questionTitle {
                        word-break: break-word;
                    }

                    .questionAuthor {
                        font-size: 0.8em;
                        color: rgb(160,160,160);
                    }
                `}</style>
            </div>
        );
    });

    return (
        <div className='animated fadeInUp faster'>
                <div className={'questionContainer ' + (props.question.type === 'current' ? 'active' : '')  + (props.question.type === 'done' ? 'past' : '') }>
                    <div className='questionTitle'>
                        { props.question.title }
                    </div>
                    <div className='bottom-element'>
                        <div className='comments'>
                            <p className='comments-number'>{ comments.length } comments</p>
                        </div>
                    </div>
                    <div>
                        { commentsElements }
                    </div>
                    <div className='comment-input'>
                        <Input
                            icon={<Icon name='chevron circle right' inverted circular link onClick={() => addNewComment()} color='teal'/>}
                            value={newCommentTitle}
                            onChange={(event) => {setNewCommentTitle(event.target.value)}}
                            onKeyPress={addNewCommentOnEnter}
                            disabled={props.question.type === 'done'}
                            placeholder='Send a comment...'
                            fluid
                        />
                    </div>
                </div>
                <div className='upvotes'>
                    { props.question.votes } <Icon name='thumbs up'/>
                </div>
                <Button attached='bottom' icon='thumbs up' content={ 'ANSWER THIS QUESTION' } primary onClick={() => goToThisQuestion(props.question.id)} style={{ margin: '0 10px 10px 10px' }} disabled={props.question.type !== 'new'}/>
                <style jsx>{`
                    .questionContainer {
                        position: relative;
                        padding: 20px 20px 60px 20px;
                        margin: 10px 10px 0 10px;
                        background-color: rgb(250,250,250);
                        border-top-left-radius: 5px;
                        border-top-right-radius: 5px;
                        box-shadow: 0 0 5px rgb(180,180,180);
                    }

                    .questionContainer.active {
                        background-color: rgb(0, 210, 170);
                        color: white;
                    }

                    .questionContainer.past {
                        opacity: 0.6;
                    }

                    .questionTitle {
                        font-weight: 700;
                        font-size: 1.3em;
                        line-height: 1.3em;
                        color: rgb(50,50,50);
                        margin: 5px 0;
                        width: 85%;
                    }

                    .questionContainer.active .questionTitle {
                        color: white;
                    }

                    .questionAuthor {
                        font-size: 0.8em;
                        color: rgb(130,130,130);
                    }

                    .questionContainer.active .questionAuthor {
                        color: white;
                    }

                    .bottom-element {
                        margin-top: 5px;
                        color: rgba(0, 210, 170, 0.5);
                        font-size: 0.9em;  
                        font-weight: 700; 
                    }

                    .questionContainer.active .bottom-element {
                        color: white;
                    }

                    .comments {
                        font-size: 1em;     
                        display: inline-block;
                        text-transform: uppercase;
                    }

                    .comments-number {
                        font-size: 1em;    
                        vertical-align: middle;
                        margin: 0;
                    }

                    .comments-add {
                        font-size: 0.9em;    
                        margin: 0;
                        color: rgb(0, 210, 170);
                        cursor: pointer;
                    }

                    .upvotes {
                        position: absolute;
                        top: 10px;
                        right: 15px;
                        display: inline-block;
                        margin: 0 0 0 30px;
                        font-weight: 700; 
                        color: rgba(0, 210, 170, 1);
                    }

                    .comment-input {
                        position: absolute;
                        bottom: 5px;
                        left: 5px;
                        right: 5px;
                    }
                `}</style>
            </div>
    );
}

export default withFirebase(QuestionContainer);