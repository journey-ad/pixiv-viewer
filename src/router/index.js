import Vue from 'vue'
import VueRouter from 'vue-router'
// import Home from '../views/Home.vue'

import BaseLayout from '@/layouts/BaseLayout'
import MainLayout from '@/layouts/MainLayout'
import SafeAreaLayout from '@/layouts/SafeAreaLayout'

const Home = (resolve) => {
  import(/* webpackChunkName: "home" */ '@/views/Home').then((module) => {
    resolve(module)
  })
}

const Search = (resolve) => {
  import(/* webpackChunkName: "search" */ '@/views/Search').then((module) => {
    resolve(module)
  })
}

const Rank = (resolve) => {
  import(/* webpackChunkName: "rank" */ '@/views/Rank').then((module) => {
    resolve(module)
  })
}

const Artwork = (resolve) => {
  import(/* webpackChunkName: "artwork" */ '@/views/Artwork').then((module) => {
    resolve(module)
  })
}

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: BaseLayout,
    children: [
      {
        path: '/',
        component: MainLayout,
        children: [
          {
            path: '/',
            redirect: '/home'
          },
          {
            path: '/home',
            name: 'Home',
            component: Home
          },
          {
            path: '/search',
            name: 'Search',
            component: Search
          },
          {
            path: '/rank',
            redirect: '/rank/daily'
          },
          {
            path: '/rank/:type',
            name: 'Rank',
            component: Rank
          }
        ]
      },
      {
        path: '/',
        component: SafeAreaLayout,
        children: [
          {
            path: '/artwork/:id',
            name: 'Artwork',
            component: Artwork
          }
        ]
      }
    ]
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
