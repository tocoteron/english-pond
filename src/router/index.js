import Vue from 'vue'
import VueRouter from 'vue-router'
import Ponds from '../views/Ponds.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: Ponds
  },
  {
    path: '/ponds',
    name: 'ponds',
    component: () => import('../views/Ponds.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/test',
    name: 'test',
    component: () => import('../views/Test.vue')
  },
  {
    path: '/statistics',
    name: 'statistics',
    component: () => import('../views/Statistics.vue')
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
