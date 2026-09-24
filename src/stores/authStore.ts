import { defineStore } from 'pinia';
import axios, { AxiosError } from 'axios';

const backendUrl = import.meta.env.VITE_API_URL;

type LoginCredentials = {
  email: string;
  password: string;
};

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: false,
    errorMessage: null,
    errorCode: 0,
    pendingSignup: null as LoginCredentials | null,
  }),
  actions: {
    async login(credentials: LoginCredentials) {
      this.errorMessage = null;
      this.pendingSignup = null;
      try{
        const response = await axios.post(backendUrl + '/login', credentials);
        this.token = response.data.token;
        this.user = response.data.user;
        this.isAuthenticated = true;
        localStorage.setItem('token', response.data.token);
      } catch (error: any) {
        if(error.response){
          if(error.response.data.reason === 'no_account'){
            this.pendingSignup = credentials;
            this.errorMessage = null;
          } else {
            this.errorMessage = error.response.data.message;
          }
          console.log(error);
        }
        else if(error.request){
          this.errorMessage = error.message;
          console.log(error);
        }
        else{
          console.log(error);
        }
      }
    },
    async register(){
      if(!this.pendingSignup) return;
      this.errorMessage = null;
      try{
        const response = await axios.post(backendUrl + '/register', this.pendingSignup);
        this.token = response.data.token;
        this.user = response.data.user;
        this.isAuthenticated = true;
        this.pendingSignup = null;
        localStorage.setItem('token', response.data.token);
      } catch (error: any) {
        if(error.response){
          this.errorMessage = error.response.data.message;
          console.log(error);
        }
        else if(error.request){
          this.errorMessage = error.message;
          console.log(error);
        }
        else{
          console.log(error);
        }
      }
    },
    cancelSignup(){
      this.pendingSignup = null;
    },
    async getUser(){
      this.errorMessage = null;
      try{
        const response = await axios.get(backendUrl + '/user', {
          headers: {
            Authorization : 'Bearer ' + this.token
          }
        });
        this.user = response.data;
      } catch(error: any){
        if(error.response){
          this.errorMessage = error.response.data.message;
          console.log(error);
        }
        else if(error.request){
          this.errorMessage = error.message;
          console.log(error);
        }
        else{
          console.log(error);
        }
      }
    },
    async logout(){
      try{
        const response = await axios.get(backendUrl + '/logout', {
          headers: {
            Authorization: 'Bearer ' + this.token
          }
        });
        this.errorCode = response.data.code;
        this.errorMessage = response.data.message;
        this.token = null;
        this.user = null;
        this.isAuthenticated = false;
        localStorage.removeItem('token');
      } catch (error: any) {
        if(error.response){
          this.errorCode = 1;
          this.errorMessage = error.response.data.message;
          console.log(error);
        }
        else if(error.request){
          this.errorCode = 2;
          this.errorMessage = error.message;
          console.log(error);
        }
        else{
          this.errorCode = 3;
          console.log(error);
        }
      }
    }
  }

})
