
   // ============================================================>>>> AUTOREC  
   var randomPeerId  =  Math.random().toString(36).substr(2, 9);
  const peer = new Peer( randomPeerId , {
    host: '213.226.114.12',
    // host: 'localhost',
    port: 9000,
    path: '/'
    // alive_timeout: 1000
  });
  var currentCall = {};
  var  myID;


  var mediaRecorder;
  var mediaArr = {};

  var pc ;
    peer.on("open", function (id) {
      document.getElementById("uuid").textContent = id;
      myID = id;

      // var conn;
      $(document).on('click','.autorecOn', function(){
          alert('autorec started');
          

          var callerId;


          // start call

          // var myVariable = 'this is a test';
          var myVariable = 'this is a test';
          const peerId = document.querySelector("input").value;
          pc = peer.connect(peerId);
        
          var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
          getUserMedia({video: true, audio: true}, function(stream) {
            const call = peer.call(peerId, stream);
            
            currentCall[peer.id] = call;
            console.log('currentCall');
            console.log(currentCall);

            var callerVideo = document.createElement('video');
            call.on('stream', function(remoteStream) {
              if( document.querySelector("#videoCaller-" + peer.id) != null) {
                document.querySelector("#videoCaller-" + peer.id).remove(); 
              }
             
              document.getElementById("video-list").appendChild(callerVideo).setAttribute("id", "videoCaller-" + peer.id );
              callerId = peer.id;
              callerVideo.srcObject = stream;
              
              callerVideo.load();
              setTimeout(function() {
                callerVideo.play();
              }, 0);
              //callerVideo.play();
            });
          });

          

          peer.on('close', function(){
            alert('close text');
            document.getElementById("videoCaller-" + callerId).remove();
            peer.destroy();
            // $("#videoCaller-" + peer.id + '"').remove();
          });

     // =======
    });

   // =======


    $(document).on('click','.autorecOff', function(){
      alert('autorec OFF');
      pc.send(myID);
      // videoRecOff($(this).parents('.rec').attr('data-record'));
    });


  });

  peer.on('error', function(){
    alert('close text ERROR (internet included)');
    alert(myID);
    document.querySelector("#videoCaller-" + myID).remove();
    
  });

  peer.on('disconnected', function(){
    alert('close text DISCONNECTED verev');
  });

  
  


 // answer call

  peer.on('connection', function(conn) {
    conn.on('data', function(data){
      // Will print 'this is a test'
      console.log('data');
      if (data == conn.peer ) {
        alert('ekav');
        videoRecOff(conn.peer);

      }
    });
    conn.on('close', function(el){
      alert('conn close text');
      // if (document.getElementById("video-" + conn.peer)) {
      //   document.getElementById("video-" + conn.peer).closest('.live').remove();
      // }
      
    });   
    conn.on('disconnected', function(){
      alert('conn disconnected');
    });
  });

  // var network;

  peer.on("call", (call) => {
    if (confirm(`Accept call from ${call.peer}?`)) {
      // grab the camera and mic
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          call.answer(stream);
          // save the close function
          // currentCall = call;
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

            currentCall[call.peer] = call;


            var currentVideo =  document.getElementById('video-' + call.peer);
            videoRecOn(call.peer, currentVideo);

            call.on('close', function(el){
              alert('call on close text');
              // if (document.getElementById("video-" + conn.peer)) {
              //   document.getElementById("video-" + conn.peer).closest('.live').remove();
              // }
              
            });  

            
                var network = setInterval(function(){
               
                  if(remoteStream.getVideoTracks()[0].muted == true && document.querySelector("#video-"+ call.peer) != null){
                    console.log(remoteStream.getVideoTracks()[0].muted);

                    document.querySelector("#video-"+ call.peer).closest('.live').remove();
                    clearInterval(network);
                    //call.destroy();
                    remoteStream.getVideoTracks()[0].stop();
                    //call.close();
                    return "";
                  }
                  else{
                  //if(remoteStream.getVideoTracks()[0].muted && document.querySelector("#video-"+ call.peer) == null){
                   // console.log(remoteStream.getVideoTracks()[0].muted);
                  //}
                   console.log(remoteStream.getVideoTracks()[0].muted);
                  }

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
    if (mediaArr[recID] != undefined) {

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
          // delete  mediaArr[recID];
          currentCall[recID].close();

          document.getElementById("video-" + recID).closest('.live').remove();


          //peer.destroy();
          alert('Disconnected');
        }

      }

    }    
  }
  
  // start record peer media - video , audio
  // $(document).on('click', '.btn', function(el){
  //   alert('durs');
  //   console.log(el);

  //   el.target.parentElement.previousElementSibling.style.width = "100px";

  //   var recID =  $(this).parents('.rec').attr('data-record'); 
  //   alert(recID);

  //   var currentVideo =  el.target.parentElement.previousElementSibling;
  //   videoRecOn(recID, currentVideo);
  // });

  // // stop record peer media - video , audio
  // $(document).on('click', '.stopbtn', function(){
  //     alert('stop');
  //     videoRecOff($(this).parents('.rec').attr('data-record'));
  // });



   


