import mapping from './contract/_mapping'
import { generateFront } from 'nest-ts-code-gen'
import { join } from 'path'

generateFront({
  mapping,
  sourceContractFolderPath: join(__dirname, 'contract'),
  outFolderPath: join(__dirname, 'src/type'),
})

console.log('finish')
