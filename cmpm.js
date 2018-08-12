const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const readline = require('readline');
const selector = '.col-xs-12.col-sm-6.col-md-4 a[title="download"]';

const extractLinksByPageNumber = function(startPage,endPage){
    let getOptions = {
        url: 'http://fmderana.lk/jokes',
        headers: {'User-agent':'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:49.0) Gecko/20100101 Firefox/49.0'},
        jar: true,
        followAllRedirects: false,

    };
    while (startPage<=endPage){

        if(startPage!=1){
            getOptions.url = `http://fmderana.lk/jokes/page/${startPage}`;
        }
        request.get(getOptions, (error, response, html) => {

            if (!error) {
                const $ = cheerio.load(html);
                let urlString = $(selector).map(function(i, el) {
                    return $(this).attr('href');
                }).get().join('\n');

                fs.appendFile('url.txt', urlString, 'utf8', () => {
                    console.log('Data Saved');

                });

            }
            else {
                console.log(`Fail to Crawl`);
                console.log(error);

            }
        });
        console.log(`Crawling Page ${startPage}`);
        startPage++;
    }
};

const readUserInput = function () {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('How do you want Extract links? \n 1. By Page Number\n 2. By Date\n Enter your choice? (1/2)\n', (answer) => {

        if(answer==1){
            console.log('Extracting Links By Page number');
            rl.question('Starting Page ?\n',(start)=>{
                if(start>0){
                    rl.question('Ending Page ?\n',(end)=>{
                        extractLinksByPageNumber(start,end);
                        rl.close();
                    });
                }
                else {
                    console.log('Please Enter valid start page number');
                    rl.close();
                }
            })
        }else if(answer==2){
            console.log('Sorry \nThis method is not supported yet');
            rl.close();
        }else {
            console.log('Please select a valid option');
            rl.close();
        }


    });
};

readUserInput();