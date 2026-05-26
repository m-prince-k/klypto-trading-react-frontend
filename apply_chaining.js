const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const dirs = [
  'c:/Users/Admin/Documents/klypto-trading-react-frontend/src/components/dashboard',
  'c:/Users/Admin/Documents/klypto-trading-react-frontend/src/pages/CryptoEdgeDashboard'
];

let files = [];
dirs.forEach(d => files = files.concat(walk(d)));

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;

  // Add ?. to data.prop
  content = content.replace(/\bdata\.(?!map|filter|forEach|reduce|length|keys|values|entries)([a-zA-Z0-9_]+)/g, 'data?.$1');
  
  // Add ?. to sentimentData.prop
  content = content.replace(/\bsentimentData\.(?!map|filter|forEach|reduce|length|keys|values|entries)([a-zA-Z0-9_]+)/g, 'sentimentData?.$1');

  // Add ?. to res.data
  content = content.replace(/\bres\.data/g, 'res?.data');

  // Handle nested chaining up to 3 levels deep (e.g. data?.news.distribution -> data?.news?.distribution)
  content = content.replace(/\b(data\?\.[a-zA-Z0-9_]+)\.(?!map|filter|forEach|reduce|length)([a-zA-Z0-9_]+)/g, '$1?.$2');
  content = content.replace(/\b(data\?\.[a-zA-Z0-9_]+\?\.[a-zA-Z0-9_]+)\.(?!map|filter|forEach|reduce|length)([a-zA-Z0-9_]+)/g, '$1?.$2');
  content = content.replace(/\b(data\?\.[a-zA-Z0-9_]+\?\.[a-zA-Z0-9_]+\?\.[a-zA-Z0-9_]+)\.(?!map|filter|forEach|reduce|length)([a-zA-Z0-9_]+)/g, '$1?.$2');
  
  // Do the same for sentimentData nesting
  content = content.replace(/\b(sentimentData\?\.[a-zA-Z0-9_]+)\.(?!map|filter|forEach|reduce|length)([a-zA-Z0-9_]+)/g, '$1?.$2');
  content = content.replace(/\b(sentimentData\?\.[a-zA-Z0-9_]+\?\.[a-zA-Z0-9_]+)\.(?!map|filter|forEach|reduce|length)([a-zA-Z0-9_]+)/g, '$1?.$2');


  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
    console.log('Updated', f);
  }
});
console.log('Done!');
