'use strict';

const https = require('https');
const fs = require('fs');

const fields = {
  district: {
    eng: 'District',
    chi: '地區'
  },
  building: {
    eng: 'Building name',
    chi: '大廈名單'
  },
  date: {
    eng: 'Last date of residence of the case(s)',
    chi: '最後個案居住日期'
  },
  cases: {
    eng: 'Related probable/confirmed cases',
    chi: '相關疑似/確診個案'
  }
};

grabGovData();

/**
 * Download data from gov
 */
async function grabGovData() {
  try {

    const result = {};

    for (let locale of ['eng', 'chi']) {
      const data = await requestPromise({ 
        hostname: 'api.data.gov.hk', 
        port: 443, 
        path: `/v2/filter?q=%7B%22resource%22%3A%22http%3A%2F%2Fwww.chp.gov.hk%2Ffiles%2Fmisc%2Fbuilding_list_${locale}.csv%22%2C%22section%22%3A1%2C%22format%22%3A%22json%22%7D`, 
        method: 'GET' 
      });

      result[locale] = JSON.parse(data).map(item => {
        return {
          district: item[fields.district[locale]],
          building: item[fields.building[locale]],
          date:     item[fields.date[locale]],
          cases:    item[fields.cases[locale]]
        };
      });
    }

    await saveFilePromise('var GOV_DATA = ' + JSON.stringify(result), `./gov_data.js`);

  } catch(error) {
    console.error(error);
  }
}

/**
 * Save string content to a file
 * @param {*} fileContent 
 * @param {*} filePath 
 */
function saveFilePromise(fileContent, filePath) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, fileContent, (err) => {
      if (err) {
        reject(err);
      }
      resolve(true);
    });
  });
}

/**
 * Make a simple https request
 * @param {*} reqOptions 
 */
function requestPromise(reqOptions) {
  return new Promise((resolve, reject) => {
    https.request(reqOptions, res => {
      let body = '';
      res.on('data', (chunk) => (body += chunk.toString()));
      res.on('error', reject);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode <= 299) {
          resolve(body);
        } else {
          reject('Request failed. status: ' + res.statusCode + ', body: ' + body);
        }
      });

    })
    .on('error', reject)
    .end();
  });
}
