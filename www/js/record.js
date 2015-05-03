var my_recorder = null, my_player = null;

// for recording: do not specify any directory
var mediaFileFullName = null; 
var mediaRecFile = "myRecording100.wav";
var checkFileOnly = false;
var mediaFileExist = false;
var currentPage = "page1";
var playing = false;
var hardstop = false; // because we need a state for the stopCallback function

// for recording animation
var timer;
var timerCurrent;
var timerFinish;
var timerSeconds;

function drawTimer(percent, seconds){
    $('#'+currentPage+' div.timer').html('<div class="percent"></div><div id="slice"'+(percent > 50?' class="gt50"':'')+'><div class="pie"></div>'+(percent > 50?'<div class="pie fill"></div>':'')+'</div>');

    var deg = 360/100*percent;

    $('#'+currentPage+' #slice .pie').css({
        '-webkit-transform':'rotate('+deg+'deg)',
        'transform':'rotate('+deg+'deg)'
    });

     $('#'+currentPage+' .percent').html(Math.round(seconds));
}

function stopWatch(){
    var seconds = (timerFinish-(new Date().getTime()))/1000;
    if(seconds <= 0){
        drawTimer(100, 0);
        stopRecording();
    }else{
        var percent = 100-((seconds/timerSeconds)*100);
        drawTimer(percent, seconds);
    }
}

function stopRecording() {
    my_recorder.stopRecord(); // the file should be moved to "/sdcard/"+mediaRecFile
    // $('.'+currentPage+' .record').toggleClass('recording');
    $('#'+currentPage+' .record-timer').slideUp();
    $('#'+currentPage+' .record-link').slideDown();
    // $('.'+currentPage+' .stop').hide().toggleClass('recording');

    clearProgressTimmer();
    console.log("***test: recording stopped***");
}

function clearProgressTimmer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
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

    // start the countdown to stop
    timerSeconds = 25;
    timerCurrent = 0;
    timerFinish = new Date().getTime()+(timerSeconds*1000);
    timer = setInterval('stopWatch()',50);
}


function onMediaCallSuccess() {
    console.log("***test: new Media() succeeded ***");
}
// Media() error callback        
function onMediaCallError(error) {
    console.log("***test: new Media() failed ***");
    $('.turn-page-wrapper:visible').find('.page .play-text').text('play');
    $('.turn-page-wrapper:visible').find('.page .fa').removeClass('fa-pause').addClass('fa-play');
}

function stopCallback(status){
    console.log('**** WTF ****', status);
    if(status == 4 && !hardstop){
        $('.turn-page-wrapper:visible').find('.page .play-text').text('play');
        $('.turn-page-wrapper:visible').find('.page .fa').removeClass('fa-pause').addClass('fa-play');   
    }
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
        console.log('there is indeed a player...');
        my_player.getCurrentPosition(function(position){
            console.log('the position:', position);
            if( playing ){
                my_player.play();
            } else {
                my_player = new Media(mediaRecFile, onMediaCallSuccess, onMediaCallError, stopCallback);
                // Play audio
                if (my_player) {
                    my_player.play();
                    hardstop = false;
                    playing = true;
                }
           }
        });
    } else {
        my_player = new Media(mediaRecFile, onMediaCallSuccess, onMediaCallError, stopCallback);
        // Play audio
        if (my_player) {
            my_player.play();
            playing = true;
            hardstop = false;
        }
    }
}

function pauseMusic(currentRecording){
    if (my_player) {
        my_player.pause();
    }

}

// Stop audio        
//
function stopMusic(currentRecording) {
    // stop audio
    hardstop = true; // because we need a state for the stopCallback function
    if (my_player) {
        my_player.stop();
        playing = false;
    }
}


$(document).ready(function(){
    $(document).on('click', '.record_button .record-link', function(e){
        currentPage = $(this).parents('.page').attr('id');
        $(this).slideUp();
        $(this).siblings('.record-timer').slideDown();
        startRecording(currentPage);
    });

    $(document).on('click', '.play-button', function(e){
        currentPage = $(this).parents('.page').attr('id');
        if($(this).find('.play-text').text() == 'play'){
            playMusic(currentPage); 
            $(this).find('.play-text').text('pause');
            $(this).find('.fa').removeClass('fa-play').addClass('fa-pause');
        } else {
            pauseMusic(currentPage); 
            $(this).find('.play-text').text('play');   
            $(this).find('.fa').removeClass('fa-pause').addClass('fa-play');
        }
    });

    $(document).on('click', '.stop-button', function(e){
        currentPage = $(this).parents('.page').attr('id');
        console.log("stopping...", currentPage);
        try {
            stopRecording();
        }
        catch(err) {
            console.log('skipped stop recording');
        }
        stopMusic(currentPage);
        // now update play button
        $(this).parents('.page').find('.play-text').text('play');   
        $(this).parents('.page').find('.fa').removeClass('fa-pause').addClass('fa-play');
    });
});