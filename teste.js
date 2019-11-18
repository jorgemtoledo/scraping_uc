'use strict';

    //require NPM packages


    //I chose to use request to make the http calls because it is very easy to use.
    //This npm package also has recent updates, within the last 2 days.
    //Lastly it has a huge number of downloads, this means it has a solid reputation in the community
    var request = require('request');


    //I chose to use cheerio to write the jquery for our node scraper,
    //This package is very simple to use, and it was easy to write jQuery I was already familiar with,
    //Cheerio also makes it simple for us to work with HTML elements on the server.
    //Lastly, Cheerio is popular within the community, with continuous updates and a lot of downloads.
    var cheerio = require('cheerio');

    var rp = require('request-promise');

    var fs = require('fs');


    //I used the json2csv npm package because it was easy to implement into my code,
    //This module also has frequent updates and heavy download activity.
    //This is the most elegant package to download for simple translation of json objects to a CSV file format.
    var json2csv = require('json2csv');




    //Array for shirts JSON object for json2csv to write.
    var ShirtProps = [];
    var Counter = 0;
    var homeURL = "http://www.shirts4mike.com/";


    //start the scraper
    scraper()


    //Initial scrape of the home page, looking for shirts
    function scraper () {

      //use the datafolderexists function to check if data is a directory
      if (!DataFolderExists('data')) {
        fs.mkdir('data');
      }
      //initial request of the home url to find links that may have shirts in them

    rp(homeURL).then(function (html) {

    //use cheerio to load the HTML for scraping
    var $ = cheerio.load(html);
    //For every link with shirt in it iterate over the link and make a request.

    var elems = $("a[href*=shirt]").nextAll(), 
    var eachLength = elems.length;

    elems.each(function() {


        //request promise 
        rp('http://www.shirts4mike.com/' + $(this).attr("href")).then(function (html) {

            //pass the html into the shirt data creator, so if it wound up scraping individual shirts from any of the links it adds it to the data object
            var $ = cheerio.load(html);
            //if the add to cart input exists, log the data to the shirtprops arary.
            if ($('input[value="Add to Cart"]').length) {
              var ShirtURL = $(this).find('a').attr('href');
              var time = new Date();
              //json array for json2csv
              var ShirtData = {
                Title: $('title').html(),
                Price: $('.price').html(),
                ImageURL: $('img').attr('src'),
                URL: homeURL + ShirtURL,
                Time: time.toString() 
              };
                ShirtProps.push(ShirtData);
                console.log(ShirtData);
                Counter ++;
                if (eachLength == Counter ) {
                  FileWrite();
                };
            } else {
              //else we are on a products page, scrape those links for shirt data
                var InnerElm = $('ul.products li').nextAll(), 
                var innereachLength = InnerElm.length;
                var innercount= 0;
                InnerElm.each(function() {
                var ShirtURL = $(this).find('a').attr('href');
                    rp('http://www.shirts4mike.com/' + ShirtURL).then(function (html){
                      innercount++;
                    var $ = cheerio.load(html);
                    var time = new Date();
                    var ShirtData = {
                      Title: $('title').html(),
                      Price: $('.price').html(),
                      ImageURL: $('img').attr('src'),
                      Url: homeURL + ShirtURL,
                      Time: time.toString()
                    };
                    ShirtProps.push(ShirtData);
                    if (innercount == innereachLength) {
                        Counter ++;
                        if (eachLength == Counter ) {
                          FileWrite();
                        };
                    };
                  console.log(ShirtData);

          }).catch(function(error) {
             Counter ++;
            if (eachLength == Counter ) {
                FileWrite();
            };
          console.error(error.message);
          console.error('Scrape failed from: ' + homeURL + 'blah2' + ' The site may be down, or your connection may need troubleshooting.');
          }); //end catch error
      }); //end products li each
              } //end else



    }).catch(function(error) {  //end rp
      console.error(error.message); //end if
  //tell the user in lamens terms why the scrape may have failed.
      console.error('Scrape failed from: ' + homeURL + 'blah' + ' The site may be down, or your connection may need troubleshooting.');
    }); //end catch error
  });  //end href each
    //one thing all shirts links have in common, they are contained in a div with class shirts, find the link to the shirts page based on this class.

    // //console.log testing purposes
    // console.log("This is the shirts link: " + findShirtLinks);

    // //call iterateLinks function, pass in the findShirtLinks variable to scrape that page
    // iterateLinks(findShirtLinks);

  }).catch(function(error) {
  console.error(error.message); //end if
  //tell the user in lamens terms why the scrape may have failed.
  console.error('Scrape failed from: ' + homeURL + ' The site may be down, or your connection may need troubleshooting.');
  });//end catch error
 //end scraper

}



//create function to write the CSV file.
function FileWrite() {
  //fields variable holds the column headers
  var fields = ['Title', 'Price', 'ImageURL', 'URL', 'Time'];
  //CSV variable for injecting the fields and object into the converter.
  var csv = json2csv({data: ShirtProps, fields: fields}); 
  console.log(csv);

  //creating a simple date snagger for writing the file with date in the file name.
  var d = new Date();
  var month = d.getMonth()+1;
  var day = d.getDate();
  var output = d.getFullYear() + '-' +
  ((''+month).length<2 ? '0' : '') + month + '-' +
  ((''+day).length<2 ? '0' : '') + day;

  fs.writeFile('./data/' + output + '.csv', csv, function (error) {
          if (error) throw error;
          console.error('There was an error writing the CSV file.');

    });

} //end FileWrite


//Check if data folder exists, source: http://stackoverflow.com/questions/4482686/check-synchronously-if-file-directory-exists-in-node-js
function DataFolderExists(folder) {
  try {
    // Query the entry
    var DataFolder = fs.lstatSync(folder);

    // Is it a directory?
    if (DataFolder.isDirectory()) {
        return true;
    } else {
        return false;
    }
} //end try
catch (error) {
    console.error(error.message);
    console.error('There was an error checking if the folder exists.');
}

} 