import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/theme-chalk/src/message.scss' // 避免 el-message 显示不正确
import 'element-plus/theme-chalk/src/message-box.scss'; // 避免 el-message-box 显示不正确


const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.use(router)

app.mount('#app')
