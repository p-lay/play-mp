interface BaseResource {
  id?: number
  url: string
  thumb?: string
  type?: 'image' | 'video'
  description?: string
  duration?: string // video duration
}

interface AddResourceReq {
  resources: BaseResource[]
}

interface GetResourceReq {
  resource_ids: number[]
}

interface GetResourceRes {
  resources: BaseResource[]
}

interface DeleteResourceReq {
  ids: number[]
}
