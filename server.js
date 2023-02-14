// mongoose
import mongoose from 'mongoose'
import express from 'express'
import { nanoid } from 'nanoid'

const urlScehema = new mongoose.Schema({
    end_point: String,
    URL: String,
    time_added: Number
})

mongoose.set('strictQuery', true) // to supress the warning
mongoose.connect('mongodb+srv://client-299:special@cluster0.ksluvtc.mongodb.net/First?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const URL = mongoose.model('URLs', urlScehema)

const baseURL = process.env.BASE_URL && process.env.BASE_URL + '/' || 'http://localhost:3000/'

// an express app
const app = express()
const port = process.env.PORT || 3000

const deleteTime = 180;

function createAll_Endpoints() {
    URL.find({}, function (err, urls) {
        if (err) {
            console.log(err.message);
            return;            
        }
        if (urls.length < 1) { return }; // Code won't run any further
        urls.forEach(async (object) => {
            const current_time = new Date().getTime();
            // we'll create an endpoint now
            const endPoint = object.end_point; // stored end_point.
            const url = object.URL;

            console.log(current_time - object.time_added)
            const time_difference = (current_time-object.time_added)

            if (time_difference >=deleteTime*1000){
                // remove from the database
                console.log('Removing from the database')
                await URL.deleteOne({end_point: endPoint, URL: url, time_added: object.time_added})
            }
            else{
                const remaining_time = deleteTime*1000 - time_difference
                const n_D = new Date()
                const n_T = n_D.getTime();
                
                app.get(endPoint, (req, res) => {
                    const newD = new Date()
                    const newT = newD.getTime()

                    if ((newT - n_T) >= remaining_time) {
                        // remove from the database
                        URL.deleteOne({end_point: endPoint, URL: url, time_added: object.time_added});
                        res.status(404).send("404: Not found")
                        return;
                    }
                    res.redirect(url);
                })
            }
        })
    })
}

function initialize() {
    // run createAll_Endpoints function.
    createAll_Endpoints();
    app.use('/', express.static('public'))
    app.get('/generate', async (req, res) => {
        // wrapping this in try and catch
        const title = req.headers.title;
        let url = req.headers.url;

        if (!url.startsWith('https://') || !url.startsWith('http://')) {
            url = 'https://' + url
        }

        const newId = nanoid(5);

        const newURL = baseURL + encodeURI(title + newId)
        const endPoint = encodeURI('/' + title + newId); // encodes it!

        const new_date = new Date();
        const current_time = new_date.getTime();

        try {
            const newURL_OBJECT = new URL({
                end_point: endPoint,
                URL: url,
                time_added: current_time
            })

            await newURL_OBJECT.save();
        }
        catch (err) {
            if (err) {
                console.log(err.message)
            }
        }
        // we'll basically create a new endpoint now
        app.get(endPoint, (req, res) => {
            const nD = new Date()
            const nT = nD.getTime()

            if ((nT - current_time) >= deleteTime*1000){
                 // remove from the database 
                URL.deleteOne({end_point: endPoint, URL: url, time_added: current_time});
                res.status(404).send('404: Not Found')
                return;
            }
            res.redirect(url);
        })

        res.send(newURL);
    })

}

// init
initialize();

app.listen(port, () => {
    console.log(`Server's listening on ${port}`)
})