import axios from 'axios';

const httpClient = axios.create({
    baseURL: process.env.VUE_APP_BASE_URL,
    timeout: 5000, // indicates, 1000ms ie. 1 second
    headers: {
        "Content-Type": "application/json",
    }
});

httpClient.getBaseURL = ()=>{
    return process.env.VUE_APP_BASE_URL;
}

// interceptor to catch errors
const errorInterceptor = error => {
    // all the error responses
    switch(error.response.status) {
        case 400:
            console.error(error.response.status, error.message);
            break;

        default:
            console.error(error.response.status, error.message);
    }
    return Promise.reject(error);
}

// Interceptor for responses
const responseInterceptor = response => {
    switch(response.status) {
        case 200: 
            // yay!
            break;
        // any other cases
        default:
            // default case
    }

    return response;
}

httpClient.interceptors.response.use(responseInterceptor, errorInterceptor);

export default httpClient;