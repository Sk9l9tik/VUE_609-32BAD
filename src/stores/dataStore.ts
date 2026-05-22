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

    async get_pastes(page = 0, perPage = 6, search = '') {
      this.errorMessage = "";
      try {
        const params: Record<string, any> = { page, perpage: perPage };
        if (search) params.search = search;
        const response = await axios.get(backendUrl + '/user/pastes', { params });
        this.pastes = response.data;
      } catch (error: any) {
        this._handleError(error);
      }
    },

    async get_pastes_total(search = '') {
      try {
        const params: Record<string, any> = {};
        if (search) params.search = search;
        const response = await axios.get(backendUrl + '/user/total-pastes', { params });
        this.totalPastes = response.data;
      } catch (error: any) {
        console.error('Error fetching total:', error);
      }
    },


    async delete_paste(id: number) {
      this.errorMessage = "";
      try {
        await axios.delete(backendUrl + `/pastes/${id}`);
      } catch (error: any) {
        this._handleError(error);
        throw error;
      }
    },

    async update_paste(id: number, payload: {
      title: string;
      main_text: string;
      access: string;
      expiration?: string | number | null;
      changeExpiration: boolean;
      image?: File | null;
      remove_image?: boolean;
    }) {
      this.errorMessage = "";
      try {
        const formData = new FormData();
        formData.append('title', payload.title);
        formData.append('main_text', payload.main_text);
        formData.append('access', payload.access);
        if (payload.changeExpiration) {
          formData.append('expiration', payload.expiration !== null && payload.expiration !== undefined ? String(payload.expiration) : '');
        }
        if (payload.image) {
          formData.append('image', payload.image);
        } else if (payload.remove_image) {
          formData.append('remove_image', '1');
        }

        const response = await axios.post(backendUrl + `/pastes/${id}/update`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
      } catch (error: any) {
        this._handleError(error);
        throw error;
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
