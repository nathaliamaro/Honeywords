var my_recorder = null, my_player = null;

// for recording: do not specify any directory
var mediaFileFullName = null; 
var mediaRecFile = "myRecording100.wav";
var checkFileOnly = false;
var mediaFileExist = false;
var currentPage = "page1";

// for recording animation
var timer;
var timerCurrent;
var timerFinish;
var timerSeconds;


function drawTimer(percent, seconds){
    $('div.timer').html('<div class="percent"></div><div id="slice"'+(percent > 50?' class="gt50"':'')+'><div class="pie"></div>'+(percent > 50?'<div class="pie fill"></div>':'')+'</div>');

    var deg = 360/100*percent;

    $('#slice .pie').css({
        '-webkit-transform':'rotate('+deg+'deg)',
        'transform':'rotate('+deg+'deg)'
    });

     $('.percent').html(Math.round(seconds));
}

function stopWatch(){
    var seconds = (timerFinish-(new Date().getTime()))/1000;
    if(seconds <= 0){
        drawTimer(100, 0);
        clearInterval(timer);
    }else{
        var percent = 100-((seconds/timerSeconds)*100);
        drawTimer(percent, seconds);
    }
}


function stopRecording() {
    my_recorder.stopRecord(); // the file should be moved to "/sdcard/"+mediaRecFile
    // $('.'+currentPage+' .record').toggleClass('recording');
    $('.'+currentPage+' .record').show();
    $('.'+currentPage+' .stop').hide().toggleClass('recording');

    clearProgressTimmer();
    console.log("***test: recording stopped***");
}

function clearProgressTimmer() {
    if (progressTimmer) {
        clearInterval(progressTimmer);
        progressTimmer = null;
    } 
}

function recordNow() {
    if (my_recorder) {
        my_recorder.startRecord();
        console.log("***test:  recording started: in startRecording()***");
    }
    else {
        console.log("***test:  my_recorder==null: in startRecording()***");
    }

    // reset the recTime every time when recording
    recTime = 0;

    // Stop recording after 10 sec
    progressTimmer = setInterval(function() {
        recTime = recTime + 1;
        if (recTime >= 25)
            stopRecording();
        console.log("***test: interval-func()***");
    }, 1000);
}


function onMediaCallSuccess() {
    console.log("***test: new Media() succeeded ***");
}
// Media() error callback        
function onMediaCallError(error) {
    console.log("***test: new Media() failed ***");
}

function onOK_GetFile(fileEntry) {
    console.log("***test: File " + mediaRecFile + " at " + fileEntry.fullPath);
    
    // save the full file name
    mediaRecFile = fileEntry.fullPath;   
    // create media object using full media file name 
    my_recorder = new Media(mediaRecFile, onMediaCallSuccess, onMediaCallError);

    // specific for iOS device: recording start here in call-back function
    recordNow();
    
}

function onSuccessFileSystem(fileSystem) {
    console.log("***test: fileSystem.root.name: " + fileSystem.root.name);
    fileSystem.root.getFile(mediaRecFile, { create: true, exclusive: false }, onOK_GetFile, null);
    
}

function startRecording(page) {
    // create media object - overwrite existing recording
    // console.log(this);
    currentPage = page;
    $('.'+page+' .record').hide();
    $('.'+page+' .stop').show().toggleClass('recording');

	mediaRecFile = page + ".wav";  	
    if (my_recorder){
        my_recorder.release();
    }

    // start the countdown
    timerSeconds = 25;
    timerCurrent = 0;
    timerFinish = new Date().getTime()+(timerSeconds*1000);
    timer = setInterval('stopWatch()',50);
    alert('started countdown thing!');

    //first create the file
    checkFileOnly = false;
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onSuccessFileSystem, function() {
        console.log("***test: failed in creating media file in requestFileSystem");
    });

    console.log("***test: new Media() for ios***");

}

// Play audio        
//
function playMusic(currentRecording) {
    //not being able to click more than once
    //we want to know if it is running
    //current position will let us know if its being played 
    //Because if its running is more than 0 and less than get Duration
    mediaRecFile = "/" + currentRecording + ".wav";
    if(my_player){
        my_player.getCurrentPosition(function(position){
            if( position > 0  && position < my_player.getDuration()){
                console.log('dont do anything... right?');
            } else {
                my_player = new Media(mediaRecFile, onMediaCallSuccess, onMediaCallError);
                // Play audio
                if (my_player) {
                    my_player.play();
                }
           }
        });
    } else {
        my_player = new Media(mediaRecFile, onMediaCallSuccess, onMediaCallError);
        // Play audio
        if (my_player) {
            my_player.play();
        }
    }
}

// Stop audio        
//
function stopMusic(currentRecording) {
    // stop audio
    if (my_player) {
        my_player.stop();
    }
}


