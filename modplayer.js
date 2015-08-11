function modMusic() {};

modMusic.prototype.stateNames = ["Stopped", "Playing", "Paused"];
modMusic.prototype.state = 0;
modMusic.prototype.modName = "None";
modMusic.prototype.modType = "Unknown";
modMusic.prototype.play = function() {alert("No file Loaded!")};
modMusic.prototype.proTracker = new proTracker();

modMusic.prototype.parseMod = function(arrayBuffer, type) { //TODO: replace with proper file validation
  this.modType = "ProTracker";
  this.proTracker.parseFile(arrayBuffer, this);
};

modMusic.prototype.initAudioSystem = function() {
  var contextClass = (window.AudioContext || 
    window.webkitAudioContext || 
    window.mozAudioContext || 
    window.oAudioContext || 
    window.msAudioContext);
  if (contextClass) {
    var context = new contextClass();
  } else {
    alert("Your browser does not support WebAudio! Please update your browser.");
    throw new error("No Support for WebAudio!");
  }
  return contextClass;
}