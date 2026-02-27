<template>
  <div class="min-h-screen from-zinc-900 via-black to-zinc-950 text-white p-8">
    <main class="max-w-4xl mx-auto">
      <div class="bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 rounded-2xl shadow-2xl p-8 md:p-12">
        <h2 class="text-3xl font-black mb-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent">
          New Paste
        </h2>
        <!-- <p class="text-zinc-400 mb-8 text-lg">Поделись кодом, заметками или секретом</p> -->

        <!-- Form -->
        <form @submit.prevent="createPaste" class="space-y-6">
          <div>
            <label class="block text-[14pt] font-semibold text-zinc-300 mb-2 pt-4">Title</label>
            <input
              v-model="form.title"
              type="text"
              placeholder="Без названия"
              class="w-full bg-zinc-800/50 border border-zinc-600 rounded-xl px-5 py-3 text-lg"
            />
          </div>

          <div>
            <label class="block text-[14pt] font-semibold text-zinc-300 mb-2 pt-5">Main Text</label>
            <textarea
              v-model="form.main_text"
              rows="12"
              placeholder="Ваш код, текст или секрет..."
              class="w-full bg-zinc-800/50 border border-zinc-600 rounded-xl px-5 py-3 text-lg font-mono"
            ></textarea>
          </div>

          <div class="grid md:grid-cols-2 gap-6 pt-4 border-t border-zinc-700/50">
            <!-- Access -->
            <div>
              <label class="block text-[14pt] font-semibold text-zinc-300 mb-3">Access</label>
              <div class="flex flex-wrap gap-2">
                <label class="flex items-center gap-2 p-3 bg-zinc-800/50 border border-zinc-600 rounded-xl cursor-pointer">
                  <input type="radio" v-model="form.access" value="1" class="" />
                  <!-- <span class="w-5 h-5 border-2 border-zinc-500 rounded-full"></span> -->
                  <span class="text-sm font-medium">Public</span>
                </label>

                <label class="flex items-center gap-2 p-3 bg-zinc-800/50 border border-zinc-600 rounded-xl cursor-pointer">
                  <input type="radio" v-model="form.access" value="0" class="" />
                  <!-- <span class="w-5 h-5 border-2 border-zinc-500 rounded-full"></span> -->
                  <span class="text-sm font-medium">Private</span>
                </label>
              </div>
            </div>

            <!-- Expiration (hours) -->
            <div class="pb-5">
              <label class="block text-[14pt] font-semibold text-zinc-300 mb-3">Expireation</label>
              <select
                v-model="form.expiration"
                class="w-full bg-zinc-800/50 border border-zinc-600 rounded-xl px-4 py-3 text-lg
                "
              >
                <option :value="null">Навсегда</option>
                <option :value="1">1 час</option>
                <option :value="24">1 день</option>
                <option :value="24 * 7">1 неделя</option>
              </select>
            </div>
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-4
            rounded-2xl disabled:opacity-50"
          >
            <span v-if="loading">Creating...</span>
            <span v-else>Create Paste</span>
          </button>
        </form>

        <!-- Message -->
        <div v-if="message" class="mt-6 p-4 rounded-xl text-center"
          :class="success ? 'bg-emerald-500/20 text-emerald-200' : 'bg-red-500/20 text-red-200'">
          {{ message }}

          <router-link
            v-if="success && pasteId"
            :to="`/pastes/${pasteId}`"
            class="block mt-2 underline"
          >
            Посмотреть →
          </router-link>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: "NewPaste",
  data() {
    return {
      form: {
        title: "",
        main_text: "",
        access: "public",
        expiration: null, // hours
      },
      loading: false,
      message: "",
      success: false,
      pasteId: null,
    };
  },

  methods: {
    // превращаем часы → timestamp (ISO)
    convertExpiration(hours) {
      if (hours === null) return null;

      const expireDate = new Date();
      expireDate.setHours(expireDate.getHours() + Number(hours));

      return expireDate.toISOString();
    },
async createPaste() {
  this.loading = true;
  this.message = "";

  try {
    const payload = {
      title: this.form.title,
      main_text: this.form.main_text,
      access: this.form.access,
      expiration: this.convertExpiration(this.form.expiration),
    };

    const response = await fetch("http://127.0.0.1:6001/api/pastes/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Ошибка ${response.status}`);
    }

    const result = await response.json();

    this.success = true;
    this.pasteId = result.id;
    this.message = "Paste успешно создан!";

    this.form = {
      title: "",
      main_text: "",
      access: "public",
      expiration: null,
    };

  } catch (error) {
    this.success = false;
    this.message = error.message || "Не удалось создать paste";
  } finally {
    this.loading = false;
  }
}

  },
};
</script>

<!-- <style scoped> -->
<!-- textarea::-webkit-scrollbar { -->
<!--   width: 8px; -->
<!-- } -->
<!-- textarea::-webkit-scrollbar-thumb { -->
<!--   background: #4a5568; -->
<!--   border-radius: 4px; -->
<!-- } -->
<!-- </style> -->
