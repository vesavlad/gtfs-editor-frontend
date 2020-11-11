import httpClient from './httpClient';

const BaseAPI = class {
    constructor(table) {
        this.base_end_point = '/api';
        this.end_point = `${this.base_end_point}/projects/`;
        this.table = table;
    }
    getBaseURL(projectid) {
        return `${this.end_point}${projectid}/${this.table}/`
    }
    getFullBaseURL(projectid){
        return httpClient.getBaseURL()+this.getBaseURL(projectid);
    }
    getDetailURL(projectid, id) {
        return `${this.getBaseURL(projectid)}${id}/`
    }
    getFullDetailURL(projectid, id) {
        return httpClient.getBaseURL()+this.getDetailURL(projectid, id);
    }
    getAll(projectid){
        return httpClient.get(this.getBaseURL(projectid));
    }
    update(projectid, data) {
        return httpClient.patch(this.getDetailURL(projectid, data.id), data);
    }
    create(projectid, data){
        return httpClient.post(this.getBaseURL(projectid), data);
    }
    remove(projectid, data){
        return httpClient.delete(this.getDetailURL(projectid, data.id));
    }
    getDownloadURL(projectid){
        return this.getFullDetailURL(projectid, 'download')
    }
    uploadCSV (projectid, file) {
        return httpClient.put(this.getDetailURL(projectid, 'upload'), file, {
            headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${this.table}.txt";`,
            }
        })
    }
    getIDs (projectid) {
        return httpClient.get(this.getDetailURL(projectid, 'ids'))
    }
}

export default {
    BaseAPI,
}