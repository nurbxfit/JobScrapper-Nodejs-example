import { Scrapper } from "./scrapper";
import { writeToDisk } from "./data-writer";

export class Crawler {
    private site: any; /*TODO type interface for site*/
    // running : boolean = false;
    scrapper: Scrapper;
    constructor(site:any){
        this.site = site;
        this.scrapper = new Scrapper(site.headless);
    }

    async getTotalPage(url:string) : Promise<number> {
        const {pagination} = this.site.search;
        const {param,initial,limit} = pagination.attrs;

        let initial_url = url;        
        initial_url = initial_url + param + initial;
        
        const result_selector = this.site.crawl.selectors.filter((selector:any)=> selector['field_name'] == 'result')[0];
        const total = await this.scrapper.select(result_selector,initial_url);
        return Math.ceil(total/limit) 
    }

    async getPageContentURLs(pagination_url: string): Promise<string[]>{
        const content_selector = this.site.crawl.selectors.filter((selector:any)=> selector['field_name']== 'content_url')[0];
        return this.scrapper.select(content_selector,pagination_url);
    }

    async paginateNextQuery(page:number){
        const {base_url,search} = this.site;
        const {pagination} = search;
        let next_url = `${base_url}${search.url}`;
        return next_url = next_url + pagination.attrs.param + page;
    }

    async paginateNextSelector(initial_url:string){
        const {pagination} = this.site.search;
        const next_selector =  pagination.selector;
        const next_url = await this.scrapper.select(next_selector,initial_url);
        return next_url;
    }

    async crawl(){
        const {base_url,search} = this.site;
        const {pagination} = search;
        let initial_url = `${base_url}${search.url}`;
        const total_page =  await this.getTotalPage(initial_url);
        console.log('Total_page:',total_page);
        //scape current page,
        const {initial,incremental} = pagination.attrs;
        for(let i = initial; i < total_page;){
            console.log('current_page:',i);
            let current_page_url = initial_url;
            
            if(pagination.type == 'query'){
                current_page_url = await this.paginateNextQuery(i);
            }else {
                current_page_url = await this.paginateNextSelector(current_page_url);
            }

            //next, we scra[e current page],
            const contents = await this.scrapeCurrentPage(current_page_url);
            
            // we save our scrapped 
            writeToDisk(this.site.name,contents);
            i+= incremental;


        }
    }

    async scrapeCurrentPage(page_url:string){
        const scrapeSelectors = this.site.scrape.selectors;

        const content_urls = await this.getPageContentURLs(page_url);
        const contents = await content_urls.map(async (url:string)=>{
            let content_url = this.site.base_url + '/' + url;
            console.log('Content_url:',content_url);
            const content = await this.scrapper.scrapeContent(scrapeSelectors,content_url);
            let data = {
                site_name: this.site.name,
                site_url: this.site.base_url,
                ...content
            }
            return data;
        })
        const scraped_content = await Promise.all(contents);
        // console.log('Scraped_Contents:',scraped_content);
        return scraped_content;
    }

}