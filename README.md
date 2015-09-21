# Serial Debug Toolset

This sample project exposes a simple interface to debug serial issues resulting from remote Framing Errors and control signals. This has been forked from the [Chrome App Samples](https://github.com/GoogleChrome/chrome-app-samples) [serial-control-signals](https://github.com/GoogleChrome/chrome-app-samples/tree/master/samples/serial-control-signals) example.

To use the `Remote Break`, `Remote Frame Error`, and `Ping` actions, you will need to use an Arduino that has a FTDI USB-serial interface. Program the sketch in the `serial-client` folder and connect to the device with this app.

*NOTE*: If you use an Arduino that has an Atmel chip for the USB-Serial interface, it will quietly ignore framing errors or break conditions. This will make it impossible to replicate the `framing_error` bug.

![screenshot](/assets/screenshot1.png)