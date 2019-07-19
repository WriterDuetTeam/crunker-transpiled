"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _instanceof(left, right) {
  if (
    right != null &&
    typeof Symbol !== "undefined" &&
    right[Symbol.hasInstance]
  ) {
    return !!right[Symbol.hasInstance](left);
  } else {
    return left instanceof right;
  }
}

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }
  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function() {
    var self = this,
      args = arguments;
    return new Promise(function(resolve, reject) {
      var gen = fn.apply(self, args);
      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }
      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }
      _next(undefined);
    });
  };
}

function _classCallCheck(instance, Constructor) {
  if (!_instanceof(instance, Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var Crunker =
  /*#__PURE__*/
  (function() {
    function Crunker() {
      var _ref =
          arguments.length > 0 && arguments[0] !== undefined
            ? arguments[0]
            : {},
        _ref$sampleRate = _ref.sampleRate,
        sampleRate = _ref$sampleRate === void 0 ? 44100 : _ref$sampleRate;

      _classCallCheck(this, Crunker);

      this._sampleRate = sampleRate;
      this._context = this._createContext();
    }

    _createClass(Crunker, [
      {
        key: "_createContext",
        value: function _createContext() {
          window.AudioContext =
            window.AudioContext ||
            window.webkitAudioContext ||
            window.mozAudioContext;
          return new AudioContext();
        }
      },
      {
        key: "fetchAudio",
        value: (function() {
          var _fetchAudio = _asyncToGenerator(
            /*#__PURE__*/
            regeneratorRuntime.mark(function _callee2() {
              var _this = this;

              var _len,
                filepaths,
                _key,
                files,
                _args2 = arguments;

              return regeneratorRuntime.wrap(function _callee2$(_context2) {
                while (1) {
                  switch ((_context2.prev = _context2.next)) {
                    case 0:
                      for (
                        _len = _args2.length,
                          filepaths = new Array(_len),
                          _key = 0;
                        _key < _len;
                        _key++
                      ) {
                        filepaths[_key] = _args2[_key];
                      }

                      files = filepaths.map(
                        /*#__PURE__*/
                        (function() {
                          var _ref2 = _asyncToGenerator(
                            /*#__PURE__*/
                            regeneratorRuntime.mark(function _callee(filepath) {
                              var buffer;
                              return regeneratorRuntime.wrap(function _callee$(
                                _context
                              ) {
                                while (1) {
                                  switch ((_context.prev = _context.next)) {
                                    case 0:
                                      _context.next = 2;
                                      return fetch(filepath).then(function(
                                        response
                                      ) {
                                        return response.arrayBuffer();
                                      });

                                    case 2:
                                      buffer = _context.sent;
                                      _context.next = 5;
                                      return _this._context.decodeAudioData(
                                        buffer
                                      );

                                    case 5:
                                      return _context.abrupt(
                                        "return",
                                        _context.sent
                                      );

                                    case 6:
                                    case "end":
                                      return _context.stop();
                                  }
                                }
                              },
                              _callee);
                            })
                          );

                          return function(_x) {
                            return _ref2.apply(this, arguments);
                          };
                        })()
                      );
                      _context2.next = 4;
                      return Promise.all(files);

                    case 4:
                      return _context2.abrupt("return", _context2.sent);

                    case 5:
                    case "end":
                      return _context2.stop();
                  }
                }
              }, _callee2);
            })
          );

          function fetchAudio() {
            return _fetchAudio.apply(this, arguments);
          }

          return fetchAudio;
        })()
      },
      {
        key: "mergeAudio",
        value: function mergeAudio(buffers) {
          var output = this._context.createBuffer(
            1,
            this._sampleRate * this._maxDuration(buffers),
            this._sampleRate
          );

          buffers.map(function(buffer) {
            for (var i = buffer.getChannelData(0).length - 1; i >= 0; i--) {
              output.getChannelData(0)[i] += buffer.getChannelData(0)[i];
            }
          });
          return output;
        }
      },
      {
        key: "concatAudio",
        value: function concatAudio(buffers) {
          var output = this._context.createBuffer(
              1,
              this._totalLength(buffers),
              this._sampleRate
            ),
            offset = 0;

          buffers.map(function(buffer) {
            output.getChannelData(0).set(buffer.getChannelData(0), offset);
            offset += buffer.length;
          });
          return output;
        }
      },
      {
        key: "play",
        value: function play(buffer) {
          var source = this._context.createBufferSource();

          source.buffer = buffer;
          source.connect(this._context.destination);
          source.start();
          return source;
        }
      },
      {
        key: "export",
        value: function _export(buffer, audioType) {
          var type = audioType || "audio/mp3";

          var recorded = this._interleave(buffer);

          var dataview = this._writeHeaders(recorded);

          var audioBlob = new Blob([dataview], {
            type: type
          });
          return {
            blob: audioBlob,
            url: this._renderURL(audioBlob),
            element: this._renderAudioElement(audioBlob, type)
          };
        }
      },
      {
        key: "download",
        value: function download(blob, filename) {
          var name = filename || "crunker";
          var a = document.createElement("a");
          a.style = "display: none";
          a.href = this._renderURL(blob);
          a.download = "".concat(name, ".").concat(blob.type.split("/")[1]);
          a.click();
          return a;
        }
      },
      {
        key: "notSupported",
        value: function notSupported(callback) {
          return !this._isSupported() && callback();
        }
      },
      {
        key: "close",
        value: function close() {
          this._context.close();

          return this;
        }
      },
      {
        key: "_maxDuration",
        value: function _maxDuration(buffers) {
          return Math.max.apply(
            Math,
            buffers.map(function(buffer) {
              return buffer.duration;
            })
          );
        }
      },
      {
        key: "_totalLength",
        value: function _totalLength(buffers) {
          return buffers
            .map(function(buffer) {
              return buffer.length;
            })
            .reduce(function(a, b) {
              return a + b;
            }, 0);
        }
      },
      {
        key: "_isSupported",
        value: function _isSupported() {
          return "AudioContext" in window;
        }
      },
      {
        key: "_writeHeaders",
        value: function _writeHeaders(buffer) {
          var arrayBuffer = new ArrayBuffer(44 + buffer.length * 2),
            view = new DataView(arrayBuffer);

          this._writeString(view, 0, "RIFF");

          view.setUint32(4, 32 + buffer.length * 2, true);

          this._writeString(view, 8, "WAVE");

          this._writeString(view, 12, "fmt ");

          view.setUint32(16, 16, true);
          view.setUint16(20, 1, true);
          view.setUint16(22, 2, true);
          view.setUint32(24, this._sampleRate, true);
          view.setUint32(28, this._sampleRate * 4, true);
          view.setUint16(32, 4, true);
          view.setUint16(34, 16, true);

          this._writeString(view, 36, "data");

          view.setUint32(40, buffer.length * 2, true);
          return this._floatTo16BitPCM(view, buffer, 44);
        }
      },
      {
        key: "_floatTo16BitPCM",
        value: function _floatTo16BitPCM(dataview, buffer, offset) {
          for (var i = 0; i < buffer.length; i++, offset += 2) {
            var tmp = Math.max(-1, Math.min(1, buffer[i]));
            dataview.setInt16(
              offset,
              tmp < 0 ? tmp * 0x8000 : tmp * 0x7fff,
              true
            );
          }

          return dataview;
        }
      },
      {
        key: "_writeString",
        value: function _writeString(dataview, offset, header) {
          var output;

          for (var i = 0; i < header.length; i++) {
            dataview.setUint8(offset + i, header.charCodeAt(i));
          }
        }
      },
      {
        key: "_interleave",
        value: function _interleave(input) {
          var buffer = input.getChannelData(0),
            length = buffer.length * 2,
            result = new Float32Array(length),
            index = 0,
            inputIndex = 0;

          while (index < length) {
            result[index++] = buffer[inputIndex];
            result[index++] = buffer[inputIndex];
            inputIndex++;
          }

          return result;
        }
      },
      {
        key: "_renderAudioElement",
        value: function _renderAudioElement(blob, type) {
          var audio = document.createElement("audio");
          audio.controls = "controls";
          audio.type = type;
          audio.src = this._renderURL(blob);
          return audio;
        }
      },
      {
        key: "_renderURL",
        value: function _renderURL(blob) {
          return (window.URL || window.webkitURL).createObjectURL(blob);
        }
      }
    ]);

    return Crunker;
  })();

exports["default"] = Crunker;
