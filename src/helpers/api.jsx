import axios from 'axios';

// var Production = false;
let baseurl = null;
// let imageUploadUrl = null;


if (window.location.hostname === "localhost"){
    baseurl = "http://localhost:8000/api/";
}else{
    baseurl = "http://thedecorshop.in/api/";
}






export function api(url, method, filters) {

    if (method === 'get'){
        var queryString = Object.keys(filters).map(key => key + '=' + filters[key]).join('&');
        url = url + '?' + queryString
        filters = {}
    }

    if (method === 'post-formdata'){
        method = 'post'
        var bodyFormData = new FormData();
        for (const key in filters) {
            let value = filters[key]
            bodyFormData.set(key, value);
        }
        filters = bodyFormData
    }
    
    return axios({
        method: method,
        baseURL: {
            baseurl
        }.baseurl,
        url: url,
        data: filters,
        config: {
            headers: {
                'Content-Type': 'text/plain'
            }
        }
    }).then(response => response.data)
}

export function fileHandlerApi(url,formData) {
    return axios({
        method: 'post',
        baseURL: {
            baseurl
        }.baseurl,
        url: url,
        data: formData,
        config: {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }
    }).then(response => {
        return response.data
    })
}
