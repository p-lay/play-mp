interface Tag {
  id: number
  name: string
  memoriaIds?: number[]
}

interface AddTagReq {
  names: string[]
}

interface DeleteTagReq {
  id: number
}

interface SearchTagReq {
  keyword?: string
  withMemoria?: boolean
}

interface SearchTagRes {
  tags: Tag[]
}
