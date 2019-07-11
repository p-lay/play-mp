import * as fs from "fs"

export class DefinitionReplace {
  constructor(
    sourceFolder: string,
    outFolder: string,
    excludes: string[] = null
  ) {
    this.sourceFolder = sourceFolder
    this.outFolder = outFolder
    this.excludePrefixs = excludes || this.defaultExcludePrefixs
  }
  sourceFolder: string
  outFolder: string
  excludePrefixs: string[]
  defaultExcludePrefixs: string[] = ["_"]

  public replace() {
    const fileNames = fs
      .readdirSync(this.sourceFolder)
      .filter(x => !this.excludePrefixs.includes(x[0]))

    fileNames.forEach(fileName => {
      fs.readFile(this.sourceFolder + "/" + fileName, null, (err, buff) => {
        const removeExport = buff.toString().replace(/export /g, "")
        const removeImport = removeExport.replace(/import [\s\S]+['|"]\n/g, "")
        fs.writeFileSync(
          this.outFolder + "/" + fileName.replace(".ts", ".d.ts"),
          removeImport,
          { flag: "w" }
        )
      })
    })
  }
}
