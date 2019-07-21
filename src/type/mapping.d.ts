type Mapping = {  user: {    getUserInfo: {      req: GetUserInfoReq      res: GetUserInfoRes    }    updateUserInfo: {      req: UpdateUserInfoReq      res: any    }  }  memoria: {    addMemoria: {      req: AddMemoriaReq      res: any    }    getMemoria: {      req: GetMemoriaReq      res: GetMemoriaRes    }    updateMemoria: {      req: UpdateMemoriaReq      res: any    }    getMemoriaList: {      req: any      res: GetMemoriaListRes    }    deleteMemoria: {      req: DeleteMemoriaReq      res: any    }  }  qiniu: {    getQiniuToken: {      req: any      res: GetQiniuTokenRes    }  }}type ContractType = Mapping['user'] & Mapping['memoria'] & Mapping['qiniu']