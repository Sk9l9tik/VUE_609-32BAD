import {createRouter , createWebHistory} from 'vue-router';
import Home from '@/components/Home.vue';
import About from '@/components/About.vue';
import Pastes from '@/components/Pastes.vue';
import Comments from '@/components/Comments.vue';

const routes = [
  {
    path: '/',
    component: Home,
  },
  {
    path: '/pastes/:id',
    component: Pastes,
  },
  {
    path: '/comments/:id',
    component: Comments,
  },
  {
    path: '/about',
    component: About,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
});
export default router;
