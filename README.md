# Serial Debug Toolset

This sample project exposes a simple interface to debug serial issues resulting from remote Framing Errors and control signals.

This has been forked from the [Chrome App Samples](https://github.com/GoogleChrome/chrome-app-samples) [serial-control-signals](https://github.com/GoogleChrome/chrome-app-samples/tree/master/samples/serial-control-signals) example.

To use the `Remote Break` and `Remote Frame Error` triggers, you will need to use an Arduino that has a FTDI USB-serial interface. Program the sketch in the `serial-break` folder and connect to the device with this app. NOTE: If you use an Arduino that has an Atmel chip for the USB-Serial interface, it will not forward framing errors or break condition to the OS.

![screenshot](/assets/screenshot.png)