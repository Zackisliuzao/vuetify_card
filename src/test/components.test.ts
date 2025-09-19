import { expect, test, describe, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import axios from 'axios'
import MyForm from '../components/myForm.vue'
import DynamicDeviceConfigForm from '../components/DynamicDeviceConfigForm.vue'
import { useDeviceStore } from '../stores/useDeviceStore'

// Mock axios
vi.mock('axios')
const mockedAxios = vi.mocked(axios)

// 基础数学函数测试
function sum(a: number, b: number) {
  return a + b
}

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3)
})

// 表单组件测试
describe('MyForm 组件测试', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('表单渲染正确', () => {
    const wrapper = mount(MyForm)

    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    expect(wrapper.find('.v-select').exists()).toBe(true)
    expect(wrapper.find('button').exists()).toBe(true)
  })

  // test('表单验证 - 必填字段为空时验证失败', async () => {
  //   const wrapper = mount(MyForm)

  //   // 点击提交按钮
  //   const submitBtn = wrapper.find('button[type="submit"]')
  //   await submitBtn.trigger('click')

  //   // 验证alert被调用
  //   expect(window.alert).toHaveBeenCalledWith('请完成所有必填项')
  // })

  // test('表单提交成功', async () => {
  //   // Mock axios post 成功响应
  //   mockedAxios.post.mockResolvedValueOnce({ data: { success: true } })

  //   const wrapper = mount(MyForm)

  //   // 填写表单数据
  //   const nameInput = wrapper.find('input[aria-label="设备名称"]')
  //   await nameInput.setValue('测试设备')

  //   const positionInput = wrapper.find('input[aria-label="位置"]')
  //   await positionInput.setValue('杭州')

  //   // 模拟选择状态
  //   const component = wrapper.vm as any
  //   component.status = 0
  //   component.valid = true
  //   await wrapper.vm.$nextTick()

  //   // 点击提交
  //   const submitBtn = wrapper.find('button[type="submit"]')
  //   await submitBtn.trigger('click')

  //   // 验证API调用
  //   expect(mockedAxios.post).toHaveBeenCalledWith(
  //     'http://127.0.0.1:8000/api/create-device',
  //     {
  //       name: '测试设备',
  //       status: 0,
  //       position: '杭州'
  //     }
  //   )
  // })

  // test('表单提交失败 - 网络错误', async () => {
  //   // Mock axios post 失败响应
  //   mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'))

  //   const wrapper = mount(MyForm)

  //   // 填写表单数据并设置为有效
  //   const component = wrapper.vm as any
  //   component.name = '测试设备'
  //   component.status = 0
  //   component.position = '杭州'
  //   component.valid = true
  //   await wrapper.vm.$nextTick()

  //   // 点击提交
  //   const submitBtn = wrapper.find('button[type="submit"]')
  //   await submitBtn.trigger('click')

  //   // 验证错误处理
  //   expect(window.alert).toHaveBeenCalledWith('创建失败，请检查输入或联系管理员')
  // })
})

// 动态表单组件测试
describe('DynamicDeviceConfigForm 组件测试', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  test('设备类型切换功能', async () => {
    const wrapper = mount(DynamicDeviceConfigForm)

    const component = wrapper.vm as any
    
    // 初始状态应该是摄像头
    expect(component.deviceType).toBe('摄像头')
    expect(component.formGroups[0].title).toBe('摄像头配置')

    // 切换到传感器
    component.onDeviceTypeChange('传感器')
    await wrapper.vm.$nextTick()

    expect(component.deviceType).toBe('传感器')
    expect(component.formGroups[0].title).toBe('传感器配置')
    expect(component.formData).toEqual({})
  })

  test('动态表单字段渲染', async () => {
    const wrapper = mount(DynamicDeviceConfigForm)

    const component = wrapper.vm as any
    
    // 摄像头配置字段
    expect(component.formGroups[0].fields).toHaveLength(2)
    expect(component.formGroups[0].fields[0].key).toBe('cameraResolution')
    expect(component.formGroups[0].fields[1].key).toBe('cameraFps')

    // 切换到传感器
    component.onDeviceTypeChange('传感器')
    await wrapper.vm.$nextTick()

    // 传感器配置字段
    expect(component.formGroups[0].fields).toHaveLength(2)
    expect(component.formGroups[0].fields[0].key).toBe('sensorType')
    expect(component.formGroups[0].fields[1].key).toBe('sensorRange')
  })

  test('表单提交验证', async () => {
    const wrapper = mount(DynamicDeviceConfigForm)

    const component = wrapper.vm as any
    
    // 模拟表单验证失败
    component.form = {
      validate: vi.fn().mockResolvedValue({ valid: false })
    }

    await component.submitForm()
    expect(window.alert).toHaveBeenCalledWith('请填写所有必填项。')

    // 模拟表单验证成功
    component.form.validate.mockResolvedValue({ valid: true })
    component.formData = { cameraResolution: '1920x1080', cameraFps: '30' }
    
    const consoleSpy = vi.spyOn(console, 'log')
    await component.submitForm()
    
    expect(consoleSpy).toHaveBeenCalledWith('表单数据:', { cameraResolution: '1920x1080', cameraFps: '30' })
    expect(window.alert).toHaveBeenCalledWith('表单提交成功，数据已打印到控制台。')
  })
})

// 数据存储测试
describe('useDeviceStore 数据加载测试', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  test('设备数据加载成功', async () => {
    const mockDevices = [
      { id: 1, name: '设备1', status: 0, position: '杭州' },
      { id: 2, name: '设备2', status: 1, position: '上海' }
    ]

    mockedAxios.get.mockResolvedValueOnce({ data: mockDevices })

    const store = useDeviceStore()
    
    expect(store.loading).toBe(true)
    
    await store.fetchDevicesFromAPI()
    
    expect(store.loading).toBe(false)
    expect(store.devices).toHaveLength(2)
    expect(store.devices[0].longitude).toBe(120.1464) // 杭州经度
    expect(store.devices[1].longitude).toBe(121.4737) // 上海经度
  })

  test('设备数据加载失败', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('API Error'))

    const store = useDeviceStore()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    await store.fetchDevicesFromAPI()
    
    expect(store.loading).toBe(false)
    expect(store.devices).toHaveLength(0)
    expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch devices:', expect.any(Error))
  })

  test('设备数据经纬度补充', async () => {
    const mockDevices = [
      { id: 1, name: '设备1', status: 0, position: '未知城市' },
      { id: 2, name: '设备2', status: 1, position: '杭州' }
    ]

    mockedAxios.get.mockResolvedValueOnce({ data: mockDevices })

    const store = useDeviceStore()
    await store.fetchDevicesFromAPI()
    
    // 未知城市不应该有经纬度
    expect(store.devices[0].longitude).toBeUndefined()
    expect(store.devices[0].latitude).toBeUndefined()
    
    // 杭州应该有经纬度
    expect(store.devices[1].longitude).toBe(120.1464)
    expect(store.devices[1].latitude).toBe(30.2448)
  })
})

// 异常流测试
describe('异常处理测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('网络超时异常', async () => {
    mockedAxios.get.mockRejectedValueOnce({
      request: {},
      message: 'timeout of 5000ms exceeded'
    })

    setActivePinia(createPinia())
    const store = useDeviceStore()
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    await store.fetchDevicesFromAPI()
    
    expect(store.loading).toBe(false)
    expect(consoleSpy).toHaveBeenCalled()
  })

  test('服务器错误响应', async () => {
    mockedAxios.get.mockRejectedValueOnce({
      response: {
        status: 500,
        data: { message: '服务器内部错误' }
      }
    })

    setActivePinia(createPinia())
    const store = useDeviceStore()
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    await store.fetchDevicesFromAPI()
    
    expect(store.loading).toBe(false)
    expect(consoleSpy).toHaveBeenCalled()
  })

  // test('无效数据格式处理', async () => {
  //   // 模拟返回无效数据格式
  //   mockedAxios.get.mockResolvedValueOnce({ data: null })

  //   setActivePinia(createPinia())
  //   const store = useDeviceStore()
    
  //   await expect(store.fetchDevicesFromAPI()).rejects.toThrow()
  // })

  test('表单验证边界情况', () => {
    // 测试空字符串
    const rule = (v: string) => !!v || '必填'
    expect(rule('')).toBe('必填')
    expect(rule('   ')).toBe(true) // 空格被认为是有效的
    expect(rule('valid')).toBe(true)
    
    // 测试null值
    const statusRule = (v: number | null) => v !== null || '必填'
    expect(statusRule(null)).toBe('必填')
    expect(statusRule(0)).toBe(true)
    expect(statusRule(1)).toBe(true)
  })
})

