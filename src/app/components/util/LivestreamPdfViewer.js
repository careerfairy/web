import axios from 'axios';
import { useState, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import * as PDFJS from 'pdfjs-dist/build/pdf';
import { useWindowSize } from '../custom-hook/useWindowSize';
import { Button, Modal, Progress, Icon } from 'semantic-ui-react';

import FilePickerContainer from '../ssr/FilePickerContainer';
import { withFirebase } from '../../data/firebase';

function LivestreamPdfViewer (props) {

    PDFJS.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.4.456/pdf.worker.min.js'; 

    const windowSize = useWindowSize();
    const [pdfObject, setPdfObject] = useState(null);

    const [pdfNumberOfPages, setPdfNumberOfPages] = useState(1);
    
    const [uploadingPresentation, setUploadingPresentation] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (props.livestreamId) {
            props.firebase.listenToLivestreamPresentation(props.livestreamId, querySnapshot => {
                if (!querySnapshot.isEmpty) {
                    setPdfObject(querySnapshot.data());
                }
            });
        }      
    },[props.livestreamId]);

    function uploadLogo(logoFile) {
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
        var maxHeight = 450;
        var minHeight = 180;
        var calcHeight = windowSize.height > (windowSize.width / 2) ? (windowSize.width / 2 - 200) : (windowSize.height - 250);

        if (calcHeight > maxHeight) return maxHeight;
        if (calcHeight < minHeight) return minHeight;
        return calcHeight;
    }

    function increasePdfPageNumber() {
        props.firebase.increaseLivestreamPresentationPageNumber(props.livestreamId);
    }

    function decreasePdfPageNumber() {
        props.firebase.decreaseLivestreamPresentationPageNumber(props.livestreamId);
    }
    
    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translate(-50%)', display: ( pdfObject ? 'block' : 'none'), borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', bottom: '0', left: '0', zIndex: '9999', width: '100%', padding: '20px', display: props.presenter ? 'block' : 'none', backgroundColor: 'rgba(40,40,40, 0.8)'}}>
                    <div style={{ display: 'inline-block'}}>
                        <FilePickerContainer
                            extensions={['pdf']}
                            onChange={fileObject => { uploadLogo(fileObject)}}
                            maxSize={20}
                            onError={errMsg => ( console.log(errMsg) )}>
                            <Icon name='upload' size='large' style={{ color: 'white', cursor: 'pointer' }}/>
                        </FilePickerContainer>
                    </div>
                    <div style={{ display: 'inline-block', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
                        <Button circular icon='angle left' onClick={() => decreasePdfPageNumber()} disabled={pdfObject ? pdfObject.page === 1 : false}/>
                        <Button circular icon='angle right' onClick={() => increasePdfPageNumber()} disabled={pdfObject ? pdfObject.page === pdfNumberOfPages : false}/>
                    </div>
                </div>
                <div style={{ position: 'relative', textAlign: 'center'}}>
                    <Document
                        onLoadSuccess={({ numPages }) => setPdfNumberOfPages(numPages)}
                        file={ pdfObject ? pdfObject.downloadUrl : ''}>
                        <Page height={ getPageHeight() } renderTextLayer={false} pageNumber={pdfObject ? pdfObject.page : 1} />
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
                        <FilePickerContainer
                            extensions={['pdf']}
                            maxSize={20}
                            onChange={fileObject => { uploadLogo(fileObject, (newUrl) => { })}}
                            onError={errMsg => ( console.log(errMsg) )}>
                            <Button primary icon='upload' content='Upload Slides [.pdf]' />
                        </FilePickerContainer>
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
    )
}

export default withFirebase(LivestreamPdfViewer);