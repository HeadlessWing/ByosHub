import fs from 'fs';
import path from 'path';
import pngToIco from 'png-to-ico';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputPath = path.join(__dirname, '../public/icon.png');
const outputPath = path.join(__dirname, '../public/icon.ico');

console.log(`Reading PNG from: ${inputPath}`);

try {
    const buffer = fs.readFileSync(inputPath);
    console.log(`Read ${buffer.length} bytes.`);

    pngToIco(buffer)
        .then(icoBuffer => {
            fs.writeFileSync(outputPath, icoBuffer);
            console.log(`Successfully generated ICO at: ${outputPath}`);
        })
        .catch(err => {
            console.error('Error converting to ICO:', err);
            process.exit(1);
        });

} catch (err) {
    console.error('Error reading input file:', err);
    process.exit(1);
}
