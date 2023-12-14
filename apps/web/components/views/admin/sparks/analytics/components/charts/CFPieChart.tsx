import { PieChart } from "@mui/x-charts/PieChart"

const CFPieChart = () => {
   return (
      <PieChart
         width={400}
         height={200}
         series={[
            {
               data: [
                  { id: 0, value: 10, label: "series A" },
                  { id: 1, value: 15, label: "series B" },
                  { id: 2, value: 20, label: "series C" },
               ],
            },
         ]}
         slotProps={{
            legend: {
               direction: "column",
               position: { vertical: "bottom", horizontal: "left" },
               padding: 1,
            },
         }}
      />
   )
}

export default CFPieChart
