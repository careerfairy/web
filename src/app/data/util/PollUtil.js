export default class PollUtil {
    static convertPollOptionsObjectToArray(pollOptionsObject = {}) {
        return Object.keys(pollOptionsObject).map((key) => ({
            ...pollOptionsObject[key],
            index: key
        }));
    }

    static convertPollOptionNamesArrayToObject(arrayOfPollOptionNames = ["optionName"]) {
        return Object.assign({}, ...arrayOfPollOptionNames.map((option, index) => ({
            [index]: {
                name: option,
                votes: 0,
                voters: [],
                index
            }
        })))
    }
}
