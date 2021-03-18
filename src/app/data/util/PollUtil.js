export default class PollUtil {
    static convertPollOptionsObjectToArray(pollOptionsObject = {}) {
        return Object.keys(pollOptionsObject).map((key) => ({
            ...pollOptionsObject[key],
            index: key
        }));
    }

    static convertPollOptionsArrayToObject(pollOptionsArray = []) {
        return Object.assign({}, ...pollOptionsArray.map((option, index) => ({
            [index]: {
                name: option,
                votes: 0,
                voters: [],
                index
            }
        })))
    }
}
