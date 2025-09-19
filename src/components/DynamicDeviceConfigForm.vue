<template>
  <v-form ref="form" @submit.prevent="submitForm">
    <v-container>
      <v-row>
        <v-col cols="12" style="padding-top: 30px;">
          <!-- 设备类型选择 -->
          <v-select
            v-model="deviceType"
            label="设备类型"
            :items="deviceTypes"
            @update:modelValue="onDeviceTypeChange"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>
      </v-row>

      <!-- 动态表单字段和分组 -->
      <v-expansion-panels v-model="activeNames" multiple>
        <v-expansion-panel
          v-for="(group, index) in formGroups"
          :key="index"
          :title="group.title"
          :value="index"
        >
          <v-expansion-panel-text>
            <v-row>
              <v-col
                v-for="field in group.fields"
                :key="field.key"
                cols="12"
                md="6"
              >
                <!-- 文本框 -->
                <template v-if="field.type === 'text'">
                  <v-text-field
                    v-model="formData[field.key]"
                    :label="field.label"
                    :placeholder="field.placeholder"
                    v-bind="field.props"
                    variant="outlined"
                    density="compact"
                  ></v-text-field>
                </template>
                <!-- 单选框 -->
                <template v-else-if="field.type === 'radio'">
                  <v-radio-group
                    v-model="formData[field.key]"
                    :label="field.label"
                    v-bind="field.props"
                    row
                  >
                    <v-radio
                      v-for="option in field.options"
                      :key="option"
                      :label="option"
                      :value="option"
                    ></v-radio>
                  </v-radio-group>
                </template>
                <!-- 下拉选择框 -->
                <template v-else-if="field.type === 'select'">
                  <v-select
                    v-model="formData[field.key]"
                    :label="field.label"
                    :items="field.options"
                    v-bind="field.props"
                    variant="outlined"
                    density="compact"
                  ></v-select>
                </template>
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <v-row>
        <v-col cols="12">
          <v-btn type="submit" color="primary" class="mt-4">提交</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const deviceTypes = ['摄像头', '传感器'];
const deviceType = ref('摄像头');
const formData = ref<Record<string, any>>({});

const onDeviceTypeChange = (value: string) => {
  deviceType.value = value;
  formData.value = {};
};

const formGroups = computed(() => {
  if (deviceType.value === '摄像头') {
    return [
      {
        title: '摄像头配置',
        fields: [
          {
            type: 'text',
            key: 'cameraResolution',
            label: '分辨率',
            placeholder: '请输入分辨率',
            props: { rules: [(v: string) => !!v || '分辨率必填'] }
          },
          {
            type: 'text',
            key: 'cameraFps',
            label: '帧率',
            placeholder: '请输入帧率',
            props: { rules: [(v: string) => !!v || '帧率必填'] }
          }
        ]
      }
    ];
  } else if (deviceType.value === '传感器') {
    return [
      {
        title: '传感器配置',
        fields: [
          {
            type: 'radio',
            key: 'sensorType',
            label: '传感器类型',
            options: ['温度', '湿度', '压力'],
            props: { rules: [(v: string) => !!v || '传感器类型必填'] }
          },
          {
            type: 'select',
            key: 'sensorRange',
            label: '测量范围',
            options: ['0-100', '100-200', '200-300'],
            props: { rules: [(v: string) => !!v || '测量范围必填'] }
          }
        ]
      }
    ];
  }
  return [];
});

// 默认展开第一个面板
const activeNames = ref([0]);

// 表单校验和提交
const form = ref<HTMLFormElement | null>(null);
const submitForm = async () => {
  if (form.value) {
    const { valid } = await (form.value as any).validate();
    if (valid) {
      console.log('表单数据:', formData.value);
      alert('表单提交成功，数据已打印到控制台。');
    } else {
      alert('请填写所有必填项。');
    }
  }
};
</script>

<style scoped>
/* 样式可根据需要自定义 */
</style>
