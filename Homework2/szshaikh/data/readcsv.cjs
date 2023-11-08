
const fs = require('fs');
const csvFilePath = 'mxmh_survey_results.csv'; // Replace this with the path to your CSV file
const jsonFilePath = 'mentalH.json'; // Replace this with the desired output JSON file path

const csvtojson = require('csvtojson');

csvtojson()
  .fromFile(csvFilePath)
  .then((jsonArrayObj) => {
    // Convert the array of objects to a JSON string
    const jsonString = JSON.stringify(jsonArrayObj, null, 2);

    // Write the JSON string to a file
    fs.writeFile(jsonFilePath, jsonString, (err) => {
      if (err) {
        console.error('Error writing JSON file:', err);
      } else {
        console.log('JSON file has been created successfully!');
      }
    });
  })
  .catch((err) => {
    console.error('Error converting CSV to JSON:', err);
  });
