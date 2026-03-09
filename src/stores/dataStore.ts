import { defineStore } from "pinia";
import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useDataStore = defineStore('data', {
  state: () => ({
    pastes: [],
    paste: null,
    totalPastes: null,
    comments: [],
    totalComments: null,
    errorCode: 0,
    errorMessage: "",
  }),
  actions: {
    async create_paste(payload: {
      title: string;
      main_text: string;
      access: string;
      expiration: string | null;
      image?: File | null;
    }) {
      this.errorMessage = "";
      try {
        const isAuth = !!localStorage.getItem("token");

        if (isAuth && payload.image) {
          const formData = new FormData();
          formData.append('title', payload.title);
          formData.append('main_text', payload.main_text);
          formData.append('access', payload.access);
          if (payload.expiration) formData.append('expiration', payload.expiration);
          formData.append('image', payload.image);

          const response = await axios.post(backendUrl + '/pastes/create', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          return response.data;
        }

        const response = await axios.post(backendUrl + '/pastes/create', {
          title: payload.title,
          main_text: payload.main_text,
          access: payload.access,
          expiration: payload.expiration ?? null,
        });
        return response.data;

      } catch (error: any) {
        this._handleError(error);
        throw error;
      }
    },

    async get_pastes(page = 0, perpage = 8) {
      this.errorMessage = "";
      try {
        const response = await axios.get(backendUrl + '/user/pastes', {
          params: { page, perpage },
        });
        this.pastes = response.data;
      } catch (error: any) {
        this._handleError(error);
      }
    },

    async get_pastes_total() {
      this.errorMessage = "";
      try {
        const response = await axios.get(backendUrl + '/user/total-pastes');
        this.totalPastes = response.data;
      } catch (error: any) {
        this._handleError(error);
      }
    },

    async get_paste(id: number, page = 0, perpage = 8) {
      this.errorMessage = "";
      try {
        const response = await axios.get(backendUrl + `/pastes/${id}`, {
          params: { page, perpage },
        });
        this.paste = response.data;
      } catch (error: any) {
        this._handleError(error);
      }
    },

    async get_comments(pasteId: number, page = 0, perpage = 6) {
      this.errorMessage = "";
      try {
        const response = await axios.get(backendUrl + `/pastes/${pasteId}/comments`, {
          params: { page, perpage },
        });
        this.comments = response.data;
      } catch (error: any) {
        this._handleError(error);
      }
    },

    async get_comments_total(pasteId: number) {
      this.errorMessage = "";
      try {
        const response = await axios.get(backendUrl + `/pastes/${pasteId}/comments/total`);
        this.totalComments = response.data;
      } catch (error: any) {
        this._handleError(error);
      }
    },

    async post_comment(pasteId: number, text: string) {
      this.errorMessage = "";
      try {
        await axios.post(backendUrl + `/pastes/${pasteId}/comments`, { text });
      } catch (error: any) {
        this._handleError(error);
        throw error;
      }
    },

    _handleError(error: any) {
      if (error.response) {
        this.errorCode = error.response.status;
        this.errorMessage = error.response.data?.message || `Error ${error.response.status}`;
      } else if (error.request) {
        this.errorMessage = "No response from server";
      } else {
        this.errorMessage = error.message;
      }
      console.error(error);
    },
  },
});
