import axios from 'axios';

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
const API_APP = process.env.REACT_APP_URL;

export default function api(customConfig = {}) {
    return axios.create({
        baseURL: API_ENDPOINT,
        withCredentials: true,
        ...customConfig,
    });
}

export default function authApi() {
    return axios.create({
        baseURL: API_APP,
        withCredentials: true
    });
}