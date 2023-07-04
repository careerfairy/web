/** @type { import('@storybook/nextjs').StorybookConfig } */
const config = {
   stories: ["../**/*.mdx", "../**/*.stories.@(js|jsx|ts|tsx)"],
   addons: [
      "@storybook/addon-links",
      "@storybook/addon-essentials",
      "@storybook/addon-interactions",
      "@storybook/addon-a11y",
      "@storybook/addon-storysource",
   ],
   framework: {
      name: "@storybook/nextjs",
      options: {},
   },
   docs: {
      autodocs: "tag",
   },
}
export default config
