const percentageDonutConfig = [{
    display: false,
    fontStyle: 'bold',
    textShadow: true,
    overlap: true,
    fontColor: "white",
    render: ({percentage}) => {
        // args will be something like:
        // { label: 'Label', value: 123, percentage: 50, index: 0, dataset: {...} }
        return percentage > 2 ? percentage + "%" : "";
        // return object if it is image
        // return { src: 'image.png', width: 16, height: 16 };
    }
}]
export {percentageDonutConfig}