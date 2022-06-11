import fs from 'fs';
import path from 'path';

const root_dir = process.cwd();
const write_dir = path.join(root_dir,'src/data');

export function writeToDisk(name:string,content:any){
    const json_content = JSON.stringify(content);
    const filename = `${name}_${new Date().toJSON()}.json`;
    const write_path = path.join(write_dir,name);
    if(!fs.existsSync(write_path)){
        fs.mkdir(write_path,(error)=>{
            if(error) {
                console.log("Couldn't create folder",error);
                return;
            }
        })
    }
    fs.writeFileSync(path.join(write_path,filename),json_content);
}

export function writeManyToDisk(name:string,contents:any[]){
    contents.forEach(content=>{
        writeToDisk(name,content);
    });
}

