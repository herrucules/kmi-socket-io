var CONST = require('./constants')();
var utility = require('./utility');
var _ = require('lodash');
var moment = require('moment-timezone');

module.exports.totalProject = function (io, request) {
	utility.fetch(
		request, 
		'admin-ajax.php?kmi_tv=1&action=get_project&nonce=1&groupid=1&orderby=startdate&total=-1&get_total=1',
		function(res) {
			io.emit(CONST.PUSH_TOTAL_PROJECT, res);
		});
};

module.exports.totalJobRequest = function (io, request) {
	utility.fetch(
		request, 
		'admin-ajax.php?kmi_tv=1&action=get_job_request&groupid=1&nonce=b981def24c&total=-1&get_total=1',
		function(res) {
			io.emit(CONST.PUSH_TOTAL_JOB_REQUEST, res);
		});
};

module.exports.totalIncompleteJob = function (io, request) {
	utility.fetch(
		request, 
		'admin-ajax.php?action=get_job_request&groupid=1&nonce=b981def24c&total=-1&kmi_tv&completed=0&get_total=1',
		function(res) {
			io.emit(CONST.PUSH_TOTAL_INCOMPLETE_JOB, res);
		});
};

module.exports.mediaPlaylist = function (io, request) {
	utility.fetch(
		request, 
		'admin-ajax.php?action=tv_services&kmi_tv&liveToday=1',
		function(res) {
			io.emit(CONST.PUSH_MEDIA_PLAYLIST, 
				JSON.stringify(transformMedia(JSON.parse(res)))
				);
		});
};

module.exports.jobPhases = function (io, request) {
	utility.fetch(
		request,
		'admin-ajax.php?action=get_job_request&groupid=1&nonce=b981def24c&total=-1&kmi_tv&completed=0',
		function(res) {
			io.emit(CONST.PUSH_JOB_PHASES, 
				JSON.stringify(transformJobPhase(JSON.parse(res)))
				);
		});
};

module.exports.collabeesStreams = function (io, request, total) {
	total = total || 3;
	utility.fetch(
		request,
		'admin-ajax.php?action=get_feed&kmi_tv&nonce=e07bf53f7a&page=1&total='+total,
		function(res) {
			io.emit(CONST.PUSH_COLLABEES_STREAMS, 
				JSON.stringify(transformStreams(JSON.parse(res)))
				// res
				);
		});
};

module.exports.collabeesSingleStream = function (io, request, since) {
	since = since || moment().tz('Asia/Jakarta').format();
	utility.fetch(
		request,
		'admin-ajax.php?action=get_feed&kmi_tv&nonce=e07bf53f7a&page=1&total=1&latest='+since,
		function(res) {
			io.emit(CONST.PUSH_COLLABEES_STREAM, 
				JSON.stringify(transformStream(JSON.parse(res)))
				);
		});
};

function transformJobPhase(data) {
   	var phases = [];

   	if (data.job_request.length) {

   		_.each(data.job_request[0].progress, function(progress) {
   			phases[progress.ProjectPhaseOrder] = {
   				name: progress.PhaseName,
   				total: 0
   			};
   		});

		_.each(data.job_request,function(job){
		    var incompleteFound = false;                        
		    
		    var phaseInProgress = _.find(job.progress, function(progress){  
		        return progress.CompleteDate === null;
		    });
		    
		    if (phaseInProgress === undefined) {
		    	return;
		    } else {
		    	phases[phaseInProgress.ProjectPhaseOrder].total++;
		    }  
		});

	}

	phases = _.compact(phases);

	return phases;
}

function transformStreams(data) {
	var streams = [];

	if (data.feed) {
		streams = _.map(data.feed, function(stream) {
			return {
				streamID: stream.FeedID,
				subject: stream.display_name,
				predicate: ' do "'+ stream.title + ('' || ' '+stream.object.PhaseName) + '"',
				object: stream.object.name || stream.object.TaskTitle,
				type: stream.FeedType,
				createAt: moment(stream.CreateDate).tz('Asia/Jakarta').fromNow(),
				picture: stream.theUser.profile_picture
			};
		});
	}

	return streams;
}

function transformStream(data) {
	var stream = {};

	if (data.feed.length == 1) {
		stream = data.feed[0];
		stream = {
				streamID: stream.FeedID,
				subject: stream.display_name,
				predicate: ' do "'+ stream.title + ('' || ' '+stream.object.PhaseName) + '"',
				object: stream.object.name || stream.object.TaskTitle,
				type: stream.FeedType,
				createAt: moment(stream.CreateDate).tz('Asia/Jakarta').fromNow(),
				picture: stream.theUser.profile_picture
		};
	}

	return stream;
}

function transformMedia(data) {
	var playlist = [];

	if (data.content_tv.length) {
		playlist = _.map(data.content_tv, function(media) {
			return {
				contentID: media.contentID,
				mediaType: media.mediaType,
				title: media.title,
				URL: media.mediaType == 'youtube' ? parseVideo(media.URL).id : media.URL
			}
		});
	}

	return playlist;
}

function parseVideo (url) {
	    // - Supported YouTube URL formats:
	    //   - http://www.youtube.com/watch?v=My2FRPA3Gf8
	    //   - http://youtu.be/My2FRPA3Gf8
	    //   - https://youtube.googleapis.com/v/My2FRPA3Gf8
	    // - Supported Vimeo URL formats:
	    //   - http://vimeo.com/25451551
	    //   - http://player.vimeo.com/video/25451551
	    // - Also supports relative URLs:
	    //   - //player.vimeo.com/video/25451551

	    url.match(/(http:|https:|)\/\/(player.|www.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com))\/(video\/|embed\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/);

	    if (RegExp.$3.indexOf('youtu') > -1) {
	        var type = 'youtube';
	    } else if (RegExp.$3.indexOf('vimeo') > -1) {
	        var type = 'vimeo';
	    }

	    return {
	        type: type,
	        id: RegExp.$6
	    };
	}