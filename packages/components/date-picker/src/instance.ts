import type { ComponentPublicInstance } from 'vue'
import type { DatePickerProps } from './props/date-picker'
// 接口数据
export type DatePickerExpose = {
  focus: (focusStartInput: boolean) => void
  handleOpen: () => void
  handleClose: () => void
}
export type DatePickerInstance = ComponentPublicInstance<
  DatePickerProps,
  DatePickerExpose
>
