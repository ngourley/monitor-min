// monitor.js (c) 2010-2013 Loren West and other contributors
// May be freely distributed under the MIT license.
// For further details and documentation:
// http://lorenwest.github.com/monitor-min
(function(root){

  // Load dependencies
  var Monitor = require('./lib/index'),
      log = Monitor.getLogger('monitor'),
      stat = Monitor.getStatLogger('monitor'),
      OS = require('os');

  /**
  * Bootstrap for a standalone monitor server
  *
  * @static
  * @class server
  */

  console.log("");
  console.log("                        __________");
  console.log("_______ ___________________(_)_  /______________      _______ ______(_)______ ");
  console.log("__  __ `__ \\  __ \\_  __ \\_  /_  __/  __ \\_  ___/________  __ `__ \\_  /__  __ \\");
  console.log("_  / / / / / /_/ /  / / /  / / /_ / /_/ /  /   _/_____/  / / / / /  / _  / / /");
  console.log("/_/ /_/ /_/\\____//_/ /_//_/  \\__/ \\____//_/           /_/ /_/ /_//_/  /_/ /_/ ");
  console.log("");

  // Send error/fatal logs to the console
  var Log = Monitor.Log;
  Log.on('[warn,error,fatal].*', Log.console);

  // Boot the monitor server.
  // This accepts websocket connections on the configured port.
  var server = new Monitor.Server();
  server.start(function(error) {
    if (error) {
      log.error('monitor-min.start', error);
      return;
    }

    var connectTo = Monitor.Config.MonitorMin.allowExternalConnections ? OS.hostname() : 'localhost';
    console.log('Headless monitor service started on host: ' + connectTo);

    // Output security concerns
    if (!Monitor.Config.MonitorMin.allowExternalConnections) {
      console.log("");
      console.log("External connections disabled.");
      console.log("See " + process.cwd() + "/config/external.js for more information.");
    }

  });

  // Process uncaught exceptions.
  process.on('uncaughtException', function(err){

    // On laptop sleep/startup the DNS servers aren't immediately available,
    // resulting in a flood of these for socket.io until DNS services are back up.
    if (err.message === 'ECONNREFUSED, Could not contact DNS servers') {
      return;
    }

    // Don't allow the process to continue in an unknown state.
    log.fatal('moniotor-min.uncaught', 'Uncaught Exception: ' + err.message);
    log.fatal('moniotor-min.uncaught', err.stack);
    server.stop(function(){
      process.exit(1);
    });

    // Don't wait around if the server is hung.
    setTimeout(function(){process.exit(1);}, 2000);
  });

}(this));
