<template>
  <header class="w-full bg-zinc-900 border-b border-zinc-800">
    <div class="w-full px-6 py-3 flex items-center justify-between">

      <!-- LEFT: Logo -->
      <router-link
        to="/"
        class="flex items-center gap-2 text-emerald-400 font-semibold text-lg hover:text-emerald-300 transition"
      >
        🐦 <span class="text-white">PasteBin</span>
      </router-link>

      <!-- RIGHT: About + Auth -->
      <div class="flex items-center gap-6">

        <!-- About link -->
        <router-link
          to="/about"
          class="text-emerald-400 text-sm uppercase tracking-wide hover:text-emerald-300 transition"
        >
          About
        </router-link>

        <!-- Auth section -->
        <div class="flex items-center gap-3">
          <!-- Authenticated -->
          <div v-if="isAuthenticated && user" class="flex items-center gap-2 text-white text-sm">
            Welcome, {{ user.name }}
            <button
              @click="logout"
              class="px-3 py-1 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700 transition"
            >
              Logout
            </button>
          </div>

          <!-- Login form -->
          <div v-else class="flex items-center gap-2">
            <form @submit.prevent="login" class="flex items-center gap-2">
              <input
                v-model="email"
                type="email"
                id="email"
                required
                placeholder="Email"
                class="px-3 py-2 bg-zinc-800 border border-zinc-600 rounded text-white text-sm placeholder-gray-400 focus:outline-none focus:border-emerald-400 w-28"
              />
              <input
                v-model="password"
                type="password"
                id="password"
                required
                placeholder="Password"
                class="px-3 py-2 bg-zinc-800 border border-zinc-600 rounded text-white text-sm placeholder-gray-400 focus:outline-none focus:border-emerald-400 w-28"
              />
              <button
                type="submit"
                class="px-4 py-2 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 transition whitespace-nowrap"
              >
                Login
              </button>
            </form>
            <p v-if="authError" class="error text-xs ml-2 whitespace-nowrap">{{ authError }}</p>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
