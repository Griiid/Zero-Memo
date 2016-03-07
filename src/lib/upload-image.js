const CLIENT_ID = 'f2c48785e9ed652';

export default function uploadImage(image) {
    return new Promise(function(resolve, reject) {
        if (typeof image == 'string' && image.startsWith('data:')) {
            image = image.slice(image.indexOf(',') + 1);
        }

        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://api.imgur.com/3/image.json');
        xhr.responseType = 'json';
        xhr.setRequestHeader('Authorization', `Client-ID ${ CLIENT_ID }`);

        xhr.onload = _ => xhr.response.success ?
            resolve(xhr.response.data.link) :
            reject(new Error(xhr.response.data.error));

        xhr.onerror = reject;
        
        const data = new FormData();
        data.append('image', image);
        xhr.send(data);
    });
}
