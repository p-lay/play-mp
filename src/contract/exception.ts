export class Exception {
  constructor(code: Code, message?: string) {
    this.code = code
    this.message = message
    this.getMessage()
  }

  code: Code
  message: string

  getMessage() {
    if (!this.message) {
      this.message = this.codeToMsg(this.code)
    }
  }

  codeToMsg(code: Code) {
    switch (code) {
      case 1000:
        return "no data in table"
      case 2000:
        return ""
    }
  }
}
