export const formatTimestamp = (timestamp) => {
    if (!timestamp) return '—';

    try {
        const date = new Date(timestamp);

        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    } catch (error) {
        return timestamp;
    }
};