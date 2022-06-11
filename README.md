
# About
This is a simple example of web scraping using Node.js. This node script, make use of [cheerio](https://cheerio.js.org/) and [puppeteer](https://pptr.dev/).
This script, use a json file in `src/sites` to scrape. The json file, contains some information about the sites that going to be scrape, such as the selector and URL.

# Running this script
- clone the repo
```
git clone https://github.com/nurbxfit/JobScrapper-Nodejs-example.git
```
- cd into the directory and install dependencies
```
cd JobScrapper-Nodejs-example && npm install
```
- because this script is in Typescript, we need to build it
```
npm run start:build
```
- then we can start it
```
npm start
```

# The json file content. 
In this example, I use this script to scrape a Job-board website `mystarjob.com`.
- We use the `name` attribute to create a folder for our data.
- `headless` attributes if set to false, will open `puppeteer` browser when we run the script.
- `search` is used to construct starting page url where we want to crawl,
- `search.pagination` contains pagination information we to go to next page.
- `crawl` contains selector we will use to crawl for content's URLs in the list page.
- `scrape` contains selector we will use to scrape the detail content page.
## Selector
The selector contains:
- `field_name`, this will be use to create key name, and the value will be from the `query`.
- `query`, this is a querySelector to select html element using `cheerio`.
- `method`, this is a cheerio method used to extract the element  text content.
- `regex` (optional), we use regex to refine our text content.

```json
{
    "name":"my_starjob",
    "headless": true,
    "base_url":"http://mystarjob.com",
    "search" : {
        "url" : "/search/default.aspx?a=&i=-1&sb=-1&stb=1&std=2&f=-1&c=-1&s=-1&jt=-1&jl=-1&fw=&jf=&jb=&rs=-1",
        "pagination" : {
            "type": "query",
            "attrs": {
                "param": "&p=",
                "initial": 1,
                "incremental": 1,
                "limit": 10
            }
        }
        
    },
    "crawl": {
        "selectors":[
            {
                "field_name": "result",
                "query" : "div[class=\"resultDisplay\"] > p",
                "method" : ".text()",
                "regex" : "(?<=\\bof )\\d+"
            }, 
            {
                "field_name": "content_url",
                "query": "h2[class=\"titleL\"] > a",
                "method": ".map((i,e)=> $(e).attr(\"href\")).get()"
            }
        ]
    },
    "scrape" : {
        "selectors": [
            {
                "field_name" : "job_title",
                "query": "h1[class=\"jobsTitle\"]",
                "method" : ".text()"
            },
            {
                "field_name" : "company",
                "query": "h2[class=\"company\"]",
                "method" : ".text().trim()"
            },
            {
                "field_name" : "date_posted",
                "query": "p[class=\"date\"]",
                "method" : ".text()",
                "regex" : "(?<=^Posted\\son\\s)\\d.+$"
            },
            {
                "field_name" : "job_description",
                "query": "div[class=\"jobsDesc\"]",
                "method" : ".toString()"  
            }
        ]
    }
}
```

Using above json file, will produce the following data
```json
{
    "site_name": "my_starjob",
    "site_url": "http://mystarjob.com",
    "content_url": "http://mystarjob.com/../job/default.aspx?pid=103047",
    "content": {
      "job_title": "Bus Captain",
      "company": "GMP Recruitment Services (S) Pte Ltd",
      "date_posted": "9 Jun 2022",
      "job_description": "<div class=\"jobsDesc\">\n                   <h1 class=\"titleM\">Job Description</h1>\n\t\t\t\t    <a href=\"mailto:Jessica.Pan@gmprecruit.com\">Jessica.Pan@gmprecruit.com</a>Make a Difference Everyday<br>\nJoin us as a Bus Captain/ Technician/Assistant Station Manager/ Customer Service Officers<br>\nBus Captain<br>\n<br>\nResponsibilities:\n<ul>\n\t<li>Provides a safe and pleasant journey to the passengers</li>\n\t<li>Maintain the bus well</li>\n</ul>\nRequirements:\n\n<ul>\n\t<li>Minimum Secondary 2 education/ WPL Level 3 or equivalent.</li>\n\t<li>Valid Class 3/4 driving licence with a minimum of one year driving experience.</li>\n</ul>\n<br>\n​Walk in interview:<br>\n11 June 2022<br>\n9.30am to 5.00pm<br>\nHatten Hotel Melaka<br>\nMarco Polo 1, Level 22<br>\nJalan Merdeka, Bandar Hilir,75000 Melaka, Malaysia<br>\n<br>\nSTEADY INCOME<br>\nCONTINUAL TRAINING<br>\nEXTENSIVE MEDICAL BENEFITS<br>\n&nbsp;<br>\nPlease WhatsApp +6584503157 (Winn) / +60123857848 (Jess)<br>\nEmail: Jessica.Pan@gmprecruit.com<br>\n………………………………………………………………………………………………………….<br>\nCompany Name: GMP Recruitment Services (S) Pte Ltd<br>\nAddress: 1 Finlayson Green, #10-00 One Finlayson Green, Singapore 049246<br>\n&nbsp;\n                </div>"
    }
},
```