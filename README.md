telesocket
==========

Adding Stream support to telehash-js channels

## Usage

```js
var self = new require("telehash-js").switch();
require("telehash-stream").install(self);

// on any channel created outgoing or received incoming do this to get a full read/write binary stream for that channel
var stream = chan.wrap("stream");

```