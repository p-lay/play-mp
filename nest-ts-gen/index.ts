import mapping from "../contract/_mapping"
import { ContractGen } from "./contract.gen"
import { DefinitionReplace } from "./definition.replace"

const sourceFolder = __dirname + "./src/contract"
const outFolder = __dirname + "./src/type"

new ContractGen({ mapping, outFolder }).generate()
new DefinitionReplace(sourceFolder, outFolder).replace()
