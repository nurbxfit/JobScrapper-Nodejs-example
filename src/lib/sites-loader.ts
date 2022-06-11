import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const sitesDir = path.join(rootDir,'src/sites');

export function getSitesFilename(){
    console.log('root_dir:',rootDir);
    console.log('sitesDir:',sitesDir);
    return fs.readdirSync(sitesDir);
}

export function loadSite(filename:string){
    const filePath = path.join(sitesDir,filename)
    const file = fs.readFileSync(filePath,'utf-8');
    return file;
}

export function loadSitesData(filename: string){
   const file = loadSite(filename);
   //parse to json
   return JSON.parse(file);
}

export function loadSites(){
    const sites = getSitesFilename();
    return sites.map((site)=> loadSitesData(site));
}