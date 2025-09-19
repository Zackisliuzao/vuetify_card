<template>
  <div class="chat-wrapper">
    <!-- 悬浮按钮 -->
    <button @click="toggleChat" class="toggle-button">
      <img :src="isChatOpen ? closeIcon : robotAvatar" alt="Toggle chat" style="width: 40px; height: 40px;">
    </button>

    <!-- 聊天窗口 - 放在左侧 -->
    <div v-if="isChatOpen" class="chat-container">
      <div class="chat-header" style="height: auto;">
        <img :src="headerBgImage" class="header-bg" alt="Header background">
        <div class="header-content">
          <div class="header-text">
            <div class="title">你好！我是你的AI助手</div>
          </div>
          <button @click="toggleChat" class="close-button">
            <img :src="closeIcon" alt="Close">
          </button>
        </div>
      </div>

      <div ref="messagesContainer" class="chat-messages">
        <div v-for="(message, index) in messages" :key="index" :class="['message', message.role]">
          <div v-if="message.role === 'assistant'" class="assistant-avatar">
            <img :src="robotAvatar" alt="AI Assistant">
          </div>
          <div :class="['message-bubble', message.role]">
            {{ message.content }}
          </div>
        </div>

        <div v-if="isLoading" class="message assitant">
          <div class="assistant-avatar">
            <img :src="robotAvatar" alt="AI Assistant">
          </div>
          <div class="message-bubble assistant">
            {{ partialResponse }}
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-input">
        <!-- 操作按钮区域 -->
        <!-- <div class="input-actions">
          <button class="action-button" :class="{ 'active': isWebSearchActive }" @click="toggleWebSearch">
            <img :src="searchIcon" alt="Search Icon" class="button-icon">
            <span>联网搜索</span>
          </button>
        </div> -->

        <!-- 输入区域 -->
        <!-- 输入区域 -->
        <div class="input-container">
          <!-- 联网搜索按钮，左下角 -->
          <button class="action-button inside" :class="{ 'active': isWebSearchActive }" @click="toggleWebSearch">
            <img :src="searchIcon" alt="Search Icon" class="button-icon" />
            <span>联网搜索</span>
          </button>

          <!-- 标签 + 输入框 同行显示 -->
          <div class="input-row">
            <input v-model="userInput" @keyup.enter="sendMessage" :disabled="isLoading" ref="inputRef"
              placeholder="给AI助手发送消息：" />
          </div>

          <!-- 发送按钮，右下角 -->
          <button @click="sendMessage" :disabled="isLoading || !userInput.trim()" class="send-button">
            <img :src="sendIcon" alt="Send">
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import axios, { AxiosError, type CancelTokenSource } from 'axios';
import robotAvatar from '@/assets/AI机器人.png'
import sendIcon from '@/assets/发送.svg'
import closeIcon from '@/assets/关闭_8.svg'
import headerBgImage from '@/assets/弹窗头部.png'
import searchIcon from '@/assets/网络.svg'

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface StreamChunk {
  choices?: Array<{
    delta: {
      content?: string;
    };
  }>;
}

// 状态管理
const isChatOpen = ref(false);
const messages = ref<ChatMessage[]>([]);
const userInput = ref('');
const isLoading = ref(false);
const partialResponse = ref('');
const cancelTokenSource = ref<CancelTokenSource | null>(null);
const messagesContainer = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const isWebSearchActive = ref(false); // 联网搜索状态

// 初始化时加载历史消息
onMounted(() => {
  loadMessages();
});

// 切换联网搜索状态
const toggleWebSearch = () => {
  isWebSearchActive.value = !isWebSearchActive.value;
};

// 检查消息是否过期（1天）
const isMessagesExpired = () => {
  const lastSaved = localStorage.getItem('chat-messages-last-saved');
  if (!lastSaved) return true;

  const lastSavedTime = parseInt(lastSaved, 10);
  const oneDay = 24 * 60 * 60 * 1000; // 1天的毫秒数
  const currentTime = new Date().getTime();

  return (currentTime - lastSavedTime) > oneDay;
};

// 加载消息
const loadMessages = () => {
  // 检查是否过期
  if (isMessagesExpired()) {
    // 清空过期消息
    localStorage.removeItem('chat-messages');
    localStorage.removeItem('chat-messages-last-saved');
    messages.value = [];
    return;
  }

  const savedMessages = localStorage.getItem('chat-messages');
  if (savedMessages) {
    try {
      messages.value = JSON.parse(savedMessages);
    } catch (e) {
      console.error('解析历史消息失败', e);
      clearMessages();
    }
  }
};

// 清空消息
const clearMessages = () => {
  messages.value = [];
  localStorage.removeItem('chat-messages');
  localStorage.removeItem('chat-messages-last-saved');
};

// 保存消息到本地存储
const saveMessages = () => {
  localStorage.setItem('chat-messages', JSON.stringify(messages.value));
  // 保存当前时间戳
  localStorage.setItem('chat-messages-last-saved', new Date().getTime().toString());
};

// 自动滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

// 切换聊天窗口
const toggleChat = () => {
  isChatOpen.value = !isChatOpen.value;
  if (isChatOpen.value) {
    nextTick(() => {
      inputRef.value?.focus();
      scrollToBottom();
    });
  }
};

// 发送消息
const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return;

  // 添加用户消息
  const userMessage: ChatMessage = {
    role: 'user',
    content: userInput.value.trim()
  };
  messages.value.push(userMessage);
  saveMessages();

  // 准备请求数据
  const requestData = {
    model: "lite",
    messages: messages.value.map(({ role, content }) => ({ role, content })),
    stream: true
  };

  // 清空输入框并设置加载状态
  userInput.value = '';
  isLoading.value = true;
  partialResponse.value = '';
  scrollToBottom();

  try {
    // 创建取消令牌
    cancelTokenSource.value = axios.CancelToken.source();

    var lastProcessedLength = 0;

    const response = await axios.post('/apiChat/v1/chat/completions', requestData, {
      headers: {
        'Authorization': 'Bearer UPtQHIRJzKbaogcFgvNw:TPwTMtaLVUOghrmEojMG',
        'Content-Type': 'application/json',
      },
      cancelToken: cancelTokenSource.value.token,
      responseType: 'stream',
      onDownloadProgress: (progressEvent) => {
        const currentText = progressEvent.event?.target?.responseText;
        if (!currentText) return;

        const newText = currentText.substring(lastProcessedLength);
        lastProcessedLength = currentText.length;

        const lines = newText.split('\n').filter((line: string) => line.trim() !== '');
        let assistantMessage = partialResponse.value;

        for (const line of lines) {
          if (line.startsWith('data:')) {
            const dataStr = line.substring(5).trim();
            if (dataStr === '[DONE]') continue;

            try {
              const data: StreamChunk = JSON.parse(dataStr);
              if (data.choices?.[0]?.delta?.content) {
                assistantMessage += data.choices[0].delta.content;
              }
            } catch (e) {
              console.error('解析JSON错误:', e);
            }
          }
        }

        if (assistantMessage !== partialResponse.value) {
          partialResponse.value = assistantMessage;
          scrollToBottom();
        }
      }
    });

    // 流式请求完成后添加完整消息
    messages.value.push({
      role: 'assistant',
      content: partialResponse.value
    });
    saveMessages();

  } catch (error) {
    if (axios.isCancel(error)) {
      console.log('请求已取消:', error.message);
      messages.value.push({
        role: 'assistant',
        content: '请求已取消'
      });
    } else if (error instanceof AxiosError) {
      console.error('API错误:', error.response?.data || error.message);
      messages.value.push({
        role: 'assistant',
        content: `抱歉，发生错误: ${error.response?.data?.message || error.message}`
      });
    } else {
      console.error('未知错误:', error);
      messages.value.push({
        role: 'assistant',
        content: '抱歉，发生了一些错误，请重试。'
      });
    }
    saveMessages();
  } finally {
    isLoading.value = false;
    partialResponse.value = '';
    cancelTokenSource.value = null;
    scrollToBottom();
    nextTick(() => inputRef.value?.focus());
  }
};

// 取消请求
const cancelRequest = () => {
  if (cancelTokenSource.value) {
    cancelTokenSource.value.cancel('用户取消了请求');
  }
};

// 组件卸载时取消所有请求
onUnmounted(() => {
  if (cancelTokenSource.value) {
    cancelTokenSource.value.cancel('组件卸载');
  }
});
</script>

<style scoped>
.chat-wrapper {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  flex-direction: row-reverse;
}

.toggle-button {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: transparent;
  border: none;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  margin-left: 10px;
}

.toggle-button img {
  width: 30px;
  height: 30px;
}

.chat-container {
  position: relative;
  width: 480px;
  height: 480px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-bottom: 0;
}

.chat-header {
  position: relative;
  height: 100px;
  color: white;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.header-content {
  position: relative;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid white;
}

.header-text {
  flex: 1;
}

.title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 4px;
  color: black;
}

.subtitle {
  font-size: 12px;
  opacity: 0.8;
}

.close-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
}

.close-button img {
  width: 20px;
  height: 20px;
}

.chat-messages {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  background: #f5f5f7;
}

.message {
  display: flex;
  margin-bottom: 16px;
}

.message.user {
  justify-content: flex-end;
}

.assistant-avatar {
  margin-right: 8px;
}

.assistant-avatar img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.message-bubble {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 18px;
  line-height: 1.4;
  word-break: break-word;
}

.message-bubble.assistant {
  background: white;
  border-top-left-radius: 4px;
}

.message-bubble.user {
  background: #1E88E5;
  color: white;
  border-top-right-radius: 4px;
}

.typing-indicator {
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  background-color: #999;
  border-radius: 50%;
  display: inline-block;
  margin: 0 2px;
  animation: bounce 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: 0s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {

  0%,
  60%,
  100% {
    transform: translateY(0);
  }

  30% {
    transform: translateY(-4px);
  }
}

/* 输入区域样式 */
.chat-input {
  padding: 12px;
  background: white;
  border-top: 1px solid #eee;
}

/* 操作按钮区域 */
.input-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
  justify-content: flex-start;
}

.action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 16px;
  color: #666;
  font-size: 13px;
  padding: 6px 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.action-button.active {
  background: #1E88E5;
  color: white;
  border-color: #1E88E5;
}

/* 输入容器 - 矩形样式 */
.input-container {
  position: relative;
  /* width: 432px; */
  height: 100px;
  background: #F9FAFC;
  border-radius: 8px;
  border: 1px solid #EBECF0;
  padding: 16px;
  box-sizing: border-box;
}

/* 左侧文字标签 */
.input-label {
  font-size: 14px;
  color: #555;
  margin-right: 8px;
  white-space: nowrap;
}

/* 输入框 */
.input-row input {
  position: absolute;
  /* top: 0; */
  left: 0;
  background: transparent;
  border: none;
  outline: none;
  font-size: 14px;
  height: 36px;
  padding: 0;
}

.chat-input input {
  position: absolute;
  top: 0px;
  /* 留出上方标签空间 */
  left: 16px;
  width: calc(100% - 32px);
  background: transparent;
  border: none;
  outline: none;
  font-size: 14px;
  height: 40px;
  padding: 0;
}

/* 发送按钮 - 右下角 */
.send-button {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: transparent;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-button img {
  width: 30px;
  height: 30px;
}

.button-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
  margin-right: 6px;
}

/* 内嵌联网搜索按钮 - 左下角 */
.action-button.inside {
  position: absolute;
  bottom: 12px;
  left: 12px;
  padding: 4px 10px;
  font-size: 13px;
  height: 36px;
}

/* 标签 + 输入框 行内 */
.input-row {
  display: flex;
  align-items: center;
  margin-top: 12px;
  margin-left: 12px;
  margin-right: 56px;
  /* 给右侧按钮留空间 */
}
</style>