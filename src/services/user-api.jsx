import api from './api';

export const getUser = ({ id, user_id, token }) => {
    const instance = api({
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return instance.get(`user/${id}`, {
        params: {
            user_id: user_id,
        },
    });
};