const parser = require('fast-xml-parser');
const fs = require('fs');
const xmlData = fs.readFileSync('./XmlDataDarkAngels.xml', 'utf-8');
const he = require('he');

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
    parseTrueNumberOnly: true,
    attrValueProcessor: a => he.decode(a, {isAttributeValue: true}),//default is a=>a
    tagValueProcessor : a => he.decode(a) //default is a=>a
}));