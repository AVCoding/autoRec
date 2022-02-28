  

   // ============================================================>>>> AUTOREC  


  $('.autorecOn').on('click', function(){
      alert('autorec started');
      var mediaRecorder;
      var mediaArr = {};

      const peer = new Peer({
        host: '213.226.114.12',
        // host: 'localhost',
        port: 9000,
        path: '/'
        // alive_timeout: 1000
      });
      var currentCall;
      peer.on("open", function (id) {
        document.getElementById("uuid").textContent = id;
      });

      peer.on('error', function(el){
        alert('close text ERROR (internet included)');
        console.log(el);
        if (document.querySelector("#videoCaller-" + peer.id) != null) {
          document.querySelector("#videoCaller-" + peer.id).remove();

        }
        // document.querySelector("#videoCaller-" + peer.id).remove();
        
        // if(navigator.onLine){
        //   alert('online');
        // } else {
        //   alert('offline');
        // }  
      });

      peer.on('disconnected', function(){
        alert('close text DISCONNECTED verev');
      });

      var callerId;


      // start call

      var myVariable = 'this is a test';
      const peerId = document.querySelector("input").value;
      var conn = peer.connect(peerId);
      conn.on('open', function(){
          conn.send(myVariable);
          var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
          getUserMedia({video: true, audio: true}, function(stream) {
            const call = peer.call(peerId, stream);
            currentCall = call;
            var callerVideo = document.createElement('video');
            call.on('stream', function(remoteStream) {
              if( document.querySelector("#videoCaller-" + peer.id) != null) {
                document.querySelector("#videoCaller-" + peer.id).remove();
              }
             
              document.getElementById("video-list").appendChild(callerVideo).setAttribute("id", "videoCaller-" + peer.id );
              callerId =  peer.id;
              callerVideo.srcObject = stream;
              
              callerVideo.load();
              setTimeout(function() {
                callerVideo.play();
              }, 0);
              //callerVideo.play();
            });
          });

      }, function(err) {
        console.log('Failed to get local stream' ,err);
      });

      conn.on('close', function(){
        alert('close text');
        document.getElementById("videoCaller-" + callerId).remove();
        peer.destroy();
        // $("#videoCaller-" + peer.id + '"').remove();
      });


      // answer call
 
      peer.on('connection', function(conn) {
        conn.on('data', function(data){
          // Will print 'this is a test'
          console.log('data');
        });
        conn.on('close', function(el){
          alert('conn close text');
          document.getElementById("video-" + conn.peer).closest('.live').remove();
        });   
        conn.on('disconnected', function(){
          alert('conn disconnected');
        });
      });

      var network;

      peer.on("call", (call) => {
        if (confirm(`Accept call from ${call.peer}?`)) {
          // grab the camera and mic
          navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
              call.answer(stream);
              // save the close function
              currentCall = call;
              // change to the video view
              // document.querySelector("#menu").style.display = "none";
              // document.querySelector("#live").style.display = "block";
            
              
              call.on("stream", (remoteStream) => {
                remoteStreamNetwork = remoteStream;

                // when we receive the remote stream, play it
                // document.getElementById("remote-video").srcObject = remoteStream;
                // document.getElementById("remote-video").play();

                $("#video-" + call.peer).parents('.live').remove(); //Remove remote video if exists before
                $(".record-wrapper-" + call.peer).parents('.live').remove();      

                $("#video-list").append("<div class='live'>" +
                                          "<video id='video-" + call.peer + "' autoplay style='max-width: 400px;' class='remote-video'></video> " +
                                            "<div data-record='"+ call.peer + "'  class='rec'>" +
                                               "<button class='btn'>record</button>" +
                                                "<button class='stopbtn'>stop record</button>" + 
                                            "</div>" +
                                        "</div> "); //Create new video element

            
                $("#video-"+ call.peer).prop("srcObject", remoteStream); //Put stream to the video
                remoteStreamState = remoteStream;


                var currentVideo =  document.getElementById('video-' + call.peer);
                videoRecOn(call.peer, currentVideo);

                
                  network = setInterval(function(){
                 
                    if(remoteStream.getVideoTracks()[0].muted == true && document.querySelector("#video-"+ call.peer) != null){
                      console.log(remoteStream.getVideoTracks()[0].muted);

                      document.querySelector("#video-"+ call.peer).closest('.live').remove();
                      clearInterval(network);
                      //call.destroy();
                      remoteStream.getVideoTracks()[0].stop();
                      //call.close();
                      return ;
                    }
                    //if(remoteStream.getVideoTracks()[0].muted && document.querySelector("#video-"+ call.peer) == null){
                     // console.log(remoteStream.getVideoTracks()[0].muted);
                    //}
                     console.log(remoteStream.getVideoTracks()[0].muted);

                  }, 4000);


              });

            })
            .catch((err) => {
              console.log("Failed to get local stream:", err);
            });
        
        } else {
          // user rejected the call, close it
          call.close();
        }
      });

 // =======
  });

 // =======


  $('.autorecOff').on('click', function(){
    alert('autorec OFF');
    videoRecOff($(this).parents('.rec').attr('data-record'));
  });
 





  $(document).on('click', '.disconnectbtn' , function(){

    //peer.disconnect();
    peer.destroy();
    alert('Disconnected');
      // $(this).parents('');
  });


      


// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$


  
  
  // record of video starts
  function videoRecOn(recID, currentVideo){
    console.log(recID);
    if (currentVideo.srcObject != null) {
        alert('ners');

        mediaArr[recID] =  new MediaRecorder(currentVideo.srcObject);
        mediaArr[recID].start(1000);
        var parts = [];

        mediaArr[recID].ondataavailable = function(e){      
          parts.push(e.data);
          console.log(parts);
        }
        mediaArr[recID]['blobParts'] = parts;

        console.log('mediaArr[recID].state');
        console.log(mediaArr[recID].state);
    }
    else{
      alert('no stream detected');
    }
  }
  // record of video stops
  function videoRecOff(recID){
    if ( mediaArr[recID] != undefined) {

      mediaArr[recID].stop();
      mediaArr[recID].onstop = function(e) {
        console.log('mediaArr[recID].state in OFF');
        console.log(mediaArr[recID].state);

        if ( mediaArr[recID]['blobParts'] ) {
          var blob =  new Blob(mediaArr[recID]['blobParts'], {
            type: 'video/webm'
            // type: 'video\/mp4'
          });
          const url =  URL.createObjectURL(blob);
          const a =  document.createElement('a');
          document.body.appendChild(a);
          // a.style = 'display: none';
          a.href =  url;
          a.text = 'jkbhsdjs';
          a.download = 'test.webm';
          // a.download = 'test.mp4';
          a.click();
          delete  mediaArr[recID];
          // currentCall.close();
        }


      }

    }    
  }
  
  // start record peer media - video , audio
  $(document).on('click', '.btn', function(el){

    alert('durs');
    console.log(el);

    el.target.parentElement.previousElementSibling.style.width = "100px";

    var recID =  $(this).parents('.rec').attr('data-record'); 
    alert(recID);

    var currentVideo =  el.target.parentElement.previousElementSibling;
    videoRecOn(recID, currentVideo);
  });
  // stop record peer media - video , audio
  $(document).on('click', '.stopbtn', function(){
      alert('stop');
      videoRecOff($(this).parents('.rec').attr('data-record'));
  });


























   








   // ============================================================ //













































// ============================================================================================================================







  // const peer = new Peer('9de2dfb9-29f3-4d69-988b-734681133759');
  // const peer = new Peer();
// const customGenerationFunction = () => (Math.random().toString(36) + '0000000000000000000').substr(2, 16);
// var id = Math.random().toString(16).slice(2)



// const { PeerServer } = require('peer');
// const peerServer = PeerServer({ host: 'localhost',port: 9000, path: '/' });


  const peer = new Peer({
      host: '213.226.114.12',
      // host: 'localhost',
      port: 9000,
      path: '/'
      // alive_timeout: 1000
    });
  var currentCall;
  peer.on("open", function (id) {
    document.getElementById("uuid").textContent = id;
  });

  peer.on('error', function(){
    alert('close text ERROR (internet included)');
    document.querySelector("#videoCaller-" + peer.id).remove();
    
    if(navigator.onLine){
      alert('online');
    } else {
      alert('offline');
    }  
  });

  peer.on('disconnected', function(){
    alert('close text DISCONNECTED verev');
  });




  $(document).on('click', '.disconnectbtn' , function(){

    //peer.disconnect();
    peer.destroy();
    alert('Disconnected');
      // $(this).parents('');
  });

  var callerId;
  // start call
  async function callUser() {
      var myVariable = 'this is a test';
      const peerId = document.querySelector("input").value;
      var conn = peer.connect(peerId);
      conn.on('open', function(){
          conn.send(myVariable);
          var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
          getUserMedia({video: true, audio: true}, function(stream) {
            const call = peer.call(peerId, stream);
            currentCall = call;
            var callerVideo = document.createElement('video');
            call.on('stream', function(remoteStream) {
              if( document.querySelector("#videoCaller-" + peer.id) != null) {
                document.querySelector("#videoCaller-" + peer.id).remove();
              }
             
              document.getElementById("video-list").appendChild(callerVideo).setAttribute("id", "videoCaller-" + peer.id );
              callerId =  peer.id;
              callerVideo.srcObject = stream;
              
              callerVideo.load();
              setTimeout(function() {
                callerVideo.play();
              }, 0);
              //callerVideo.play();
            });
          });

      }, function(err) {
        console.log('Failed to get local stream' ,err);
      });

      conn.on('close', function(){
        alert('close text');
        document.getElementById("videoCaller-" + callerId).remove();
        peer.destroy();
        // $("#videoCaller-" + peer.id + '"').remove();
      });
  }

  // answer call
 
  
  peer.on('connection', function(conn) {

    conn.on('data', function(data){
      // Will print 'this is a test'
      console.log('data');
    });

    conn.on('close', function(el){
      alert('conn close text');
      document.getElementById("video-" + conn.peer).closest('.live').remove();
      //peer.destroy();
      // $("#videoCaller-" + peer.id + '"').remove();
    });
    
    conn.on('disconnected', function(){
      alert('conn disconnected');
    });
  });

var network;
//var remoteStreamState;
peer.on("call", (call) => {
      if (confirm(`Accept call from ${call.peer}?`)) {
        // grab the camera and mic
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: true })
          .then((stream) => {
            call.answer(stream);
            // save the close function
            currentCall = call;
            // change to the video view
            // document.querySelector("#menu").style.display = "none";
            // document.querySelector("#live").style.display = "block";
          
            
            call.on("stream", (remoteStream) => {
              remoteStreamNetwork = remoteStream;

              // when we receive the remote stream, play it
              // document.getElementById("remote-video").srcObject = remoteStream;
              // document.getElementById("remote-video").play();

              $("#video-" + call.peer).parents('.live').remove(); //Remove remote video if exists before
              $(".record-wrapper-" + call.peer).parents('.live').remove();      

              $("#video-list").append("<div class='live'>" +
                                        "<video id='video-" + call.peer + "' autoplay style='max-width: 400px;' class='remote-video'></video> " +
                                          "<div data-record='"+ call.peer + "'  class='rec'>" +
                                             "<button class='btn'>record</button>" +
                                              "<button class='stopbtn'>stop record</button>" + 
                                          "</div>" +
                                      "</div> "); //Create new video element

          
              $("#video-"+ call.peer).prop("srcObject", remoteStream); //Put stream to the video
              remoteStreamState = remoteStream;
              
                network = setInterval(function(){
               
                  if(remoteStream.getVideoTracks()[0].muted == true && document.querySelector("#video-"+ call.peer) != null){
                    console.log(remoteStream.getVideoTracks()[0].muted);

                    document.querySelector("#video-"+ call.peer).closest('.live').remove();
                    clearInterval(network);
                    //call.destroy();
                    remoteStream.getVideoTracks()[0].stop();
                    //call.close();
                    // return ;
                  }
                  //if(remoteStream.getVideoTracks()[0].muted && document.querySelector("#video-"+ call.peer) == null){
                   // console.log(remoteStream.getVideoTracks()[0].muted);
                  //}
                   console.log(remoteStream.getVideoTracks()[0].muted);

                }, 4000);


            });

          })
          .catch((err) => {
            console.log("Failed to get local stream:", err);
          });
      
      } else {
        // user rejected the call, close it
        call.close();
      }

      
    });



  // setInterval(function(){
  //   console.log(peer);

  //   if(peer != null && peer.disconnected == false && peer.destroyed
  //   == false && currentCall != null)
  //   {
  //     console.log('Connected to PeerServer');
  //   // document.getElementById("peerServerStatus").innerHTML = "Connected to PeerServer";
  //   }
  //   else
  //   {
  //     console.log('Not connected to PeerServer');
  //   }
  // }, 4000);





            

  function endCall() {
    // Go back to the menu
    // document.querySelector("#menu").style.display = "block";
    // document.querySelector("#live").style.display = "none";
    document.querySelector(".live").style.display = "none";
    // If there is no current call, return
    if (!currentCall) return;
    // Close the call, and reset the function
    try {
      currentCall.close();
    } catch {}
    currentCall = undefined;
  }



  // ============================================================>>>> RECORD STREAM

  // window.onload = function(){ 

  var mediaRecorder;
  var mediaArr = {};
  
  // record of video starts
  function videoRecOn(recID, currentVideo){
    console.log(recID);
    if (currentVideo.srcObject != null) {
        alert('ners');

        mediaArr[recID] =  new MediaRecorder(currentVideo.srcObject);
        mediaArr[recID].start(1000);
        var parts = [];

        mediaArr[recID].ondataavailable = function(e){      
          parts.push(e.data);
          console.log(parts);
        }
        mediaArr[recID]['blobParts'] = parts;

        console.log('mediaArr[recID].state');
        console.log(mediaArr[recID].state);
    }
    else{
      alert('no stream detected');
    }
  }
  // record of video stops
  function videoRecOff(recID){
    if ( mediaArr[recID] != undefined) {

      mediaArr[recID].stop();
      mediaArr[recID].onstop = function(e) {
        console.log('mediaArr[recID].state in OFF');
        console.log(mediaArr[recID].state);

        if ( mediaArr[recID]['blobParts'] ) {
          var blob =  new Blob(mediaArr[recID]['blobParts'], {
            type: 'video/webm'
            // type: 'video\/mp4'
          });
          const url =  URL.createObjectURL(blob);
          const a =  document.createElement('a');
          document.body.appendChild(a);
          // a.style = 'display: none';
          a.href =  url;
          a.text = 'jkbhsdjs';
          a.download = 'test.webm';
          // a.download = 'test.mp4';
          a.click();
          delete  mediaArr[recID];
          // currentCall.close();
        }


      }

    }    
  }
  
  // start record peer media - video , audio
  $(document).on('click', '.btn', function(el){

    alert('durs');
    console.log(el);

    el.target.parentElement.previousElementSibling.style.width = "100px";

    var recID =  $(this).parents('.rec').attr('data-record'); 
    alert(recID);

    var currentVideo =  el.target.parentElement.previousElementSibling;
    videoRecOn(recID, currentVideo);
  });
  // stop record peer media - video , audio
  $(document).on('click', '.stopbtn', function(){
      alert('stop');
      videoRecOff($(this).parents('.rec').attr('data-record'));
  });

  // ============================================================

  // $(document).on('click', '.btn', function(el){
  //     // const parts = [];
  //     // let mediaRecorder;

  //     // $('.btn').on('click', function(){
  //       alert('durs');
  //       console.log(el);
  //       // $(this).siblings('.remote-video').eq(0).css('width', '100px');
  //       el.target.parentElement.previousElementSibling.style.width = "100px";
  //       // var currentVideo = $(this).siblings('.remote-video').eq(0);
  //       // var currentVideo = document.querySelector('.remote-video');
  //       // console.log(document.getElementById('remote-video').srcObject);
  //       // if (document.getElementById('remote-video').srcObject != null) {
  //       var recID =  $(this).parents('.rec').attr('data-record') ; 
  //       alert(recID);

  //       var currentVideo =  el.target.parentElement.previousElementSibling;
  //       if (currentVideo.srcObject != null) {
  //         alert('ners');
  //         // alert( el.target.parentElement.getAttribute('data-record') );
  //         mediaRecorder = new MediaRecorder(currentVideo.srcObject);
  //         mediaRecorder.start(1000);

  //         mediaRecorder.ondataavailable = function(e){
  //           // parts.push(e.data);
  //           // alert(parts.length);
           
  //           for (var i = 0; i < parts.length; i++) {
  //             // if (parts[i].length > 1) {
  //               // parts[i].push(e.data);
  //               // console.log(el.data);


  //               // if (parts[i][recID] != undefined) {
  //               //   if (i == (parts.length - 1) ) {
  //               //     if (parts[i][recID]) {
  //               //       parts[i][recID] = [];
  //               //       parts[i][recID].push(e.data);
  //               //     }
  //               //   }
  //               //   if (parts[i][recID]) {
  //               //     parts[i][recID] = [];
  //               //     parts[i][recID].push(e.data);
  //               //   }
  //               //   else{
  //               //     parts[i][recID].push(e.data);
  //               //   }
                  
  //               // }
  //               // if (parts[i][recID] == undefined) {
  //               //   parts[i][recID] = [e.data];
  //               // } 


  //             // }

  //             // if (parts[i].length < 1) { 

  //               if (parts[i][recID] != undefined) {
  //                 parts[i][recID].push(e.data);
  //               }

  //               if (parts[i][recID] ==  undefined) {
  //                 parts[i][recID] =  [e.data];
  //               }

  //             // }
  //           }
  //           console.log(parts);
  //         }

  //         // mediaRecorder.onstop = e => export_media(new Blob(parts));

  //         mediaRecorder.onstop = function(e) {
  //           console.log("data available after MediaRecorder.stop() called.");

  //           var audio = document.createElement('audio');
  //           audio.controls = true;
  //           var blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
  //           var audioURL = window.URL.createObjectURL(blob);
  //           audio.src = audioURL;
  //           console.log("recorder stopped");
  //         }


  //       }
  //       else{
  //         alert('no stream detected');
  //       }
  //     // });

  // });


  // $(document).on('click', '.stopbtn', function(){
  //   // $('.stopbtn').on('click', function(){

  //     alert('stop');
  //     // console.log($(this).eq());
  //     mediaRecorder.stop();
  //     // const blob =  new Blob(parts[0], {
  //     //   type: 'video/webm'
  //     // });

  //     // mediaRecorder.stop();

  //       for (var i = 0; i < parts.length; i++) {
  //         if ( parts[i][$(this).parents('.rec').attr('data-record')] ) {

  //           var blob =  new Blob(parts[i][$(this).parents('.rec').attr('data-record')], {
  //             type: 'video/webm'
  //             // type: 'video\/mp4'
  //           });
  //           const url =  URL.createObjectURL(blob);
  //           const a =  document.createElement('a');
  //           document.body.appendChild(a);
  //           // a.style = 'display: none';
  //           a.href =  url;
  //           a.text = 'jkbhsdjs';
  //           a.download = 'test.webm';
  //           // a.download = 'test.mp4';
  //           a.click();
  //           // delete parts[i][$(this).parents('.rec').attr('data-record')]; 
  //           // parts = [[]];

  //         }

  //       }


  //        parts = [[]]; 
    

  //     // const url =  URL.createObjectURL(blob);
  //     // const a =  document.createElement('a');
  //     // document.body.appendChild(a);
  //     // a.style = 'display: none';
  //     // a.href =  url;
  //     // a.download = 'test.webm';
  //     // a.click();



  //   // });
  // });

  // =======================================



// }










// window.onload = function(){ 
//   // const parts = [];
//   // let mediaRecorder;

//   // navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
//   //   document.getElementById('local-video').srcObject = stream;

//   //   document.getElementById('btn').onclick = function(){
//   //     mediaRecorder = new MediaRecorder(stream);
//   //     mediaRecorder.start(1000);
//   //     mediaRecorder.ondataavailable = function(e){
//   //       parts.push(e.data);
//   //     }
//   //   };

//   // });

//   document.getElementById('stopbtn').onclick = function(){
//   mediaRecorder.stop();
//   const blob =  new Blob(parts, {
//     type: 'video/webm'
//   });
//   const url =  URL.createObjectURL(blob);
//   const a =  document.createElement('a');
//   document.body.appendChild(a);
//   a.style = 'display: none';
//   a.href =  url;
//   a.download = 'test.webm';
//   a.click();
// };


// }











