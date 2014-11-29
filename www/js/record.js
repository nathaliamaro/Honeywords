var my_recorder = null, my_player = null;

// for recording: do not specify any directory
var mediaFileFullName = null; 
var mediaRecFile = "myRecording100.wav";
var checkFileOnly = false;
var mediaFileExist = false;



function stopRecording() {
    my_recorder.stopRecord(); // the file should be moved to "/sdcard/"+mediaRecFile

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
        if (recTime >= 10)
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
	mediaRecFile = currentRecording + ".wav";
	my_player = new Media(mediaRecFile, onMediaCallSuccess, onMediaCallError);
    
    // Play audio
    if (my_player) {
        my_player.play();
    }
}

