interface Tag {
  id: number
  name: string
  memoriaIds?: number[]
}

interface AddTagReq {
  name: string
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
