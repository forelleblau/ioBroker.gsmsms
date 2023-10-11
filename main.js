'use strict';

/*
 * Created with @iobroker/create-adapter v2.0.1
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');
const serialportgsm = require('serialport-gsm');

// Load your modules here, e.g.:
// const fs = require("fs");
const gsmModem = serialportgsm.Modem();
//
//
let port;
//var connectionMode;
//var pollinginterval;

//let polling;

let autoDeleteOnReceive = false;
let enableConcatenation = true;
let incomingCallIndication = false;
let incomingSMSIndication = true;
let pin = '';
let customInitCommand = '';
let cnmiModemOpen = '';
let cnmiModemClosed = '';
let getSignalQuality = false;
let pollinginterval = 30;

let baudRate = 19200;
let dataBits = 8;
let stopBits = 1;
let parity = 'none';
let rtscts = false;
let xon = false;
let xoff = false;
let xany = false;

let options;

const ownPhone = {
  name: '',
  number: ''
};

let opMode = 'PDU';

let messageRawJson = {
  recipient: '',
  message: '',
  alert: false
};

let gettingSignals;

/*
var reinitialize = {
  "indicator": false,
  "id": '',
  "state": ''
};

*/

//var highWaterMark = 16384; Prüfen ob als 'option'nötig:  The size of the read and write buffers defaults to 16k. |

class Gsmsms extends utils.Adapter {

  /**
   * @param {Partial<utils.AdapterOptions>} [options={}]
   */
  constructor(options) {
    super({
      ...options,
      name: 'gsmsms',
    });
    this.on('ready', this.onReady.bind(this));
    this.on('stateChange', this.onStateChange.bind(this));
    // this.on('objectChange', this.onObjectChange.bind(this));
    this.on('message', this.onMessage.bind(this));
    this.on('unload', this.onUnload.bind(this));
    //this.on('log', this.onLog.bind(this));
  }

  /**
   * Is called when databases are connected and adapter received configuration.
   */

  async onMessage(obj) {
    try {
      this.log.debug('Recieved Message, data: ' + JSON.stringify(obj));
      const messageToSend = {
        recipient: 'Number',
        message: 'Yourtext',
        alert: 'false'
      };
      messageToSend.recipient = obj.message.recipient;
      messageToSend.message = obj.message.text;
      messageToSend.alert = obj.message.alert;

      await this.sending(messageToSend);

    } catch (e) {
      this.log.warn('Error onMessage' + e);
    }



    //Recieved Message, data: {"command":"send","message":{"text":"Testsms","number":"0798233954"},"from":"system.adapter.javascript.0","_id":70000864}


  } //end onMessage

  /*async onLog(logObject) {
    // Here we have the log in "logObject" and can handle it accordingly.
    // LogObject: {from:'testlog.0', message: 'testlog.0 (12504) adapter disabled', severity: 'error', ts:1585413238439}

    if (logObject.severity == 'debug' && logObject.from == 'gsmsms.' + this.instance && logObject.message.includes('RSSI') == true) {
      //this.log.info("RSSI - Message:" + logObject.message);
      var sigQual = logObject.message.slice(-2);
      this.log.info("RSSI - NEW:" + sigQual);
      this.setState('info.signalQuality', parseInt(sigQual), true);

    }
    //const severity = logObject.severity; // the log level (severity): info, warn, error, etc.
    // ....
  } // end onLog
*/
  async onReady() {
    try {
      // Initialize your adapter here

      // The adapters config (in the instance object everything under the attribute "native") is accessible via
      // this.config:

      port = this.config.port;
      //connectionMode = this.config.connectionMode;
      //pollinginterval = this.config.pollinginterval * 60000;

      autoDeleteOnReceive = this.config.autoDeleteOnReceive;
      enableConcatenation = this.config.enableConcatenation;
      incomingCallIndication = this.config.incomingCallIndication;
      incomingSMSIndication = this.config.incomingSMSIndication;
      pin = this.config.pin;
      customInitCommand = this.config.customInitCommand;
      cnmiModemOpen = 'AT+CNMI=' + this.config.cnmiModemOpen;
      cnmiModemClosed = 'AT+CNMI=' + this.config.cnmiModemClosed;
      getSignalQuality = this.config.getSignalQuality;
      pollinginterval = this.config.pollinginterval * 1000;


      baudRate = this.config.baudRate;
      dataBits = this.config.dataBits;
      stopBits = this.config.stopBits;
      parity = this.config.parity;
      rtscts = this.config.rtscts;
      xon = this.config.xon;
      xoff = this.config.xoff;
      xany = this.config.xany;

      this.log.debug('port' + port);
      //this.log.debug('connectionMode: ' + connectionMode);
      //this.log.debug('pollinginterval: ' + pollinginterval + " min");

      this.log.debug('autoDeleteOnReceive: ' + autoDeleteOnReceive);
      this.log.debug('enableConcatenation: ' + enableConcatenation);
      this.log.debug('incomingCallIndication: ' + incomingCallIndication);
      this.log.debug('incomingSMSIndication: ' + incomingSMSIndication);
      this.log.debug('pin: ' + pin);
      this.log.debug('customInitCommand: ' + customInitCommand);
      this.log.debug('cnmiModemOpen: ' + cnmiModemOpen);
      this.log.debug('cnmiModemClosed: ' + cnmiModemClosed);
      this.log.debug('getSignalQuality: ' + getSignalQuality);
      this.log.debug('pollinginterval: ' + pollinginterval);


      this.log.debug('baudRate: ' + baudRate);
      this.log.debug('dataBits: ' + dataBits);
      this.log.debug('stopBits: ' + stopBits);
      this.log.debug('parity: ' + parity);
      this.log.debug('rtscts: ' + rtscts);
      this.log.debug('xon: ' + xon);
      this.log.debug('xoff: ' + xoff);
      this.log.debug('xany: ' + xany);

      this.subscribeStates('admin.*');
      this.subscribeStates('sendSMS.send');
      this.subscribeStates('sendSMS.messageRaw');

      options = {
        baudRate: baudRate,
        dataBits: dataBits,
        parity: parity,
        stopBits: stopBits,
        rtscts: rtscts,
        xon: xon,
        xoff: xoff,
        xany: xany,
        autoDeleteOnReceive: autoDeleteOnReceive,
        enableConcatenation: enableConcatenation,
        incomingCallIndication: incomingCallIndication,
        incomingSMSIndication: incomingSMSIndication,
        pin: pin,
        customInitCommand: customInitCommand,
        logger: this.log,
        cnmiCommand: cnmiModemOpen
      };

      await this.modemInitialize();

      /*
            if (connectionMode == 'polling') {
              polling = setInterval(() => { // poll states every [10] minute
                this.log.debug("Initialize modem to check new messages")
                this.modemInitialize(this.startup.bind(this));
              }, pollingTime);
            } // endIf
      */

    } catch (e) {
      this.log.warn('Error onReady' + e);
    }
  } //end onReady

  async modemInitialize() {

    gsmModem.on('open', () => {
      this.log.debug('GSM-Modem successfully opened');

      // now we initialize the GSM Modem
      gsmModem.initializeModem((msg, err) => {
        if (err) {
          this.log.warn(`Error initializing GSM-modem - ${err}`);
          this.setState('info.error', JSON.stringify(err), true);
        } else {
          this.log.debug(`Modem initialized: ${JSON.stringify(msg)}`);
          if (msg.status === 'success') {
            this.log.info(JSON.stringify(msg.data));
            this.setState('info.connection', true, true);
            this.startup();
          } else {
            this.log.warn(`Error initializing GSM-modem - pls check: ${msg}`);
            this.setState('info.error', JSON.stringify(msg), true);
          }
        }
      });
    });

    gsmModem.on('onNewMessageIndicator', datanmi => {
      //indicator for new message only (sender, timeSent)
      this.log.debug(`Event New Message Indication: ` + JSON.stringify(datanmi));
    });

    gsmModem.on('onNewMessage', datanm => {
      //whole message data
      this.log.info(`Event New Message: ` + JSON.stringify(datanm));
      this.log.debug('sender: ' + datanm[0]['sender']);
      this.log.debug('text: ' + datanm[0]['message']);
      this.setState('inbox.messageSender', '+' + datanm[0]['sender'], true);
      this.setState('inbox.messageText', datanm[0]['message'], true);
      this.setState('inbox.messageDate', (datanm[0]['dateTimeSent']).toString(), true);
      this.setState('inbox.messageRaw', JSON.stringify(datanm[0]), true);

    });

    gsmModem.on('onSendingMessage', data => {
      //whole message data
      this.log.info(`Event Sending Message: ` + JSON.stringify(data));

    });

    ///incomingCall auf false als standard!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    /*
            gsmModem.on('onNewIncomingCall', data => {
              //whole message data
              this.log.debug(`Event Incoming Call: ` + JSON.stringify(data));
            });

    */

    //löschen bei Empfang auf standard  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    gsmModem.on('onMemoryFull', data => {
      //whole message data
      this.log.debug(`Event Memory Full: ` + JSON.stringify(data));
    });

    gsmModem.on('close', data => {
      //whole message data
      this.log.info(`Event Close: ` + JSON.stringify(data));
      try {
        this.setState('info.connection', false, true);
      } catch (err) {
        // ignore
      }
    });

    try {
      //Fehler: Wenn funktion erfolgreich aber rÃ¼ckmeldung ein 'ERROR' in 'result', dann auffangen und auf connection.error setzen.
      // this.setStateAsync('connection.error', err, true);

      const msg = await gsmModem.open(port, options);
      this.log.debug(`Modem msg: ${JSON.stringify(msg)}`);
      if (msg.status === 'success') {
        this.log.info('Modem opened successfully, Port: ' + JSON.stringify(msg.data.modem) + ' Status: ' + JSON.stringify(msg.data.status));
      } else {
        this.log.warn(`Problems opening, please check: ${JSON.stringify(msg)} `);
        this.setState('info.error', JSON.stringify(msg), true);
      }
    } catch (err) {
      this.log.warn(`Error opening - ${JSON.stringify(err)} - pls check your settings (port, serial connection) and restart the instance`);
      this.setState('info.error', JSON.stringify(err), true);
    }

  } //end modemInitialize()

  async startup() {

    try {
      const opModeState = await this.getStateAsync('admin.opMode');
      if (opModeState && (opModeState.val === 'PDU' || opModeState.val === 'SMS')) {
        opMode = opModeState.val;
      }
      this.log.debug(`Configuring Modem for mode: ${opMode}`);

      // set mode to PDU mode to handle SMS
      let msg;
      try {
        msg = await gsmModem.setModemMode(undefined, opMode);
      } catch (err) {
        this.log.warn(`Error setting GSM-Modem mode - ${err}`);
        this.setState('info.error', JSON.stringify(err), true);
        return;
      }

      this.log.debug(`Set operation mode: ${JSON.stringify(msg)}`);
      if (msg.status === 'success') {
        const returnedOpMode = msg.data.slice(0, 3);
        if (returnedOpMode !== opMode) {
          this.log.info('Operating mode changed to: ' + returnedOpMode);
        }
        opMode = returnedOpMode;
        this.setState('info.opMode', opMode, true);
        this.setState('admin.opMode', opMode, true);
      } else {
        this.log.warn('Setting operating mode not successful! Error: ' + JSON.stringify(msg));
        this.setState('info.error', JSON.stringify(msg), true);
      }

      // get the Network signal strength & quality
      await this.getSignals();

      if (getSignalQuality && !gettingSignals) {
        gettingSignals = setInterval(() => {
          this.getSignals();
        }, pollinginterval);
      }

      // get Modem Serial Number
      try {
        const result = await gsmModem.getModemSerial();
        this.log.debug(`GSM modem Serial: ${JSON.stringify(result)}`);
        this.setState('info.modemSerial', parseInt(result.data.modemSerial), true);
        //this.execATSL('CNMI', cnmiModemOpen)
      } catch (err) {
        this.log.warn(`Error retrieving GSM modem serial - ${err}`);
        this.setState('info.error', JSON.stringify(err), true);
      }

      // get the Own Number of the Modem   gsmModem.setOwnNumber('+41798233954');
      await this.getNameNumber();
      await this.readSIM();

    } catch (e) {
      this.log.warn('Error startup ' + e);
    }
  } //end startup()

  async getSignals() {
    try {
      const result = await gsmModem.getNetworkSignal();
      this.log.debug(`GSM signal strength: ${JSON.stringify(result)}`);
      if (result.status === 'success') {
        this.setState('info.signalQuality', parseInt(result.data.signalQuality), true);
        this.setState('info.signalStrength', parseInt(result.data.signalStrength), true);
      } else {
        this.log.warn('Problem retrieving GSM signal strength: ' + JSON.stringify(result));
        this.setState('info.error', JSON.stringify(result), true);
      }
    } catch (err) {
      this.log.warn(`Error retrieving GSM signal strength - ${err}`);
      this.setState('info.error', JSON.stringify(err), true);
    }
  } //end getSignals


  async readSIM() {
    try {
      // get info about stored Messages on SIM card
      const resultSimMem = await gsmModem.checkSimMemory();
      this.log.debug(`Sim Memory Result: ${JSON.stringify(resultSimMem)}`);
    } catch (err) {
      this.log.warn(`Failed to get SimMemory ${err}`);
      this.setState('info.error', JSON.stringify(err), true);
    }

    try {
      // read the whole SIM card inbox
      const result = await gsmModem.getSimInbox();
      this.log.debug(`Sim Inbox Result: ${JSON.stringify(result)}`);
      let messageNr = 0;
      if (result.status === 'success' && result.data.length > 0) {
        for (const message of result.data) {
          this.setState('inbox.messageSender', message['sender'], true);
          this.setState('inbox.messageText', message['message'], true);
          this.setState('inbox.messageDate', message['dateTimeSent'].toString(), true);
          this.setState('inbox.messageRaw', JSON.stringify(message), true);
          this.log.info('saved message Nr ' + (messageNr + 1) + ': ' + JSON.stringify(message));

          if (autoDeleteOnReceive) {
            try {
              await this.deleteMessage(message);
            } catch (err) {
              this.log.warn(`Error deleting message ${err}`);
              this.setState('info.error', JSON.stringify(err), true);
            }
          }
          messageNr++;

          await (new Promise(resolve => setTimeout(resolve, 1000)));
        }
        this.log.info('All saved messages processed');
      } else {
        this.log.info('No saved messages to process');
      }

      // was passiert wenn sim voll??
      //this.execATSL('CNMI', cnmiModemOpen)
    } catch (err) {
      this.log.warn(`Failed to get SimInbox ${err}`);
      this.setState('info.error', JSON.stringify(err), true);
    }

  } //end readSIM


  async deleteAll() {
    try {
      const result = await gsmModem.deleteAllSimMessages();
      this.log.debug(`Delete Result: ${JSON.stringify(result)}`);
      if (result.status === 'success') {
        this.log.info('All messages on SIM deleted');
      } else {
        this.log.warn('Deleting Messages not successful, pls check: ' + JSON.stringify(result));
        this.setState('info.error', JSON.stringify(result), true);
      }
    } catch (err) {
      this.log.warn(`Failed to delete Message ${err}`);
      this.setState('info.error', JSON.stringify(err), true);
    }
  } //end deleteAll

  async deleteMessage(msg) {
    try {
      const result = await gsmModem.deleteMessage(msg);
      this.log.debug(`Delete Result: ${JSON.stringify(result)}`);
      if (result.status === 'success') {
        this.log.info('Message deleted');
      } else {
        this.log.warn('Deleting Message not successful, pls check: ' + JSON.stringify(result));
        this.setState('info.error', JSON.stringify(result), true);
      }
    } catch (err) {
      this.log.warn(`Failed to delete Message ${err}`);
      this.setState('info.error', JSON.stringify(err), true);
    }
  } //end deleteMessage

  /*
    async storeMessage(data) {
      await this.setObjectNotExistsAsync('inbox.SIM.' + data.index, {
        type: 'state',
        common: {
          name: 'Message data',
          type: 'string',
          role: 'state',
          read: true,
          write: true,
        },
        native: {},
      });

      await this.setState('inbox.SIM.' + data.index, JSON.stringify(data), true);

      this.log.debug('Message stored to: ' + data.index)
    }//end storeMessage
  */

  async phonebook(id, ownPhone) { //Check mit nachfolgender Abfrage einbauen
    try {
      if (ownPhone.name.length > 16) {
        this.log.warn('ownName max length = 16 chars, please choose a shorter name');
        return;
      }
      const result = await gsmModem.writeToPhonebook(ownPhone.number, ownPhone.name);
      this.log.debug(`wrote to Phonebook: ${JSON.stringify(result)}`);
      if (result.status === 'success') {
        this.log.debug('Phonebook updated: ' + ownPhone.name + ', ' + ownPhone.number);
      } else {
        this.log.warn('Writing to phonebook not successful, pls check: ' + JSON.stringify(result));
        this.setState('info.error', JSON.stringify(result), true);
      }
      await this.getNameNumber();
    } catch (err) {
      this.log.warn(`Error writing to phonebook - ${err}`);
      this.setState('info.error', JSON.stringify(err), true);
    }
  } //end phonebook

  async getNameNumber() {
    try {
      const result = await gsmModem.getOwnNumber();
      this.log.debug(`Own number: ${JSON.stringify(result)}`);
      this.log.info('Your number: ' + result.data.number + ', your name: ' + result.data.name);
      if (result.data.number && result.data.name) {
        this.setState('info.ownNumber', result.data.number, true);
        this.setState('info.ownName', result.data.name, true);
        this.setState('admin.ownNumber', result.data.number, true);
        this.setState('admin.ownName', result.data.name, true);
      }
    } catch (err) {
      this.log.warn(`Error retrieving own Number - ${err}`);
      this.setState('info.error', JSON.stringify(err), true);
    }
  }


  async sending(messageRawJson) {
    try {
      // Finally send an SMS
      const result = await gsmModem.sendSMS(messageRawJson.recipient, messageRawJson.message, messageRawJson.alert);
      if (result.data.response === 'Message Successfully Sent') {
        this.log.info(`Callback Send: Message ID: ${result.data.messageId},` +
          `${result.data.response} To: ${result.data.recipient} ${JSON.stringify(result)}`);
        const messageSent = {
          'message': result.data.message,
          'sentTo': result.data.recipient
        };
        this.setState('sendSMS.messageRawSent', JSON.stringify(messageSent), true);
      } else if (result.data.response === 'Successfully Sent to Message Queue') {
        this.log.debug('Message processing: ' + JSON.stringify(result));
      } else {
        this.log.warn('Error sending message: ' + JSON.stringify(result));
      }
    } catch (e) {
      this.log.warn('Error sending message' + e);
    }
  } //end sending()


  async setOpMode(id, state) {
    try {
      const msg = await gsmModem.setModemMode(undefined, state);
      this.log.debug(`Set operation mode: ${JSON.stringify(msg)}`);
      if (msg.status === 'success') {
        const returnedOpMode = msg.data.slice(0, 3);
        if (returnedOpMode !== opMode) {
          this.log.info('Operating mode changed to: ' + returnedOpMode);
        }
        opMode = returnedOpMode;
        this.setState('info.opMode', opMode, true);
        this.setState('admin.opMode', opMode, true);
      } else {
        this.log.warn('Setting operating mode not successful! Error: ' + JSON.stringify(msg));
        this.setState('info.error', JSON.stringify(msg), true);
      }
    } catch (err) {
      this.log.warn(`Error setting GSM-Modem mode - ${err}`);
      this.setState('info.error', JSON.stringify(err), true);
    }
  } //end setOpMode



  async execATSL(id, atCmd) {
    try {
      this.log.debug('Execute AT+Command: ' + atCmd);
      // execute a custom command - one line response normally is handled automatically
      const result = await gsmModem.executeCommand(atCmd);
      this.log.debug(`Result ${JSON.stringify(result)}`);
      if (id !== 'CNMI') {
        this.setState('admin.atCommandResponse', JSON.stringify(result), true);
        this.log.info('AT+Command response (single / last line): ' + JSON.stringify(result.data.result));
      }
    } catch (err) {
      this.log.debug(`Error - ${err}`);
      this.setState('info.error', JSON.stringify(err), true);
    }
  } //end execATSL


  async controlSIM(id, state) {
    try {
      const conn = ((await this.getStateAsync('info.connection')) || {}).val;
      this.log.debug('connection: ' + conn);

      switch (id) {

        case 'admin.ownName':
          if (conn) {
            ownPhone.number = ((await this.getStateAsync('info.ownNumber')) || {}).val;
            ownPhone.name = state.val;
            this.log.debug('Phonebook new: ' + JSON.stringify(ownPhone));
            await this.phonebook(id, ownPhone);
          } else {
            this.log.debug('Connection is closed, please restart adapter & try again');
          }
          break;

        case 'admin.ownNumber':
          if (conn) {
            this.log.debug('set new own Number to: ' + state.val);
            try {
              const result = await gsmModem.setOwnNumber(state.val);
              this.log.debug(`Own number set: ${JSON.stringify(result)}`);
              this.setState('info.ownNumber', state.val, true);
            } catch (err) {
              this.log.warn(`Error setting own Number - ${err}`);
            }
          } else {
            this.log.warn('Connection is closed, please restart adapter & try again');
          }
          break;

        case 'admin.opMode':
          opMode = state.val;
          if (state.val === 'PDU' || state.val === 'SMS') {
            if (conn) {
              this.log.debug('Connection open, set new operation mode');
              await this.setOpMode(id, state.val);
            } else {
              this.log.debug('Connection is closed, please restart adapter & try again');
            }
          } else {
            this.log.warn("Operating mode has to be set to 'PDU' (default) or 'SMS', you entered " + state.val);
            return;
          }
          break;

        case 'admin.atCommandSLR':
          if (conn) {
            this.log.debug('Connection open, send command');
            await this.execATSL(id, state.val);
          } else {
            this.log.debug('Connection is closed, please restart adapter & try again');
          }
          break;
          /*
          case 'admin.atCommandMLR':
            if (conn == true) {
              this.log.debug("Connection open, send command");
              this.execATML(id, state.val)

            } else {
              this.log.debug("Connection is closed, please restart adapter & try again");

            }

            break;
              */
        case 'sendSMS.messageRaw':
          messageRawJson = JSON.parse(state);
          await this.sending(messageRawJson);
          break;

        case 'sendSMS.send':
          messageRawJson.recipient = ((await this.getStateAsync('sendSMS.recipient')) || {}).val;
          messageRawJson.message = ((await this.getStateAsync('sendSMS.message')) || {}).val;
          messageRawJson.alert = ((await this.getStateAsync('sendSMS.alert')) || {}).val;
          await this.sending(messageRawJson);
          break;

        default:
          this.log.debug('Error, triggering objectChange not recognized');
      }

    } catch (e) {
      this.log.warn('controlSIM - error: ' + e);
    }

  } //end controlSIM

  /*
  modemClose() {
    try {
      this.log.debug("Setze CNMI auf Speichern");

      if (cnmiModemClosed.length == 17) {

        gsmModem.executeCommand(cnmiModemClosed, (result, err) => {
          if (err) {
            this.log.warn(`Error setting CNMI - ${err}`);
          } else {
            this.log.debug(`Result setting CNMI: ${JSON.stringify(result)}`);
            gsmModem.executeCommand('AT+CNMI?', (result, err) => {
              if (err) {
                this.log.warn(`Error checking CNMI - ${err}`);
              } else {
                this.log.debug(`CNMI new:  ${JSON.stringify(result)}`);
                this.log.debug("Closing connection");
                gsmModem.close((err, msg) => {
                  if (err) {
                    this.log.warn(`Error closing - ${JSON.stringify(err)}`);
                  } else {
                    this.log.debug(`Closing:  ${JSON.stringify(msg)}`);
                    this.log.debug("connection closed");

                  }
                });
                this.setState('info.connection', false, true);
              }
            });
          }
        });
      } else {
        this.log.debug("Closing connection (without changing CNMI)");
        gsmModem.close();
        this.setState('info.connection', false, true);
      }

      gsmModem.on('close', data => {
        //whole message data
        this.log.debug(`Event Close onModemClose: ` + JSON.stringify(data));

      });

    } catch (e) {
      this.log.warn("Error closing connection" + e);
    }
  } //end modemClose()
    */


  /**
   * Is called when adapter shuts down - callback has to be called under any circumstances!
   * @param {() => void} callback
   */
  onUnload(callback) {
    try {
      // Here you must clear all timeouts or intervals that may still be active
      // clearTimeout(timeout1);
      // clearTimeout(timeout2);
      // ...
      // clearInterval(interval1);
      clearInterval(gettingSignals);
      //clearInterval(polling);

      if (cnmiModemClosed.length === 17) {
        this.log.debug('Setze CNMI auf Speichern');

        gsmModem.executeCommand(cnmiModemClosed, (result, err) => {
          if (err) {
            this.log.warn(`Error setting CNMI - ${err}`);
            this.log.debug('Closing connection ');
            gsmModem.close(callback);
            this.setState('info.connection', false, true);
            this.log.info('stopping GSM-SMS - adapter');
          } else {
            this.log.debug(`Result setting CNMI: ${JSON.stringify(result)}`);
            gsmModem.executeCommand('AT+CNMI?', (result, err) => {
              if (err) {
                this.log.warn(`Error checking CNMI - ${err}`);
              } else {
                this.log.debug(`CNMI new:  ${JSON.stringify(result)}`);
              }
              this.log.debug('Closing connection ');
              gsmModem.close(callback);
              this.setState('info.connection', false, true);
              this.log.info('stopping GSM-SMS - adapter');
            });
          }
        });

      } else {
        this.log.debug('Closing connection (without changing CNMI)');
        gsmModem.close(callback);
        this.setState('info.connection', false, true);
        this.log.info('stopping GSM-SMS - adapter');

      }
    } catch (e) {
      this.log.warn('Error stopping (onUnload) GSM-SMS - adapter: ' + e);
      callback();
    }
  } // end onUnload

  // If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
  // You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
  // /**
  //  * Is called if a subscribed object changes
  //  * @param {string} id
  //  * @param {ioBroker.Object | null | undefined} obj
  //  */
  // onObjectChange(id, obj) {
  // 	if (obj) {
  // 		// The object was changed
  // 		this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
  // 	} else {
  // 		// The object was deleted
  // 		this.log.info(`object ${id} deleted`);
  // 	}
  // }

  /**
   * Is called if a subscribed state changes
   * @param {string} id
   * @param {ioBroker.State | null | undefined} state
   */
  onStateChange(id, state) {
    if (state) {
      // The state was changed
      this.log.debug(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
      if (!id || state.ack) return;
      this.log.info(`state ${id} changed: ${state.val}`);
      const instance = id.substring(0, this.namespace.length);
      this.log.debug('Instanz: ' + instance);
      id = id.substring(this.namespace.length + 1); // remove instance name and id

      this.log.debug('id=' + id);

      this.controlSIM(id, state);

    } else {
      // The state was deleted
      this.log.info(`state ${id} deleted`);
    }
  }

  // If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
  // /**
  //  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
  //  * Using this method requires "common.messagebox" property to be set to true in io-package.json
  //  * @param {ioBroker.Message} obj
  //  */
  // onMessage(obj) {
  // 	if (typeof obj === 'object' && obj.message) {
  // 		if (obj.command === 'send') {
  // 			// e.g. send email or pushover or whatever
  // 			this.log.info('send command');

  // 			// Send response in callback if required
  // 			if (obj.callback) this.sendTo(obj.from, obj.command, 'Message received', obj.callback);
  // 		}
  // 	}
  // }

} //end Class Gsmsms



if (require.main !== module) {
  // Export the constructor in compact mode
  /**
   * @param {Partial<utils.AdapterOptions>} [options={}]
   */
  module.exports = (options) => new Gsmsms(options);
} else {
  // otherwise start the instance directly
  new Gsmsms();
}
