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
}

type ContractType = ControllerType['Vue']
