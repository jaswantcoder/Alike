var Queue = require('firebase-queue');
var firebase = require('firebase-admin');

firebase.initializeApp({
  credential: firebase.credential.cert("./serviceAccountKey.json"),
  databaseURL: "https://alike-ed1bd.firebaseio.com"
});

var db = firebase.database();
var queueRef = db.ref('queue');
var tasksRef = db.ref('queue/tasks');
var uidRef = db.ref('uid');
var likesRef = db.ref('likes');

var options = {
  'specId': 'update_like',
  'numWorkers' : 5
};

var waitForUsers = new Queue(queueRef, options, function(data, progress, resolve, reject) {
  console.log("In update like");
  likesRef.once("value", function(snapshot) {
    var likesTable = snapshot.val();
    if(likesTable!=null){
      var uid_object = likesTable[data['selfid']];
      if(uid_object === undefined){
        var new_entry = {};
        var new_entry_1 = {};
        new_entry_1['rate'] = parseFloat(data['rate']);
        new_entry_1['total_chat'] = 1;
        new_entry[data['partnerid']] = new_entry_1;
        likesRef.child(data['selfid']).set(new_entry); 
      }else{
        if(uid_object[data['partnerid']] === undefined){
          console.log("No partner");
          console.log(data['selfid']);
          console.log(uid_object['partnerid']+":");
          var new_entry = {};
          var new_entry_1 = {};
          new_entry_1['rate'] = parseFloat(data['rate']);
          new_entry_1['total_chat'] = 1;
          // new_entry[data['partnerid']] = new_entry_1;
          var refChild = likesRef.child(data['selfid']); 
          refChild.child(data['partnerid']).set(new_entry_1);  
        }else{
          console.log("Partner he");
          var prev_rate = uid_object[data['partnerid']]['rate'];
          var prev_total_chat = uid_object[data['partnerid']]['total_chat'];
          var new_entry = {};
          var new_entry_1 = {};
          new_entry_1['rate'] = parseFloat(data['rate']) + prev_rate;
          new_entry_1['total_chat'] = 1+ prev_total_chat;
          new_entry[data['partnerid']] = new_entry_1;
          likesRef.child(data['selfid']).update(new_entry);  
        } 
      }
    }
    resolve(data);   
  },function(errorObject){
    console.log("The read failed: " + errorObject.code);
    resolve(data);
  });
});



process.on('SIGINT', function() {
  console.log('Starting queue shutdown');
  waitForUsers.shutdown().then(function() {
    console.log('Finished queue shutdown');
    process.exit(0);
  });
});