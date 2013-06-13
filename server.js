#!/bin/env node
//  OpenShift sample Node application

var express = require('express');
var fs      = require('fs');

// Retrieve
var MongoClient = require('mongodb').MongoClient;


/////////////////////////////////////////////////////////////////////////////
// MongoDB Test
// https://github.com/mongodb/node-mongodb-native/blob/master/examples/index.js
//
// Connect to the db
MongoClient.connect(process.env.MONGODB_URL + "test", function(err, db) {
  if (err) { return console.dir(err); }

  console.log(">> Dropping collection test");
  db.dropCollection('test', function(err, result) {
    console.log("dropped: ");
    console.dir(result);
  });
  
  console.log(">> Creating collection test");
  var collection = db.collection('test');
  console.log("created: ");
  console.dir(collection);

  var objectCount = 100;
  var objects = [];
  var messages = ["hola", "hello", "aloha", "ciao"];
  console.log(">> Generate test data");
  for(var i = 0; i < objectCount; i++) {
    objects.push({'number':i, 'rndm':((5*Math.random()) + 1), 'msg':messages[parseInt(4*Math.random())]})
  }
  console.log("generated");

  console.log(">> Inserting data (" + objects.length + ")");
  collection.insert(objects, {w:0});
  console.log("inserted");
  
  console.log(">> Creating index")
  collection.createIndex([['all'], ['_id', 1], ['number', 1], ['rndm', 1], ['msg', 1]], function(err, indexName) {
    console.log("created index: " + indexName);
    
    console.log(">> Gathering index information");
          
    collection.indexInformation(function(err, doc) {
      console.log("indexInformation: ");
      console.dir(doc);
      
      console.log(">> Dropping index");
      collection.dropIndex('all_1__id_1_number_1_rndm_1_msg_1', function(err, result) {
        console.log("dropped: ");
        console.dir(result);

        console.log(">> Gathering index information");
        collection.indexInformation(function(err, doc) {
          console.log("indexInformation: ");
          console.dir(doc);
          console.log(">> Closing connection");
          db.close();
        });
      });
    });
  });
});
/////////////////////////////////////////////////////////////////////////////

//  Local cache for static content [fixed and loaded at startup]
var zcache = { 'index.html': '' };
zcache['index.html'] = fs.readFileSync('./index.html'); //  Cache index.html

// Create "express" server.
var app  = express.createServer();


/*  =====================================================================  */
/*  Setup route handlers.  */
/*  =====================================================================  */

// Handler for GET /health
app.get('/health', function(req, res){
    res.send('1');
});

// Handler for GET /asciimo
app.get('/asciimo', function(req, res){
    var link="https://a248.e.akamai.net/assets.github.com/img/d84f00f173afcf3bc81b4fad855e39838b23d8ff/687474703a2f2f696d6775722e636f6d2f6b6d626a422e706e67";
    res.send("<html><body><img src='" + link + "'></body></html>");
});

// Handler for GET /
app.get('/', function(req, res){
    res.send(zcache['index.html'], {'Content-Type': 'text/html'});
});


//  Get the environment variables we need.
var ipaddr  = process.env.OPENSHIFT_DIY_IP;
var port    = process.env.OPENSHIFT_DIY_PORT || 8080;

if (typeof ipaddr === "undefined") {
   console.warn('No OPENSHIFT_DIY_IP environment variable');
}

//  terminator === the termination handler.
function terminator(sig) {
   if (typeof sig === "string") {
      console.log('%s: Received %s - terminating Node server ...',
                  Date(Date.now()), sig);
      process.exit(1);
   }
   console.log('%s: Node server stopped.', Date(Date.now()) );
}

//  Process on exit and signals.
process.on('exit', function() { terminator(); });

['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS',
 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGPIPE', 'SIGTERM'
].forEach(function(element, index, array) {
    process.on(element, function() { terminator(element); });
});

//  And start the app on that interface (and port).
app.listen(port, ipaddr, function() {
   console.log('%s: Node (version: %s) %s started on %s:%d ...', Date(Date.now() ), process.version, process.argv[1], ipaddr, port);
});
