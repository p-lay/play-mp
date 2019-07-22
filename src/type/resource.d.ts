interface BaseResource {
  id?: number
  url: string
  thumb?: string
  type?: 'image' | 'video'
  description?: string
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
