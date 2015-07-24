function modMusic() {};
modMusic.prototype.proTrackerInstStruct = [
  "name", "string:22", 
  "sampleLength", "uint16be",
  "finetune", "uint8",
  "volume", "uint8",
  "repeatStart", "uint16be",
  "repeatSize", "uint16be"
];

modMusic.prototype.proTrackerSongStruct = [
  "numPositions", "uint8",
  "oneHundredAndTwentySeven", "uint8",
  "songTable", ["[]", "uint8", 128]
];

modMusic.prototype.proTrackerSongStruct32 = [
  "numPositions", "uint8",
  "oneHundredAndTwentySeven", "uint8",
  "songTable", ["[]", "uint8", 128],
  "chString", "string:4"
];

modMusic.prototype.inst = [];
modMusic.prototype.song = [];
modMusic.prototype.patterns = [];
modMusic.prototype.samples = [];
modMusic.prototype.numPatterns = 0;
modMusic.prototype.numSamples = 15; //15 by default
modMusic.prototype.stateNames = ["Stopped", "Playing", "Paused"]
modMusic.prototype.state = 0;
modMusic.prototype.modName = "None";
modMusic.prototype.play = function() {alert("No file Loaded!")};
modMusic.prototype.parseMod = function(arrayBuffer, type) {
  //if (type == "audio/x-mod") { this.parseProTracker(arrayBuffer) }
  //else { alert("Invalid Modfile!") };
  this.parseProTracker(arrayBuffer);
};

//Parse ProTracker Modules
modMusic.prototype.parseProTracker = function(arrayBuffer) {
  //Create DataStream and get the modfile's name
  var ds = new DataStream(arrayBuffer, 0, DataStream.BIG_ENDIAN); //all Protracker mods are Big Endian.
  this.modName = new TextDecoder("utf-8").decode(ds.readUint8Array(20));
  
  //Check for a 15 or 31 sample modfile
  var curPos = ds.position;
  ds.seek(950);
  var tempStruct = ds.readStruct(this.proTrackerSongStruct32);
  if(tempStruct.chString != "" && tempStruct.oneHundredAndTwentySeven == 127) { //check both formatting indicators
    this.numSamples = 31;
  }
  ds.seek(curPos);

  //Read instrument and song data
  for(i=0; i < this.numSamples; i++) {
    this.inst[i] = ds.readStruct(this.proTrackerInstStruct);
  }
  if(this.numSamples == 31) {
    this.song = ds.readStruct(this.proTrackerSongStruct32);
  }
  else {
    this.song = ds.readStruct(this.proTrackerSongStruct);
  }
  console.log("Successfully found pattern data start at 0x" + ds.position.toString(16));
  //get total number of patterns
  for(i=0; i < 128; i++) {
    if(this.song.songTable[i] > this.numPatterns) {
      this.numPatterns = this.song.songTable[i];
    }
  }
  
  //read in pattern data
  for(i=0; i <= this.numPatterns; i++) {
    this.patterns[i] = [];
    this.patterns[i][0] = [];
    this.patterns[i][1] = [];
    this.patterns[i][2] = [];
    this.patterns[i][3] = [];
    for(j=0; j < 64; j++) { //64 entries per pattern
      this.patterns[i][0][j] = _parseProTrackerPattern(ds.readUint8Array(4).buffer);
      this.patterns[i][1][j] = _parseProTrackerPattern(ds.readUint8Array(4).buffer);
      this.patterns[i][2][j] = _parseProTrackerPattern(ds.readUint8Array(4).buffer);
      this.patterns[i][3][j] = _parseProTrackerPattern(ds.readUint8Array(4).buffer);
    }
  }

  //spit out debug info
  console.log("Successfully parsed " + this.numPatterns + " patterns with " + this.numSamples + " samples");

  //read in sample data
  for(i=0; i < this.numSamples; i++) {
    console.log("Reading sample from 0x" + ds.position.toString(16) + " with length of " + (this.inst[i].sampleLength*2).toString() + " bytes and repeat length of " + (this.inst[i].repeatSize*2).toString());
    this.samples[i] = ds.readInt8Array(this.inst[i].sampleLength*2);
  }


}

function _parseProTrackerPattern(arrayBuffer) {
  var pattern = [];
  var bv = new BitView(arrayBuffer);
  pattern["sample"] = //I am not proud of this
    (bv.getBit(0) << 7) +
    (bv.getBit(1) << 6) +
    (bv.getBit(2) << 5) +
    (bv.getBit(3) << 4) +
    (bv.getBit(16) << 3) +
    (bv.getBit(17) << 2) +
    (bv.getBit(18) << 1) +
    bv.getBit(19);

  pattern["param"] = bv.getInt12(4) + 2048; //Unsigned 12-bit int
  pattern["effect"] = bv.getInt12(20) + 2048; //Unsigned 12-bit int
  return pattern;
}

function _initAudioSystem {
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


}
