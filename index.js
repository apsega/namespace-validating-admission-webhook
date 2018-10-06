'use strict';

// Constants
const express = require('express');
const app = express();

const PORT = 8080;
const HOST = '0.0.0.0';

// Variables
var bodyParser  = require('body-parser');
// var restClient = require('node-rest-client').Client;
// var router = express.Router();

var allowed_namespaces = ["kube-system"];
var restricted_node_roles = [ "critical", "master" ]

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); 

app.get('/', function(request, response) {
  response.send('This the Namespace validating simple Webhook server Use POST methods instead of GET.')
  console.log('GET request received');
})

app.post('/', function(req, res) {
  var admissionRequest = req.body;
  
  // Get a reference to the pod spec
  var namespace = admissionRequest.request.namespace;
  var object = admissionRequest.request.object;
  
  console.log(`validating the ${namespace}/${object.metadata.name} pod`);
  
  var admissionResponse = {
    allowed: false
  };
  
  var namespace_allowed = false;
  
  for (var container of object.spec.containers) {
    if (typeof(object.spec.nodeSelector.role) !== "undefined") {
      if (restricted_node_roles.indexOf(object.spec.nodeSelector.role) != -1 && allowed_namespaces.indexOf(namespace) == -1) {
        console.log(`${namespace}/${container.name} wants to be deployed on node labeled ${object.spec.nodeSelector.role} role`);
        admissionResponse.status = {
          status: 'Failure',
          message: `${namespace}/${container.name} is not allowed to be deployed on node labeled ${object.spec.nodeSelector.role} role`,
          reason: `${namespace}/${container.name} is not allowed to be deployed on node labeled ${object.spec.nodeSelector.role} role`,
          code: 402
        };
        namespace_allowed = false;
      }
      else {
        console.log(`${namespace}/${container.name} is allowed to be deployed on node labeled ${object.spec.nodeSelector.role} role`);
        namespace_allowed = true;
      }   
    };
  };
  if (namespace_allowed) {
    admissionResponse.allowed = true;
  }
  
  var admissionReview = {
    response: admissionResponse
  };
  
  console.log(JSON.stringify(admissionReview));
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(admissionReview));
  res.status(200).end();
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
