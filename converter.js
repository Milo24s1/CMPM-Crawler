const  request = require('request');


function polling(jobID) {
    const getOptions = {
        'url':`https://www.online-convert.com/jobinfo?job_id=${jobID}`,
        'headers':{
            'Host': 'www.online-convert.com',
            'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:61.0) Gecko/20100101 Firefox/61.0',
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Accept-Language': 'en-GB,en;q=0.5',
            'Referer': `https://www.online-convert.com/result/${jobID}`,
            'X-Requested-With': 'XMLHttpRequest',
            'Connection': 'keep-alive',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache'
        },
        'jar': true,
        'json': true,
        'followAllRedirects': false

    };

    return new Promise((resolve,reject) => {
        request(getOptions,(err,response,body)=>{
            resolve(body);
        });
    });


}

async function convert(externalURL) {
    const postOption = {
        url:'https://www.online-convert.com/formconvert',
        jar: true,
        json: true,
        followAllRedirects: false,
        headers: {Host: 'www.online-convert.com',
            'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:61.0) Gecko/20100101 Firefox/61.0',
            'Accept':'*/*',
            'Accept-Language': 'en-GB,en;q=0.5',
            // 'Accept-Encoding': 'gzip, deflate, br',
            'Referer': 'https://audio.online-convert.com/convert-to-mp3',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Content-Length': 279,
            'Origin': 'https://audio.online-convert.com',
            'Connection': 'keep-alive',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache',
            'DNT': 1},
        form:{
            'audio_bitrate':0,
            'audio_vbr':100,
            'category':'audio',
            'channels':'',
            'end':'',
            'external_url':externalURL,
            'frequency':0,
            'save_settings_name':'',
            'start':'',
            'string_method':'convert-to-mp3',
            'target':'mp3',
            'upload_token':''
        },
    };
    request.post(postOption,(err,response,body)=>{

        if(!err){
            const jobID = body.job_id;
            console.log(job_id);
            let status = 'processing';
            while (status != 'processing'){
                pollingResponse = await polling(jobID);
                status = pollingResponse.status;
            }

            const convertedURL =  body.output[0].uri;
            return convertedURL;

        }
        else {
            console.log('converting is not succesful');
            console.log(err);
        }

    });

}


const externalURL = 'http://fmderana.lk/content/video/programMp3/Rata_Giyoth_Goda_Chooty_Malli_Podi_Malli_2018_08_08.mp3';
convert(externalURL);


