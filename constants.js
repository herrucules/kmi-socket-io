var constants = { 
	ENDPOINT_HOST: 'dmd.binus.ac.id',
	ENDPOINT_PATH: '/collabees/wp-admin/',
	PUSH_TOTAL_PROJECT: "push-total-project",
	PUSH_TOTAL_NEAR_DEADLINE_PROJECT: "push-total-near-deadline-project",
	PUSH_TOTAL_JOB_REQUEST: "push-total-job-request",
	PUSH_TOTAL_INCOMPLETE_JOB: "push-incomplete-job",
	PUSH_MEDIA_PLAYLIST: "push-media-playlist",
	PUSH_JOB_PHASES: "push-job-phases",
	PUSH_COLLABEES_STREAMS: "push-collabees-streams",
	PUSH_COLLABEES_STREAM: "push-collabees-stream"
	}

module.exports = function() {
  return Object.assign({}, constants);
}