import axios from 'axios';
import { useState, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import * as PDFJS from 'pdfjs-dist/build/pdf';
import { useWindowSize } from '../custom-hook/useWindowSize';

function LivestreamPdfViewer (props) {

    PDFJS.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.4.456/pdf.worker.min.js'; 

    const windowSize = useWindowSize();
    const [pdfObject, setPdfObject] = useState(null);

    const [pdfPageNumber, setPdfPageNumber] = useState(1);
    const [pdfNumberOfPages, setPdfNumberOfPages] = useState(1);

    useEffect(() => {
        axios.get('https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company_presentations%2FCareerFairy%20-%20Pitchdeck%2C%20Jan%202020.pdf?alt=media&token=75c2050a-e3b8-4fe1-bd68-7c33dcbe8a01')
        .then(response => {
            debugger;
            var file = new FileReader().readAsBinaryString(response.data);
            setPdfObject(file);
        }).catch( error => {
            console.log(error);
        });
    },[]);
    
    return (
        <Document
            onLoadSuccess={({ numPages }) => setPdfNumberOfPages(numPages)}
            file={pdfObject}>
            <Page width={ windowSize.width - 200 } pageNumber={pdfPageNumber} />
        </Document>
    )
}

export default LivestreamPdfViewer;