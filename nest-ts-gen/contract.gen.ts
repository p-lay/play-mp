import * as fs from 'fs'

type Config = {
  outFileName: string
  typeName: string
  tabWidth: number
  singleQuote: boolean
}

type Param = {
  mapping: any
  outFolder: string
  config?: Partial<Config>
}

export class ContractGen {
  constructor(param: Param) {
    this.mapping = param.mapping
    this.outFolder = param.outFolder
    const paramConfig = param.config || {}
    this.config = { ...this.defaultConfig, ...paramConfig }
  }
  mapping: any
  outFolder: string
  defaultConfig: Config = {
    outFileName: 'mapping.d.ts',
    typeName: 'ContractType',
    tabWidth: 2,
    singleQuote: true,
  }
  config: Partial<Config>

  private addLine(tabCount: number) {
    let space = ''
    for (let index = 0; index < this.config.tabWidth * tabCount; index++) {
      space += ' '
    }
    return `\r${space}`
  }

  private renderMappingType() {
    return `type Mapping = {${this.renderControllers()}\r}`
  }

  private renderControllers() {
    let controllerStr = ''
    for (const controller of Object.keys(this.mapping)) {
      controllerStr += `${this.addLine(1)}${controller}: {${this.renderServices(
        this.mapping[controller],
      )}${this.addLine(1)}}`
    }
    return controllerStr
  }

  private renderServices(services: any) {
    let serviceStr = ''
    for (const service of Object.keys(services)) {
      serviceStr += `${this.addLine(2)}${service}: {${this.renderDtos(
        services[service as any],
      )}${this.addLine(2)}}`
    }
    return serviceStr
  }

  private renderDtos(dtos: any) {
    let dtoStr = ''
    for (const dto of Object.keys(dtos)) {
      let dtoValue = dtos[dto as any]
      if (dto == 'res') {
        if (!dtoValue) {
          dtoValue = 'CommonRes'
        } else {
          dtoValue = `CommonRes<${dtoValue}>`
        }
      } else {
        if (!dtoValue) {
          dtoValue = 'any'
        }
      }
      dtoStr += `${this.addLine(3)}${dto}: ${dtoValue}`
    }
    return dtoStr
  }

  private renderContractType() {
    const quote = this.config.singleQuote ? `'` : `"`
    const controllers = Object.keys(this.mapping).map(
      controller => `Mapping[${quote + controller + quote}]`,
    )
    return `type ${this.config.typeName} = ${controllers.join(' & ')}`
  }

  public generate() {
    const mappingType = this.renderMappingType()
    const contractType = this.renderContractType()
    fs.writeFileSync(
      this.outFolder + '/' + this.config.outFileName,
      mappingType + '\r' + contractType,
    )
  }
}
