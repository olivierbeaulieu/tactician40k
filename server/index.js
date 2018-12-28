const fs = require('fs');
const parser = require('fast-xml-parser');
const express = require('express');
const app = express();
const port = 3001;
const he = require('he');
const bodyParser = require('body-parser')

app.use(bodyParser.json());

const xmlData = fs.readFileSync('./server/XmlDataDarkAngels.xml', 'utf-8');
// const xmlData = fs.readFileSync('./server/XmlDataSpaceWolves.xml', 'utf-8');

console.log(parser.parse(xmlData, {
    attributeNamePrefix : "",
    // attrNodeName: "attributes", //default is 'false'
    // textNodeName : "#text",
    ignoreAttributes : false,
    ignoreNameSpace : true,
    allowBooleanAttributes : true,
    parseNodeValue : true,
    parseAttributeValue : true,
    trimValues: true,
    // cdataTagName: "__cdata", //default is 'false'
    // cdataPositionChar: "\\c",
    // localeRange: "", //To support non english character in tag/attribute values.
    arrayMode: true,
    parseTrueNumberOnly: false,
    attrValueProcessor: a => he.decode(a, {isAttributeValue: true}),//default is a=>a
    tagValueProcessor : a => he.decode(a) //default is a=>a
}));

app.post('/process_rosz', (req, res) => {
    console.log(req);
    return res.send('Hello World!');
});

app.post('/parser_rosz', (req, res) => {
    // res.setHeader('Content-Type', 'application/json');
    // res.json({ abc: 1 });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))