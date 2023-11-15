import { defineComponent, provide, ref } from 'vue'
// 工具引入
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
// HH:mm:ss
import { DEFAULT_FORMATS_TIME } from './constants'
import Picker from './common/picker.vue'
import TimePickPanel from './time-picker-com/panel-time-pick.vue'
import TimeRangePanel from './time-picker-com/panel-time-range.vue'
//属性引入
import { timePickerDefaultProps } from './common/props'
// 扩展
dayjs.extend(customParseFormat)

export default defineComponent({
  name: 'ElTimePicker',
  install: null,
  props: {
    ...timePickerDefaultProps,
    /**
     * @description whether to pick a time range
     */
    isRange: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue'],
  setup(props, ctx) {
    // 引入实例
    const commonPicker = ref<InstanceType<typeof Picker>>()
    // 其实就是赋值操作
    const [type, Panel] = props.isRange
      ? ['timerange', TimeRangePanel]
      : ['time', TimePickPanel]
    // 外抛数据
    const modelUpdater = (value: any) => ctx.emit('update:modelValue', value)
    // 注入数据
    provide('ElPopperOptions', props.popperOptions)
    // 抛出事件
    ctx.expose({
      /**
       * @description focus the Input component
       */
      focus: (e: FocusEvent | undefined) => {
        commonPicker.value?.handleFocusInput(e)
      },
      /**
       * @description blur the Input component
       */
      blur: (e: FocusEvent | undefined) => {
        commonPicker.value?.handleBlurInput(e)
      },
      /**
       * @description open the TimePicker popper
       */
      handleOpen: () => {
        commonPicker.value?.handleOpen()
      },
      /**
       * @description close the TimePicker popper
       */
      handleClose: () => {
        commonPicker.value?.handleClose()
      },
    })

    return () => {
      // 页面布局格式
      const format = props.format ?? DEFAULT_FORMATS_TIME
      // 对应页面
      return (
        <Picker
          {...props}
          ref={commonPicker}
          type={type}
          format={format}
          onUpdate:modelValue={modelUpdater}
        >
          {{
            default: (props: any) => <Panel {...props} />,
          }}
        </Picker>
      )
    }
  },
})
