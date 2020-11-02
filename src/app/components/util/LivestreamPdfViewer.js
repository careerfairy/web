import axios from 'axios';
import { useState, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import * as PDFJS from 'pdfjs-dist/build/pdf';

import { useWindowSize } from 'components/custom-hook/useWindowSize';
import { IconButton } from '@material-ui/core';
import { Button, Modal, Progress, Icon } from 'semantic-ui-react';

import FilePickerContainer from 'components/ssr/FilePickerContainer';
import { withFirebase } from 'context/firebase';
import { CircularProgress } from '@material-ui/core';
import { Fragment } from 'react';

function LivestreamPdfViewer (props) {

    PDFJS.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.4.456/pdf.worker.min.js'; 

    const windowSize = useWindowSize();
    const [pdfObject, setPdfObject] = useState(null);
    const [loading, setLoading] = useState(true);

    const [goingToPreviousPage, setGoingToPreviousPage] = useState(false)
    const [goingToNextPage, setGoingToNextPage] = useState(false)

    const [pdfNumberOfPages, setPdfNumberOfPages] = useState(1);
    
    const [uploadingPresentation, setUploadingPresentation] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (props.livestreamId) {
            setLoading(true);
            props.firebase.listenToLivestreamPresentation(props.livestreamId, querySnapshot => {
                if (querySnapshot.exists) {
                    setPdfObject(querySnapshot.data());
                } else {
                    setLoading(false);
                }
            });
        }      
    },[props.livestreamId]);

    function uploadLogo(logoFile) {
        setLoading(true);
        setUploadingPresentation(true);
        var storageRef = props.firebase.getStorageRef();
        let presentationRef = storageRef.child( 'company_documents/' + props.livestreamId + '.pdf');

        var uploadTask = presentationRef.put(logoFile);

        uploadTask.on('state_changed',
            function(snapshot) {
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setProgress(progress);
                console.log('Upload is ' + progress + '% done');
                switch (snapshot.state) {
                    case 'paused':
                    console.log('Upload is paused');
                    break;
                    case 'running':
                    console.log('Upload is running');
                    break;
                    default:
                    break;
                }
            }, function(error) {    
                switch (error.code) {
                    case 'storage/unauthorized':
                        break;              
                    case 'storage/canceled':
                        break;         
                    case 'storage/unknown':
                        break;
                    default:
                        break;
                }
            }, function() {
                // Upload completed successfully, now we can get the download URL
                uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                    props.firebase.setLivestreamPresentation(props.livestreamId, downloadURL);
                    console.log('File available at', downloadURL);
                    setUploadingPresentation(false);
                });
            });
    }

    function getPageHeight() {
        if (props.presenter) {
            if (props.showMenu) {
                if (windowSize.height > (windowSize.width - 480)) {
                    return windowSize.width * 0.30;
                }
                return (windowSize.height * 0.8 - 55);
            } else {
                if (windowSize.height > (windowSize.width - 220)) {
                    return windowSize.width * 0.55;
                }
                return (windowSize.height * 0.8 - 55);
            }     
        } else {
            if (windowSize.height > (windowSize.width - 220)) {
                return windowSize.width * 0.55;
            }
            return (windowSize.height * 0.8 - 55);
        }      
    }

    function increasePdfPageNumber() {
        setGoingToNextPage(true)
        props.firebase.increaseLivestreamPresentationPageNumber(props.livestreamId).then(() => {
            setGoingToNextPage(false)
        });
    }

    function decreasePdfPageNumber() {
        setGoingToPreviousPage(true)
        props.firebase.decreaseLivestreamPresentationPageNumber(props.livestreamId).then(() => {
            setGoingToPreviousPage(false)
        });
    }
    
    return (
        <Fragment>
            <div style={{ display: loading ? 'block': 'none', position: 'relative', width: '100%', height: 'calc(80vh - 55px)' }}>
                <div style={{ position: 'absolute', width: '30%', maxWidth: '30px', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
                    <CircularProgress style={{ maxWidth: '30px', height: 'auto'}} />
                </div>
            </div>
            <div style={{  display: loading ? 'none': 'block', position: 'relative', width: '100%', height: 'calc(80vh - 55px)' }}>
                <div style={{ position: 'absolute', top: '0', left: '50%', transform: 'translate(-50%)', display: ( pdfObject ? 'block' : 'none'), overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', bottom: '0', left: '0', zIndex: '1000', width: '100%', padding: '30px', display: props.presenter ? 'block' : 'none', backgroundColor: 'rgba(110,110,110, 0.8)'}}>
                        <div style={{ display: 'inline-block', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
                            
                            <Button circular icon='angle left' disabled={goingToNextPage || goingToPreviousPage || (pdfObject ? pdfObject.page === 1 : false)} loading={goingToPreviousPage} onClick={() => decreasePdfPageNumber()}/>
                            <Button circular icon='angle right' disabled={goingToNextPage || goingToPreviousPage || (pdfObject ? pdfObject.page === pdfNumberOfPages : false)} loading={goingToNextPage} onClick={() => increasePdfPageNumber()}/>
                        </div>
                    </div>
                    <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: '1000', display: props.presenter ? 'block' : 'none'}}>
                        <FilePickerContainer
                            extensions={['pdf']}
                            onChange={fileObject => { uploadLogo(fileObject)}}
                            maxSize={20}
                            onError={errMsg => ( console.log(errMsg) )}>
                            <Button primary icon='upload' size='mini' content='Upload Slides [.pdf]' />
                        </FilePickerContainer>
                    </div>
                    <div style={{ position: 'relative', textAlign: 'center'}}>
                        <Document
                            onLoadSuccess={({ numPages }) => {
                                setPdfNumberOfPages(numPages);
                                setLoading(false);
                            }}
                            file={ pdfObject ? pdfObject.downloadUrl : ''}>
                            <Page 
                            height={ getPageHeight() } 
                            renderTextLayer={false} 
                            renderAnnotationLayer={false} 
                            pageNumber={pdfObject ? pdfObject.page : 1} />
                        </Document>
                    </div>
                </div>
                <div style={{ position: 'absolute', top: '150px', left: '50%', transform: 'translate(-50%)', display: ( pdfObject ? 'none' : 'block') }}>
                    <div style={{ marginBottom: '20px', zIndex: '9999'}}>
                        <div style={{ display: 'inline-block', textAlign: 'center', display: props.presenter ? 'block' : 'none'}}>
                            <div style={{ color: 'white', marginBottom: '40px'}}>
                                <p>You currently have no slides to share</p>
                                <div>
                                    <FilePickerContainer
                                        extensions={['pdf']}
                                        onChange={fileObject => { uploadLogo(fileObject)}}
                                        maxSize={20}
                                        onError={errMsg => ( console.log(errMsg) )}>
                                        <Button primary icon='upload' content='Upload Slides [.pdf]' />
                                    </FilePickerContainer>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'inline-block', textAlign: 'center', display: props.presenter ? 'none' : 'block'}}>
                            <div style={{ color: 'white', marginBottom: '40px'}}>Please wait for the presenter to upload slides.</div>
                        </div>
                    </div>
                </div>
                <Modal open={uploadingPresentation}>
                    <Modal.Content>
                        <h3>Uploading presentation...</h3>
                        <Progress percent={progress} indicating/>
                    </Modal.Content>
                </Modal>
            </div>
        </Fragment>
    )
}

export default withFirebase(LivestreamPdfViewer);