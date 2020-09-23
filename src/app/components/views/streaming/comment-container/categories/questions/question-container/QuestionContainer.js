
import React, {useState, useEffect, useContext} from 'react';
import {Input, Icon, Button, Label} from "semantic-ui-react";
import Linkify from 'react-linkify';

import { withFirebase } from 'context/firebase';

function QuestionContainer(props) {
    
    const [newCommentTitle, setNewCommentTitle] = useState("");
    const [comments, setComments] = useState([]);
    const [showAllReactions, setShowAllReactions] = useState(false);

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

    function goToThisQuestion(nextQuestionId) {
        const currentQuestion = props.questions.find(question => question.type === 'current');
        if (currentQuestion) {
            props.firebase.goToNextLivestreamQuestion(currentQuestion.id, nextQuestionId, props.livestream.id);
        } else {
            props.firebase.goToNextLivestreamQuestion(null, nextQuestionId, props.livestream.id);
        }
    }

    function addNewComment() {
        if (!(newCommentTitle.trim())) {
            return;
        }

        const newComment = {
            title: newCommentTitle,
            author: 'Streamer',
        }
        props.firebase.putQuestionComment(props.livestream.id, props.question.id, newComment)
            .then(() => {
                setNewCommentTitle("");
                setShowAllReactions(true);
            }, error => {
                console.log("Error: " + error);
            })
    }

    function addNewCommentOnEnter(target) {
        if(target.charCode==13){
            addNewComment();   
        } 
    }

    const componentDecorator = (href, text, key) => (
        <a href={href} key={key} target="_blank">
          {text}
        </a>
      );

    
    let commentsElements = comments.map((comment, index) => {
        return (
            <div className='animated fadeInUp faster' key={comment.id}>
                <div className='questionContainer'>
                    <div className='questionTitle'>
                        <Linkify componentDecorator={componentDecorator}>
                            { comment.title }
                        </Linkify>
                    </div>
                    <div className='questionAuthor'>
                        @{ comment.author }
                    </div>
                </div>
                <style jsx>{`
                    .questionContainer {
                        position: relative;
                        padding: 10px;
                        margin: 6px 0 3px 0;
                        background-color: white;
                        color: black;
                        border-radius: 10px;
                        box-shadow: 0 0 5px rgb(180,180,180);
                        font-size: 0.9em;
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

    if (!showAllReactions) {
        commentsElements = commentsElements.slice(0, 1);
    }

    const ReactionsToggle = (props) => {
        if (comments.length < 2) {
            return null;
        }

        return (
            <div className='reactions-toggle' onClick={() => setShowAllReactions(!showAllReactions)}>
                <Icon name={ showAllReactions ? 'angle up' : 'angle down'} style={{ marginRight: '3px'}}/>{ showAllReactions ? 'Hide' : 'Show all reactions'}
                <style jsx>{`
                    .reactions-toggle {
                        margin: 5px 0 0 0;
                        font-size: 0.8em;
                        font-weight: 500;
                        text-transform: uppercase;
                        cursor: pointer;
                        color: rgb(210,210,210);
                    }
                `}</style>
            </div>
        )
    } 

    return (
        <div className='animated fadeInUp faster'>
                <div className={'questionContainer ' + (props.question.type === 'current' ? 'active' : '') }>
                    <div className='questionTitle'>
                        { props.question.title }
                    </div>
                    <div className='bottom-element'>
                        <div className='comments'>
                            <p className='comments-number'>{ comments.length } reactions</p>
                        </div>
                    </div>
                    <div>
                        { commentsElements }
                    </div>
                    <ReactionsToggle/>
                    <div className='comment-input'>
                        <Input
                            icon={<Icon name='chevron circle right' inverted circular link onClick={() => addNewComment()} disabled={newCommentTitle.length < 4} color='teal'/>}
                            value={newCommentTitle}
                            onChange={(event) => {setNewCommentTitle(event.target.value)}}
                            onKeyPress={addNewCommentOnEnter}
                            maxLength='340'
                            placeholder='Send a reaction...'
                            fluid
                        />
                    </div>
                    <div className={'upvotes ' + (props.question.type === 'current' ? 'active' : '') }>
                        { props.question.votes } <Icon name='thumbs up' size='small'/>
                    </div>
                </div>
                <Button attached='bottom' icon='thumbs up' content={ 'Answer Now' } primary onClick={() => goToThisQuestion(props.question.id)} style={{ margin: '0 10px 10px 10px' }} disabled={props.question.type !== 'new'}/>

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
                        font-size: 1.1em;
                        line-height: 1.2em;
                        color: rgb(50,50,50);
                        margin: 15px 0 5px 0;
                        width: 100%;
                        word-break: break-word;
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
                        color: rgb(200,200,200);
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
                        right: 10px;
                        font-size: 1.2em;
                        display: inline-block;
                        margin: 0 0 0 30px;
                        font-weight: 700; 
                        color: rgba(0, 210, 170, 1);
                    }

                    .upvotes.active {
                        color: white;
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