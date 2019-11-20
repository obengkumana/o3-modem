#!/usr/bin/env node

'use strict'

const args = require('commander')
const modem = require('./index').Modem()

const makeNumber = input => Number(input)

args
  .version('1.0.0')
  .usage('-p <port> [options]')
  .description('O3 Modem\nPowered by Obengkumana Engine 2019\nCommand sms dan dial USSD. Pess ^C to exit.')
  .option('-l --list', 'Listing port')
  .option('-c --console', 'Console Serial port')
  .option('-p, --port <port>', 'Location or nama of serial port')
  .option('-b, --baud <baudrate>', 'Baud rate default: 115200', makeNumber, 115200)
  .option('--databits <databits>', 'Data bits default: 8', makeNumber, 8)
  .option('--parity <parity>', 'Parity default: none', 'none')
  .option('--stopbits <bits>', 'Stop bits default: 1', makeNumber, 1)
  .option('--dialmode <dialmode>', 'Dial mode, default: gsm7', 'gsm7')
  .option('--echo --localecho', 'Show echo from keyboard.')
  .option('-s --sms', 'SMS Option.')
  .option('-u, --ussd <ussd>', 'Number of  dial USSD.')
  .option('-um, --ussdmulti <multi>', ' Multi dial USSD. Delimiter with "|" ex : *123#|1|2')
  .option('--to   <tonumber>', 'Nomor Tujuan SMS.')
  .option('--text   <text>', 'Text SMS')
  .parse(process.argv)

modem.openOptions.baudRate =args.baud
modem.openOptions.dataBits = args.databits
modem.openOptions.parity = args.parity
modem.openOptions.stopBits = args.stopbits

const ussd = () => {
  if (!args.port) {
    args.outputHelp()
    args.missingArgument('port')
    process.exit(-1)
  }

  modem.ussd_send = args.dialmode

  modem.open(args.port, () => {
    modem.on('data', data => {
      if (data) console.log(data)
    })
    
    const ADial = args.ussd.split('|')
    let IProc = 0

    ADial.forEach(Dial => {
      modem.sendUSSD(Dial, (_fullussd, d) => {
        IProc++
        console.log(`Respon USSD : ${Dial}`);
        if (d.Body) {
          console.log(d.Body);
          if (d.Body.trim() === '+CUSD: 4') modem.close()
        }
        
        if (IProc === ADial.length) modem.close()
      })
    })
  })
}

if (args.ussd) ussd()
args.outputHelp()