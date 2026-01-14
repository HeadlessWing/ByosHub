import fs from 'fs';
import pngToIco from 'png-to-ico';

pngToIco('public/icon.png')
    .then(buf => {
        fs.writeFileSync('public/icon.ico', buf);
        console.log('Successfully generated public/icon.ico');
    })
    .catch(err => {
        console.error('Error generating ICO:', err);
        process.exit(1);
    });
