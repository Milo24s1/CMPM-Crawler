#!/usr/bin/env node

const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const readline = require('readline');
const selector = '.col-xs-12.col-sm-6.col-md-4 a[title="download"]';
const SEARCH_BY_PAGE = 1;
const SEARCH_BY_DATE = 2;

const getFileName = function (start,end,flag) {
    if(flag==1){
        return `page_${start}_to_page_${end}_url.txt`
    }
    else if(flag==2){
        return `${start}_to_${end}_url.txt`
    }
}
const extractLinksByDate = function(startDate,endDate,page){
    let getOptions = {
        url: 'http://fmderana.lk/jokes',
        headers: {'User-agent':'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:49.0) Gecko/20100101 Firefox/49.0'},
        jar: true,
        followAllRedirects: false,

    };

        if(page!=1){
            getOptions.url = `http://fmderana.lk/jokes/page/${page}`;
        }
        console.info('Crawling Page '+page);
        request.get(getOptions, (error, response, html) => {
            let isProceeding = false;
            const startDateObject = new Date(startDate);
            const endDateObject = new Date(endDate);
            const regex = /\d\d\d\d_\d\d_\d\d/g;

            if (!error) {
                const $ = cheerio.load(html);
                let urlString = $(selector).map(function(i, el) {

                    if(/\d\d\d\d_\d\d_\d\d/.test($(this).attr('href'))){
                        const currentDateObject = new Date($(this).attr('href').match(regex)[0]
                            .split("_").join("-"));

                        if(i==19){
                            //check whether last element is within the date range, if it's behind proceed,
                            if(currentDateObject >= endDateObject ){
                                isProceeding = true;
                            }
                        }

                        if(startDateObject >= currentDateObject && currentDateObject >= endDateObject){
                            return $(this).attr('href');
                        }

                    }
                    return '';

                }).get().join('\n').trim();

                fs.appendFile(getFileName(startDate,endDate,SEARCH_BY_DATE), urlString+'\n', 'utf8', () => {
                    console.log('Data Saved');

                });

                if(isProceeding){
                    extractLinksByDate(startDate,endDate,Number(page)+1);
                }

            }
            else {
                console.log(`Fail to Crawl`);
                console.log(error);

            }
        });
};

const extractLinksByPageNumber = function(startPage,endPage){
    let getOptions = {
        url: 'http://fmderana.lk/jokes',
        headers: {'User-agent':'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:49.0) Gecko/20100101 Firefox/49.0'},
        jar: true,
        followAllRedirects: false,

    };
    let currentPage = startPage;

    while (currentPage<=endPage){

        if(currentPage!=1){
            getOptions.url = `http://fmderana.lk/jokes/page/${currentPage}`;
        }
        request.get(getOptions, (error, response, html) => {

            if (!error) {
                const $ = cheerio.load(html);
                let urlString = $(selector).map(function(i, el) {
                    return $(this).attr('href');
                }).get().join('\n');

                fs.appendFile(getFileName(startPage,endPage,SEARCH_BY_PAGE), urlString+'\n', 'utf8', () => {
                    console.log('Data Saved');

                });

            }
            else {
                console.log(`Fail to Crawl`);
                console.log(error);

            }
        });
        console.log(`Crawling Page ${currentPage}`);
        currentPage++;
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
            console.log('Extracting Links By Date (Descending order)');
            rl.question('Starting Date ?\n',(start)=>{
                if(/\d\d\d\d-\d\d-\d\d/.test(start)){
                    rl.question('Ending Date ?\n',(end)=>{
                        extractLinksByDate(start,end,1);
                        rl.close();
                    });
                }
                else {
                    console.log('Please Enter valid date format (YYYY-MM-DD)');
                    rl.close();
                }
            })
        }else {
            console.log('Please select a valid option');
            rl.close();
        }


    });
};

readUserInput();