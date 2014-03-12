exports.install = function(self)
{
  self.channelWraps["stream"] = function(chan)
  {
    chan.duplex = new require("stream").Duplex();

    // allow for manually injected json
    duplex.bufJS = {};
    duplex.js = function(js){
      Object.keys(js).forEach(function(key){ duplex.bufJS[key] = js[key]; });
      setTimeout(doChunk, 10);
    };
  
    // buffer writes and chunk them out
    duplex.bufBody = new Buffer(0);
    duplex.cbWrite;

    function doChunk(){
      debug("CHUNKING", duplex.bufJS, duplex.bufBody.length)
      if(duplex.bufBody.length === 0 && Object.keys(duplex.bufJS).length === 0) return;      
      var bodyout;
      var jsout = duplex.bufJS;
      duplex.bufJS = {};
      if(duplex.bufBody.length > 0)
      {
        var len = 1024 - JSON.stringify(jsout).length; // max body size for a packet
        if(duplex.bufBody.length < len) len = duplex.bufBody.length;
        bodyout = duplex.bufBody.slice(0, len);
        duplex.bufBody = duplex.bufBody.slice(len);
      }
      // send it!
      chan.send({js:jsout, body:bodyout, done:function(){
        // we might be backed up, let more in
        if(duplex.cbWrite)
        {
          // am I being paranoid that a cbWrite() could have set another duplex.cbWrite?
          var cb = duplex.cbWrite;
          delete duplex.cbWrite;
          cb();
        }
      }});
      // recurse nicely
      setTimeout(doChunk, 10);
    
    };

    duplex.end = function(){
      duplex.bufJS.end = true;
      if(stream.errMsg) duplex.bufJS.err = stream.errMsg;
      doChunk();
    }

    duplex._write = function(buf, enc, cbWrite){
      duplex.bufBody = Buffer.concat([duplex.bufBody, buf]);

      // if there's 50 packets waiting to be confirmed, hold up here, otherwise buffer up
      var cbPacket = doChunk;
      if(stream.outq.length > 50)
      {
        duplex.cbWrite = cbWrite;
      }else{
        cbWrite();
      }
    
      // try sending a chunk;
      doChunk();
    }  
  
    duplex._read = function(size){
      // TODO handle backpressure
      // perform duplex.push(body)'s if any waiting, if not .push('')
      // handle return value logic properly
    };

    stream.handler = function(self, packet, cbHandler) {
      // TODO migrate to _read backpressure stuff above
      debug("HANDLER", packet.js)
      if(cbExtra) cbExtra(packet);
      if(packet.body) duplex.push(packet.body);
      if(packet.js.end) duplex.push(null);
      cbHandler();
    }
    return duplex;  
  }
}