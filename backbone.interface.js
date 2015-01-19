define(function (require) {

	var canCreate = function (type) {
		return 'object' === typeof type.prototype;
	};

	var isBackboneCollection = function (type) {
		if (!canCreate(type)) return false;

		var instance = new type();
		return instance instanceof Backbone.Collection;
	};

	var typeTesters = [
		{ test: isBackboneCollection, type: 'backboneCollection' }
	];

	var modelInterfaceDecorator = function (Model, options) {
		if (!Model) return;

		options = _.defaults(options || {}, {
			interface: Model.prototype.interface,
			hook: 'set',
			converters: {}
		});

		_.extend(converters, options.converters);

		var _set = Model.prototype.set;

		var included = function (key) {
			return options.interface.hasOwnProperty(key);
		};

		var getType = function (val) {
			var type = undefined;
			_(typeTesters).each(function (typeTest) {
				if(typeTest.test(val)) {
					type = typeTest.type;
				}
			});
			return type;
		};

		var converters = {
			backboneCollection: function (collectionKey, data, opt) {
				data = data.models || data;
				if (!this.has(collectionKey)) {
					_set.call(this, collectionKey, new options.interface[collectionKey](), opt);
				}
				this.get(collectionKey).reset(data, opt);
			}
		};

		var adhereInterface = function (key, value, opt) {
			var interface = options.interface[key];
			var type = getType(interface);
			if (converters.hasOwnProperty(type)) {
				converters[type].apply(this, arguments);
			}
			else if (canCreate(interface)) {
				_set.call(this, key, new interface(value), opt);
			}
			else {
				_set.apply(this, arguments);
			}
		}

		var setter = function (key, value, options) {
			(included(key) ? adhereInterface : _set).apply(this, arguments);
		};

		var setSingle = function () {
			setter.apply(this, arguments);
		};

		var setMultiple = function (object, options) {
			var me = this;
			_(object).each(function (value, key) {
				setSingle.call(me, key, value, options);
			});
		};

		var set = function () {
			var args = Array.prototype.slice.call(arguments);
			if ('object' === typeof args[0]) {
				setMultiple.call(this, args[0], args[1] || {});
			}
			else {
				setSingle.call(this, args[0], args[1], args[2] || {});
			}
			return this;
		}

		Model.prototype[options.hook] = set;

		return Model;
	};

	return modelInterfaceDecorator;
});
