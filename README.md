![Logo](admin/gsmsms.png)

# ioBroker.gsmsms

[![NPM version](https://img.shields.io/npm/v/iobroker.gsmsms.svg)](https://www.npmjs.com/package/iobroker.gsmsms)
[![Downloads](https://img.shields.io/npm/dm/iobroker.gsmsms.svg)](https://www.npmjs.com/package/iobroker.gsmsms)
![Number of Installations](https://iobroker.live/badges/gsmsms-installed.svg)
![Current version in stable repository](https://iobroker.live/badges/gsmsms-stable.svg)
[![Dependency Status](https://img.shields.io/david/forelleblau/iobroker.gsmsms.svg)](https://david-dm.org/forelleblau/iobroker.gsmsms)

[![NPM](https://nodei.co/npm/iobroker.gsmsms.png?downloads=true)](https://nodei.co/npm/iobroker.gsmsms/)

**Tests:** ![Test and Release](https://github.com/forelleblau/ioBroker.gsmsms/workflows/Test%20and%20Release/badge.svg)

## gsmsms adapter for ioBroker

Send and recieve SMS with GSM-hardware

## Hardware

Any GSM-Hardware (shield, surfstick i.e) connected to a serial port of your ioBroker - device.
GSM-modules/sticks need a lot of power. Please ensure a sufficient power supply.

Some devices have to be set to the right mode for serial communication (see 'modeswitch').

## settings

1.  Path to Serial Port - required.
2.  Options

#### SerialPort openOptions

| Name          | Type    | Default | Description                                             |
| ------------- | ------- | ------- | ------------------------------------------------------- |
| baudRate      | number  | 9600    | The port's baudRate.                                    |
| dataBits      | number  | 8       | Must be one of: 8, 7, 6, or 5.                          |
| stopBits      | number  | 1       | Must be one of: 1 or 2.                                 |
| highWaterMark | number  | 16384   | The size of the read and write buffers defaults to 16k. |
| parity        | string  | "none   | Must be one of: 'none', 'even', 'mark', 'odd', 'space'. |
| rtscts        | boolean | false   | flow control setting                                    |
| xon           | boolean | false   | flow control setting                                    |
| xoff          | boolean | false   | flow control setting                                    |
| xany          | boolean | false   | flow control settings                                   |

#### SerialPort-GSM additional openOptions

| Name                   | Type    | Default             | Description                                                                                                                                                                                     |
| ---------------------- | ------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| autoDeleteOnReceive    | boolean | false               | Delete from `'sim'` after receiving.                                                                                                                                                            |
| enableConcatenation    | boolean | false               | Receive concatenated messages as one.                                                                                                                                                           |
| incomingCallIndication | boolean | false               | Receive `'onNewIncomingCall'` event when receiving calls.                                                                                                                                       |
| incomingSMSIndication  | boolean | true                | Enables the modem to notify that a new SMS message has been received.                                                                                                                           |
| pin                    | string  |                     | If your SIM card is protected by a PIN provide the PIN as String and it will be used to unlock the SIM card during initialization (empty, means "no PIN existing on the SIM card").             |
| customInitCommand      | string  |                     | If your device needs a custom initialization command it can be provided and will be used after PIN check. The command is expected to return `'OK'` (empty, means "no custom command for init"). |
| cnmiCommand            | string  | 'AT+CNMI=2,1,0,2,1' | Defines if messages are saved on SIM or delivered directly                                                                                                                                      |
| logger                 |         |                     | Provide a logger instance, currently `'debug'` is used only to output written and received serial data. Use `'console'` for debugging purposes.                                                 |

## Developer manual

This section is intended for the developer. It can be deleted later

### Getting started

You are almost done, only a few steps left:

1.  Head over to [main.js](main.js) and start programming!

### Best Practices

We've collected some [best practices](https://github.com/ioBroker/ioBroker.repositories#development-and-coding-best-practices) regarding ioBroker development and coding in general. If you're new to ioBroker or Node.js, you should
check them out. If you're already experienced, you should also take a look at them - you might learn something new :)

### Scripts in `package.json`

Several npm scripts are predefined for your convenience. You can run them using `npm run <scriptname>`
| Script name | Description |
\|-------------\|-------------\|
\| `test:js` | Executes the tests you defined in `*.test.js` files. |
\| `test:package` | Ensures your `package.json` and `io-package.json` are valid. |
\| `test:unit` | Tests the adapter startup with unit tests (fast, but might require module mocks to work). |
\| `test:integration` | Tests the adapter startup with an actual instance of ioBroker. |
\| `test` | Performs a minimal test run on package files and your tests. |
\| `check` | Performs a type-check on your code (without compiling anything). |
\| `lint` | Runs `ESLint` to check your code for formatting errors and potential bugs. |
\| `release` | Creates a new release, see [`@alcalzone/release-script`](https://github.com/AlCalzone/release-script#usage) for more details. |

### Writing tests

When done right, testing code is invaluable, because it gives you the
confidence to change your code while knowing exactly if and when
something breaks. A good read on the topic of test-driven development
is <https://hackernoon.com/introduction-to-test-driven-development-tdd-61a13bc92d92>.
Although writing tests before the code might seem strange at first, but it has very
clear upsides.

The template provides you with basic tests for the adapter startup and package files.
It is recommended that you add your own tests into the mix.

### Publishing the adapter

Using GitHub Actions, you can enable automatic releases on npm whenever you push a new git tag that matches the form
`v<major>.<minor>.<patch>`. We **strongly recommend** that you do. The necessary steps are described in `.github/workflows/test-and-release.yml`.

Since you installed the release script, you can create a new
release simply by calling:

```bash
npm run release
```

Additional command line options for the release script are explained in the
[release-script documentation](https://github.com/AlCalzone/release-script#command-line).

To get your adapter released in ioBroker, please refer to the documentation
of [ioBroker.repositories](https://github.com/ioBroker/ioBroker.repositories#requirements-for-adapter-to-get-added-to-the-latest-repository).

### Test the adapter manually with dev-server

Since you set up `dev-server`, you can use it to run, test and debug your adapter.

You may start `dev-server` by calling from your dev directory:

```bash
dev-server watch
```

The ioBroker.admin interface will then be available at <http://localhost:8081/>

Please refer to the [`dev-server` documentation](https://github.com/ioBroker/dev-server#command-line) for more details.

## Changelog

<!--
	Placeholder for the next version (at the beginning of the line):
	### **WORK IN PROGRESS**
-->

### **WORK IN PROGRESS**

-   (forelleblau) initial release

## License

MIT License

Copyright (c) 2022 forelleblau <mailto:marceladam@gmx.ch>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.