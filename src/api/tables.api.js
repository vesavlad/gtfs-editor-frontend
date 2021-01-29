import httpClient from './httpClient';

const list_tables = (projectid) => {
    let url = `/api/projects/${projectid}/tables/`;
    return httpClient.get(url);
};

export default {
    list_tables
};