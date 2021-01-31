import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ECharts from 'vue-echarts'
import VueBreadcrumbs from 'vue-2-breadcrumbs'
import i18n from './i18n'

require('@/assets/css/base.css')
require('@/assets/css/style.css')

Vue.component('v-chart', ECharts)
Vue.use(VueBreadcrumbs, {
  template:
    '        <nav v-if="$breadcrumbs.length" aria-label="breadcrumb" class="breadcrumbs">\n' +
                '<span class="step first"><span class="material-icons">home</span></span>' +
'                <span v-for="(crumb, key) in $breadcrumbs" v-if="crumb.meta.breadcrumb" :key="key" class="step" aria-current="page">\n' +
'                    <router-link :to="{ path: getPath(crumb) }">{{ getBreadcrumb(crumb.meta.breadcrumb) }}</router-link>' +
'                </span>\n' +
    '        </nav>'
});

Vue.config.productionTip = false

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
