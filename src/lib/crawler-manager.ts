import {Crawler} from './clawler';

export class CrawlerManager{
    private sites : any[];
    private crawlers: Crawler[] = [];
    constructor(sites:any[]){
        this.sites = sites;
    }

    run(){
        this.crawlers = this.sites.map(site=>{
            return  new Crawler(site);
        })
        console.log('crawlers:',this.crawlers);
        for(let crawler of this.crawlers){
            crawler.crawl()
        }
    }

    crawl(crawler:Crawler){
        crawler.crawl();
    }   
}