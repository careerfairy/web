import { Image, Grid, Icon } from "semantic-ui-react";

function YoutubePreviewer(props) {

    let thumbnailUrl = "https://i.ytimg.com/vi/" + props.video.youtubeId + "/sddefault.jpg";

    return (
        <div className='react-player-thumbnail-container' onClick={() => props.showVideo()}>
            <div className='react-player-thumbnail-container'>
                <Image className='react-player-thumbnail' src={thumbnailUrl}/>
                <Icon style={{ position: 'absolute', top: '42%', left: '45%', color: 'rgb(245,245,245)', fontSize: '3em' }} name='play circle outline' size='big'/>
            </div>
            <div className='react-player-description-overlay'>
                <Grid>
                    <Grid.Row>
                        <Grid.Column width={4}>
                            <Image style={{ margin: '12px 10px 0 10px' }} src={ props.video.companyLogoUrl } size='small'/>
                        </Grid.Column>  
                        <Grid.Column width={12}>
                            <div className='react-player-description-title'>{ props.video.title }</div>
                            <div className='react-player-description-speaker'>{ props.video.speaker }</div>
                        </Grid.Column>  
                    </Grid.Row> 
                </Grid>    
            </div>
            <style jsx>{`
                .react-player-thumbnail-container {
                    padding-top: 30px;
                    position: relative;
                    cursor: pointer;
                }

                .react-player-description-overlay {
                    color: black;
                    margin-bottom: 20px;
                    text-align: left;
                }

                .react-player-description-title {
                    margin: 10px 0 0 0;
                    font-weight: 500;
                    font-size: 1em;
                }

                .react-player-thumbnail-container {
                    position: relative;
                }

                .react-player-thumbnail {
                    -webkit-filter: grayscale(40%);
                    filter: grayscale(40%);
                }

                .react-player-thumbnail:hover {
                    box-shadow: 0 0 2px rgb(200,200,200);
                    -webkit-filter: grayscale(0%);
                    filter: grayscale(0%);
                }

                .react-player-description-subtitle {
                    font-size: 0.7em;
                }

                .react-player-description-speaker {
                    font-size: 0.9em;
                }

                .hidden {
                    display: none !important;
                }

                #react-player-description-hiring {
                    text-transform: uppercase;
                    margin: 10px 15px 0 15px;
                    font-weight: 400;
                    font-size: 0.7em;
                    color: rgb(160,160,160);

                }
            `}</style>
        </div>
    );
}

export default YoutubePreviewer;