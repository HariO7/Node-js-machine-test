const http = require('http');
const fs = require('fs')
const path = require('path');

http.createServer(function(req,res){
    const filePath = '.'+ req.url;
    if(filePath == './'){
        filePath = './index.html'
    }


})