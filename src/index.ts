import {loadSites} from './lib/sites-loader';
import {CrawlerManager} from './lib/crawler-manager';

function init(){
    //TODO init database connection,
    //load sites
    const sites = loadSites();
    const crawlerManager = new CrawlerManager(sites);
    crawlerManager.run();
}

init();