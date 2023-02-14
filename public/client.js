// dom
const title = document.getElementById('title');
const url = document.getElementById('urlGet');

const urlNew = document.getElementById('urlRecieve');
const submit = document.getElementById('submit')

//const baseURL = 'http://localhost:3000/'
const endPoint = '/generate'

// when submit is clicked
async function submitted(event) {
    if (title.value && url.value) {
        // get request
        const p = await fetch(endPoint, {
            method: 'GET',
            headers: {
                'title': title.value,
                'url': url.value
            }
        })
        const receieved = await p.text();
        urlNew.value = receieved
    }
}


submit.addEventListener('click',submitted)