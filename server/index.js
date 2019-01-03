const express = require('express');
const app = express();
const port = 3001;
const bodyParser = require('body-parser')
const multer = require('multer');
const multerUpload = multer();
const yauzl = require('yauzl')

app.use(bodyParser.json());

app.put('/rosz_to_xml', multerUpload.any(), async (req, res) => {
    // Validate mime-type application/octet-stream
    // Validate encoding 7bit?
    // Set maximum of files to be treated, avoid someone uploading 10,000 1GB files
    // console.log(req.files)

    // If no file, or more than one file was uploaded, return a 422
    if (req.files.length === 0 || req.files.length > 1) {
        res.status(422).send();
        return;
    }

    // Unzip the file buffer
    yauzl.fromBuffer(req.files[0].buffer, {}, (err, zipfile) => {
        // If unzipping failed, return a 422
        if (err !== null) {
            res.status(422).send();
            return;
        }

        // Handle errors here
        zipfile.on('entry', entry => {
            console.log(entry)
            // Validate the contents of the zipfile?
            zipfile.openReadStream(entry, (err, readStream)=> {
                if (err) {
                    res.status(422).send();
                    return;
                }

                // readStream.on('end', function(){console.log(123,arguments)});

                let fileContents = '';
                readStream.setEncoding('utf8');
                readStream.on('readable', function(){
                    const chunk = readStream.read();

                    if (chunk !== null) {
                        fileContents += chunk;
                    }
                }).on('end', function(){
                    res.send(fileContents);
                    return;
                })
            })
        });
    });
});

app.listen(port, () => console.log(`Express listening on port ${port}`))