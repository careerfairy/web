import React, {useEffect, useState} from 'react';
import {Doughnut} from "react-chartjs-2";
import {Typography, useTheme} from "@material-ui/core";
import Chart from 'chart.js'

Chart.pluginService.register({
    beforeDraw: function (chart) {
        if (chart.config.options.elements.center) {
            // Get ctx from string
            var ctx = chart.chart.ctx;

            // Get options from the center object in options
            var centerConfig = chart.config.options.elements.center;
            var fontStyle = centerConfig.fontStyle || 'Arial';
            var txt = centerConfig.text;
            var color = centerConfig.color || '#000';
            var maxFontSize = centerConfig.maxFontSize || 75;
            var sidePadding = centerConfig.sidePadding || 20;
            var sidePaddingCalculated = (sidePadding / 100) * (chart.innerRadius * 2)
            // Start with a base font of 30px
            ctx.font = "30px " + fontStyle;

            // Get the width of the string and also the width of the element minus 10 to give it 5px side padding
            var stringWidth = ctx.measureText(txt).width;
            var elementWidth = (chart.innerRadius * 2) - sidePaddingCalculated;

            // Find out how much the font can grow in width.
            var widthRatio = elementWidth / stringWidth;
            var newFontSize = Math.floor(30 * widthRatio);
            var elementHeight = (chart.innerRadius * 2);

            // Pick a new font size so it will not be larger than the height of label.
            var fontSizeToUse = Math.min(newFontSize, elementHeight, maxFontSize);
            var minFontSize = centerConfig.minFontSize;
            var lineHeight = centerConfig.lineHeight || 25;
            var wrapText = false;

            if (minFontSize === undefined) {
                minFontSize = 20;
            }

            if (minFontSize && fontSizeToUse < minFontSize) {
                fontSizeToUse = minFontSize;
                wrapText = true;
            }

            // Set font settings to draw it correctly.
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            var centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
            var centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);
            ctx.font = fontSizeToUse + "px " + fontStyle;
            ctx.fillStyle = color;

            if (!wrapText) {
                ctx.fillText(txt, centerX, centerY);
                return;
            }

            var words = txt.split(' ');
            var line = '';
            var lines = [];

            // Break words up into multiple lines if necessary
            for (var n = 0; n < words.length; n++) {
                var testLine = line + words[n] + ' ';
                var metrics = ctx.measureText(testLine);
                var testWidth = metrics.width;
                if (testWidth > elementWidth && n > 0) {
                    lines.push(line);
                    line = words[n] + ' ';
                } else {
                    line = testLine;
                }
            }

            // Move the center up depending on line height and number of lines
            centerY -= (lines.length / 2) * lineHeight;

            for (var n = 0; n < lines.length; n++) {
                ctx.fillText(lines[n], centerX, centerY);
                centerY += lineHeight;
            }
            //Draw text in center
            ctx.fillText(line, centerX, centerY);
        }
    }
});

const baseColors = [
    '#E74C3C',
    '#E67E22',
    '#FFCE56',
    '#145A32',
    '#36A2EB',
    '#27AE60',
    '#8E44AD',
    '#B7950B',
]
// const option = {name: "Our next product", voters: Array(1), votes: 1, index: 0}
const CurrentPollGraph = ({currentPoll: {options, question, timestamp, voters}}) => {
        const theme = useTheme()

        const getTotalVotes = (arr) => {
            return arr.reduce((acc, obj) => acc + obj.votes, 0); // 7
        }

        const dataObj = {
            labels: options.map(option => option.name),
            datasets: [{
                label: question,
                data: options.map(option => option.votes),
                backgroundColor: options.map((option, index) => baseColors[index]),
                hoverBackgroundColor: options.map((option, index) => baseColors[index])
            }],
        }
        const optionsObj = {
            elements: {
                center: {
                    text: `Total Votes: ${getTotalVotes(options)}`,
                    color: '#000000', // Default is #000000
                    fontStyle: 'Poppins', // Default is Arial
                    sidePadding: 20, // Default is 20 (as a percentage)
                    minFontSize: 25, // Default is 20 (in px), set to false and text will not wrap.
                    lineHeight: 25 // Default is 25 (in px), used for when text wraps
                }
            },
            tooltips: {
                callbacks: {
                    title:  (tooltipItem, data) => {
                        return data['labels'][tooltipItem[0]['index']];
                    },
                    label:  (tooltipItem, data) => {
                        return data['datasets'][0]['data'][tooltipItem['index']] + " votes";
                    },
                    afterLabel:  (tooltipItem, data) => {
                        const dataset = data['datasets'][0];
                        const percent = Math.round((dataset['data'][tooltipItem['index']] / dataset["_meta"][0]['total']) * 100)
                        return '(' + percent + '%)';
                    }
                },
                backgroundColor: '#FFF',
                titleFontSize: 16,
                titleFontColor: theme.palette.primary.main,
                bodyFontColor: '#000',
                bodyFontSize: 14,
                displayColors: false,
                borderColor: theme.palette.primary.main,
                borderWidth: 3,
            }
        }

        const legendObj = {
            display: true,
            position: 'top',
            fullWidth: true,
            reverse: false,
            labels: {
                fontStyle: "bold"
            }
        }


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
                <Doughnut legend={legendObj}
                          data={dataObj}
                          width={100}
                          height={100}
                          options={optionsObj}/>
            </div>
        )
            ;
    }
;

export default CurrentPollGraph;
