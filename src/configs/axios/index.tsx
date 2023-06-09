import axios, { AxiosHeaders, AxiosInstance } from 'axios';
import { TOKEN_KEY, firebaseAuth } from '../firebase';
const BASE_URL = "https://happypeer-api-onsheets.up.railway.app/v1/"
export const AxiosClient = axios.create({
    baseURL: BASE_URL,
});
export const SelfAxiosClient = axios.create({
    baseURL: "/api/",
});


AxiosClient.interceptors.response.use(
    (res) => res,
    (err) => {
        // const statusCode = err?.response?.status;
        // if (statusCode == 403 || statusCode == 401) {
        //     window.location.pathname = '/';
        // }
        // throw err;
        console.log(err)
    }
);

AxiosClient.interceptors.request.use((config) => {
    (config.headers as unknown as AxiosHeaders).set("pid","d2867dd401a7f8c7f66e79ef18c7756c")
    return config;
});
SelfAxiosClient.interceptors.request.use((config)=>{
    (config.headers as unknown as AxiosHeaders).set("authorization",localStorage.getItem(TOKEN_KEY));
    return config;
});