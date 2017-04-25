var express = require('express');
var bodyParser = require('body-parser');
var httpPortRequest = require('request');
var app = express();

var config = require('./config');

app.use(bodyParser.json());

function setCORSHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "accept, content-type");
}

app.all('/', function(req, res) {
  setCORSHeaders(res);
  res.send('I\'m alive');
  res.end();
});

app.all('/search', function(req, res){
  setCORSHeaders(res);

  if (req.body.target == "list" ) {
    var tgt = `${config.saltmaster}`
    var expr_form = 'glob'
    var fun = 'pillar.items'

  } else {
    var tgt = req.body.target
    var expr_form = 'nodegroup'
    var fun = 'test.ping'
  }

  var httpSaltRequest = {
    client: 'local',
    tgt,
    expr_form,
    fun,
    username: config.username,
    password: config.password,
    eauth: 'ldap',
  };

  const httpPortRequestOptions = {
    method: 'POST',
    url: `${config.protocol}://${config.saltmaster}:${config.port}/run`,
    body: JSON.stringify(httpSaltRequest),
    headers:
    {
      accept: 'application/json',
      'content-type': 'application/json',
    },
  };

  httpPortRequest(httpPortRequestOptions, (error, response, body) => {
    if (error) throw new Error(error);

    if (req.body.target == "list" ) {
      var ret = Object.keys(JSON.parse(body).return[0][`${config.saltmaster}`]['master']['nodegroups']).sort();
    } else {
      var ret = Object.keys(JSON.parse(body).return[0]).sort();
    }

    console.log(ret);
    res.send(ret);
    res.end();
  });
});

app.all('/annotations', function(req, res) {
  setCORSHeaders(res);
  res.send('Annotations not supported by SaltStack plugin');
  res.end();
})

app.all('/query', function(req, res){
  setCORSHeaders(res);
  res.send('Query not supported by SaltStack plugin');
  res.end();

});

app.listen(3333);

console.log("Server is listening to port 3333");
