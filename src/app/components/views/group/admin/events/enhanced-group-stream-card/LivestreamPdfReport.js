import { Document, Page, View, Text, Font } from '@react-pdf/renderer';
import styled from '@react-pdf/styled-components';
import StatsUtil from 'data/util/StatsUtil';
import { useEffect, useState } from 'react';

Font.register({ family: 'Poppins', fonts: [
    { src: 'http://fonts.gstatic.com/s/poppins/v13/pxiByp8kv8JHgFVrLGT9Z1xlEN2JQEk.ttf', fontWeight: 'normal'},
    { src: 'http://fonts.gstatic.com/s/poppins/v13/pxiByp8kv8JHgFVrLDD4Z1xlEN2JQEk.ttf', fontWeight: 'bold'}
]});

const CFPage = styled.Page`
    font-family: 'Poppins';
    padding: 150px 40px 40px 40px;
`;

const Label = styled.Text`
    font-family: 'Poppins';
    text-transform: uppercase;
    font-weight: bold;
    font-size: 15px;
    color: #00d2aa;
`;

const Title = styled.Text`
    font-family: 'Poppins';
    font-weight: normal;
    font-size: 22px;
`;

const Border = styled.View`
    font-family: 'Poppins';
    border: 2px solid blue;
`;



const LivestreamPdfReport = (props) => {

    debugger;

    return (
        <Document>
            <CFPage>
                <View>
                    <Label>Live Stream Report</Label>
                    <Title>{ props.livestream.title }</Title>
                </View>
            </CFPage>
        </Document>
    )
};

export default LivestreamPdfReport;

