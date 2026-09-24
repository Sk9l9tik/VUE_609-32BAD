<template>
  <div class="max-w-12xl justify-center min-h-screen text-white pt-8 min-xl:pl-11">
    <Toast />

    <div v-if="loading" class="flex items-center justify-center min-h-[400px]">
      <div class="text-gray-400 text-lg">Loading paste...</div>
    </div>

    <div v-else-if="loadError" class="flex flex-col items-center justify-center min-h-[400px] text-center">
      <div class="text-red-400 text-lg mb-4">{{ loadError }}</div>
      <router-link to="/mypastes" class="text-emerald-400 hover:text-emerald-300">← Back to My Pastes</router-link>
    </div>

    <div v-else class="bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 rounded-2xl shadow-2xl p-8 md:p-12">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-3xl font-black bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent">
          Edit Paste
        </h2>
        <router-link to="/mypastes" class="text-gray-400 hover:text-emerald-300 transition-colors text-sm">
          ← Back to My Pastes
        </router-link>
      </div>

      <form @submit.prevent="submitEdit" class="space-y-6">
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

        <div>
          <label class="block text-[14pt] font-semibold text-zinc-300 mb-2">Image</label>

          <div v-if="currentImageUrl && !removeCurrentImage && !newImagePreview" class="mb-3">
            <p class="text-xs text-gray-500 mb-2">Current image:</p>
            <img
              :src="currentImageUrl"
              alt="Current image"
              class="max-h-48 rounded-xl border border-zinc-700 object-contain"
            />
            <button
              type="button"
              @click="removeCurrentImage = true"
              class="mt-2 text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              ✕ Remove image
            </button>
          </div>

          <div v-if="removeCurrentImage && !newImagePreview" class="mb-3 text-sm text-red-400">
            Image will be removed on save.
            <button type="button" @click="removeCurrentImage = false" class="ml-2 text-xs text-gray-400 hover:text-gray-300">
              Undo
            </button>
          </div>

          <label
            for="edit-image-upload"
            class="flex items-center gap-3 w-full px-5 py-3 bg-zinc-800/50 border border-zinc-600 rounded-xl cursor-pointer hover:border-emerald-500 transition-colors"
          >
            <i class="pi pi-upload text-emerald-400" />
            <span class="text-zinc-400 text-sm">
              {{ form.imageFile ? form.imageFile.name : 'Choose new image...' }}
            </span>
          </label>
          <input
            id="edit-image-upload"
            type="file"
            accept="image/*"
            class="hidden"
            @change="onImageChange"
          />

          <div v-if="newImagePreview" class="mt-3">
            <p class="text-xs text-gray-500 mb-2">New image preview:</p>
            <img
              :src="newImagePreview"
              alt="Preview"
              class="max-h-48 rounded-xl border border-zinc-700 object-contain"
            />
            <button
              type="button"
              @click="clearNewImage"
              class="mt-2 text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              ✕ Cancel new image
            </button>
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-6 pt-4 border-t border-zinc-700/50">
          <div>
            <label class="block text-[14pt] font-semibold text-zinc-300 mb-3">Access</label>
            <div class="flex flex-wrap gap-2">
              <label class="flex items-center gap-2 p-3 bg-zinc-800/50 border border-zinc-600 rounded-xl cursor-pointer">
                <RadioButton v-model="form.access" inputId="edit-public" name="edit-access" value="1" />
                <span class="text-sm font-medium">Public</span>
              </label>
              <label class="flex items-center gap-2 p-3 bg-zinc-800/50 border border-zinc-600 rounded-xl cursor-pointer">
                <RadioButton v-model="form.access" inputId="edit-private" name="edit-access" value="0" />
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
              <option value="keep">Keep current ({{ currentExpirationLabel }})</option>
              <option :value="null">Never</option>
              <option :value="1">1 hour from now</option>
              <option :value="24">1 day from now</option>
              <option :value="168">1 week from now</option>
              <option :value="840">1 month from now</option>
            </select>
          </div>
        </div>

        <div class="flex gap-4">
          <button
            type="submit"
            :disabled="saving"
            class="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-4 rounded-2xl disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            <span v-if="saving">Saving...</span>
            <span v-else>Save Changes</span>
          </button>
          <router-link
            to="/mypastes"
            class="px-8 flex items-center justify-center bg-zinc-700 text-white font-bold rounded-2xl hover:bg-zinc-600 transition-colors"
          >
            Cancel
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import RadioButton from 'primevue/radiobutton';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Toast from 'primevue/toast';
import { useDataStore } from '@/stores/dataStore.ts';

const backendUrl = import.meta.env.VITE_API_URL;

export default {
  name: 'EditPaste',
  components: { RadioButton, InputText, Textarea, Toast },
  data() {
    return {
      loading: true,
      saving: false,
      loadError: null,
      form: {
        title: '',
        main_text: '',
        access: '1',
        expiration: 'keep',
        imageFile: null,
      },
      currentImageUrl: null,
      removeCurrentImage: false,
      newImagePreview: null,
      originalExpiration: null,
      dataStore: useDataStore(),
    };
  },
  computed: {
    token() {
      return localStorage.getItem('token');
    },
    currentExpirationLabel() {
      if (!this.originalExpiration) return 'Never';
      const date = new Date(this.originalExpiration);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    },
  },
  methods: {
    onImageChange(event) {
      const file = event.target.files[0];
      if (!file) return;
      this.form.imageFile = file;
      this.newImagePreview = URL.createObjectURL(file);
      this.removeCurrentImage = false;
    },
    clearNewImage() {
      this.form.imageFile = null;
      this.newImagePreview = null;
      const input = document.getElementById('edit-image-upload');
      if (input) input.value = '';
    },
    async submitEdit() {
      if (!this.form.title.trim()) {
        this.$toast.add({ severity: 'warn', summary: 'Validation', detail: 'Title is required', life: 3000 });
        return;
      }
      if (!this.form.main_text.trim()) {
        this.$toast.add({ severity: 'warn', summary: 'Validation', detail: 'Main text is required', life: 3000 });
        return;
      }

      this.saving = true;
      try {
        const changeExpiration = this.form.expiration !== 'keep';
        await this.dataStore.update_paste(this.$route.params.id, {
          title: this.form.title,
          main_text: this.form.main_text,
          access: this.form.access,
          expiration: changeExpiration ? this.form.expiration : undefined,
          changeExpiration,
          image: this.form.imageFile ?? null,
          remove_image: this.removeCurrentImage && !this.form.imageFile,
        });

        this.$toast.add({
          severity: 'success',
          summary: 'Saved',
          detail: 'Paste updated successfully',
          life: 3000,
        });

        setTimeout(() => this.$router.push('/mypastes'), 1200);
      } catch {
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: this.dataStore.errorMessage || 'Failed to save paste',
          life: 5000,
        });
      } finally {
        this.saving = false;
      }
    },
  },
  async mounted() {
    if (!this.token) {
      this.$router.push('/');
      return;
    }
    try {
      const id = this.$route.params.id;
      const response = await fetch(`${backendUrl}/pastes/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 403) throw new Error('Access forbidden');
        if (response.status === 404) throw new Error('Paste not found');
        throw new Error(`Error ${response.status}`);
      }
      const paste = await response.json();
      this.form.title = paste.title;
      this.form.main_text = paste.main_text;
      this.form.access = paste.access ? '1' : '0';
      this.originalExpiration = paste.expiration ?? null;
      this.currentImageUrl = paste.image_url ?? null;
    } catch (err) {
      this.loadError = err.message || 'Failed to load paste';
    } finally {
      this.loading = false;
    }
  },
};
</script>
