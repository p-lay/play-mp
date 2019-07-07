type ControllerType = {
  Vue: {
    addVue: {
      req: AddVueReq
      res: any
    }
    getVue: {
      req: GetVueReq
      res: GetVueRes
    }
  }
  Qiniu: {
    getQiniuToken: {
      req: {} // empty body
      res: GetQiniuTokenRes
    }
  }
}

type ContractType = ControllerType['Vue'] & ControllerType['Qiniu']
