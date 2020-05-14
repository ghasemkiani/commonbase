//	@ghasemkiani/commonbase/util/quantity

const {Base} = require("@ghasemkiani/commonbase/base");
const {cutil} = require("@ghasemkiani/commonbase/cutil");

class Quantity extends Base {
	// _space
	// _value
	// _unit
	// _k
	get space() {
		if (cutil.isNil(this._space)) {
			this._space = true;
		}
		return !!this._space;
	}
	set space(space) {
		this._space = space;
	}
	get value() {
		if (cutil.isNil(this._value)) {
			this._value = 0;
		}
		return Number(this._value);
	}
	set value(value) {
		this._value = value;
	}
	get unit() {
		if (cutil.isNil(this._unit)) {
			this._unit = this.defUnit();
		}
		return String(this._unit);
	}
	set unit(unit) {
		this._unit = unit;
	}
	get k() {
		if (cutil.isNil(this._k)) {
			this._k = this.defK();
		}
		return Number(this._k);
	}
	set k(k) {
		this._k = k;
	}
	fromString(string) {
		let s = cutil.asString(string).trim();
		let v = parseFloat(s);
		if (!isNaN(v)) {
			let r = /^(-?\d*(?:\.\d*)?(?:e\d*)?)\s*(.*)$/i;
			let u = r.exec(s)[2];
			try {
				if (u) {
					this.u(u);
				}
				this.v(v);
			} catch (e) {}
		}
		return this;
	}
	toString() {
		return this.n() + (this.space ? " " : "") + this.unit;
	}
	nFixed(decimals) {
		return this.n().toFixed(decimals);
	}
	sFixed(decimals) {
		return this.nFixed(decimals) + (this.space ? " " : "") + this.unit;
	}
	v(...args) {
		if (args.length === 0) {
			return this.value / this.k;
		} else {
			let v = args[0];
			this.value = v * this.k;
			return this;
		}
	}
	n(...args) {
		return this.v(...args);
	}
	s(...args) {
		if (args.length === 0) {
			return this.toString();
		} else {
			let s = args[0];
			this.fromString(s);
			return this;
		}
	}
	u(...args) {
		if (args.length === 0) {
			return this.unit;
		} else {
			let unit = args[0];
			let k = unit in this.kMap ? this.kMap[unit] : 1;
			this.unit = unit;
			this.k = k;
			return this;
		}
	}
	get kMap() {
		if (!this._kMap) {
			this._kMap = this.defKMap();
		}
		return this._kMap;
	}
	set kMap(kMap) {
		this._kMap = kMap;
	}
	delta(delta) {
		if(delta instanceof Quantity) {
			delta = delta.u(this.u()).n();
		}
		this.value += delta * this.k;
		return this;
	}
	scale(scale) {
		this.value *= scale;
		return this;
	}
	defUnit() {
		return "";
	}
	defK() {
		return 1;
	}
	defKMap() {
		return {};
	}
}

class Time extends Quantity {
	defUnit() {
		return "s";
	}
	defKMap() {
		return {
			"ns": 10 ** -9,
			"us": 10 ** -6,
			"μs": 10 ** -6,
			"ms": 10 ** -3,
			"s": 1,
			"sec": 1,
			"m": 60,
			"min": 60,
			"h": 60 * 60,
			"hr": 60 * 60,
			"hour": 60 * 60,
			"d": 60 * 60 * 24,
			"day": 60 * 60 * 24,
			"w": 60 * 60 * 24 * 7,
			"wk": 60 * 60 * 24 * 7,
			"week": 60 * 60 * 24 * 7,
			"mo": 60 * 60 * 24 * 30,
			"month": 60 * 60 * 24 * 30,
			"y": 60 * 60 * 24 * 365,
			"yr": 60 * 60 * 24 * 365,
			"year": 60 * 60 * 24 * 365,
		};
	}
	date(...args) {
		if (args.length === 0) {
			return new Date(this.u("ms").n());
		} else {
			let date = args[0];
			return this.u("ms").n(date.getTime());
		}
	}
	fromDate(date = new Date()) {
		return this.u("ms").n(date.getTime());
	}
	toDate() {
		return new Date(this.u("ms").n());
	}
	now() {
		return this.date(new Date());
	}
	period(date1, date2) {
		if (!date2) {
			date2 = new Date();
		}
		return this.u("ms").n(date2.getTime() - date1.getTime());
	}
	async toSchedule(f, ...rest) {
		let n = this.u("ms").n();
		return new Promise((resolve, reject) => setTimeout(() => {
			try {
				resolve(...(typeof f === "function" ? [f(...rest)] : []));
			} catch(e) {
				reject(e);
			}
		}, n));
	}
}

class Length extends Quantity {
	defUnit() {
		return "m";
	}
	defKMap() {
		let length = this;
		return {
			"nm": 1e-9,
			"um": 1e-6,
			"μm": 1e-6,
			"mm": 1e-3,
			"cm": 1e-2,
			"in": 2.54 * 1e-2,
			"pt": (2.54 * 1e-2) / 72,
			get px() {
				return (2.54 * 1e-2) / length.dpi;
			},
			"dm": 1e-1,
			"ft": 12 * 2.54 * 1e-2,
			"yd": 3 * 12 * 2.54 * 1e-2,
			"m": 1,
			"dam": 1e1,
			"dkm": 1e1,
			"Dm": 1e1,
			"hm": 1e2,
			"km": 1e3,
			"mile": 1609.344,
			"au": 149597871e3,
			"ly": 9.461e15,
			"parsec": 3.08567758e16,
		};
	}
}
cutil.extend(Length.prototype, {
	dpi: 72,
});

let quantity = new (class extends Base {
	time(...args) {
		return new Time(...args);
	}
	length(...args) {
		return new Length(...args);
	}
})();

module.exports = {
	Quantity,
	Time,
	Length,
	quantity,
};
