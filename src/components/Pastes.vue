<template>
  <div v-if="paste && paste.id" class="w-full p-6 bg-zinc-900 rounded-lg shadow-lg">

    <!-- Paste Title -->
    <div class="mb-20">
      <h1 class="text-3xl font-bold text-white mb-20">{{ paste.title }}</h1>

      <!-- Metadata -->
      <div class="flex flex-wrap gap-4 text-sm text-gray-400 mb-20">
        <span>Автор ID: {{ paste.author_id || paste.user_id }}</span>
        <span>Создано: {{ formatDate(paste.created_at) }}</span>
        <span v-if="paste.expiration">Истекает: {{ formatDate(paste.expiration) }}</span>
        <span :class="paste.access ? 'text-green-400' : 'text-red-400'">
          Доступ: {{ paste.access ? 'Публичный' : 'Приватный' }}
        </span>
      </div>

      <!-- Main Content -->
      <div class="bg-zinc-800 p-6 rounded-lg border border-zinc-700">
        <pre class="whitespace-pre-wrap text-lg text-white font-mono">{{ paste.main_text }}</pre>
      </div>

      <!-- Updated timestamp -->
      <p v-if="paste.updated_at && paste.updated_at !== paste.created_at"
         class="text-xs text-gray-500 mt-2 text-right">
        Обновлено: {{ formatDate(paste.updated_at) }}
      </p>
    </div>

    <!-- Comments/Reviews section (placeholder for future) -->
    <div v-if="false">
      <h3 class="text-xl font-semibold text-white mb-4">Комментарии</h3>
      <!-- Comments will go here -->
    </div>
  </div>

  <div v-else-if="loading" class="flex items-center justify-center min-h-[400px]">
    <div class="text-white text-lg">Загрузка...</div>
  </div>

  <div v-else-if="error" class="flex flex-col items-center justify-center min-h-[400px] text-center">
    <div class="text-red-400 text-lg mb-4">{{ error }}</div>
    <router-link to="/" class="text-emerald-400 hover:text-emerald-300">
      ← Вернуться на главную
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'PasteViewer',
  data() {
    return {
      paste: null,
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
    }
  },
  async mounted() {
    try {
      this.loading = true;
      const id = this.$route.params.id;

      if (!id) {
        throw new Error('ID не указан');
      }

      const response = await fetch(`http://127.0.0.1:6001/api/pastes/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Paste не найден');
        }
        throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
      }

      this.paste = await response.json();

    } catch (error) {
      console.error('Ошибка загрузки paste:', error);
      this.error = error.message || 'Не удалось загрузить paste';
    } finally {
      this.loading = false;
    }
  }
};
</script>

<!-- <style scoped> -->
<!-- pre { -->
<!--   background: transparent; -->
<!--   border: none; -->
<!--   padding: 0; -->
<!--   margin: 0; -->
<!--   font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; -->
<!-- } -->
<!-- </style> -->
