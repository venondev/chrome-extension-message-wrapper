const fs = require('fs');
const path = require('path');

const config = '../config';
const contentPath = 'src/content';
const entryConfig = require('../config/entryPoints.json');

const addNewContentScript = (name, config) => {
  const filePath = `${contentPath}/${name}.js`;
  if (fs.existsSync(filePath)) {
    console.log('File already exists. Aborting...');
  } else {
    const newEntryConfig = {
      ...entryConfig,
      [name]: filePath,
    };
    fs.writeFile(
      'config/entryPoints.json',
      JSON.stringify(newEntryConfig, undefined, 2),
      err => console.log(err),
    );
    fs.writeFile(filePath);
  }
};

addNewContentScript('test');
