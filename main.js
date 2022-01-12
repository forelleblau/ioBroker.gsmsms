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
var port;
var connectionMode;
//var pollinginterval;

//let polling;

var autoDeleteOnReceive = true;
var enableConcatenation = true;
var incomingCallIndication = false;
var incomingSMSIndication = true;
var pin = '';
var customInitCommand = '';
var cnmiModemOpen = '';
var cnmiModemClosed = '';

var baudRate = 19200;
var dataBits = 8;
var stopBits = 1;
var parity = 'none';
var rtscts = false;
var xon = false;
var xoff = false;
var xany = false;

var options;

var ownPhone {
  "name": '',
  "number": ''
};

var opMode = 'PDU';
var atCommand;

var recNumber;
var messageOut;
var messageAlert = false;
var messageRawJson = {
  "recipient": '',
  "message": '',
  "alert": false
};

var storedMessageParser;
var reinitialize = {
  "indicator": false,
  "id": '',
  "state": ''
};
//var logger = console; Logger!!!! als Variabel fest setzen auf 'console' Prüfen ob nötig
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
    // this.on('message', this.onMessage.bind(this));
    this.on('unload', this.onUnload.bind(this));
  }

  /**
   * Is called when databases are connected and adapter received configuration.
   */
  async onReady() {
    try {
      // Initialize your adapter here

      // The adapters config (in the instance object everything under the attribute "native") is accessible via
      // this.config:

      port = this.config.port;
      connectionMode = this.config.connectionMode;
      //pollinginterval = this.config.pollinginterval * 60000;

      autoDeleteOnReceive = this.config.autoDeleteOnReceive;
      enableConcatenation = this.config.enableConcatenation;
      incomingCallIndication = this.config.incomingCallIndication;
      incomingSMSIndication = this.config.incomingSMSIndication;
      pin = this.config.pin;
      customInitCommand = this.config.customInitCommand;
      cnmiModemOpen = 'AT+CNMI=' + this.config.cnmiModemOpen;
      cnmiModemClosed = 'AT+CNMI=' + this.config.cnmiModemClosed;

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
      //this.log.debug('cnmiModemOpen: ' + cnmiModemOpen);
      this.log.debug('cnmiModemClosed: ' + cnmiModemClosed);

      this.log.debug('baudRate: ' + baudRate);
      this.log.debug('dataBits: ' + dataBits);
      this.log.debug('stopBits: ' + stopBits);
      this.log.debug('parity: ' + parity);
      this.log.debug('rtscts: ' + rtscts);
      this.log.debug('xon: ' + xon);
      this.log.debug('xoff: ' + xoff);
      this.log.debug('xany: ' + xany);

      /*
    For every state in the system there has to be also an object of type state
    Here a simple template for a boolean variable named "testVariable"
    Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables

    await this.setObjectNotExistsAsync('testVariable', {
      type: 'state',
      common: {
        name: 'testVariable',
        type: 'boolean',
        role: 'indicator',
        read: true,
        write: true,
      },
      native: {},
    });
*/
      // In order to get state updates, you need to subscribe to them. The following line adds a subscription for our variable we have created above.
      this.subscribeStates('admin.*');
      this.subscribeStates('sendSMS.send');
      this.subscribeStates('sendSMS.messageRaw');

      // You can also add a subscription for multiple states. The following line watches all states starting with "lights."
      // this.subscribeStates('lights.*');
      // Or, if you really must, you can also watch all states. Don't do this if you don't need to. Otherwise this will cause a lot of unnecessary load on the system:
      // this.subscribeStates('*');

      let options = {
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
        logger: console
        //cnmiCommand: cnmiModemOpen
      };
      /*
            ownName = await this.getStateAsync('admin.ownName');
            if (ownName !== null) {
              ownName = ownName.val
            }
            ownNumber = await this.getStateAsync('admin.ownNumber');
            if (ownNumber !== null) {
              ownNumber = ownNumber.val


      */

      this.modemInitialize();
      /*
            if (connectionMode == 'polling') {
              polling = setInterval(() => { // poll states every [10] minute
                this.log.debug("Initialize modem to check new messages")
                this.modemInitialize(this.startup.bind(this));
              }, pollingTime);
            } // endIf
      */

      /*
    	setState examples
    	you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)

    // the variable testVariable is set to true as command (ack=false)
    await this.setStateAsync('testVariable', true);

    // same thing, but the value is flagged "ack"
    // ack should be always set to true if the value is received from or acknowledged from the target system
    await this.setStateAsync('testVariable', {
      val: true,
      ack: true
    });

    // same thing, but the state is deleted after 30s (getState will return null afterwards)
    await this.setStateAsync('testVariable', {
      val: true,
      ack: true,
      expire: 30
    });

    // examples for the checkPassword/checkGroup functions
    /*  let result = await this.checkPasswordAsync('admin', 'iobroker');
          this.log.info('check user admin pw iobroker: ' + result);

          result = await this.checkGroupAsync('admin', 'admin');
          this.log.info('check group user admin group admin: ' + result);
					*/

    } catch (e) {
      this.log.warn("Error onReady" + e);
    }
  } //end onReady


  async modemInitialize() {

    try {

      //Fehler: Wenn funktion erfolgreich aber rÃ¼ckmeldung ein 'ERROR' in 'result', dann auffangen und auf connection.error setzen.
      // this.setStateAsync('connection.error', err, true);
      gsmModem.open(port, options, (err, msg) => {
        if (err) {
          this.log.warn(`Error opening - ${JSON.stringify(err)} - pls check your settings (port, serial connection) and restart the instnace`);
          return;
        } else {
          this.log.debug(`Modem msg: ${JSON.stringify(msg)}`);
          if (msg.status == 'success') {
            this.log.info('Modem opened successfully, Port: ' + JSON.stringify(msg.data.modem) + ' Status: ' + JSON.stringify(msg.data.status));
          } else {
            this.log.warn(`Problems opening, please check: ${JSON.stringify(err)} `);
          }
        }
      });
    } catch (e) {
      this.log.warn("Error opening modem " + e);
    }


    try {
      gsmModem.on('open', () => {
        this.log.debug('GSM-Modem sucessfully opened for: ');


        // now we initialize the GSM Modem
        gsmModem.initializeModem((msg, err) => {
          if (err) {
            this.log.warn(`Error initializing GSM-modem - ${err}`);

          } else {
            this.log.info(`Modem initialized: ${JSON.stringify(msg)}`);
            this.setState('info.connection', true, true);
            this.startup();
          }
        });



        gsmModem.on('onNewMessageIndicator', data => {
          //indicator for new message only (sender, timeSent)
          this.log.debug(`Event New Message Indication: ` + JSON.stringify(data));
        });

        gsmModem.on('onNewMessage', data => {
          //whole message data
          this.log.info(`Event New Message: ` + JSON.stringify(data));
          this.setState('inbox.messageSender', data.sender, true);
          this.setState('inbox.messageText', data.message, true);
          this.setState('inbox.messageDate', (data.dateTimeSent).toString(), true);
          this.setState('inbox.messageRaw', JSON.stringify(data), true);
        });

        gsmModem.on('onSendingMessage', data => {
          //whole message data
          this.log.info(`Event Sending Message: ` + JSON.stringify(data));
          this.setState('sendSMS.messageRawSent', JSON.stringify(data), true);
        });

        ///incomingCall auf false als standard!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

        /*
                  gsmModem.on('onNewIncomingCall', data => {
                    //whole message data
                    console.log(`Event Incoming Call: ` + JSON.stringify(data));
                  });

                  */

        //löschen bei Empfang auf standard  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

        gsmModem.on('onMemoryFull', data => {
          //whole message data
          this.log.debug(`Event Memory Full: ` + JSON.stringify(data));
        });

        gsmModem.on('close', data => {
          //whole message data
          console.log(`Event Close: ` + JSON.stringify(data));
          if (reinitialize.indicator == true) {
            this.log.debug("reinitialize!");
            this.modemInitalize();
          }
        });

      });



    } catch (e) {
      this.log.warn("Error initializing modem " + e);
    }
  } //end modemInitialize()



  async startup() {

    try {
      opMode = (await this.getStateAsync('admin.opMode')).val;
      this.log.debug(`Configuring Modem for mode: ${opMode}`);

      // set mode to PDU mode to handle SMS
      gsmModem.setModemMode((msg, err) => {
        if (err) {
          this.log.warn(`Error setting GSM-Modem mode - ${err}`);
        } else {
          this.log.debug(`Set operation mode: ${JSON.stringify(msg)}`);
          if (msg.status == 'success') {
            var returnedOpMode = msg.data.slice(0, 3);
            if (returnedOpMode != opMode) {
              this.log.info("Operating mode changed to: " + returnedOpMode);
            }
            opMode = returnedOpMode;
            this.setState('info.opMode', opMode, true);
            this.setState('admin.opMode', opMode, true);
          } else {
            this.log.warn("Setting operating mode not successful! Error: " + JSON.stringify(msg));
            this.setState('info.error', JSON.stringify(msg), true);
          }

          // get the Network signal strength & quality
          gsmModem.getNetworkSignal((result, err) => {
            if (err) {
              this.log.warn(`Error retrieving GSM signal strength - ${err}`);
            } else {
              this.log.debug(`GSM signal strength: ${JSON.stringify(result)}`);
              this.setState('info.signalQuality', parseInt(result.data.signalQuality), true);
              this.setState('info.signalStrength', parseInt(result.data.signalStrength), true);
            }
          });

          // get Modem Serial Number
          gsmModem.getModemSerial((result, err) => {
            if (err) {
              this.log.warn(`Error retrieving GSM modem serial - ${err}`);
            } else {
              this.log.debug(`GSM modem Serial: ${JSON.stringify(result)}`);
              this.setState('info.modemSerial', parseInt(result.data.modemSerial), true);

            }
          });

          // get the Own Number of the Modem   gsmModem.setOwnNumber('+41798233954');
          gsmModem.getOwnNumber((result, err) => {
            if (err) {
              this.log.warn(`Error retrieving own Number - ${err}`);
            } else {
              this.log.debug(`Own number: ${JSON.stringify(result)}`);
              this.setState('info.ownNumber', result.data.number, true);
              this.setState('info.ownName', result.data.name, true);
              this.setState('admin.ownNumber', result.data.number, true);
              this.setState('admin.ownName', result.data.name, true);
            }
          });
        }
      }, opMode);

      // get info about stored Messages on SIM card
      gsmModem.checkSimMemory((result, err) => {
        if (err) {
          this.log.warn(`Failed to get SimMemory ${err}`);
        } else {
          this.log.debug(`Sim Memory Result: ${JSON.stringify(result)}`);

          // read the whole SIM card inbox
          gsmModem.getSimInbox((result, err) => {
            if (err) {
              this.log.warn(`Failed to get SimInbox ${err}`);
            } else {
              this.log.debug(`Sim Inbox Result: ${JSON.stringify(result)}`);
              var messageNr = 0;
              if (result["data"].length != 0) {
                var thisI = this;
                storedMessageParser = setInterval(function() {
                  thisI.setState('inbox.messageSender', result["data"][messageNr]["sender"], true);
                  thisI.setState('inbox.messageText', result["data"][messageNr]["message"], true);
                  thisI.setState('inbox.messageDate', result["data"][messageNr]["dateTimeSent"].toString(), true);
                  thisI.setState('inbox.messageRaw', JSON.stringify(result["data"][messageNr]), true);
                  thisI.log.info("saved message Nr " + (messageNr + 1) + ": " + JSON.stringify(result["data"][messageNr]));
                  messageNr++;

                  if (messageNr == result["data"].length) {
                    thisI.log.info("All saved messages processed");
                    clearInterval(storedMessageParser);
                  }

                }, 1000);
              } else {
                this.log.debug("No saved messages to process");
              }

              // was passiert wenn sim voll??
              if (autoDeleteOnReceive == true) {
                gsmModem.deleteAllSimMessages((result, err) => {
                  if (err) {
                    this.log.warn(`Failed to delete MEssage ${err}`);
                  } else {
                    this.log.debug(`Delete Result: ${JSON.stringify(result)}`);
                    if (connectionMode != 'alwaysopen') {
                      this.log.debug("Connection mode is on retrieve or send only. Close connection");
                      this.modemClose();
                    }
                  }
                });
              }
            }
          });
        }
      });

      if (reinitialize.indicator == true) {
        reinitialize.indicator = false;
        this.controlSIM(reinitialize.id, reinitialize.state);
      }

    } catch (e) {
      this.log.warn("Error startup " + e);
    }
  } //end startup()


  async controlSIM(id, state) {
    try {
      var conn = (await this.getStateAsync('info.connection')).val;
      this.log.debug("connection: " + conn);

      switch (id) {

        case 'admin.ownName':
          if (conn == true) {
            ownPhone.number = (await this.getStateAsync('info.ownNumber')).val;
            ownPhone.name = state
            this.phonebook(id, ownPhone);
          } else {
            this.log.debug("Connection is closed, reinitialize");
            reinitialize.indicator = true
            this.modemInitialize(id, state);
          }
          break;

        case 'admin.ownNumber':
          if (conn == true) {
            this.log.debug("Connection open, set new number");
            this.phoneNumber(id, state)

          } else {
            this.log.debug("Connection is closed, reinitialize");
            reinitialize.indicator = true
            this.modemInitialize(id, state);
          }
          break;

        case 'admin.opMode':
          opMode = state;
          if (state != 'PDU' || 'SMS') {
            this.log.warn("Operating mode has to be set to 'PDU' (default) or 'SMS', you entered " + state);
            return
          } else {
            reinitialize.indicator = true;
            reinitialize.id = '';
            this.log.debug("restart connection");
            gsmModem.close();
          }
          break;

        case 'admin.atCommandSLR':

          break;

        case 'admin.atCommandMLR':

          break;

        case 'sendSMS.messageRaw':
          messageRawJson = JSON.parse(state);
          this.sending(messageRawJson, conn);
          break;

        case 'sendSMS.send':
          messageRawJson.recipient = (await this.getStateAsync('sendSMS.recipient')).val;
          messageRawJson.message = (await this.getStateAsync('sendSMS.message')).val;
          messageRawJson.alert = (await this.getStateAsync('sendSMS.alert')).val;
          this.sending(messageRawJson, conn);
          break;

        default:
          this.log.debug("Error, triggering objectChange not recognized");
      }


    } catch (e) {
      this.log.warn("controlSIM - error: " + e)
    }

  } //end controlSIM





  async phoneNumber(id, state) {
    try {
      this.log.debug("set new own Number to: " + state);
      gsmModem.setOwnNumber(state, (result, err) => {
        if (err) {
          this.log.warn(`Error setting own Number - ${err}`);
        } else {
          this.log.debug(`Own number set: ${JSON.stringify(result)}`);
        }
      });
    } catch (e) {
      this.log.warn("Error writing ownNumber" + e)
    }

  } // end phoneNumber

  async phonebook(id, ownPhone) { //Check mit nachfolgender Abfrage einbauen
    try {

      if (ownPhone.name.length > 18) {
        this.log.warn("ownName max length = 18 chars, please choose a shorter name");
        return
      }

      gsmModem.writeToPhonebook(ownPhone.number, ownPhone.name, (result, err) => {
        if (err) {
          this.log.warn(`Error writing to phonebook - ${err}`);
        } else {
          this.log.debug(`wrote to Phonebook: ${JSON.stringify(result)}`);
        }
      });



    } catch (e) {
      this.log.warn("Error writing ownNumber & ownName" + e)
    }
  } //end phonebook


  async sending(messageRawJson, conn) {
    try {
      this.log.debug("Connection: " + conn);

      this.log.debug("Connection open, send directly");
      // Finally send an SMS
      gsmModem.sendSMS(messageRawJson.recipient, messageRawJson.message, messageRawJson.alert, (result) => {
        this.log.info(`Callback Send: Message ID: ${result.data.messageId},` +
          `${result.data.response} To: ${result.data.recipient} ${JSON.stringify(result)}`);
      });

    } catch (e) {
      this.log.warn("Error sending message" + e)
    }
  } //end sending()


  /*
    async execAT(atCmd) {


      // execute a custom command - one line response normally is handled automatically
      gsmModem.executeCommand('AT+CNMI?', (result, err) => {
        if (err) {
          console.log(`Error - ${err}`);
        } else {
          console.log(`Result ${JSON.stringify(result)}`);
        }
      });

      // execute a complex custom command - multi line responses needs own parsing logic
      const commandParser = gsmModem.executeCommand('AT+CNMI=1,1,0,1,0', (result, err) => {
        if (err) {
          console.log(`Error - ${err}`);
        } else {
          console.log(`Result ${JSON.stringify(result)}`);
        }
      });
      const portList = {};
      commandParser.logic = (dataLine) => {
        if (dataLine.startsWith('^SETPORT:')) {
          const arr = dataLine.split(':');
          portList[arr[1]] = arr[2].trim();
        } else if (dataLine.includes('OK')) {
          return {
            resultData: {
              status: 'success',
              request: 'executeCommand',
              data: {
                'result': portList
              }
            },
            returnResult: true
          }
        } else if (dataLine.includes('ERROR') || dataLine.includes('COMMAND NOT SUPPORT')) {
          return {
            resultData: {
              status: 'ERROR',
              request: 'executeCommand',
              data: `Execute Command returned Error: ${dataLine}`
            },
            returnResult: true
          }
        }
      };
    } // end execAT

  */


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
        this.log.debug(`Event Close: ` + JSON.stringify(data));
        if (reinitialize.indicator == true) {
          this.log.debug("reinitialize!");
          this.modemInitalize();
        }
      });

    } catch (e) {
      this.log.warn("Error closing connection" + e);
    }
  } //end modemClose()



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

      clearInterval(storedMessageParser);
      clearInterval(polling);





      if (connectionMode == 'alwaysopen') {
        if (cnmiModemClosed.length == 17) {
          this.log.debug("Setze CNMI auf Speichern");

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
                  this.log.debug("Closing connection ");
                  gsmModem.close();
                  this.setState('info.connection', false, true);
                  this.log.info('stopping GSM-SMS - adapter');
                }
              });
            }
          });

        } else {
          this.log.debug("Closing connection (without changing CNMI)");
          gsmModem.close();
          this.setState('info.connection', false, true);
          this.log.info('stopping GSM-SMS - adapter');

        }
      } else {
        this.setState('info.connection', false, true);
        this.log.info('stopping GSM-SMS - adapter');
      }

      callback();
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
      var instance = id.substring(0, this.namespace.length);
      this.log.debug("Instanz: " + instance);
      id = id.substring(this.namespace.length + 1); // remove instance name and id

      this.log.debug("id=" + id);
      if (state.ack == false) {
        this.log.debug("ack=false, launch controlSIM");
        state = state.val;
        //this.controlSIM(id, state)
        this.modemInitialize(id, state)
      }
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
