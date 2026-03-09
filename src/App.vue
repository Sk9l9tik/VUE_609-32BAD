<template>
  <div class="pt-12 min-2xl:min-w-[1225px] max-h-[120px] fixed top-0 z-99 placed-items-center
    lg:min-w-[400px] xl:min-w-[1200px] max-sm:min-w-[345px]">
  <Menubar :model="items" class="bg-[27272A] ">
    <template #start>
      <router-link
        to="/"
        class="flex items-center gap-2 text-emerald-400 font-semibold text-xl mr-4"
      >
      <span class="text-white text-2xl"> 🐦</span>
      </router-link>
    </template>

    <template #item="{ item, props, hasSubmenu, root}">
      <a class="flex items-center gap-2 px-4 py-2.5 rounded-md hover:dark:bg-gray-600">
        <router-link v-if="item.route" :to="item.route" class="flex items-center w-full h-full">
          <span :class="item.icon" class="pr-1"/>
          <span class="font-medium">{{item.label}}</span>
        </router-link>
      </a>
    </template>

    <template #end>
      <div class="flex items-center gap-6 mr-4">
        <div class="flex items-center gap-3">
          <div v-if="isAuthenticated && user" class="flex items-center gap-4 text-white text-base text-emerald-400">
            <i class="pi pi-fw pi-user" />
            <router-link to="/mypastes" class="text-white hover:text-emerald-300 transition">
              {{ user.name }}
            </router-link>
            <Button
              @click="logout"
              class="px-4 py-2 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 transition whitespace-nowrap ml-2"
              label="Logout"
            />
          </div>
          <div v-else class="flex items-center gap-2">
            <form @submit.prevent="login" class="flex items-center gap-2">
              <InputText
                v-model="email"
                type="email"
                placeholder="Email"
                class="w-28 h-10 text-sm"
                :class="['p-inputtext-sm', {'p-invalid': authError}]"
              />
              <InputText
                v-model="password"
                type="password"
                placeholder="Password"
                class="w-28 h-10 text-sm"
                :class="['p-inputtext-sm', {'p-invalid': authError}]"
              />
              <Button
                type="submit"
                label="Login"
                class="h-10 text-sm ml-1"
                severity="success"
              />
            </form>
            <div v-if="authError" class="error ml-2 whitespace-nowrap flex items-center">
              <i class="pi pi-exclamation-triangle mr-1" />
              <span class="text-xs text-red-400">{{ authError }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Menubar>
  </div>
  <!-- <div class="min-xl:pl-14"> -->
  <div class="pt-[120px] pl-3 min-xl:min-w-6xl no-scroll">
    <router-view />
  </div>
</template>

<script>
import { useAuthStore } from "@/stores/authStore.js";
import Button from "primevue/button";
import Menubar from "primevue/menubar";
import InputText from "primevue/inputtext";

export default {
  name: 'App',
  components: {
    Button,
    Menubar,
    InputText
  },
  data(){
    return{
      email: '',
      password: '',
      authStore: useAuthStore(),
      items: [
        {
          label: 'Main Page',
          icon: 'pi pi-fw pi-home',
          route: '/',
          shortcut: 'Ctrl + H',
          submenu: [
          ],
        },
        {
          label: 'About',
          icon: 'pi pi-fw pi-info-circle',
          route: '/About',
        },
        {
          label: 'My pastes',
          icon: 'pi pi-fw pi-list',
          route: '/mypastes'
        },
      ]
    };
  },
  computed: {
    isAuthenticated() {
      return this.authStore.isAuthenticated;
    },
    user() {
      return this.authStore.user;
    },
    authError() {
      return this.authStore.errorMessage;
    }
  },
  methods: {
    logout() {
      this.authStore.logout();
    },
    login() {
      this.authStore.login({ email: this.email, password: this.password });
    }
  },
  mounted() {
    const token = localStorage.getItem("token");
    if (token) {
      this.authStore.isAuthenticated = true;
      this.authStore.getUser();
    }
  }
};
</script>

<style>

.no-scroll {
  overflow: hidden;
}

</style
