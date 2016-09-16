var d3 = require('d3');
var jsdom = require('jsdom')
  , GVIS = require('./gvis.export')
  // , jQuery = require("jquery")(jsdom.jsdom().defaultView)

  , htmlStub = '<html><head><title>qwe</title></head><body><div id="dataviz-container"></div><script src="js/d3.v3.min.js"></script></body></html>' // html file skull with a container div for the d3 dataviz

// pass the html stub to jsDom
jsdom.env({ 
  features : { QuerySelector : true }, 
  html : htmlStub, 
  done : function(errors, window) {
    // process the html document, like if we were at client side
    // code to generate the dataviz and process the resulting html file to be added here


    var el = window.document.querySelector('#dataviz-container')
    , body = window.document.querySelector('body')


    var circleId = 'a2324'  // say, this value was dynamically retrieved from a database

    // append the svg to the selector
    d3.select(el)
      .append('svg:svg')
        .attr('width', 600).attr('height', 300)
        .append('circle')
          .attr('cx', 300).attr('cy', 150).attr('r', 30).attr('fill', '#26963c')
          .attr('id', circleId) // we assign the circle to an Id here

    // write the client-side script manipulating the circle
    var clientScript = "d3.select('#" + circleId + "').transition().delay(1000).attr('fill', '#f9af26')"

    // append the script to page's body
    d3.select(body)
      .append('script')
        .html(clientScript)

    var fs = require('fs')
      , svgsrc = window.document.innerHTML
      
    console.log(window.document.body.innerHTML);
    console.log(window.document.documentElement.innerHTML);

    fs.writeFile('index.html', svgsrc, function(err) {
      if(err) {
        console.log('error saving document', err)
      } else {
        console.log('The file was saved, open index.html to see the result')
      }
    })
  }
})