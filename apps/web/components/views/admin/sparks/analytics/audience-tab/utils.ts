/*
 * The calculations below scale the bars' values relative to the maximum
 * absolute value of the dataset. This creates a better user experience
 * by giving the impression that the bars are larger. Using raw percentages
 * would make the bars appear consistently small.
 *
 * @valueIllusionMargin ensures that the first bar (i.e. maximum absolute value)
 * does not occupy the entire space, preventing it from being 100%.
 */
export const valueIllusionMargin = 1.075

export const updateRelativePercentage = (data, maxValue) => {
   return data.map((item) => ({
      ...item,
      relativePercentage: (item.value / maxValue) * 100,
   }))
}
