<template>
  <div class="app-container">
    <div class="loading-overlay" :class="{ 'fade-out': isLoaded }">
      <div class="loading-content">
        <div class="loading-logo">桂林1944</div>
        <div class="loading-text">加载中...</div>
        <div class="loading-spinner"></div>
      </div>
    </div>
    <Index />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Index from './pages/index/index.vue'

const isLoaded = ref(false)

onMounted(() => {
  // 监听页面加载完成事件
  window.addEventListener('load', () => {
    // 延迟一点时间，确保所有资源都已加载
    setTimeout(() => {
      isLoaded.value = true
    }, 500)
  })
  
  // 同时设置一个最大等待时间，避免网络过慢时一直显示加载
  setTimeout(() => {
    isLoaded.value = true
  }, 3000)
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: '微软雅黑', 'Microsoft YaHei', 'PingFang SC', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #F5F0E6;
}

#app {
  width: 100%;
  min-height: 100vh;
}

.app-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #8B4513;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  transition: opacity 1s ease-in-out;
}

.loading-overlay.fade-out {
  opacity: 0;
  pointer-events: none;
}

.loading-content {
  text-align: center;
  color: #D4AF37;
}

.loading-logo {
  font-family: '思源宋体', 'Noto Serif SC', 'SimSun', serif;
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.loading-text {
  font-size: 1.2rem;
  margin-bottom: 30px;
  animation: pulse 1.5s infinite;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(212, 175, 55, 0.3);
  border-top: 4px solid #D4AF37;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .loading-logo {
    font-size: 2rem;
  }
  
  .loading-text {
    font-size: 1rem;
  }
  
  .loading-spinner {
    width: 30px;
    height: 30px;
    border-width: 3px;
  }
}
</style>