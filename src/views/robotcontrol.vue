<template>
  <div class="token-manager">
    <el-input
      v-model="token"
      placeholder="请输入Token"
      clearable
      style="width: 300px; margin-right: 10px"
    />
    <!-- <el-button
      type="success"
      :loading="loading"
      @click="handleWriteNode(1)"
    >
      开启
    </el-button>
    <el-button
      type="danger"
      :loading="loading"
      @click="handleWriteNode(0)"
    >
      关闭
    </el-button> -->


    <!-- 新增：骨骼名下拉框 -->
    <el-select
      v-model="bonename"
      placeholder="请选择骨骼"
      style="width: 180px; margin-right: 10px"
    >
      <el-option
        v-for="item in boneOptions"
        :key="item"
        :label="item"
        :value="item"
      />
    </el-select>

        <!-- 新增“转动”按钮 -->
    <el-button
      type="primary"
      :loading="loading"
      @click="handleRotate(3800,20)"
    >
      转动
    </el-button>

    <el-button
      type="primary"
      :loading="loading"
      @click="handleRotate(3800,-20)"
    >
      转动(反)
    </el-button>


    <el-alert
      v-if="message.text"
      :title="message.text"
      :type="message.type"
      :closable="false"
      style="margin-top: 20px; width: 600px"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

/* ---------- 响应式数据 ---------- */
const token   = ref('')
const loading = ref(false)
const message = ref({ text: '', type: 'info' })

/* ---------- 新增：骨骼名下拉框 ---------- */
const bonename = ref('Shoulder_01')   // 默认选中第一项
const boneOptions = [
  '_rootJoint',
  'Base_00',
  'Shoulder_01',
  'Core_02',
  'Core001_03',
  'Motor_04',
  'ArmLong_05',
  'ArmLong_2_06',
  'ArmShort_07',
  'ArmShorter_08',
  'ArmShortest_09',
  'ArmShortest_end_010'
]
/* ---------- 核心：写节点 ---------- */
async function writeNode(value) {
  if (!token.value.trim()) {
    ElMessage.warning('请输入 Token')
    return
  }

  loading.value = true
  message.value = { text: '', type: 'info' }

  const myHeaders = new Headers()
  myHeaders.append('token', token.value.trim())
  myHeaders.append('Content-Type', 'application/json')

  const raw = JSON.stringify({
    nodes: [
      {
        device: '_#variable#_',
        name: 'bofang',
        value
      }
    ]
  })

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  }

  try {
    const res = await fetch('http://10.89.33.97:39100/device/deviceManagement/writeNode', requestOptions)
    const text = await res.text()

    if (!res.ok) throw new Error(text || '接口返回异常')

    message.value = { text: `指令发送成功：${text}`, type: 'success' }
  } catch (err) {
    message.value = { text: err.message || '网络错误', type: 'error' }
  } finally {
    loading.value = false
  }
}

/* ---------- 按钮事件 ---------- */
const handleWriteNode = writeNode

/* ---------- 新增：转动按钮事件 ---------- */
function handleRotate(bonecode,dir) {
  // 构造 value：3800,当前时间戳
  // const value = `${bonecode},${dir},${Date.now()}`
  const value = `${bonecode},${dir},${bonename.value},${Date.now()}`
  // 直接调用写节点方法
  writeNode(value)
}
</script>

<style scoped>
.token-manager {
  padding: 20px;
  display: flex;
  align-items: center;
}
</style>