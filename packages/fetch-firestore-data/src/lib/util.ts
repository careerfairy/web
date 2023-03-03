const DEBUG = process.env.DEBUG

export function h1Text(text: string) {
   // cyan color
   console.log("\x1b[36m%s\x1b[0m", `# ${text}`)
}

export function log(...args: unknown[]) {
   console.log(...args)
}

export function debug(...args: unknown[]) {
   if (DEBUG) {
      console.log(...args)
   }
}
