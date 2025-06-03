export default class Counter {
   private readCount = 0
   private writeCount = 0
   private customCounts: { [key: string]: number } = {}

   constructor(initialCounts?: { [key: string]: number }) {
      if (initialCounts) {
         this.customCounts = { ...initialCounts }
      }
   }

   public read(): number {
      return this.readCount
   }

   public write(): number {
      return this.writeCount
   }

   // Total number of operations performed
   public readAndWrite(): number {
      return this.readCount + this.writeCount
   }

   public readAndWriteIncrement(): void {
      this.readCount++
      this.writeCount++
   }

   public readIncrement(): void {
      this.readCount++
   }

   public writeIncrement(): void {
      this.writeCount++
   }

   public addToWriteCount(count: number): void {
      this.writeCount += count
   }

   public addToReadCount(count: number): void {
      this.readCount += count
   }

   public customCountIncrement(key: string): void {
      if (this.customCounts[key]) {
         this.customCounts[key]++
      } else {
         this.customCounts[key] = 1
      }
   }

   public getCustomCount(key: string): number {
      return this.customCounts[key]
   }

   public setCustomCount(key: string, count: number): void {
      this.customCounts[key] = count
   }

   public addToCustomCount(key: string, count: number): void {
      if (this.customCounts[key]) {
         this.customCounts[key] += count
      } else {
         this.customCounts[key] = count
      }
   }

   public print(key?: string): void {
      if (key) {
         Counter.log(`${key}: ${this.customCounts[key]}`)
      } else {
         Counter.log(`Read: ${this.readCount}`)
         Counter.log(`Write: ${this.writeCount}`)
         Counter.log(`Total Reads and Writes: ${this.readAndWrite()}`)
         // print custom counts
         for (const key in this.customCounts) {
            Counter.log(`${key}: ${this.customCounts[key]}`)
         }
      }
   }

   static log(...message: string[]): void {
      console.log(`\x1b[32m%s\x1b[0m`, `--> ${message.join(" ")}`)
   }
}
