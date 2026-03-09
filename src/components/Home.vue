<template>
  <div class="max-w-12xl justify-center min-h-screen from-zinc-900 via-black to-zinc-950 text-white pt-8 min-xl:pl-11">
    <div class="bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 rounded-2xl shadow-2xl p-8 md:p-12">
      <h2 class="text-3xl font-black mb-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent">
        New Paste
      </h2>

      <form @submit.prevent="createPaste" class="space-y-6">
        <div>
          <label class="block text-[14pt] font-semibold text-zinc-300 mb-2 pt-4">Title</label>
          <InputText
            v-model="form.title"
            type="text"
            placeholder="Without title"
            class="w-full bg-zinc-800/50 border border-zinc-600 rounded-xl px-5 py-3 text-lg font-mono"
          />
        </div>

        <div>
          <label class="block text-[14pt] font-semibold text-zinc-300 mb-2 pt-5">Main Text</label>
          <Textarea
            v-model="form.main_text"
            rows="12"
            placeholder="Your code, text or secret..."
            class="w-full bg-zinc-800/50 border border-zinc-600 rounded-xl px-5 py-3 text-lg font-mono"
          />
        </div>

        <div v-if="token">
          <label class="block text-[14pt] font-semibold text-zinc-300 mb-2">Image</label>
          <label
            for="image-upload"
            class="flex items-center gap-3 w-full px-5 py-3 bg-zinc-800/50 border border-zinc-600 rounded-xl cursor-pointer hover:border-emerald-500 transition-colors"
          >
            <i class="pi pi-upload text-emerald-400" />
            <span class="text-zinc-400 text-sm">
              {{ form.imageFile ? form.imageFile.name : 'Choose image...' }}
            </span>
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            class="hidden"
            @change="onImageChange"
          />
          <div v-if="imagePreview" class="mt-3">
            <img
              :src="imagePreview"
              alt="Preview"
              class="max-h-48 rounded-xl border border-zinc-700 object-contain"
            />
            <button
              type="button"
              @click="clearImage"
              class="mt-2 text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              ✕ Remove image
            </button>
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-6 pt-4 border-t border-zinc-700/50">
          <div>
            <label class="block text-[14pt] font-semibold text-zinc-300 mb-3">Access</label>
            <div class="flex flex-wrap gap-2">
              <label class="flex items-center gap-2 p-3 bg-zinc-800/50 border border-zinc-600 rounded-xl cursor-pointer">
                <RadioButton v-model="form.access" inputId="public" name="access" value="1" />
                <span class="text-sm font-medium">Public</span>
              </label>
              <label class="flex items-center gap-2 p-3 bg-zinc-800/50 border border-zinc-600 rounded-xl cursor-pointer">
                <RadioButton v-model="form.access" inputId="private" name="access" value="0" />
                <span class="text-sm font-medium">Private</span>
              </label>
            </div>
          </div>

          <div class="pb-5">
            <label class="block text-[14pt] font-semibold text-zinc-300 mb-3">Expiration</label>
            <select
              v-model="form.expiration"
              class="w-full bg-zinc-800/50 border border-zinc-600 rounded-xl px-4 py-3 text-lg"
            >
              <option :value="null">Never</option>
              <option :value="1">1 hour</option>
              <option :value="24">1 day</option>
              <option :value="168">1 week</option>
              <option :value="840">1 month</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-4 rounded-2xl disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          <span v-if="loading">Creating...</span>
          <span v-else>Create a masterpiece</span>
        </button>
      </form>

      <div
        v-if="message"
        class="mt-6 p-4 rounded-xl text-center"
        :class="success ? 'bg-emerald-500/20 text-emerald-200' : 'bg-red-500/20 text-red-200'"
      >
        {{ message }}
        <router-link
          v-if="success && pasteId"
          :to="`/pastes/${pasteId}`"
          class="block mt-2 underline"
        >
          View →
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import RadioButton from 'primevue/radiobutton';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import { useDataStore } from '@/stores/dataStore.ts';

export default {
  components: { RadioButton, InputText, Textarea },
  name: 'NewPaste',
  data() {
    return {
      form: {
        title: '',
        main_text: '',
        access: '1',
        expiration: null,
        imageFile: null,
      },
      imagePreview: null,
      loading: false,
      message: '',
      success: false,
      pasteId: null,
      dataStore: useDataStore(),
    };
  },
  computed: {
    token() {
      return localStorage.getItem('token');
    },
  },
  methods: {
    onImageChange(event) {
      const file = event.target.files[0];
      if (!file) return;
      this.form.imageFile = file;
      this.imagePreview = URL.createObjectURL(file);
    },
    clearImage() {
      this.form.imageFile = null;
      this.imagePreview = null;
      const input = document.getElementById('image-upload');
      if (input) input.value = '';
    },
    convertExpiration(hours) {
      if (hours === null) return null;
      const expireDate = new Date();
      expireDate.setHours(expireDate.getHours() + Number(hours));
      return expireDate.toISOString();
    },
    async createPaste() {
      this.loading = true;
      this.message = '';
      try {
        const result = await this.dataStore.create_paste({
          title: this.form.title,
          main_text: this.form.main_text,
          access: this.form.access,
          expiration: this.convertExpiration(this.form.expiration),
          image: this.token ? (this.form.imageFile ?? null) : null,
        });

        this.success = true;
        this.pasteId = result.id;
        this.message = 'Paste created successfully!';
        this.form = { title: '', main_text: '', access: '1', expiration: null, imageFile: null };
        this.imagePreview = null;
      } catch (error) {
        this.success = false;
        this.message = this.dataStore.errorMessage || error.message || 'Cannot create paste';
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
