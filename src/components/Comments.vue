<template>
  <div class="space-y-4">
    <h3 class="text-xl font-semibold text-white pb-1">Comments</h3>

    <div class="pb-4 border-b border-zinc-700">
      <div v-if="!authtoken" class="text-gray-500 text-sm mb-6">
        You need to <router-link to="/" class="text-emerald-400 hover:text-emerald-300">log in</router-link> to comment.
      </div>
      <div v-else class="flex flex-col gap-2">
        <textarea
          v-model="newComment"
          rows="3"
          style="height: 38px"
          placeholder="Write your comment..."
          class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500 resize-none"
          @input="$event.target.style.height = '38px'; $event.target.style.height = $event.target.scrollHeight + 'px'"
        />
        <div class="flex items-center justify-between">
          <span v-if="submitError" class="text-red-400 text-xs">{{ submitError }}</span>
          <span v-else />
          <button
            @click="submitComment"
            :disabled="submitting || !newComment.trim()"
            class="px-4 py-2 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {{ submitting ? 'Posting...' : 'Post' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="dataStore.errorMessage" class="px-4 py-3 bg-red-900/40 border border-red-700 rounded-lg text-red-400 text-sm">
      {{ dataStore.errorMessage }}
    </div>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="text-gray-400">Loading comments...</div>
    </div>

    <div v-else-if="dataStore.comments.length === 0" class="text-center py-10">
      <div class="text-gray-500">No comments yet. Be the first!</div>
    </div>

    <div v-else class="flex flex-col gap-3 mt-6 pt-4">
      <div
        v-for="comment in dataStore.comments"
        :key="comment.id"
        class="p-5 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-zinc-500 transition-colors flex flex-col gap-3"
      >
        <div class="flex items-center justify-between">
          <span class="text-emerald-400 text-sm font-medium">
            {{ comment.author_name || comment.user?.name || `User #${comment.author_id}` }}
          </span>
          <span class="text-gray-500 text-xs">{{ formatDate(comment.created_at) }}</span>
        </div>

        <p class="text-white text-sm leading-relaxed whitespace-pre-wrap break-words">{{ comment.text }}</p>
      </div>
    </div>

    <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 pt-2">
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
        :class="p === page ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'"
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
</template>

<script>
import { useDataStore } from '@/stores/dataStore.ts';

export default {
  name: 'Comments',
  props: {
    pasteId: {
      type: [Number, String],
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      page: 0,
      perPage: 3,
      newComment: '',
      submitting: false,
      submitError: '',
      dataStore: useDataStore(),
    };
  },
  computed: {
    authtoken() {
      return localStorage.getItem('token');
    },
    totalPages() {
      return Math.ceil((this.dataStore.totalComments || 0) / this.perPage);
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
    async goToPage(p) {
      if (p < 0 || p >= this.totalPages) return;
      this.page = p;
      await this.loadComments();
    },
    async loadComments() {
      this.loading = true;
      await Promise.all([
        this.dataStore.get_comments(this.pasteId, this.page, this.perPage),
        this.dataStore.get_comments_total(this.pasteId),
      ]);
      this.loading = false;
    },
    async submitComment() {
      if (!this.newComment.trim()) return;
      this.submitting = true;
      this.submitError = '';
      try {
        await this.dataStore.post_comment(this.pasteId, this.newComment.trim());
        this.newComment = '';
        this.page = Math.max(0, this.totalPages - 1);
        await this.loadComments();
      } catch (err) {
        this.submitError = 'Failed to post comment.';
      } finally {
        this.submitting = false;
      }
    },
  },
  async mounted() {
    await this.loadComments();
  },
};
</script>
