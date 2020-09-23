import { useState, useEffect } from 'react';

import { Container, Grid, Modal, Icon } from 'semantic-ui-react';

import ReactPlayer from 'react-player';
import { withFirebase } from 'context/firebase';
import YoutubePreviewer from 'components/views/common/YoutubePreviewer';

function CompanyWatchPage(props) {
    const [videos, setVideos] = useState([]);
    const [currentVideoId, setCurrentVideoId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    
    useEffect(() => {
        props.firebase.getCompanyVideos(props.company.id).then( querySnapshot => {
            var positionList = [];
            querySnapshot.forEach(doc => {
                let company = doc.data();
                positionList.push(company);
            }, error => {
                console.log(error);
            });
            setVideos(positionList);
        })
    }, [props.company]);

    function openVideo(youtubeId) {
        setCurrentVideoId(youtubeId);
        setModalOpen(true);
    }

    useEffect(() => {
        if (props.fullpageApi) {
            setTimeout(() => {
                props.fullpageApi.reBuild();
            }, 300);
        }
    }, [videos]);

    let videoList = videos.map((video, index) => {
        return (
            <Grid.Column key={index}>
                <YoutubePreviewer video={video} showVideo={() => openVideo(video.youtubeId)}/>
            </Grid.Column>
        );
    })

    let meetFooter = null;
    if (props.company.companyId === 'Axpo') {
        meetFooter = 
            <Container textAlign="center" className="titleFooter dark" onClick={() => props.fullpageApi.moveSectionDown()}>
                <p id='footer'>
                    Read {props.company.name }
                </p>
                <Icon name='angle down' size='big' id='footer_icon'/>
            </Container>;
    }

    return (
        <div className='paddingContainer'>
            <Container>
                <Grid stackable textAlign='left' id='videoColumn'>
                    <Grid.Row columns={2}>
                        { videoList }
                    </Grid.Row>
                </Grid>
                <Modal id='main-video-container' dimmer='blurring' open={modalOpen} onClose={() => setModalOpen(false)} closeIcon>
                    <Modal.Content>
                        <ReactPlayer className='react-player' width='100%' height='510px' controls={true} url={'https://www.youtube.com/watch?v=' + currentVideoId} playing={true}/>
                    </Modal.Content>
                </Modal>
                <style jsx>{`
                    #videoColumn {
                        margin-bottom: 50px;
                        position: relative;
                    }

                    #main-video-container .content {
                        padding: 0 !important;
                    }
                `}</style>
            </Container>
            {meetFooter}
        </div>
    );
}

export default withFirebase(CompanyWatchPage);