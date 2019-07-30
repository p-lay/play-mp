
interface BaseMemoria {
  title: string
  feeling?: string
  resources: BaseResource[]
  thumb?: string
  tags: Tag[]
  music?: string
  create_time?: number
  isLargeData?: boolean
}

// user info should be set in request
interface AddMemoriaReq extends BaseMemoria {
  user_id: number
}

interface GetMemoriaReq {
  id: number
}

interface SearchMemoriaReq {
  tag_ids?: number[]
  create_by?: number
}

interface SearchMemoriaItem {
  title: string
  id: number
  thumb: string
  feeling: string
  creator: {
    id: number
    name: string
  }
  createTime: number
  isLargeData: boolean
  resourceCount: number
  tagNames: string[]
}
interface SearchMemoriaRes {
  memorias: SearchMemoriaItem[]
}

interface MemoriaAppendInfo {
  id: number
  comments: string[]
  // TODO: should be type User not number
  create_by: number
  update_time: number
}

interface GetMemoriaRes extends BaseMemoria, MemoriaAppendInfo {}

interface UpdateMemoriaReq extends BaseMemoria {
  id: number
  existResourceIds?: number[]
}

interface DeleteMemoriaReq {
  id: number
}
