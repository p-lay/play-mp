import dayjs from 'dayjs'

export const getDisplayTime = (unix?: number) => {
  const nowDay = dayjs()
  if (unix) {
    const unixDay = dayjs(unix * 1000)
    if (unixDay.isSame(nowDay, 'year')) {
      return unixDay.format('MM-DD')
    } else {
      return unixDay.format('YYYY-MM-DD')
    }
  } else {
    return nowDay.format('MM-DD')
  }
}

export const getStrictDisplayTime = (unix?: number) => {
  if (unix) {
    return dayjs(unix * 1000).format('YYYY-MM-DD')
  } else {
    return dayjs().format('YYYY-MM-DD')
  }
}

export const getUnix = (displayTime: string) => {
  return dayjs(displayTime).unix()
}
