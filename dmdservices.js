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
			io.emit(CONST.PUSH_MEDIA_PLAYLIST, res);
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

module.exports.collabeesStream = function (io, request, total) {
	total = total || 3;
	utility.fetch(
		request,
		'admin-ajax.php?action=get_feed&latest='+ moment().tz('Asia/Jakarta').format() +'&nonce=e07bf53f7a&page=1&total='+total+'&km_tv',
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

function transformStream(data) {
	var streams = [];

	if (data.feed) {
		streams = _.map(data.feed, function(stream) {
			return {
				subject: stream.display_name,
				predicate: stream.title,
				object: stream.object.name,
				createAt: moment(stream.CreateDate).tz('Asia/Jakarta').fromNow(),
				picture: stream.theUser.profile_picture
			};
		});
	}

	return streams;
}


