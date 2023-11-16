// 引入不同组件
// 常规日期组件
import DatePickPanel from './date-picker-com/panel-date-pick.vue'
//年日的那种，存在两个日期组件
import DateRangePickPanel from './date-picker-com/panel-date-range.vue'
//年月的那种，月份日历
import MonthRangePickPanel from './date-picker-com/panel-month-range.vue'
// 引入数据类型
import type { IDatePickerType } from './date-picker.type'
// 导出方法
export const getPanel = function (type: IDatePickerType) {
  switch (type) {
    case 'daterange':
    case 'datetimerange': {
      return DateRangePickPanel
    }
    case 'monthrange': {
      return MonthRangePickPanel
    }
    default: {
      return DatePickPanel
    }
  }
}
