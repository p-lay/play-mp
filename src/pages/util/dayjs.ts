import dayjs from 'dayjs'

export const getDisplayTime = (unix?: number) => {
  if (unix) {
    return dayjs(unix * 1000).format('YYYY-MM-DD')
  } else {
    return dayjs().format('YYYY-MM-DD')
  }
}

export const getUnix = (displayTime: string) => {
  return dayjs(displayTime).unix()
}
