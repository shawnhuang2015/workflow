var d3 = require('d3');;
var jsdom = require('jsdom');
var gvis = require('./gvis.export').GVIS;
var fs = require('fs');
var data = require('./data.json');

var htmlStub = '<html><head><title>qwe</title></head><body><div id="visualization_container"></div></body></html>' // html file skull with a container div for the d3 dataviz

process.argv.forEach(function(argument, i) {
  console.log(i, argument)
})

var inputFile = process.argv[2];
var outputFile = process.argv[3];

// pass the html stub to jsDom
jsdom.env({ 
  // features : { QuerySelector : true }, 
  html : htmlStub, 
  done : function(errors, window) {
    // process the html document, like if we were at client side
    // code to generate the dataviz and process the resulting html file to be added here

    console.log(data.nodes.length);

    var visualization = new gvis({
      container : 'visualization_container',
      render_type : 'svg'
    })

    visualization.backup(data).update(500);

    var svgsrc = window.document.documentElement.innerHTML;

    fs.writeFile('index.html', svgsrc, function(err) {
      if(err) {
        console.log('error saving document', err)
      } else {
        console.log('The file was saved, open index.html to see the result')
      }
    })
  }
})