import {Button, Container, Header as SemanticHeader, Input, Image, Grid, Icon} from "semantic-ui-react";

function PlayerPrepare(props) {

    return (
            <div>
                <div className={ !props.isPlaying ? 'video-mask' : 'video-mask hidden'} style={{backgroundImage: 'url(' + (props.currentLivestream ? props.currentLivestream.backgroundImage : '') + ')'}}>
                    <div className='mask'>
                        <div className='mask-content'>
                            <div className='live-now animated flash slower infinite'><span>Please wait, we're connecting you to your future...</span></div>
                        </div>
                    </div>
                </div>
                <style jsx>{`
                    .hidden {
                        display: none;
                    }
        
                    .video-mask {
                        position: absolute;
                        top: 75px;
                        left: 0;
                        width: 100%;
                        min-height: calc(100% - 75px);
                        height: auto;
                        background-color: rgb(230,230,230);
                        background-size: cover;
                        z-index: 9999;
                    }
        
                    .mask {
                        position: absolute;
                        width: 100%;
                        min-height: 100%;
                        background-color: rgba(15, 37, 54,0.8);
                        padding: 15px 0 80px 0;
                    }
                    
                    .mask-content {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        width: 100%;                        
                        color: white;
                        font-size: 2em;
                        text-align: center;
                    }

                    .live-now {
                        margin: 30px 0;
                    }
            `}</style>
        </div>
    );
}

export default PlayerPrepare;