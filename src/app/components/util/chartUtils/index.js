import "chartjs-plugin-labels";
import { CsvBuilder } from "filefy";

export const percentageDonutConfig = [
   {
      display: false,
      fontStyle: "bold",
      textShadow: true,
      overlap: true,
      fontColor: "white",
      render: ({ percentage }) => {
         // args will be something like:
         // { label: 'Label', value: 123, percentage: 50, index: 0, dataset: {...} }
         return percentage > 2 ? percentage + "%" : "";
         // return object if it is image
         // return { src: 'image.png', width: 16, height: 16 };
      },
   },
];

export const doughnutOptions = (showPercentage, theme) => ({
   cutoutPercentage: 70,
   layout: { padding: 0 },
   legend: {
      display: false,
   },
   maintainAspectRatio: false,
   responsive: true,
   tooltips: {
      backgroundColor: theme.palette.background.default,
      bodyFontColor: theme.palette.text.secondary,
      borderColor: theme.palette.divider,
      borderWidth: 1,
      enabled: true,
      footerFontColor: theme.palette.text.secondary,
      intersect: false,
      mode: "index",
      titleFontColor: theme.palette.text.primary,
   },
   plugins: {
      labels: showPercentage && percentageDonutConfig,
   },
});

export const randomColor = () => {
   const max = 0xffffff;
   return "#" + Math.round(Math.random() * max).toString(16);
};

export const exportChartDataToCsv = (chartRef, title) => {
   const {
      current: {
         props: {
            data: { labels, datasets },
         },
      },
   } = chartRef;

   const tableTitle = title.split(" ").join("_");
   const builder = new CsvBuilder(tableTitle + ".csv");
   builder
      .setColumns(labels)
      .addRows(
         datasets.map(({ data }) => labels.map((_, index) => data[index]))
      )
      .exportFile();
};
