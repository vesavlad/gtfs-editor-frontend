import httpClient from './httpClient';

const BaseAPI = class {
    constructor(table) {
        this.base_end_point = '/api';
        this.end_point = `${this.base_end_point}/projects/`;
        this.table = table;
    }
    getBaseURL(projectId) {
        return `${this.end_point}${projectId}/${this.table}/`
    }
    getFullBaseURL(projectId){
        return httpClient.getBaseURL()+this.getBaseURL(projectId);
    }
    getDetailURL(projectId, id) {
        return `${this.getBaseURL(projectId)}${id}/`
    }
    getFullDetailURL(projectId, id) {
        return httpClient.getBaseURL()+this.getDetailURL(projectId, id);
    }
    getAll(projectId){
        return httpClient.get(this.getBaseURL(projectId), {
            params: {
                no_page: "True"
            },
            timeout: 0,
        });
    }
    detail(projectId, id){
        return httpClient.get(this.getDetailURL(projectId, id));
    }
    update(projectId, data) {
        return httpClient.patch(this.getDetailURL(projectId, data.id), data);
    }
    put(projectId, data) {
        return httpClient.put(this.getDetailURL(projectId, data.id), data);
    }
    create(projectId, data){
        return httpClient.post(this.getBaseURL(projectId), data);
    }
    remove(projectId, data){
        return httpClient.delete(this.getDetailURL(projectId, data.id));
    }
    getDownloadURL(projectId){
        return this.getFullDetailURL(projectId, 'download')
    }
    uploadCSV (projectId, file) {
        return httpClient.put(this.getDetailURL(projectId, 'upload'), file, {
            headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${this.table}.txt";`,
            }
        })
    }
    getIDs (projectId) {
        return httpClient.get(this.getDetailURL(projectId, 'ids'))
    }
}

export default {
    BaseAPI,
}