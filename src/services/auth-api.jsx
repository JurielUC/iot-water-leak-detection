import api, { authApi } from './api';

const getCsrfToken = async () => {
    await authApi().get('sanctum/csrf-cookie', { withCredentials: true });
};

export const postLogin = async ({ data }) => {
    await getCsrfToken();

    const instance = api();

    return instance.post('login', data);
};

export const postRegister = async ({ data }) => {
    await getCsrfToken();

    const instance = api();

    return instance.post('register', data);
};