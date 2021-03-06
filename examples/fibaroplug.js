'use strict';

const { ZwaveDevice } = require('homey-zwavedriver');

/**
 * It is possible to use default system capability handlers (see: lib/system/capabilities), by registering a
 * capability without an options object (see below).
 */
class FibaroPlugDevice extends ZwaveDevice {
  async onNodeInit({ node }) {
    // enable debugging
    this.enableDebug();

    // print the node's info to the console
    this.printNode();

    // register the `measure_battery` capability with COMMAND_CLASS_BATTERY and with the
    // default system capability handler (see: lib/zwave/system/capabilities)
    this.registerCapability('measure_battery', 'BATTERY');

    // register the `onoff` capability with COMMAND_CLASS_SWITCH_BINARY while overriding the default system
    // capability handler
    this.registerCapability('onoff', 'SWITCH_BINARY', {
      getOpts: {
        getOnStart: true, // get the initial value on app start (only use for non-battery devices)
        pollInterval: 'poll_interval', // maps to device settings
        // getOnOnline: true, // use only for battery devices
      },
      getParserV3: (value, opts) => ({}),
    });

    // register a settings parser
    this.registerSetting('always_on', value => new Buffer([value === true ? 0 : 1]));

    // register a report listener
    this.registerReportListener(
      'SWITCH_BINARY',
      'SWITCH_BINARY_REPORT',
      (rawReport, parsedReport) => {
        console.log('registerReportListener', rawReport, parsedReport);
      },
    );

    // Set configuration value that is defined in manifest
    await this.configurationSet({ id: 'motion_threshold' }, 10);

    // Or set configuration value that is not defined in manifest
    await this.configurationSet({ index: 1, size: 2 }, 10);
  }

  // Overwrite the default setting save message
  customSaveMessage(oldSettings, newSettings, changedKeysArr) {
    return {
      en: 'Test message',
      nl: 'Test bericht',
    };
  }

  // Overwrite the onSettings method, and change the Promise result
  async onSettings(oldSettings, newSettings, changedKeysArr) {
    await super.onSettings(oldSettings, newSettings, changedKeysArr);
    return 'Success!';
  }
}

module.exports = FibaroPlugDevice;
