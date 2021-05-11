import React, {useRef, useState} from 'react';
import {makeStyles, useTheme} from "@material-ui/core/styles";
import {Box, Card, CardContent, CardHeader, IconButton, Tooltip} from "@material-ui/core";
import {useSelector} from "react-redux";
import {Doughnut} from "react-chartjs-2";
import {doughnutOptions, exportChartDataToCsv, randomColor} from "../../../../util/chartUtils";
import CustomLegend from "../../../../../materialUI/Legends";
import {createSelector} from "reselect";
import {convertStringToArray} from "../../../../helperFunctions/HelperFunctions";
import {colorsArray} from "../../../../util/colors";
import Chart from "chart.js";
import ExportCSVIcon from '@material-ui/icons/GetApp';
import {universityCountriesMap} from "../../../../util/constants/universityCountries";

Chart.defaults.global.plugins.labels = false;
const useStyles = makeStyles(theme => ({}));

const distributionSelector = createSelector(
    state => state.firestore.data["universityCountryDistribution"],
    (_, {theme}) => theme,
    (universityCountryDistribution, theme) => {
        const mapOfTotals = universityCountryDistribution?.totalByCountry || {}
        const dataArray = Object.keys(mapOfTotals).map((key, index) => ({
            code: key,
            value: mapOfTotals[key],
            countryName: universityCountriesMap[key] || "Unknown",
        })).sort((a, b) => b.value - a.value)
        const colors = [...colorsArray, ...dataArray.map(() => randomColor())]
        const data = {
            datasets: [
                {
                    data: dataArray.map(({value}) => value),
                    backgroundColor: colors,
                    borderWidth: 8,
                    borderColor: theme.palette.common.white,
                    hoverBorderColor: theme.palette.common.white
                }
            ],
            labels: dataArray.map(({countryName}) => convertStringToArray(countryName))
        }


        return {data, colors, dataArray}

    }
)

const UniversityCountriesChart = () => {
    const chartRef = useRef()
    const classes = useStyles()
    const theme = useTheme()
    const {data, colors, dataArray} = useSelector(state =>
        distributionSelector(state, {theme})
    )
    const handleExportChartToCSV = () => {
        exportChartDataToCsv(chartRef, "Student University Country Distribution")
    }

    return (
        <Card>
            <CardHeader
                title="Student University Country Distribution"
                action={
                    <Tooltip title="Export this chart data to CSV">
                        <IconButton
                            onClick={handleExportChartToCSV}>
                            <ExportCSVIcon/>
                        </IconButton>
                    </Tooltip>
                }
            />
            <CardContent>
                <Box
                    height={300}
                    position="relative"
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                >
                    <Doughnut
                        data={data}
                        ref={chartRef}
                        options={doughnutOptions(true, theme)}
                    />
                </Box>
                <Box
                    display="flex"
                    justifyContent="center"
                    mt={2}
                >
                    <CustomLegend
                        options={dataArray}
                        colors={colors}
                        chartRef={chartRef}
                        fullWidth
                        hideEmpty
                        chartData={data}
                        optionDataType="Student"
                        optionValueProp="value"
                    />
                </Box>
            </CardContent>
        </Card>
    );
};

export default UniversityCountriesChart;
