//	@ghasemkiani/commonbase/util/runner

const {cutil} = require("@ghasemkiani/commonbase/cutil");

const IDLE = new String("idle");
const STARTED = new String("started");
const PAUSED = new String("paused");
const STOPPED = new String("stopped");

const irunner = {
	_state: IDLE,
	get state() {
		return cutil.asString(this._state);
	},
	set state(state) {
		if (this._state !== state) {
			let event = {
				defaultPrevented: false,
				target: this,
				oldState: this,
				state: state,
			};
			this.emit("state-change", event);
			if (!event.defaultPrevented) {
				this._state = state;
			}
		}
	},
	async toRun() {},
	async toStart() {
		if (this._state === IDLE) {
			this.state = STARTED;
			await this.toRun();
		}
		return this;
	},
	run() {},
	start() {
		if (this._state === IDLE) {
			this.state = STARTED;
			this.run();
		}
		return this;
	},
	pause() {
		if (this._state === STARTED) {
			this.state = PAUSED;
		}
		return this;
	},
	resume() {
		if (this._state === PAUSED) {
			this.state = STARTED;
		}
		return this;
	},
	toggle() {
		if (this._state === STARTED) {
			this.state = PAUSED;
		} else if (this._state === PAUSED) {
			this.state = STARTED;
		}
		return this;
	},
	stop() {
		this.state = STOPPED;
		return this;
	},
	reset() {
		if (!this.isRunning()) {
			this.state = IDLE;
		}
		return this;
	},
	isIdle() {
		return this._state === IDLE;
	},
	isStarted() {
		return this._state === STARTED;
	},
	isPaused() {
		return this._state === PAUSED;
	},
	isStopped() {
		return this._state === STOPPED;
	},
	isRunning() {
		return this.isStarted() || this.isPaused();
	},
	check() {
		if (!this.isRunning()) {
			throw new Error("Interrupted");
		}
		return !this.isPaused();
	},
};

module.exports = {irunner};