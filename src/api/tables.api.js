import httpClient from './httpClient';

const list_tables = (projectId) => {
    let url = `/api/projects/${projectId}/tables/`;
    return httpClient.get(url);
};

export default {
    list_tables
};