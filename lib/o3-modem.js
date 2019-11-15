var convert = require('./converter');
const sp = require('serialport');
var EventEmitter = require('events').EventEmitter;

var createModem = function() {
    var modem = new EventEmitter();
    modem.queue = []; //Holds queue of commands to be executed.
    modem.isLocked = false; //Device status
    modem.partials = {}; //List of stored partial messages
    modem.isOpened = false;
    modem.job_id = 1;
    modem.ussd_pdu = true; //Should USSD queries be done in PDU mode?
    modem.ussd_send='gsm7';
    modem.ussd_recieve='gsm7';
    modem.sms_send='pdu';
    modem.sms_receive='pdu';
    modem.openOptions = {
        baudRate: 115200,
        dataBits: 8,
        parity: 'none',
        stopBits: 1
    };
    var timeouts = {};

    modem.execute = function(param,c) {
        if(!this.isOpened) {
            this.emit('close');
            return ;
        }
        
        if(!param.command)
            return;
        
        var item = new EventEmitter();
        var prior=param.prior;
        item.command = param.command;
        item.callback = c;
        item.add_time = new Date().toLocaleString('en-US', {
            timeZone: 'Asia/Jakarta'
          });
        item.id = ++this.job_id;
        item.timeout = param.timeout;
        if(item.timeout == undefined) //Default timeout it 60 seconds. Send false to disable timeouts.
            item.timeout = 60000;

        if(prior)
            this.queue.unshift(item);
        else
            this.queue.push(item);

        this.emit('job', item);
        process.nextTick(this.executeNext.bind(this));
        return item;
    }

    modem.executeNext = function() {
        if(!this.isOpened) {
            this.emit('close');
            return ;
        }
        //Someone else is running. Wait.
        if(this.isLocked)
            return ;

        var item = this.queue[0];

        if(!item) {
            this.emit('idle');
            return ; //Queue is empty.
        }

        //Lock the device and null the data buffer for this command.
        this.data = '';
        this.isLocked = true;

        item.execute_time = new Date().toLocaleString('en-GB', {
            timeZone: 'Asia/Jakarta'
          });

        item.emit('start');

        if(item.timeout)
            timeouts[item.id] = setTimeout(function() {
                item.emit('timeout');
                this.release();
                this.executeNext();
            }.bind(this), item.timeout);

        modem.port.write(item['command']+"\r");
    }
    
    modem.open = function(device, callback) {
        modem.port = new sp(device, this.openOptions);
        
        modem.port.on('open', function() {
            modem.isOpened = true;

            modem.port.on('data', modem.dataReceived.bind(modem));

            modem.emit('open');

            if(callback)
                callback();
        });

        modem.port.on('close', function() {
            modem.port.close();
            modem.isOpened = false;
            modem.emit('close');
        });

        modem.port.on('error', function() {
            modem.close();
        });
    }

    modem.close = function(device) {
        this.port.removeAllListeners();
        this.port.close();
        this.port = null;
        this.isOpened = false;
        this.emit('close');
    }

    modem.listPort=function(callback){
        sp.list((err, ports) => {
            if (err) {
              console.error('Error listing ports', err);
            } else {
              var cleanPort=[];
              ports.forEach((port) => {
                if(port.pnpId){
                    cleanPort.push(port);                   
                }
              });
                
              if(callback)
                callback(cleanPort);
            }
        });          
    }

    var outx='';
    var x=['null'];
    modem.dataReceived = function(buffer) {
        datas=buffer.toString().replace(/\r\n/g,'_rXn').replace(/\n/g,'_n').replace(/\r/g,'_r').split('');
        
        datas.forEach(function(data) {
            outx+=data;
            if( outx.slice(-2) == '_r' || data == '>'){
                data=outx.replace(/_r|Xn/g,'').replace(/_n/g,'\n').trim();
                outx='';

                if( data.trim().substr(0,6) === '^BOOT:' )
                    return ;

                this.emit('data', data);    
                // Don't Remove it !   
                if(this.queue[0] && this.queue[0]['command'].trim().slice(0, data.length) === data ) {
                    return ;
                } 
                
                // this.emit('data', data);
            
                if(data.trim().slice(0,5).trim() === '+CMTI') {
                    this.smsReceived(data);
                    return ;
                }
                
                if(data.trim().slice(0,5).trim() === '+CDSI') {
                    this.deliveryReceived(data);                    
                    return ;
                }           
                
                // if(data.trim().slice(0,5).trim() === '+CDS:' || x[0].trim().slice(0,5).trim() === '+CDS:') { // sms report sim
                //     if(x[0].trim().slice(0,5).trim() !== '+CDS:')
                //         x=[data];
                //     else
                //         console.log('CDS : ',data);                        
                //         x=['null'];                   
                //     return ;
                // }

                if(data.trim().slice(0,5).trim() === '+CLIP') {
                    this.ring(data);
                    return ;
                }

                // Signal Respon;

                if(data.trim().slice(0,6).trim() === '^RSSI:' || data.trim().slice(0,5).trim() === '+CSQ:') {
                    var qsig=parseInt(data.trim().split(':')[1].trim().split(',')[0]);
                    (qsig > 30 ) ? strength='No Signal' : strength=Math.round(qsig/30*100)+'%';
                    this.emit('signal',strength);
                    return ;
                }

                if(data.trim().slice(0,10).trim() === '^SMMEMFULL') {
                    modem.emit('memory full', modem.parseResponse(data)[0]);
                    return ;
                }

                // USSD Respon
                if(data.trim().slice(0,6).trim() === '+CUSD:' || x[0].trim().slice(0,6).trim() === '+CUSD:' ){
                    if(data.trim()==='+CUSD: 4'){
                        data={
                            Body: data.trim()
                        };
                    }else{
                        wdata=data.trim().split('"')[1];
                        if( modem.ussd_send!='text'){
                            var xdata=new Object();
                            xdata.inpString=wdata;                   
                            data=convert.decode_ussdText(xdata);
                        }else{
                            if(x[0].trim().slice(0,6).trim() !== '+CUSD:')
                                x=[data];
                            else
                                x.push(data);

                            // console.log('isi x',x);

                            if( x[0].trim().slice(-2).trim() !==  ',0' &&
                                x[0].trim().slice(-3).trim() !==  ',15' &&
                                 data.trim().slice(-2).trim() !== ',0' && 
                                 data.trim().slice(-3).trim() !== ',15'  &&
                                 data.trim() !== '+CUSD: 2' && data.trim() !== '+CUSD: 5' 
                                 )
                                return;
                            
                            
                            data=x.join('\n').trim().split('"')[1];
                            x=['null'];

                            data={
                                Title : 'USSD/User Data without length information',
                                Body : data,                            
                            }
                        }
                    }
                    if(this.queue[0]){
                        var fussd=this.queue[0]['command'].slice(0,9).toLowerCase();
                        if( fussd === 'at+cusd=1' ){
                            data.command=this.queue[0]['command'];
                            if(this.queue[0] && this.queue[0]['callback'])
                                var c = this.queue[0]['callback']
                            else
                                var c = null;

                            var allData = datas.join('').replace(/_r|Xn/g,'').replace(/_n/g,'\n');

                            this.queue[0]['end_time'] = new Date();
                            this.queue[0].emit('end', allData, data);
                            clearTimeout(timeouts[this.queue[0].id]);
                                    
                            
                            this.release();    
                
                            if(c)
                                c(allData, data); //Calling the callback and letting her know about data.

                            this.executeNext();
                            return;
                        }                        
                    }
                    this.emit('ussd_respon',data);
                    return ;
                }

                if(this.queue[0] && data.trim().substr(0,1) === '^')
                    return ;

                if(data.trim() === 'OK' || data.trim().match(/error/i) || data.trim() === '>' ) { //Command finished running.
                    if(this.queue[0]){
                        // console.log(this.queue[0]);
                        var fussd=this.queue[0]['command'].slice(0,9).toLowerCase();
                        if( fussd === 'at+cusd=1' && data.trim() === 'OK' )
                            return;                            

                        if(this.queue[0] && this.queue[0]['callback'])
                            var c = this.queue[0]['callback']
                        else
                            var c = null;

                        var allData = this.data;
                        var delimeter = data.trim();

                        /*
                        Ordering of the following lines is important.
                        First, we should release the modem. That will remove the current running item from queue.
                        Then, we should call the callback. It might add another item with priority which will be added at the top of the queue.
                        Then executeNext will execute the next command.
                        */
                        
                        this.queue[0]['end_time'] = new Date();
                        this.queue[0].emit('end', allData, data.trim());
                        clearTimeout(timeouts[this.queue[0].id]);
                                
                        
                        this.release();    
            
                        if(c)
                            c(allData, data.trim()); //Calling the callback and letting her know about data.

                        this.executeNext();    
                    }else{
                        if (data.trim() === '>' ){
                            this.execute({command:String.fromCharCode(26),prior:true});
                        }
                       return;
                    }

                       

                } else
                  this.data += data+'\n'; //Rest of data for a command. (Long answers will happen on multiple dataReceived events)
            }
        }.bind(this));
    }

    modem.release = function() {
        this.data = ''; //Empty the result buffer.
        this.isLocked = false; //release the modem for next command.
        this.queue.shift(); //Remove current item from queue.
    }

    modem.smsReceived = function(cmti) {
        var message_info = this.parseResponse(cmti);
        var memory = message_info[0];
        this.execute({command:'AT+CPMS="'+memory+'"'}, function(memory_usage) {
            var memory_usage = modem.parseResponse(memory_usage);
            var used  = parseInt(memory_usage[0]);
            var total = parseInt(memory_usage[1]);

            if(used === total)
                modem.emit('memory full', memory);
        });
        if(modem.sms_receive=='pdu'){
            modem.execute({command:'AT+CMGF=0'});
        }else{
            modem.execute({command:'AT+CMGF=1'});
        }
        this.execute({command:'AT+CMGR='+message_info[1],timeout:5000}, function(cmgr) {
            var lines = cmgr.split("\n");            
            var message = convert.getPDUMetaInfo(lines[1], message_info[1]);
            if(message)
                this.emit('sms received', message);
        }.bind(this));
    }

    modem.deliveryReceived = function(delivery) {
        if(modem.sms_receive=='pdu'){
            modem.execute({command:'AT+CMGF=0'});
        }else{
            modem.execute({command:'AT+CMGF=1'});
        }
        var response = this.parseResponse(delivery);
        this.execute({command:'AT+CPMS="'+response[0]+'"'});
        this.execute({command:'AT+CMGR='+response[1]}, function(cmgr) {
            var lines = cmgr.split("\n");            
            var deliveryResponse = convert.getPDUMetaInfo(lines[1],response[1]);
            this.emit('delivery', deliveryResponse, response[1]);
        }.bind(this));
    }

    modem.ring = function(data) {
        var clip = this.parseResponse(data);
        modem.emit('ring', clip[0]);
    }

    modem.parseResponse = function(response) {
        var plain = response.slice(response.indexOf(':')+1).trim();
        var parts = plain.split(/,(?=(?:[^"]|"[^"]*")*$)/);
        for(i in parts)
            parts[i] = parts[i].replace(/\"/g, '');

        return parts;
    }

    modem.getMessages = function(callback) {
        if(modem.sms_receive=='pdu'){
            modem.execute({command:'AT+CMGF=0'});
        }else{
            modem.execute({command:'AT+CMGF=1'});
        }
        this.execute({command:'AT+CMGL=1'}, function(data) {
            var messages = [];
            var lines = data.split("\n"); //TODO: \n AND \r\n
            var i = 0;
            lines.forEach(function(line) {
                if(line.trim().length === 0)
                    return;

                if(line.slice(0,1) === '+') {
                    i = modem.parseResponse(line)[0];
                    return ;
                }

                var message = convert.getPDUMetaInfo(line, i);                
                
                if(message)
                    messages.push(message);

            }.bind(this));

            if(callback)
                callback(messages);
        }.bind(this));
    }

    modem.sms = function(message, callback) {
        modem.execute({command:'AT+CSQ'});
        if(modem.sms_send=='pdu'){
            modem.execute({command:'AT+CMGF=0'});
            var pdusx = convert.stringToPDU(message);
            var pdus=pdusx.pduMessage;
        }else{
            modem.execute({command:'AT+CMGF=1'});
            var pdus=[message.inpString];            
        }
             
        var i = 0;
        
        var ids = [];

        //sendPDU executes 'AT+CMGS=X' command. The modem will give a '>' in response.
        //Then, appendPdu should append the PDU+^Z 'immediately'. Thats why the appendPdu executes the pdu using priority argument of modem.execute.
        var sendPdu = function(pdu) { // Execute 'AT+CMGS=X', which means modem should get ready to read a PDU of X bytes.
            if(modem.sms_send=='pdu'){
                this.execute({command:"AT+CMGS="+((pdu.length/2)-1),timeout:5000}, appendPdu);
            }else{
                this.execute({command:"AT+CMGS="+message.phoneNumber,timeout:5000}, appendPdu);
            }
        }.bind(this);

        var appendPdu = function(response, escape_char) { //Response to a AT+CMGS=X is '>'. Which means we should enter PDU. If aything else has been returned, there's an error.
            if(escape_char.slice(0,1).trim() !== '>')
                return callback(response+' '+escape_char); //An error has happened.

            var job = this.execute({command:pdus[i]+String.fromCharCode(26),prior:true,timeout:30000}, function(response, escape_char) {
                if(escape_char.match(/error/i))
                    return callback(response+' '+escape_char);

                var response = this.parseResponse(response);

                ids.push(response[0]);
                i++;

                if(typeof(pdus[i]) === 'undefined') {
                    if(callback)
                        callback(null, ids); //We've pushed all PDU's and gathered their ID's. calling the callback.
                        modem.emit('sms sent', message, ids);
                } else {
                    sendPdu(pdus[i]); //There's at least one more PDU to send.
                }
            }.bind(this), true, false);

        }.bind(this);

        sendPdu(pdus[i]);
    }

    modem.on('newListener', function(listener) {
        //If user wants to get sms events, we have to ask modem to give us notices.
        if(listener == 'sms received')
            this.execute({command:'AT+CNMI=2,1,0,2,0'});

        if(listener == 'ring')
            this.execute('AT+CLIP=1');
    });

    modem.deleteMessage = function(index, cb) {
        modem.execute({command:'AT+CMGD='+index,timeout:5000});
    }

    modem.sendUSSD=function(ussd,cb){
        modem.execute({command:'AT+CSQ'});
        if( modem.ussd_send!='text'){
            var data=new Object();
            data.inpString=ussd;
            var command=convert.stringToPDU(data);
            modem.execute({command:'AT+CMGF=0'}); 
        }else{
            modem.execute({command:'AT+CMGF=1'});
            var command={
                ussdText:ussd
            }
        }
        if (command.ussdText)
            modem.execute({command:'AT+CUSD=1,'+command.ussdText+',15',timeout:30000},function(xcb,s){
                if(cb) cb(ussd,s);
            });
        
    }   

    modem.endUSSD=function(){
        modem.execute({command:'AT+CUSD=2'});
    }

    modem.sendAT=function(at,cb){
        modem.execute({command:at});
        modem.execute({command:at,timeout:10000},function(xcb,s){            
             if(cb) cb(at,s);
            // return s;
        });
    }

    return modem;
}

module.exports = createModem;
