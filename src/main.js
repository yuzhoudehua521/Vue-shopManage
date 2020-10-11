import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
//导入字体图标
import './assets/fonts/iconfont.css'
import './assets/css/global.css'
import axios from 'axios'
//导入树形插件
import TreeTable from 'vue-table-with-tree-grid'

//导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'

import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

//导入进度条
import Nprogress from 'nprogress' 
import 'nprogress/nprogress.css'

Vue.use(VueQuillEditor)

Vue.component('tree-table', TreeTable)

Vue.config.productionTip = false
//将axios挂载全局对象上,通过$http便可以发送axios请求,配置请求根路径
axios.defaults.baseURL= 'http://127.0.0.1:8888/api/private/v1/'

//设置请求拦截器,config是请求对象,在request中显示进度条
axios.interceptors.request.use(config => {
  Nprogress.start();
  config.headers.Authorization = window.sessionStorage.getItem('token');
  //必须return config
  return config;
})

//response中隐藏进度条
axios.interceptors.response.use(config => {
  Nprogress.done();
  return config;
})

//全局过滤器
Vue.filter('dateFormat', function(originTime) {
  const dt = new Date(originTime)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart('2',0) //+‘’变为字符串，两位不足加0
  const d = (dt.getDate() + '').padStart('2',0) 
  const hh = (dt.getHours()  + '').padStart('2',0)
  const mm = (dt.getMinutes()  + '').padStart('2',0)
  const ss = (dt.getSeconds()  + '').padStart('2',0)

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

Vue.prototype.$http = axios

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
