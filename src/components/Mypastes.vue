<template>
  <div class="w-full p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-white pb-3">My Pastes</h1>
      <router-link
        to="/"
        class="px-4 py-2  text-white rounded-lg hover:bg-emerald-700 transition-colors"
      >
        ← New paste
      </router-link>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center min-h-[400px]">
      <div class="text-white text-lg">Загрузка ваших паст...</div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="flex flex-col items-center justify-center min-h-[400px] text-center">
      <div class="text-red-400 text-lg mb-4">{{ error }}</div>
      <router-link to="/" class="text-emerald-400 hover:text-emerald-300">
        ← Back to main
      </router-link>
    </div>

    <!-- No pastes state -->
    <div v-else-if="pastes.length === 0" class="text-center py-20">
      <div class="text-gray-400 text-xl mb-4">У вас пока нет паст</div>
      <router-link
        to="/"
        class="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
      >
        Create first paste
      </router-link>
    </div>

    <!-- Pastes list -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="paste in pastes"
        :key="paste.id"
        class="p-6 bg-zinc-900 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-zinc-800 hover:border-zinc-700"
      >
        <!-- Title -->
        <h3 class="text-xl font-bold text-white mb-3 truncate">{{ paste.title }}</h3>

        <!-- Metadata -->
        <div class="space-y-2 mb-4 text-sm text-gray-400">
          <div class="flex gap-4">
            <span>Created: {{ formatDate(paste.created_at) }}</span>
            <span v-if="paste.expiration">Expire: {{ formatDate(paste.expiration) }}</span>
          </div>
          <span :class="paste.access ? 'text-green-400' : 'text-red-400'">
            {{ paste.access ? 'Public' : 'Private' }}
          </span>
        </div>

        <!-- Preview -->
        <div class="bg-zinc-800 p-4 rounded-lg border border-zinc-700 mb-4 max-h-24 overflow-hidden">
          <pre class="whitespace-pre-wrap text-sm text-white font-mono">{{ previewText(paste.main_text) }}</pre>
        </div>

        <!-- Actions -->
        <div class="flex gap-2 pt-4 border-t border-zinc-700">
          <router-link
            :to="`/pastes/${paste.id}`"
            class="flex w-full pt-8 text-white text-md rounded hover:bg-blue-700 transition-colors"
          >
           View
          </router-link>
          <button
            @click="copyLink(paste.id)"
            class="px-3 py-2 bg-zinc-700 text-white text-sm rounded hover:bg-zinc-600 transition-colors"
            title="Copy link"
          >
            📋
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MyPastes',
  data() {
    return {
      pastes: [],
      loading: true,
      error: null
    };
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
      return text.length > 100 ? text.substring(0, 100) + '...' : text;
    },
    async copyLink(pasteId) {
      try {
        await navigator.clipboard.writeText(`http://localhost:5173/pastes/${pasteId}`);
        // await navigator.clipboard.writeText(`http://127.0.0.1:8800/pastes/${pasteId}`);
        // You could add a toast notification here
        console.log('Link copied!');
      } catch (err) {
        console.error('Copy error:', err);
      }
    }
  },
  async mounted() {
    const token = localStorage.getItem('token');
    if(!token){
      this.error = 'Need auth'
      return;
    }
    try {
      this.loading = true;

      const response = await fetch('http://127.0.0.1:6001/api/user/pastes', {
        headers: {'Authorization': `Bearer ${token}`}
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.error = 'Needed auth';
        } else {
          throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
        }
        return;
      }

      this.pastes = await response.json();

    } catch (error) {
      console.error('Pastes loading:', error);
      this.error = error.message || 'Cannot load your pastes';
    } finally {
      this.loading = false;
    }
  }
};
</script>
