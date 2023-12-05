// Function to make api calls
const ApiHelper = (method: string, path: string, token: string | null, body: any, absolutePath?: boolean) => {
    const requestOptions: any = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        body,
    };

    if (method !== 'GET' && body !== null) {
        requestOptions.body = JSON.stringify(body);
    }

    if (token) {
        requestOptions.headers.Authorization = token;
    }

    return new Promise((resolve, reject) => {
        fetch(absolutePath ? path : `http://localhost:5005${path}`, requestOptions)
            .then((response) => {
                switch (response.status) {
                    case 200:
                        response.json().then((data) => {
                            resolve(data);
                        });
                        break;
                    case 400:
                        console.log('Response Error', response);
                        response.json().then((data) => {
                            console.log(data.error);
                            reject(data.error);
                        });
                        break;
                    case 401:
                        response.json().then((data) => {
                            reject(data.error);
                        });
                        break;
                    case 403:
                        response.json().then((data) => {
                            reject(data.error);
                        });
                        break;
                    case 409:
                        response.json().then((data) => {
                            reject(data.error);
                        });
                        break;
                    case 500:
                        response.json().then((data) => {
                            reject(data.error);
                        });
                        break;
                    default:
                        response.json().then((data) => {
                            reject(data.error);
                        });
                }
            })
    });
};

export default ApiHelper
