// libmp3lame.js - port of libmp3lame to JavaScript using emscripten
// by Andreas Krennmair <ak@synflood.at>
var Lame = (function() {
    // Note: Some Emscripten settings will significantly limit the speed of the generated code.
    // Note: Some Emscripten settings may limit the speed of the generated code.
    // The Module object: Our interface to the outside world. We import
    // and export values on it, and do the work to get that through
    // closure compiler if necessary. There are various ways Module can be used:
    // 1. Not defined. We create it here
    // 2. A function parameter, function(Module) { ..generated code.. }
    // 3. pre-run appended it, var Module = {}; ..generated code..
    // 4. External script tag defines var Module.
    // We need to do an eval in order to handle the closure compiler
    // case, where this code here is minified but Module was defined
    // elsewhere (e.g. case 4 above). We also need to check if Module
    // already exists (e.g. case 3 above).
    // Note that if you want to run closure, and also to use Module
    // after the generated code, you will need to define   var Module = {};
    // before the code. Then that object will be used in the code, and you
    // can continue to use Module afterwards as well.
    var Module;
    if (!Module) Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');
    // Sometimes an existing Module object exists with properties
    // meant to overwrite the default module functionality. Here
    // we collect those properties and reapply _after_ we configure
    // the current environment's defaults to avoid having to be so
    // defensive during initialization.
    var moduleOverrides = {};
    for (var key in Module) {
      if (Module.hasOwnProperty(key)) {
        moduleOverrides[key] = Module[key];
      }
    }
    // The environment setup code below is customized to use Module.
    // *** Environment setup code ***
    var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
    var ENVIRONMENT_IS_WEB = typeof window === 'object';
    var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
    var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
    if (ENVIRONMENT_IS_NODE) {
      // Expose functionality in the same simple way that the shells work
      // Note that we pollute the global namespace here, otherwise we break in node
      Module['print'] = function(x) {
        process['stdout'].write(x + '\n');
      };
      Module['printErr'] = function(x) {
        process['stderr'].write(x + '\n');
      };
      var nodeFS = require('fs');
      var nodePath = require('path');
      Module['read'] = function(filename, binary) {
        filename = nodePath['normalize'](filename);
        var ret = nodeFS['readFileSync'](filename);
        // The path is absolute if the normalized version is the same as the resolved.
        if (!ret && filename != nodePath['resolve'](filename)) {
          filename = path.join(__dirname, '..', 'src', filename);
          ret = nodeFS['readFileSync'](filename);
        }
        if (ret && !binary) ret = ret.toString();
        return ret;
      };
      Module['readBinary'] = function(filename) { return Module['read'](filename, true) };
      Module['load'] = function(f) {
        globalEval(read(f));
      };
      Module['arguments'] = process['argv'].slice(2);
      module.exports = Module;
    }
    else if (ENVIRONMENT_IS_SHELL) {
      Module['print'] = print;
      if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm
      if (typeof read != 'undefined') {
        Module['read'] = read;
      } else {
        Module['read'] = function() { throw 'no read() available (jsc?)' };
      }
      Module['readBinary'] = function(f) {
        return read(f, 'binary');
      };
      if (typeof scriptArgs != 'undefined') {
        Module['arguments'] = scriptArgs;
      } else if (typeof arguments != 'undefined') {
        Module['arguments'] = arguments;
      }
      this['Module'] = Module;
    }
    else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
      Module['read'] = function(url) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        xhr.send(null);
        return xhr.responseText;
      };
      if (typeof arguments != 'undefined') {
        Module['arguments'] = arguments;
      }
      if (typeof console !== 'undefined') {
        Module['print'] = function(x) {
          console.log(x);
        };
        Module['printErr'] = function(x) {
          console.log(x);
        };
      } else {
        // Probably a worker, and without console.log. We can do very little here...
        var TRY_USE_DUMP = false;
        Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
          dump(x);
        }) : (function(x) {
          // self.postMessage(x); // enable this if you want stdout to be sent as messages
        }));
      }
      if (ENVIRONMENT_IS_WEB) {
        this['Module'] = Module;
      } else {
        Module['load'] = importScripts;
      }
    }
    else {
      // Unreachable because SHELL is dependant on the others
      throw 'Unknown runtime environment. Where are we?';
    }
    function globalEval(x) {
      eval.call(null, x);
    }
    if (!Module['load'] == 'undefined' && Module['read']) {
      Module['load'] = function(f) {
        globalEval(Module['read'](f));
      };
    }
    if (!Module['print']) {
      Module['print'] = function(){};
    }
    if (!Module['printErr']) {
      Module['printErr'] = Module['print'];
    }
    if (!Module['arguments']) {
      Module['arguments'] = [];
    }
    // *** Environment setup code ***
    // Closure helpers
    Module.print = Module['print'];
    Module.printErr = Module['printErr'];
    // Callbacks
    Module['preRun'] = [];
    Module['postRun'] = [];
    // Merge back in the overrides
    for (var key in moduleOverrides) {
      if (moduleOverrides.hasOwnProperty(key)) {
        Module[key] = moduleOverrides[key];
      }
    }
    // === Auto-generated preamble library stuff ===
    //========================================
    // Runtime code shared with compiler
    //========================================
    var Runtime = {
      stackSave: function () {
        return STACKTOP;
      },
      stackRestore: function (stackTop) {
        STACKTOP = stackTop;
      },
      forceAlign: function (target, quantum) {
        quantum = quantum || 4;
        if (quantum == 1) return target;
        if (isNumber(target) && isNumber(quantum)) {
          return Math.ceil(target/quantum)*quantum;
        } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
          var logg = log2(quantum);
          return '((((' +target + ')+' + (quantum-1) + ')>>' + logg + ')<<' + logg + ')';
        }
        return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
      },
      isNumberType: function (type) {
        return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
      },
      isPointerType: function isPointerType(type) {
      return type[type.length-1] == '*';
    },
      isStructType: function isStructType(type) {
      if (isPointerType(type)) return false;
      if (isArrayType(type)) return true;
      if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
      // See comment in isStructPointerType()
      return type[0] == '%';
    },
      INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
      FLOAT_TYPES: {"float":0,"double":0},
      or64: function (x, y) {
        var l = (x | 0) | (y | 0);
        var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
        return l + h;
      },
      and64: function (x, y) {
        var l = (x | 0) & (y | 0);
        var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
        return l + h;
      },
      xor64: function (x, y) {
        var l = (x | 0) ^ (y | 0);
        var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
        return l + h;
      },
      getNativeTypeSize: function (type) {
        switch (type) {
          case 'i1': case 'i8': return 1;
          case 'i16': return 2;
          case 'i32': return 4;
          case 'i64': return 8;
          case 'float': return 4;
          case 'double': return 8;
          default: {
            if (type[type.length-1] === '*') {
              return Runtime.QUANTUM_SIZE; // A pointer
            } else if (type[0] === 'i') {
              var bits = parseInt(type.substr(1));
              assert(bits % 8 === 0);
              return bits/8;
            }
          }
        }
      },
      getNativeFieldSize: function (type) {
        return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
      },
      dedup: function dedup(items, ident) {
      var seen = {};
      if (ident) {
        return items.filter(function(item) {
          if (seen[item[ident]]) return false;
          seen[item[ident]] = true;
          return true;
        });
      } else {
        return items.filter(function(item) {
          if (seen[item]) return false;
          seen[item] = true;
          return true;
        });
      }
    },
      set: function set() {
      var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
      var ret = {};
      for (var i = 0; i < args.length; i++) {
        ret[args[i]] = 0;
      }
      return ret;
    },
      STACK_ALIGN: 8,
      getAlignSize: function (type, size, vararg) {
        // we align i64s and doubles on 64-bit boundaries, unlike x86
        if (type == 'i64' || type == 'double' || vararg) return 8;
        if (!type) return Math.min(size, 8); // align structures internally to 64 bits
        return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
      },
      calculateStructAlignment: function calculateStructAlignment(type) {
        type.flatSize = 0;
        type.alignSize = 0;
        var diffs = [];
        var prev = -1;
        var index = 0;
        type.flatIndexes = type.fields.map(function(field) {
          index++;
          var size, alignSize;
          if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
            size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
            alignSize = Runtime.getAlignSize(field, size);
          } else if (Runtime.isStructType(field)) {
            if (field[1] === '0') {
              // this is [0 x something]. When inside another structure like here, it must be at the end,
              // and it adds no size
              // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
              size = 0;
              if (Types.types[field]) {
                alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
              } else {
                alignSize = type.alignSize || QUANTUM_SIZE;
              }
            } else {
              size = Types.types[field].flatSize;
              alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
            }
          } else if (field[0] == 'b') {
            // bN, large number field, like a [N x i8]
            size = field.substr(1)|0;
            alignSize = 1;
          } else {
            throw 'Unclear type in struct: ' + field + ', in ' + type.name_ + ' :: ' + dump(Types.types[type.name_]);
          }
          if (type.packed) alignSize = 1;
          type.alignSize = Math.max(type.alignSize, alignSize);
          var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
          type.flatSize = curr + size;
          if (prev >= 0) {
            diffs.push(curr-prev);
          }
          prev = curr;
          return curr;
        });
        type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
        if (diffs.length == 0) {
          type.flatFactor = type.flatSize;
        } else if (Runtime.dedup(diffs).length == 1) {
          type.flatFactor = diffs[0];
        }
        type.needsFlattening = (type.flatFactor != 1);
        return type.flatIndexes;
      },
      generateStructInfo: function (struct, typeName, offset) {
        var type, alignment;
        if (typeName) {
          offset = offset || 0;
          type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
          if (!type) return null;
          if (type.fields.length != struct.length) {
            printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
            return null;
          }
          alignment = type.flatIndexes;
        } else {
          var type = { fields: struct.map(function(item) { return item[0] }) };
          alignment = Runtime.calculateStructAlignment(type);
        }
        var ret = {
          __size__: type.flatSize
        };
        if (typeName) {
          struct.forEach(function(item, i) {
            if (typeof item === 'string') {
              ret[item] = alignment[i] + offset;
            } else {
              // embedded struct
              var key;
              for (var k in item) key = k;
              ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
            }
          });
        } else {
          struct.forEach(function(item, i) {
            ret[item[1]] = alignment[i];
          });
        }
        return ret;
      },
      dynCall: function (sig, ptr, args) {
        if (args && args.length) {
          return FUNCTION_TABLE[ptr].apply(null, args);
        } else {
          return FUNCTION_TABLE[ptr]();
        }
      },
      addFunction: function (func) {
        var table = FUNCTION_TABLE;
        var ret = table.length;
        table.push(func);
        table.push(0);
        return ret;
      },
      removeFunction: function (index) {
        var table = FUNCTION_TABLE;
        table[index] = null;
      },
      warnOnce: function (text) {
        if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
        if (!Runtime.warnOnce.shown[text]) {
          Runtime.warnOnce.shown[text] = 1;
          Module.printErr(text);
        }
      },
      funcWrappers: {},
      getFuncWrapper: function (func, sig) {
        assert(sig);
        if (!Runtime.funcWrappers[func]) {
          Runtime.funcWrappers[func] = function() {
            return Runtime.dynCall(sig, func, arguments);
          };
        }
        return Runtime.funcWrappers[func];
      },
      UTF8Processor: function () {
        var buffer = [];
        var needed = 0;
        this.processCChar = function (code) {
          code = code & 0xFF;
          if (buffer.length == 0) {
            if ((code & 0x80) == 0x00) {        // 0xxxxxxx
              return String.fromCharCode(code);
            }
            buffer.push(code);
            if ((code & 0xE0) == 0xC0) {        // 110xxxxx
              needed = 1;
            } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
              needed = 2;
            } else {                            // 11110xxx
              needed = 3;
            }
            return '';
          }
          if (needed) {
            buffer.push(code);
            needed--;
            if (needed > 0) return '';
          }
          var c1 = buffer[0];
          var c2 = buffer[1];
          var c3 = buffer[2];
          var c4 = buffer[3];
          var ret;
          if (buffer.length == 2) {
            ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
          } else if (buffer.length == 3) {
            ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
          } else {
            // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
            var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                            ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
            ret = String.fromCharCode(
              Math.floor((codePoint - 0x10000) / 0x400) + 0xD800,
              (codePoint - 0x10000) % 0x400 + 0xDC00);
          }
          buffer.length = 0;
          return ret;
        }
        this.processJSString = function(string) {
          string = unescape(encodeURIComponent(string));
          var ret = [];
          for (var i = 0; i < string.length; i++) {
            ret.push(string.charCodeAt(i));
          }
          return ret;
        }
      },
      stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = ((((STACKTOP)+7)>>3)<<3); return ret; },
      staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = ((((STATICTOP)+7)>>3)<<3); return ret; },
      dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = ((((DYNAMICTOP)+7)>>3)<<3); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
      alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
      makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((low>>>0)+((high>>>0)*4294967296)) : ((low>>>0)+((high|0)*4294967296))); return ret; },
      GLOBAL_BASE: 8,
      QUANTUM_SIZE: 4,
      __dummy__: 0
    }
    //========================================
    // Runtime essentials
    //========================================
    var __THREW__ = 0; // Used in checking for thrown exceptions.
    var setjmpId = 1; // Used in setjmp/longjmp
    var setjmpLabels = {};
    var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
    var EXITSTATUS = 0;
    var undef = 0;
    // tempInt is used for 32-bit signed values or smaller. tempBigInt is used
    // for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
    var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD;
    var tempI64, tempI64b;
    var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;
    function assert(condition, text) {
      if (!condition) {
        abort('Assertion failed: ' + text);
      }
    }
    var globalScope = this;
    // C calling interface. A convenient way to call C functions (in C files, or
    // defined with extern "C").
    //
    // Note: LLVM optimizations can inline and remove functions, after which you will not be
    //       able to call them. Closure can also do so. To avoid that, add your function to
    //       the exports using something like
    //
    //         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
    //
    // @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
    // @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
    //                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
    // @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
    //                   except that 'array' is not possible (there is no way for us to know the length of the array)
    // @param args       An array of the arguments to the function, as native JS values (as in returnType)
    //                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
    // @return           The return value, as a native JS value (as in returnType)
    function ccall(ident, returnType, argTypes, args) {
      return ccallFunc(getCFunc(ident), returnType, argTypes, args);
    }
    Module["ccall"] = ccall;
    // Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
    function getCFunc(ident) {
      try {
        var func = Module['_' + ident]; // closure exported function
        if (!func) func = eval('_' + ident); // explicit lookup
      } catch(e) {
      }
      assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
      return func;
    }
    // Internal function that does a C call using a function, not an identifier
    function ccallFunc(func, returnType, argTypes, args) {
      var stack = 0;
      function toC(value, type) {
        if (type == 'string') {
          if (value === null || value === undefined || value === 0) return 0; // null string
          value = intArrayFromString(value);
          type = 'array';
        }
        if (type == 'array') {
          if (!stack) stack = Runtime.stackSave();
          var ret = Runtime.stackAlloc(value.length);
          writeArrayToMemory(value, ret);
          return ret;
        }
        return value;
      }
      function fromC(value, type) {
        if (type == 'string') {
          return Pointer_stringify(value);
        }
        assert(type != 'array');
        return value;
      }
      var i = 0;
      var cArgs = args ? args.map(function(arg) {
        return toC(arg, argTypes[i++]);
      }) : [];
      var ret = fromC(func.apply(null, cArgs), returnType);
      if (stack) Runtime.stackRestore(stack);
      return ret;
    }
    // Returns a native JS wrapper for a C function. This is similar to ccall, but
    // returns a function you can call repeatedly in a normal way. For example:
    //
    //   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
    //   alert(my_function(5, 22));
    //   alert(my_function(99, 12));
    //
    function cwrap(ident, returnType, argTypes) {
      var func = getCFunc(ident);
      return function() {
        return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
      }
    }
    Module["cwrap"] = cwrap;
    // Sets a value in memory in a dynamic way at run-time. Uses the
    // type data. This is the same as makeSetValue, except that
    // makeSetValue is done at compile-time and generates the needed
    // code then, whereas this function picks the right code at
    // run-time.
    // Note that setValue and getValue only do *aligned* writes and reads!
    // Note that ccall uses JS types as for defining types, while setValue and
    // getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
    function setValue(ptr, value, type, noSafe) {
      type = type || 'i8';
      if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
        switch(type) {
          case 'i1': HEAP8[(ptr)]=value; break;
          case 'i8': HEAP8[(ptr)]=value; break;
          case 'i16': HEAP16[((ptr)>>1)]=value; break;
          case 'i32': HEAP32[((ptr)>>2)]=value; break;
          case 'i64': (tempI64 = [value>>>0,(tempDouble=value,Math.abs(tempDouble) >= 1 ? (tempDouble > 0 ? Math.min(Math.floor((tempDouble)/4294967296), 4294967295)>>>0 : (~~(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296)))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
          case 'float': HEAPF32[((ptr)>>2)]=value; break;
          case 'double': HEAPF64[((ptr)>>3)]=value; break;
          default: abort('invalid type for setValue: ' + type);
        }
    }
    Module['setValue'] = setValue;
    // Parallel to setValue.
    function getValue(ptr, type, noSafe) {
      type = type || 'i8';
      if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
        switch(type) {
          case 'i1': return HEAP8[(ptr)];
          case 'i8': return HEAP8[(ptr)];
          case 'i16': return HEAP16[((ptr)>>1)];
          case 'i32': return HEAP32[((ptr)>>2)];
          case 'i64': return HEAP32[((ptr)>>2)];
          case 'float': return HEAPF32[((ptr)>>2)];
          case 'double': return HEAPF64[((ptr)>>3)];
          default: abort('invalid type for setValue: ' + type);
        }
      return null;
    }
    Module['getValue'] = getValue;
    var ALLOC_NORMAL = 0; // Tries to use _malloc()
    var ALLOC_STACK = 1; // Lives for the duration of the current function call
    var ALLOC_STATIC = 2; // Cannot be freed
    var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
    var ALLOC_NONE = 4; // Do not allocate
    Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
    Module['ALLOC_STACK'] = ALLOC_STACK;
    Module['ALLOC_STATIC'] = ALLOC_STATIC;
    Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
    Module['ALLOC_NONE'] = ALLOC_NONE;
    // allocate(): This is for internal use. You can use it yourself as well, but the interface
    //             is a little tricky (see docs right below). The reason is that it is optimized
    //             for multiple syntaxes to save space in generated code. So you should
    //             normally not use allocate(), and instead allocate memory using _malloc(),
    //             initialize it with setValue(), and so forth.
    // @slab: An array of data, or a number. If a number, then the size of the block to allocate,
    //        in *bytes* (note that this is sometimes confusing: the next parameter does not
    //        affect this!)
    // @types: Either an array of types, one for each byte (or 0 if no type at that position),
    //         or a single type which is used for the entire block. This only matters if there
    //         is initial data - if @slab is a number, then this does not matter at all and is
    //         ignored.
    // @allocator: How to allocate memory, see ALLOC_*
    function allocate(slab, types, allocator, ptr) {
      var zeroinit, size;
      if (typeof slab === 'number') {
        zeroinit = true;
        size = slab;
      } else {
        zeroinit = false;
        size = slab.length;
      }
      var singleType = typeof types === 'string' ? types : null;
      var ret;
      if (allocator == ALLOC_NONE) {
        ret = ptr;
      } else {
        ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
      }
      if (zeroinit) {
        var ptr = ret, stop;
        assert((ret & 3) == 0);
        stop = ret + (size & ~3);
        for (; ptr < stop; ptr += 4) {
          HEAP32[((ptr)>>2)]=0;
        }
        stop = ret + size;
        while (ptr < stop) {
          HEAP8[((ptr++)|0)]=0;
        }
        return ret;
      }
      if (singleType === 'i8') {
        if (slab.subarray || slab.slice) {
          HEAPU8.set(slab, ret);
        } else {
          HEAPU8.set(new Uint8Array(slab), ret);
        }
        return ret;
      }
      var i = 0, type, typeSize, previousType;
      while (i < size) {
        var curr = slab[i];
        if (typeof curr === 'function') {
          curr = Runtime.getFunctionIndex(curr);
        }
        type = singleType || types[i];
        if (type === 0) {
          i++;
          continue;
        }
        if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later
        setValue(ret+i, curr, type);
        // no need to look up size unless type changes, so cache it
        if (previousType !== type) {
          typeSize = Runtime.getNativeTypeSize(type);
          previousType = type;
        }
        i += typeSize;
      }
      return ret;
    }
    Module['allocate'] = allocate;
    function Pointer_stringify(ptr, /* optional */ length) {
      // TODO: use TextDecoder
      // Find the length, and check for UTF while doing so
      var hasUtf = false;
      var t;
      var i = 0;
      while (1) {
        t = HEAPU8[(((ptr)+(i))|0)];
        if (t >= 128) hasUtf = true;
        else if (t == 0 && !length) break;
        i++;
        if (length && i == length) break;
      }
      if (!length) length = i;
      var ret = '';
      if (!hasUtf) {
        var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
        var curr;
        while (length > 0) {
          curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
          ret = ret ? ret + curr : curr;
          ptr += MAX_CHUNK;
          length -= MAX_CHUNK;
        }
        return ret;
      }
      var utf8 = new Runtime.UTF8Processor();
      for (i = 0; i < length; i++) {
        t = HEAPU8[(((ptr)+(i))|0)];
        ret += utf8.processCChar(t);
      }
      return ret;
    }
    Module['Pointer_stringify'] = Pointer_stringify;
    // Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
    // a copy of that string as a Javascript String object.
    function UTF16ToString(ptr) {
      var i = 0;
      var str = '';
      while (1) {
        var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
        if (codeUnit == 0)
          return str;
        ++i;
        // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
        str += String.fromCharCode(codeUnit);
      }
    }
    Module['UTF16ToString'] = UTF16ToString;
    // Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr', 
    // null-terminated and encoded in UTF16LE form. The copy will require at most (str.length*2+1)*2 bytes of space in the HEAP.
    function stringToUTF16(str, outPtr) {
      for(var i = 0; i < str.length; ++i) {
        // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
        var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
        HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit
      }
      // Null-terminate the pointer to the HEAP.
      HEAP16[(((outPtr)+(str.length*2))>>1)]=0
    }
    Module['stringToUTF16'] = stringToUTF16;
    // Given a pointer 'ptr' to a null-terminated UTF32LE-encoded string in the emscripten HEAP, returns
    // a copy of that string as a Javascript String object.
    function UTF32ToString(ptr) {
      var i = 0;
      var str = '';
      while (1) {
        var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
        if (utf32 == 0)
          return str;
        ++i;
        // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
        if (utf32 >= 0x10000) {
          var ch = utf32 - 0x10000;
          str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
        } else {
          str += String.fromCharCode(utf32);
        }
      }
    }
    Module['UTF32ToString'] = UTF32ToString;
    // Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr', 
    // null-terminated and encoded in UTF32LE form. The copy will require at most (str.length+1)*4 bytes of space in the HEAP,
    // but can use less, since str.length does not return the number of characters in the string, but the number of UTF-16 code units in the string.
    function stringToUTF32(str, outPtr) {
      var iChar = 0;
      for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
        // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
        var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
        if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
          var trailSurrogate = str.charCodeAt(++iCodeUnit);
          codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
        }
        HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit
        ++iChar;
      }
      // Null-terminate the pointer to the HEAP.
      HEAP32[(((outPtr)+(iChar*4))>>2)]=0
    }
    Module['stringToUTF32'] = stringToUTF32;
    // Memory management
    var PAGE_SIZE = 4096;
    function alignMemoryPage(x) {
      return ((x+4095)>>12)<<12;
    }
    var HEAP;
    var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
    var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
    var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
    var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk
    function enlargeMemory() {
      abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
    }
    var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
    var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
    var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;
    // Initialize the runtime's memory
    // check for full engine support (use string 'subarray' to avoid closure compiler confusion)
    assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
           'Cannot fallback to non-typed array case: Code is too specialized');
    var buffer = new ArrayBuffer(TOTAL_MEMORY);
    HEAP8 = new Int8Array(buffer);
    HEAP16 = new Int16Array(buffer);
    HEAP32 = new Int32Array(buffer);
    HEAPU8 = new Uint8Array(buffer);
    HEAPU16 = new Uint16Array(buffer);
    HEAPU32 = new Uint32Array(buffer);
    HEAPF32 = new Float32Array(buffer);
    HEAPF64 = new Float64Array(buffer);
    // Endianness check (note: assumes compiler arch was little-endian)
    HEAP32[0] = 255;
    assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');
    Module['HEAP'] = HEAP;
    Module['HEAP8'] = HEAP8;
    Module['HEAP16'] = HEAP16;
    Module['HEAP32'] = HEAP32;
    Module['HEAPU8'] = HEAPU8;
    Module['HEAPU16'] = HEAPU16;
    Module['HEAPU32'] = HEAPU32;
    Module['HEAPF32'] = HEAPF32;
    Module['HEAPF64'] = HEAPF64;
    function callRuntimeCallbacks(callbacks) {
      while(callbacks.length > 0) {
        var callback = callbacks.shift();
        if (typeof callback == 'function') {
          callback();
          continue;
        }
        var func = callback.func;
        if (typeof func === 'number') {
          if (callback.arg === undefined) {
            Runtime.dynCall('v', func);
          } else {
            Runtime.dynCall('vi', func, [callback.arg]);
          }
        } else {
          func(callback.arg === undefined ? null : callback.arg);
        }
      }
    }
    var __ATPRERUN__  = []; // functions called before the runtime is initialized
    var __ATINIT__    = []; // functions called during startup
    var __ATMAIN__    = []; // functions called when main() is to be run
    var __ATEXIT__    = []; // functions called during shutdown
    var __ATPOSTRUN__ = []; // functions called after the runtime has exited
    var runtimeInitialized = false;
    function preRun() {
      // compatibility - merge in anything from Module['preRun'] at this time
      if (Module['preRun']) {
        if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
        while (Module['preRun'].length) {
          addOnPreRun(Module['preRun'].shift());
        }
      }
      callRuntimeCallbacks(__ATPRERUN__);
    }
    function ensureInitRuntime() {
      if (runtimeInitialized) return;
      runtimeInitialized = true;
      callRuntimeCallbacks(__ATINIT__);
    }
    function preMain() {
      callRuntimeCallbacks(__ATMAIN__);
    }
    function exitRuntime() {
      callRuntimeCallbacks(__ATEXIT__);
    }
    function postRun() {
      // compatibility - merge in anything from Module['postRun'] at this time
      if (Module['postRun']) {
        if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
        while (Module['postRun'].length) {
          addOnPostRun(Module['postRun'].shift());
        }
      }
      callRuntimeCallbacks(__ATPOSTRUN__);
    }
    function addOnPreRun(cb) {
      __ATPRERUN__.unshift(cb);
    }
    Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;
    function addOnInit(cb) {
      __ATINIT__.unshift(cb);
    }
    Module['addOnInit'] = Module.addOnInit = addOnInit;
    function addOnPreMain(cb) {
      __ATMAIN__.unshift(cb);
    }
    Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;
    function addOnExit(cb) {
      __ATEXIT__.unshift(cb);
    }
    Module['addOnExit'] = Module.addOnExit = addOnExit;
    function addOnPostRun(cb) {
      __ATPOSTRUN__.unshift(cb);
    }
    Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;
    // Tools
    // This processes a JS string into a C-line array of numbers, 0-terminated.
    // For LLVM-originating strings, see parser.js:parseLLVMString function
    function intArrayFromString(stringy, dontAddNull, length /* optional */) {
      var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
      if (length) {
        ret.length = length;
      }
      if (!dontAddNull) {
        ret.push(0);
      }
      return ret;
    }
    Module['intArrayFromString'] = intArrayFromString;
    function intArrayToString(array) {
      var ret = [];
      for (var i = 0; i < array.length; i++) {
        var chr = array[i];
        if (chr > 0xFF) {
          chr &= 0xFF;
        }
        ret.push(String.fromCharCode(chr));
      }
      return ret.join('');
    }
    Module['intArrayToString'] = intArrayToString;
    // Write a Javascript array to somewhere in the heap
    function writeStringToMemory(string, buffer, dontAddNull) {
      var array = intArrayFromString(string, dontAddNull);
      var i = 0;
      while (i < array.length) {
        var chr = array[i];
        HEAP8[(((buffer)+(i))|0)]=chr
        i = i + 1;
      }
    }
    Module['writeStringToMemory'] = writeStringToMemory;
    function writeArrayToMemory(array, buffer) {
      for (var i = 0; i < array.length; i++) {
        HEAP8[(((buffer)+(i))|0)]=array[i];
      }
    }
    Module['writeArrayToMemory'] = writeArrayToMemory;
    function writeAsciiToMemory(str, buffer, dontAddNull) {
      for (var i = 0; i < str.length; i++) {
        HEAP8[(((buffer)+(i))|0)]=str.charCodeAt(i)
      }
      if (!dontAddNull) HEAP8[(((buffer)+(str.length))|0)]=0
    }
    Module['writeAsciiToMemory'] = writeAsciiToMemory;
    function unSign(value, bits, ignore, sig) {
      if (value >= 0) {
        return value;
      }
      return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                        : Math.pow(2, bits)         + value;
    }
    function reSign(value, bits, ignore, sig) {
      if (value <= 0) {
        return value;
      }
      var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                            : Math.pow(2, bits-1);
      if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                           // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                           // TODO: In i64 mode 1, resign the two parts separately and safely
        value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
      }
      return value;
    }
    if (!Math['imul']) Math['imul'] = function(a, b) {
      var ah  = a >>> 16;
      var al = a & 0xffff;
      var bh  = b >>> 16;
      var bl = b & 0xffff;
      return (al*bl + ((ah*bl + al*bh) << 16))|0;
    };
    Math.imul = Math['imul'];
    // A counter of dependencies for calling run(). If we need to
    // do asynchronous work before running, increment this and
    // decrement it. Incrementing must happen in a place like
    // PRE_RUN_ADDITIONS (used by emcc to add file preloading).
    // Note that you can add dependencies in preRun, even though
    // it happens right before run - run will be postponed until
    // the dependencies are met.
    var runDependencies = 0;
    var runDependencyTracking = {};
    var runDependencyWatcher = null;
    var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
    function addRunDependency(id) {
      runDependencies++;
      if (Module['monitorRunDependencies']) {
        Module['monitorRunDependencies'](runDependencies);
      }
      if (id) {
        assert(!runDependencyTracking[id]);
        runDependencyTracking[id] = 1;
      } else {
        Module.printErr('warning: run dependency added without ID');
      }
    }
    Module['addRunDependency'] = addRunDependency;
    function removeRunDependency(id) {
      runDependencies--;
      if (Module['monitorRunDependencies']) {
        Module['monitorRunDependencies'](runDependencies);
      }
      if (id) {
        assert(runDependencyTracking[id]);
        delete runDependencyTracking[id];
      } else {
        Module.printErr('warning: run dependency removed without ID');
      }
      if (runDependencies == 0) {
        if (runDependencyWatcher !== null) {
          clearInterval(runDependencyWatcher);
          runDependencyWatcher = null;
        }
        if (dependenciesFulfilled) {
          var callback = dependenciesFulfilled;
          dependenciesFulfilled = null;
          callback(); // can add another dependenciesFulfilled
        }
      }
    }
    Module['removeRunDependency'] = removeRunDependency;
    Module["preloadedImages"] = {}; // maps url to image data
    Module["preloadedAudios"] = {}; // maps url to audio data
    var memoryInitializer = null;
    // === Body ===
    STATIC_BASE = 8;
    STATICTOP = STATIC_BASE + 147208;
    /* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } });
    var _tabsel_123;
    var _stderr;
    var _stderr = _stderr=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
    var _freqs;
    var ___progname;
    var __ZTVN10__cxxabiv120__si_class_type_infoE;
    var __ZTVN10__cxxabiv117__class_type_infoE;
    var __ZNSt9bad_allocC1Ev;
    var __ZNSt9bad_allocD1Ev;
    var __ZNSt20bad_array_new_lengthC1Ev;
    var __ZNSt20bad_array_new_lengthD1Ev;
    var __ZNSt20bad_array_new_lengthD2Ev;
    var _err;
    var _errx;
    var _warn;
    var _warnx;
    var _verr;
    var _verrx;
    var _vwarn;
    var _vwarnx;
    /* memory initializer */ allocate([0,27,134,42,204,204,52,43,33,78,132,43,252,247,157,43,88,156,166,43,252,247,157,43,33,78,132,43,204,204,52,43,0,27,134,42,83,248,191,44,254,169,171,44,146,50,149,44,159,129,122,44,239,29,73,44,62,186,23,44,116,173,207,43,133,159,107,43,183,89,146,42,83,248,191,172,254,169,171,172,146,50,149,172,159,129,122,172,239,29,73,172,62,186,23,172,116,173,207,171,133,159,107,171,183,89,146,170,0,27,134,170,204,204,52,171,33,78,132,171,252,247,157,171,88,156,166,171,252,247,157,171,33,78,132,171,204,204,52,171,0,27,134,170,0,27,134,42,204,204,52,43,33,78,132,43,252,247,157,43,88,156,166,43,252,247,157,43,33,78,132,43,204,204,52,43,0,27,134,42,83,248,191,44,254,169,171,44,146,50,149,44,159,129,122,44,239,29,73,44,62,186,23,44,116,173,207,43,133,159,107,43,183,89,146,42,37,39,192,172,51,37,173,172,234,209,152,172,227,84,131,172,249,175,89,172,11,14,43,172,102,34,244,171,201,49,137,171,74,123,157,170,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,144,128,170,174,79,227,170,5,174,113,170,234,207,6,62,205,19,212,62,139,111,68,63,255,175,139,63,23,208,166,63,117,235,200,63,190,226,245,63,122,130,26,64,105,251,74,64,185,87,144,64,107,16,243,64,233,58,183,65,92,28,124,63,187,141,36,63,68,29,175,62,178,143,112,63,212,208,49,190,125,27,68,191,215,179,93,63,0,0,0,63,254,181,3,191,218,134,241,190,2,115,160,190,116,71,58,190,29,176,193,189,135,203,39,189,29,161,104,188,70,123,114,187,168,132,91,63,216,185,97,63,221,26,115,63,129,186,123,63,65,218,126,63,253,200,127,63,101,249,127,63,141,255,127,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,144,128,42,174,79,227,42,5,174,113,42,37,39,192,44,51,37,173,44,234,209,152,44,227,84,131,44,249,175,89,44,11,14,43,44,102,34,244,43,201,49,137,43,74,123,157,42,83,248,191,172,254,169,171,172,146,50,149,172,159,129,122,172,239,29,73,172,62,186,23,172,116,173,207,171,133,159,107,171,183,89,146,170,0,27,134,170,204,204,52,171,33,78,132,171,252,247,157,171,88,156,166,171,252,247,157,171,33,78,132,171,204,204,52,171,0,27,134,170,137,158,227,63,229,83,236,63,167,94,245,63,155,20,249,63,14,217,252,63,123,143,234,63,218,151,217,63,226,132,191,63,124,145,168,63,0,0,128,63,0,0,0,0,9,0,0,0,9,0,0,0,0,0,0,0,102,102,166,64,0,0,250,66,102,102,134,192,154,153,201,192,154,153,153,64,0,0,128,63,0,0,0,0,0,0,0,0,2,0,0,0,21,0,0,0,236,81,120,63,0,0,160,64,0,0,200,66,1,0,0,0,9,0,0,0,9,0,0,0,0,0,0,0,154,153,169,64,0,0,250,66,102,102,102,192,51,51,179,192,0,0,144,64,0,0,192,63,0,0,0,0,0,0,0,0,2,0,0,0,21,0,0,0,205,204,172,63,0,0,160,64,0,0,200,66,2,0,0,0,9,0,0,0,9,0,0,0,0,0,0,0,51,51,179,64,0,0,250,66,205,204,12,192,0,0,96,192,51,51,51,64,0,0,0,64,0,0,0,0,0,0,0,0,2,0,0,0,21,0,0,0,82,184,190,63,0,0,160,64,0,0,200,66,3,0,0,0,9,0,0,0,9,0,0,0,1,0,0,0,154,153,185,64,0,0,2,67,102,102,230,191,51,51,51,192,102,102,38,64,0,0,64,64,0,0,128,192,0,0,0,0,2,0,0,0,20,0,0,0,133,235,209,63,0,0,160,64,0,0,200,66,4,0,0,0,9,0,0,0,9,0,0,0,1,0,0,0,0,0,192,64,0,0,7,67,51,51,51,191,205,204,140,191,205,204,140,63,0,0,96,64,0,0,0,193,0,0,0,0,2,0,0,0,0,0,0,0,184,30,229,63,0,0,160,64,0,0,200,66,5,0,0,0,9,0,0,0,9,0,0,0,1,0,0,0,205,204,204,64,0,0,12,67,0,0,0,63,205,204,204,62,0,0,240,192,0,0,128,64,0,0,64,193,23,183,81,57,0,0,0,0,0,0,0,0,154,153,249,63,0,0,160,64,0,0,200,66,6,0,0,0,9,0,0,0,9,0,0,0,1,0,0,0,51,51,211,64,0,0,17,67,31,133,43,63,102,102,38,63,51,51,107,193,0,0,208,64,0,0,152,193,23,183,209,57,0,0,0,0,0,0,0,0,51,51,19,64,0,0,160,64,0,0,200,66,7,0,0,0,9,0,0,0,9,0,0,0,1,0,0,0,51,51,211,64,0,0,17,67,205,204,76,63,0,0,64,63,154,153,157,193,0,0,0,65,0,0,176,193,82,73,29,58,0,0,0,0,0,0,0,0,205,204,44,64,0,0,160,64,0,0,200,66,8,0,0,0,9,0,0,0,9,0,0,0,1,0,0,0,51,51,211,64,0,0,17,67,154,153,153,63,51,51,147,63,0,0,220,193,0,0,32,65,0,0,184,193,52,128,55,58,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,64,0,0,200,66,9,0,0,0,9,0,0,0,9,0,0,0,1,0,0,0,51,51,211,64,0,0,17,67,205,204,204,63,205,204,204,63,0,0,16,194,0,0,48,65,0,0,200,193,23,183,81,58,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,64,0,0,200,66,10,0,0,0,9,0,0,0,9,0,0,0,1,0,0,0,51,51,211,64,0,0,17,67,0,0,0,64,0,0,0,64,0,0,16,194,0,0,64,65,0,0,200,193,23,183,81,58,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,64,0,0,200,66,0,0,0,0,0,0,0,0,9,0,0,0,9,0,0,0,0,0,0,0,102,102,134,64,0,0,200,65,154,153,217,192,154,153,217,192,51,51,227,64,0,0,128,63,0,0,0,0,0,0,0,0,2,0,0,0,31,0,0,0,0,0,128,63,0,0,160,64,0,0,200,66,1,0,0,0,9,0,0,0,9,0,0,0,0,0,0,0,102,102,134,64,0,0,200,65,154,153,153,192,154,153,153,192,205,204,172,64,51,51,179,63,0,0,128,191,0,0,0,0,2,0,0,0,27,0,0,0,178,157,143,63,0,0,160,64,0,0,196,66,2,0,0,0,9,0,0,0,9,0,0,0,0,0,0,0,102,102,134,64,0,0,200,65,102,102,38,192,102,102,38,192,205,204,108,64,0,0,0,64,0,0,64,192,0,0,0,0,2,0,0,0,23,0,0,0,47,221,164,63,0,0,160,64,0,0,194,66,3,0,0,0,9,0,0,0,9,0,0,0,1,0,0,0,102,102,134,64,0,0,200,65,205,204,204,191,205,204,204,191,0,0,0,64,0,0,0,64,0,0,160,192,0,0,0,0,2,0,0,0,18,0,0,0,223,79,189,63,0,0,160,64,0,0,192,66,4,0,0,0,9,0,0,0,9,0,0,0,1,0,0,0,102,102,134,64,0,0,200,65,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,0,0,0,193,0,0,0,0,2,0,0,0,12,0,0,0,16,88,217,63,0,0,160,64,0,0,190,66,5,0,0,0,9,0,0,0,9,0,0,0,1,0,0,0,102,102,134,64,0,0,200,65,102,102,166,63,102,102,166,63,0,0,192,192,0,0,96,64,0,0,48,193,0,0,0,0,2,0,0,0,8,0,0,0,154,153,249,63,0,0,160,64,102,102,188,66,6,0,0,0,9,0,0,0,9,0,0,0,1,0,0,0,0,0,144,64,0,0,200,66,205,204,12,64,51,51,19,64,0,0,64,193,0,0,192,64,0,0,96,193,0,0,0,0,2,0,0,0,4,0,0,0,199,75,15,64,0,0,64,64,205,204,187,66,7,0,0,0,9,0,0,0,9,0,0,0,1,0,0,0,154,153,153,64,0,0,72,67,205,204,44,64,205,204,44,64,0,0,144,193,0,0,16,65,0,0,136,193,0,0,0,0,2,0,0,0,0,0,0,0,225,122,36,64,0,0,128,63,51,51,187,66,8,0,0,0,9,0,0,0,9,0,0,0,1,0,0,0,154,153,169,64,0,0,150,67,51,51,51,64,51,51,51,64,0,0,168,193,0,0,32,65,0,0,184,193,23,183,81,57,0,0,0,0,0,0,0,0,47,221,60,64,0,0,0,0,154,153,186,66,9,0,0,0,9,0,0,0,9,0,0,0,1,0,0,0,51,51,211,64,0,0,150,67,51,51,51,64,51,51,51,64,0,0,184,193,0,0,48,65,0,0,200,193,82,73,29,58,0,0,0,0,0,0,0,0,254,212,88,64,0,0,0,0,154,153,186,66,10,0,0,0,9,0,0,0,9,0,0,0,1,0,0,0,0,0,200,65,0,0,150,67,51,51,51,64,51,51,51,64,0,0,200,193,0,0,64,65,0,0,216,193,10,215,35,59,0,0,0,0,0,0,0,0,0,0,96,64,0,0,0,0,154,153,186,66,0,0,0,0,3,0,1,0,4,0,4,0,6,0,7,0,8,0,8,0,4,0,4,0,4,0,5,0,6,0,8,0,7,0,9,0,5,0,7,0,6,0,8,0,7,0,9,0,8,0,10,0,7,0,8,0,7,0,8,0,8,0,9,0,9,0,10,0,2,0,1,0,3,0,4,0,7,0,7,0,4,0,4,0,4,0,5,0,7,0,7,0,6,0,6,0,7,0,7,0,8,0,8,0,0,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,128,63,54,89,75,63,152,134,33,63,152,134,33,63,152,134,33,63,152,134,33,63,152,134,33,63,250,155,128,62,153,158,240,61,0,0,0,0,3,4,6,7,9,10,4,5,6,7,8,10,5,6,7,8,9,10,7,7,8,9,9,10,8,8,9,9,10,11,9,9,10,10,11,11,0,0,0,0,7,0,5,0,9,0,14,0,15,0,7,0,6,0,4,0,5,0,5,0,6,0,7,0,7,0,6,0,8,0,8,0,8,0,5,0,15,0,6,0,9,0,10,0,5,0,1,0,11,0,7,0,9,0,6,0,4,0,1,0,14,0,4,0,6,0,2,0,6,0,0,0,2,4,7,9,9,10,4,4,6,10,10,10,7,6,8,10,10,11,9,10,10,11,11,12,9,9,10,11,12,12,10,10,11,11,13,13,0,0,0,0,3,0,4,0,6,0,18,0,12,0,5,0,5,0,1,0,2,0,16,0,9,0,3,0,7,0,3,0,5,0,14,0,7,0,3,0,19,0,17,0,15,0,13,0,10,0,4,0,13,0,5,0,8,0,11,0,5,0,1,0,12,0,4,0,4,0,1,0,1,0,0,0,1,4,7,9,9,10,4,6,8,9,9,10,7,7,9,10,10,11,8,9,10,11,11,11,8,9,10,11,11,12,9,10,11,12,12,12,0,0,0,0,1,0,2,0,10,0,19,0,16,0,10,0,3,0,3,0,7,0,10,0,5,0,3,0,11,0,4,0,13,0,17,0,8,0,4,0,12,0,11,0,18,0,15,0,11,0,2,0,7,0,6,0,9,0,14,0,3,0,1,0,6,0,4,0,5,0,3,0,2,0,0,0,3,4,6,8,4,4,6,7,5,6,7,8,7,7,8,9,7,0,3,0,5,0,1,0,6,0,2,0,3,0,2,0,5,0,4,0,4,0,1,0,3,0,3,0,2,0,0,0,1,4,7,8,4,5,8,9,7,8,9,10,8,8,9,10,1,0,2,0,6,0,5,0,3,0,1,0,4,0,4,0,7,0,5,0,7,0,1,0,6,0,1,0,1,0,0,0,2,3,7,4,4,7,6,7,8,0,0,0,0,0,0,0,3,0,2,0,1,0,1,0,1,0,1,0,3,0,2,0,0,0,0,0,0,0,0,0,4,5,5,6,5,6,6,7,5,6,6,7,6,7,7,8,15,0,28,0,26,0,48,0,22,0,40,0,36,0,64,0,14,0,24,0,20,0,32,0,12,0,16,0,8,0,0,0,1,5,5,7,5,8,7,9,5,7,7,9,7,9,9,10,1,0,10,0,8,0,20,0,12,0,20,0,16,0,32,0,14,0,12,0,24,0,0,0,28,0,16,0,24,0,16,0,1,4,7,4,5,7,6,7,8,0,0,0,0,0,0,0,1,0,2,0,1,0,3,0,1,0,1,0,3,0,2,0,0,0,0,0,0,0,0,0,4,5,7,8,9,10,10,11,11,12,12,12,12,12,13,10,5,6,7,8,9,10,10,11,11,11,12,12,12,12,12,10,7,7,8,9,9,10,10,11,11,11,11,12,12,12,13,9,8,8,9,9,10,10,10,11,11,11,11,12,12,12,12,9,9,9,9,10,10,10,10,11,11,11,12,12,12,12,13,9,10,9,10,10,10,10,11,11,11,11,12,12,12,12,12,9,10,10,10,10,10,11,11,11,11,12,12,12,12,12,13,9,11,10,10,10,11,11,11,11,12,12,12,12,12,13,13,10,11,11,11,11,11,11,11,11,11,12,12,12,12,13,13,10,11,11,11,11,11,11,11,12,12,12,12,12,13,13,13,10,12,11,11,11,11,12,12,12,12,12,12,13,13,13,13,10,12,12,11,11,11,12,12,12,12,12,12,13,13,13,13,10,12,12,12,12,12,12,12,12,12,12,13,13,13,13,13,10,12,12,12,12,12,12,12,12,13,13,13,13,13,13,13,10,13,12,12,12,12,12,12,13,13,13,13,13,13,13,13,10,9,9,9,9,9,9,9,9,9,9,9,10,10,10,10,6,15,0,13,0,46,0,80,0,146,0,6,1,248,0,178,1,170,1,157,2,141,2,137,2,109,2,5,2,8,4,88,0,14,0,12,0,21,0,38,0,71,0,130,0,122,0,216,0,209,0,198,0,71,1,89,1,63,1,41,1,23,1,42,0,47,0,22,0,41,0,74,0,68,0,128,0,120,0,221,0,207,0,194,0,182,0,84,1,59,1,39,1,29,2,18,0,81,0,39,0,75,0,70,0,134,0,125,0,116,0,220,0,204,0,190,0,178,0,69,1,55,1,37,1,15,1,16,0,147,0,72,0,69,0,135,0,127,0,118,0,112,0,210,0,200,0,188,0,96,1,67,1,50,1,29,1,28,2,14,0,7,1,66,0,129,0,126,0,119,0,114,0,214,0,202,0,192,0,180,0,85,1,61,1,45,1,25,1,6,1,12,0,249,0,123,0,121,0,117,0,113,0,215,0,206,0,195,0,185,0,91,1,74,1,52,1,35,1,16,1,8,2,10,0,179,1,115,0,111,0,109,0,211,0,203,0,196,0,187,0,97,1,76,1,57,1,42,1,27,1,19,2,125,1,17,0,171,1,212,0,208,0,205,0,201,0,193,0,186,0,177,0,169,0,64,1,47,1,30,1,12,1,2,2,121,1,16,0,79,1,199,0,197,0,191,0,189,0,181,0,174,0,77,1,65,1,49,1,33,1,19,1,9,2,123,1,115,1,11,0,156,2,184,0,183,0,179,0,175,0,88,1,75,1,58,1,48,1,34,1,21,1,18,2,127,1,117,1,110,1,10,0,140,2,90,1,171,0,168,0,164,0,62,1,53,1,43,1,31,1,20,1,7,1,1,2,119,1,112,1,106,1,6,0,136,2,66,1,60,1,56,1,51,1,46,1,36,1,28,1,13,1,5,1,0,2,120,1,114,1,108,1,103,1,4,0,108,2,44,1,40,1,38,1,32,1,26,1,17,1,10,1,3,2,124,1,118,1,113,1,109,1,105,1,101,1,2,0,9,4,24,1,22,1,18,1,11,1,8,1,3,1,126,1,122,1,116,1,111,1,107,1,104,1,102,1,100,1,0,0,43,0,20,0,19,0,17,0,15,0,13,0,11,0,9,0,7,0,6,0,4,0,7,0,5,0,3,0,1,0,3,0,1,4,3,5,0,0,0,0,1,0,1,0,1,0,0,0,1,5,7,9,10,10,11,11,12,12,12,13,13,13,14,10,4,6,8,9,10,11,11,11,12,12,12,13,14,13,14,10,7,8,9,10,11,11,12,12,13,12,13,13,13,14,14,11,9,9,10,11,11,12,12,12,13,13,14,14,14,15,15,12,10,10,11,11,12,12,13,13,13,14,14,14,15,15,15,11,10,10,11,11,12,13,13,14,13,14,14,15,15,15,16,12,11,11,11,12,13,13,13,13,14,14,14,14,15,15,16,12,11,11,12,12,13,13,13,14,14,15,15,15,15,17,17,12,11,12,12,13,13,13,14,14,15,15,15,15,16,16,16,12,12,12,12,13,13,14,14,15,15,15,15,16,15,16,15,13,12,13,12,13,14,14,14,14,15,16,16,16,17,17,16,12,13,13,13,13,14,14,15,16,16,16,16,16,16,15,16,13,13,14,14,14,14,15,15,15,15,17,16,16,16,16,18,13,15,14,14,14,15,15,16,16,16,18,17,17,17,19,17,13,14,15,13,14,16,16,15,16,16,17,18,17,19,17,16,13,10,10,10,11,11,12,12,12,13,13,13,13,13,13,13,10,1,5,7,9,10,10,11,11,12,12,12,13,13,13,14,11,4,6,8,9,10,11,11,11,12,12,12,13,14,13,14,11,7,8,9,10,11,11,12,12,13,12,13,13,13,14,14,12,9,9,10,11,11,12,12,12,13,13,14,14,14,15,15,13,10,10,11,11,12,12,13,13,13,14,14,14,15,15,15,12,10,10,11,11,12,13,13,14,13,14,14,15,15,15,16,13,11,11,11,12,13,13,13,13,14,14,14,14,15,15,16,13,11,11,12,12,13,13,13,14,14,15,15,15,15,17,17,13,11,12,12,13,13,13,14,14,15,15,15,15,16,16,16,13,12,12,12,13,13,14,14,15,15,15,15,16,15,16,15,14,12,13,12,13,14,14,14,14,15,16,16,16,17,17,16,13,13,13,13,13,14,14,15,16,16,16,16,16,16,15,16,14,13,14,14,14,14,15,15,15,15,17,16,16,16,16,18,14,15,14,14,14,15,15,16,16,16,18,17,17,17,19,17,14,14,15,13,14,16,16,15,16,16,17,18,17,19,17,16,14,11,11,11,12,12,13,13,13,14,14,14,14,14,14,14,12,1,0,5,0,14,0,44,0,74,0,63,0,110,0,93,0,172,0,149,0,138,0,242,0,225,0,195,0,120,1,17,0,3,0,4,0,12,0,20,0,35,0,62,0,53,0,47,0,83,0,75,0,68,0,119,0,201,0,107,0,207,0,9,0,15,0,13,0,23,0,38,0,67,0,58,0,103,0,90,0,161,0,72,0,127,0,117,0,110,0,209,0,206,0,16,0,45,0,21,0,39,0,69,0,64,0,114,0,99,0,87,0,158,0,140,0,252,0,212,0,199,0,131,1,109,1,26,0,75,0,36,0,68,0,65,0,115,0,101,0,179,0,164,0,155,0,8,1,246,0,226,0,139,1,126,1,106,1,9,0,66,0,30,0,59,0,56,0,102,0,185,0,173,0,9,1,142,0,253,0,232,0,144,1,132,1,122,1,189,1,16,0,111,0,54,0,52,0,100,0,184,0,178,0,160,0,133,0,1,1,244,0,228,0,217,0,129,1,110,1,203,2,10,0,98,0,48,0,91,0,88,0,165,0,157,0,148,0,5,1,248,0,151,1,141,1,116,1,124,1,121,3,116,3,8,0,85,0,84,0,81,0,159,0,156,0,143,0,4,1,249,0,171,1,145,1,136,1,127,1,215,2,201,2,196,2,7,0,154,0,76,0,73,0,141,0,131,0,0,1,245,0,170,1,150,1,138,1,128,1,223,2,103,1,198,2,96,1,11,0,139,0,129,0,67,0,125,0,247,0,233,0,229,0,219,0,137,1,231,2,225,2,208,2,117,3,114,3,183,1,4,0,243,0,120,0,118,0,115,0,227,0,223,0,140,1,234,2,230,2,224,2,209,2,200,2,194,2,223,0,180,1,6,0,202,0,224,0,222,0,218,0,216,0,133,1,130,1,125,1,108,1,120,3,187,1,195,2,184,1,181,1,192,6,4,0,235,2,211,0,210,0,208,0,114,1,123,1,222,2,211,2,202,2,199,6,115,3,109,3,108,3,131,13,97,3,2,0,121,1,113,1,102,0,187,0,214,2,210,2,102,1,199,2,197,2,98,3,198,6,103,3,130,13,102,3,178,1,0,0,12,0,10,0,7,0,11,0,10,0,17,0,11,0,9,0,13,0,12,0,10,0,7,0,5,0,3,0,1,0,3,0,3,5,6,8,8,9,10,10,10,11,11,12,12,12,13,14,5,5,7,8,9,9,10,10,10,11,11,12,12,12,13,13,6,7,7,8,9,9,10,10,10,11,11,12,12,13,13,13,7,8,8,9,9,10,10,11,11,11,12,12,12,13,13,13,8,8,9,9,10,10,11,11,11,11,12,12,12,13,13,13,9,9,9,10,10,10,11,11,11,11,12,12,13,13,13,14,10,9,10,10,10,11,11,11,11,12,12,12,13,13,14,14,10,10,10,11,11,11,11,12,12,12,12,12,13,13,13,14,10,10,10,11,11,11,11,12,12,12,12,13,13,14,14,14,10,10,11,11,11,11,12,12,12,13,13,13,13,14,14,14,11,11,11,11,12,12,12,12,12,13,13,13,13,14,15,14,11,11,11,11,12,12,12,12,13,13,13,13,14,14,14,15,12,12,11,12,12,12,13,13,13,13,13,13,14,14,15,15,12,12,12,12,12,13,13,13,13,14,14,14,14,14,15,15,13,13,13,13,13,13,13,13,14,14,14,14,15,15,14,15,13,13,13,13,13,13,13,14,14,14,14,14,15,15,15,15,7,0,12,0,18,0,53,0,47,0,76,0,124,0,108,0,89,0,123,0,108,0,119,0,107,0,81,0,122,0,63,0,13,0,5,0,16,0,27,0,46,0,36,0,61,0,51,0,42,0,70,0,52,0,83,0,65,0,41,0,59,0,36,0,19,0,17,0,15,0,24,0,41,0,34,0,59,0,48,0,40,0,64,0,50,0,78,0,62,0,80,0,56,0,33,0,29,0,28,0,25,0,43,0,39,0,63,0,55,0,93,0,76,0,59,0,93,0,72,0,54,0,75,0,50,0,29,0,52,0,22,0,42,0,40,0,67,0,57,0,95,0,79,0,72,0,57,0,89,0,69,0,49,0,66,0,46,0,27,0,77,0,37,0,35,0,66,0,58,0,52,0,91,0,74,0,62,0,48,0,79,0,63,0,90,0,62,0,40,0,38,0,125,0,32,0,60,0,56,0,50,0,92,0,78,0,65,0,55,0,87,0,71,0,51,0,73,0,51,0,70,0,30,0,109,0,53,0,49,0,94,0,88,0,75,0,66,0,122,0,91,0,73,0,56,0,42,0,64,0,44,0,21,0,25,0,90,0,43,0,41,0,77,0,73,0,63,0,56,0,92,0,77,0,66,0,47,0,67,0,48,0,53,0,36,0,20,0,71,0,34,0,67,0,60,0,58,0,49,0,88,0,76,0,67,0,106,0,71,0,54,0,38,0,39,0,23,0,15,0,109,0,53,0,51,0,47,0,90,0,82,0,58,0,57,0,48,0,72,0,57,0,41,0,23,0,27,0,62,0,9,0,86,0,42,0,40,0,37,0,70,0,64,0,52,0,43,0,70,0,55,0,42,0,25,0,29,0,18,0,11,0,11,0,118,0,68,0,30,0,55,0,50,0,46,0,74,0,65,0,49,0,39,0,24,0,16,0,22,0,13,0,14,0,7,0,91,0,44,0,39,0,38,0,34,0,63,0,52,0,45,0,31,0,52,0,28,0,19,0,14,0,8,0,9,0,3,0,123,0,60,0,58,0,53,0,47,0,43,0,32,0,22,0,37,0,24,0,17,0,12,0,15,0,10,0,2,0,1,0,71,0,37,0,34,0,30,0,28,0,20,0,17,0,26,0,21,0,16,0,10,0,6,0,8,0,6,0,2,0,0,0,1,5,7,8,9,10,10,11,10,11,12,12,13,13,14,14,4,6,8,9,10,10,11,11,11,11,12,12,13,14,14,14,7,8,9,10,11,11,12,12,11,12,12,13,13,14,15,15,8,9,10,11,11,12,12,12,12,13,13,13,13,14,15,15,9,9,11,11,12,12,13,13,12,13,13,14,14,15,15,16,10,10,11,12,12,12,13,13,13,13,14,13,15,15,16,16,10,11,12,12,13,13,13,13,13,14,14,14,15,15,16,16,11,11,12,13,13,13,14,14,14,14,15,15,15,16,18,18,10,10,11,12,12,13,13,14,14,14,14,15,15,16,17,17,11,11,12,12,13,13,13,15,14,15,15,16,16,16,18,17,11,12,12,13,13,14,14,15,14,15,16,15,16,17,18,19,12,12,12,13,14,14,14,14,15,15,15,16,17,17,17,18,12,13,13,14,14,15,14,15,16,16,17,17,17,18,18,18,13,13,14,15,15,15,16,16,16,16,16,17,18,17,18,18,14,14,14,15,15,15,17,16,16,19,17,17,17,19,18,18,13,14,15,16,16,16,17,16,17,17,18,18,21,20,21,18,1,0,5,0,14,0,21,0,34,0,51,0,46,0,71,0,42,0,52,0,68,0,52,0,67,0,44,0,43,0,19,0,3,0,4,0,12,0,19,0,31,0,26,0,44,0,33,0,31,0,24,0,32,0,24,0,31,0,35,0,22,0,14,0,15,0,13,0,23,0,36,0,59,0,49,0,77,0,65,0,29,0,40,0,30,0,40,0,27,0,33,0,42,0,16,0,22,0,20,0,37,0,61,0,56,0,79,0,73,0,64,0,43,0,76,0,56,0,37,0,26,0,31,0,25,0,14,0,35,0,16,0,60,0,57,0,97,0,75,0,114,0,91,0,54,0,73,0,55,0,41,0,48,0,53,0,23,0,24,0,58,0,27,0,50,0,96,0,76,0,70,0,93,0,84,0,77,0,58,0,79,0,29,0,74,0,49,0,41,0,17,0,47,0,45,0,78,0,74,0,115,0,94,0,90,0,79,0,69,0,83,0,71,0,50,0,59,0,38,0,36,0,15,0,72,0,34,0,56,0,95,0,92,0,85,0,91,0,90,0,86,0,73,0,77,0,65,0,51,0,44,0,43,0,42,0,43,0,20,0,30,0,44,0,55,0,78,0,72,0,87,0,78,0,61,0,46,0,54,0,37,0,30,0,20,0,16,0,53,0,25,0,41,0,37,0,44,0,59,0,54,0,81,0,66,0,76,0,57,0,54,0,37,0,18,0,39,0,11,0,35,0,33,0,31,0,57,0,42,0,82,0,72,0,80,0,47,0,58,0,55,0,21,0,22,0,26,0,38,0,22,0,53,0,25,0,23,0,38,0,70,0,60,0,51,0,36,0,55,0,26,0,34,0,23,0,27,0,14,0,9,0,7,0,34,0,32,0,28,0,39,0,49,0,75,0,30,0,52,0,48,0,40,0,52,0,28,0,18,0,17,0,9,0,5,0,45,0,21,0,34,0,64,0,56,0,50,0,49,0,45,0,31,0,19,0,12,0,15,0,10,0,7,0,6,0,3,0,48,0,23,0,20,0,39,0,36,0,35,0,53,0,21,0,16,0,23,0,13,0,10,0,6,0,1,0,4,0,2,0,16,0,15,0,17,0,27,0,25,0,20,0,29,0,11,0,17,0,12,0,16,0,8,0,1,0,1,0,0,0,1,0,4,4,6,8,9,10,10,10,4,5,6,7,9,9,10,10,6,6,7,8,9,10,9,10,7,7,8,8,9,10,10,10,8,8,9,9,10,10,10,11,9,9,10,10,10,11,10,11,9,9,9,10,10,11,11,12,10,10,10,11,11,11,11,12,9,0,6,0,16,0,33,0,41,0,39,0,38,0,26,0,7,0,5,0,6,0,9,0,23,0,16,0,26,0,11,0,17,0,7,0,11,0,14,0,21,0,30,0,10,0,7,0,17,0,10,0,15,0,12,0,18,0,28,0,14,0,5,0,32,0,13,0,22,0,19,0,18,0,16,0,9,0,5,0,40,0,17,0,31,0,29,0,17,0,13,0,4,0,2,0,27,0,12,0,11,0,15,0,10,0,7,0,4,0,1,0,27,0,12,0,8,0,12,0,6,0,3,0,1,0,0,0,2,4,6,8,9,10,9,10,4,5,6,8,10,10,9,10,6,7,8,9,10,11,10,10,8,8,9,11,10,12,10,11,9,10,10,11,11,12,11,12,9,10,11,12,12,13,12,13,9,9,9,10,11,12,12,12,9,9,10,11,12,12,12,12,3,0,4,0,10,0,24,0,34,0,33,0,21,0,15,0,5,0,3,0,4,0,10,0,32,0,17,0,11,0,10,0,11,0,7,0,13,0,18,0,30,0,31,0,20,0,5,0,25,0,11,0,19,0,59,0,27,0,18,0,12,0,5,0,35,0,33,0,31,0,58,0,30,0,16,0,7,0,5,0,28,0,26,0,32,0,19,0,17,0,15,0,8,0,14,0,14,0,12,0,9,0,13,0,14,0,9,0,4,0,1,0,11,0,4,0,6,0,6,0,6,0,3,0,2,0,0,0,1,4,7,9,10,10,10,11,4,6,8,9,10,11,10,10,7,8,9,10,11,12,11,11,8,9,10,11,12,12,11,12,9,10,11,12,12,12,12,12,10,11,12,12,13,13,12,13,9,10,11,12,12,12,13,13,10,10,11,12,12,13,13,13,1,0,2,0,10,0,23,0,35,0,30,0,12,0,17,0,3,0,3,0,8,0,12,0,18,0,21,0,12,0,7,0,11,0,9,0,15,0,21,0,32,0,40,0,19,0,6,0,14,0,13,0,22,0,34,0,46,0,23,0,18,0,7,0,20,0,19,0,33,0,47,0,27,0,22,0,9,0,3,0,31,0,22,0,41,0,26,0,21,0,20,0,5,0,3,0,14,0,13,0,10,0,11,0,16,0,6,0,5,0,1,0,9,0,8,0,7,0,8,0,4,0,4,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,3,0,0,0,2,0,0,0,3,0,0,0,3,0,0,0,4,0,0,0,3,0,0,0,4,0,0,0,3,0,0,0,4,0,0,0,4,0,0,0,5,0,0,0,4,0,0,0,5,0,0,0,4,0,0,0,6,0,0,0,5,0,0,0,6,0,0,0,5,0,0,0,6,0,0,0,5,0,0,0,7,0,0,0,6,0,0,0,7,0,0,0,6,0,0,0,7,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,2,0,0,0,3,0,0,0,1,0,0,0,2,0,0,0,4,0,0,0,8,0,0,0,1,0,0,0,2,0,0,0,4,0,0,0,8,0,0,0,2,0,0,0,4,0,0,0,8,0,0,0,2,0,0,0,4,0,0,0,8,0,0,0,4,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,3,0,0,0,3,0,0,0,3,0,0,0,4,0,0,0,4,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,8,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,8,0,0,0,8,0,0,0,8,0,0,0,16,0,0,0,16,0,0,0,0,0,0,0,6,0,0,0,12,0,0,0,18,0,0,0,24,0,0,0,30,0,0,0,36,0,0,0,44,0,0,0,54,0,0,0,66,0,0,0,80,0,0,0,96,0,0,0,116,0,0,0,140,0,0,0,168,0,0,0,200,0,0,0,238,0,0,0,28,1,0,0,80,1,0,0,140,1,0,0,208,1,0,0,10,2,0,0,64,2,0,0,0,0,0,0,4,0,0,0,8,0,0,0,12,0,0,0,18,0,0,0,24,0,0,0,32,0,0,0,42,0,0,0,56,0,0,0,74,0,0,0,100,0,0,0,132,0,0,0,174,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,12,0,0,0,18,0,0,0,24,0,0,0,30,0,0,0,36,0,0,0,44,0,0,0,54,0,0,0,66,0,0,0,80,0,0,0,96,0,0,0,114,0,0,0,136,0,0,0,162,0,0,0,194,0,0,0,232,0,0,0,22,1,0,0,76,1,0,0,138,1,0,0,208,1,0,0,28,2,0,0,64,2,0,0,0,0,0,0,4,0,0,0,8,0,0,0,12,0,0,0,18,0,0,0,26,0,0,0,36,0,0,0,48,0,0,0,62,0,0,0,80,0,0,0,104,0,0,0,136,0,0,0,180,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,12,0,0,0,18,0,0,0,24,0,0,0,30,0,0,0,36,0,0,0,44,0,0,0,54,0,0,0,66,0,0,0,80,0,0,0,96,0,0,0,116,0,0,0,140,0,0,0,168,0,0,0,200,0,0,0,238,0,0,0,28,1,0,0,80,1,0,0,140,1,0,0,208,1,0,0,10,2,0,0,64,2,0,0,0,0,0,0,4,0,0,0,8,0,0,0,12,0,0,0,18,0,0,0,26,0,0,0,36,0,0,0,48,0,0,0,62,0,0,0,80,0,0,0,104,0,0,0,134,0,0,0,174,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,8,0,0,0,12,0,0,0,16,0,0,0,20,0,0,0,24,0,0,0,30,0,0,0,36,0,0,0,44,0,0,0,52,0,0,0,62,0,0,0,74,0,0,0,90,0,0,0,110,0,0,0,134,0,0,0,162,0,0,0,196,0,0,0,238,0,0,0,32,1,0,0,86,1,0,0,162,1,0,0,64,2,0,0,0,0,0,0,4,0,0,0,8,0,0,0,12,0,0,0,16,0,0,0,22,0,0,0,30,0,0,0,40,0,0,0,52,0,0,0,66,0,0,0,84,0,0,0,106,0,0,0,136,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,8,0,0,0,12,0,0,0,16,0,0,0,20,0,0,0,24,0,0,0,30,0,0,0,36,0,0,0,42,0,0,0,50,0,0,0,60,0,0,0,72,0,0,0,88,0,0,0,106,0,0,0,128,0,0,0,156,0,0,0,190,0,0,0,230,0,0,0,20,1,0,0,74,1,0,0,128,1,0,0,64,2,0,0,0,0,0,0,4,0,0,0,8,0,0,0,12,0,0,0,16,0,0,0,22,0,0,0,28,0,0,0,38,0,0,0,50,0,0,0,64,0,0,0,80,0,0,0,100,0,0,0,126,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,8,0,0,0,12,0,0,0,16,0,0,0,20,0,0,0,24,0,0,0,30,0,0,0,36,0,0,0,44,0,0,0,54,0,0,0,66,0,0,0,82,0,0,0,102,0,0,0,126,0,0,0,156,0,0,0,194,0,0,0,240,0,0,0,40,1,0,0,108,1,0,0,192,1,0,0,38,2,0,0,64,2,0,0,0,0,0,0,4,0,0,0,8,0,0,0,12,0,0,0,16,0,0,0,22,0,0,0,30,0,0,0,42,0,0,0,58,0,0,0,78,0,0,0,104,0,0,0,138,0,0,0,180,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,12,0,0,0,18,0,0,0,24,0,0,0,30,0,0,0,36,0,0,0,44,0,0,0,54,0,0,0,66,0,0,0,80,0,0,0,96,0,0,0,116,0,0,0,140,0,0,0,168,0,0,0,200,0,0,0,238,0,0,0,28,1,0,0,80,1,0,0,140,1,0,0,208,1,0,0,10,2,0,0,64,2,0,0,0,0,0,0,4,0,0,0,8,0,0,0,12,0,0,0,18,0,0,0,26,0,0,0,36,0,0,0,48,0,0,0,62,0,0,0,80,0,0,0,104,0,0,0,134,0,0,0,174,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,12,0,0,0,18,0,0,0,24,0,0,0,30,0,0,0,36,0,0,0,44,0,0,0,54,0,0,0,66,0,0,0,80,0,0,0,96,0,0,0,116,0,0,0,140,0,0,0,168,0,0,0,200,0,0,0,238,0,0,0,28,1,0,0,80,1,0,0,140,1,0,0,208,1,0,0,10,2,0,0,64,2,0,0,0,0,0,0,4,0,0,0,8,0,0,0,12,0,0,0,18,0,0,0,26,0,0,0,36,0,0,0,48,0,0,0,62,0,0,0,80,0,0,0,104,0,0,0,134,0,0,0,174,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,24,0,0,0,36,0,0,0,48,0,0,0,60,0,0,0,72,0,0,0,88,0,0,0,108,0,0,0,132,0,0,0,160,0,0,0,192,0,0,0,232,0,0,0,24,1,0,0,80,1,0,0,144,1,0,0,220,1,0,0,54,2,0,0,56,2,0,0,58,2,0,0,60,2,0,0,62,2,0,0,64,2,0,0,0,0,0,0,8,0,0,0,16,0,0,0,24,0,0,0,36,0,0,0,52,0,0,0,72,0,0,0,96,0,0,0,124,0,0,0,160,0,0,0,162,0,0,0,164,0,0,0,166,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,11,0,0,0,16,0,0,0,21,0,0,0,0,0,0,0,0,0,0,0,18,0,0,0,36,0,0,0,54,0,0,0,54,0,0,0,36,0,0,0,54,0,0,0,72,0,0,0,54,0,0,0,72,0,0,0,90,0,0,0,72,0,0,0,90,0,0,0,108,0,0,0,108,0,0,0,126,0,0,0,0,0,0,0,18,0,0,0,36,0,0,0,54,0,0,0,51,0,0,0,35,0,0,0,53,0,0,0,71,0,0,0,52,0,0,0,70,0,0,0,88,0,0,0,69,0,0,0,87,0,0,0,105,0,0,0,104,0,0,0,122,0,0,0,0,0,0,0,10,0,0,0,20,0,0,0,30,0,0,0,33,0,0,0,21,0,0,0,31,0,0,0,41,0,0,0,32,0,0,0,42,0,0,0,52,0,0,0,43,0,0,0,53,0,0,0,63,0,0,0,64,0,0,0,74,0,0,0,34,86,0,0,192,93,0,0,128,62,0,0,255,255,255,255,68,172,0,0,128,187,0,0,0,125,0,0,255,255,255,255,17,43,0,0,224,46,0,0,64,31,0,0,255,255,255,255,0,128,64,192,32,160,96,224,16,144,80,208,48,176,112,240,8,136,72,200,40,168,104,232,24,152,88,216,56,184,120,248,4,132,68,196,36,164,100,228,20,148,84,212,52,180,116,244,12,140,76,204,44,172,108,236,28,156,92,220,60,188,124,252,2,130,66,194,34,162,98,226,18,146,82,210,50,178,114,242,10,138,74,202,42,170,106,234,26,154,90,218,58,186,122,250,6,134,70,198,38,166,102,230,22,150,86,214,54,182,118,246,14,142,78,206,46,174,110,238,30,158,94,222,62,190,126,254,111,112,116,105,111,110,32,114,101,113,117,105,114,101,115,32,97,110,32,97,114,103,117,109,101,110,116,32,45,45,32,37,115,0,0,0,0,0,0,0,111,112,116,105,111,110,32,114,101,113,117,105,114,101,115,32,97,110,32,97,114,103,117,109,101,110,116,32,45,45,32,37,99,0,0,0,0,0,0,0,205,204,236,192,205,204,236,192,205,204,236,192,0,0,24,193,205,204,236,192,51,51,195,192,0,0,176,192,102,102,150,192,102,102,150,192,102,102,150,192,102,102,150,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,3,0,0,0,3,0,0,0,3,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,36,64,0,0,0,0,0,0,89,64,0,0,0,0,0,136,195,64,0,0,0,0,132,215,151,65,0,128,224,55,121,195,65,67,23,110,5,181,181,184,147,70,245,249,63,233,3,79,56,77,50,29,48,249,72,119,130,90,60,191,115,127,221,79,21,117,0,0,0,0,0,0,0,0,205,204,60,65,154,153,89,65,154,153,137,65,0,0,0,66,0,0,58,66,51,51,77,66,0,0,102,66,51,51,134,66,0,0,143,66,51,51,169,66,51,51,195,66,0,0,2,67,154,153,217,64,154,153,185,64,154,153,185,64,205,204,204,64,0,0,208,64,102,102,30,65,154,153,65,65,102,102,102,65,0,0,112,65,51,51,151,65,205,204,172,65,51,51,215,65,205,204,8,66,205,204,32,66,51,51,59,66,0,0,98,66,205,204,114,66,205,204,147,66,102,102,171,66,205,204,186,66,51,51,252,66,0,0,0,0,0,0,0,0,1,0,0,0,16,0,0,0,17,0,0,0,8,0,0,0,9,0,0,0,24,0,0,0,25,0,0,0,4,0,0,0,5,0,0,0,20,0,0,0,21,0,0,0,12,0,0,0,13,0,0,0,28,0,0,0,29,0,0,0,2,0,0,0,3,0,0,0,18,0,0,0,19,0,0,0,10,0,0,0,11,0,0,0,26,0,0,0,27,0,0,0,6,0,0,0,7,0,0,0,22,0,0,0,23,0,0,0,14,0,0,0,15,0,0,0,30,0,0,0,31,0,0,0,63,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,8,0,0,0,208,7,0,0,16,0,0,0,116,14,0,0,24,0,0,0,60,15,0,0,32,0,0,0,124,21,0,0,40,0,0,0,88,27,0,0,48,0,0,0,76,29,0,0,56,0,0,0,16,39,0,0,64,0,0,0,248,42,0,0,80,0,0,0,188,52,0,0,96,0,0,0,252,58,0,0,112,0,0,0,240,60,0,0,128,0,0,0,104,66,0,0,160,0,0,0,92,68,0,0,192,0,0,0,168,72,0,0,224,0,0,0,200,75,0,0,0,1,0,0,244,76,0,0,64,1,0,0,20,80,0,0,1,0,0,0,0,0,0,0,6,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0].concat([9,0,0,0,9,0,0,0,9,0,0,0,9,0,0,0,6,0,0,0,9,0,0,0,9,0,0,0,9,0,0,0,6,0,0,0,5,0,0,0,7,0,0,0,3,0,0,0,9,0,0,0,9,0,0,0,12,0,0,0,6,0,0,0,6,0,0,0,9,0,0,0,12,0,0,0,6,0,0,0,11,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,18,0,0,0,18,0,0,0,0,0,0,0,0,0,0,0,15,0,0,0,18,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,7,0,0,0,7,0,0,0,0,0,0,0,12,0,0,0,12,0,0,0,12,0,0,0,0,0,0,0,6,0,0,0,15,0,0,0,12,0,0,0,0,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,3,0,0,0,12,0,0,0,9,0,0,0,9,0,0,0,6,0,0,0,6,0,0,0,12,0,0,0,9,0,0,0,6,0,0,0,8,0,0,0,8,0,0,0,5,0,0,0,0,0,0,0,15,0,0,0,12,0,0,0,9,0,0,0,0,0,0,0,6,0,0,0,18,0,0,0,9,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,111,112,116,105,111,110,32,100,111,101,115,110,39,116,32,116,97,107,101,32,97,110,32,97,114,103,117,109,101,110,116,32,45,45,32,37,46,42,115,0,8,0,0,0,16,0,0,0,24,0,0,0,32,0,0,0,40,0,0,0,48,0,0,0,56,0,0,0,64,0,0,0,80,0,0,0,96,0,0,0,112,0,0,0,128,0,0,0,160,0,0,0,192,0,0,0,224,0,0,0,0,1,0,0,64,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,3,0,0,0,3,0,0,0,3,0,0,0,3,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,0,0,0,0,15,0,0,0,15,0,0,0,7,0,0,0,7,0,0,0,15,0,0,0,15,0,0,0,7,0,0,0,0,0,0,0,7,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,15,0,0,0,31,0,0,0,31,0,0,0,0,0,0,0,7,0,0,0,7,0,0,0,7,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,15,15,15,15,15,15,15,15,15,15,15,7,7,7,7,7,7,7,7,7,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,1,0,5,0,5,0,7,0,7,0,8,0,9,0,9,0,10,0,10,0,10,0,10,0,11,0,11,0,11,0,11,0,12,0,12,0,12,0,12,0,12,0,12,0,13,0,12,0,13,0,12,0,13,0,13,0,14,0,10,0,10,0,5,0,4,0,6,0,6,0,7,0,8,0,8,0,9,0,9,0,10,0,10,0,11,0,10,0,11,0,11,0,11,0,11,0,12,0,11,0,12,0,12,0,12,0,12,0,13,0,12,0,14,0,12,0,13,0,12,0,14,0,10,0,10,0,7,0,7,0,7,0,8,0,8,0,9,0,9,0,10,0,9,0,11,0,10,0,11,0,10,0,12,0,11,0,12,0,11,0,13,0,11,0,12,0,11,0,13,0,12,0,13,0,12,0,13,0,12,0,14,0,13,0,14,0,9,0,11,0,8,0,9,0,8,0,9,0,9,0,10,0,9,0,11,0,10,0,11,0,10,0,12,0,10,0,12,0,11,0,12,0,11,0,13,0,11,0,13,0,11,0,14,0,12,0,14,0,12,0,14,0,12,0,15,0,12,0,15,0,9,0,12,0,9,0,10,0,9,0,10,0,9,0,11,0,10,0,11,0,10,0,12,0,10,0,12,0,10,0,13,0,11,0,13,0,11,0,13,0,11,0,14,0,12,0,14,0,12,0,14,0,12,0,15,0,12,0,15,0,13,0,15,0,9,0,11,0,10,0,10,0,9,0,10,0,10,0,11,0,10,0,11,0,10,0,12,0,10,0,13,0,11,0,13,0,11,0,14,0,11,0,13,0,11,0,14,0,12,0,14,0,12,0,15,0,12,0,15,0,12,0,15,0,12,0,16,0,9,0,12,0,10,0,11,0,10,0,11,0,10,0,11,0,10,0,12,0,10,0,13,0,11,0,13,0,11,0,13,0,11,0,13,0,11,0,14,0,12,0,14,0,12,0,14,0,12,0,14,0,12,0,15,0,12,0,15,0,13,0,16,0,9,0,12,0,11,0,11,0,10,0,11,0,10,0,12,0,10,0,12,0,11,0,13,0,11,0,13,0,11,0,13,0,11,0,14,0,12,0,14,0,12,0,15,0,12,0,15,0,12,0,15,0,12,0,15,0,13,0,17,0,13,0,17,0,10,0,12,0,11,0,11,0,11,0,12,0,11,0,12,0,11,0,13,0,11,0,13,0,11,0,13,0,11,0,14,0,11,0,14,0,11,0,15,0,12,0,15,0,12,0,15,0,12,0,15,0,12,0,16,0,13,0,16,0,13,0,16,0,10,0,12,0,11,0,12,0,11,0,12,0,11,0,12,0,11,0,13,0,11,0,13,0,11,0,14,0,11,0,14,0,12,0,15,0,12,0,15,0,12,0,15,0,12,0,15,0,12,0,16,0,13,0,15,0,13,0,16,0,13,0,15,0,10,0,13,0,12,0,12,0,11,0,13,0,11,0,12,0,11,0,13,0,11,0,14,0,12,0,14,0,12,0,14,0,12,0,14,0,12,0,15,0,12,0,16,0,12,0,16,0,13,0,16,0,13,0,17,0,13,0,17,0,13,0,16,0,10,0,12,0,12,0,13,0,12,0,13,0,11,0,13,0,11,0,13,0,11,0,14,0,12,0,14,0,12,0,15,0,12,0,16,0,12,0,16,0,12,0,16,0,12,0,16,0,13,0,16,0,13,0,16,0,13,0,15,0,13,0,16,0,10,0,13,0,12,0,13,0,12,0,14,0,12,0,14,0,12,0,14,0,12,0,14,0,12,0,15,0,12,0,15,0,12,0,15,0,12,0,15,0,12,0,17,0,13,0,16,0,13,0,16,0,13,0,16,0,13,0,16,0,13,0,18,0,10,0,13,0,12,0,15,0,12,0,14,0,12,0,14,0,12,0,14,0,12,0,15,0,12,0,15,0,12,0,16,0,12,0,16,0,13,0,16,0,13,0,18,0,13,0,17,0,13,0,17,0,13,0,17,0,13,0,19,0,13,0,17,0,10,0,13,0,13,0,14,0,12,0,15,0,12,0,13,0,12,0,14,0,12,0,16,0,12,0,16,0,12,0,15,0,13,0,16,0,13,0,16,0,13,0,17,0,13,0,18,0,13,0,17,0,13,0,19,0,13,0,17,0,13,0,16,0,10,0,13,0,9,0,10,0,9,0,10,0,9,0,10,0,9,0,11,0,9,0,11,0,9,0,12,0,9,0,12,0,9,0,12,0,9,0,13,0,9,0,13,0,9,0,13,0,10,0,13,0,10,0,13,0,10,0,13,0,10,0,13,0,6,0,10,0,44,76,0,0,56,74,0,0,68,72,0,0,80,70,0,0,92,68,0,0,116,64,0,0,140,60,0,0,164,56,0,0,212,48,0,0,28,37,0,0,110,15,0,0,0,0,0,0,192,93,0,0,44,76,0,0,68,72,0,0,80,70,0,0,92,68,0,0,104,66,0,0,116,64,0,0,240,60,0,0,96,59,0,0,62,28,0,0,110,15,0,0,0,0,0,0,44,76,0,0,56,74,0,0,168,72,0,0,80,70,0,0,92,68,0,0,128,62,0,0,240,60,0,0,52,58,0,0,212,48,0,0,16,39,0,0,110,15,0,0,0,0,0,0,128,187,0,0,0,0,0,0,0,0,208,64,0,0,0,0,0,0,208,64,148,92,0,0,68,172,0,0,0,0,0,0,0,0,208,64,0,0,0,0,0,0,208,64,20,85,0,0,0,125,0,0,0,0,208,64,0,0,0,65,102,102,166,64,0,0,208,64,184,61,0,0,192,93,0,0,0,0,0,65,0,0,8,65,102,102,166,64,0,0,192,64,74,46,0,0,34,86,0,0,0,0,8,65,246,40,16,65,102,102,166,64,0,0,208,64,140,42,0,0,128,62,0,0,246,40,16,65,102,102,22,65,205,204,156,64,0,0,208,64,223,30,0,0,224,46,0,0,102,102,22,65,154,153,25,65,0,0,144,64,0,0,192,64,40,23,0,0,17,43,0,0,154,153,25,65,102,102,30,65,51,51,163,64,0,0,208,64,70,21,0,0,64,31,0,0,102,102,30,65,0,0,32,65,205,204,156,64,0,0,208,64,112,15,0,0,102,102,182,64,0,0,208,64,154,153,233,64,51,51,3,65,0,0,32,65,102,102,62,65,0,0,80,65,0,0,96,65,0,0,112,65,0,0,132,65,0,0,0,0,0,0,0,0,117,110,107,110,111,119,110,32,111,112,116,105,111,110,32,45,45,32,37,115,0,0,0,0,117,110,107,110,111,119,110,32,111,112,116,105,111,110,32,45,45,32,37,99,0,0,0,0,1,0,0,0,2,0,0,0,5,0,0,0,7,0,0,0,7,0,0,0,10,0,0,0,10,0,0,0,13,0,0,0,13,0,0,0,13,0,0,0,13,0,0,0,13,0,0,0,13,0,0,0,13,0,0,0,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,15,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,63,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,255,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,255,3,0,0,0,0,0,0,0,0,0,0,13,0,0,0,255,31,0,0,0,0,0,0,0,0,0,0,4,0,0,0,15,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,31,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,63,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,127,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,255,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,255,1,0,0,0,0,0,0,0,0,0,0,11,0,0,0,255,7,0,0,0,0,0,0,0,0,0,0,13,0,0,0,255,31,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,123,0,0,0,34,0,0,0,74,0,0,0,73,0,0,0,99,0,0,0,20,0,0,0,40,0,0,0,26,0,0,0,145,0,0,0,90,0,0,0,116,0,0,0,41,0,0,0,135,0,0,0,85,0,0,0,96,0,0,0,138,0,0,0,89,0,0,0,0,0,0,0,107,0,0,0,132,0,0,0,65,0,0,0,88,0,0,0,104,0,0,0,102,0,0,0,97,0,0,0,136,0,0,0,61,0,0,0,141,0,0,0,32,0,0,0,1,0,0,0,112,0,0,0,128,0,0,0,57,0,0,0,140,0,0,0,2,0,0,0,139,0,0,0,58,0,0,0,3,0,0,0,125,0,0,0,50,0,0,0,22,0,0,0,4,0,0,0,55,0,0,0,127,0,0,0,122,0,0,0,120,0,0,0,98,0,0,0,52,0,0,0,48,0,0,0,54,0,0,0,124,0,0,0,25,0,0,0,84,0,0,0,80,0,0,0,115,0,0,0,81,0,0,0,119,0,0,0,5,0,0,0,30,0,0,0,36,0,0,0,59,0,0,0,126,0,0,0,38,0,0,0,49,0,0,0,91,0,0,0,6,0,0,0,129,0,0,0,79,0,0,0,137,0,0,0,7,0,0,0,35,0,0,0,100,0,0,0,131,0,0,0,19,0,0,0,33,0,0,0,46,0,0,0,47,0,0,0,8,0,0,0,29,0,0,0,146,0,0,0,63,0,0,0,86,0,0,0,71,0,0,0,45,0,0,0,142,0,0,0,9,0,0,0,77,0,0,0,82,0,0,0,64,0,0,0,133,0,0,0,10,0,0,0,66,0,0,0,39,0,0,0,11,0,0,0,103,0,0,0,12,0,0,0,75,0,0,0,134,0,0,0,13,0,0,0,53,0,0,0,62,0,0,0,109,0,0,0,117,0,0,0,23,0,0,0,108,0,0,0,92,0,0,0,67,0,0,0,93,0,0,0,43,0,0,0,121,0,0,0,15,0,0,0,68,0,0,0,14,0,0,0,16,0,0,0,76,0,0,0,87,0,0,0,118,0,0,0,17,0,0,0,78,0,0,0,143,0,0,0,114,0,0,0,110,0,0,0,69,0,0,0,21,0,0,0,111,0,0,0,95,0,0,0,105,0,0,0,42,0,0,0,37,0,0,0,24,0,0,0,56,0,0,0,44,0,0,0,101,0,0,0,83,0,0,0,94,0,0,0,106,0,0,0,147,0,0,0,113,0,0,0,18,0,0,0,51,0,0,0,130,0,0,0,144,0,0,0,60,0,0,0,70,0,0,0,31,0,0,0,72,0,0,0,27,0,0,0,28,0,0,0,121,207,23,190,138,59,1,66,164,51,148,67,155,200,92,68,202,167,45,70,175,40,132,68,192,222,152,67,129,155,246,65,199,156,118,64,77,183,109,66,194,101,49,68,74,15,165,69,82,45,182,197,71,104,76,196,73,213,153,194,66,4,147,192,94,6,104,63,54,189,72,62,3,97,30,190,44,76,9,66,68,231,150,67,96,102,76,68,47,215,52,70,17,168,147,68,117,204,160,67,46,219,249,65,68,124,109,64,146,154,86,66,183,10,43,68,136,68,163,69,35,243,198,197,129,62,99,196,80,169,179,194,43,42,173,192,1,24,82,63,194,197,199,62,223,144,36,190,144,150,16,66,32,15,152,67,140,47,55,68,113,86,59,70,101,128,162,68,120,164,167,67,193,231,251,65,149,237,87,64,209,237,60,66,46,47,35,68,80,99,160,69,178,232,215,197,240,127,122,196,100,62,207,194,121,91,195,192,207,220,61,63,49,160,20,63,61,91,42,190,177,1,23,66,106,129,151,67,98,254,28,68,14,27,65,70,229,136,176,68,246,95,173,67,75,201,252,65,52,59,74,64,173,80,34,66,178,10,26,68,170,126,156,69,83,240,232,197,121,249,136,196,253,124,236,194,231,48,218,192,193,13,43,63,21,239,67,63,139,188,47,190,75,118,28,66,177,43,149,67,81,195,251,67,92,30,70,70,161,146,189,68,23,254,177,67,116,41,251,65,165,166,58,64,77,48,7,66,62,185,15,68,225,169,151,69,144,236,249,197,102,184,148,196,253,164,5,195,130,12,247,192,196,112,25,63,234,90,113,63,120,177,52,190,11,224,32,66,197,255,144,67,75,169,179,67,9,89,74,70,63,131,201,68,227,108,181,67,12,94,248,65,73,159,52,64,49,233,215,65,148,121,4,68,250,250,145,69,153,95,5,198,224,82,160,196,230,149,21,195,193,75,10,193,185,213,8,63,218,57,142,63,244,54,185,190,93,45,36,66,238,197,138,67,123,163,67,67,193,197,77,70,150,52,212,68,118,180,183,67,208,116,244,65,169,3,34,64,173,143,160,65,68,192,240,67,195,135,139,69,122,165,13,198,28,180,171,196,130,42,38,195,136,83,25,193,112,40,242,62,153,103,162,63,55,74,189,190,167,146,37,66,148,165,130,67,182,247,78,65,135,96,80,70,71,144,221,68,247,225,184,67,182,2,238,65,153,191,25,64,113,224,84,65,226,71,215,67,116,104,132,69,186,183,21,198,32,182,182,196,153,32,55,195,248,124,43,193,205,19,212,62,243,4,181,63,187,232,192,190,91,122,38,66,227,13,113,67,88,242,59,195,65,40,82,70,237,132,229,68,213,190,184,67,201,3,232,65,16,147,4,64,105,242,216,64,110,227,188,67,47,102,121,69,214,134,29,198,81,62,193,196,85,96,72,195,235,212,61,193,80,50,183,62,3,228,197,63,71,16,196,190,73,155,36,66,18,122,88,67,23,20,203,195,140,28,83,70,216,249,235,68,185,166,183,67,247,22,225,65,11,250,244,63,71,16,196,62,69,237,161,67,91,2,105,69,239,4,37,198,124,38,203,196,16,160,89,195,54,63,80,193,66,80,155,62,49,219,212,63,46,15,21,191,242,108,33,66,98,51,60,67,83,17,32,196,220,60,83,70,70,243,240,68,238,104,181,67,38,192,215,65,112,137,223,63,88,12,180,192,157,166,134,67,47,214,87,69,149,32,44,198,6,85,212,196,16,196,106,195,193,157,98,193,212,63,128,62,152,197,225,63,57,182,22,191,234,239,28,66,206,194,27,67,244,79,94,196,226,141,82,70,182,97,244,68,249,56,178,67,221,40,207,65,124,229,200,63,57,233,50,193,16,207,86,67,160,18,70,69,73,205,50,198,21,165,220,196,104,176,123,195,1,246,119,193,175,175,75,62,94,131,236,63,230,143,74,191,36,147,21,66,35,102,239,66,16,227,143,196,201,17,81,70,166,76,246,68,130,2,174,67,22,218,197,65,28,72,177,63,12,95,131,193,224,12,33,67,81,229,51,69,247,251,56,198,140,255,227,196,139,36,134,195,184,137,134,193,100,229,23,62,11,250,244,63,223,202,75,191,201,237,12,66,223,9,160,66,174,0,178,196,45,207,78,70,187,185,246,68,213,254,168,67,51,80,186,65,197,91,178,63,32,204,168,193,139,247,216,66,54,123,33,69,232,158,62,198,230,72,234,196,148,31,142,195,218,232,144,193,220,181,201,61,190,20,251,63,15,177,127,191,152,64,2,66,94,213,19,66,106,66,213,196,38,205,75,70,66,172,245,68,70,55,163,67,112,102,177,65,251,108,153,63,81,248,202,193,231,35,102,66,180,6,15,69,179,170,67,198,226,90,239,196,151,161,149,195,66,6,155,193,60,57,73,61,109,196,254,63,54,211,37,70,68,177,165,69,175,113,104,68,69,51,54,68,128,12,144,67,180,213,129,66,2,0,241,65,34,63,131,64,49,19,72,70,167,49,243,68,86,182,156,67,170,105,166,65,251,100,249,68,112,3,16,65,17,158,233,193,0,0,0,0,0,0,0,0,128,1,0,0,128,4,0,0,128,4,0,0,0,0,0,0,128,1,0,0,128,4,0,0,64,2,0,0,0,0,0,0,193,192,0,0,129,193,0,0,64,1,0,0,1,195,0,0,192,3,0,0,128,2,0,0,65,194,0,0,1,198,0,0,192,6,0,0,128,7,0,0,65,199,0,0,0,5,0,0,193,197,0,0,129,196,0,0,64,4,0,0,1,204,0,0,192,12,0,0,128,13,0,0,65,205,0,0,0,15,0,0,193,207,0,0,129,206,0,0,64,14,0,0,0,10,0,0,193,202,0,0,129,203,0,0,64,11,0,0,1,201,0,0,192,9,0,0,128,8,0,0,65,200,0,0,1,216,0,0,192,24,0,0,128,25,0,0,65,217,0,0,0,27,0,0,193,219,0,0,129,218,0,0,64,26,0,0,0,30,0,0,193,222,0,0,129,223,0,0,64,31,0,0,1,221,0,0,192,29,0,0,128,28,0,0,65,220,0,0,0,20,0,0,193,212,0,0,129,213,0,0,64,21,0,0,1,215,0,0,192,23,0,0,128,22,0,0,65,214,0,0,1,210,0,0,192,18,0,0,128,19,0,0,65,211,0,0,0,17,0,0,193,209,0,0,129,208,0,0,64,16,0,0,1,240,0,0,192,48,0,0,128,49,0,0,65,241,0,0,0,51,0,0,193,243,0,0,129,242,0,0,64,50,0,0,0,54,0,0,193,246,0,0,129,247,0,0,64,55,0,0,1,245,0,0,192,53,0,0,128,52,0,0,65,244,0,0,0,60,0,0,193,252,0,0,129,253,0,0,64,61,0,0,1,255,0,0,192,63,0,0,128,62,0,0,65,254,0,0,1,250,0,0,192,58,0,0,128,59,0,0,65,251,0,0,0,57,0,0,193,249,0,0,129,248,0,0,64,56,0,0,0,40,0,0,193,232,0,0,129,233,0,0,64,41,0,0,1,235,0,0,192,43,0,0,128,42,0,0,65,234,0,0,1,238,0,0,192,46,0,0,128,47,0,0,65,239,0,0,0,45,0,0,193,237,0,0,129,236,0,0,64,44,0,0,1,228,0,0,192,36,0,0,128,37,0,0,65,229,0,0,0,39,0,0,193,231,0,0,129,230,0,0,64,38,0,0,0,34,0,0,193,226,0,0,129,227,0,0,64,35,0,0,1,225,0,0,192,33,0,0,128,32,0,0,65,224,0,0,1,160,0,0,192,96,0,0,128,97,0,0,65,161,0,0,0,99,0,0,193,163,0,0,129,162,0,0,64,98,0,0,0,102,0,0,193,166,0,0,129,167,0,0,64,103,0,0,1,165,0,0,192,101,0,0,128,100,0,0,65,164,0,0,0,108,0,0,193,172,0,0,129,173,0,0,64,109,0,0,1,175,0,0,192,111,0,0,128,110,0,0,65,174,0,0,1,170,0,0,192,106,0,0,128,107,0,0,65,171,0,0,0,105,0,0,193,169,0,0,129,168,0,0,64,104,0,0,0,120,0,0,193,184,0,0,129,185,0,0,64,121,0,0,1,187,0,0,192,123,0,0,128,122,0,0,65,186,0,0,1,190,0,0,192,126,0,0,128,127,0,0,65,191,0,0,0,125,0,0,193,189,0,0,129,188,0,0,64,124,0,0,1,180,0,0,192,116,0,0,128,117,0,0,65,181,0,0,0,119,0,0,193,183,0,0,129,182,0,0,64,118,0,0,0,114,0,0,193,178,0,0,129,179,0,0,64,115,0,0,1,177,0,0,192,113,0,0,128,112,0,0,65,176,0,0,0,80,0,0,193,144,0,0,129,145,0,0,64,81,0,0,1,147,0,0,192,83,0,0,128,82,0,0,65,146,0,0,1,150,0,0,192,86,0,0,128,87,0,0,65,151,0,0,0,85,0,0,193,149,0,0,129,148,0,0,64,84,0,0,1,156,0,0,192,92,0,0,128,93,0,0,65,157,0,0,0,95,0,0,193,159,0,0,129,158,0,0,64,94,0,0,0,90,0,0,193,154,0,0,129,155,0,0,64,91,0,0,1,153,0,0,192,89,0,0,128,88,0,0,65,152,0,0,1,136,0,0,192,72,0,0,128,73,0,0,65,137,0,0,0,75,0,0,193,139,0,0,129,138,0,0,64,74,0,0,0,78,0,0,193,142,0,0,129,143,0,0,64,79,0,0,1,141,0,0,192,77,0,0,128,76,0,0,65,140,0,0,0,68,0,0,193,132,0,0,129,133,0,0,64,69,0,0,1,135,0,0,192,71,0,0,128,70,0,0,65,134,0,0,1,130,0,0,192,66,0,0,128,67,0,0,65,131,0,0,0,65,0,0,193,129,0,0,129,128,0,0,64,64,0,0,34,0,0,0,40,0,0,0,10,0,0,0,10,0,0,0,12,0,0,0,12,0,0,0,12,0,0,0,12,0,0,0,12,0,0,0,12,0,0,0,12,0,0,0,12,0,0,0,12,0,0,0,12,0,0,0,12,0,0,0,12,0,0,0,94,131,108,63,21,239,195,62,109,196,126,63,54,189,200,61,67,236,127,63,176,10,201,60,196,254,127,63,136,15,201,59,0,0,0,0,8,0,0,0,16,0,0,0,24,0,0,0,32,0,0,0,40,0,0,0,48,0,0,0,56,0,0,0,64,0,0,0,80,0,0,0,96,0,0,0,112,0,0,0,128,0,0,0,144,0,0,0,160,0,0,0,255,255,255,255,0,0,0,0,32,0,0,0,40,0,0,0,48,0,0,0,56,0,0,0,64,0,0,0,80,0,0,0,96,0,0,0,112,0,0,0,128,0,0,0,160,0,0,0,192,0,0,0,224,0,0,0,0,1,0,0,64,1,0,0,255,255,255,255,0,0,0,0,8,0,0,0,16,0,0,0,24,0,0,0,32,0,0,0,40,0,0,0,48,0,0,0,56,0,0,0,64,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,8,0,0,0,9,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,51,51,211,64,0,0,17,67,51,51,115,63,0,0,0,0,0,0,240,193,0,0,48,65,82,73,157,58,1,0,0,0,16,0,0,0,9,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,51,51,211,64,0,0,17,67,51,51,115,63,0,0,0,0,0,0,200,193,0,0,48,65,111,18,131,58,1,0,0,0,24,0,0,0,9,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,51,51,211,64,0,0,17,67,51,51,115,63,0,0,0,0,0,0,160,193,0,0,48,65,111,18,131,58,1,0,0,0,32,0,0,0,9,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,51,51,211,64,0,0,17,67,51,51,115,63,0,0,0,0,0,0,112,193,0,0,48,65,111,18,131,58,1,0,0,0,40,0,0,0,9,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,51,51,211,64,0,0,17,67,51,51,115,63,0,0,0,0,0,0,32,193,0,0,48,65,250,237,107,58,1,0,0,0,48,0,0,0,9,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,51,51,211,64,0,0,17,67,51,51,115,63,0,0,0,0,0,0,32,193,0,0,48,65,250,237,107,58,1,0,0,0,56,0,0,0,9,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,51,51,211,64,0,0,17,67,51,51,115,63,0,0,0,0,0,0,192,192,0,0,48,65,23,183,81,58,1,0,0,0,64,0,0,0,9,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,51,51,211,64,0,0,17,67,51,51,115,63,0,0,0,0,0,0,0,192,0,0,48,65,23,183,81,58,1,0,0,0,80,0,0,0,9,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,51,51,211,64,0,0,17,67,51,51,115,63,0,0,0,0,0,0,0,0,0,0,0,65,52,128,55,58,1,0,0,0,96,0,0,0,9,0,0,0,9,0,0,0,0,0,0,0,0,0,32,64,51,51,211,64,0,0,17,67,51,51,115,63,0,0,0,0,0,0,128,63,0,0,176,64,82,73,29,58,1,0,0,0,112,0,0,0,9,0,0,0,9,0,0,0,0,0,0,0,0,0,16,64,51,51,211,64,0,0,17,67,51,51,115,63,0,0,0,0,0,0,0,64,0,0,144,64,111,18,3,58,1,0,0,0,128,0,0,0,9,0,0,0,9,0,0,0,0,0,0,0,154,153,249,63,205,204,204,64,0,0,12,67,51,51,115,63,0,0,0,0,0,0,64,64,0,0,128,64,23,183,81,57,1,0,0,0,160,0,0,0,9,0,0,0,9,0,0,0,1,0,0,0,184,30,229,63,0,0,192,64,0,0,7,67,51,51,115,63,0,0,0,192,0,0,160,64,0,0,96,64,0,0,0,0,1,0,0,0,192,0,0,0,9,0,0,0,9,0,0,0,1,0,0,0,82,184,190,63,51,51,179,64,0,0,250,66,236,81,120,63,0,0,128,192,0,0,224,64,0,0,64,64,0,0,0,0,0,0,0,0,224,0,0,0,9,0,0,0,9,0,0,0,1,0,0,0,0,0,160,63,102,102,166,64,0,0,250,66,72,225,122,63,0,0,192,192,0,0,16,65,0,0,0,64,0,0,0,0,0,0,0,0,0,1,0,0,9,0,0,0,9,0,0,0,1,0,0,0,236,81,120,63,102,102,166,64,0,0,250,66,0,0,128,63,0,0,0,193,0,0,32,65,0,0,128,63,0,0,0,0,0,0,0,0,64,1,0,0,9,0,0,0,9,0,0,0,1,0,0,0,102,102,102,63,102,102,166,64,0,0,250,66,0,0,128,63,0,0,32,193,0,0,64,65,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,97,109,98,105,103,117,111,117,115,32,111,112,116,105,111,110,32,45,45,32,37,46,42,115,0,0,0,0,0,0,0,0,67,101,108,116,105,99,0,0,82,101,118,105,118,97,108,0,76,97,116,105,110,0,0,0,66,101,98,111,98,0,0,0,70,97,115,116,32,70,117,115,105,111,110,0,0,0,0,0,37,115,58,32,0,0,0,0,83,119,105,110,103,0,0,0,78,97,116,105,111,110,97,108,32,70,111,108,107,0,0,0,87,97,114,110,105,110,103,58,32,104,105,103,104,112,97,115,115,32,102,105,108,116,101,114,32,100,105,115,97,98,108,101,100,46,32,32,104,105,103,104,112,97,115,115,32,102,114,101,113,117,101,110,99,121,32,116,111,111,32,115,109,97,108,108,10,0,0,0,0,0,0,0,70,111,108,107,45,82,111,99,107,0,0,0,0,0,0,0,69,114,114,111,114,58,32,99,97,110,39,116,32,97,108,108,111,99,97,116,101,32,105,110,95,98,117,102,102,101,114,32,98,117,102,102,101,114,10,0,70,111,108,107,0,0,0,0,69,114,114,111,114,58,32,99,111,117,108,100,32,110,111,116,32,117,112,100,97,116,101,32,76,65,77,69,32,116,97,103,44,32,102,105,108,101,32,110,111,116,32,114,101,97,100,97,98,108,101,46,10,0,0,0,72,97,114,100,32,82,111,99,107,0,0,0,0,0,0,0,76,65,77,69,32,37,115,32,118,101,114,115,105,111,110,32,37,115,32,40,37,115,41,0,69,114,114,111,114,58,32,99,111,117,108,100,32,110,111,116,32,117,112,100,97,116,101,32,76,65,77,69,32,116,97,103,44,32,102,105,108,101,32,110,111,116,32,115,101,101,107,97,98,108,101,46,10,0,0,0,82,111,99,107,32,38,32,82,111,108,108,0,0,0,0,0,69,114,114,111,114,58,32,99,111,117,108,100,32,110,111,116,32,117,112,100,97,116,101,32,76,65,77,69,32,116,97,103,46,10,0,0,0,0,0,0,77,117,115,105,99,97,108,0,10,0,0,0,0,0,0,0,82,101,116,114,111,0,0,0,9,105,110,116,101,114,99,104,97,110,110,101,108,32,109,97,115,107,105,110,103,32,114,97,116,105,111,58,32,37,103,10,0,0,0,0,0,0,0,0,80,111,108,107,97,0,0,0,9,117,115,105,110,103,32,116,101,109,112,111,114,97,108,32,109,97,115,107,105,110,103,32,101,102,102,101,99,116,58,32,37,115,10,0,0,0,0,0,65,99,105,100,32,74,97,122,122,0,0,0,0,0,0,0,110,111,0,0,0,0,0,0,65,99,105,100,32,80,117,110,107,0,0,0,0,0,0,0,121,101,115,0,0,0,0,0,84,114,105,98,97,108,0,0,9,32,32,32,97,100,106,117,115,116,32,109,97,115,107,105,110,103,32,98,97,115,115,61,37,103,32,100,66,44,32,97,108,116,111,61,37,103,32,100,66,44,32,116,114,101,98,108,101,61,37,103,32,100,66,44,32,115,102,98,50,49,61,37,103,32,100,66,10,0,0,0,76,111,45,70,105,0,0,0,9,101,120,112,101,114,105,109,101,110,116,97,108,32,112,115,121,32,116,117,110,105,110,103,115,32,98,121,32,78,97,111,107,105,32,83,104,105,98,97,116,97,10,0,0,0,0,0,84,114,97,105,108,101,114,0,9,32,94,32,97,100,106,117,115,116,32,115,101,110,115,105,116,105,118,105,116,121,32,112,111,119,101,114,58,32,37,102,10,0,0,0,0,0,0,0,83,104,111,119,116,117,110,101,115,0,0,0,0,0,0,0,37,108,117,0,0,0,0,0,9,32,94,32,97,100,106,117,115,116,32,116,121,112,101,58,32,37,100,10,0,0,0,0,82,97,118,101,0,0,0,0,9,32,94,32,108,101,118,101,108,32,97,100,106,117,115,116,101,109,101,110,116,58,32,37,103,32,100,66,10,0,0,0,80,115,121,99,104,101,100,101,108,105,99,0,0,0,0,0,32,40,111,110,108,121,32,102,111,114,32,116,121,112,101,32,52,41,0,0,0,0,0,0,78,101,119,32,87,97,118,101,0,0,0,0,0,0,0,0,9,32,94,32,115,104,97,112,101,58,32,37,103,37,115,10,0,0,0,0,0,0,0,0,67,97,98,97,114,101,116,0,9,32,94,32,116,121,112,101,58,32,37,100,10,0,0,0,78,97,116,105,118,101,32,85,83,0,0,0,0,0,0,0,9,65,84,72,58,32,37,115,10,0,0,0,0,0,0,0,74,117,110,103,108,101,0,0,110,111,116,32,117,115,101,100,0,0,0,0,0,0,0,0,80,111,112,47,70,117,110,107,0,0,0,0,0,0,0,0,116,104,101,32,111,110,108,121,32,109,97,115,107,105,110,103,0,0,0,0,0,0,0,0,67,104,114,105,115,116,105,97,110,32,82,97,112,0,0,0,37,100,0,0,0,0,0,0,51,68,78,111,119,33,0,0,116,104,101,32,111,110,108,121,32,109,97,115,107,105,110,103,32,102,111,114,32,115,104,111,114,116,32,98,108,111,99,107,115,0,0,0,0,0,0,0,84,111,112,32,52,48,0,0,117,115,105,110,103,0,0,0,71,97,110,103,115,116,97,0,69,114,114,111,114,58,32,77,65,88,95,72,69,65,68,69,82,95,66,85,70,32,116,111,111,32,115,109,97,108,108,32,105,110,32,98,105,116,115,116,114,101,97,109,46,99,32,10,0,0,0,0,0,0,0,0,9,32,94,32,115,116,111,112,112,105,110,103,58,32,37,100,10,0,0,0,0,0,0,0,67,117,108,116,0,0,0,0,9,32,94,32,97,109,112,108,105,102,105,99,97,116,105,111,110,58,32,37,100,10,0,0,67,111,109,101,100,121,0,0,9,110,111,105,115,101,32,115,104,97,112,105,110,103,58,32,37,100,10,0,0,0,0,0,83,111,117,116,104,101,114,110,32,82,111,99,107,0,0,0,9,32,94,32,99,111,109,112,97,114,105,115,111,110,32,115,104,111,114,116,32,98,108,111,99,107,115,58,32,37,100,10,0,0,0,0,0,0,0,0,68,114,101,97,109,0,0,0,9,113,117,97,110,116,105,122,97,116,105,111,110,32,99,111,109,112,97,114,105,115,111,110,58,32,37,100,10,0,0,0,69,117,114,111,100,97,110,99,101,0,0,0,0,0,0,0,51,50,98,105,116,115,0,0,9,97,100,106,117,115,116,32,109,97,115,107,105,110,103,32,115,104,111,114,116,58,32,37,103,32,100,66,10,0,0,0,80,111,112,45,70,111,108,107,0,0,0,0,0,0,0,0,9,97,100,106,117,115,116,32,109,97,115,107,105,110,103,58,32,37,103,32,100,66,10,0,69,108,101,99,116,114,111,110,105,99,0,0,0,0,0,0,9,115,117,98,98,108,111,99,107,32,103,97,105,110,58,32,37,100,10,0,0,0,0,0,84,101,99,104,110,111,45,73,110,100,117,115,116,114,105,97,108,0,0,0,0,0,0,0,105,109,97,103,101,47,103,105,102,0,0,0,0,0,0,0,9,117,115,105,110,103,32,115,104,111,114,116,32,98,108,111,99,107,115,58,32,37,115,10,0,0,0,0,0,0,0,0,68,97,114,107,119,97,118,101,0,0,0,0,0,0,0,0,102,111,114,99,101,100,0,0,71,111,116,104,105,99,0,0,32,49,37,37,32,32,98,117,103,32,105,110,32,76,65,77,69,32,101,110,99,111,100,105,110,103,32,108,105,98,114,97,114,121,0,0,0,0,0,0,100,105,115,112,101,110,115,101,100,0,0,0,0,0,0,0,69,116,104,110,105,99,0,0,99,104,97,110,110,101,108,32,99,111,117,112,108,101,100,0,73,110,115,116,114,117,109,101,110,116,97,108,32,82,111,99,107,0,0,0,0,0,0,0,97,108,108,111,119,101,100,0,73,110,115,116,114,117,109,101,110,116,97,108,32,80,111,112,0,0,0,0,0,0,0,0,10,112,115,121,99,104,111,97,99,111,117,115,116,105,99,58,10,10,0,0,0,0,0,0,77,101,100,105,116,97,116,105,118,101,0,0,0,0,0,0,9,117,115,105,110,103,32,76,65,77,69,32,84,97,103,10,0,0,0,0,0,0,0,0,83,112,97,99,101,0,0,0,80,79,83,73,88,76,89,95,67,79,82,82,69,67,84,0,9,32,63,63,32,111,111,112,115,44,32,115,111,109,101,32,110,101,119,32,111,110,101,32,63,63,32,10,0,0,0,0,80,117,110,107,0,0,0,0,9,118,97,114,105,97,98,108,101,32,98,105,116,114,97,116,101,32,45,32,86,66,82,32,109,116,114,104,32,37,115,10,0,0,0,0,0,0,0,0,83,111,117,108,0,0,0,0,9,118,97,114,105,97,98,108,101,32,98,105,116,114,97,116,101,32,45,32,86,66,82,32,109,116,32,37,115,10,0,0,66,97,115,115,0,0,0,0,105,109,97,103,101,47,112,110,103,0,0,0,0,0,0,0,9,118,97,114,105,97,98,108,101,32,98,105,116,114,97,116,101,32,45,32,86,66,82,32,114,104,32,37,115,10,0,0,65,108,116,101,114,110,97,116,105,118,101,32,82,111,99,107,0,0,0,0,0,0,0,0,9,118,97,114,105,97,98,108,101,32,98,105,116,114,97,116,101,32,45,32,65,66,82,32,37,115,10,0,0,0,0,0,78,111,105,115,101,0,0,0,32,57,37,37,32,32,89,111,117,114,32,115,121,115,116,101,109,32,105,115,32,111,118,101,114,99,108,111,99,107,101,100,0,0,0,0,0,0,0,0,9,99,111,110,115,116,97,110,116,32,98,105,116,114,97,116,101,32,45,32,67,66,82,32,37,115,10,0,0,0,0,0,71,111,115,112,101,108,0,0,40,102,114,101,101,32,102,111,114,109,97,116,41,0,0,0,83,111,117,110,100,32,67,108,105,112,0,0,0,0,0,0,40,100,101,102,97,117,108,116,41,0,0,0,0,0,0,0,71,97,109,101,0,0,0,0,9,112,97,100,100,105,110,103,58,32,37,115,10,0,0,0,72,111,117,115,101,0,0,0,109,97,120,32,115,121,115,116,101,109,32,98,121,116,101,115,32,61,32,37,49,48,108,117,10,0,0,0,0,0,0,0,97,108,108,0,0,0,0,0,65,99,105,100,0,0,0,0,104,116,116,112,58,47,47,108,97,109,101,46,115,102,46,110,101,116,0,0,0,0,0,0,111,102,102,0,0,0,0,0,51,46,57,57,46,53,0,0,73,110,115,116,114,117,109,101,110,116,97,108,0,0,0,0,73,78,84,69,82,78,65,76,32,69,82,82,79,82,32,73,78,32,86,66,82,32,78,69,87,32,67,79,68,69,32,40,49,51,49,51,41,44,32,112,108,101,97,115,101,32,115,101,110,100,32,98,117,103,32,114,101,112,111,114,116,10,109,97,120,98,105,116,115,61,37,100,32,117,115,101,100,98,105,116,115,61,37,100,10,0,0,0,9,37,100,32,99,104,97,110,110,101,108,32,45,32,37,115,10,0,0,0,0,0,0,0,67,108,97,115,115,105,99,97,108,0,0,0,0,0,0,0,117,110,107,110,111,119,110,32,40,101,114,114,111,114,41,0,84,114,97,110,99,101,0,0,44,32,0,0,0,0,0,0,105,109,97,103,101,47,106,112,101,103,0,0,0,0,0,0,110,111,116,32,115,101,116,32,40,101,114,114,111,114,41,0,70,117,115,105,111,110,0,0,109,111,110,111,0,0,0,0,74,97,122,122,43,70,117,110,107,0,0,0,0,0,0,0,57,48,37,37,32,32,76,65,77,69,32,99,111,109,112,105,108,101,100,32,119,105,116,104,32,98,117,103,103,121,32,118,101,114,115,105,111,110,32,111,102,32,103,99,99,32,117,115,105,110,103,32,97,100,118,97,110,99,101,100,32,111,112,116,105,109,105,122,97,116,105,111,110,115,0,0,0,0,0,0,100,117,97,108,32,99,104,97,110,110,101,108,0,0,0,0,86,111,99,97,108,0,0,0,115,116,101,114,101,111,0,0,84,114,105,112,45,72,111,112,0,0,0,0,0,0,0,0,106,111,105,110,116,32,115,116,101,114,101,111,0,0,0,0,65,109,98,105,101,110,116,0,9,77,80,69,71,45,37,115,32,76,97,121,101,114,32,51,10,0,0,0,0,0,0,0,69,117,114,111,45,84,101,99,104,110,111,0,0,0,0,0,63,0,0,0,0,0,0,0,83,111,117,110,100,116,114,97,99,107,0,0,0,0,0,0,115,116,100,58,58,98,97,100,95,97,108,108,111,99,0,0,49,46,48,0,0,0,0,0,50,0,0,0,0,0,0,0,80,114,97,110,107,115,0,0,49,0,0,0,0,0,0,0,68,101,97,116,104,32,77,101,116,97,108,0,0,0,0,0,50,46,53,0,0,0,0,0,83,107,97,0,0,0,0,0,10,115,116,114,101,97,109,32])
    .concat([102,111,114,109,97,116,58,10,10,0,0,0,0,0,0,0,65,108,116,101,114,110,97,116,105,118,101,0,0,0,0,0,9,46,46,46,10,0,0,0,73,110,100,117,115,116,114,105,97,108,0,0,0,0,0,0,84,104,105,115,32,105,115,32,97,32,102,97,116,97,108,32,101,114,114,111,114,46,32,32,73,116,32,104,97,115,32,115,101,118,101,114,97,108,32,112,111,115,115,105,98,108,101,32,99,97,117,115,101,115,58,0,9,101,120,112,101,114,105,109,101,110,116,97,108,32,89,61,37,100,10,0,0,0,0,0,84,101,99,104,110,111,0,0,9,104,117,102,102,109,97,110,32,115,101,97,114,99,104,58,32,37,115,10,0,0,0,0,82,111,99,107,0,0,0,0,98,101,115,116,32,40,105,110,115,105,100,101,32,108,111,111,112,44,32,115,108,111,119,41,0,0,0,0,0,0,0,0,82,101,103,103,97,101,0,0,73,78,84,69,82,78,65,76,32,69,82,82,79,82,32,73,78,32,86,66,82,32,78,69,87,32,67,79,68,69,44,32,112,108,101,97,115,101,32,115,101,110,100,32,98,117,103,32,114,101,112,111,114,116,10,0,98,101,115,116,32,40,111,117,116,115,105,100,101,32,108,111,111,112,41,0,0,0,0,0,82,97,112,0,0,0,0,0,110,111,114,109,97,108,0,0,82,38,66,0,0,0,0,0,105,110,32,117,115,101,32,98,121,116,101,115,32,32,32,32,32,61,32,37,49,48,108,117,10,0,0,0,0,0,0,0,76,65,77,69,51,46,57,57,114,0,0,0,0,0,0,0,80,111,112,0,0,0,0,0,9,99,104,49,32,40,114,105,103,104,116,41,32,115,99,97,108,105,110,103,58,32,37,103,10,0,0,0,0,0,0,0,98,105,116,32,114,101,115,101,114,118,111,105,114,32,101,114,114,111,114,58,32,10,108,51,95,115,105,100,101,45,62,109,97,105,110,95,100,97,116,97,95,98,101,103,105,110,58,32,37,105,32,10,82,101,115,118,111,105,114,32,115,105,122,101,58,32,32,32,32,32,32,32,32,32,32,32,32,32,37,105,32,10,114,101,115,118,32,100,114,97,105,110,32,40,112,111,115,116,41,32,32,32,32,32,32,32,32,32,37,105,32,10,114,101,115,118,32,100,114,97,105,110,32,40,112,114,101,41,32,32,32,32,32,32,32,32,32,32,37,105,32,10,104,101,97,100,101,114,32,97,110,100,32,115,105,100,101,105,110,102,111,58,32,32,32,32,32,32,37,105,32,10,100,97,116,97,32,98,105,116,115,58,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,37,105,32,10,116,111,116,97,108,32,98,105,116,115,58,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,37,105,32,40,114,101,109,97,105,110,100,101,114,58,32,37,105,41,32,10,98,105,116,115,112,101,114,102,114,97,109,101,58,32,32,32,32,32,32,32,32,32,32,32,32,32,37,105,32,10,0,0,37,115,58,32,0,0,0,0,9,99,104,48,32,40,108,101,102,116,41,32,115,99,97,108,105,110,103,58,32,37,103,10,0,0,0,0,0,0,0,0,79,116,104,101,114,0,0,0,9,115,99,97,108,105,110,103,58,32,37,103,10,0,0,0,37,115,10,0,0,0,0,0,79,108,100,105,101,115,0,0,88,88,88,0,0,0,0,0,10,109,105,115,99,58,10,10,0,0,0,0,0,0,0,0,37,115,10,0,0,0,0,0,78,101,119,32,65,103,101,0,77,101,116,97,108,0,0,0,115,116,114,97,110,103,101,32,101,114,114,111,114,32,102,108,117,115,104,105,110,103,32,98,117,102,102,101,114,32,46,46,46,32,10,0,0,0,0,0,87,97,114,110,105,110,103,58,32,109,97,110,121,32,100,101,99,111,100,101,114,115,32,99,97,110,110,111,116,32,104,97,110,100,108,101,32,102,114,101,101,32,102,111,114,109,97,116,32,98,105,116,114,97,116,101,115,32,62,51,50,48,32,107,98,112,115,32,40,115,101,101,32,100,111,99,117,109,101,110,116,97,116,105,111,110,41,10,0,0,0,0,0,0,0,0,74,97,122,122,0,0,0,0,37,115,58,32,0,0,0,0,87,97,114,110,105,110,103,58,32,109,97,110,121,32,100,101,99,111,100,101,114,115,32,99,97,110,110,111,116,32,104,97,110,100,108,101,32,102,114,101,101,32,102,111,114,109,97,116,32,98,105,116,115,116,114,101,97,109,115,10,0,0,0,0,72,105,112,45,72,111,112,0,112,111,108,121,112,104,97,115,101,32,108,111,119,112,97,115,115,32,102,105,108,116,101,114,32,100,105,115,97,98,108,101,100,10,0,0,0,0,0,0,71,114,117,110,103,101,0,0,85,115,105,110,103,32,112,111,108,121,112,104,97,115,101,32,108,111,119,112,97,115,115,32,102,105,108,116,101,114,44,32,116,114,97,110,115,105,116,105,111,110,32,98,97,110,100,58,32,37,53,46,48,102,32,72,122,32,45,32,37,53,46,48,102,32,72,122,10,0,0,0,70,117,110,107,0,0,0,0,76,65,77,69,32,37,115,32,37,115,32,40,37,115,41,10,0,0,0,0,0,0,0,0,83,121,110,116,104,80,111,112,0,0,0,0,0,0,0,0,74,80,111,112,0,0,0,0,65,110,105,109,101,0,0,0,84,104,114,97,115,104,32,77,101,116,97,108,0,0,0,0,37,115,58,32,0,0,0,0,83,97,108,115,97,0,0,0,77,101,114,101,110,103,117,101,0,0,0,0,0,0,0,0,67,104,114,105,115,116,105,97,110,32,82,111,99,107,0,0,85,115,105,110,103,32,112,111,108,121,112,104,97,115,101,32,104,105,103,104,112,97,115,115,32,102,105,108,116,101,114,44,32,116,114,97,110,115,105,116,105,111,110,32,98,97,110,100,58,32,37,53,46,48,102,32,72,122,32,45,32,37,53,46,48,102,32,72,122,10,0,0,67,111,110,116,101,109,112,111,114,97,114,121,32,67,104,114,105,115,116,105,97,110,0,0,67,114,111,115,115,111,118,101,114,0,0,0,0,0,0,0,68,105,115,99,111,0,0,0,66,108,97,99,107,32,77,101,116,97,108,0,0,0,0,0,72,101,97,118,121,32,77,101,116,97,108,0,0,0,0,0,67,104,114,105,115,116,105,97,110,32,71,97,110,103,115,116,97,0,0,0,0,0,0,0,66,101,97,116,0,0,0,0,115,121,115,116,101,109,32,98,121,116,101,115,32,32,32,32,32,61,32,37,49,48,108,117,10,0,0,0,0,0,0,0,80,111,108,115,107,32,80,117,110,107,0,0,0,0,0,0,98,97,100,95,97,114,114,97,121,95,110,101,119,95,108,101,110,103,116,104,0,0,0,0,76,65,77,69,51,46,57,57,114,53,0,0,0,0,0,0,78,101,103,101,114,112,117,110,107,0,0,0,0,0,0,0,73,78,84,69,82,78,65,76,32,69,82,82,79,82,32,73,78,32,86,66,82,32,78,69,87,32,67,79,68,69,32,40,57,56,54,41,44,32,112,108,101,97,115,101,32,115,101,110,100,32,98,117,103,32,114,101,112,111,114,116,10,0,0,0,66,114,105,116,80,111,112,0,73,110,100,105,101,0,0,0,82,101,115,97,109,112,108,105,110,103,58,32,32,105,110,112,117,116,32,37,103,32,107,72,122,32,32,111,117,116,112,117,116,32,37,103,32,107,72,122,10,0,0,0,0,0,0,0,84,101,114,114,111,114,0,0,72,97,114,100,99,111,114,101,0,0,0,0,0,0,0,0,68,97,110,99,101,0,0,0,67,108,117,98,45,72,111,117,115,101,0,0,0,0,0,0,68,114,117,109,32,38,32,66,97,115,115,0,0,0,0,0,71,111,97,0,0,0,0,0,68,97,110,99,101,32,72,97,108,108,0,0,0,0,0,0,69,117,114,111,45,72,111,117,115,101,0,0,0,0,0,0,65,32,67,97,112,112,101,108,108,97,0,0,0,0,0,0,68,114,117,109,32,83,111,108,111,0,0,0,0,0,0,0,67,111,117,110,116,114,121,0,80,117,110,107,32,82,111,99,107,0,0,0,0,0,0,0,65,117,116,111,99,111,110,118,101,114,116,105,110,103,32,102,114,111,109,32,115,116,101,114,101,111,32,116,111,32,109,111,110,111,46,32,83,101,116,116,105,110,103,32,101,110,99,111,100,105,110,103,32,116,111,32,109,111,110,111,32,109,111,100,101,46,10,0,0,0,0,0,68,117,101,116,0,0,0,0,70,114,101,101,115,116,121,108,101,0,0,0,0,0,0,0,73,110,116,101,114,110,97,108,32,98,117,102,102,101,114,32,105,110,99,111,110,115,105,115,116,101,110,99,121,46,32,102,108,117,115,104,98,105,116,115,32,60,62,32,82,101,115,118,83,105,122,101,0,0,0,0,82,104,121,116,104,109,105,99,32,83,111,117,108,0,0,0,80,111,119,101,114,32,66,97,108,108,97,100,0,0,0,0,66,97,108,108,97,100,0,0,70,111,108,107,108,111,114,101,0,0,0,0,0,0,0,0,83,97,109,98,97,0,0,0,84,97,110,103,111,0,0,0,67,108,117,98,0,0,0,0,83,108,111,119,32,74,97,109,0,0,0,0,0,0,0,0,67,80,85,32,102,101,97,116,117,114,101,115,58,32,37,115,10,0,0,0,0,0,0,0,83,97,116,105,114,101,0,0,80,111,114,110,32,71,114,111,111,118,101,0,0,0,0,0,67,108,97,115,115,105,99,32,82,111,99,107,0,0,0,0,58,32,0,0,0,0,0,0,80,114,105,109,117,115,0,0,66,111,111,116,121,32,66,97,115,115,0,0,0,0,0,0,83,121,109,112,104,111,110,121,0,0,0,0,0,0,0,0,83,111,110,97,116,97,0,0,67,104,97,109,98,101,114,32,77,117,115,105,99,0,0,0,79,112,101,114,97,0,0,0,67,104,97,110,115,111,110,0,83,112,101,101,99,104,0,0,71,73,70,56,0,0,0,0,66,108,117,101,115,0,0,0,83,83,69,50,0,0,0,0,72,117,109,111,117,114,0,0,58,32,0,0,0,0,0,0,65,99,111,117,115,116,105,99,0,0,0,0,0,0,0,0,80,78,71,0,0,0,0,0,69,97,115,121,32,76,105,115,116,101,110,105,110,103,0,0,67,104,111,114,117,115,0,0,66,105,103,32,66,97,110,100,0,0,0,0,0,0,0,0,83,108,111,119,32,82,111,99,107,0,0,0,0,0,0,0,83,121,109,112,104,111,110,105,99,32,82,111,99,107,0,0,80,115,121,99,104,101,100,101,108,105,99,32,82,111,99,107,0,0,0,0,0,0,0,0,80,114,111,103,114,101,115,115,105,118,101,32,82,111,99,107,0,0,0,0,0,0,0,0,71,111,116,104,105,99,32,82,111,99,107,0,0,0,0,0,65,118,97,110,116,103,97,114,100,101,0,0,0,0,0,0,66,108,117,101,103,114,97,115,115,0,0,0,0,0,0,0,76,65,77,69,32,118,101,114,115,105,111,110,32,37,115,32,40,37,115,41,0,0,0,0,73,68,51,0,0,0,0,0,69,114,114,111,114,58,32,99,97,110,39,116,32,97,108,108,111,99,97,116,101,32,86,98,114,70,114,97,109,101,115,32,98,117,102,102,101,114,10,0,0,0,0,0,160,90,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,90,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,83,116,57,101,120,99,101,112,116,105,111,110,0,0,0,0,83,116,57,98,97,100,95,97,108,108,111,99,0,0,0,0,83,116,50,48,98,97,100,95,97,114,114,97,121,95,110,101,119,95,108,101,110,103,116,104,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,90,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,90,0,0,0,0,0,0,0,16,0,0,0,16,0,0,0,16,0,0,0,16,0,0,1,5,3,2,4,0,3,0,221,1,30,61,115,47,118,192,47,250,176,188,158,20,250,64,153,188,161,186,158,119,53,193,81,220,194,184,116,225,80,65,83,153,135,188,1,154,68,193,129,18,177,60,29,186,23,65,225,231,169,188,42,236,187,192,86,189,194,59,84,76,48,64,23,210,72,59,21,174,94,191,117,48,252,56,166,136,14,62,45,12,61,59,187,242,93,61,21,159,94,192,66,120,238,188,39,159,203,64,116,13,11,188,159,194,8,193,122,116,11,188,136,161,23,65,15,206,8,188,48,10,13,193,54,239,183,60,24,84,219,64,42,177,212,188,119,161,140,192,227,27,133,60,46,141,12,64,204,220,29,187,91,68,64,191,179,14,221,59,38,166,6,62,18,27,246,186,98,72,30,62,88,65,24,192,146,25,191,189,204,80,54,64,198,233,127,189,83,84,41,192,195,60,177,60,160,42,15,64,141,230,100,189,27,243,213,191,107,217,67,61,72,195,128,63,221,177,17,59,30,72,235,190,198,2,2,61,96,182,39,62,140,213,99,188,41,29,78,189,32,117,213,59,250,86,192,60,8,103,16,188,195,30,155,62,254,109,206,191,55,145,103,190,17,54,138,63,79,222,175,189,44,92,131,190,5,120,6,61,113,172,38,190,93,7,22,188,128,210,103,190,162,171,193,188,106,76,200,62,186,131,191,187,206,177,98,190,217,136,128,61,99,84,56,61,14,238,10,183,195,81,164,60,229,233,6,59,220,52,70,59,209,172,241,188,164,63,172,62,202,209,191,191,12,238,130,190,224,157,95,63,198,63,242,189,120,245,249,61,39,37,244,61,171,200,78,191,74,115,160,189,61,4,245,62,155,0,154,187,253,11,255,189,221,42,193,187,240,154,38,189,226,118,106,61,225,172,170,61,116,82,8,60,208,143,45,189,111,248,133,188,144,228,243,60,148,49,144,188,83,247,229,62,31,210,32,191,69,246,18,190,75,222,151,62,236,79,105,190,172,192,190,190,13,131,104,188,76,24,12,59,175,11,39,61,83,49,215,190,21,234,253,189,13,83,99,62,22,214,39,61,196,1,201,59,137,153,214,61,247,48,138,61,143,176,152,188,61,242,108,61,134,205,2,189,7,1,4,61,132,146,177,59,35,242,16,63,249,36,134,191,99,48,65,191,195,71,149,62,202,81,38,62,41,63,137,190,8,118,43,62,71,89,6,60,108,141,65,190,36,174,230,62,232,94,158,62,59,32,169,190,83,31,141,190,179,5,138,61,91,28,212,59,139,246,67,189,211,25,177,61,92,87,134,60,98,50,27,189,45,15,148,60,22,191,192,187,190,188,20,63,131,166,2,191,181,32,8,191,54,36,163,190,218,83,18,190,249,108,79,190,122,105,51,62,249,208,22,62,32,205,194,60,1,112,199,62,138,81,31,62,88,186,110,190,236,195,129,190,127,224,86,189,85,103,133,60,212,73,205,188,47,187,141,61,242,19,200,60,237,111,24,189,6,255,148,60,149,162,245,187,69,87,9,63,94,65,128,190,239,223,215,190,42,39,221,190,85,217,52,187,98,70,12,189,146,207,46,61,213,159,63,189,79,51,209,189,227,53,135,62,214,104,21,62,42,194,26,62,27,131,201,188,75,199,51,190,101,108,229,189,100,191,64,190,139,76,38,189,16,94,96,61,204,36,68,61,80,177,64,61,130,177,181,188,0,0,0,0,98,120,124,63,40,114,252,191,98,120,252,191,59,253,120,63,98,120,124,63,19,41,124,63,180,33,252,191,19,41,252,191,229,96,120,63,19,41,124,63,66,185,122,63,86,171,250,191,66,185,250,191,92,142,117,63,66,185,122,63,120,174,121,63,129,154,249,191,120,174,249,191,222,132,115,63,120,174,121,63,91,33,121,63,194,9,249,191,91,33,249,191,234,113,114,63,91,33,121,63,110,236,118,63,58,195,246,191,110,236,246,191,69,43,110,63,110,236,118,63,141,200,117,63,87,148,245,191,141,200,245,191,134,249,107,63,141,200,117,63,202,100,117,63,133,44,245,191,202,100,245,191,31,58,107,63,202,100,117,63,138,43,114,63,214,203,241,191,138,43,242,191,124,22,101,63,138,43,114,63,0,0,0,0])
    , "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
    function runPostSets() {
    HEAP32[((9800 )>>2)]=((146720)|0);
    HEAP32[((12480 )>>2)]=((3696)|0);
    HEAP32[((12484 )>>2)]=((3688)|0);
    HEAP32[((12496 )>>2)]=((2896)|0);
    HEAP32[((12500 )>>2)]=((2880)|0);
    HEAP32[((12512 )>>2)]=((2760)|0);
    HEAP32[((12516 )>>2)]=((2744)|0);
    HEAP32[((12544 )>>2)]=((2712)|0);
    HEAP32[((12548 )>>2)]=((2696)|0);
    HEAP32[((12560 )>>2)]=((2664)|0);
    HEAP32[((12564 )>>2)]=((2648)|0);
    HEAP32[((12576 )>>2)]=((2576)|0);
    HEAP32[((12580 )>>2)]=((2536)|0);
    HEAP32[((12592 )>>2)]=((2464)|0);
    HEAP32[((12596 )>>2)]=((2424)|0);
    HEAP32[((12608 )>>2)]=((2352)|0);
    HEAP32[((12612 )>>2)]=((2312)|0);
    HEAP32[((12624 )>>2)]=((6712)|0);
    HEAP32[((12628 )>>2)]=((6648)|0);
    HEAP32[((12640 )>>2)]=((6520)|0);
    HEAP32[((12644 )>>2)]=((6456)|0);
    HEAP32[((12656 )>>2)]=((6328)|0);
    HEAP32[((12660 )>>2)]=((6264)|0);
    HEAP32[((12672 )>>2)]=((5752)|0);
    HEAP32[((12676 )>>2)]=((5496)|0);
    HEAP32[((12692 )>>2)]=((3960)|0);
    HEAP32[((12704 )>>2)]=((4984)|0);
    HEAP32[((12708 )>>2)]=((4728)|0);
    HEAP32[((12720 )>>2)]=((4216)|0);
    HEAP32[((12724 )>>2)]=((3704)|0);
    HEAP32[((12736 )>>2)]=((4216)|0);
    HEAP32[((12740 )>>2)]=((3704)|0);
    HEAP32[((12752 )>>2)]=((4216)|0);
    HEAP32[((12756 )>>2)]=((3704)|0);
    HEAP32[((12768 )>>2)]=((4216)|0);
    HEAP32[((12772 )>>2)]=((3704)|0);
    HEAP32[((12784 )>>2)]=((4216)|0);
    HEAP32[((12788 )>>2)]=((3704)|0);
    HEAP32[((12800 )>>2)]=((4216)|0);
    HEAP32[((12804 )>>2)]=((3704)|0);
    HEAP32[((12816 )>>2)]=((4216)|0);
    HEAP32[((12820 )>>2)]=((3704)|0);
    HEAP32[((12832 )>>2)]=((4216)|0);
    HEAP32[((12836 )>>2)]=((3704)|0);
    HEAP32[((12848 )>>2)]=((3176)|0);
    HEAP32[((12852 )>>2)]=((2920)|0);
    HEAP32[((12864 )>>2)]=((3176)|0);
    HEAP32[((12868 )>>2)]=((2920)|0);
    HEAP32[((12880 )>>2)]=((3176)|0);
    HEAP32[((12884 )>>2)]=((2920)|0);
    HEAP32[((12896 )>>2)]=((3176)|0);
    HEAP32[((12900 )>>2)]=((2920)|0);
    HEAP32[((12912 )>>2)]=((3176)|0);
    HEAP32[((12916 )>>2)]=((2920)|0);
    HEAP32[((12928 )>>2)]=((3176)|0);
    HEAP32[((12932 )>>2)]=((2920)|0);
    HEAP32[((12944 )>>2)]=((3176)|0);
    HEAP32[((12948 )>>2)]=((2920)|0);
    HEAP32[((12960 )>>2)]=((3176)|0);
    HEAP32[((12964 )>>2)]=((2920)|0);
    HEAP32[((12976 )>>2)]=((2848)|0);
    HEAP32[((12980 )>>2)]=((2832)|0);
    HEAP32[((12992 )>>2)]=((2800)|0);
    HEAP32[((12996 )>>2)]=((2784)|0);
    HEAP32[((13008 )>>2)]=((22768)|0);
    HEAP32[((13012 )>>2)]=((22648)|0);
    HEAP32[((13016 )>>2)]=((22328)|0);
    HEAP32[((13020 )>>2)]=((22216)|0);
    HEAP32[((13024 )>>2)]=((21888)|0);
    HEAP32[((13028 )>>2)]=((21648)|0);
    HEAP32[((13032 )>>2)]=((21568)|0);
    HEAP32[((13036 )>>2)]=((21520)|0);
    HEAP32[((13040 )>>2)]=((21440)|0);
    HEAP32[((13044 )>>2)]=((21296)|0);
    HEAP32[((13048 )>>2)]=((21288)|0);
    HEAP32[((13052 )>>2)]=((21248)|0);
    HEAP32[((13056 )>>2)]=((21216)|0);
    HEAP32[((13060 )>>2)]=((20856)|0);
    HEAP32[((13064 )>>2)]=((20800)|0);
    HEAP32[((13068 )>>2)]=((20784)|0);
    HEAP32[((13072 )>>2)]=((20696)|0);
    HEAP32[((13076 )>>2)]=((20656)|0);
    HEAP32[((13080 )>>2)]=((20624)|0);
    HEAP32[((13084 )>>2)]=((20528)|0);
    HEAP32[((13088 )>>2)]=((20504)|0);
    HEAP32[((13092 )>>2)]=((20472)|0);
    HEAP32[((13096 )>>2)]=((20448)|0);
    HEAP32[((13100 )>>2)]=((20432)|0);
    HEAP32[((13104 )>>2)]=((20384)|0);
    HEAP32[((13108 )>>2)]=((20360)|0);
    HEAP32[((13112 )>>2)]=((20328)|0);
    HEAP32[((13116 )>>2)]=((20296)|0);
    HEAP32[((13120 )>>2)]=((20280)|0);
    HEAP32[((13124 )>>2)]=((20168)|0);
    HEAP32[((13128 )>>2)]=((20152)|0);
    HEAP32[((13132 )>>2)]=((20104)|0);
    HEAP32[((13136 )>>2)]=((20072)|0);
    HEAP32[((13140 )>>2)]=((19944)|0);
    HEAP32[((13144 )>>2)]=((19896)|0);
    HEAP32[((13148 )>>2)]=((19848)|0);
    HEAP32[((13152 )>>2)]=((19824)|0);
    HEAP32[((13156 )>>2)]=((19792)|0);
    HEAP32[((13160 )>>2)]=((19768)|0);
    HEAP32[((13164 )>>2)]=((19688)|0);
    HEAP32[((13168 )>>2)]=((19632)|0);
    HEAP32[((13172 )>>2)]=((19576)|0);
    HEAP32[((13176 )>>2)]=((19536)|0);
    HEAP32[((13180 )>>2)]=((19488)|0);
    HEAP32[((13184 )>>2)]=((19432)|0);
    HEAP32[((13188 )>>2)]=((19392)|0);
    HEAP32[((13192 )>>2)]=((19344)|0);
    HEAP32[((13196 )>>2)]=((19312)|0);
    HEAP32[((13200 )>>2)]=((19288)|0);
    HEAP32[((13204 )>>2)]=((19224)|0);
    HEAP32[((13208 )>>2)]=((19200)|0);
    HEAP32[((13212 )>>2)]=((19128)|0);
    HEAP32[((13216 )>>2)]=((19088)|0);
    HEAP32[((13220 )>>2)]=((19048)|0);
    HEAP32[((13224 )>>2)]=((18992)|0);
    HEAP32[((13228 )>>2)]=((18952)|0);
    HEAP32[((13232 )>>2)]=((18896)|0);
    HEAP32[((13236 )>>2)]=((18864)|0);
    HEAP32[((13240 )>>2)]=((18832)|0);
    HEAP32[((13244 )>>2)]=((18744)|0);
    HEAP32[((13248 )>>2)]=((18728)|0);
    HEAP32[((13252 )>>2)]=((18656)|0);
    HEAP32[((13256 )>>2)]=((18616)|0);
    HEAP32[((13260 )>>2)]=((18592)|0);
    HEAP32[((13264 )>>2)]=((18560)|0);
    HEAP32[((13268 )>>2)]=((18536)|0);
    HEAP32[((13272 )>>2)]=((18496)|0);
    HEAP32[((13276 )>>2)]=((18456)|0);
    HEAP32[((13280 )>>2)]=((18416)|0);
    HEAP32[((13284 )>>2)]=((18368)|0);
    HEAP32[((13288 )>>2)]=((18320)|0);
    HEAP32[((13292 )>>2)]=((18264)|0);
    HEAP32[((13296 )>>2)]=((18184)|0);
    HEAP32[((13300 )>>2)]=((18160)|0);
    HEAP32[((13304 )>>2)]=((18136)|0);
    HEAP32[((13308 )>>2)]=((18088)|0);
    HEAP32[((13312 )>>2)]=((18040)|0);
    HEAP32[((13316 )>>2)]=((18024)|0);
    HEAP32[((13320 )>>2)]=((17968)|0);
    HEAP32[((13324 )>>2)]=((17872)|0);
    HEAP32[((13328 )>>2)]=((17808)|0);
    HEAP32[((13332 )>>2)]=((17752)|0);
    HEAP32[((13336 )>>2)]=((17664)|0);
    HEAP32[((13340 )>>2)]=((17656)|0);
    HEAP32[((13344 )>>2)]=((17632)|0);
    HEAP32[((13348 )>>2)]=((17624)|0);
    HEAP32[((13352 )>>2)]=((17616)|0);
    HEAP32[((13356 )>>2)]=((17608)|0);
    HEAP32[((13360 )>>2)]=((17600)|0);
    HEAP32[((13364 )>>2)]=((22976)|0);
    HEAP32[((13368 )>>2)]=((22960)|0);
    HEAP32[((13372 )>>2)]=((22944)|0);
    HEAP32[((13376 )>>2)]=((22920)|0);
    HEAP32[((13380 )>>2)]=((22896)|0);
    HEAP32[((13384 )>>2)]=((22880)|0);
    HEAP32[((13388 )>>2)]=((22864)|0);
    HEAP32[((13392 )>>2)]=((22848)|0);
    HEAP32[((13396 )>>2)]=((22840)|0);
    HEAP32[((13400 )>>2)]=((22824)|0);
    HEAP32[((13404 )>>2)]=((22800)|0);
    HEAP32[((13408 )>>2)]=((22784)|0);
    HEAP32[((13412 )>>2)]=((22752)|0);
    HEAP32[((13416 )>>2)]=((22744)|0);
    HEAP32[((13420 )>>2)]=((22736)|0);
    HEAP32[((13424 )>>2)]=((22720)|0);
    HEAP32[((13428 )>>2)]=((22712)|0);
    HEAP32[((13432 )>>2)]=((22696)|0);
    HEAP32[((13436 )>>2)]=((22680)|0);
    HEAP32[((13440 )>>2)]=((22672)|0);
    HEAP32[((13444 )>>2)]=((22632)|0);
    HEAP32[((13448 )>>2)]=((22624)|0);
    HEAP32[((13452 )>>2)]=((22584)|0);
    HEAP32[((13456 )>>2)]=((22576)|0);
    HEAP32[((13460 )>>2)]=((22568)|0);
    HEAP32[((13464 )>>2)]=((22560)|0);
    HEAP32[((13468 )>>2)]=((22544)|0);
    HEAP32[((13472 )>>2)]=((22536)|0);
    HEAP32[((13476 )>>2)]=((22520)|0);
    HEAP32[((13480 )>>2)]=((22504)|0);
    HEAP32[((13484 )>>2)]=((22432)|0);
    HEAP32[((13488 )>>2)]=((22424)|0);
    HEAP32[((13492 )>>2)]=((22336)|0);
    HEAP32[((13496 )>>2)]=((22312)|0);
    HEAP32[((13500 )>>2)]=((22296)|0);
    HEAP32[((13504 )>>2)]=((22280)|0);
    HEAP32[((13508 )>>2)]=((22264)|0);
    HEAP32[((13512 )>>2)]=((22256)|0);
    HEAP32[((13516 )>>2)]=((22240)|0);
    HEAP32[((13520 )>>2)]=((22224)|0);
    HEAP32[((13524 )>>2)]=((22200)|0);
    HEAP32[((13528 )>>2)]=((22192)|0);
    HEAP32[((13532 )>>2)]=((22136)|0);
    HEAP32[((13536 )>>2)]=((22128)|0);
    HEAP32[((13540 )>>2)]=((22048)|0);
    HEAP32[((13544 )>>2)]=((21992)|0);
    HEAP32[((13548 )>>2)]=((21952)|0);
    HEAP32[((13552 )>>2)]=((21928)|0);
    HEAP32[((13556 )>>2)]=((21912)|0);
    HEAP32[((13560 )>>2)]=((21896)|0);
    HEAP32[((13564 )>>2)]=((21872)|0);
    HEAP32[((13568 )>>2)]=((21848)|0);
    HEAP32[((13572 )>>2)]=((21760)|0);
    HEAP32[((13576 )>>2)]=((21744)|0);
    HEAP32[((13580 )>>2)]=((21736)|0);
    HEAP32[((13584 )>>2)]=((21712)|0);
    HEAP32[((13588 )>>2)]=((21704)|0);
    HEAP32[((13592 )>>2)]=((21696)|0);
    HEAP32[((13596 )>>2)]=((21680)|0);
    HEAP32[((23072 )>>2)]=(38);
    HEAP32[((23076 )>>2)]=(16);
    HEAP32[((23080 )>>2)]=(30);
    HEAP32[((23104 )>>2)]=(38);
    HEAP32[((23108 )>>2)]=(2);
    HEAP32[((23112 )>>2)]=(58);
    HEAP32[((23192 )>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
    HEAP32[((23196 )>>2)]=((23128)|0);
    HEAP32[((23200 )>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
    HEAP32[((23204 )>>2)]=((23144)|0);
    HEAP32[((23216 )>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
    HEAP32[((23220 )>>2)]=((23160)|0);
    }
    var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);
    assert(tempDoublePtr % 8 == 0);
    function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much
      HEAP8[tempDoublePtr] = HEAP8[ptr];
      HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
      HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
      HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
    }
    function copyTempDouble(ptr) {
      HEAP8[tempDoublePtr] = HEAP8[ptr];
      HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
      HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
      HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
      HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];
      HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];
      HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];
      HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];
    }
      function _memset(ptr, value, num) {
          ptr = ptr|0; value = value|0; num = num|0;
          var stop = 0, value4 = 0, stop4 = 0, unaligned = 0;
          stop = (ptr + num)|0;
          if ((num|0) >= 20) {
            // This is unaligned, but quite large, so work hard to get to aligned settings
            value = value & 0xff;
            unaligned = ptr & 3;
            value4 = value | (value << 8) | (value << 16) | (value << 24);
            stop4 = stop & ~3;
            if (unaligned) {
              unaligned = (ptr + 4 - unaligned)|0;
              while ((ptr|0) < (unaligned|0)) { // no need to check for stop, since we have large num
                HEAP8[(ptr)]=value;
                ptr = (ptr+1)|0;
              }
            }
            while ((ptr|0) < (stop4|0)) {
              HEAP32[((ptr)>>2)]=value4;
              ptr = (ptr+4)|0;
            }
          }
          while ((ptr|0) < (stop|0)) {
            HEAP8[(ptr)]=value;
            ptr = (ptr+1)|0;
          }
        }var _llvm_memset_p0i8_i32=_memset;
      function _memcpy(dest, src, num) {
          dest = dest|0; src = src|0; num = num|0;
          var ret = 0;
          ret = dest|0;
          if ((dest&3) == (src&3)) {
            while (dest & 3) {
              if ((num|0) == 0) return ret|0;
              HEAP8[(dest)]=HEAP8[(src)];
              dest = (dest+1)|0;
              src = (src+1)|0;
              num = (num-1)|0;
            }
            while ((num|0) >= 4) {
              HEAP32[((dest)>>2)]=HEAP32[((src)>>2)];
              dest = (dest+4)|0;
              src = (src+4)|0;
              num = (num-4)|0;
            }
          }
          while ((num|0) > 0) {
            HEAP8[(dest)]=HEAP8[(src)];
            dest = (dest+1)|0;
            src = (src+1)|0;
            num = (num-1)|0;
          }
          return ret|0;
        }var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
      var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};
      var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
      var ___errno_state=0;function ___setErrNo(value) {
          // For convenient setting and returning of errno.
          HEAP32[((___errno_state)>>2)]=value
          return value;
        }
      var VFS=undefined;
      var PATH={splitPath:function (filename) {
            var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
            return splitPathRe.exec(filename).slice(1);
          },normalizeArray:function (parts, allowAboveRoot) {
            // if the path tries to go above the root, `up` ends up > 0
            var up = 0;
            for (var i = parts.length - 1; i >= 0; i--) {
              var last = parts[i];
              if (last === '.') {
                parts.splice(i, 1);
              } else if (last === '..') {
                parts.splice(i, 1);
                up++;
              } else if (up) {
                parts.splice(i, 1);
                up--;
              }
            }
            // if the path is allowed to go above the root, restore leading ..s
            if (allowAboveRoot) {
              for (; up--; up) {
                parts.unshift('..');
              }
            }
            return parts;
          },normalize:function (path) {
            var isAbsolute = path.charAt(0) === '/',
                trailingSlash = path.substr(-1) === '/';
            // Normalize the path
            path = PATH.normalizeArray(path.split('/').filter(function(p) {
              return !!p;
            }), !isAbsolute).join('/');
            if (!path && !isAbsolute) {
              path = '.';
            }
            if (path && trailingSlash) {
              path += '/';
            }
            return (isAbsolute ? '/' : '') + path;
          },dirname:function (path) {
            var result = PATH.splitPath(path),
                root = result[0],
                dir = result[1];
            if (!root && !dir) {
              // No dirname whatsoever
              return '.';
            }
            if (dir) {
              // It has a dirname, strip trailing slash
              dir = dir.substr(0, dir.length - 1);
            }
            return root + dir;
          },basename:function (path, ext) {
            // EMSCRIPTEN return '/'' for '/', not an empty string
            if (path === '/') return '/';
            var f = PATH.splitPath(path)[2];
            if (ext && f.substr(-1 * ext.length) === ext) {
              f = f.substr(0, f.length - ext.length);
            }
            return f;
          },extname:function (path) {
            return PATH.splitPath(path)[3];
          },join:function () {
            var paths = Array.prototype.slice.call(arguments, 0);
            return PATH.normalize(paths.filter(function(p, index) {
              if (typeof p !== 'string') {
                throw new TypeError('Arguments to path.join must be strings');
              }
              return p;
            }).join('/'));
          },resolve:function () {
            var resolvedPath = '',
              resolvedAbsolute = false;
            for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
              var path = (i >= 0) ? arguments[i] : FS.cwd();
              // Skip empty and invalid entries
              if (typeof path !== 'string') {
                throw new TypeError('Arguments to path.resolve must be strings');
              } else if (!path) {
                continue;
              }
              resolvedPath = path + '/' + resolvedPath;
              resolvedAbsolute = path.charAt(0) === '/';
            }
            // At this point the path should be resolved to a full absolute path, but
            // handle relative paths to be safe (might happen when process.cwd() fails)
            resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
              return !!p;
            }), !resolvedAbsolute).join('/');
            return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
          },relative:function (from, to) {
            from = PATH.resolve(from).substr(1);
            to = PATH.resolve(to).substr(1);
            function trim(arr) {
              var start = 0;
              for (; start < arr.length; start++) {
                if (arr[start] !== '') break;
              }
              var end = arr.length - 1;
              for (; end >= 0; end--) {
                if (arr[end] !== '') break;
              }
              if (start > end) return [];
              return arr.slice(start, end - start + 1);
            }
            var fromParts = trim(from.split('/'));
            var toParts = trim(to.split('/'));
            var length = Math.min(fromParts.length, toParts.length);
            var samePartsLength = length;
            for (var i = 0; i < length; i++) {
              if (fromParts[i] !== toParts[i]) {
                samePartsLength = i;
                break;
              }
            }
            var outputParts = [];
            for (var i = samePartsLength; i < fromParts.length; i++) {
              outputParts.push('..');
            }
            outputParts = outputParts.concat(toParts.slice(samePartsLength));
            return outputParts.join('/');
          }};
      var TTY={ttys:[],init:function () {
            // https://github.com/kripken/emscripten/pull/1555
            // if (ENVIRONMENT_IS_NODE) {
            //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
            //   // device, it always assumes it's a TTY device. because of this, we're forcing
            //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
            //   // with text files until FS.init can be refactored.
            //   process['stdin']['setEncoding']('utf8');
            // }
          },shutdown:function () {
            // https://github.com/kripken/emscripten/pull/1555
            // if (ENVIRONMENT_IS_NODE) {
            //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
            //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
            //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
            //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
            //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
            //   process['stdin']['pause']();
            // }
          },register:function (dev, ops) {
            TTY.ttys[dev] = { input: [], output: [], ops: ops };
            FS.registerDevice(dev, TTY.stream_ops);
          },stream_ops:{open:function (stream) {
              var tty = TTY.ttys[stream.node.rdev];
              if (!tty) {
                throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
              }
              stream.tty = tty;
              stream.seekable = false;
            },close:function (stream) {
              // flush any pending line data
              if (stream.tty.output.length) {
                stream.tty.ops.put_char(stream.tty, 10);
              }
            },read:function (stream, buffer, offset, length, pos /* ignored */) {
              if (!stream.tty || !stream.tty.ops.get_char) {
                throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
              }
              var bytesRead = 0;
              for (var i = 0; i < length; i++) {
                var result;
                try {
                  result = stream.tty.ops.get_char(stream.tty);
                } catch (e) {
                  throw new FS.ErrnoError(ERRNO_CODES.EIO);
                }
                if (result === undefined && bytesRead === 0) {
                  throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
                }
                if (result === null || result === undefined) break;
                bytesRead++;
                buffer[offset+i] = result;
              }
              if (bytesRead) {
                stream.node.timestamp = Date.now();
              }
              return bytesRead;
            },write:function (stream, buffer, offset, length, pos) {
              if (!stream.tty || !stream.tty.ops.put_char) {
                throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
              }
              for (var i = 0; i < length; i++) {
                try {
                  stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
                } catch (e) {
                  throw new FS.ErrnoError(ERRNO_CODES.EIO);
                }
              }
              if (length) {
                stream.node.timestamp = Date.now();
              }
              return i;
            }},default_tty_ops:{get_char:function (tty) {
              if (!tty.input.length) {
                var result = null;
                if (ENVIRONMENT_IS_NODE) {
                  result = process['stdin']['read']();
                  if (!result) {
                    if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                      return null;  // EOF
                    }
                    return undefined;  // no data available
                  }
                } else if (typeof window != 'undefined' &&
                  typeof window.prompt == 'function') {
                  // Browser.
                  result = window.prompt('Input: ');  // returns null on cancel
                  if (result !== null) {
                    result += '\n';
                  }
                } else if (typeof readline == 'function') {
                  // Command line.
                  result = readline();
                  if (result !== null) {
                    result += '\n';
                  }
                }
                if (!result) {
                  return null;
                }
                tty.input = intArrayFromString(result, true);
              }
              return tty.input.shift();
            },put_char:function (tty, val) {
              if (val === null || val === 10) {
                Module['print'](tty.output.join(''));
                tty.output = [];
              } else {
                tty.output.push(TTY.utf8.processCChar(val));
              }
            }},default_tty1_ops:{put_char:function (tty, val) {
              if (val === null || val === 10) {
                Module['printErr'](tty.output.join(''));
                tty.output = [];
              } else {
                tty.output.push(TTY.utf8.processCChar(val));
              }
            }}};
      var MEMFS={CONTENT_OWNING:1,CONTENT_FLEXIBLE:2,CONTENT_FIXED:3,ensureFlexible:function (node) {
            if (node.contentMode !== MEMFS.CONTENT_FLEXIBLE) {
              var contents = node.contents;
              node.contents = Array.prototype.slice.call(contents);
              node.contentMode = MEMFS.CONTENT_FLEXIBLE;
            }
          },mount:function (mount) {
            return MEMFS.create_node(null, '/', 16384 | 0777, 0);
          },create_node:function (parent, name, mode, dev) {
            if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
              // no supported
              throw new FS.ErrnoError(ERRNO_CODES.EPERM);
            }
            var node = FS.createNode(parent, name, mode, dev);
            if (FS.isDir(node.mode)) {
              node.node_ops = {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              };
              node.stream_ops = {
                llseek: MEMFS.stream_ops.llseek
              };
              node.contents = {};
            } else if (FS.isFile(node.mode)) {
              node.node_ops = {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              };
              node.stream_ops = {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap
              };
              node.contents = [];
              node.contentMode = MEMFS.CONTENT_FLEXIBLE;
            } else if (FS.isLink(node.mode)) {
              node.node_ops = {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              };
              node.stream_ops = {};
            } else if (FS.isChrdev(node.mode)) {
              node.node_ops = {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              };
              node.stream_ops = FS.chrdev_stream_ops;
            }
            node.timestamp = Date.now();
            // add the new node to the parent
            if (parent) {
              parent.contents[name] = node;
            }
            return node;
          },node_ops:{getattr:function (node) {
              var attr = {};
              // device numbers reuse inode numbers.
              attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
              attr.ino = node.id;
              attr.mode = node.mode;
              attr.nlink = 1;
              attr.uid = 0;
              attr.gid = 0;
              attr.rdev = node.rdev;
              if (FS.isDir(node.mode)) {
                attr.size = 4096;
              } else if (FS.isFile(node.mode)) {
                attr.size = node.contents.length;
              } else if (FS.isLink(node.mode)) {
                attr.size = node.link.length;
              } else {
                attr.size = 0;
              }
              attr.atime = new Date(node.timestamp);
              attr.mtime = new Date(node.timestamp);
              attr.ctime = new Date(node.timestamp);
              // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
              //       but this is not required by the standard.
              attr.blksize = 4096;
              attr.blocks = Math.ceil(attr.size / attr.blksize);
              return attr;
            },setattr:function (node, attr) {
              if (attr.mode !== undefined) {
                node.mode = attr.mode;
              }
              if (attr.timestamp !== undefined) {
                node.timestamp = attr.timestamp;
              }
              if (attr.size !== undefined) {
                MEMFS.ensureFlexible(node);
                var contents = node.contents;
                if (attr.size < contents.length) contents.length = attr.size;
                else while (attr.size > contents.length) contents.push(0);
              }
            },lookup:function (parent, name) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
            },mknod:function (parent, name, mode, dev) {
              return MEMFS.create_node(parent, name, mode, dev);
            },rename:function (old_node, new_dir, new_name) {
              // if we're overwriting a directory at new_name, make sure it's empty.
              if (FS.isDir(old_node.mode)) {
                var new_node;
                try {
                  new_node = FS.lookupNode(new_dir, new_name);
                } catch (e) {
                }
                if (new_node) {
                  for (var i in new_node.contents) {
                    throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
                  }
                }
              }
              // do the internal rewiring
              delete old_node.parent.contents[old_node.name];
              old_node.name = new_name;
              new_dir.contents[new_name] = old_node;
            },unlink:function (parent, name) {
              delete parent.contents[name];
            },rmdir:function (parent, name) {
              var node = FS.lookupNode(parent, name);
              for (var i in node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
              delete parent.contents[name];
            },readdir:function (node) {
              var entries = ['.', '..']
              for (var key in node.contents) {
                if (!node.contents.hasOwnProperty(key)) {
                  continue;
                }
                entries.push(key);
              }
              return entries;
            },symlink:function (parent, newname, oldpath) {
              var node = MEMFS.create_node(parent, newname, 0777 | 40960, 0);
              node.link = oldpath;
              return node;
            },readlink:function (node) {
              if (!FS.isLink(node.mode)) {
                throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
              }
              return node.link;
            }},stream_ops:{read:function (stream, buffer, offset, length, position) {
              var contents = stream.node.contents;
              if (position >= contents.length)
                return 0;
              var size = Math.min(contents.length - position, length);
              assert(size >= 0);
              if (size > 8 && contents.subarray) { // non-trivial, and typed array
                buffer.set(contents.subarray(position, position + size), offset);
              } else
              {
                for (var i = 0; i < size; i++) {
                  buffer[offset + i] = contents[position + i];
                }
              }
              return size;
            },write:function (stream, buffer, offset, length, position, canOwn) {
              var node = stream.node;
              node.timestamp = Date.now();
              var contents = node.contents;
              if (length && contents.length === 0 && position === 0 && buffer.subarray) {
                // just replace it with the new data
                assert(buffer.length);
                if (canOwn && buffer.buffer === HEAP8.buffer && offset === 0) {
                  node.contents = buffer; // this is a subarray of the heap, and we can own it
                  node.contentMode = MEMFS.CONTENT_OWNING;
                } else {
                  node.contents = new Uint8Array(buffer.subarray(offset, offset+length));
                  node.contentMode = MEMFS.CONTENT_FIXED;
                }
                return length;
              }
              MEMFS.ensureFlexible(node);
              var contents = node.contents;
              while (contents.length < position) contents.push(0);
              for (var i = 0; i < length; i++) {
                contents[position + i] = buffer[offset + i];
              }
              return length;
            },llseek:function (stream, offset, whence) {
              var position = offset;
              if (whence === 1) {  // SEEK_CUR.
                position += stream.position;
              } else if (whence === 2) {  // SEEK_END.
                if (FS.isFile(stream.node.mode)) {
                  position += stream.node.contents.length;
                }
              }
              if (position < 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
              }
              stream.ungotten = [];
              stream.position = position;
              return position;
            },allocate:function (stream, offset, length) {
              MEMFS.ensureFlexible(stream.node);
              var contents = stream.node.contents;
              var limit = offset + length;
              while (limit > contents.length) contents.push(0);
            },mmap:function (stream, buffer, offset, length, position, prot, flags) {
              if (!FS.isFile(stream.node.mode)) {
                throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
              }
              var ptr;
              var allocated;
              var contents = stream.node.contents;
              // Only make a new copy when MAP_PRIVATE is specified.
              if ( !(flags & 2) &&
                    (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
                // We can't emulate MAP_SHARED when the file is not backed by the buffer
                // we're mapping to (e.g. the HEAP buffer).
                allocated = false;
                ptr = contents.byteOffset;
              } else {
                // Try to avoid unnecessary slices.
                if (position > 0 || position + length < contents.length) {
                  if (contents.subarray) {
                    contents = contents.subarray(position, position + length);
                  } else {
                    contents = Array.prototype.slice.call(contents, position, position + length);
                  }
                }
                allocated = true;
                ptr = _malloc(length);
                if (!ptr) {
                  throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
                }
                buffer.set(contents, ptr);
              }
              return { ptr: ptr, allocated: allocated };
            }}};
      var _stdin=allocate(1, "i32*", ALLOC_STATIC);
      var _stdout=allocate(1, "i32*", ALLOC_STATIC);
      var _stderr=allocate(1, "i32*", ALLOC_STATIC);
      function _fflush(stream) {
          // int fflush(FILE *stream);
          // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
          // we don't currently perform any user-space buffering of data
        }var FS={root:null,devices:[null],streams:[null],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:function ErrnoError(errno) {
              this.errno = errno;
              for (var key in ERRNO_CODES) {
                if (ERRNO_CODES[key] === errno) {
                  this.code = key;
                  break;
                }
              }
              this.message = ERRNO_MESSAGES[errno];
            },handleFSError:function (e) {
            if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + new Error().stack;
            return ___setErrNo(e.errno);
          },cwd:function () {
            return FS.currentPath;
          },lookupPath:function (path, opts) {
            path = PATH.resolve(FS.currentPath, path);
            opts = opts || { recurse_count: 0 };
            if (opts.recurse_count > 8) {  // max recursive lookup of 8
              throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
            }
            // split the path
            var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
              return !!p;
            }), false);
            // start at the root
            var current = FS.root;
            var current_path = '/';
            for (var i = 0; i < parts.length; i++) {
              var islast = (i === parts.length-1);
              if (islast && opts.parent) {
                // stop resolving
                break;
              }
              current = FS.lookupNode(current, parts[i]);
              current_path = PATH.join(current_path, parts[i]);
              // jump to the mount's root node if this is a mountpoint
              if (FS.isMountpoint(current)) {
                current = current.mount.root;
              }
              // follow symlinks
              // by default, lookupPath will not follow a symlink if it is the final path component.
              // setting opts.follow = true will override this behavior.
              if (!islast || opts.follow) {
                var count = 0;
                while (FS.isLink(current.mode)) {
                  var link = FS.readlink(current_path);
                  current_path = PATH.resolve(PATH.dirname(current_path), link);
                  var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
                  current = lookup.node;
                  if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                    throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
                  }
                }
              }
            }
            return { path: current_path, node: current };
          },getPath:function (node) {
            var path;
            while (true) {
              if (FS.isRoot(node)) {
                return path ? PATH.join(node.mount.mountpoint, path) : node.mount.mountpoint;
              }
              path = path ? PATH.join(node.name, path) : node.name;
              node = node.parent;
            }
          },hashName:function (parentid, name) {
            var hash = 0;
            for (var i = 0; i < name.length; i++) {
              hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
            }
            return ((parentid + hash) >>> 0) % FS.nameTable.length;
          },hashAddNode:function (node) {
            var hash = FS.hashName(node.parent.id, node.name);
            node.name_next = FS.nameTable[hash];
            FS.nameTable[hash] = node;
          },hashRemoveNode:function (node) {
            var hash = FS.hashName(node.parent.id, node.name);
            if (FS.nameTable[hash] === node) {
              FS.nameTable[hash] = node.name_next;
            } else {
              var current = FS.nameTable[hash];
              while (current) {
                if (current.name_next === node) {
                  current.name_next = node.name_next;
                  break;
                }
                current = current.name_next;
              }
            }
          },lookupNode:function (parent, name) {
            var err = FS.mayLookup(parent);
            if (err) {
              throw new FS.ErrnoError(err);
            }
            var hash = FS.hashName(parent.id, name);
            for (var node = FS.nameTable[hash]; node; node = node.name_next) {
              if (node.parent.id === parent.id && node.name === name) {
                return node;
              }
            }
            // if we failed to find it in the cache, call into the VFS
            return FS.lookup(parent, name);
          },createNode:function (parent, name, mode, rdev) {
            var node = {
              id: FS.nextInode++,
              name: name,
              mode: mode,
              node_ops: {},
              stream_ops: {},
              rdev: rdev,
              parent: null,
              mount: null
            };
            if (!parent) {
              parent = node;  // root node sets parent to itself
            }
            node.parent = parent;
            node.mount = parent.mount;
            // compatibility
            var readMode = 292 | 73;
            var writeMode = 146;
            // NOTE we must use Object.defineProperties instead of individual calls to
            // Object.defineProperty in order to make closure compiler happy
            Object.defineProperties(node, {
              read: {
                get: function() { return (node.mode & readMode) === readMode; },
                set: function(val) { val ? node.mode |= readMode : node.mode &= ~readMode; }
              },
              write: {
                get: function() { return (node.mode & writeMode) === writeMode; },
                set: function(val) { val ? node.mode |= writeMode : node.mode &= ~writeMode; }
              },
              isFolder: {
                get: function() { return FS.isDir(node.mode); },
              },
              isDevice: {
                get: function() { return FS.isChrdev(node.mode); },
              },
            });
            FS.hashAddNode(node);
            return node;
          },destroyNode:function (node) {
            FS.hashRemoveNode(node);
          },isRoot:function (node) {
            return node === node.parent;
          },isMountpoint:function (node) {
            return node.mounted;
          },isFile:function (mode) {
            return (mode & 61440) === 32768;
          },isDir:function (mode) {
            return (mode & 61440) === 16384;
          },isLink:function (mode) {
            return (mode & 61440) === 40960;
          },isChrdev:function (mode) {
            return (mode & 61440) === 8192;
          },isBlkdev:function (mode) {
            return (mode & 61440) === 24576;
          },isFIFO:function (mode) {
            return (mode & 61440) === 4096;
          },isSocket:function (mode) {
            return (mode & 49152) === 49152;
          },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
            var flags = FS.flagModes[str];
            if (typeof flags === 'undefined') {
              throw new Error('Unknown file open mode: ' + str);
            }
            return flags;
          },flagsToPermissionString:function (flag) {
            var accmode = flag & 2097155;
            var perms = ['r', 'w', 'rw'][accmode];
            if ((flag & 512)) {
              perms += 'w';
            }
            return perms;
          },nodePermissions:function (node, perms) {
            if (FS.ignorePermissions) {
              return 0;
            }
            // return 0 if any user, group or owner bits are set.
            if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
              return ERRNO_CODES.EACCES;
            } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
              return ERRNO_CODES.EACCES;
            } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
              return ERRNO_CODES.EACCES;
            }
            return 0;
          },mayLookup:function (dir) {
            return FS.nodePermissions(dir, 'x');
          },mayCreate:function (dir, name) {
            try {
              var node = FS.lookupNode(dir, name);
              return ERRNO_CODES.EEXIST;
            } catch (e) {
            }
            return FS.nodePermissions(dir, 'wx');
          },mayDelete:function (dir, name, isdir) {
            var node;
            try {
              node = FS.lookupNode(dir, name);
            } catch (e) {
              return e.errno;
            }
            var err = FS.nodePermissions(dir, 'wx');
            if (err) {
              return err;
            }
            if (isdir) {
              if (!FS.isDir(node.mode)) {
                return ERRNO_CODES.ENOTDIR;
              }
              if (FS.isRoot(node) || FS.getPath(node) === FS.currentPath) {
                return ERRNO_CODES.EBUSY;
              }
            } else {
              if (FS.isDir(node.mode)) {
                return ERRNO_CODES.EISDIR;
              }
            }
            return 0;
          },mayOpen:function (node, flags) {
            if (!node) {
              return ERRNO_CODES.ENOENT;
            }
            if (FS.isLink(node.mode)) {
              return ERRNO_CODES.ELOOP;
            } else if (FS.isDir(node.mode)) {
              if ((flags & 2097155) !== 0 ||  // opening for write
                  (flags & 512)) {
                return ERRNO_CODES.EISDIR;
              }
            }
            return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
          },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
            fd_start = fd_start || 1;
            fd_end = fd_end || FS.MAX_OPEN_FDS;
            for (var fd = fd_start; fd <= fd_end; fd++) {
              if (!FS.streams[fd]) {
                return fd;
              }
            }
            throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
          },getStream:function (fd) {
            return FS.streams[fd];
          },createStream:function (stream, fd_start, fd_end) {
            var fd = FS.nextfd(fd_start, fd_end);
            stream.fd = fd;
            // compatibility
            Object.defineProperties(stream, {
              object: {
                get: function() { return stream.node; },
                set: function(val) { stream.node = val; }
              },
              isRead: {
                get: function() { return (stream.flags & 2097155) !== 1; }
              },
              isWrite: {
                get: function() { return (stream.flags & 2097155) !== 0; }
              },
              isAppend: {
                get: function() { return (stream.flags & 1024); }
              }
            });
            FS.streams[fd] = stream;
            return stream;
          },closeStream:function (fd) {
            FS.streams[fd] = null;
          },chrdev_stream_ops:{open:function (stream) {
              var device = FS.getDevice(stream.node.rdev);
              // override node's stream ops with the device's
              stream.stream_ops = device.stream_ops;
              // forward the open call
              if (stream.stream_ops.open) {
                stream.stream_ops.open(stream);
              }
            },llseek:function () {
              throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
            }},major:function (dev) {
            return ((dev) >> 8);
          },minor:function (dev) {
            return ((dev) & 0xff);
          },makedev:function (ma, mi) {
            return ((ma) << 8 | (mi));
          },registerDevice:function (dev, ops) {
            FS.devices[dev] = { stream_ops: ops };
          },getDevice:function (dev) {
            return FS.devices[dev];
          },mount:function (type, opts, mountpoint) {
            var mount = {
              type: type,
              opts: opts,
              mountpoint: mountpoint,
              root: null
            };
            var lookup;
            if (mountpoint) {
              lookup = FS.lookupPath(mountpoint, { follow: false });
            }
            // create a root node for the fs
            var root = type.mount(mount);
            root.mount = mount;
            mount.root = root;
            // assign the mount info to the mountpoint's node
            if (lookup) {
              lookup.node.mount = mount;
              lookup.node.mounted = true;
              // compatibility update FS.root if we mount to /
              if (mountpoint === '/') {
                FS.root = mount.root;
              }
            }
            return root;
          },lookup:function (parent, name) {
            return parent.node_ops.lookup(parent, name);
          },mknod:function (path, mode, dev) {
            var lookup = FS.lookupPath(path, { parent: true });
            var parent = lookup.node;
            var name = PATH.basename(path);
            var err = FS.mayCreate(parent, name);
            if (err) {
              throw new FS.ErrnoError(err);
            }
            if (!parent.node_ops.mknod) {
              throw new FS.ErrnoError(ERRNO_CODES.EPERM);
            }
            return parent.node_ops.mknod(parent, name, mode, dev);
          },create:function (path, mode) {
            mode = mode !== undefined ? mode : 0666;
            mode &= 4095;
            mode |= 32768;
            return FS.mknod(path, mode, 0);
          },mkdir:function (path, mode) {
            mode = mode !== undefined ? mode : 0777;
            mode &= 511 | 512;
            mode |= 16384;
            return FS.mknod(path, mode, 0);
          },mkdev:function (path, mode, dev) {
            if (typeof(dev) === 'undefined') {
              dev = mode;
              mode = 0666;
            }
            mode |= 8192;
            return FS.mknod(path, mode, dev);
          },symlink:function (oldpath, newpath) {
            var lookup = FS.lookupPath(newpath, { parent: true });
            var parent = lookup.node;
            var newname = PATH.basename(newpath);
            var err = FS.mayCreate(parent, newname);
            if (err) {
              throw new FS.ErrnoError(err);
            }
            if (!parent.node_ops.symlink) {
              throw new FS.ErrnoError(ERRNO_CODES.EPERM);
            }
            return parent.node_ops.symlink(parent, newname, oldpath);
          },rename:function (old_path, new_path) {
            var old_dirname = PATH.dirname(old_path);
            var new_dirname = PATH.dirname(new_path);
            var old_name = PATH.basename(old_path);
            var new_name = PATH.basename(new_path);
            // parents must exist
            var lookup, old_dir, new_dir;
            try {
              lookup = FS.lookupPath(old_path, { parent: true });
              old_dir = lookup.node;
              lookup = FS.lookupPath(new_path, { parent: true });
              new_dir = lookup.node;
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
            }
            // need to be part of the same mount
            if (old_dir.mount !== new_dir.mount) {
              throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
            }
            // source must exist
            var old_node = FS.lookupNode(old_dir, old_name);
            // old path should not be an ancestor of the new path
            var relative = PATH.relative(old_path, new_dirname);
            if (relative.charAt(0) !== '.') {
              throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
            }
            // new path should not be an ancestor of the old path
            relative = PATH.relative(new_path, old_dirname);
            if (relative.charAt(0) !== '.') {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
            }
            // see if the new path already exists
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
              // not fatal
            }
            // early out if nothing needs to change
            if (old_node === new_node) {
              return;
            }
            // we'll need to delete the old entry
            var isdir = FS.isDir(old_node.mode);
            var err = FS.mayDelete(old_dir, old_name, isdir);
            if (err) {
              throw new FS.ErrnoError(err);
            }
            // need delete permissions if we'll be overwriting.
            // need create permissions if new doesn't already exist.
            err = new_node ?
              FS.mayDelete(new_dir, new_name, isdir) :
              FS.mayCreate(new_dir, new_name);
            if (err) {
              throw new FS.ErrnoError(err);
            }
            if (!old_dir.node_ops.rename) {
              throw new FS.ErrnoError(ERRNO_CODES.EPERM);
            }
            if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
              throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
            }
            // if we are going to change the parent, check write permissions
            if (new_dir !== old_dir) {
              err = FS.nodePermissions(old_dir, 'w');
              if (err) {
                throw new FS.ErrnoError(err);
              }
            }
            // remove the node from the lookup hash
            FS.hashRemoveNode(old_node);
            // do the underlying fs rename
            try {
              old_dir.node_ops.rename(old_node, new_dir, new_name);
            } catch (e) {
              throw e;
            } finally {
              // add the node back to the hash (in case node_ops.rename
              // changed its name)
              FS.hashAddNode(old_node);
            }
          },rmdir:function (path) {
            var lookup = FS.lookupPath(path, { parent: true });
            var parent = lookup.node;
            var name = PATH.basename(path);
            var node = FS.lookupNode(parent, name);
            var err = FS.mayDelete(parent, name, true);
            if (err) {
              throw new FS.ErrnoError(err);
            }
            if (!parent.node_ops.rmdir) {
              throw new FS.ErrnoError(ERRNO_CODES.EPERM);
            }
            if (FS.isMountpoint(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
            }
            parent.node_ops.rmdir(parent, name);
            FS.destroyNode(node);
          },readdir:function (path) {
            var lookup = FS.lookupPath(path, { follow: true });
            var node = lookup.node;
            if (!node.node_ops.readdir) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
            }
            return node.node_ops.readdir(node);
          },unlink:function (path) {
            var lookup = FS.lookupPath(path, { parent: true });
            var parent = lookup.node;
            var name = PATH.basename(path);
            var node = FS.lookupNode(parent, name);
            var err = FS.mayDelete(parent, name, false);
            if (err) {
              // POSIX says unlink should set EPERM, not EISDIR
              if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
              throw new FS.ErrnoError(err);
            }
            if (!parent.node_ops.unlink) {
              throw new FS.ErrnoError(ERRNO_CODES.EPERM);
            }
            if (FS.isMountpoint(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
            }
            parent.node_ops.unlink(parent, name);
            FS.destroyNode(node);
          },readlink:function (path) {
            var lookup = FS.lookupPath(path, { follow: false });
            var link = lookup.node;
            if (!link.node_ops.readlink) {
              throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
            }
            return link.node_ops.readlink(link);
          },stat:function (path, dontFollow) {
            var lookup = FS.lookupPath(path, { follow: !dontFollow });
            var node = lookup.node;
            if (!node.node_ops.getattr) {
              throw new FS.ErrnoError(ERRNO_CODES.EPERM);
            }
            return node.node_ops.getattr(node);
          },lstat:function (path) {
            return FS.stat(path, true);
          },chmod:function (path, mode, dontFollow) {
            var node;
            if (typeof path === 'string') {
              var lookup = FS.lookupPath(path, { follow: !dontFollow });
              node = lookup.node;
            } else {
              node = path;
            }
            if (!node.node_ops.setattr) {
              throw new FS.ErrnoError(ERRNO_CODES.EPERM);
            }
            node.node_ops.setattr(node, {
              mode: (mode & 4095) | (node.mode & ~4095),
              timestamp: Date.now()
            });
          },lchmod:function (path, mode) {
            FS.chmod(path, mode, true);
          },fchmod:function (fd, mode) {
            var stream = FS.getStream(fd);
            if (!stream) {
              throw new FS.ErrnoError(ERRNO_CODES.EBADF);
            }
            FS.chmod(stream.node, mode);
          },chown:function (path, uid, gid, dontFollow) {
            var node;
            if (typeof path === 'string') {
              var lookup = FS.lookupPath(path, { follow: !dontFollow });
              node = lookup.node;
            } else {
              node = path;
            }
            if (!node.node_ops.setattr) {
              throw new FS.ErrnoError(ERRNO_CODES.EPERM);
            }
            node.node_ops.setattr(node, {
              timestamp: Date.now()
              // we ignore the uid / gid for now
            });
          },lchown:function (path, uid, gid) {
            FS.chown(path, uid, gid, true);
          },fchown:function (fd, uid, gid) {
            var stream = FS.getStream(fd);
            if (!stream) {
              throw new FS.ErrnoError(ERRNO_CODES.EBADF);
            }
            FS.chown(stream.node, uid, gid);
          },truncate:function (path, len) {
            if (len < 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
            }
            var node;
            if (typeof path === 'string') {
              var lookup = FS.lookupPath(path, { follow: true });
              node = lookup.node;
            } else {
              node = path;
            }
            if (!node.node_ops.setattr) {
              throw new FS.ErrnoError(ERRNO_CODES.EPERM);
            }
            if (FS.isDir(node.mode)) {
              throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
            }
            if (!FS.isFile(node.mode)) {
              throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
            }
            var err = FS.nodePermissions(node, 'w');
            if (err) {
              throw new FS.ErrnoError(err);
            }
            node.node_ops.setattr(node, {
              size: len,
              timestamp: Date.now()
            });
          },ftruncate:function (fd, len) {
            var stream = FS.getStream(fd);
            if (!stream) {
              throw new FS.ErrnoError(ERRNO_CODES.EBADF);
            }
            if ((stream.flags & 2097155) === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
            }
            FS.truncate(stream.node, len);
          },utime:function (path, atime, mtime) {
            var lookup = FS.lookupPath(path, { follow: true });
            var node = lookup.node;
            node.node_ops.setattr(node, {
              timestamp: Math.max(atime, mtime)
            });
          },open:function (path, flags, mode, fd_start, fd_end) {
            path = PATH.normalize(path);
            flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
            mode = typeof mode === 'undefined' ? 0666 : mode;
            if ((flags & 64)) {
              mode = (mode & 4095) | 32768;
            } else {
              mode = 0;
            }
            var node;
            try {
              var lookup = FS.lookupPath(path, {
                follow: !(flags & 131072)
              });
              node = lookup.node;
              path = lookup.path;
            } catch (e) {
              // ignore
            }
            // perhaps we need to create the node
            if ((flags & 64)) {
              if (node) {
                // if O_CREAT and O_EXCL are set, error out if the node already exists
                if ((flags & 128)) {
                  throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
                }
              } else {
                // node doesn't exist, try to create it
                node = FS.mknod(path, mode, 0);
              }
            }
            if (!node) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
            }
            // can't truncate a device
            if (FS.isChrdev(node.mode)) {
              flags &= ~512;
            }
            // check permissions
            var err = FS.mayOpen(node, flags);
            if (err) {
              throw new FS.ErrnoError(err);
            }
            // do truncation if necessary
            if ((flags & 512)) {
              FS.truncate(node, 0);
            }
            // register the stream with the filesystem
            var stream = FS.createStream({
              path: path,
              node: node,
              flags: flags,
              seekable: true,
              position: 0,
              stream_ops: node.stream_ops,
              // used by the file family libc calls (fopen, fwrite, ferror, etc.)
              ungotten: [],
              error: false
            }, fd_start, fd_end);
            // call the new stream's open function
            if (stream.stream_ops.open) {
              stream.stream_ops.open(stream);
            }
            if (Module['logReadFiles'] && !(flags & 1)) {
              if (!FS.readFiles) FS.readFiles = {};
              if (!(path in FS.readFiles)) {
                FS.readFiles[path] = 1;
                Module['printErr']('read file: ' + path);
              }
            }
            return stream;
          },close:function (stream) {
            try {
              if (stream.stream_ops.close) {
                stream.stream_ops.close(stream);
              }
            } catch (e) {
              throw e;
            } finally {
              FS.closeStream(stream.fd);
            }
          },llseek:function (stream, offset, whence) {
            if (!stream.seekable || !stream.stream_ops.llseek) {
              throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
            }
            return stream.stream_ops.llseek(stream, offset, whence);
          },read:function (stream, buffer, offset, length, position) {
            if (length < 0 || position < 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
            }
            if ((stream.flags & 2097155) === 1) {
              throw new FS.ErrnoError(ERRNO_CODES.EBADF);
            }
            if (FS.isDir(stream.node.mode)) {
              throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
            }
            if (!stream.stream_ops.read) {
              throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
            }
            var seeking = true;
            if (typeof position === 'undefined') {
              position = stream.position;
              seeking = false;
            } else if (!stream.seekable) {
              throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
            }
            var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
            if (!seeking) stream.position += bytesRead;
            return bytesRead;
          },write:function (stream, buffer, offset, length, position, canOwn) {
            if (length < 0 || position < 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
            }
            if ((stream.flags & 2097155) === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EBADF);
            }
            if (FS.isDir(stream.node.mode)) {
              throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
            }
            if (!stream.stream_ops.write) {
              throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
            }
            var seeking = true;
            if (typeof position === 'undefined') {
              position = stream.position;
              seeking = false;
            } else if (!stream.seekable) {
              throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
            }
            if (stream.flags & 1024) {
              // seek to the end before writing in append mode
              FS.llseek(stream, 0, 2);
            }
            var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
            if (!seeking) stream.position += bytesWritten;
            return bytesWritten;
          },allocate:function (stream, offset, length) {
            if (offset < 0 || length <= 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
            }
            if ((stream.flags & 2097155) === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EBADF);
            }
            if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
              throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
            }
            if (!stream.stream_ops.allocate) {
              throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
            }
            stream.stream_ops.allocate(stream, offset, length);
          },mmap:function (stream, buffer, offset, length, position, prot, flags) {
            // TODO if PROT is PROT_WRITE, make sure we have write access
            if ((stream.flags & 2097155) === 1) {
              throw new FS.ErrnoError(ERRNO_CODES.EACCES);
            }
            if (!stream.stream_ops.mmap) {
              throw new FS.errnoError(ERRNO_CODES.ENODEV);
            }
            return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
          },ioctl:function (stream, cmd, arg) {
            if (!stream.stream_ops.ioctl) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
            }
            return stream.stream_ops.ioctl(stream, cmd, arg);
          },readFile:function (path, opts) {
            opts = opts || {};
            opts.flags = opts.flags || 'r';
            opts.encoding = opts.encoding || 'binary';
            var ret;
            var stream = FS.open(path, opts.flags);
            var stat = FS.stat(path);
            var length = stat.size;
            var buf = new Uint8Array(length);
            FS.read(stream, buf, 0, length, 0);
            if (opts.encoding === 'utf8') {
              ret = '';
              var utf8 = new Runtime.UTF8Processor();
              for (var i = 0; i < length; i++) {
                ret += utf8.processCChar(buf[i]);
              }
            } else if (opts.encoding === 'binary') {
              ret = buf;
            } else {
              throw new Error('Invalid encoding type "' + opts.encoding + '"');
            }
            FS.close(stream);
            return ret;
          },writeFile:function (path, data, opts) {
            opts = opts || {};
            opts.flags = opts.flags || 'w';
            opts.encoding = opts.encoding || 'utf8';
            var stream = FS.open(path, opts.flags, opts.mode);
            if (opts.encoding === 'utf8') {
              var utf8 = new Runtime.UTF8Processor();
              var buf = new Uint8Array(utf8.processJSString(data));
              FS.write(stream, buf, 0, buf.length, 0);
            } else if (opts.encoding === 'binary') {
              FS.write(stream, data, 0, data.length, 0);
            } else {
              throw new Error('Invalid encoding type "' + opts.encoding + '"');
            }
            FS.close(stream);
          },createDefaultDirectories:function () {
            FS.mkdir('/tmp');
          },createDefaultDevices:function () {
            // create /dev
            FS.mkdir('/dev');
            // setup /dev/null
            FS.registerDevice(FS.makedev(1, 3), {
              read: function() { return 0; },
              write: function() { return 0; }
            });
            FS.mkdev('/dev/null', FS.makedev(1, 3));
            // setup /dev/tty and /dev/tty1
            // stderr needs to print output using Module['printErr']
            // so we register a second tty just for it.
            TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
            TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
            FS.mkdev('/dev/tty', FS.makedev(5, 0));
            FS.mkdev('/dev/tty1', FS.makedev(6, 0));
            // we're not going to emulate the actual shm device,
            // just create the tmp dirs that reside in it commonly
            FS.mkdir('/dev/shm');
            FS.mkdir('/dev/shm/tmp');
          },createStandardStreams:function () {
            // TODO deprecate the old functionality of a single
            // input / output callback and that utilizes FS.createDevice
            // and instead require a unique set of stream ops
            // by default, we symlink the standard streams to the
            // default tty devices. however, if the standard streams
            // have been overwritten we create a unique device for
            // them instead.
            if (Module['stdin']) {
              FS.createDevice('/dev', 'stdin', Module['stdin']);
            } else {
              FS.symlink('/dev/tty', '/dev/stdin');
            }
            if (Module['stdout']) {
              FS.createDevice('/dev', 'stdout', null, Module['stdout']);
            } else {
              FS.symlink('/dev/tty', '/dev/stdout');
            }
            if (Module['stderr']) {
              FS.createDevice('/dev', 'stderr', null, Module['stderr']);
            } else {
              FS.symlink('/dev/tty1', '/dev/stderr');
            }
            // open default streams for the stdin, stdout and stderr devices
            var stdin = FS.open('/dev/stdin', 'r');
            HEAP32[((_stdin)>>2)]=stdin.fd;
            assert(stdin.fd === 1, 'invalid handle for stdin (' + stdin.fd + ')');
            var stdout = FS.open('/dev/stdout', 'w');
            HEAP32[((_stdout)>>2)]=stdout.fd;
            assert(stdout.fd === 2, 'invalid handle for stdout (' + stdout.fd + ')');
            var stderr = FS.open('/dev/stderr', 'w');
            HEAP32[((_stderr)>>2)]=stderr.fd;
            assert(stderr.fd === 3, 'invalid handle for stderr (' + stderr.fd + ')');
          },staticInit:function () {
            FS.nameTable = new Array(4096);
            FS.root = FS.createNode(null, '/', 16384 | 0777, 0);
            FS.mount(MEMFS, {}, '/');
            FS.createDefaultDirectories();
            FS.createDefaultDevices();
          },init:function (input, output, error) {
            assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
            FS.init.initialized = true;
            // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
            Module['stdin'] = input || Module['stdin'];
            Module['stdout'] = output || Module['stdout'];
            Module['stderr'] = error || Module['stderr'];
            FS.createStandardStreams();
          },quit:function () {
            FS.init.initialized = false;
            for (var i = 0; i < FS.streams.length; i++) {
              var stream = FS.streams[i];
              if (!stream) {
                continue;
              }
              FS.close(stream);
            }
          },getMode:function (canRead, canWrite) {
            var mode = 0;
            if (canRead) mode |= 292 | 73;
            if (canWrite) mode |= 146;
            return mode;
          },joinPath:function (parts, forceRelative) {
            var path = PATH.join.apply(null, parts);
            if (forceRelative && path[0] == '/') path = path.substr(1);
            return path;
          },absolutePath:function (relative, base) {
            return PATH.resolve(base, relative);
          },standardizePath:function (path) {
            return PATH.normalize(path);
          },findObject:function (path, dontResolveLastLink) {
            var ret = FS.analyzePath(path, dontResolveLastLink);
            if (ret.exists) {
              return ret.object;
            } else {
              ___setErrNo(ret.error);
              return null;
            }
          },analyzePath:function (path, dontResolveLastLink) {
            // operate from within the context of the symlink's target
            try {
              var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
              path = lookup.path;
            } catch (e) {
            }
            var ret = {
              isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
              parentExists: false, parentPath: null, parentObject: null
            };
            try {
              var lookup = FS.lookupPath(path, { parent: true });
              ret.parentExists = true;
              ret.parentPath = lookup.path;
              ret.parentObject = lookup.node;
              ret.name = PATH.basename(path);
              lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
              ret.exists = true;
              ret.path = lookup.path;
              ret.object = lookup.node;
              ret.name = lookup.node.name;
              ret.isRoot = lookup.path === '/';
            } catch (e) {
              ret.error = e.errno;
            };
            return ret;
          },createFolder:function (parent, name, canRead, canWrite) {
            var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
            var mode = FS.getMode(canRead, canWrite);
            return FS.mkdir(path, mode);
          },createPath:function (parent, path, canRead, canWrite) {
            parent = typeof parent === 'string' ? parent : FS.getPath(parent);
            var parts = path.split('/').reverse();
            while (parts.length) {
              var part = parts.pop();
              if (!part) continue;
              var current = PATH.join(parent, part);
              try {
                FS.mkdir(current);
              } catch (e) {
                // ignore EEXIST
              }
              parent = current;
            }
            return current;
          },createFile:function (parent, name, properties, canRead, canWrite) {
            var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
            var mode = FS.getMode(canRead, canWrite);
            return FS.create(path, mode);
          },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
            var path = name ? PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
            var mode = FS.getMode(canRead, canWrite);
            var node = FS.create(path, mode);
            if (data) {
              if (typeof data === 'string') {
                var arr = new Array(data.length);
                for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
                data = arr;
              }
              // make sure we can write to the file
              FS.chmod(path, mode | 146);
              var stream = FS.open(path, 'w');
              FS.write(stream, data, 0, data.length, 0, canOwn);
              FS.close(stream);
              FS.chmod(path, mode);
            }
            return node;
          },createDevice:function (parent, name, input, output) {
            var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
            var mode = FS.getMode(!!input, !!output);
            if (!FS.createDevice.major) FS.createDevice.major = 64;
            var dev = FS.makedev(FS.createDevice.major++, 0);
            // Create a fake device that a set of stream ops to emulate
            // the old behavior.
            FS.registerDevice(dev, {
              open: function(stream) {
                stream.seekable = false;
              },
              close: function(stream) {
                // flush any pending line data
                if (output && output.buffer && output.buffer.length) {
                  output(10);
                }
              },
              read: function(stream, buffer, offset, length, pos /* ignored */) {
                var bytesRead = 0;
                for (var i = 0; i < length; i++) {
                  var result;
                  try {
                    result = input();
                  } catch (e) {
                    throw new FS.ErrnoError(ERRNO_CODES.EIO);
                  }
                  if (result === undefined && bytesRead === 0) {
                    throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
                  }
                  if (result === null || result === undefined) break;
                  bytesRead++;
                  buffer[offset+i] = result;
                }
                if (bytesRead) {
                  stream.node.timestamp = Date.now();
                }
                return bytesRead;
              },
              write: function(stream, buffer, offset, length, pos) {
                for (var i = 0; i < length; i++) {
                  try {
                    output(buffer[offset+i]);
                  } catch (e) {
                    throw new FS.ErrnoError(ERRNO_CODES.EIO);
                  }
                }
                if (length) {
                  stream.node.timestamp = Date.now();
                }
                return i;
              }
            });
            return FS.mkdev(path, mode, dev);
          },createLink:function (parent, name, target, canRead, canWrite) {
            var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
            return FS.symlink(target, path);
          },forceLoadFile:function (obj) {
            if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
            var success = true;
            if (typeof XMLHttpRequest !== 'undefined') {
              throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
            } else if (Module['read']) {
              // Command-line.
              try {
                // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
                //          read() will try to parse UTF8.
                obj.contents = intArrayFromString(Module['read'](obj.url), true);
              } catch (e) {
                success = false;
              }
            } else {
              throw new Error('Cannot load without read() or XMLHttpRequest.');
            }
            if (!success) ___setErrNo(ERRNO_CODES.EIO);
            return success;
          },createLazyFile:function (parent, name, url, canRead, canWrite) {
            if (typeof XMLHttpRequest !== 'undefined') {
              if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
              // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
              var LazyUint8Array = function() {
                this.lengthKnown = false;
                this.chunks = []; // Loaded chunks. Index is the chunk number
              }
              LazyUint8Array.prototype.get = function(idx) {
                if (idx > this.length-1 || idx < 0) {
                  return undefined;
                }
                var chunkOffset = idx % this.chunkSize;
                var chunkNum = Math.floor(idx / this.chunkSize);
                return this.getter(chunkNum)[chunkOffset];
              }
              LazyUint8Array.prototype.setDataGetter = function(getter) {
                this.getter = getter;
              }
              LazyUint8Array.prototype.cacheLength = function() {
                  // Find length
                  var xhr = new XMLHttpRequest();
                  xhr.open('HEAD', url, false);
                  xhr.send(null);
                  if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                  var datalength = Number(xhr.getResponseHeader("Content-length"));
                  var header;
                  var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
                  var chunkSize = 1024*1024; // Chunk size in bytes
                  if (!hasByteServing) chunkSize = datalength;
                  // Function to get a range from the remote URL.
                  var doXHR = (function(from, to) {
                    if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                    if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
                    // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', url, false);
                    if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
                    // Some hints to the browser that we want binary data.
                    if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                    if (xhr.overrideMimeType) {
                      xhr.overrideMimeType('text/plain; charset=x-user-defined');
                    }
                    xhr.send(null);
                    if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                    if (xhr.response !== undefined) {
                      return new Uint8Array(xhr.response || []);
                    } else {
                      return intArrayFromString(xhr.responseText || '', true);
                    }
                  });
                  var lazyArray = this;
                  lazyArray.setDataGetter(function(chunkNum) {
                    var start = chunkNum * chunkSize;
                    var end = (chunkNum+1) * chunkSize - 1; // including this byte
                    end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
                    if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                      lazyArray.chunks[chunkNum] = doXHR(start, end);
                    }
                    if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
                    return lazyArray.chunks[chunkNum];
                  });
                  this._length = datalength;
                  this._chunkSize = chunkSize;
                  this.lengthKnown = true;
              }
              var lazyArray = new LazyUint8Array();
              Object.defineProperty(lazyArray, "length", {
                  get: function() {
                      if(!this.lengthKnown) {
                          this.cacheLength();
                      }
                      return this._length;
                  }
              });
              Object.defineProperty(lazyArray, "chunkSize", {
                  get: function() {
                      if(!this.lengthKnown) {
                          this.cacheLength();
                      }
                      return this._chunkSize;
                  }
              });
              var properties = { isDevice: false, contents: lazyArray };
            } else {
              var properties = { isDevice: false, url: url };
            }
            var node = FS.createFile(parent, name, properties, canRead, canWrite);
            // This is a total hack, but I want to get this lazy file code out of the
            // core of MEMFS. If we want to keep this lazy file concept I feel it should
            // be its own thin LAZYFS proxying calls to MEMFS.
            if (properties.contents) {
              node.contents = properties.contents;
            } else if (properties.url) {
              node.contents = null;
              node.url = properties.url;
            }
            // override each stream op with one that tries to force load the lazy file first
            var stream_ops = {};
            var keys = Object.keys(node.stream_ops);
            keys.forEach(function(key) {
              var fn = node.stream_ops[key];
              stream_ops[key] = function() {
                if (!FS.forceLoadFile(node)) {
                  throw new FS.ErrnoError(ERRNO_CODES.EIO);
                }
                return fn.apply(null, arguments);
              };
            });
            // use a custom read function
            stream_ops.read = function(stream, buffer, offset, length, position) {
              if (!FS.forceLoadFile(node)) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              var contents = stream.node.contents;
              if (position >= contents.length)
                return 0;
              var size = Math.min(contents.length - position, length);
              assert(size >= 0);
              if (contents.slice) { // normal array
                for (var i = 0; i < size; i++) {
                  buffer[offset + i] = contents[position + i];
                }
              } else {
                for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
                  buffer[offset + i] = contents.get(position + i);
                }
              }
              return size;
            };
            node.stream_ops = stream_ops;
            return node;
          },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
            Browser.init();
            // TODO we should allow people to just pass in a complete filename instead
            // of parent and name being that we just join them anyways
            var fullname = name ? PATH.resolve(PATH.join(parent, name)) : parent;
            function processData(byteArray) {
              function finish(byteArray) {
                if (!dontCreateFile) {
                  FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
                }
                if (onload) onload();
                removeRunDependency('cp ' + fullname);
              }
              var handled = false;
              Module['preloadPlugins'].forEach(function(plugin) {
                if (handled) return;
                if (plugin['canHandle'](fullname)) {
                  plugin['handle'](byteArray, fullname, finish, function() {
                    if (onerror) onerror();
                    removeRunDependency('cp ' + fullname);
                  });
                  handled = true;
                }
              });
              if (!handled) finish(byteArray);
            }
            addRunDependency('cp ' + fullname);
            if (typeof url == 'string') {
              Browser.asyncLoad(url, function(byteArray) {
                processData(byteArray);
              }, onerror);
            } else {
              processData(url);
            }
          },indexedDB:function () {
            return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
          },DB_NAME:function () {
            return 'EM_FS_' + window.location.pathname;
          },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
            onload = onload || function(){};
            onerror = onerror || function(){};
            var indexedDB = FS.indexedDB();
            try {
              var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
            } catch (e) {
              return onerror(e);
            }
            openRequest.onupgradeneeded = function() {
              console.log('creating db');
              var db = openRequest.result;
              db.createObjectStore(FS.DB_STORE_NAME);
            };
            openRequest.onsuccess = function() {
              var db = openRequest.result;
              var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
              var files = transaction.objectStore(FS.DB_STORE_NAME);
              var ok = 0, fail = 0, total = paths.length;
              function finish() {
                if (fail == 0) onload(); else onerror();
              }
              paths.forEach(function(path) {
                var putRequest = files.put(FS.analyzePath(path).object.contents, path);
                putRequest.onsuccess = function() { ok++; if (ok + fail == total) finish() };
                putRequest.onerror = function() { fail++; if (ok + fail == total) finish() };
              });
              transaction.onerror = onerror;
            };
            openRequest.onerror = onerror;
          },loadFilesFromDB:function (paths, onload, onerror) {
            onload = onload || function(){};
            onerror = onerror || function(){};
            var indexedDB = FS.indexedDB();
            try {
              var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
            } catch (e) {
              return onerror(e);
            }
            openRequest.onupgradeneeded = onerror; // no database to load from
            openRequest.onsuccess = function() {
              var db = openRequest.result;
              try {
                var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
              } catch(e) {
                onerror(e);
                return;
              }
              var files = transaction.objectStore(FS.DB_STORE_NAME);
              var ok = 0, fail = 0, total = paths.length;
              function finish() {
                if (fail == 0) onload(); else onerror();
              }
              paths.forEach(function(path) {
                var getRequest = files.get(path);
                getRequest.onsuccess = function() {
                  if (FS.analyzePath(path).exists) {
                    FS.unlink(path);
                  }
                  FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
                  ok++;
                  if (ok + fail == total) finish();
                };
                getRequest.onerror = function() { fail++; if (ok + fail == total) finish() };
              });
              transaction.onerror = onerror;
            };
            openRequest.onerror = onerror;
          }};
      function _lseek(fildes, offset, whence) {
          // off_t lseek(int fildes, off_t offset, int whence);
          // http://pubs.opengroup.org/onlinepubs/000095399/functions/lseek.html
          var stream = FS.getStream(fildes);
          if (!stream) {
            ___setErrNo(ERRNO_CODES.EBADF);
            return -1;
          }
          try {
            return FS.llseek(stream, offset, whence);
          } catch (e) {
            FS.handleFSError(e);
            return -1;
          }
        }function _fseek(stream, offset, whence) {
          // int fseek(FILE *stream, long offset, int whence);
          // http://pubs.opengroup.org/onlinepubs/000095399/functions/fseek.html
          var ret = _lseek(stream, offset, whence);
          if (ret == -1) {
            return -1;
          }
          stream = FS.getStream(stream);
          stream.eof = false;
          return 0;
        }
      function _ftell(stream) {
          // long ftell(FILE *stream);
          // http://pubs.opengroup.org/onlinepubs/000095399/functions/ftell.html
          stream = FS.getStream(stream);
          if (!stream) {
            ___setErrNo(ERRNO_CODES.EBADF);
            return -1;
          }
          if (FS.isChrdev(stream.node.mode)) {
            ___setErrNo(ERRNO_CODES.ESPIPE);
            return -1;
          } else {
            return stream.position;
          }
        }
      var SOCKFS={mount:function (mount) {
            return FS.createNode(null, '/', 16384 | 0777, 0);
          },nextname:function () {
            if (!SOCKFS.nextname.current) {
              SOCKFS.nextname.current = 0;
            }
            return 'socket[' + (SOCKFS.nextname.current++) + ']';
          },createSocket:function (family, type, protocol) {
            var streaming = type == 1;
            if (protocol) {
              assert(streaming == (protocol == 6)); // if SOCK_STREAM, must be tcp
            }
            // create our internal socket structure
            var sock = {
              family: family,
              type: type,
              protocol: protocol,
              server: null,
              peers: {},
              pending: [],
              recv_queue: [],
              sock_ops: SOCKFS.websocket_sock_ops
            };
            // create the filesystem node to store the socket structure
            var name = SOCKFS.nextname();
            var node = FS.createNode(SOCKFS.root, name, 49152, 0);
            node.sock = sock;
            // and the wrapping stream that enables library functions such
            // as read and write to indirectly interact with the socket
            var stream = FS.createStream({
              path: name,
              node: node,
              flags: FS.modeStringToFlags('r+'),
              seekable: false,
              stream_ops: SOCKFS.stream_ops
            });
            // map the new stream to the socket structure (sockets have a 1:1
            // relationship with a stream)
            sock.stream = stream;
            return sock;
          },getSocket:function (fd) {
            var stream = FS.getStream(fd);
            if (!stream || !FS.isSocket(stream.node.mode)) {
              return null;
            }
            return stream.node.sock;
          },stream_ops:{poll:function (stream) {
              var sock = stream.node.sock;
              return sock.sock_ops.poll(sock);
            },ioctl:function (stream, request, varargs) {
              var sock = stream.node.sock;
              return sock.sock_ops.ioctl(sock, request, varargs);
            },read:function (stream, buffer, offset, length, position /* ignored */) {
              var sock = stream.node.sock;
              var msg = sock.sock_ops.recvmsg(sock, length);
              if (!msg) {
                // socket is closed
                return 0;
              }
              buffer.set(msg.buffer, offset);
              return msg.buffer.length;
            },write:function (stream, buffer, offset, length, position /* ignored */) {
              var sock = stream.node.sock;
              return sock.sock_ops.sendmsg(sock, buffer, offset, length);
            },close:function (stream) {
              var sock = stream.node.sock;
              sock.sock_ops.close(sock);
            }},websocket_sock_ops:{createPeer:function (sock, addr, port) {
              var ws;
              if (typeof addr === 'object') {
                ws = addr;
                addr = null;
                port = null;
              }
              if (ws) {
                // for sockets that've already connected (e.g. we're the server)
                // we can inspect the _socket property for the address
                if (ws._socket) {
                  addr = ws._socket.remoteAddress;
                  port = ws._socket.remotePort;
                }
                // if we're just now initializing a connection to the remote,
                // inspect the url property
                else {
                  var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
                  if (!result) {
                    throw new Error('WebSocket URL must be in the format ws(s)://address:port');
                  }
                  addr = result[1];
                  port = parseInt(result[2], 10);
                }
              } else {
                // create the actual websocket object and connect
                try {
                  var url = 'ws://' + addr + ':' + port;
                  // the node ws library API is slightly different than the browser's
                  var opts = ENVIRONMENT_IS_NODE ? {} : ['binary'];
                  ws = new WebSocket(url, opts);
                  ws.binaryType = 'arraybuffer';
                } catch (e) {
                  throw new FS.ErrnoError(ERRNO_CODES.EHOSTUNREACH);
                }
              }
              var peer = {
                addr: addr,
                port: port,
                socket: ws,
                dgram_send_queue: []
              };
              SOCKFS.websocket_sock_ops.addPeer(sock, peer);
              SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
              // if this is a bound dgram socket, send the port number first to allow
              // us to override the ephemeral port reported to us by remotePort on the
              // remote end.
              if (sock.type === 2 && typeof sock.sport !== 'undefined') {
                peer.dgram_send_queue.push(new Uint8Array([
                    255, 255, 255, 255,
                    'p'.charCodeAt(0), 'o'.charCodeAt(0), 'r'.charCodeAt(0), 't'.charCodeAt(0),
                    ((sock.sport & 0xff00) >> 8) , (sock.sport & 0xff)
                ]));
              }
              return peer;
            },getPeer:function (sock, addr, port) {
              return sock.peers[addr + ':' + port];
            },addPeer:function (sock, peer) {
              sock.peers[peer.addr + ':' + peer.port] = peer;
            },removePeer:function (sock, peer) {
              delete sock.peers[peer.addr + ':' + peer.port];
            },handlePeerEvents:function (sock, peer) {
              var first = true;
              var handleOpen = function () {
                try {
                  var queued = peer.dgram_send_queue.shift();
                  while (queued) {
                    peer.socket.send(queued);
                    queued = peer.dgram_send_queue.shift();
                  }
                } catch (e) {
                  // not much we can do here in the way of proper error handling as we've already
                  // lied and said this data was sent. shut it down.
                  peer.socket.close();
                }
              };
              var handleMessage = function(data) {
                assert(typeof data !== 'string' && data.byteLength !== undefined);  // must receive an ArrayBuffer
                data = new Uint8Array(data);  // make a typed array view on the array buffer
                // if this is the port message, override the peer's port with it
                var wasfirst = first;
                first = false;
                if (wasfirst &&
                    data.length === 10 &&
                    data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 &&
                    data[4] === 'p'.charCodeAt(0) && data[5] === 'o'.charCodeAt(0) && data[6] === 'r'.charCodeAt(0) && data[7] === 't'.charCodeAt(0)) {
                  // update the peer's port and it's key in the peer map
                  var newport = ((data[8] << 8) | data[9]);
                  SOCKFS.websocket_sock_ops.removePeer(sock, peer);
                  peer.port = newport;
                  SOCKFS.websocket_sock_ops.addPeer(sock, peer);
                  return;
                }
                sock.recv_queue.push({ addr: peer.addr, port: peer.port, data: data });
              };
              if (ENVIRONMENT_IS_NODE) {
                peer.socket.on('open', handleOpen);
                peer.socket.on('message', function(data, flags) {
                  if (!flags.binary) {
                    return;
                  }
                  handleMessage((new Uint8Array(data)).buffer);  // copy from node Buffer -> ArrayBuffer
                });
                peer.socket.on('error', function() {
                  // don't throw
                });
              } else {
                peer.socket.onopen = handleOpen;
                peer.socket.onmessage = function(event) {
                  handleMessage(event.data);
                };
              }
            },poll:function (sock) {
              if (sock.type === 1 && sock.server) {
                // listen sockets should only say they're available for reading
                // if there are pending clients.
                return sock.pending.length ? (64 | 1) : 0;
              }
              var mask = 0;
              var dest = sock.type === 1 ?  // we only care about the socket state for connection-based sockets
                SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) :
                null;
              if (sock.recv_queue.length ||
                  !dest ||  // connection-less sockets are always ready to read
                  (dest && dest.socket.readyState === dest.socket.CLOSING) ||
                  (dest && dest.socket.readyState === dest.socket.CLOSED)) {  // let recv return 0 once closed
                mask |= (64 | 1);
              }
              if (!dest ||  // connection-less sockets are always ready to write
                  (dest && dest.socket.readyState === dest.socket.OPEN)) {
                mask |= 4;
              }
              if ((dest && dest.socket.readyState === dest.socket.CLOSING) ||
                  (dest && dest.socket.readyState === dest.socket.CLOSED)) {
                mask |= 16;
              }
              return mask;
            },ioctl:function (sock, request, arg) {
              switch (request) {
                case 21531:
                  var bytes = 0;
                  if (sock.recv_queue.length) {
                    bytes = sock.recv_queue[0].data.length;
                  }
                  HEAP32[((arg)>>2)]=bytes;
                  return 0;
                default:
                  return ERRNO_CODES.EINVAL;
              }
            },close:function (sock) {
              // if we've spawned a listen server, close it
              if (sock.server) {
                try {
                  sock.server.close();
                } catch (e) {
                }
                sock.server = null;
              }
              // close any peer connections
              var peers = Object.keys(sock.peers);
              for (var i = 0; i < peers.length; i++) {
                var peer = sock.peers[peers[i]];
                try {
                  peer.socket.close();
                } catch (e) {
                }
                SOCKFS.websocket_sock_ops.removePeer(sock, peer);
              }
              return 0;
            },bind:function (sock, addr, port) {
              if (typeof sock.saddr !== 'undefined' || typeof sock.sport !== 'undefined') {
                throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already bound
              }
              sock.saddr = addr;
              sock.sport = port || _mkport();
              // in order to emulate dgram sockets, we need to launch a listen server when
              // binding on a connection-less socket
              // note: this is only required on the server side
              if (sock.type === 2) {
                // close the existing server if it exists
                if (sock.server) {
                  sock.server.close();
                  sock.server = null;
                }
                // swallow error operation not supported error that occurs when binding in the
                // browser where this isn't supported
                try {
                  sock.sock_ops.listen(sock, 0);
                } catch (e) {
                  if (!(e instanceof FS.ErrnoError)) throw e;
                  if (e.errno !== ERRNO_CODES.EOPNOTSUPP) throw e;
                }
              }
            },connect:function (sock, addr, port) {
              if (sock.server) {
                throw new FS.ErrnoError(ERRNO_CODS.EOPNOTSUPP);
              }
              // TODO autobind
              // if (!sock.addr && sock.type == 2) {
              // }
              // early out if we're already connected / in the middle of connecting
              if (typeof sock.daddr !== 'undefined' && typeof sock.dport !== 'undefined') {
                var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
                if (dest) {
                  if (dest.socket.readyState === dest.socket.CONNECTING) {
                    throw new FS.ErrnoError(ERRNO_CODES.EALREADY);
                  } else {
                    throw new FS.ErrnoError(ERRNO_CODES.EISCONN);
                  }
                }
              }
              // add the socket to our peer list and set our
              // destination address / port to match
              var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
              sock.daddr = peer.addr;
              sock.dport = peer.port;
              // always "fail" in non-blocking mode
              throw new FS.ErrnoError(ERRNO_CODES.EINPROGRESS);
            },listen:function (sock, backlog) {
              if (!ENVIRONMENT_IS_NODE) {
                throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
              }
              if (sock.server) {
                 throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already listening
              }
              var WebSocketServer = require('ws').Server;
              var host = sock.saddr;
              sock.server = new WebSocketServer({
                host: host,
                port: sock.sport
                // TODO support backlog
              });
              sock.server.on('connection', function(ws) {
                if (sock.type === 1) {
                  var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
                  // create a peer on the new socket
                  var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
                  newsock.daddr = peer.addr;
                  newsock.dport = peer.port;
                  // push to queue for accept to pick up
                  sock.pending.push(newsock);
                } else {
                  // create a peer on the listen socket so calling sendto
                  // with the listen socket and an address will resolve
                  // to the correct client
                  SOCKFS.websocket_sock_ops.createPeer(sock, ws);
                }
              });
              sock.server.on('closed', function() {
                sock.server = null;
              });
              sock.server.on('error', function() {
                // don't throw
              });
            },accept:function (listensock) {
              if (!listensock.server) {
                throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
              }
              var newsock = listensock.pending.shift();
              newsock.stream.flags = listensock.stream.flags;
              return newsock;
            },getname:function (sock, peer) {
              var addr, port;
              if (peer) {
                if (sock.daddr === undefined || sock.dport === undefined) {
                  throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
                }
                addr = sock.daddr;
                port = sock.dport;
              } else {
                // TODO saddr and sport will be set for bind()'d UDP sockets, but what
                // should we be returning for TCP sockets that've been connect()'d?
                addr = sock.saddr || 0;
                port = sock.sport || 0;
              }
              return { addr: addr, port: port };
            },sendmsg:function (sock, buffer, offset, length, addr, port) {
              if (sock.type === 2) {
                // connection-less sockets will honor the message address,
                // and otherwise fall back to the bound destination address
                if (addr === undefined || port === undefined) {
                  addr = sock.daddr;
                  port = sock.dport;
                }
                // if there was no address to fall back to, error out
                if (addr === undefined || port === undefined) {
                  throw new FS.ErrnoError(ERRNO_CODES.EDESTADDRREQ);
                }
              } else {
                // connection-based sockets will only use the bound
                addr = sock.daddr;
                port = sock.dport;
              }
              // find the peer for the destination address
              var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
              // early out if not connected with a connection-based socket
              if (sock.type === 1) {
                if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                  throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
                } else if (dest.socket.readyState === dest.socket.CONNECTING) {
                  throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
                }
              }
              // create a copy of the incoming data to send, as the WebSocket API
              // doesn't work entirely with an ArrayBufferView, it'll just send
              // the entire underlying buffer
              var data;
              if (buffer instanceof Array || buffer instanceof ArrayBuffer) {
                data = buffer.slice(offset, offset + length);
              } else {  // ArrayBufferView
                data = buffer.buffer.slice(buffer.byteOffset + offset, buffer.byteOffset + offset + length);
              }
              // if we're emulating a connection-less dgram socket and don't have
              // a cached connection, queue the buffer to send upon connect and
              // lie, saying the data was sent now.
              if (sock.type === 2) {
                if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
                  // if we're not connected, open a new connection
                  if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                    dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
                  }
                  dest.dgram_send_queue.push(data);
                  return length;
                }
              }
              try {
                // send the actual data
                dest.socket.send(data);
                return length;
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
              }
            },recvmsg:function (sock, length) {
              // http://pubs.opengroup.org/onlinepubs/7908799/xns/recvmsg.html
              if (sock.type === 1 && sock.server) {
                // tcp servers should not be recv()'ing on the listen socket
                throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
              }
              var queued = sock.recv_queue.shift();
              if (!queued) {
                if (sock.type === 1) {
                  var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
                  if (!dest) {
                    // if we have a destination address but are not connected, error out
                    throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
                  }
                  else if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                    // return null if the socket has closed
                    return null;
                  }
                  else {
                    // else, our socket is in a valid state but truly has nothing available
                    throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
                  }
                } else {
                  throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
                }
              }
              // queued.data will be an ArrayBuffer if it's unadulterated, but if it's
              // requeued TCP data it'll be an ArrayBufferView
              var queuedLength = queued.data.byteLength || queued.data.length;
              var queuedOffset = queued.data.byteOffset || 0;
              var queuedBuffer = queued.data.buffer || queued.data;
              var bytesRead = Math.min(length, queuedLength);
              var res = {
                buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
                addr: queued.addr,
                port: queued.port
              };
              // push back any unread data for TCP connections
              if (sock.type === 1 && bytesRead < queuedLength) {
                var bytesRemaining = queuedLength - bytesRead;
                queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
                sock.recv_queue.unshift(queued);
              }
              return res;
            }}};function _send(fd, buf, len, flags) {
          var sock = SOCKFS.getSocket(fd);
          if (!sock) {
            ___setErrNo(ERRNO_CODES.EBADF);
            return -1;
          }
          // TODO honor flags
          return _write(fd, buf, len);
        }
      function _pwrite(fildes, buf, nbyte, offset) {
          // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
          // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
          var stream = FS.getStream(fildes);
          if (!stream) {
            ___setErrNo(ERRNO_CODES.EBADF);
            return -1;
          }
          try {
            var slab = HEAP8;
            return FS.write(stream, slab, buf, nbyte, offset);
          } catch (e) {
            FS.handleFSError(e);
            return -1;
          }
        }function _write(fildes, buf, nbyte) {
          // ssize_t write(int fildes, const void *buf, size_t nbyte);
          // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
          var stream = FS.getStream(fildes);
          if (!stream) {
            ___setErrNo(ERRNO_CODES.EBADF);
            return -1;
          }
          try {
            var slab = HEAP8;
            return FS.write(stream, slab, buf, nbyte);
          } catch (e) {
            FS.handleFSError(e);
            return -1;
          }
        }function _fwrite(ptr, size, nitems, stream) {
          // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
          // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
          var bytesToWrite = nitems * size;
          if (bytesToWrite == 0) return 0;
          var bytesWritten = _write(stream, ptr, bytesToWrite);
          if (bytesWritten == -1) {
            var streamObj = FS.getStream(stream);
            if (streamObj) streamObj.error = true;
            return 0;
          } else {
            return Math.floor(bytesWritten / size);
          }
        }
      function _recv(fd, buf, len, flags) {
          var sock = SOCKFS.getSocket(fd);
          if (!sock) {
            ___setErrNo(ERRNO_CODES.EBADF);
            return -1;
          }
          // TODO honor flags
          return _read(fd, buf, len);
        }
      function _pread(fildes, buf, nbyte, offset) {
          // ssize_t pread(int fildes, void *buf, size_t nbyte, off_t offset);
          // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
          var stream = FS.getStream(fildes);
          if (!stream) {
            ___setErrNo(ERRNO_CODES.EBADF);
            return -1;
          }
          try {
            var slab = HEAP8;
            return FS.read(stream, slab, buf, nbyte, offset);
          } catch (e) {
            FS.handleFSError(e);
            return -1;
          }
        }function _read(fildes, buf, nbyte) {
          // ssize_t read(int fildes, void *buf, size_t nbyte);
          // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
          var stream = FS.getStream(fildes);
          if (!stream) {
            ___setErrNo(ERRNO_CODES.EBADF);
            return -1;
          }
          try {
            var slab = HEAP8;
            return FS.read(stream, slab, buf, nbyte);
          } catch (e) {
            FS.handleFSError(e);
            return -1;
          }
        }function _fread(ptr, size, nitems, stream) {
          // size_t fread(void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
          // http://pubs.opengroup.org/onlinepubs/000095399/functions/fread.html
          var bytesToRead = nitems * size;
          if (bytesToRead == 0) {
            return 0;
          }
          var bytesRead = 0;
          var streamObj = FS.getStream(stream);
          while (streamObj.ungotten.length && bytesToRead > 0) {
            HEAP8[((ptr++)|0)]=streamObj.ungotten.pop()
            bytesToRead--;
            bytesRead++;
          }
          var err = _read(stream, ptr, bytesToRead);
          if (err == -1) {
            if (streamObj) streamObj.error = true;
            return 0;
          }
          bytesRead += err;
          if (bytesRead < bytesToRead) streamObj.eof = true;
          return Math.floor(bytesRead / size);
        }
      function _strncmp(px, py, n) {
          var i = 0;
          while (i < n) {
            var x = HEAPU8[(((px)+(i))|0)];
            var y = HEAPU8[(((py)+(i))|0)];
            if (x == y && x == 0) return 0;
            if (x == 0) return -1;
            if (y == 0) return 1;
            if (x == y) {
              i ++;
              continue;
            } else {
              return x > y ? 1 : -1;
            }
          }
          return 0;
        }
      function _strncpy(pdest, psrc, num) {
          pdest = pdest|0; psrc = psrc|0; num = num|0;
          var padding = 0, curr = 0, i = 0;
          while ((i|0) < (num|0)) {
            curr = padding ? 0 : HEAP8[(((psrc)+(i))|0)];
            HEAP8[(((pdest)+(i))|0)]=curr
            padding = padding ? 1 : (HEAP8[(((psrc)+(i))|0)] == 0);
            i = (i+1)|0;
          }
          return pdest|0;
        }
      var _floorf=Math.floor;
      function _llvm_lifetime_start() {}
      function _llvm_lifetime_end() {}
      function _strlen(ptr) {
          ptr = ptr|0;
          var curr = 0;
          curr = ptr;
          while (HEAP8[(curr)]) {
            curr = (curr + 1)|0;
          }
          return (curr - ptr)|0;
        }
      var _cos=Math.cos;
      function _log10(x) {
          return Math.log(x) / Math.LN10;
        }
      function _memmove(dest, src, num) {
          dest = dest|0; src = src|0; num = num|0;
          if (((src|0) < (dest|0)) & ((dest|0) < ((src + num)|0))) {
            // Unlikely case: Copy backwards in a safe manner
            src = (src + num)|0;
            dest = (dest + num)|0;
            while ((num|0) > 0) {
              dest = (dest - 1)|0;
              src = (src - 1)|0;
              num = (num - 1)|0;
              HEAP8[(dest)]=HEAP8[(src)];
            }
          } else {
            _memcpy(dest, src, num) | 0;
          }
        }var _llvm_memmove_p0i8_p0i8_i32=_memmove;
      var _ceil=Math.ceil;
      var _llvm_memset_p0i8_i64=_memset;
      function _isspace(chr) {
          return (chr == 32) || (chr >= 9 && chr <= 13);
        }function __parseInt(str, endptr, base, min, max, bits, unsign) {
          // Skip space.
          while (_isspace(HEAP8[(str)])) str++;
          // Check for a plus/minus sign.
          var multiplier = 1;
          if (HEAP8[(str)] == 45) {
            multiplier = -1;
            str++;
          } else if (HEAP8[(str)] == 43) {
            str++;
          }
          // Find base.
          var finalBase = base;
          if (!finalBase) {
            if (HEAP8[(str)] == 48) {
              if (HEAP8[((str+1)|0)] == 120 ||
                  HEAP8[((str+1)|0)] == 88) {
                finalBase = 16;
                str += 2;
              } else {
                finalBase = 8;
                str++;
              }
            }
          } else if (finalBase==16) {
            if (HEAP8[(str)] == 48) {
              if (HEAP8[((str+1)|0)] == 120 ||
                  HEAP8[((str+1)|0)] == 88) {
                str += 2;
              }
            }
          }
          if (!finalBase) finalBase = 10;
          // Get digits.
          var chr;
          var ret = 0;
          while ((chr = HEAP8[(str)]) != 0) {
            var digit = parseInt(String.fromCharCode(chr), finalBase);
            if (isNaN(digit)) {
              break;
            } else {
              ret = ret * finalBase + digit;
              str++;
            }
          }
          // Apply sign.
          ret *= multiplier;
          // Set end pointer.
          if (endptr) {
            HEAP32[((endptr)>>2)]=str
          }
          // Unsign if needed.
          if (unsign) {
            if (Math.abs(ret) > max) {
              ret = max;
              ___setErrNo(ERRNO_CODES.ERANGE);
            } else {
              ret = unSign(ret, bits);
            }
          }
          // Validate range.
          if (ret > max || ret < min) {
            ret = ret > max ? max : min;
            ___setErrNo(ERRNO_CODES.ERANGE);
          }
          if (bits == 64) {
            return tempRet0 = (tempDouble=ret,Math.abs(tempDouble) >= 1 ? (tempDouble > 0 ? Math.min(Math.floor((tempDouble)/4294967296), 4294967295)>>>0 : (~~(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296)))>>>0) : 0),ret>>>0;
          }
          return ret;
        }function _strtol(str, endptr, base) {
          return __parseInt(str, endptr, base, -2147483648, 2147483647, 32);  // LONG_MIN, LONG_MAX.
        }function _atoi(ptr) {
          return _strtol(ptr, null, 10);
        }
      function _strchr(ptr, chr) {
          ptr--;
          do {
            ptr++;
            var val = HEAP8[(ptr)];
            if (val == chr) return ptr;
          } while (val);
          return 0;
        }
      function __reallyNegative(x) {
          return x < 0 || (x === 0 && (1/x) === -Infinity);
        }function __formatString(format, varargs) {
          var textIndex = format;
          var argIndex = 0;
          function getNextArg(type) {
            // NOTE: Explicitly ignoring type safety. Otherwise this fails:
            //       int x = 4; printf("%c\n", (char)x);
            var ret;
            if (type === 'double') {
              ret = HEAPF64[(((varargs)+(argIndex))>>3)];
            } else if (type == 'i64') {
              ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                     HEAP32[(((varargs)+(argIndex+8))>>2)]];
              argIndex += 8; // each 32-bit chunk is in a 64-bit block
            } else {
              type = 'i32'; // varargs are always i32, i64, or double
              ret = HEAP32[(((varargs)+(argIndex))>>2)];
            }
            argIndex += Math.max(Runtime.getNativeFieldSize(type), Runtime.getAlignSize(type, null, true));
            return ret;
          }
          var ret = [];
          var curr, next, currArg;
          while(1) {
            var startTextIndex = textIndex;
            curr = HEAP8[(textIndex)];
            if (curr === 0) break;
            next = HEAP8[((textIndex+1)|0)];
            if (curr == 37) {
              // Handle flags.
              var flagAlwaysSigned = false;
              var flagLeftAlign = false;
              var flagAlternative = false;
              var flagZeroPad = false;
              var flagPadSign = false;
              flagsLoop: while (1) {
                switch (next) {
                  case 43:
                    flagAlwaysSigned = true;
                    break;
                  case 45:
                    flagLeftAlign = true;
                    break;
                  case 35:
                    flagAlternative = true;
                    break;
                  case 48:
                    if (flagZeroPad) {
                      break flagsLoop;
                    } else {
                      flagZeroPad = true;
                      break;
                    }
                  case 32:
                    flagPadSign = true;
                    break;
                  default:
                    break flagsLoop;
                }
                textIndex++;
                next = HEAP8[((textIndex+1)|0)];
              }
              // Handle width.
              var width = 0;
              if (next == 42) {
                width = getNextArg('i32');
                textIndex++;
                next = HEAP8[((textIndex+1)|0)];
              } else {
                while (next >= 48 && next <= 57) {
                  width = width * 10 + (next - 48);
                  textIndex++;
                  next = HEAP8[((textIndex+1)|0)];
                }
              }
              // Handle precision.
              var precisionSet = false;
              if (next == 46) {
                var precision = 0;
                precisionSet = true;
                textIndex++;
                next = HEAP8[((textIndex+1)|0)];
                if (next == 42) {
                  precision = getNextArg('i32');
                  textIndex++;
                } else {
                  while(1) {
                    var precisionChr = HEAP8[((textIndex+1)|0)];
                    if (precisionChr < 48 ||
                        precisionChr > 57) break;
                    precision = precision * 10 + (precisionChr - 48);
                    textIndex++;
                  }
                }
                next = HEAP8[((textIndex+1)|0)];
              } else {
                var precision = 6; // Standard default.
              }
              // Handle integer sizes. WARNING: These assume a 32-bit architecture!
              var argSize;
              switch (String.fromCharCode(next)) {
                case 'h':
                  var nextNext = HEAP8[((textIndex+2)|0)];
                  if (nextNext == 104) {
                    textIndex++;
                    argSize = 1; // char (actually i32 in varargs)
                  } else {
                    argSize = 2; // short (actually i32 in varargs)
                  }
                  break;
                case 'l':
                  var nextNext = HEAP8[((textIndex+2)|0)];
                  if (nextNext == 108) {
                    textIndex++;
                    argSize = 8; // long long
                  } else {
                    argSize = 4; // long
                  }
                  break;
                case 'L': // long long
                case 'q': // int64_t
                case 'j': // intmax_t
                  argSize = 8;
                  break;
                case 'z': // size_t
                case 't': // ptrdiff_t
                case 'I': // signed ptrdiff_t or unsigned size_t
                  argSize = 4;
                  break;
                default:
                  argSize = null;
              }
              if (argSize) textIndex++;
              next = HEAP8[((textIndex+1)|0)];
              // Handle type specifier.
              switch (String.fromCharCode(next)) {
                case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
                  // Integer.
                  var signed = next == 100 || next == 105;
                  argSize = argSize || 4;
                  var currArg = getNextArg('i' + (argSize * 8));
                  var origArg = currArg;
                  var argText;
                  // Flatten i64-1 [low, high] into a (slightly rounded) double
                  if (argSize == 8) {
                    currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
                  }
                  // Truncate to requested size.
                  if (argSize <= 4) {
                    var limit = Math.pow(256, argSize) - 1;
                    currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
                  }
                  // Format the number.
                  var currAbsArg = Math.abs(currArg);
                  var prefix = '';
                  if (next == 100 || next == 105) {
                    if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                    argText = reSign(currArg, 8 * argSize, 1).toString(10);
                  } else if (next == 117) {
                    if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                    argText = unSign(currArg, 8 * argSize, 1).toString(10);
                    currArg = Math.abs(currArg);
                  } else if (next == 111) {
                    argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
                  } else if (next == 120 || next == 88) {
                    prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                    if (argSize == 8 && i64Math) {
                      if (origArg[1]) {
                        argText = (origArg[1]>>>0).toString(16);
                        var lower = (origArg[0]>>>0).toString(16);
                        while (lower.length < 8) lower = '0' + lower;
                        argText += lower;
                      } else {
                        argText = (origArg[0]>>>0).toString(16);
                      }
                    } else
                    if (currArg < 0) {
                      // Represent negative numbers in hex as 2's complement.
                      currArg = -currArg;
                      argText = (currAbsArg - 1).toString(16);
                      var buffer = [];
                      for (var i = 0; i < argText.length; i++) {
                        buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                      }
                      argText = buffer.join('');
                      while (argText.length < argSize * 2) argText = 'f' + argText;
                    } else {
                      argText = currAbsArg.toString(16);
                    }
                    if (next == 88) {
                      prefix = prefix.toUpperCase();
                      argText = argText.toUpperCase();
                    }
                  } else if (next == 112) {
                    if (currAbsArg === 0) {
                      argText = '(nil)';
                    } else {
                      prefix = '0x';
                      argText = currAbsArg.toString(16);
                    }
                  }
                  if (precisionSet) {
                    while (argText.length < precision) {
                      argText = '0' + argText;
                    }
                  }
                  // Add sign if needed
                  if (currArg >= 0) {
                    if (flagAlwaysSigned) {
                      prefix = '+' + prefix;
                    } else if (flagPadSign) {
                      prefix = ' ' + prefix;
                    }
                  }
                  // Move sign to prefix so we zero-pad after the sign
                  if (argText.charAt(0) == '-') {
                    prefix = '-' + prefix;
                    argText = argText.substr(1);
                  }
                  // Add padding.
                  while (prefix.length + argText.length < width) {
                    if (flagLeftAlign) {
                      argText += ' ';
                    } else {
                      if (flagZeroPad) {
                        argText = '0' + argText;
                      } else {
                        prefix = ' ' + prefix;
                      }
                    }
                  }
                  // Insert the result into the buffer.
                  argText = prefix + argText;
                  argText.split('').forEach(function(chr) {
                    ret.push(chr.charCodeAt(0));
                  });
                  break;
                }
                case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
                  // Float.
                  var currArg = getNextArg('double');
                  var argText;
                  if (isNaN(currArg)) {
                    argText = 'nan';
                    flagZeroPad = false;
                  } else if (!isFinite(currArg)) {
                    argText = (currArg < 0 ? '-' : '') + 'inf';
                    flagZeroPad = false;
                  } else {
                    var isGeneral = false;
                    var effectivePrecision = Math.min(precision, 20);
                    // Convert g/G to f/F or e/E, as per:
                    // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                    if (next == 103 || next == 71) {
                      isGeneral = true;
                      precision = precision || 1;
                      var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                      if (precision > exponent && exponent >= -4) {
                        next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                        precision -= exponent + 1;
                      } else {
                        next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                        precision--;
                      }
                      effectivePrecision = Math.min(precision, 20);
                    }
                    if (next == 101 || next == 69) {
                      argText = currArg.toExponential(effectivePrecision);
                      // Make sure the exponent has at least 2 digits.
                      if (/[eE][-+]\d$/.test(argText)) {
                        argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                      }
                    } else if (next == 102 || next == 70) {
                      argText = currArg.toFixed(effectivePrecision);
                      if (currArg === 0 && __reallyNegative(currArg)) {
                        argText = '-' + argText;
                      }
                    }
                    var parts = argText.split('e');
                    if (isGeneral && !flagAlternative) {
                      // Discard trailing zeros and periods.
                      while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                             (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                        parts[0] = parts[0].slice(0, -1);
                      }
                    } else {
                      // Make sure we have a period in alternative mode.
                      if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                      // Zero pad until required precision.
                      while (precision > effectivePrecision++) parts[0] += '0';
                    }
                    argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
                    // Capitalize 'E' if needed.
                    if (next == 69) argText = argText.toUpperCase();
                    // Add sign.
                    if (currArg >= 0) {
                      if (flagAlwaysSigned) {
                        argText = '+' + argText;
                      } else if (flagPadSign) {
                        argText = ' ' + argText;
                      }
                    }
                  }
                  // Add padding.
                  while (argText.length < width) {
                    if (flagLeftAlign) {
                      argText += ' ';
                    } else {
                      if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                        argText = argText[0] + '0' + argText.slice(1);
                      } else {
                        argText = (flagZeroPad ? '0' : ' ') + argText;
                      }
                    }
                  }
                  // Adjust case.
                  if (next < 97) argText = argText.toUpperCase();
                  // Insert the result into the buffer.
                  argText.split('').forEach(function(chr) {
                    ret.push(chr.charCodeAt(0));
                  });
                  break;
                }
                case 's': {
                  // String.
                  var arg = getNextArg('i8*');
                  var argLength = arg ? _strlen(arg) : '(null)'.length;
                  if (precisionSet) argLength = Math.min(argLength, precision);
                  if (!flagLeftAlign) {
                    while (argLength < width--) {
                      ret.push(32);
                    }
                  }
                  if (arg) {
                    for (var i = 0; i < argLength; i++) {
                      ret.push(HEAPU8[((arg++)|0)]);
                    }
                  } else {
                    ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
                  }
                  if (flagLeftAlign) {
                    while (argLength < width--) {
                      ret.push(32);
                    }
                  }
                  break;
                }
                case 'c': {
                  // Character.
                  if (flagLeftAlign) ret.push(getNextArg('i8'));
                  while (--width > 0) {
                    ret.push(32);
                  }
                  if (!flagLeftAlign) ret.push(getNextArg('i8'));
                  break;
                }
                case 'n': {
                  // Write the length written so far to the next parameter.
                  var ptr = getNextArg('i32*');
                  HEAP32[((ptr)>>2)]=ret.length
                  break;
                }
                case '%': {
                  // Literal percent sign.
                  ret.push(curr);
                  break;
                }
                default: {
                  // Unknown specifiers remain untouched.
                  for (var i = startTextIndex; i < textIndex + 2; i++) {
                    ret.push(HEAP8[(i)]);
                  }
                }
              }
              textIndex += 2;
              // TODO: Support a/A (hex float) and m (last error) specifiers.
              // TODO: Support %1${specifier} for arg selection.
            } else {
              ret.push(curr);
              textIndex += 1;
            }
          }
          return ret;
        }function _snprintf(s, n, format, varargs) {
          // int snprintf(char *restrict s, size_t n, const char *restrict format, ...);
          // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
          var result = __formatString(format, varargs);
          var limit = (n === undefined) ? result.length
                                        : Math.min(result.length, Math.max(n - 1, 0));
          if (s < 0) {
            s = -s;
            var buf = _malloc(limit+1);
            HEAP32[((s)>>2)]=buf;
            s = buf;
          }
          for (var i = 0; i < limit; i++) {
            HEAP8[(((s)+(i))|0)]=result[i];
          }
          if (limit < n || (n === undefined)) HEAP8[(((s)+(i))|0)]=0;
          return result.length;
        }function _sprintf(s, format, varargs) {
          // int sprintf(char *restrict s, const char *restrict format, ...);
          // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
          return _snprintf(s, undefined, format, varargs);
        }
      function _toupper(chr) {
          if (chr >= 97 && chr <= 122) {
            return chr - 97 + 65;
          } else {
            return chr;
          }
        }
      function _tolower(chr) {
          chr = chr|0;
          if ((chr|0) < 65) return chr|0;
          if ((chr|0) > 90) return chr|0;
          return (chr - 65 + 97)|0;
        }
      function _llvm_bswap_i16(x) {
          return ((x&0xff)<<8) | ((x>>8)&0xff);
        }
      var _llvm_pow_f64=Math.pow;
      var _llvm_pow_f32=Math.pow;
      var _floor=Math.floor;
      var _fabsf=Math.abs;
      var _ExitMP3=undefined;
      var _InitMP3=undefined;
      var _decodeMP3=undefined;
      var _decodeMP3_unclipped=undefined;
      var _log=Math.log;
      var _exp=Math.exp;
      var _sqrt=Math.sqrt;
      function __exit(status) {
          // void _exit(int status);
          // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
          Module.print('exit(' + status + ') called');
          Module['exit'](status);
        }function _exit(status) {
          __exit(status);
        }
      var _fabs=Math.abs;
      function _qsort(base, num, size, cmp) {
          if (num == 0 || size == 0) return;
          // forward calls to the JavaScript sort method
          // first, sort the items logically
          var keys = [];
          for (var i = 0; i < num; i++) keys.push(i);
          keys.sort(function(a, b) {
            return FUNCTION_TABLE[cmp](base+a*size, base+b*size);
          });
          // apply the sort
          var temp = _malloc(num*size);
          _memcpy(temp, base, num*size);
          for (var i = 0; i < num; i++) {
            if (keys[i] == i) continue; // already in place
            _memcpy(base+i*size, temp+keys[i]*size, size);
          }
          _free(temp);
        }
      function _exp2(x) {
          return Math.pow(2, x);
        }
      var _atan=Math.atan;
      function _fprintf(stream, format, varargs) {
          // int fprintf(FILE *restrict stream, const char *restrict format, ...);
          // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
          var result = __formatString(format, varargs);
          var stack = Runtime.stackSave();
          var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
          Runtime.stackRestore(stack);
          return ret;
        }function _vfprintf(s, f, va_arg) {
          return _fprintf(s, f, HEAP32[((va_arg)>>2)]);
        }
      var _llvm_va_start=undefined;
      function _llvm_va_end() {}
      var _sin=Math.sin;
      var _log10f=_log10;
      function _abort() {
          Module['abort']();
        }
      function ___errno_location() {
          return ___errno_state;
        }
      function _sbrk(bytes) {
          // Implement a Linux-like 'memory area' for our 'process'.
          // Changes the size of the memory area by |bytes|; returns the
          // address of the previous top ('break') of the memory area
          // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
          var self = _sbrk;
          if (!self.called) {
            DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
            self.called = true;
            assert(Runtime.dynamicAlloc);
            self.alloc = Runtime.dynamicAlloc;
            Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
          }
          var ret = DYNAMICTOP;
          if (bytes != 0) self.alloc(bytes);
          return ret;  // Previous break location.
        }
      function _sysconf(name) {
          // long sysconf(int name);
          // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
          switch(name) {
            case 30: return PAGE_SIZE;
            case 132:
            case 133:
            case 12:
            case 137:
            case 138:
            case 15:
            case 235:
            case 16:
            case 17:
            case 18:
            case 19:
            case 20:
            case 149:
            case 13:
            case 10:
            case 236:
            case 153:
            case 9:
            case 21:
            case 22:
            case 159:
            case 154:
            case 14:
            case 77:
            case 78:
            case 139:
            case 80:
            case 81:
            case 79:
            case 82:
            case 68:
            case 67:
            case 164:
            case 11:
            case 29:
            case 47:
            case 48:
            case 95:
            case 52:
            case 51:
            case 46:
              return 200809;
            case 27:
            case 246:
            case 127:
            case 128:
            case 23:
            case 24:
            case 160:
            case 161:
            case 181:
            case 182:
            case 242:
            case 183:
            case 184:
            case 243:
            case 244:
            case 245:
            case 165:
            case 178:
            case 179:
            case 49:
            case 50:
            case 168:
            case 169:
            case 175:
            case 170:
            case 171:
            case 172:
            case 97:
            case 76:
            case 32:
            case 173:
            case 35:
              return -1;
            case 176:
            case 177:
            case 7:
            case 155:
            case 8:
            case 157:
            case 125:
            case 126:
            case 92:
            case 93:
            case 129:
            case 130:
            case 131:
            case 94:
            case 91:
              return 1;
            case 74:
            case 60:
            case 69:
            case 70:
            case 4:
              return 1024;
            case 31:
            case 42:
            case 72:
              return 32;
            case 87:
            case 26:
            case 33:
              return 2147483647;
            case 34:
            case 1:
              return 47839;
            case 38:
            case 36:
              return 99;
            case 43:
            case 37:
              return 2048;
            case 0: return 2097152;
            case 3: return 65536;
            case 28: return 32768;
            case 44: return 32767;
            case 75: return 16384;
            case 39: return 1000;
            case 89: return 700;
            case 71: return 256;
            case 40: return 255;
            case 2: return 100;
            case 180: return 64;
            case 25: return 20;
            case 5: return 16;
            case 6: return 6;
            case 73: return 4;
            case 84: return 1;
          }
          ___setErrNo(ERRNO_CODES.EINVAL);
          return -1;
        }
      function _time(ptr) {
          var ret = Math.floor(Date.now()/1000);
          if (ptr) {
            HEAP32[((ptr)>>2)]=ret
          }
          return ret;
        }
      function ___gxx_personality_v0() {
        }
      function ___cxa_allocate_exception(size) {
          return _malloc(size);
        }
      function _llvm_eh_exception() {
          return HEAP32[((_llvm_eh_exception.buf)>>2)];
        }
      function __ZSt18uncaught_exceptionv() { // std::uncaught_exception()
          return !!__ZSt18uncaught_exceptionv.uncaught_exception;
        }
      function ___cxa_is_number_type(type) {
          var isNumber = false;
          try { if (type == __ZTIi) isNumber = true } catch(e){}
          try { if (type == __ZTIj) isNumber = true } catch(e){}
          try { if (type == __ZTIl) isNumber = true } catch(e){}
          try { if (type == __ZTIm) isNumber = true } catch(e){}
          try { if (type == __ZTIx) isNumber = true } catch(e){}
          try { if (type == __ZTIy) isNumber = true } catch(e){}
          try { if (type == __ZTIf) isNumber = true } catch(e){}
          try { if (type == __ZTId) isNumber = true } catch(e){}
          try { if (type == __ZTIe) isNumber = true } catch(e){}
          try { if (type == __ZTIc) isNumber = true } catch(e){}
          try { if (type == __ZTIa) isNumber = true } catch(e){}
          try { if (type == __ZTIh) isNumber = true } catch(e){}
          try { if (type == __ZTIs) isNumber = true } catch(e){}
          try { if (type == __ZTIt) isNumber = true } catch(e){}
          return isNumber;
        }function ___cxa_does_inherit(definiteType, possibilityType, possibility) {
          if (possibility == 0) return false;
          if (possibilityType == 0 || possibilityType == definiteType)
            return true;
          var possibility_type_info;
          if (___cxa_is_number_type(possibilityType)) {
            possibility_type_info = possibilityType;
          } else {
            var possibility_type_infoAddr = HEAP32[((possibilityType)>>2)] - 8;
            possibility_type_info = HEAP32[((possibility_type_infoAddr)>>2)];
          }
          switch (possibility_type_info) {
          case 0: // possibility is a pointer
            // See if definite type is a pointer
            var definite_type_infoAddr = HEAP32[((definiteType)>>2)] - 8;
            var definite_type_info = HEAP32[((definite_type_infoAddr)>>2)];
            if (definite_type_info == 0) {
              // Also a pointer; compare base types of pointers
              var defPointerBaseAddr = definiteType+8;
              var defPointerBaseType = HEAP32[((defPointerBaseAddr)>>2)];
              var possPointerBaseAddr = possibilityType+8;
              var possPointerBaseType = HEAP32[((possPointerBaseAddr)>>2)];
              return ___cxa_does_inherit(defPointerBaseType, possPointerBaseType, possibility);
            } else
              return false; // one pointer and one non-pointer
          case 1: // class with no base class
            return false;
          case 2: // class with base class
            var parentTypeAddr = possibilityType + 8;
            var parentType = HEAP32[((parentTypeAddr)>>2)];
            return ___cxa_does_inherit(definiteType, parentType, possibility);
          default:
            return false; // some unencountered type
          }
        }
      function ___resumeException(ptr) {
          if (HEAP32[((_llvm_eh_exception.buf)>>2)] == 0) HEAP32[((_llvm_eh_exception.buf)>>2)]=ptr;
          throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";;
        }function ___cxa_find_matching_catch(thrown, throwntype) {
          if (thrown == -1) thrown = HEAP32[((_llvm_eh_exception.buf)>>2)];
          if (throwntype == -1) throwntype = HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)];
          var typeArray = Array.prototype.slice.call(arguments, 2);
          // If throwntype is a pointer, this means a pointer has been
          // thrown. When a pointer is thrown, actually what's thrown
          // is a pointer to the pointer. We'll dereference it.
          if (throwntype != 0 && !___cxa_is_number_type(throwntype)) {
            var throwntypeInfoAddr= HEAP32[((throwntype)>>2)] - 8;
            var throwntypeInfo= HEAP32[((throwntypeInfoAddr)>>2)];
            if (throwntypeInfo == 0)
              thrown = HEAP32[((thrown)>>2)];
          }
          // The different catch blocks are denoted by different types.
          // Due to inheritance, those types may not precisely match the
          // type of the thrown object. Find one which matches, and
          // return the type of the catch block which should be called.
          for (var i = 0; i < typeArray.length; i++) {
            if (___cxa_does_inherit(typeArray[i], throwntype, thrown))
              return tempRet0 = typeArray[i],thrown;
          }
          // Shouldn't happen unless we have bogus data in typeArray
          // or encounter a type for which emscripten doesn't have suitable
          // typeinfo defined. Best-efforts match just in case.
          return tempRet0 = throwntype,thrown;
        }function ___cxa_throw(ptr, type, destructor) {
          if (!___cxa_throw.initialized) {
            try {
              HEAP32[((__ZTVN10__cxxabiv119__pointer_type_infoE)>>2)]=0; // Workaround for libcxxabi integration bug
            } catch(e){}
            try {
              HEAP32[((__ZTVN10__cxxabiv117__class_type_infoE)>>2)]=1; // Workaround for libcxxabi integration bug
            } catch(e){}
            try {
              HEAP32[((__ZTVN10__cxxabiv120__si_class_type_infoE)>>2)]=2; // Workaround for libcxxabi integration bug
            } catch(e){}
            ___cxa_throw.initialized = true;
          }
          HEAP32[((_llvm_eh_exception.buf)>>2)]=ptr
          HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)]=type
          HEAP32[(((_llvm_eh_exception.buf)+(8))>>2)]=destructor
          if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
            __ZSt18uncaught_exceptionv.uncaught_exception = 1;
          } else {
            __ZSt18uncaught_exceptionv.uncaught_exception++;
          }
          throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";;
        }
      function ___cxa_call_unexpected(exception) {
          Module.printErr('Unexpected exception thrown, this is not properly supported - aborting');
          ABORT = true;
          throw exception;
        }
      function ___cxa_begin_catch(ptr) {
          __ZSt18uncaught_exceptionv.uncaught_exception--;
          return ptr;
        }
      function ___cxa_free_exception(ptr) {
          try {
            return _free(ptr);
          } catch(e) { // XXX FIXME
          }
        }function ___cxa_end_catch() {
          if (___cxa_end_catch.rethrown) {
            ___cxa_end_catch.rethrown = false;
            return;
          }
          // Clear state flag.
          __THREW__ = 0;
          // Clear type.
          HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)]=0
          // Call destructor if one is registered then clear it.
          var ptr = HEAP32[((_llvm_eh_exception.buf)>>2)];
          var destructor = HEAP32[(((_llvm_eh_exception.buf)+(8))>>2)];
          if (destructor) {
            Runtime.dynCall('vi', destructor, [ptr]);
            HEAP32[(((_llvm_eh_exception.buf)+(8))>>2)]=0
          }
          // Free ptr if it isn't null.
          if (ptr) {
            ___cxa_free_exception(ptr);
            HEAP32[((_llvm_eh_exception.buf)>>2)]=0
          }
        }
      var _environ=allocate(1, "i32*", ALLOC_STATIC);var ___environ=_environ;function ___buildEnvironment(env) {
          // WARNING: Arbitrary limit!
          var MAX_ENV_VALUES = 64;
          var TOTAL_ENV_SIZE = 1024;
          // Statically allocate memory for the environment.
          var poolPtr;
          var envPtr;
          if (!___buildEnvironment.called) {
            ___buildEnvironment.called = true;
            // Set default values. Use string keys for Closure Compiler compatibility.
            ENV['USER'] = 'root';
            ENV['PATH'] = '/';
            ENV['PWD'] = '/';
            ENV['HOME'] = '/home/emscripten';
            ENV['LANG'] = 'en_US.UTF-8';
            ENV['_'] = './this.program';
            // Allocate memory.
            poolPtr = allocate(TOTAL_ENV_SIZE, 'i8', ALLOC_STATIC);
            envPtr = allocate(MAX_ENV_VALUES * 4,
                              'i8*', ALLOC_STATIC);
            HEAP32[((envPtr)>>2)]=poolPtr
            HEAP32[((_environ)>>2)]=envPtr;
          } else {
            envPtr = HEAP32[((_environ)>>2)];
            poolPtr = HEAP32[((envPtr)>>2)];
          }
          // Collect key=value lines.
          var strings = [];
          var totalSize = 0;
          for (var key in env) {
            if (typeof env[key] === 'string') {
              var line = key + '=' + env[key];
              strings.push(line);
              totalSize += line.length;
            }
          }
          if (totalSize > TOTAL_ENV_SIZE) {
            throw new Error('Environment size exceeded TOTAL_ENV_SIZE!');
          }
          // Make new.
          var ptrSize = 4;
          for (var i = 0; i < strings.length; i++) {
            var line = strings[i];
            for (var j = 0; j < line.length; j++) {
              HEAP8[(((poolPtr)+(j))|0)]=line.charCodeAt(j);
            }
            HEAP8[(((poolPtr)+(j))|0)]=0;
            HEAP32[(((envPtr)+(i * ptrSize))>>2)]=poolPtr;
            poolPtr += line.length + 1;
          }
          HEAP32[(((envPtr)+(strings.length * ptrSize))>>2)]=0;
        }var ENV={};function _getenv(name) {
          // char *getenv(const char *name);
          // http://pubs.opengroup.org/onlinepubs/009695399/functions/getenv.html
          if (name === 0) return 0;
          name = Pointer_stringify(name);
          if (!ENV.hasOwnProperty(name)) return 0;
          if (_getenv.ret) _free(_getenv.ret);
          _getenv.ret = allocate(intArrayFromString(ENV[name]), 'i8', ALLOC_NORMAL);
          return _getenv.ret;
        }
      function _strerror_r(errnum, strerrbuf, buflen) {
          if (errnum in ERRNO_MESSAGES) {
            if (ERRNO_MESSAGES[errnum].length > buflen - 1) {
              return ___setErrNo(ERRNO_CODES.ERANGE);
            } else {
              var msg = ERRNO_MESSAGES[errnum];
              for (var i = 0; i < msg.length; i++) {
                HEAP8[(((strerrbuf)+(i))|0)]=msg.charCodeAt(i)
              }
              HEAP8[(((strerrbuf)+(i))|0)]=0
              return 0;
            }
          } else {
            return ___setErrNo(ERRNO_CODES.EINVAL);
          }
        }function _strerror(errnum) {
          if (!_strerror.buffer) _strerror.buffer = _malloc(256);
          _strerror_r(errnum, _strerror.buffer, 256);
          return _strerror.buffer;
        }
      function _fputc(c, stream) {
          // int fputc(int c, FILE *stream);
          // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputc.html
          var chr = unSign(c & 0xFF);
          HEAP8[((_fputc.ret)|0)]=chr
          var ret = _write(stream, _fputc.ret, 1);
          if (ret == -1) {
            var streamObj = FS.getStream(stream);
            if (streamObj) streamObj.error = true;
            return -1;
          } else {
            return chr;
          }
        }
      var Browser={mainLoop:{scheduler:null,shouldPause:false,paused:false,queue:[],pause:function () {
              Browser.mainLoop.shouldPause = true;
            },resume:function () {
              if (Browser.mainLoop.paused) {
                Browser.mainLoop.paused = false;
                Browser.mainLoop.scheduler();
              }
              Browser.mainLoop.shouldPause = false;
            },updateStatus:function () {
              if (Module['setStatus']) {
                var message = Module['statusMessage'] || 'Please wait...';
                var remaining = Browser.mainLoop.remainingBlockers;
                var expected = Browser.mainLoop.expectedBlockers;
                if (remaining) {
                  if (remaining < expected) {
                    Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
                  } else {
                    Module['setStatus'](message);
                  }
                } else {
                  Module['setStatus']('');
                }
              }
            }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
            if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
            if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
            Browser.initted = true;
            try {
              new Blob();
              Browser.hasBlobConstructor = true;
            } catch(e) {
              Browser.hasBlobConstructor = false;
              console.log("warning: no blob constructor, cannot create blobs with mimetypes");
            }
            Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
            Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
            if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
              console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
              Module.noImageDecoding = true;
            }
            // Support for plugins that can process preloaded files. You can add more of these to
            // your app by creating and appending to Module.preloadPlugins.
            //
            // Each plugin is asked if it can handle a file based on the file's name. If it can,
            // it is given the file's raw data. When it is done, it calls a callback with the file's
            // (possibly modified) data. For example, a plugin might decompress a file, or it
            // might create some side data structure for use later (like an Image element, etc.).
            var imagePlugin = {};
            imagePlugin['canHandle'] = function(name) {
              return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
            };
            imagePlugin['handle'] = function(byteArray, name, onload, onerror) {
              var b = null;
              if (Browser.hasBlobConstructor) {
                try {
                  b = new Blob([byteArray], { type: Browser.getMimetype(name) });
                  if (b.size !== byteArray.length) { // Safari bug #118630
                    // Safari's Blob can only take an ArrayBuffer
                    b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
                  }
                } catch(e) {
                  Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
                }
              }
              if (!b) {
                var bb = new Browser.BlobBuilder();
                bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
                b = bb.getBlob();
              }
              var url = Browser.URLObject.createObjectURL(b);
              var img = new Image();
              img.onload = function() {
                assert(img.complete, 'Image ' + name + ' could not be decoded');
                var canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                Module["preloadedImages"][name] = canvas;
                Browser.URLObject.revokeObjectURL(url);
                if (onload) onload(byteArray);
              };
              img.onerror = function(event) {
                console.log('Image ' + url + ' could not be decoded');
                if (onerror) onerror();
              };
              img.src = url;
            };
            Module['preloadPlugins'].push(imagePlugin);
            var audioPlugin = {};
            audioPlugin['canHandle'] = function(name) {
              return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
            };
            audioPlugin['handle'] = function(byteArray, name, onload, onerror) {
              var done = false;
              function finish(audio) {
                if (done) return;
                done = true;
                Module["preloadedAudios"][name] = audio;
                if (onload) onload(byteArray);
              }
              function fail() {
                if (done) return;
                done = true;
                Module["preloadedAudios"][name] = new Audio(); // empty shim
                if (onerror) onerror();
              }
              if (Browser.hasBlobConstructor) {
                try {
                  var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
                } catch(e) {
                  return fail();
                }
                var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
                var audio = new Audio();
                audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
                audio.onerror = function(event) {
                  if (done) return;
                  console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
                  function encode64(data) {
                    var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                    var PAD = '=';
                    var ret = '';
                    var leftchar = 0;
                    var leftbits = 0;
                    for (var i = 0; i < data.length; i++) {
                      leftchar = (leftchar << 8) | data[i];
                      leftbits += 8;
                      while (leftbits >= 6) {
                        var curr = (leftchar >> (leftbits-6)) & 0x3f;
                        leftbits -= 6;
                        ret += BASE[curr];
                      }
                    }
                    if (leftbits == 2) {
                      ret += BASE[(leftchar&3) << 4];
                      ret += PAD + PAD;
                    } else if (leftbits == 4) {
                      ret += BASE[(leftchar&0xf) << 2];
                      ret += PAD;
                    }
                    return ret;
                  }
                  audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
                  finish(audio); // we don't wait for confirmation this worked - but it's worth trying
                };
                audio.src = url;
                // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
                Browser.safeSetTimeout(function() {
                  finish(audio); // try to use it even though it is not necessarily ready to play
                }, 10000);
              } else {
                return fail();
              }
            };
            Module['preloadPlugins'].push(audioPlugin);
            // Canvas event setup
            var canvas = Module['canvas'];
            canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                        canvas['mozRequestPointerLock'] ||
                                        canvas['webkitRequestPointerLock'];
            canvas.exitPointerLock = document['exitPointerLock'] ||
                                     document['mozExitPointerLock'] ||
                                     document['webkitExitPointerLock'] ||
                                     function(){}; // no-op if function does not exist
            canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
            function pointerLockChange() {
              Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                    document['mozPointerLockElement'] === canvas ||
                                    document['webkitPointerLockElement'] === canvas;
            }
            document.addEventListener('pointerlockchange', pointerLockChange, false);
            document.addEventListener('mozpointerlockchange', pointerLockChange, false);
            document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
            if (Module['elementPointerLock']) {
              canvas.addEventListener("click", function(ev) {
                if (!Browser.pointerLock && canvas.requestPointerLock) {
                  canvas.requestPointerLock();
                  ev.preventDefault();
                }
              }, false);
            }
          },createContext:function (canvas, useWebGL, setInModule) {
            var ctx;
            try {
              if (useWebGL) {
                ctx = canvas.getContext('experimental-webgl', {
                  alpha: false
                });
              } else {
                ctx = canvas.getContext('2d');
              }
              if (!ctx) throw ':(';
            } catch (e) {
              Module.print('Could not create canvas - ' + e);
              return null;
            }
            if (useWebGL) {
              // Set the background of the WebGL canvas to black
              canvas.style.backgroundColor = "black";
              // Warn on context loss
              canvas.addEventListener('webglcontextlost', function(event) {
                alert('WebGL context lost. You will need to reload the page.');
              }, false);
            }
            if (setInModule) {
              Module.ctx = ctx;
              Module.useWebGL = useWebGL;
              Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
              Browser.init();
            }
            return ctx;
          },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
            Browser.lockPointer = lockPointer;
            Browser.resizeCanvas = resizeCanvas;
            if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
            if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
            var canvas = Module['canvas'];
            function fullScreenChange() {
              Browser.isFullScreen = false;
              if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
                   document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
                   document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
                canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                          document['mozCancelFullScreen'] ||
                                          document['webkitCancelFullScreen'];
                canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
                if (Browser.lockPointer) canvas.requestPointerLock();
                Browser.isFullScreen = true;
                if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
              } else if (Browser.resizeCanvas){
                Browser.setWindowedCanvasSize();
              }
              if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
            }
            if (!Browser.fullScreenHandlersInstalled) {
              Browser.fullScreenHandlersInstalled = true;
              document.addEventListener('fullscreenchange', fullScreenChange, false);
              document.addEventListener('mozfullscreenchange', fullScreenChange, false);
              document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
            }
            canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                       canvas['mozRequestFullScreen'] ||
                                       (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
            canvas.requestFullScreen();
          },requestAnimationFrame:function (func) {
            if (!window.requestAnimationFrame) {
              window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                             window['mozRequestAnimationFrame'] ||
                                             window['webkitRequestAnimationFrame'] ||
                                             window['msRequestAnimationFrame'] ||
                                             window['oRequestAnimationFrame'] ||
                                             window['setTimeout'];
            }
            window.requestAnimationFrame(func);
          },safeCallback:function (func) {
            return function() {
              if (!ABORT) return func.apply(null, arguments);
            };
          },safeRequestAnimationFrame:function (func) {
            return Browser.requestAnimationFrame(function() {
              if (!ABORT) func();
            });
          },safeSetTimeout:function (func, timeout) {
            return setTimeout(function() {
              if (!ABORT) func();
            }, timeout);
          },safeSetInterval:function (func, timeout) {
            return setInterval(function() {
              if (!ABORT) func();
            }, timeout);
          },getMimetype:function (name) {
            return {
              'jpg': 'image/jpeg',
              'jpeg': 'image/jpeg',
              'png': 'image/png',
              'bmp': 'image/bmp',
              'ogg': 'audio/ogg',
              'wav': 'audio/wav',
              'mp3': 'audio/mpeg'
            }[name.substr(name.lastIndexOf('.')+1)];
          },getUserMedia:function (func) {
            if(!window.getUserMedia) {
              window.getUserMedia = navigator['getUserMedia'] ||
                                    navigator['mozGetUserMedia'];
            }
            window.getUserMedia(func);
          },getMovementX:function (event) {
            return event['movementX'] ||
                   event['mozMovementX'] ||
                   event['webkitMovementX'] ||
                   0;
          },getMovementY:function (event) {
            return event['movementY'] ||
                   event['mozMovementY'] ||
                   event['webkitMovementY'] ||
                   0;
          },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
            if (Browser.pointerLock) {
              // When the pointer is locked, calculate the coordinates
              // based on the movement of the mouse.
              // Workaround for Firefox bug 764498
              if (event.type != 'mousemove' &&
                  ('mozMovementX' in event)) {
                Browser.mouseMovementX = Browser.mouseMovementY = 0;
              } else {
                Browser.mouseMovementX = Browser.getMovementX(event);
                Browser.mouseMovementY = Browser.getMovementY(event);
              }
              // check if SDL is available
              if (typeof SDL != "undefined") {
                  Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
                  Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
              } else {
                  // just add the mouse delta to the current absolut mouse position
                  // FIXME: ideally this should be clamped against the canvas size and zero
                  Browser.mouseX += Browser.mouseMovementX;
                  Browser.mouseY += Browser.mouseMovementY;
              }        
            } else {
              // Otherwise, calculate the movement based on the changes
              // in the coordinates.
              var rect = Module["canvas"].getBoundingClientRect();
              var x, y;
              if (event.type == 'touchstart' ||
                  event.type == 'touchend' ||
                  event.type == 'touchmove') {
                var t = event.touches.item(0);
                if (t) {
                  x = t.pageX - (window.scrollX + rect.left);
                  y = t.pageY - (window.scrollY + rect.top);
                } else {
                  return;
                }
              } else {
                x = event.pageX - (window.scrollX + rect.left);
                y = event.pageY - (window.scrollY + rect.top);
              }
              // the canvas might be CSS-scaled compared to its backbuffer;
              // SDL-using content will want mouse coordinates in terms
              // of backbuffer units.
              var cw = Module["canvas"].width;
              var ch = Module["canvas"].height;
              x = x * (cw / rect.width);
              y = y * (ch / rect.height);
              Browser.mouseMovementX = x - Browser.mouseX;
              Browser.mouseMovementY = y - Browser.mouseY;
              Browser.mouseX = x;
              Browser.mouseY = y;
            }
          },xhrLoad:function (url, onload, onerror) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'arraybuffer';
            xhr.onload = function() {
              if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
                onload(xhr.response);
              } else {
                onerror();
              }
            };
            xhr.onerror = onerror;
            xhr.send(null);
          },asyncLoad:function (url, onload, onerror, noRunDep) {
            Browser.xhrLoad(url, function(arrayBuffer) {
              assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
              onload(new Uint8Array(arrayBuffer));
              if (!noRunDep) removeRunDependency('al ' + url);
            }, function(event) {
              if (onerror) {
                onerror();
              } else {
                throw 'Loading data file "' + url + '" failed.';
              }
            });
            if (!noRunDep) addRunDependency('al ' + url);
          },resizeListeners:[],updateResizeListeners:function () {
            var canvas = Module['canvas'];
            Browser.resizeListeners.forEach(function(listener) {
              listener(canvas.width, canvas.height);
            });
          },setCanvasSize:function (width, height, noUpdates) {
            var canvas = Module['canvas'];
            canvas.width = width;
            canvas.height = height;
            if (!noUpdates) Browser.updateResizeListeners();
          },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
            var canvas = Module['canvas'];
            this.windowedWidth = canvas.width;
            this.windowedHeight = canvas.height;
            canvas.width = screen.width;
            canvas.height = screen.height;
            // check if SDL is available   
            if (typeof SDL != "undefined") {
                var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
                flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
                HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
            }
            Browser.updateResizeListeners();
          },setWindowedCanvasSize:function () {
            var canvas = Module['canvas'];
            canvas.width = this.windowedWidth;
            canvas.height = this.windowedHeight;
            // check if SDL is available       
            if (typeof SDL != "undefined") {
                var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
                flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
                HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
            }
            Browser.updateResizeListeners();
          }};
    FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
    ___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
    __ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
    __ATINIT__.push({ func: function() { SOCKFS.root = FS.mount(SOCKFS, {}, null); } });
    _llvm_eh_exception.buf = allocate(12, "void*", ALLOC_STATIC);
    ___buildEnvironment(ENV);
    _fputc.ret = allocate([0], "i8", ALLOC_STATIC);
    Module["requestFullScreen"] = function(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
      Module["requestAnimationFrame"] = function(func) { Browser.requestAnimationFrame(func) };
      Module["setCanvasSize"] = function(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
      Module["pauseMainLoop"] = function() { Browser.mainLoop.pause() };
      Module["resumeMainLoop"] = function() { Browser.mainLoop.resume() };
      Module["getUserMedia"] = function() { Browser.getUserMedia() }
    STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
    staticSealed = true; // seal the static portion of memory
    STACK_MAX = STACK_BASE + 5242880;
    DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
    assert(DYNAMIC_BASE < TOTAL_MEMORY); // Stack must fit in TOTAL_MEMORY; allocations from here on may enlarge TOTAL_MEMORY
    var FUNCTION_TABLE = [0,0,__ZNSt20bad_array_new_lengthD0Ev,0,__warn,0,_ABR_iteration_loop,0,_find_scalefac_x34,0,_count_bit_noESC_from2
    ,0,_count_bit_noESC_from3,0,__ZNSt9bad_allocC2Ev,0,__ZNSt9bad_allocD0Ev,0,_VBR_old_iteration_loop,0,__errx
    ,0,_floatcompare,0,_VBR_new_iteration_loop,0,__verrx,0,_long_block_constrain,0,__ZNKSt9bad_alloc4whatEv
    ,0,_CBR_iteration_loop,0,_count_bit_null,0,__verr,0,__ZNSt9bad_allocD2Ev,0,_count_bit_noESC
    ,0,_short_block_constrain,0,__vwarn,0,_guess_scalefac_x34,0,_choose_table_nonMMX,0,__ZNSt20bad_array_new_lengthC2Ev
    ,0,__err,0,__vwarnx,0,_decodeMP3_unclipped,0,__ZNKSt20bad_array_new_length4whatEv,0,_decodeMP3,0,_init_xrpow_core_c,0,__warnx,0,_fht,0,_lame_report_def];
    // EMSCRIPTEN_START_FUNCS
   