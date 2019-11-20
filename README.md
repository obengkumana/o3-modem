o3-Modem.js
============================
> Modem.js allows you to use your GSM modems on node.
It offers a very simple API.
It supports:
* Sending SMS messages
* Receiving SMS messages
* Getting delivery reports
* Deleting messages from memory
* Getting notifications when memory is full
* Getting signal quality
* Mutlple dial ussd
* 16bit (ucsd messages)
* 7bit (ascii) messages
* Multipart messages
* Translate SMS sender with alphabet, not numeric
* Getting notifications when someone calls  
Installation
------------
```
npm i o3-modem or yarn add o3-modem (if you'd prefer yarn)
```  
Instantiate
-----------
```js
const modem = require('o3-modem').Modem()
```  
Feature:  
--------  
* multiple Dial USSD, sms sender, sms center, not conflick.  

Example:
--------  
```
$ git clone https://github.com/obengkumana/o3-modem  
$ cd o3-modem  
$ node test.js -p /dev/ttyUSB0 -u *888# --dialmode text
```  
Reff :
* https://www.npmjs.com/package/modem
* http://smstools3.kekekasvi.com/topic.php?id=288
