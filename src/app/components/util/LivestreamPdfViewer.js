import axios from 'axios';
import { useState, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import * as PDFJS from 'pdfjs-dist/build/pdf';
import { useWindowSize } from '../custom-hook/useWindowSize';
import { Button } from 'semantic-ui-react';

import FilePickerContainer from '../ssr/FilePickerContainer';

function LivestreamPdfViewer (props) {

    PDFJS.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.4.456/pdf.worker.min.js'; 

    const windowSize = useWindowSize();
    const [pdfObject, setPdfObject] = useState('https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company_presentations%2FCareerFairy%20-%20Pitchdeck%2C%20Jan%202020.pdf?alt=media&token=75c2050a-e3b8-4fe1-bd68-7c33dcbe8a01');

    const [pdfPageNumber, setPdfPageNumber] = useState(1);
    const [pdfNumberOfPages, setPdfNumberOfPages] = useState(1);

    function uploadLogo(logoFile, setFieldValue) {
        var storageRef = props.firebase.getStorageRef();
        let companyLogoRef = storageRef.child( 'company_documents/' + '1234' + '.pdf');

        var uploadTask = companyLogoRef.put(logoFile);

        uploadTask.on('state_changed',
            function(snapshot) {
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
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
                    //setFieldValue(downloadURL);
                    console.log('File available at', downloadURL);
                });
            });
    }

    function getPageHeight() {
        var maxHeight = 450;
        var minHeight = 280;
        var calcHeight = windowSize.height > (windowSize.width / 2.2) ? (windowSize.width / 2 - 200) : (windowSize.height - 250);

        if (calcHeight > maxHeight) return maxHeight;
        if (calcHeight < minHeight) return minHeight;
        return calcHeight;
    }
    
    return (
        <div style={{ position: 'relative', width: '100%'}}>
            <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translate(-50%)' }}>
                <div style={{ marginBottom: '20px', zIndex: '9999', width: '100%', minWidth: '500px'}}>
                    <div style={{ display: 'inline-block'}}>
                        <FilePickerContainer
                            extensions={['pdf']}
                            onChange={fileObject => { uploadLogo(fileObject, (newUrl) => { })}}
                            onError={errMsg => ( error.log(errMsg) )}>
                            <Button primary icon='upload' content='Upload Slides [.pdf]' />
                        </FilePickerContainer>
                    </div>
                    <div style={{ display: 'inline-block', position: 'absolute', left: '50%', transform: 'translateX(-50%)'}}>
                        <Button circular icon='angle left' onClick={() => setPdfPageNumber(pdfPageNumber - 1)} disabled={pdfPageNumber === 1}/>
                        <Button circular icon='angle right' onClick={() => setPdfPageNumber(pdfPageNumber + 1)} disabled={pdfPageNumber === pdfNumberOfPages}/>
                    </div>
                </div>
                <div style={{ position: 'relative', textAlign: 'center'}}>
                    <div style={{ position: 'relative', display: 'inline-block'}}>
                        <Document
                            onLoadSuccess={({ numPages }) => setPdfNumberOfPages(numPages)}
                            file={pdfObject}>
                            <Page height={ getPageHeight() } pageNumber={pdfPageNumber} />
                        </Document>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LivestreamPdfViewer;