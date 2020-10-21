import React, {useEffect, useState} from 'react';
import {Doughnut} from "react-chartjs-2";
import {Typography} from "@material-ui/core";

const baseColors = [
    '#36A2EB',
    '#FFCE56',
    '#27AE60',
    '#8E44AD',
    '#E67E22',
    '#E74C3C',
    '#B7950B',
    '#145A32',
]
// const option = {name: "Our next product", voters: Array(1), votes: 1, index: 0}
const CurrentPollGraph = ({currentPoll: {id, options, question, state, timestamp, voters}}) => {
    const [pollData, setPollData] = useState({
        labels: options.map(option => option.name),
        datasets: [{
            label: question,
            data: options.map(option => option.votes),
            backgroundColor: options.map((option, index) => baseColors[index]),
            hoverBackgroundColor: options.map((option, index) => baseColors[index])
        }]
    })

    useEffect(() => {
        setPollData({
            ...pollData,
            data: options.map(option => option.votes)
        })
    }, [options]);


    return (
        <div style={{
            background: "rgb(240, 240, 240)",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center"
        }}>
            <Typography align="center" variant="h4" gutterBottom>{question}</Typography>
            <Doughnut data={pollData}/>
        </div>
    );
};

export default CurrentPollGraph;
