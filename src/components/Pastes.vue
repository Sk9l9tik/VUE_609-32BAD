<template>
  <div v-if="paste && paste.id" class="w-full p-6 ml-10 bg-zinc-900 rounded-lg shadow-lg">
    <div class="mb-10">
      <h1 class="text-3xl font-bold text-white mb-6">{{ paste.title }}</h1>

      <div class="flex flex-wrap gap-4 text-sm text-gray-400 mb-6">
        <span>Author: {{ paste.user?.name || pastes.author_id }}</span>
        <span>Created at: {{ formatDate(paste.created_at) }}</span>
        <span v-if="paste.expiration">Expires: {{ formatDate(paste.expiration) }}</span>
        <span :class="paste.access ? 'text-green-400' : 'text-red-400'">
          Access: {{ paste.access ? 'Public' : 'Private' }}
        </span>
      </div>

      <div class="bg-zinc-800 p-6 rounded-lg border border-zinc-700">
        <pre class="whitespace-pre-wrap text-lg text-white font-mono">{{ paste.main_text }}</pre>
      </div>

      <div v-if="paste.image_url && paste.image_url.length > 50" class="py-5">
        <img
          :src="paste.image_url"
          alt="Paste image"
          class="max-w-full max-h-[500px] rounded-xl border border-zinc-700 object-contain cursor-pointer hover:opacity-90 transition-opacity"
          @click="lightboxOpen = true"
        />
      </div>

      <p
        v-if="paste.updated_at && paste.updated_at !== paste.created_at"
        class="text-xs text-gray-500 mt-2 text-right"
      >
        Updated: {{ formatDate(paste.updated_at) }}
      </p>
    </div>

    <div class="border-t border-zinc-700 pt-8">
      <Comments :pasteId="paste.id" />
    </div>

    <div
      v-if="lightboxOpen"
      class="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
      @click="lightboxOpen = false"
    >
      <img
        :src="paste.image_url"
        alt="Full image"
        class="max-w-[90vw] max-h-[90vh] rounded-xl object-contain shadow-2xl"
        @click.stop
      />
      <button
        @click="lightboxOpen = false"
        class="absolute top-6 right-8 text-white text-3xl hover:text-gray-300 transition-colors"
      >
        ✕
      </button>
    </div>
  </div>

  <div v-else-if="loading" class="flex items-center justify-center min-h-[400px]">
    <div class="text-white text-lg">Loading...</div>
  </div>

  <div v-else-if="error" class="flex flex-col items-center justify-center min-h-[400px] text-center">
    <div class="text-red-400 text-lg mb-4">{{ error }}</div>
    <router-link to="/" class="text-emerald-400 hover:text-emerald-300">
      ← Back to main
    </router-link>
  </div>
</template>

<script>
import Comments from '@/components/Comments.vue';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default {
  name: 'PasteViewer',
  components: { Comments },
  data() {
    return {
      paste: null,
      loading: true,
      error: null,
      lightboxOpen: false,
    };
  },
  computed: {
    token() {
      return localStorage.getItem('token');
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
  },
  async mounted() {
    try {
      this.loading = true;
      const id = this.$route.params.id;
      if (!id) throw new Error('ID not specified');

      const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };

      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await fetch(`${backendUrl}/pastes/${id}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
          if (response.status === 404) throw new Error('Paste not found');
          if (response.status === 410) throw new Error('This paste has expired');
          if (response.status === 403) throw new Error('Access forbidden');
          throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      this.paste = await response.json();
    } catch (error) {
      console.error('Error loading paste:', error);
      this.error = error.message || 'Failed to load paste';
    } finally {
      this.loading = false;
    }
  },
};
</script>
