import Counter from "../lib/Counter"
import counterConstants from "../lib/Counter/constants"
import { getCLIBarOptions } from "./misc"
const cliProgress = require("cli-progress")

export const handleBulkWriterError = (err: Error, counter: Counter) => {
   console.error(err)
   if (!counter.getCustomCount(counterConstants.numFailedWrites)) {
      counter.setCustomCount(counterConstants.numFailedWrites, 0)
   }
   counter.customCountIncrement(counterConstants.numFailedWrites)
}

export const handleBulkWriterSuccess = (counter: Counter) => {
   counter.customCountIncrement(counterConstants.numSuccessfulWrites)
   const totalDocs = counter.getCustomCount(counterConstants.totalNumDocs)
   const currentDocIndex = counter.getCustomCount(
      counterConstants.currentDocIndex
   )
   const hasLoopedThroughAllDocs = currentDocIndex >= totalDocs - 1
   if (hasLoopedThroughAllDocs) {
      const currentSuccessfulWriteCount = counter.getCustomCount(
         counterConstants.numSuccessfulWrites
      )
      writeProgressBar.update(currentSuccessfulWriteCount)
   }
}
export const writeProgressBar = new cliProgress.SingleBar(
   getCLIBarOptions("Writes Progress", "Successful Writes"),
   cliProgress.Presets.shades_classic
)
export const loopProgressBar = new cliProgress.SingleBar(
   getCLIBarOptions("Analyzing Data", "Documents Analyzed"),
   cliProgress.Presets.shades_classic
)
