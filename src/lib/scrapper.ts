import puppeteer from "puppeteer";
import cheerio from "cheerio";

type Selector = {
    field_name: string;
    query: string;
    method: string;
    regex: string;
}

type Selectors = Selector [];

export class Scrapper {
    private remoteDebugAddr : string = '';
    private remoteDebugPort: string = '';
    private headless: boolean = false;
    private browser : any;

    constructor(isHeadless: boolean) {
        this.headless = isHeadless ?? true;
    }

    async startBrowser(){
        try{
            // if(!this.remoteDebugAddr) this.remoteDebugAddr = process.env.REMOTE_DEBUG_ADDR;
            // if(!this.remoteDebugPort) this.remoteDebugPort = process.env.REMOTE_DEBUG_PORT;
            
              const browser = await puppeteer.launch({
                headless: Boolean(this.headless),
                args: ['--incognito',
                      '--no-sandbox',
                      '--disable-setuid-sandbox',
                    //   `--remote-debugging-address=${this.remoteDebugAddr}`,
                    //   `--remote-debugging-port=${this.remoteDebugPort}`
                      ]
              });
              return browser
            //   this.wsEndpoint = await this.browser.wsEndpoint();
          }catch(error){
            console.error(error);
            return  null;
          }
    }

    async getHTML(URL:string): Promise<string>{
        console.log('Browsing:',URL);
        const browser = await this.startBrowser();
        let html :string = '';
        if(browser){
            try{
                const page = await browser.newPage();
                await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4272.0 Safari/537.36');
                await page.goto(URL,{waitUntil:"domcontentloaded"});
                html = await page.content();
            }catch(error){
                // throw error; 
                console.error('Get HTML Faild:',error);
            }finally{
                await browser.close();
            }
        }
        return html;

    }
    
    async select(selector:Selector,source_url:string){
        const page_html = await this.getHTML(source_url);
        console.log('selecting',selector);
        return await this.scrape(selector,page_html);
    }

    async scrape(selector:Selector,page_html:string){
        if(page_html !== null){
            const {query,method} = selector;
            const $ = cheerio.load(page_html);
            const sel = `return $('${query}')${method}`;
            // console.log('selector:',sel);

            const func = new Function('$',sel);
            const selected = await  func($);
            if(selected && selector.hasOwnProperty('regex')){
                const regex = new RegExp(selector.regex);
                const matched = regex.exec(selected) as string[];
                if(matched.length > 0){
                    return matched[0];
                }
                return null;
            }
            return selected;
        }
    }

    async scrapeContent(selectors:Selectors,source_url:string){
        const page_html = await this.getHTML(source_url);
        console.log('Scrapping:',source_url);
        if(page_html == null) return;
        let content : any = {};
        await selectors.map(async (selector:Selector)=> {
            content[selector.field_name] = await this.scrape(selector,page_html);
        });

        return {
            content_url: source_url,
            content,
        };
        
    }
}