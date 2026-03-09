<template>
  <div class="w-full p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-white pb-3">My Pastes</h1>
      <router-link
        to="/"
        class="px-4 py-2 text-emerald-400 hover:text-emerald-300 transition-colors"
      >
        ← New paste
      </router-link>
    </div>

    <div v-if="dataStore.errorMessage" class="px-4 py-3 bg-red-900/40 border border-red-700 rounded-lg text-red-400 text-sm">
      {{ dataStore.errorMessage }}
    </div>

    <div v-if="!authtoken" class="flex flex-col items-center justify-center min-h-[400px] text-center">
      <div class="text-red-400 text-lg mb-4">You need to log in to view your pastes</div>
      <router-link to="/" class="text-emerald-400 hover:text-emerald-300">← Back to main</router-link>
    </div>

    <div v-else-if="loading" class="flex items-center justify-center min-h-[400px]">
      <div class="text-gray-400 text-lg">Loading your pastes...</div>
    </div>

    <div v-else-if="dataStore.pastes.length === 0" class="text-center py-20">
      <div class="text-gray-400 text-xl mb-4">Now you have 0 pastes</div>
      <router-link
        to="/"
        class="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
      >
        Create first paste
      </router-link>
    </div>

    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="paste in dataStore.pastes"
          :key="paste.id"
          class="p-5 bg-zinc-900 rounded-lg border border-zinc-800 hover:border-zinc-600 transition-colors flex flex-col gap-3"
        >
          <h3 class="text-white text-lg font-semibold truncate">{{ paste.title }}</h3>

          <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400">
            <span>Created: {{ formatDate(paste.created_at) }}</span>
            <span v-if="paste.expiration">Expire: {{ formatDate(paste.expiration) }}</span>
          </div>

          <span
            class="text-sm font-medium"
            :class="paste.access ? 'text-emerald-400' : 'text-red-400'"
          >
            {{ paste.access ? 'Public' : 'Private' }}
          </span>

          <div class="bg-zinc-800 rounded-md px-4 py-3 border border-zinc-700">
            <pre class="text-sm text-white font-mono whitespace-pre-wrap break-all leading-relaxed">{{ previewText(paste.main_text) }}</pre>
          </div>

          <div class="flex items-center justify-between pt-1 mt-auto">
            <router-link
              :to="`/pastes/${paste.id}`"
              class="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              View
            </router-link>
            <button
              @click="copyLink(paste.id)"
              class="w-9 h-9 flex items-center justify-center bg-zinc-700 rounded hover:bg-zinc-600 transition-colors text-base"
              title="Copy link"
            >
              📋
            </button>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-center gap-2 pt-6">
        <button
          @click="goToPage(page - 1)"
          :disabled="page === 0"
          class="px-3 py-1.5 rounded bg-zinc-800 text-gray-400 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
        >
          ← Prev
        </button>

        <button
          v-for="p in visiblePages"
          :key="p"
          @click="goToPage(p)"
          class="w-8 h-8 rounded text-sm font-medium transition-colors"
          :class="p === page
            ? 'bg-emerald-600 text-white'
            : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'"
        >
          {{ p + 1 }}
        </button>

        <button
          @click="goToPage(page + 1)"
          :disabled="page >= totalPages - 1"
          class="px-3 py-1.5 rounded bg-zinc-800 text-gray-400 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
        >
          Next →
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useDataStore } from '@/stores/dataStore.js';
const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default {
  name: 'MyPastes',
  data() {
    return {
      loading: false,
      page: 0,
      perPage: 6,
      dataStore: useDataStore(),
    };
  },
  computed: {
    authtoken() {
      return localStorage.getItem('token');
    },
    totalPages() {
      return Math.ceil((this.dataStore.totalPastes || 0) / this.perPage);
    },
    visiblePages() {
      const total = this.totalPages;
      const current = this.page;
      const delta = 2;
      const pages = [];
      for (let i = Math.max(0, current - delta); i <= Math.min(total - 1, current + delta); i++) {
        pages.push(i);
      }
      return pages;
    },
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    },
    previewText(text) {
      if (!text) return '';
      return text.length > 80 ? text.substring(0, 80) + '...' : text;
    },
    async copyLink(pasteId) {
      const url = `${window.location.origin}/pastes/${pasteId}`;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(url);
        } else {
          const el = document.createElement('textarea');
          el.value = url;
          el.style.position = 'absolute';
          el.style.opacity = '0';
          document.body.appendChild(el);
          el.select();
          document.execCommand('copy');
          document.body.removeChild(el);
        }
        alert(`Copied: ${url}`);
      } catch (err) {
        console.error('Copy error:', err);
      }
    },
    async goToPage(p) {
      if (p < 0 || p >= this.totalPages) return;
      this.page = p;
      await this.loadPastes();
    },
    async loadPastes() {
      if (!this.authtoken) return;
      this.loading = true;
      await Promise.all([
        this.dataStore.get_pastes(this.page, this.perPage),
        this.dataStore.get_pastes_total(),
      ]);
      this.loading = false;
    },
  },
  async mounted() {
    await this.loadPastes();
  },
};
</script>
