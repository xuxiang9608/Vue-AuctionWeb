// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

import Vue from 'vue'

// 页面组件导入
import layout from './components/layout.vue'
import VueRouter from 'vue-router'
import IndexPage from './pages/index.vue'
import InfoPage from './pages/list/info.vue'
import DetailPage from './pages/detail.vue'
import LawPage from './pages/list/law.vue'
import KnowledgePage from './pages/list/knowledge.vue'
import PreviewPage from './pages/list/preview.vue'
import InfoNav from './pages/list/infonav.vue'
import LawNav from './pages/list/lawnav.vue'
import KnowNav from './pages/list/knowledgenav.vue'
import PreNav from './pages/list/previewnav.vue'
import HomePage from './pages/home.vue'
import Test from './components/test.vue'
import InfoDetailPage from './pages/detailpage/infodetail.vue'
import AddInfoPage from './pages/detailpage/addinfo.vue'
import AddPreviewPage from './pages/detailpage/addpreview.vue'

// 外部插件导入
import iView from 'iview';
import VueContentPlaceholders from 'vue-content-placeholders'
import VueParticles from 'vue-particles'
import TouchRipple from 'vue-touch-ripple'
import EffectInput from 'effect-input'
import VueQuillEditor from 'vue-quill-editor'
import VueLazyload from 'vue-lazyload'
import infiniteScroll from 'vue-infinite-scroll'
// import LoginPage from './components/user/login.vue'
// import RegisterPage from './components/user/register.vue'

// 外部样式导入
require('vue-touch-ripple/component.css')
import 'iview/dist/styles/iview.css';
import 'effect-input/dist/index.css'

Vue.config.productionTip = false

// 外部插件导入
Vue.use(VueRouter)
Vue.use(TouchRipple)
Vue.use(VueContentPlaceholders)
Vue.use(VueParticles)
Vue.use(iView);
Vue.use(EffectInput)
Vue.use(VueQuillEditor)
Vue.use(infiniteScroll)

Vue.use(VueLazyload, {
  preLoad: 1.3,
  error: 'dist/error.png',
  loading: '/static/loading-svg/loading-bars.svg',
  try: 3 // default 1
})

let router = new VueRouter({
	mode: 'history',
	routes: [
	{
		path: '/',
		component: IndexPage
	},
	{
		path: '/user/:id',
		component: HomePage
	},
	{
		path: '/test',
		component: Test
	},
	{
		path: '/infoadd',
		component: AddInfoPage
	},
	{
		path: '/previewadd',
		component: AddPreviewPage
	},
	{
		path: '/detail',
		component: DetailPage,
		redirect: '/detail/info',
		children: [
			{
				path: 'info',
				components: {
					left: InfoNav,
					right: InfoPage
				}
			},
			{
				path: 'law',
				components: {
					left: LawNav,
					right: LawPage
				}
			},
			{
				path: 'knowledge',
				components: {
					left: KnowNav,
					right: KnowledgePage
				}
			},
			{
				path: 'preview',
				components: {
					left: PreNav,
					right: PreviewPage
				}
			},
			{
				path: 'pages/:id',
				components: {
					left: InfoNav,
					right: InfoDetailPage
				},
				meta: {
					keepAlive: true
				}
			}
		]
	}
	]
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<layout/>',
  components: { layout }
})
