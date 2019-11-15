var esc = '\u001b'; //'\u261d';
var bad = '\u2639';

sevenbitdefault = new Array(
        '@', '\u00a3', '$', '\u00a5', '\u00e8', '\u00e9', '\u00f9', '\u00ec',
        '\u00f2', '\u00c7', '\n', '\u00d8', '\u00f8', '\r', '\u00c5', '\u00e5',

        '\u0081', '_', '\u0082', '\u0083', '\u0084', '\u0085', '\u0086', '\u0087',
        '\u0088', '\u0089', '\u008a', '\u001b', '\u00c6', '\u00e6', '\u00df', '\u00c9',

        ' ',    '!',    '"',    '#',    '\u00a4',       '%',    '&',    '\'',
        '(',    ')',    '*',    '+',    ',',    '-',    '.',    '/',

        '0',    '1',    '2',    '3',    '4',    '5',    '6',    '7',
        '8',    '9',    ':',    ';',    '<',    '=',    '>',    '?',

        '\u00a1',       'A',    'B',    'C',    'D',    'E',    'F',    'G',
        'H',    'I',    'J',    'K',    'L',    'M',    'N',    'O',

        'P',    'Q',    'R',    'S',    'T',    'U',    'V',    'W',
        'X',    'Y',    'Z',    '\u00c4', '\u00d6', '\u00d1', '\u00dc', '\u00a7',

        '\u00bf',       'a',    'b',    'c',    'd',    'e',    'f',    'g',
        'h',    'i',    'j',    'k',    'l',    'm',    'n',    'o',

        'p',    'q',    'r',    's',    't',    'u',    'v',    'w',
        'x',    'y',    'z',    '\u00e4', '\u00f6', '\u00f1', '\u00fc', '\u00e0'
);

sevenbitextended = new Array(
        '\f',   0x0A,   // '\u000a',    // <FF>
        '^',    0x14,   // '\u0014',    // CIRCUMFLEX ACCENT
        '{',    0x28,   // '\u0028',    // LEFT CURLY BRACKET
        '}',    0x29,   // '\u0029',    // RIGHT CURLY BRACKET
        '\\',   0x2F,   // '\u002f',    // REVERSE SOLIDUS
        '[',    0x3C,   // '\u003c',    // LEFT SQUARE BRACKET
        '~',    0x3D,   // '\u003d',    // TILDE
        ']',    0x3E,   // '\u003e',    // RIGHT SQUARE BRACKET
        '|',    0x40,   // '\u0040',    // VERTICAL LINE \u007c
        //'\u00a4', 0x65,       // '\u0065',    // EURO SIGN €
        '\u20ac', 0x65  // '\u0065'     // EURO SIGN €
);

// Variable that stores the information to show the user the calculation of the translation
var calculation = "";

var maxChars = 160;
var alerted = true; //false;
module.exports = {
	getQueryVariable : function (variable){
		var query = window.location.search.substring(1);
		var vars = query.split("&");
		for (var i=0;i<vars.length;i++)
		{
			var pair = vars[i].split("=");
			if (pair[0] == variable)
				return pair[1];
		}
		return "";
	},

	trim : function (stringToTrim){
		return stringToTrim.replace(/^\s+|\s+$/g,"");
	},

	// function te convert a bit string into a integer
	binToInt : function (x){//sp
		var total = 0;
		if(!x) return total; 
		var power = parseInt(x.length)-1;

		for(var i=0;i<x.length;i++){
			if(x.charAt(i) == '1')
			{
				total = total +Math.pow(2,power);
			}
			power --;
		}
		return total;
	},

	decode_timezone : function (timezone){
		var tz = parseInt(timezone.substring(0, 1), 16);
		var result = '+';

		if (tz & 8)
			result = '-';
		tz = (tz & 7) * 10;
		tz += parseInt(timezone.substring(1, 2), 10);

		var tz_hour = Math.floor(tz / 4);
		var tz_min = 15 * (tz % 4)

		if (tz_hour < 10)
			result += '0';
		result += tz_hour +':';
		if (tz_min == 0)
			result += '00';
		else
			result += tz_min;

		return result;
	},

	// function to convert a integer into a bit String
	intToBin : function (x,size){ //sp
		var base = 2;
		var num = parseInt(x);
		var bin = num.toString(base);
		for(var i=bin.length;i<size;i++)
		{
			bin = "0" + bin;
		}
		return bin;
	},

	// function to convert a Hexnumber into a 10base number
	HexToNum : function (numberS){
		var tens = this.MakeNum(numberS.substring(0,1));

		var ones = 0;
		if(numberS.length > 1) // means two characters entered
			ones=this.MakeNum(numberS.substring(1,2));
		if(ones == 'X'){
			return "00";
		}
		return  (tens * 16) + (ones * 1);
	},

	// helper function for HexToNum
	MakeNum : function (str){
		if((str >= '0') && (str <= '9'))
			return str;
		switch(str.toUpperCase()){
			case "A": return 10;
			case "B": return 11;
			case "C": return 12;
			case "D": return 13;
			case "E": return 14;
			case "F": return 15;
			default:
			return 16;
		}
		return 16;
	},

	//function to convert integer to Hex
	intToHex : function (i){ //sp
		var sHex = "0123456789ABCDEF";
		h = "";
		i = parseInt(i);
		for(j = 0; j <= 3; j++){
			h += sHex.charAt((i >> (j * 8 + 4)) & 0x0F) +
			sHex.charAt((i >> (j * 8)) & 0x0F);
		}
		return h.substring(0,2);
	},

	ToHex : function (i){
		var sHex = "0123456789ABCDEF";
		var Out = "";

		Out = sHex.charAt(i&0xf);
		i>>=4;
		Out = sHex.charAt(i&0xf) + Out;

		return Out;
	},

	getSevenBitExtendedCh : function (code){
		for (var i = 0; i < sevenbitextended.length; i += 2)
			if (sevenbitextended[i +1] == code)
				return sevenbitextended[i];
		return '\u2639';
	},

	getSevenBitExt : function (character){
		for (var i = 0; i < sevenbitextended.length; i += 2)
			if (sevenbitextended[i] == character)
				return sevenbitextended[i +1];
		return 0;
	},

	getSevenBit : function (character){
		for (var i = 0; i < sevenbitdefault.length; i++)
			if (sevenbitdefault[i] == character)
				return i;
		return 0;
	},

	getEightBit : function (character){
		return character;
	},

	get16Bit : function (character){
		return character;
	},

	phoneNumberMap : function (character){
	//	return character;
		if((character >= '0') && (character <= '9')){
			return character;
		}
		switch(character.toUpperCase()){
			case '*':
				return 'A';
			case '#':
				return 'B';
			case 'A':
				return 'C';
			case 'B':
				return 'D';
			case 'C':
				return 'E';
	//		case '+':
	//			return '+'; // An exception to fit with current processing ...
			default:
				return 'F';
		}
		return 'F';
	},

	phoneNumberUnMap : function (chararacter){
		if((chararacter >= '0') && (chararacter <= '9')){
			return chararacter;
		}
		switch(chararacter){
			case 10: return '*';
			case 11: return '#';
			case 12: return 'A';
			case 13: return 'B';
			case 14: return 'C';
			default:
				return 'F';
		}
		return 'F';
	},

	// function to convert semioctets to a string
	semiOctetToString : function (inp){ //sp
		var out = "";
		for(var i=0;i<inp.length;i=i+2){
			var temp = inp.substring(i,i+2);
			out = out + this.phoneNumberMap(temp.charAt(1)) + this.phoneNumberMap(temp.charAt(0));
		}
		return out;
	},
	tpDCSMeaning : function (tp_DCS){
		var tp_DCS_desc=tp_DCS;
		var pomDCS = this.HexToNum(tp_DCS);
		var alphabet = "";

		switch(pomDCS & 192){
			case 0: 
				if(pomDCS & 32){
					tp_DCS_desc="Compressed Text";
				}else{
					tp_DCS_desc="Uncompressed Text";
				}				
				if(!(pomDCS & 16)){ // AJA				
					tp_DCS_desc+=", No class";
				}else{
					tp_DCS_desc+=", class: ";
					switch(pomDCS & 3){
						case 0:
							tp_DCS_desc+="0 Flash";
							break;
						case 1:
							tp_DCS_desc+="1 ME specific";
							break;
						case 2:
							tp_DCS_desc+="2 SIM specific";
							break;
						case 3:
							tp_DCS_desc+="3 TE specific";
							break;
					}
				}

				tp_DCS_desc += "\nAlphabet: ";
				switch(pomDCS & 12){
					case 0:
						tp_DCS_desc+="Default (7bit)";
						break;
					case 4:
						tp_DCS_desc+="8bit";
						break;
					case 8:
						tp_DCS_desc+="UCS2 (16bit)";
						break;
					case 12:
						tp_DCS_desc+="Reserved";
						break;
				}
				break;
			case 64:
			case 128:
				tp_DCS_desc ="Reserved coding group";
				break;
			case 192:
				switch(pomDCS & 0x30){
					case 0:
						tp_DCS_desc ="Message waiting group: Discard Message";
						break;
					case 0x10:
						tp_DCS_desc ="Message waiting group: Store Message. Default Alphabet.";
						break;
					case 0x20:
						tp_DCS_desc ="Message waiting group: Store Message. UCS2 Alphabet.";
						break;
					case 0x30:
						alphabet = "\nAlphabet: ";
						if (!(pomDCS & 0x4)){
							alphabet += "Default (7bit)";
						}else{
							alphabet += "8bit";
						}
						break;
				}

				// 06.04.2011:
				if (tp_DCS_desc == tp_DCS)
					tp_DCS_desc = "Class: ";
				else
					tp_DCS_desc += ", class: ";

				switch(pomDCS & 3){
					case 0:
						tp_DCS_desc+="0 Flash";
						break;
					case 1:
						tp_DCS_desc+="1 ME specific";
						break;
					case 2:
						tp_DCS_desc+="2 SIM specific";
						break;
					case 3:
						tp_DCS_desc+="3 TE specific";
						break;
				}
				tp_DCS_desc += alphabet;
				break;

		}
		return(tp_DCS_desc);
	},

	cValid : function (valid){
		var value,out="";
		valid=parseInt(valid);
		if (valid <= 143){
			value = (valid+1)*5; // Minutes
		}else if (valid <= 167){
			value = ((valid-143) / 2 + 12); // Hours
			value *= 60; // Convert to Minutes
		}else if (valid <= 196){
			value = valid-166; // days
			value *= 60*24; // Convert to Minutes
		}else{
			value = valid-192; // Weeks
			value *= 7*60*24; // Convert to Minutes
		}
		var mins,hours,days,weeks;

		mins = value % 60;
		hours = value / 60;
		days = hours / 24;
		weeks = days / 7;
		hours %= 24;
		days %= 7;

		if (parseInt(weeks) != 0){
			out += parseInt(weeks) + "w ";
		}

		if (parseInt(days) != 0){
			out += parseInt(days) + "d ";
		}

		if (parseInt(hours) != 0){
			out += parseInt(hours) + "h ";
		}
		if (mins != 0){
			out += mins + "m ";
		}

		return out;
	},

	DCS_Bits : function (tp_DCS){
		var AlphabetSize=7; // Set Default
		var pomDCS = this.HexToNum(tp_DCS);
		switch(pomDCS & 192){
			case 0: 
				switch(pomDCS & 12){
					case 4:
						AlphabetSize=8;
						break;
					case 8:
						AlphabetSize=16;
						break;
				}
				break;
			case 192:
				switch(pomDCS & 0x30)				{
					case 0x20:
						AlphabetSize=16;
						break;
					case 0x30:
						if (!(pomDCS & 0x4)){
							;
						}else{
							AlphabetSize=8;
						}
						break;
				}
				break;
		}
		return(AlphabetSize);
	},

	getUserMessage :	function (skip_characters, input,truelength){ // Add truelength AJA
		var byteString = "";
		octetArray = new Array();
		restArray = new Array();
		septetsArray = new Array();
		var s=1;
		var count = 0;
		var matchcount = 0; // AJA
		var smsMessage = "";
		var escaped = 0;
		var char_counter = 0;

		var calculation0 = "<table border=1 ><TR><TD align=center width=75><b>Index</b></TD>";
		//var calculation1 = "<table border=1 ><TR><TD align=center width=75><b>Hex</b></TD>";
		var calculation1 = "<TR><TD align=center width=75><b>Hex</b></TD>";
		var calculation2 = "<TR><TD align=center width=75><b>&nbsp;&nbsp;&nbsp;Octets&nbsp;&nbsp;&nbsp;</b></TD>";
		var calculation3 = "<table border=1 ><TR><TD align=center width=75><b>septets</b></TD>";
		var calculation4 = "<TR><TD align=center width=75><b>Char&nbsp;hex&nbsp;&nbsp;</b></TD>";
		calculation = "";

		var byte_index = 0;

		//Cut the input string into pieces of2 (just get the hex octets)
		for(var i=0;i<input.length;i=i+2){
			var hex = input.substring(i,i+2);
			byteString = byteString + this.intToBin(this.HexToNum(hex),8);
			if((i%14 == 0 && i!=0)){
				calculation0 = calculation0 + "<TD align=center width=75>+++++++</TD>";
				calculation1 = calculation1 + "<TD align=center width=75>+++++++</TD>";
			}
			calculation0 = calculation0 + "<TD align=center width=75>" + byte_index + "</TD>";
			byte_index = byte_index + 1;
			calculation1 = calculation1 + "<TD align=center width=75>" + hex + "</TD>";

		}
		calculation0 = calculation0 + "<TD align=center width=75>+++++++</TD>";
		calculation1 = calculation1 + "<TD align=center width=75>+++++++</TD>";

		// make two array's these are nessesery to
		for(var i=0;i<byteString.length;i=i+8){
			octetArray[count] = byteString.substring(i,i+8);
			restArray[count] = octetArray[count].substring(0,(s%8));
			septetsArray[count] = octetArray[count].substring((s%8),8);
			if((i%56 == 0 && i!=0)){
				calculation2 = calculation2 + "<TD align=center width=75>&nbsp;</TD>";
			}
			calculation2 = calculation2 + "<TD align=center width=75><span style='background-color: #FFFF00'>" + restArray[count] + "</span>"+ septetsArray[count]+"</TD>";

			s++;
			count++;
			if(s == 8){
				s = 1;
			}
		}
		calculation2 = calculation2 + "<TD align=center width=75>&nbsp;</TD>";

		// put the right parts of the array's together to make the sectets
		for (var i = 0; i < restArray.length; i++){
			if (i % 7 == 0){
				if (i != 0){
					char_counter++;
					chval = this.binToInt(restArray[i-1]);
					if (escaped){
						smsMessage = smsMessage + this.getSevenBitExtendedCh(chval);
						escaped = 0;
					}
					else if (chval == 27 && char_counter > skip_characters)
						escaped = 1;
					else if (char_counter > skip_characters)
						smsMessage = smsMessage + sevenbitdefault[chval];

					calculation3 = calculation3 + "<TD align=center width=75><span style='background-color: #FFFF00'>&nbsp;" + restArray[i-1] + "</span>&nbsp;</TD>";
					calculation4 = calculation4 + "<TD align=center width=75>&nbsp;<B>" + sevenbitdefault[chval] + "</B>&nbsp;"+chval.toString(16)+"</TD>";
					matchcount ++; // AJA
				}

				char_counter++;
				chval = this.binToInt(septetsArray[i]);
				if (escaped){
					smsMessage = smsMessage + this.getSevenBitExtendedCh(chval);
					escaped = 0;
				}
				else if (chval == 27 && char_counter > skip_characters)
					escaped = 1;
				else if (char_counter > skip_characters)
					smsMessage = smsMessage + sevenbitdefault[chval];

				calculation3 = calculation3 + "<TD align=center width=75>&nbsp;" +septetsArray[i] + "&nbsp;</TD>";
				calculation4 = calculation4 + "<TD align=center width=75>&nbsp;<B>" + sevenbitdefault[chval] + "</B>&nbsp;"+chval.toString(16)+"</TD>";
				matchcount ++; // AJA
			}else{
				char_counter++;
				chval = this.binToInt(septetsArray[i] + restArray[i-1]);
				if (escaped){
					smsMessage = smsMessage + this.getSevenBitExtendedCh(chval);
					escaped = 0;
				}else if (chval == 27 && char_counter > skip_characters)
					escaped = 1;
				else if (char_counter > skip_characters)
					smsMessage = smsMessage + sevenbitdefault[chval];

				calculation3 = calculation3 + "<TD align=center width=75>&nbsp;" +septetsArray[i]+ "<span style='background-color: #FFFF00'>" +restArray[i-1] + "&nbsp;</span>" + "</TD>"
				calculation4 = calculation4 + "<TD align=center width=75>&nbsp;<B>" + sevenbitdefault[chval] + "</B>&nbsp;"+chval.toString(16)+"</TD>";
				matchcount ++; // AJA
			}

		}
		if (matchcount != truelength){ // Don't forget trailing characters!! AJA
			char_counter++;
			chval = this.binToInt(restArray[i-1]);
			if (!escaped){
				if (char_counter > skip_characters)
					smsMessage = smsMessage + sevenbitdefault[chval];
			}else if (char_counter > skip_characters)
				smsMessage = smsMessage + getSevenBitExtendedCh(chval);

			calculation3 = calculation3 + "<TD align=center width=75><span style='background-color: #FFFF00'>&nbsp;" + restArray[i-1] + "</span>&nbsp;</TD>";
			calculation4 = calculation4 + "<TD align=center width=75>&nbsp;<B>" + sevenbitdefault[this.binToInt(restArray[i-1])] + "</B>&nbsp;"+this.binToInt(restArray[i-1]).toString(16)+"</TD>";
		}else{ // Blank Filler	
			calculation3 = calculation3 + "<TD align=center width=75>+++++++</TD>";
			calculation4 = calculation4 + "<TD align=center width=75>&nbsp;</TD>";
		}

		//Put all the calculation info together
		calculation =  "<b>Conversion of 8-bit octets to 7-bit default alphabet</b><BR><BR>"+calculation0 + "</TR>" +calculation1 + "</TR>" + calculation2 + "</TR></table>" + calculation3 + "</TR>"+ calculation4 + "</TR></table>";

		return smsMessage;
	},

	getUserMessage16 : function (skip_characters, input,truelength){
		var smsMessage = "";
		var char_counter = 0;
		calculation = "Not implemented";

		// Cut the input string into pieces of 4
		for(var i=0;i<input.length;i=i+4){
			var hex1 = input.substring(i,i+2);
			var hex2 = input.substring(i+2,i+4);
			char_counter++;
			if (char_counter > skip_characters)
				smsMessage += "" + String.fromCharCode(HexToNum(hex1)*256+this.HexToNum(hex2));
		}
		return smsMessage;
	},

	getUserMessage8 : function (skip_characters, input,truelength){
		var smsMessage = "";
		calculation = "Not implemented";

		// Cut the input string into pieces of 2 (just get the hex octets)
		for(var i=0;i<input.length;i=i+2)
		{
			var hex = input.substring(i,i+2);
			smsMessage += "" + String.fromCharCode(this.HexToNum(hex));
		}

		return smsMessage;
	},

	explain_toa : function (octet){
		var result = "";
		var p = "reserved";
		var octet_int = parseInt(octet, 16);

		if (octet_int != -1){
			switch ((octet_int & 0x70) >> 4){
				case 0:
					p = "unknown";
					break;
				case 1:
					p = "international";
					break;
				case 2:
					p = "national";
					break;
				case 3:
					p = "network specific";
					break;
				case 4:
					p = "subsciber";
					break;
				case 5:
					p = "alphanumeric";
					break;
				case 6:
					p = "abbreviated";
					break;
			}

			result += p;
			p = "";

			switch (result & 0x0F){
				case 0:
					p = "unknown";
					break;
				case 1:
					p = "ISDN/telephone";
					break;
				case 3:
					p = "data";
					break;
				case 4:
					p = "telex";
					break;
				case 8:
					p = "national";
					break;
				case 9:
					p = "private";
					break;
				case 10:
					p = "ERMES";
					break;
			}

			if (p != "")
				p = "Numbering Plan: " +p;
			result += ", " +p;
		}

		return result;
	},

	explain_status : function (octet){
		var p = "unknown";
		var octet_int = parseInt(octet, 16);

		switch (octet_int){
			case 0: p = "Ok,short message received by the SME"; break;
			case 1: p = "Ok,short message forwarded by the SC to the SME but the SC is unable to confirm delivery"; break;
			case 2: p = "Ok,short message replaced by the SC"; break;

			case 32: p = "Still trying,congestion"; break;
			case 33: p = "Still trying,SME busy"; break;
			case 34: p = "Still trying,no response sendr SME"; break;
			case 35: p = "Still trying,service rejected"; break;
			case 36: p = "Still trying,quality of service not available"; break;
			case 37: p = "Still trying,error in SME"; break;

			case 64: p = "Error,remote procedure error"; break;
			case 65: p = "Error,incompatible destination"; break;
			case 66: p = "Error,connection rejected by SME"; break;
			case 67: p = "Error,not obtainable"; break;
			case 68: p = "Error,quality of service not available"; break;
			case 69: p = "Error,no interworking available"; break;
			case 70: p = "Error,SM validity period expired"; break;
			case 71: p = "Error,SM deleted by originating SME"; break;
			case 72: p = "Error,SM deleted by SC administration"; break;
			case 73: p = "Error,SM does not exist"; break;

			case 96: p = "Error,congestion"; break;
			case 97: p = "Error,SME busy"; break;
			case 98: p = "Error,no response sendr SME"; break;
			case 99: p = "Error,service rejected"; break;
			case 100: p = "Error,quality of service not available"; break;
			case 101: p = "Error,error in SME"; break;
		}

		return p;
	},

	getPDUMetaInfo : function (inp, inDexx){
		if(!inDexx) 
			inDexx=null;
		else
			inDexx=parseInt(inDexx);
		linefeed='\n';
		// console.log(inp, linefeed, ud_start, ud_end)
		var PDUString = inp;
		var start = 0;
		var out="";

		// Silently Strip leading AT command
		if(!PDUString)
			return;
			
		if (PDUString.substr(0,2)=="AT"){
			for(var i=0;i<PDUString.length;i++){
				if(PDUString.charCodeAt(i)==10){
					PDUString = PDUString.substr(i+1);
					break;
				}
			}
		}

		// Silently strip whitespace
		var NewPDU="";
		for(var i=0;i<PDUString.length;i++){
			if (this.MakeNum(PDUString.substr(i,1))!=16){
				NewPDU = NewPDU + PDUString.substr(i,1);
			}
		}
		PDUString = NewPDU;

		var SMSC_lengthInfo = this.HexToNum(PDUString.substring(0,2));
		var SMSC_info = PDUString.substring(2,2+(SMSC_lengthInfo*2));
		var SMSC_TypeOfAddress = SMSC_info.substring(0,2);
		var SMSC_Number = SMSC_info.substring(2,2+(SMSC_lengthInfo*2));

		if (SMSC_lengthInfo != 0)	{
			SMSC_Number = this.semiOctetToString(SMSC_Number);

			// if the length is odd remove the trailing  F
			if((SMSC_Number.substr(SMSC_Number.length-1,1) == 'F') || (SMSC_Number.substr(SMSC_Number.length-1,1) == 'f')){
				SMSC_Number = SMSC_Number.substring(0,SMSC_Number.length-1);
			}
		}

		var start_SMSDeleivery = (SMSC_lengthInfo*2)+2;

		start = start_SMSDeleivery;
		var firstOctet_SMSDeliver = PDUString.substr(start,2);
		start = start + 2;

		var UserDataHeader = 0;
		if ((this.HexToNum(firstOctet_SMSDeliver) & 0x40) == 0x40){
			UserDataHeader = 1;
		}

		var hex_dump = "";

	//	bit1	bit0	Message type
	//	0	0	SMS DELIVER (in the direction SC to MS)
	//	0	0	SMS DELIVER REPORT (in the direction MS to SC)
	//	1	0	SMS STATUS REPORT (in the direction SC to MS)
	//	1	0	SMS COMMAND (in the direction MS to SC)
	//	0	1	SMS SUBMIT (in the direction MS to SC)
	//	0	1	SMS SUBMIT REPORT (in the direction SC to MS)
	//	1	1	Reserved

	// This needs tidying up!! AJA
		var out={};
		if ((this.HexToNum(firstOctet_SMSDeliver) & 0x03) == 1 || (this.HexToNum(firstOctet_SMSDeliver) & 0x03) == 3){  // Transmit Message
			out.Title="SMS SUBMIT (send)";

			if ((this.HexToNum(firstOctet_SMSDeliver) & 0x03) == 3){
				out.title="Unknown Message, Treat as Deliver";
			}

			// out += "Receipt requested: ";
			if ((this.HexToNum(firstOctet_SMSDeliver) & 0x20) == 0x20)
				out.Receipt_requested="yes";
			else
				out.Receipt_requested="no";
			// out += linefeed;

			var MessageReference = this.HexToNum(PDUString.substr(start,2));
			start = start + 2;

			// length in decimals
			var sender_addressLength = this.HexToNum(PDUString.substr(start,2));
			if(sender_addressLength%2 != 0){
				sender_addressLength +=1;
			}
			start = start + 2;

			var sender_typeOfAddress = PDUString.substr(start,2);
			start = start + 2

			var sender_number = this.semiOctetToString(PDUString.substring(start,start+sender_addressLength));

			if((sender_number.substr(sender_number.length-1,1) == 'F') || (sender_number.substr(sender_number.length-1,1) == 'f' )){
				sender_number =	sender_number.substring(0,sender_number.length-1);
			}
			start +=sender_addressLength;

			var tp_PID = PDUString.substr(start,2);
			start +=2;

			var tp_DCS = PDUString.substr(start,2);
			var tp_DCS_desc = this.tpDCSMeaning(tp_DCS);
			start +=2;

			var ValidityPeriod;
			switch( (this.HexToNum(firstOctet_SMSDeliver) & 0x18) ){
				case 0: // Not Present
					ValidityPeriod = "Not Present";
					break;
				case 0x10: // Relative
					ValidityPeriod = "Rel " + this.cValid(this.HexToNum(PDUString.substr(start,2)));
					start +=2;
					break;
				case 0x08: // Enhanced
					ValidityPeriod = "Enhanced - Not Decoded";
					start +=14;
					break;
				case 0x18: // Absolute
					ValidityPeriod = "Absolute - Not Decoded";
					start +=14;
					break;
			}

			// Commonish...
			var messageLength = this.HexToNum(PDUString.substr(start,2));

			start += 2;

			var bitSize = this.DCS_Bits(tp_DCS);
			var userData = "Undefined format";
			var skip_characters = 0;

			if ((bitSize == 7 || bitSize == 16) && UserDataHeader){
				var ud_len = this.HexToNum(PDUString.substr(start,2));

				UserDataHeader = "";
				for (var i = 0; i <= ud_len; i++)
					UserDataHeader += PDUString.substr(start +i *2, 2) +" ";

				if (bitSize == 7)
					skip_characters = (((ud_len + 1) * 8) + 6) / 7;
				else
					skip_characters = (ud_len +1) /2;
			}

			if (bitSize==7){
				userData = this.getUserMessage(skip_characters, PDUString.substr(start,PDUString.length-start),messageLength);
			}else if (bitSize==8){
				userData = this.getUserMessage8(skip_characters, PDUString.substr(start,PDUString.length-start),messageLength);

				for (var i = 0; i < userData.length;i++){
					if (userData.substr(i, 1) >= ' ')
						hex_dump += " "+this.intToHex(userData.charCodeAt(i))+"["+userData.substr(i, 1)+"]&nbsp;";
					else
						hex_dump += " "+this.intToHex(userData.charCodeAt(i))+"[.]&nbsp;";
				}

			}else if (bitSize==16){
				userData = this.getUserMessage16(skip_characters, PDUString.substr(start,PDUString.length-start),messageLength);
			}

			userData = userData.substr(0,messageLength);
			if (bitSize==16){
				messageLength/=2;
			}

			out.SMSC=SMSC_Number;
			out.Receipient=sender_number;
			out.TOA=sender_typeOfAddress+" "+this.explain_toa(sender_typeOfAddress);
			out.Validity=ValidityPeriod;
			out.TP_PID=tp_PID;
			out.TP_DCS=tp_DCS;
			out.TP_DCS_desc=tp_DCS_desc;
			out.Indexs=inDexx;
			if (UserDataHeader != "")
				out.User_Data_Header=UserDataHeader;

			// Show spaces:
			userData = userData.replace(/  /g, '&nbsp; ');
			userData = userData.replace(/  /g, ' &nbsp;');
			userData = userData.replace(/\n /g, '\n&nbsp;');
			userData = userData.replace(/^ /g, '&nbsp;');

					// Show < and >:
			userData = userData.replace(/</g, '&lt;');
			userData = userData.replace(/>/g, '&gt;');

			out.Body=userData;
			out.Length=messageLength;

			if (hex_dump != "")
				out.Hexadecimal_dump=hex_dump;

		} else if ((this.HexToNum(firstOctet_SMSDeliver) & 0x03) == 0){ // Receive Message			
			out.Title = "SMS DELIVER (receive)";

			// out += "Receipt requested: ";
			if ((this.HexToNum(firstOctet_SMSDeliver) & 0x20) == 0x20)
				out.Receipt_requested= "yes";
			else
				out.Receipt_requested= "no";
			// out += linefeed;

			// length in decimals
			var sender_addressLength = this.HexToNum(PDUString.substr(start,2));

			start = start + 2;

			var sender_typeOfAddress = PDUString.substr(start,2);
			start = start + 2

			var sender_number;
			if (sender_typeOfAddress == "D0"){
				_sl = sender_addressLength;

				if(sender_addressLength%2 != 0){
					sender_addressLength +=1;
				}
				sender_number = this.getUserMessage(0, PDUString.substring(start,start+sender_addressLength),parseInt(_sl/2*8/7));
			}else{

				if(sender_addressLength%2 != 0){
					sender_addressLength +=1;
				}

				sender_number = this.semiOctetToString(PDUString.substring(start,start+sender_addressLength));

				if((sender_number.substr(sender_number.length-1,1) == 'F') || (sender_number.substr(sender_number.length-1,1) == 'f' )){
					sender_number =	sender_number.substring(0,sender_number.length-1);
				}
			}
			start +=sender_addressLength;

			var tp_PID = PDUString.substr(start,2);
			start +=2;

			var tp_DCS = PDUString.substr(start,2);
			var tp_DCS_desc = this.tpDCSMeaning(tp_DCS);
			start +=2;

			var timeStamp = this.semiOctetToString(PDUString.substr(start,14));

			// get date
			var year = timeStamp.substring(0,2);
			var month = timeStamp.substring(2,4);
			var day = timeStamp.substring(4,6);
			var hours = timeStamp.substring(6,8);
			var minutes = timeStamp.substring(8,10);
			var seconds = timeStamp.substring(10,12);
			var timezone = timeStamp.substring(12,14);

			timeStamp = '20' +year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds //+ " GMT " +this.decode_timezone(timezone);

			start +=14;

			// Commonish...
			var messageLength = this.HexToNum(PDUString.substr(start,2));
			start += 2;

			var bitSize = this.DCS_Bits(tp_DCS);
			var userData = "Undefined format";
			var skip_characters = 0;

			if ((bitSize == 7 || bitSize == 16) && UserDataHeader){
				var ud_len = this.HexToNum(PDUString.substr(start,2));

				UserDataHeader = "";
				for (var i = 0; i <= ud_len; i++)
					UserDataHeader += PDUString.substr(start +i *2, 2) +" ";

				if (bitSize == 7)
					skip_characters = (((ud_len + 1) * 8) + 6) / 7;
				else
					skip_characters = (ud_len +1) /2;
			}

			if (bitSize==7){
				userData = this.getUserMessage(skip_characters, PDUString.substr(start,PDUString.length-start),messageLength);
			}else if (bitSize==8){
				userData = this.getUserMessage8(skip_characters, PDUString.substr(start,PDUString.length-start),messageLength);

				for (var i = 0; i < userData.length;i++){
					if (userData.substr(i, 1) >= ' ')
						hex_dump += " "+this.intToHex(userData.charCodeAt(i))+"["+userData.substr(i, 1)+"]&nbsp;";
					else
						hex_dump += " "+this.intToHex(userData.charCodeAt(i))+"[.]&nbsp;";
				}

			}else if (bitSize==16){
				userData = this.getUserMessage16(skip_characters, PDUString.substr(start,PDUString.length-start),messageLength);
			}

			userData = userData.substr(0,messageLength);

			if (bitSize==16){
				messageLength/=2;
			}

			out.SMSC=SMSC_Number;
			out.Sender=sender_number;
			out.TOA=sender_typeOfAddress+" "+this.explain_toa(sender_typeOfAddress);
			out.TimeStamp=timeStamp;
			out.TP_PID=tp_PID;
			out.TP_DCS=tp_DCS;
			out.TP_DCS_desc=tp_DCS_desc;
			out.Indexs=inDexx;
			if (UserDataHeader != "")
				out.User_Data_Header=UserDataHeader;

			// Show spaces:
			userData = userData.replace(/  /g, '&nbsp; ');
			userData = userData.replace(/  /g, ' &nbsp;');
			userData = userData.replace(/\n /g, '\n&nbsp;');
			userData = userData.replace(/^ /g, '&nbsp;');

			out.Body=userData;
			out.Length=messageLength;

			if (hex_dump != "")
				out['Hexadecimal dump']=hex_dump;
		}else{
			out.Title = "SMS STATUS REPORT";
			out.Indexs=inDexx;
			var MessageReference = this.HexToNum(PDUString.substr(start,2)); // ??? Correct this name
			start = start + 2;

			// length in decimals
			var sender_addressLength = this.HexToNum(PDUString.substr(start,2));
			if(sender_addressLength%2 != 0){
				sender_addressLength +=1;
			}
			start = start + 2;

			var sender_typeOfAddress = PDUString.substr(start,2);
			start = start + 2

			var sender_number = this.semiOctetToString(PDUString.substring(start,start+sender_addressLength));

			if((sender_number.substr(sender_number.length-1,1) == 'F') || (sender_number.substr(sender_number.length-1,1) == 'f' )){
				sender_number =	sender_number.substring(0,sender_number.length-1);
			}
			start +=sender_addressLength;

			var timeStamp = this.semiOctetToString(PDUString.substr(start,14));

			// get date
			var year = timeStamp.substring(0,2);
			var month = timeStamp.substring(2,4);
			var day = timeStamp.substring(4,6);
			var hours = timeStamp.substring(6,8);
			var minutes = timeStamp.substring(8,10);
			var seconds = timeStamp.substring(10,12);
			var timezone = timeStamp.substring(12,14);

			timeStamp = '20'+year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds //+ " GMT " +this.decode_timezone(timezone);
			start +=14;

			var timeStamp2 = this.semiOctetToString(PDUString.substr(start,14));

			// get date
			var year2 = timeStamp2.substring(0,2);
			var month2 = timeStamp2.substring(2,4);
			var day2 = timeStamp2.substring(4,6);
			var hours2 = timeStamp2.substring(6,8);
			var minutes2 = timeStamp2.substring(8,10);
			var seconds2 = timeStamp2.substring(10,12);
			var timezone2 = timeStamp2.substring(12,14);

			timeStamp2 = '20'+year2 + "-" + month2 + "-" + day2 + " " + hours2 + ":" + minutes2 + ":" + seconds2 //+ " GMT " +this.decode_timezone(timezone2);
			start +=14;

			var mStatus = PDUString.substr(start,2);

			out.SMSC=SMSC_Number;
			out.Sender=sender_number;
			out.TOA=sender_typeOfAddress+" "+this.explain_toa(sender_typeOfAddress);
			out.Message_Ref=MessageReference;
			out.TimeStamp=timeStamp
			out.Discharge_Timestamp=timeStamp2
			out.Status=mStatus +" " +this.explain_status(mStatus);

		}
		// console.log(out);
		return out;
		
	},

	stringToPDU : function (data){ // AJA fixed SMSC processing
		out={}
		// console.log(data);
		if (!data.inpString)
			inpString='';
		else 
			inpString=data.inpString;

		if (!data.phoneNumber)
			phoneNumber=''
		else
			phoneNumber=data.phoneNumber;

		if (!data.smscNumber)
			smscNumber=''
		else
			smscNumber=data.smscNumber;

		if (!data.size){
			// size=[
			// 	{
			// 		value : 7,
			// 		checked : true
			// 	},
			// 	{
			// 		value : 8,
			// 		checked : false
			// 	},
			// 	{
			// 		value : 16,
			// 		checked : false
			// 	},
			// ];
			size=7;
		}else{
			size=data.size;
		}

		if (!data.mclass) 
			mclass=-1
		else
			mclass=data.mclass;

		if (!data.to_toa)
			to_toa=-1
		else
			to_toa=data.to_toa;

		if (!data.valid)
			valid=255
		else
			valid=data.valid;

		if(!data.receipt) {
			receipt={
				checked:false
			};
		}else{a
			receipt=data.receipt;
		}

		// Tambahan
		if(!data.vFlag){
			vFlag={
				checked:true
			};
		}else{
			vFlag=data.vFlag;
		}
		// console.log(inpString,phoneNumber,smscNumber,size,mclass,to_toa,valid,receipt);
		var bitSize = 7;//size[0].value * size[0].checked | size[1].value * size[1].checked | size[2].value * size[2].checked;
		// caonsole.log(bitSize);
		var octetFirst = "";
		var octetSecond = "";
		var output = "";

		//Make header
		var SMSC_INFO_LENGTH = 0;
		var SMSC_LENGTH = 0;
		var SMSC_NUMBER_FORMAT = "";
		var SMSC = "";
		if (smscNumber != 0){
			SMSC_NUMBER_FORMAT = "81"; // national

			if (smscNumber.substr(0,1) == '+'){
				SMSC_NUMBER_FORMAT = "91"; // international
				smscNumber = smscNumber.substr(1);
			}else if (smscNumber.substr(0,1) !='0'){
				SMSC_NUMBER_FORMAT = "91"; // international
			}

			if(smscNumber.length%2 != 0){
				// add trailing F
				smscNumber += "F";
			}

			SMSC = this.semiOctetToString(smscNumber);
			SMSC_INFO_LENGTH = ((SMSC_NUMBER_FORMAT + "" + SMSC).length)/2;
			SMSC_LENGTH = SMSC_INFO_LENGTH;

		}
		if(SMSC_INFO_LENGTH < 10){
			SMSC_INFO_LENGTH = "0" + SMSC_INFO_LENGTH;
		}
		var firstOctet; // = "1100";

		if (receipt.checked){
			if (vFlag.checked){
				firstOctet = "3100"; // 18 is mask for validity period // 10 indicates relative
			}else{
				firstOctet = "2100";
			}
		}else{
			if (vFlag.checked){
				firstOctet = "1100";
			}else{
				firstOctet = "0100";
			}
		}

		var REIVER_NUMBER_FORMAT = "81"; // (national) 81 is "unknown"
		if (phoneNumber.substr(0,1) == '+'){
			REIVER_NUMBER_FORMAT = "91"; // international
			phoneNumber = phoneNumber.substr(1); //,phoneNumber.length-1);
		}else if (phoneNumber.substr(0,1) !='0'){
			REIVER_NUMBER_FORMAT = "91"; // international
		}

		switch (to_toa){
			case "145":
				REIVER_NUMBER_FORMAT = "91"; // international
				break;

			case "161":
				REIVER_NUMBER_FORMAT = "A1"; // national
				break;

			case "129":
				REIVER_NUMBER_FORMAT = "81"; // unknown
				break;
		}

		var REIVER_NUMBER_LENGTH = this.intToHex(phoneNumber.length);

		if(phoneNumber.length%2 != 0){
			// add trailing F
			phoneNumber += "F";
		}

		var REIVER_NUMBER = this.semiOctetToString(phoneNumber);
		var PROTO_ID = "00";
		var DCS=0;
		if (mclass != -1){ // AJA
			DCS = mclass | 0x10;
		}
		switch(bitSize){
			case 7:
				break;
			case 8:
				DCS = DCS | 4;
				break;
			case 16:
				DCS = DCS | 8;
				break;

			default:
				console.log("Invalid Alphabet Size");
				return "";
		}

		// document.getElementById('ussdText').value = "";
		// document.getElementById('pduTool').cell_broadcast.checked = false;

		var DATA_ENCODING = this.intToHex(DCS);
	//	var DATA_ENCODING = "00"; // Default
	//	if (bitSize == 8)
	//	{
	//		DATA_ENCODING = "04";
	//	}
	//	else if (bitSize == 16)
	//	{
	//		DATA_ENCODING = "08";
	//	}

		var VALID_PERIOD = ""; // AA
		if (vFlag.checked){
			VALID_PERIOD = this.intToHex(valid); // AA
		}

		var userDataSize;
		if (bitSize == 7){
			var tmp = inpString;
			var inpStr = "";

			for (var i = 0; i < tmp.length; i++){
				if (this.getSevenBitExt(tmp.charAt(i)))
					inpStr += String.fromCharCode(0x1B);

				inpStr += tmp.charAt(i);
			}

			inpStr = inpStr.substring(0, maxChars);

			userDataSize = this.intToHex(inpStr.length);

			for (var i = 0; i <= inpStr.length; i++){
				if (i == inpStr.length){
					if (octetSecond != ""){ // AJA Fix overshoot
						output = output + "" + (this.intToHex(this.binToInt(octetSecond)));
					}
					break;
				}

				//var current = intToBin(getSevenBit(inpStr.charAt(i)),7);

				if (inpStr.charAt(i) == String.fromCharCode(0x1B))
					current = this.intToBin(0x1B,7);
				else
				{
					tmp = this.getSevenBitExt(inpStr.charAt(i));
					if (tmp == 0)
						tmp = this.getSevenBit(inpStr.charAt(i));
					else
						tmp = this.getSevenBitExt(inpStr.charAt(i));

					current = this.intToBin(tmp,7);
				}

				var currentOctet;
				if(i!=0 && i%8!=0){
					octetFirst = current.substring(7-(i)%8);
					currentOctet = octetFirst + octetSecond;	//put octet parts together

					output = output + "" + (this.intToHex(this.binToInt(currentOctet)));
					octetSecond = current.substring(0,7-(i)%8);	//set net second octet
				}else{
					octetSecond = current.substring(0,7-(i)%8);
				}
			}

			out['ussdText']=this.encodeGSM7bitPacked(inpString);
		}else if (bitSize == 8){
			userDataSize = intToHex(inpString.length);

			var CurrentByte = 0;
			for(var i=0;i<inpString.length;i++){
				CurrentByte = this.getEightBit(inpString.charCodeAt(i));
				output = output + "" + ( ToHex( CurrentByte ) );
			}
		}else if (bitSize == 16){
			userDataSize = this.intToHex(inpString.length * 2);

			var myChar=0;
			var ussd = "";

			for(var i=0;i<inpString.length;i++)	{
				myChar = this.get16Bit( inpString.charCodeAt(i) );
				output = output + "" + ( this.ToHex( (myChar&0xff00)>>8 )) + ( this.ToHex( myChar&0xff ) );
				ussd += ( this.ToHex( (myChar&0xff00)>>8 )) + ( this.ToHex( myChar&0xff ) );
			}
			out['ussdText'] = ussd;
			//this.change_ussd(16);
		}

		var header = SMSC_INFO_LENGTH + SMSC_NUMBER_FORMAT + SMSC + firstOctet + REIVER_NUMBER_LENGTH + REIVER_NUMBER_FORMAT  + REIVER_NUMBER +  PROTO_ID + DATA_ENCODING + VALID_PERIOD + userDataSize;

		var PDU = header + output;

		var AT = "AT+CMGS=" + (PDU.length/2 - SMSC_LENGTH - 1) ; // Add /2 for PDU length AJA - I think the SMSC information should also be excluded
		out['CMGS']=AT
		out['pduMessage']=[PDU];
		return out;
	},

	encodeGSM7bitPacked : function (inpString){
		var octetFirst = "";
		var octetSecond = "";
		var output = "";
		var padding = String.fromCharCode(0x0D);
		var tmp = inpString;
		var inpStr = "";

		for (var i = 0; i < tmp.length; i++)
		{
			if (this.getSevenBitExt(tmp.charAt(i)))
				inpStr += String.fromCharCode(0x1B);

			inpStr += tmp.charAt(i);
		}

		var len = inpStr.length;
		if ((len % 8 == 7) || (len % 8 == 0 && len > 0 && inpStr.charAt(len - 1) == padding))
			inpStr += padding;

		for (var i = 0; i <= inpStr.length; i++)
		{
			if (i == inpStr.length)
			{
				if (octetSecond != "") // AJA Fix overshoot
				{
					output = output + "" + (this.intToHex(this.binToInt(octetSecond)));
				}
				break;
			}

			if (inpStr.charAt(i) == String.fromCharCode(0x1B))
				current = this.intToBin(0x1B,7);
			else
			{
				tmp = this.getSevenBitExt(inpStr.charAt(i));
				if (tmp == 0)
					tmp = this.getSevenBit(inpStr.charAt(i));
				else
					tmp = this.getSevenBitExt(inpStr.charAt(i));

				current = this.intToBin(tmp,7);
			}

			var currentOctet;
			if(i!=0 && i%8!=0)
			{
				octetFirst = current.substring(7-(i)%8);
				currentOctet = octetFirst + octetSecond;	//put octet parts together

				output = output + "" + (this.intToHex(this.binToInt(currentOctet)));
				octetSecond = current.substring(0,7-(i)%8);	//set net second octet
			}
			else
			{
				octetSecond = current.substring(0,7-(i)%8);
			}
		}

		return output;
		// change_ussd(7);

		// document.getElementById('pduTool').cell_broadcast.checked = false;
	},

	decode_ussdText : function (data){
		if(!data.inpString)
			inpString=';'
		else
			inpString=data.inpString;

		if(!data.is_cell_broadcast)
			is_cell_broadcast=false;	
		else
			is_cell_broadcast=data.is_cell_broadcast;

		if (!data.elem){
			elem=[
				{
					value : 7,
					checked : true
				},
				{
					value : 8,
					checked : false
				},
				{
					value : 16,
					checked : false
				},
			];
		}else{
			elem=data.elem;
		}
		
		var bitSize = elem[0].value * elem[0].checked | elem[1].value * elem[1].checked;
		// console.log(elem);
		// console.log(bitSize);
		if (bitSize == 7)
			return this.decodeGSM7bitPacked(inpString, is_cell_broadcast);

		if (bitSize == 16){
			var result_prefix = "";
			var NewString = "";
			for(var i = 0; i < inpString.length;i++)
				if (this.MakeNum(inpString.substr(i, 1)) != 16)
					NewString += inpString.substr(i,1);
			inpString = NewString;

			var i = inpString.length;

			if (i % 2)
				return "ERROR: Length is not even";

			if (is_cell_broadcast){
				if (i < 14)
					return "ERROR: Too short";

				result_prefix += this.explain_cell_broadcast(inpString);

				inpString = inpString.substring(12);
			}

			var messagelength = inpString.length / 2;
			var buffer = this.getUserMessage16(0, inpString, messagelength);
			var info = "";

			return '<B>USSD/User Data without length information</B>\nAlphabet: UCS2\n'+result_prefix+'\n<BIG>'+buffer+"</BIG>\nLength: "+messagelength/2+info;
		}

		return "ERROR";
	},

	decodeGSM7bitPacked : function (inpString, is_cell_broadcast){
		var result_prefix = "";

		var NewString = "";
		for(var i = 0; i < inpString.length;i++)
			if (this.MakeNum(inpString.substr(i, 1)) != 16)
				NewString += inpString.substr(i,1);
		inpString = NewString;

		var i = inpString.length;

		if (i % 2)
			return "ERROR: Length is not even";

		if (is_cell_broadcast){
			if (i < 14)
				return "ERROR: Too short";

			result_prefix += this.explain_cell_broadcast(inpString);

			inpString = inpString.substring(12);
			i = inpString.length;
		}

		var septets = Math.floor(i / 2 * 8 / 7);
		var buffer = this.getUserMessage(0, inpString, septets);
		var len = buffer.length;
		var padding = String.fromCharCode(0x0D);
		var info = "";

		if ((septets % 8 == 0 && len > 0 && buffer.charAt(len -1) == padding) || (septets % 8 == 1 && len > 1 && buffer.charAt(len -1) == padding && buffer.charAt(len -2) == padding))	{
			buffer = buffer.substring(0, len -1);
			info = "<BR><SMALL>( Had padding which is removed )</SMALL>";
		}
		out={};
		out.Title='USSD/User Data without length information';
		out.Prefix=result_prefix;
		out.Body=buffer;
		out.Length=buffer.length;
		out.Info=info;
		// return '<B>USSD/User Data without length information</B>\nAlphabet: GSM 7bit\n'+result_prefix+'\n<BIG>'+buffer+"</BIG>\nLength: "+buffer.length+info;
		return out;
	}


}