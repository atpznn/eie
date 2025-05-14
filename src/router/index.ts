import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import PrototypeOne from '../pages/PrototypeOne.vue'
import PrototypeTwo from '../pages/PrototypeTwo.vue'

const routes: RouteRecordRaw[] = [
    { path: '/', redirect: '/PrototypeOne' },
    { path: '/PrototypeOne', name: 'Home', component: PrototypeOne },
    { path: '/PrototypeTwo', name: 'Mode1', component: PrototypeTwo },
]

export const router = createRouter({
    history: createWebHistory(),
    routes,
})
