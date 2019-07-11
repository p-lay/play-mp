import mapping from '../contract/_mapping'
import { ContractGen } from './contract.gen'
import { DefinitionReplace } from './definition.replace'
import { resolve } from 'path'

const sourceFolder = resolve(__dirname, '../contract')
const outFolder = resolve(__dirname, '../src/type')

new ContractGen({ mapping, outFolder }).generate()
new DefinitionReplace(sourceFolder, outFolder).replace()
