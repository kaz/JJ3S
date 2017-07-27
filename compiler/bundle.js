/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

window.lua2asm = __webpack_require__(1);


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const parser = __webpack_require__(2);
const compiler = __webpack_require__(5);
const optimizer = __webpack_require__(7);

module.exports = (lua_user_code, debug = _ => 0) => {
	const rawTree = parser.parse(lua_user_code, {luaVersion: "5.3"});
	debug("<<< original tree >>>");
	debug(JSON.stringify(rawTree, null, 2));

	const tree = optimizer.optimize_tree(rawTree);
	debug("<<< optiized tree >>>");
	debug(JSON.stringify(tree, null, 2));

	const rawCode = compiler.compile(tree);
	const code = optimizer.optimize_sequence(optimizer.optimize_code(rawCode));
	debug(`omitted ${rawCode.length - code.length} lines`);

	return code.map(e => /,/.test(e) ? e : `\t${e}`).join("\n");
};


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module, global) {var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* global exports:true, module:true, require:true, define:true, global:true */

(function (root, name, factory) {
  /* jshint eqeqeq:false */
  'use strict';

  // Used to determine if values are of the language type `Object`
  var objectTypes = {
        'function': true
      , 'object': true
    }
    // Detect free variable `exports`
    , freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports
    // Detect free variable `module`
    , freeModule = objectTypes[typeof module] && module && !module.nodeType && module
    // Detect free variable `global`, from Node.js or Browserified code, and
    // use it as `window`
    , freeGlobal = freeExports && freeModule && typeof global == 'object' && global
    // Detect the popular CommonJS extension `module.exports`
    , moduleExports = freeModule && freeModule.exports === freeExports && freeExports;

  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal)) {
    root = freeGlobal;
  }

  // Some AMD build optimizers, like r.js, check for specific condition
  // patterns like the following:
  if (true) {
    // defined as an anonymous module.
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    // In case the source has been processed and wrapped in a define module use
    // the supplied `exports` object.
    if (freeExports && moduleExports) factory(freeModule.exports);
  }
  // check for `exports` after `define` in case a build optimizer adds an
  // `exports` object
  else if (freeExports && freeModule) {
    // in Node.js or RingoJS v0.8.0+
    if (moduleExports) factory(freeModule.exports);
    // in Narwhal or RingoJS v0.7.0-
    else factory(freeExports);
  }
  // in a browser or Rhino
  else {
    factory((root[name] = {}));
  }
}(this, 'luaparse', function (exports) {
  'use strict';

  exports.version = '0.2.1';

  var input, options, length;

  // Options can be set either globally on the parser object through
  // defaultOptions, or during the parse call.
  var defaultOptions = exports.defaultOptions = {
    // Explicitly tell the parser when the input ends.
      wait: false
    // Store comments as an array in the chunk object.
    , comments: true
    // Track identifier scopes by adding an isLocal attribute to each
    // identifier-node.
    , scope: false
    // Store location information on each syntax node as
    // `loc: { start: { line, column }, end: { line, column } }`.
    , locations: false
    // Store the start and end character locations on each syntax node as
    // `range: [start, end]`.
    , ranges: false
    // A callback which will be invoked when a syntax node has been completed.
    // The node which has been created will be passed as the only parameter.
    , onCreateNode: null
    // A callback which will be invoked when a new scope is created.
    , onCreateScope: null
    // A callback which will be invoked when the current scope is destroyed.
    , onDestroyScope: null
  };

  // The available tokens expressed as enum flags so they can be checked with
  // bitwise operations.

  var EOF = 1, StringLiteral = 2, Keyword = 4, Identifier = 8
    , NumericLiteral = 16, Punctuator = 32, BooleanLiteral = 64
    , NilLiteral = 128, VarargLiteral = 256;

  exports.tokenTypes = { EOF: EOF, StringLiteral: StringLiteral
    , Keyword: Keyword, Identifier: Identifier, NumericLiteral: NumericLiteral
    , Punctuator: Punctuator, BooleanLiteral: BooleanLiteral
    , NilLiteral: NilLiteral, VarargLiteral: VarargLiteral
  };

  // As this parser is a bit different from luas own, the error messages
  // will be different in some situations.

  var errors = exports.errors = {
      unexpected: 'unexpected %1 \'%2\' near \'%3\''
    , expected: '\'%1\' expected near \'%2\''
    , expectedToken: '%1 expected near \'%2\''
    , unfinishedString: 'unfinished string near \'%1\''
    , malformedNumber: 'malformed number near \'%1\''
    , invalidVar: 'invalid left-hand side of assignment near \'%1\''
  };

  // ### Abstract Syntax Tree
  //
  // The default AST structure is inspired by the Mozilla Parser API but can
  // easily be customized by overriding these functions.

  var ast = exports.ast = {
      labelStatement: function(label) {
      return {
          type: 'LabelStatement'
        , label: label
      };
    }

    , breakStatement: function() {
      return {
          type: 'BreakStatement'
      };
    }

    , gotoStatement: function(label) {
      return {
          type: 'GotoStatement'
        , label: label
      };
    }

    , returnStatement: function(args) {
      return {
          type: 'ReturnStatement'
        , 'arguments': args
      };
    }

    , ifStatement: function(clauses) {
      return {
          type: 'IfStatement'
        , clauses: clauses
      };
    }
    , ifClause: function(condition, body) {
      return {
          type: 'IfClause'
        , condition: condition
        , body: body
      };
    }
    , elseifClause: function(condition, body) {
      return {
          type: 'ElseifClause'
        , condition: condition
        , body: body
      };
    }
    , elseClause: function(body) {
      return {
          type: 'ElseClause'
        , body: body
      };
    }

    , whileStatement: function(condition, body) {
      return {
          type: 'WhileStatement'
        , condition: condition
        , body: body
      };
    }

    , doStatement: function(body) {
      return {
          type: 'DoStatement'
        , body: body
      };
    }

    , repeatStatement: function(condition, body) {
      return {
          type: 'RepeatStatement'
        , condition: condition
        , body: body
      };
    }

    , localStatement: function(variables, init) {
      return {
          type: 'LocalStatement'
        , variables: variables
        , init: init
      };
    }

    , assignmentStatement: function(variables, init) {
      return {
          type: 'AssignmentStatement'
        , variables: variables
        , init: init
      };
    }

    , callStatement: function(expression) {
      return {
          type: 'CallStatement'
        , expression: expression
      };
    }

    , functionStatement: function(identifier, parameters, isLocal, body) {
      return {
          type: 'FunctionDeclaration'
        , identifier: identifier
        , isLocal: isLocal
        , parameters: parameters
        , body: body
      };
    }

    , forNumericStatement: function(variable, start, end, step, body) {
      return {
          type: 'ForNumericStatement'
        , variable: variable
        , start: start
        , end: end
        , step: step
        , body: body
      };
    }

    , forGenericStatement: function(variables, iterators, body) {
      return {
          type: 'ForGenericStatement'
        , variables: variables
        , iterators: iterators
        , body: body
      };
    }

    , chunk: function(body) {
      return {
          type: 'Chunk'
        , body: body
      };
    }

    , identifier: function(name) {
      return {
          type: 'Identifier'
        , name: name
      };
    }

    , literal: function(type, value, raw) {
      type = (type === StringLiteral) ? 'StringLiteral'
        : (type === NumericLiteral) ? 'NumericLiteral'
        : (type === BooleanLiteral) ? 'BooleanLiteral'
        : (type === NilLiteral) ? 'NilLiteral'
        : 'VarargLiteral';

      return {
          type: type
        , value: value
        , raw: raw
      };
    }

    , tableKey: function(key, value) {
      return {
          type: 'TableKey'
        , key: key
        , value: value
      };
    }
    , tableKeyString: function(key, value) {
      return {
          type: 'TableKeyString'
        , key: key
        , value: value
      };
    }
    , tableValue: function(value) {
      return {
          type: 'TableValue'
        , value: value
      };
    }


    , tableConstructorExpression: function(fields) {
      return {
          type: 'TableConstructorExpression'
        , fields: fields
      };
    }
    , binaryExpression: function(operator, left, right) {
      var type = ('and' === operator || 'or' === operator) ?
        'LogicalExpression' :
        'BinaryExpression';

      return {
          type: type
        , operator: operator
        , left: left
        , right: right
      };
    }
    , unaryExpression: function(operator, argument) {
      return {
          type: 'UnaryExpression'
        , operator: operator
        , argument: argument
      };
    }
    , memberExpression: function(base, indexer, identifier) {
      return {
          type: 'MemberExpression'
        , indexer: indexer
        , identifier: identifier
        , base: base
      };
    }

    , indexExpression: function(base, index) {
      return {
          type: 'IndexExpression'
        , base: base
        , index: index
      };
    }

    , callExpression: function(base, args) {
      return {
          type: 'CallExpression'
        , base: base
        , 'arguments': args
      };
    }

    , tableCallExpression: function(base, args) {
      return {
          type: 'TableCallExpression'
        , base: base
        , 'arguments': args
      };
    }

    , stringCallExpression: function(base, argument) {
      return {
          type: 'StringCallExpression'
        , base: base
        , argument: argument
      };
    }

    , comment: function(value, raw) {
      return {
          type: 'Comment'
        , value: value
        , raw: raw
      };
    }
  };

  // Wrap up the node object.

  function finishNode(node) {
    // Pop a `Marker` off the location-array and attach its location data.
    if (trackLocations) {
      var location = locations.pop();
      location.complete();
      if (options.locations) node.loc = location.loc;
      if (options.ranges) node.range = location.range;
    }
    if (options.onCreateNode) options.onCreateNode(node);
    return node;
  }


  // Helpers
  // -------

  var slice = Array.prototype.slice
    , toString = Object.prototype.toString
    , indexOf = function indexOf(array, element) {
      for (var i = 0, length = array.length; i < length; i++) {
        if (array[i] === element) return i;
      }
      return -1;
    };

  // Iterate through an array of objects and return the index of an object
  // with a matching property.

  function indexOfObject(array, property, element) {
    for (var i = 0, length = array.length; i < length; i++) {
      if (array[i][property] === element) return i;
    }
    return -1;
  }

  // A sprintf implementation using %index (beginning at 1) to input
  // arguments in the format string.
  //
  // Example:
  //
  //     // Unexpected function in token
  //     sprintf('Unexpected %2 in %1.', 'token', 'function');

  function sprintf(format) {
    var args = slice.call(arguments, 1);
    format = format.replace(/%(\d)/g, function (match, index) {
      return '' + args[index - 1] || '';
    });
    return format;
  }

  // Returns a new object with the properties from all objectes passed as
  // arguments. Last argument takes precedence.
  //
  // Example:
  //
  //     this.options = extend(options, { output: false });

  function extend() {
    var args = slice.call(arguments)
      , dest = {}
      , src, prop;

    for (var i = 0, length = args.length; i < length; i++) {
      src = args[i];
      for (prop in src) if (src.hasOwnProperty(prop)) {
        dest[prop] = src[prop];
      }
    }
    return dest;
  }

  // ### Error functions

  // #### Raise an exception.
  //
  // Raise an exception by passing a token, a string format and its paramters.
  //
  // The passed tokens location will automatically be added to the error
  // message if it exists, if not it will default to the lexers current
  // position.
  //
  // Example:
  //
  //     // [1:0] expected [ near (
  //     raise(token, "expected %1 near %2", '[', token.value);

  function raise(token) {
    var message = sprintf.apply(null, slice.call(arguments, 1))
      , error, col;

    if ('undefined' !== typeof token.line) {
      col = token.range[0] - token.lineStart;
      error = new SyntaxError(sprintf('[%1:%2] %3', token.line, col, message));
      error.line = token.line;
      error.index = token.range[0];
      error.column = col;
    } else {
      col = index - lineStart + 1;
      error = new SyntaxError(sprintf('[%1:%2] %3', line, col, message));
      error.index = index;
      error.line = line;
      error.column = col;
    }
    throw error;
  }

  // #### Raise an unexpected token error.
  //
  // Example:
  //
  //     // expected <name> near '0'
  //     raiseUnexpectedToken('<name>', token);

  function raiseUnexpectedToken(type, token) {
    raise(token, errors.expectedToken, type, token.value);
  }

  // #### Raise a general unexpected error
  //
  // Usage should pass either a token object or a symbol string which was
  // expected. We can also specify a nearby token such as <eof>, this will
  // default to the currently active token.
  //
  // Example:
  //
  //     // Unexpected symbol 'end' near '<eof>'
  //     unexpected(token);
  //
  // If there's no token in the buffer it means we have reached <eof>.

  function unexpected(found, near) {
    if ('undefined' === typeof near) near = lookahead.value;
    if ('undefined' !== typeof found.type) {
      var type;
      switch (found.type) {
        case StringLiteral:   type = 'string';      break;
        case Keyword:         type = 'keyword';     break;
        case Identifier:      type = 'identifier';  break;
        case NumericLiteral:  type = 'number';      break;
        case Punctuator:      type = 'symbol';      break;
        case BooleanLiteral:  type = 'boolean';     break;
        case NilLiteral:
          return raise(found, errors.unexpected, 'symbol', 'nil', near);
      }
      return raise(found, errors.unexpected, type, found.value, near);
    }
    return raise(found, errors.unexpected, 'symbol', found, near);
  }

  // Lexer
  // -----
  //
  // The lexer, or the tokenizer reads the input string character by character
  // and derives a token left-right. To be as efficient as possible the lexer
  // prioritizes the common cases such as identifiers. It also works with
  // character codes instead of characters as string comparisons was the
  // biggest bottleneck of the parser.
  //
  // If `options.comments` is enabled, all comments encountered will be stored
  // in an array which later will be appended to the chunk object. If disabled,
  // they will simply be disregarded.
  //
  // When the lexer has derived a valid token, it will be returned as an object
  // containing its value and as well as its position in the input string (this
  // is always enabled to provide proper debug messages).
  //
  // `lex()` starts lexing and returns the following token in the stream.

  var index
    , token
    , previousToken
    , lookahead
    , comments
    , tokenStart
    , line
    , lineStart;

  exports.lex = lex;

  function lex() {
    skipWhiteSpace();

    // Skip comments beginning with --
    while (45 === input.charCodeAt(index) &&
           45 === input.charCodeAt(index + 1)) {
      scanComment();
      skipWhiteSpace();
    }
    if (index >= length) return {
        type : EOF
      , value: '<eof>'
      , line: line
      , lineStart: lineStart
      , range: [index, index]
    };

    var charCode = input.charCodeAt(index)
      , next = input.charCodeAt(index + 1);

    // Memorize the range index where the token begins.
    tokenStart = index;
    if (isIdentifierStart(charCode)) return scanIdentifierOrKeyword();

    switch (charCode) {
      case 39: case 34: // '"
        return scanStringLiteral();

      // 0-9
      case 48: case 49: case 50: case 51: case 52: case 53:
      case 54: case 55: case 56: case 57:
        return scanNumericLiteral();

      case 46: // .
        // If the dot is followed by a digit it's a float.
        if (isDecDigit(next)) return scanNumericLiteral();
        if (46 === next) {
          if (46 === input.charCodeAt(index + 2)) return scanVarargLiteral();
          return scanPunctuator('..');
        }
        return scanPunctuator('.');

      case 61: // =
        if (61 === next) return scanPunctuator('==');
        return scanPunctuator('=');

      case 62: // >
        if (61 === next) return scanPunctuator('>=');
        if (62 === next) return scanPunctuator('>>');
        return scanPunctuator('>');

      case 60: // <
        if (60 === next) return scanPunctuator('<<');
        if (61 === next) return scanPunctuator('<=');
        return scanPunctuator('<');

      case 126: // ~
        if (61 === next) return scanPunctuator('~=');
        return scanPunctuator('~');

      case 58: // :
        if (58 === next) return scanPunctuator('::');
        return scanPunctuator(':');

      case 91: // [
        // Check for a multiline string, they begin with [= or [[
        if (91 === next || 61 === next) return scanLongStringLiteral();
        return scanPunctuator('[');

      case 47: // /
        // Check for integer division op (//)
        if (47 === next) return scanPunctuator('//');
        return scanPunctuator('/');

      // * ^ % , { } ] ( ) ; & # - + |
      case 42: case 94: case 37: case 44: case 123: case 124: case 125:
      case 93: case 40: case 41: case 59: case 38: case 35: case 45: case 43:
        return scanPunctuator(input.charAt(index));
    }

    return unexpected(input.charAt(index));
  }

  // Whitespace has no semantic meaning in lua so simply skip ahead while
  // tracking the encounted newlines. Any kind of eol sequence is counted as a
  // single line.

  function consumeEOL() {
    var charCode = input.charCodeAt(index)
      , peekCharCode = input.charCodeAt(index + 1);

    if (isLineTerminator(charCode)) {
      // Count \n\r and \r\n as one newline.
      if (10 === charCode && 13 === peekCharCode) index++;
      if (13 === charCode && 10 === peekCharCode) index++;
      line++;
      lineStart = ++index;

      return true;
    }
    return false;
  }

  function skipWhiteSpace() {
    while (index < length) {
      var charCode = input.charCodeAt(index);
      if (isWhiteSpace(charCode)) {
        index++;
      } else if (!consumeEOL()) {
        break;
      }
    }
  }

  // Identifiers, keywords, booleans and nil all look the same syntax wise. We
  // simply go through them one by one and defaulting to an identifier if no
  // previous case matched.

  function scanIdentifierOrKeyword() {
    var value, type;

    // Slicing the input string is prefered before string concatenation in a
    // loop for performance reasons.
    while (isIdentifierPart(input.charCodeAt(++index)));
    value = input.slice(tokenStart, index);

    // Decide on the token type and possibly cast the value.
    if (isKeyword(value)) {
      type = Keyword;
    } else if ('true' === value || 'false' === value) {
      type = BooleanLiteral;
      value = ('true' === value);
    } else if ('nil' === value) {
      type = NilLiteral;
      value = null;
    } else {
      type = Identifier;
    }

    return {
        type: type
      , value: value
      , line: line
      , lineStart: lineStart
      , range: [tokenStart, index]
    };
  }

  // Once a punctuator reaches this function it should already have been
  // validated so we simply return it as a token.

  function scanPunctuator(value) {
    index += value.length;
    return {
        type: Punctuator
      , value: value
      , line: line
      , lineStart: lineStart
      , range: [tokenStart, index]
    };
  }

  // A vararg literal consists of three dots.

  function scanVarargLiteral() {
    index += 3;
    return {
        type: VarargLiteral
      , value: '...'
      , line: line
      , lineStart: lineStart
      , range: [tokenStart, index]
    };
  }

  // Find the string literal by matching the delimiter marks used.

  function scanStringLiteral() {
    var delimiter = input.charCodeAt(index++)
      , stringStart = index
      , string = ''
      , charCode;

    while (index < length) {
      charCode = input.charCodeAt(index++);
      if (delimiter === charCode) break;
      if (92 === charCode) { // \
        string += input.slice(stringStart, index - 1) + readEscapeSequence();
        stringStart = index;
      }
      // EOF or `\n` terminates a string literal. If we haven't found the
      // ending delimiter by now, raise an exception.
      else if (index >= length || isLineTerminator(charCode)) {
        string += input.slice(stringStart, index - 1);
        raise({}, errors.unfinishedString, string + String.fromCharCode(charCode));
      }
    }
    string += input.slice(stringStart, index - 1);

    return {
        type: StringLiteral
      , value: string
      , line: line
      , lineStart: lineStart
      , range: [tokenStart, index]
    };
  }

  // Expect a multiline string literal and return it as a regular string
  // literal, if it doesn't validate into a valid multiline string, throw an
  // exception.

  function scanLongStringLiteral() {
    var string = readLongString();
    // Fail if it's not a multiline literal.
    if (false === string) raise(token, errors.expected, '[', token.value);

    return {
        type: StringLiteral
      , value: string
      , line: line
      , lineStart: lineStart
      , range: [tokenStart, index]
    };
  }

  // Numeric literals will be returned as floating-point numbers instead of
  // strings. The raw value should be retrieved from slicing the input string
  // later on in the process.
  //
  // If a hexadecimal number is encountered, it will be converted.

  function scanNumericLiteral() {
    var character = input.charAt(index)
      , next = input.charAt(index + 1);

    var value = ('0' === character && 'xX'.indexOf(next || null) >= 0) ?
      readHexLiteral() : readDecLiteral();

    return {
        type: NumericLiteral
      , value: value
      , line: line
      , lineStart: lineStart
      , range: [tokenStart, index]
    };
  }

  // Lua hexadecimals have an optional fraction part and an optional binary
  // exoponent part. These are not included in JavaScript so we will compute
  // all three parts separately and then sum them up at the end of the function
  // with the following algorithm.
  //
  //     Digit := toDec(digit)
  //     Fraction := toDec(fraction) / 16 ^ fractionCount
  //     BinaryExp := 2 ^ binaryExp
  //     Number := ( Digit + Fraction ) * BinaryExp

  function readHexLiteral() {
    var fraction = 0 // defaults to 0 as it gets summed
      , binaryExponent = 1 // defaults to 1 as it gets multiplied
      , binarySign = 1 // positive
      , digit, fractionStart, exponentStart, digitStart;

    digitStart = index += 2; // Skip 0x part

    // A minimum of one hex digit is required.
    if (!isHexDigit(input.charCodeAt(index)))
      raise({}, errors.malformedNumber, input.slice(tokenStart, index));

    while (isHexDigit(input.charCodeAt(index))) index++;
    // Convert the hexadecimal digit to base 10.
    digit = parseInt(input.slice(digitStart, index), 16);

    // Fraction part i optional.
    if ('.' === input.charAt(index)) {
      fractionStart = ++index;

      while (isHexDigit(input.charCodeAt(index))) index++;
      fraction = input.slice(fractionStart, index);

      // Empty fraction parts should default to 0, others should be converted
      // 0.x form so we can use summation at the end.
      fraction = (fractionStart === index) ? 0
        : parseInt(fraction, 16) / Math.pow(16, index - fractionStart);
    }

    // Binary exponents are optional
    if ('pP'.indexOf(input.charAt(index) || null) >= 0) {
      index++;

      // Sign part is optional and defaults to 1 (positive).
      if ('+-'.indexOf(input.charAt(index) || null) >= 0)
        binarySign = ('+' === input.charAt(index++)) ? 1 : -1;

      exponentStart = index;

      // The binary exponent sign requires a decimal digit.
      if (!isDecDigit(input.charCodeAt(index)))
        raise({}, errors.malformedNumber, input.slice(tokenStart, index));

      while (isDecDigit(input.charCodeAt(index))) index++;
      binaryExponent = input.slice(exponentStart, index);

      // Calculate the binary exponent of the number.
      binaryExponent = Math.pow(2, binaryExponent * binarySign);
    }

    return (digit + fraction) * binaryExponent;
  }

  // Decimal numbers are exactly the same in Lua and in JavaScript, because of
  // this we check where the token ends and then parse it with native
  // functions.

  function readDecLiteral() {
    while (isDecDigit(input.charCodeAt(index))) index++;
    // Fraction part is optional
    if ('.' === input.charAt(index)) {
      index++;
      // Fraction part defaults to 0
      while (isDecDigit(input.charCodeAt(index))) index++;
    }
    // Exponent part is optional.
    if ('eE'.indexOf(input.charAt(index) || null) >= 0) {
      index++;
      // Sign part is optional.
      if ('+-'.indexOf(input.charAt(index) || null) >= 0) index++;
      // An exponent is required to contain at least one decimal digit.
      if (!isDecDigit(input.charCodeAt(index)))
        raise({}, errors.malformedNumber, input.slice(tokenStart, index));

      while (isDecDigit(input.charCodeAt(index))) index++;
    }

    return parseFloat(input.slice(tokenStart, index));
  }


  // Translate escape sequences to the actual characters.

  function readEscapeSequence() {
    var sequenceStart = index;
    switch (input.charAt(index)) {
      // Lua allow the following escape sequences.
      // We don't escape the bell sequence.
      case 'n': index++; return '\n';
      case 'r': index++; return '\r';
      case 't': index++; return '\t';
      case 'v': index++; return '\x0B';
      case 'b': index++; return '\b';
      case 'f': index++; return '\f';
      // Skips the following span of white-space.
      case 'z': index++; skipWhiteSpace(); return '';
      // Byte representation should for now be returned as is.
      case 'x':
        // \xXX, where XX is a sequence of exactly two hexadecimal digits
        if (isHexDigit(input.charCodeAt(index + 1)) &&
            isHexDigit(input.charCodeAt(index + 2))) {
          index += 3;
          // Return it as is, without translating the byte.
          return '\\' + input.slice(sequenceStart, index);
        }
        return '\\' + input.charAt(index++);
      default:
        // \ddd, where ddd is a sequence of up to three decimal digits.
        if (isDecDigit(input.charCodeAt(index))) {
          while (isDecDigit(input.charCodeAt(++index)));
          return '\\' + input.slice(sequenceStart, index);
        }
        // Simply return the \ as is, it's not escaping any sequence.
        return input.charAt(index++);
    }
  }

  // Comments begin with -- after which it will be decided if they are
  // multiline comments or not.
  //
  // The multiline functionality works the exact same way as with string
  // literals so we reuse the functionality.

  function scanComment() {
    tokenStart = index;
    index += 2; // --

    var character = input.charAt(index)
      , content = ''
      , isLong = false
      , commentStart = index
      , lineStartComment = lineStart
      , lineComment = line;

    if ('[' === character) {
      content = readLongString();
      // This wasn't a multiline comment after all.
      if (false === content) content = character;
      else isLong = true;
    }
    // Scan until next line as long as it's not a multiline comment.
    if (!isLong) {
      while (index < length) {
        if (isLineTerminator(input.charCodeAt(index))) break;
        index++;
      }
      if (options.comments) content = input.slice(commentStart, index);
    }

    if (options.comments) {
      var node = ast.comment(content, input.slice(tokenStart, index));

      // `Marker`s depend on tokens available in the parser and as comments are
      // intercepted in the lexer all location data is set manually.
      if (options.locations) {
        node.loc = {
            start: { line: lineComment, column: tokenStart - lineStartComment }
          , end: { line: line, column: index - lineStart }
        };
      }
      if (options.ranges) {
        node.range = [tokenStart, index];
      }
      if (options.onCreateNode) options.onCreateNode(node);
      comments.push(node);
    }
  }

  // Read a multiline string by calculating the depth of `=` characters and
  // then appending until an equal depth is found.

  function readLongString() {
    var level = 0
      , content = ''
      , terminator = false
      , character, stringStart;

    index++; // [

    // Calculate the depth of the comment.
    while ('=' === input.charAt(index + level)) level++;
    // Exit, this is not a long string afterall.
    if ('[' !== input.charAt(index + level)) return false;

    index += level + 1;

    // If the first character is a newline, ignore it and begin on next line.
    if (isLineTerminator(input.charCodeAt(index))) consumeEOL();

    stringStart = index;
    while (index < length) {
      // To keep track of line numbers run the `consumeEOL()` which increments
      // its counter.
      if (isLineTerminator(input.charCodeAt(index))) consumeEOL();

      character = input.charAt(index++);

      // Once the delimiter is found, iterate through the depth count and see
      // if it matches.
      if (']' === character) {
        terminator = true;
        for (var i = 0; i < level; i++) {
          if ('=' !== input.charAt(index + i)) terminator = false;
        }
        if (']' !== input.charAt(index + level)) terminator = false;
      }

      // We reached the end of the multiline string. Get out now.
      if (terminator) break;
    }
    content += input.slice(stringStart, index - 1);
    index += level + 1;

    return content;
  }

  // ## Lex functions and helpers.

  // Read the next token.
  //
  // This is actually done by setting the current token to the lookahead and
  // reading in the new lookahead token.

  function next() {
    previousToken = token;
    token = lookahead;
    lookahead = lex();
  }

  // Consume a token if its value matches. Once consumed or not, return the
  // success of the operation.

  function consume(value) {
    if (value === token.value) {
      next();
      return true;
    }
    return false;
  }

  // Expect the next token value to match. If not, throw an exception.

  function expect(value) {
    if (value === token.value) next();
    else raise(token, errors.expected, value, token.value);
  }

  // ### Validation functions

  function isWhiteSpace(charCode) {
    return 9 === charCode || 32 === charCode || 0xB === charCode || 0xC === charCode;
  }

  function isLineTerminator(charCode) {
    return 10 === charCode || 13 === charCode;
  }

  function isDecDigit(charCode) {
    return charCode >= 48 && charCode <= 57;
  }

  function isHexDigit(charCode) {
    return (charCode >= 48 && charCode <= 57) || (charCode >= 97 && charCode <= 102) || (charCode >= 65 && charCode <= 70);
  }

  // From [Lua 5.2](http://www.lua.org/manual/5.2/manual.html#8.1) onwards
  // identifiers cannot use locale-dependet letters.

  function isIdentifierStart(charCode) {
    return (charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122) || 95 === charCode;
  }

  function isIdentifierPart(charCode) {
    return (charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122) || 95 === charCode || (charCode >= 48 && charCode <= 57);
  }

  // [3.1 Lexical Conventions](http://www.lua.org/manual/5.2/manual.html#3.1)
  //
  // `true`, `false` and `nil` will not be considered keywords, but literals.

  function isKeyword(id) {
    switch (id.length) {
      case 2:
        return 'do' === id || 'if' === id || 'in' === id || 'or' === id;
      case 3:
        return 'and' === id || 'end' === id || 'for' === id || 'not' === id;
      case 4:
        return 'else' === id || 'goto' === id || 'then' === id;
      case 5:
        return 'break' === id || 'local' === id || 'until' === id || 'while' === id;
      case 6:
        return 'elseif' === id || 'repeat' === id || 'return' === id;
      case 8:
        return 'function' === id;
    }
    return false;
  }

  function isUnary(token) {
    if (Punctuator === token.type) return '#-~'.indexOf(token.value) >= 0;
    if (Keyword === token.type) return 'not' === token.value;
    return false;
  }

  // @TODO this needs to be rethought.
  function isCallExpression(expression) {
    switch (expression.type) {
      case 'CallExpression':
      case 'TableCallExpression':
      case 'StringCallExpression':
        return true;
    }
    return false;
  }

  // Check if the token syntactically closes a block.

  function isBlockFollow(token) {
    if (EOF === token.type) return true;
    if (Keyword !== token.type) return false;
    switch (token.value) {
      case 'else': case 'elseif':
      case 'end': case 'until':
        return true;
      default:
        return false;
    }
  }

  // Scope
  // -----

  // Store each block scope as a an array of identifier names. Each scope is
  // stored in an FILO-array.
  var scopes
    // The current scope index
    , scopeDepth
    // A list of all global identifier nodes.
    , globals;

  // Create a new scope inheriting all declarations from the previous scope.
  function createScope() {
    var scope = Array.apply(null, scopes[scopeDepth++]);
    scopes.push(scope);
    if (options.onCreateScope) options.onCreateScope();
  }

  // Exit and remove the current scope.
  function destroyScope() {
    var scope = scopes.pop();
    scopeDepth--;
    if (options.onDestroyScope) options.onDestroyScope();
  }

  // Add identifier name to the current scope if it doesnt already exist.
  function scopeIdentifierName(name) {
    if (-1 !== indexOf(scopes[scopeDepth], name)) return;
    scopes[scopeDepth].push(name);
  }

  // Add identifier to the current scope
  function scopeIdentifier(node) {
    scopeIdentifierName(node.name);
    attachScope(node, true);
  }

  // Attach scope information to node. If the node is global, store it in the
  // globals array so we can return the information to the user.
  function attachScope(node, isLocal) {
    if (!isLocal && -1 === indexOfObject(globals, 'name', node.name))
      globals.push(node);

    node.isLocal = isLocal;
  }

  // Is the identifier name available in this scope.
  function scopeHasName(name) {
    return (-1 !== indexOf(scopes[scopeDepth], name));
  }

  // Location tracking
  // -----------------
  //
  // Locations are stored in FILO-array as a `Marker` object consisting of both
  // `loc` and `range` data. Once a `Marker` is popped off the list an end
  // location is added and the data is attached to a syntax node.

  var locations = []
    , trackLocations;

  function createLocationMarker() {
    return new Marker(token);
  }

  function Marker(token) {
    if (options.locations) {
      this.loc = {
          start: {
            line: token.line
          , column: token.range[0] - token.lineStart
        }
        , end: {
            line: 0
          , column: 0
        }
      };
    }
    if (options.ranges) this.range = [token.range[0], 0];
  }

  // Complete the location data stored in the `Marker` by adding the location
  // of the *previous token* as an end location.
  Marker.prototype.complete = function() {
    if (options.locations) {
      this.loc.end.line = previousToken.line;
      this.loc.end.column = previousToken.range[1] - previousToken.lineStart;
    }
    if (options.ranges) {
      this.range[1] = previousToken.range[1];
    }
  };

  // Create a new `Marker` and add it to the FILO-array.
  function markLocation() {
    if (trackLocations) locations.push(createLocationMarker());
  }

  // Push an arbitrary `Marker` object onto the FILO-array.
  function pushLocation(marker) {
    if (trackLocations) locations.push(marker);
  }

  // Parse functions
  // ---------------

  // Chunk is the main program object. Syntactically it's the same as a block.
  //
  //     chunk ::= block

  function parseChunk() {
    next();
    markLocation();
    if (options.scope) createScope();
    var body = parseBlock();
    if (options.scope) destroyScope();
    if (EOF !== token.type) unexpected(token);
    // If the body is empty no previousToken exists when finishNode runs.
    if (trackLocations && !body.length) previousToken = token;
    return finishNode(ast.chunk(body));
  }

  // A block contains a list of statements with an optional return statement
  // as its last statement.
  //
  //     block ::= {stat} [retstat]

  function parseBlock(terminator) {
    var block = []
      , statement;

    while (!isBlockFollow(token)) {
      // Return has to be the last statement in a block.
      if ('return' === token.value) {
        block.push(parseStatement());
        break;
      }
      statement = parseStatement();
      // Statements are only added if they are returned, this allows us to
      // ignore some statements, such as EmptyStatement.
      if (statement) block.push(statement);
    }

    // Doesn't really need an ast node
    return block;
  }

  // There are two types of statements, simple and compound.
  //
  //     statement ::= break | goto | do | while | repeat | return
  //          | if | for | function | local | label | assignment
  //          | functioncall | ';'

  function parseStatement() {
    markLocation();
    if (Keyword === token.type) {
      switch (token.value) {
        case 'local':    next(); return parseLocalStatement();
        case 'if':       next(); return parseIfStatement();
        case 'return':   next(); return parseReturnStatement();
        case 'function': next();
          var name = parseFunctionName();
          return parseFunctionDeclaration(name);
        case 'while':    next(); return parseWhileStatement();
        case 'for':      next(); return parseForStatement();
        case 'repeat':   next(); return parseRepeatStatement();
        case 'break':    next(); return parseBreakStatement();
        case 'do':       next(); return parseDoStatement();
        case 'goto':     next(); return parseGotoStatement();
      }
    }

    if (Punctuator === token.type) {
      if (consume('::')) return parseLabelStatement();
    }
    // Assignments memorizes the location and pushes it manually for wrapper
    // nodes. Additionally empty `;` statements should not mark a location.
    if (trackLocations) locations.pop();

    // When a `;` is encounted, simply eat it without storing it.
    if (consume(';')) return;

    return parseAssignmentOrCallStatement();
  }

  // ## Statements

  //     label ::= '::' Name '::'

  function parseLabelStatement() {
    var name = token.value
      , label = parseIdentifier();

    if (options.scope) {
      scopeIdentifierName('::' + name + '::');
      attachScope(label, true);
    }

    expect('::');
    return finishNode(ast.labelStatement(label));
  }

  //     break ::= 'break'

  function parseBreakStatement() {
    return finishNode(ast.breakStatement());
  }

  //     goto ::= 'goto' Name

  function parseGotoStatement() {
    var name = token.value
      , label = parseIdentifier();

    return finishNode(ast.gotoStatement(label));
  }

  //     do ::= 'do' block 'end'

  function parseDoStatement() {
    if (options.scope) createScope();
    var body = parseBlock();
    if (options.scope) destroyScope();
    expect('end');
    return finishNode(ast.doStatement(body));
  }

  //     while ::= 'while' exp 'do' block 'end'

  function parseWhileStatement() {
    var condition = parseExpectedExpression();
    expect('do');
    if (options.scope) createScope();
    var body = parseBlock();
    if (options.scope) destroyScope();
    expect('end');
    return finishNode(ast.whileStatement(condition, body));
  }

  //     repeat ::= 'repeat' block 'until' exp

  function parseRepeatStatement() {
    if (options.scope) createScope();
    var body = parseBlock();
    expect('until');
    var condition = parseExpectedExpression();
    if (options.scope) destroyScope();
    return finishNode(ast.repeatStatement(condition, body));
  }

  //     retstat ::= 'return' [exp {',' exp}] [';']

  function parseReturnStatement() {
    var expressions = [];

    if ('end' !== token.value) {
      var expression = parseExpression();
      if (null != expression) expressions.push(expression);
      while (consume(',')) {
        expression = parseExpectedExpression();
        expressions.push(expression);
      }
      consume(';'); // grammar tells us ; is optional here.
    }
    return finishNode(ast.returnStatement(expressions));
  }

  //     if ::= 'if' exp 'then' block {elif} ['else' block] 'end'
  //     elif ::= 'elseif' exp 'then' block

  function parseIfStatement() {
    var clauses = []
      , condition
      , body
      , marker;

    // IfClauses begin at the same location as the parent IfStatement.
    // It ends at the start of `end`, `else`, or `elseif`.
    if (trackLocations) {
      marker = locations[locations.length - 1];
      locations.push(marker);
    }
    condition = parseExpectedExpression();
    expect('then');
    if (options.scope) createScope();
    body = parseBlock();
    if (options.scope) destroyScope();
    clauses.push(finishNode(ast.ifClause(condition, body)));

    if (trackLocations) marker = createLocationMarker();
    while (consume('elseif')) {
      pushLocation(marker);
      condition = parseExpectedExpression();
      expect('then');
      if (options.scope) createScope();
      body = parseBlock();
      if (options.scope) destroyScope();
      clauses.push(finishNode(ast.elseifClause(condition, body)));
      if (trackLocations) marker = createLocationMarker();
    }

    if (consume('else')) {
      // Include the `else` in the location of ElseClause.
      if (trackLocations) {
        marker = new Marker(previousToken);
        locations.push(marker);
      }
      if (options.scope) createScope();
      body = parseBlock();
      if (options.scope) destroyScope();
      clauses.push(finishNode(ast.elseClause(body)));
    }

    expect('end');
    return finishNode(ast.ifStatement(clauses));
  }

  // There are two types of for statements, generic and numeric.
  //
  //     for ::= Name '=' exp ',' exp [',' exp] 'do' block 'end'
  //     for ::= namelist 'in' explist 'do' block 'end'
  //     namelist ::= Name {',' Name}
  //     explist ::= exp {',' exp}

  function parseForStatement() {
    var variable = parseIdentifier()
      , body;

    // The start-identifier is local.

    if (options.scope) {
      createScope();
      scopeIdentifier(variable);
    }

    // If the first expression is followed by a `=` punctuator, this is a
    // Numeric For Statement.
    if (consume('=')) {
      // Start expression
      var start = parseExpectedExpression();
      expect(',');
      // End expression
      var end = parseExpectedExpression();
      // Optional step expression
      var step = consume(',') ? parseExpectedExpression() : null;

      expect('do');
      body = parseBlock();
      expect('end');
      if (options.scope) destroyScope();

      return finishNode(ast.forNumericStatement(variable, start, end, step, body));
    }
    // If not, it's a Generic For Statement
    else {
      // The namelist can contain one or more identifiers.
      var variables = [variable];
      while (consume(',')) {
        variable = parseIdentifier();
        // Each variable in the namelist is locally scoped.
        if (options.scope) scopeIdentifier(variable);
        variables.push(variable);
      }
      expect('in');
      var iterators = [];

      // One or more expressions in the explist.
      do {
        var expression = parseExpectedExpression();
        iterators.push(expression);
      } while (consume(','));

      expect('do');
      body = parseBlock();
      expect('end');
      if (options.scope) destroyScope();

      return finishNode(ast.forGenericStatement(variables, iterators, body));
    }
  }

  // Local statements can either be variable assignments or function
  // definitions. If a function definition is found, it will be delegated to
  // `parseFunctionDeclaration()` with the isLocal flag.
  //
  // This AST structure might change into a local assignment with a function
  // child.
  //
  //     local ::= 'local' 'function' Name funcdecl
  //        | 'local' Name {',' Name} ['=' exp {',' exp}]

  function parseLocalStatement() {
    var name;

    if (Identifier === token.type) {
      var variables = []
        , init = [];

      do {
        name = parseIdentifier();

        variables.push(name);
      } while (consume(','));

      if (consume('=')) {
        do {
          var expression = parseExpectedExpression();
          init.push(expression);
        } while (consume(','));
      }

      // Declarations doesn't exist before the statement has been evaluated.
      // Therefore assignments can't use their declarator. And the identifiers
      // shouldn't be added to the scope until the statement is complete.
      if (options.scope) {
        for (var i = 0, l = variables.length; i < l; i++) {
          scopeIdentifier(variables[i]);
        }
      }

      return finishNode(ast.localStatement(variables, init));
    }
    if (consume('function')) {
      name = parseIdentifier();

      if (options.scope) {
        scopeIdentifier(name);
        createScope();
      }

      // MemberExpressions are not allowed in local function statements.
      return parseFunctionDeclaration(name, true);
    } else {
      raiseUnexpectedToken('<name>', token);
    }
  }

  function validateVar(node) {
    // @TODO we need something not dependent on the exact AST used. see also isCallExpression()
    if (node.inParens || (['Identifier', 'MemberExpression', 'IndexExpression'].indexOf(node.type) === -1)) {
      raise(token, errors.invalidVar, token.value);
    }
  }

  //     assignment ::= varlist '=' explist
  //     var ::= Name | prefixexp '[' exp ']' | prefixexp '.' Name
  //     varlist ::= var {',' var}
  //     explist ::= exp {',' exp}
  //
  //     call ::= callexp
  //     callexp ::= prefixexp args | prefixexp ':' Name args

  function parseAssignmentOrCallStatement() {
    // Keep a reference to the previous token for better error messages in case
    // of invalid statement
    var previous = token
      , expression, marker;

    if (trackLocations) marker = createLocationMarker();
    expression = parsePrefixExpression();

    if (null == expression) return unexpected(token);
    if (',='.indexOf(token.value) >= 0) {
      var variables = [expression]
        , init = []
        , exp;

      validateVar(expression);
      while (consume(',')) {
        exp = parsePrefixExpression();
        if (null == exp) raiseUnexpectedToken('<expression>', token);
        validateVar(exp);
        variables.push(exp);
      }
      expect('=');
      do {
        exp = parseExpectedExpression();
        init.push(exp);
      } while (consume(','));

      pushLocation(marker);
      return finishNode(ast.assignmentStatement(variables, init));
    }
    if (isCallExpression(expression)) {
      pushLocation(marker);
      return finishNode(ast.callStatement(expression));
    }
    // The prefix expression was neither part of an assignment or a
    // callstatement, however as it was valid it's been consumed, so raise
    // the exception on the previous token to provide a helpful message.
    return unexpected(previous);
  }



  // ### Non-statements

  //     Identifier ::= Name

  function parseIdentifier() {
    markLocation();
    var identifier = token.value;
    if (Identifier !== token.type) raiseUnexpectedToken('<name>', token);
    next();
    return finishNode(ast.identifier(identifier));
  }

  // Parse the functions parameters and body block. The name should already
  // have been parsed and passed to this declaration function. By separating
  // this we allow for anonymous functions in expressions.
  //
  // For local functions there's a boolean parameter which needs to be set
  // when parsing the declaration.
  //
  //     funcdecl ::= '(' [parlist] ')' block 'end'
  //     parlist ::= Name {',' Name} | [',' '...'] | '...'

  function parseFunctionDeclaration(name, isLocal) {
    var parameters = [];
    expect('(');

    // The declaration has arguments
    if (!consume(')')) {
      // Arguments are a comma separated list of identifiers, optionally ending
      // with a vararg.
      while (true) {
        if (Identifier === token.type) {
          var parameter = parseIdentifier();
          // Function parameters are local.
          if (options.scope) scopeIdentifier(parameter);

          parameters.push(parameter);

          if (consume(',')) continue;
          else if (consume(')')) break;
        }
        // No arguments are allowed after a vararg.
        else if (VarargLiteral === token.type) {
          parameters.push(parsePrimaryExpression());
          expect(')');
          break;
        } else {
          raiseUnexpectedToken('<name> or \'...\'', token);
        }
      }
    }

    var body = parseBlock();
    expect('end');
    if (options.scope) destroyScope();

    isLocal = isLocal || false;
    return finishNode(ast.functionStatement(name, parameters, isLocal, body));
  }

  // Parse the function name as identifiers and member expressions.
  //
  //     Name {'.' Name} [':' Name]

  function parseFunctionName() {
    var base, name, marker;

    if (trackLocations) marker = createLocationMarker();
    base = parseIdentifier();

    if (options.scope) {
      attachScope(base, scopeHasName(base.name));
      createScope();
    }

    while (consume('.')) {
      pushLocation(marker);
      name = parseIdentifier();
      base = finishNode(ast.memberExpression(base, '.', name));
    }

    if (consume(':')) {
      pushLocation(marker);
      name = parseIdentifier();
      base = finishNode(ast.memberExpression(base, ':', name));
      if (options.scope) scopeIdentifierName('self');
    }

    return base;
  }

  //     tableconstructor ::= '{' [fieldlist] '}'
  //     fieldlist ::= field {fieldsep field} fieldsep
  //     field ::= '[' exp ']' '=' exp | Name = 'exp' | exp
  //
  //     fieldsep ::= ',' | ';'

  function parseTableConstructor() {
    var fields = []
      , key, value;

    while (true) {
      markLocation();
      if (Punctuator === token.type && consume('[')) {
        key = parseExpectedExpression();
        expect(']');
        expect('=');
        value = parseExpectedExpression();
        fields.push(finishNode(ast.tableKey(key, value)));
      } else if (Identifier === token.type) {
        if ('=' === lookahead.value) {
          key = parseIdentifier();
          next();
          value = parseExpectedExpression();
          fields.push(finishNode(ast.tableKeyString(key, value)));
        } else {
          value = parseExpectedExpression();
          fields.push(finishNode(ast.tableValue(value)));
        }
      } else {
        if (null == (value = parseExpression())) {
          locations.pop();
          break;
        }
        fields.push(finishNode(ast.tableValue(value)));
      }
      if (',;'.indexOf(token.value) >= 0) {
        next();
        continue;
      }
      break;
    }
    expect('}');
    return finishNode(ast.tableConstructorExpression(fields));
  }

  // Expression parser
  // -----------------
  //
  // Expressions are evaluated and always return a value. If nothing is
  // matched null will be returned.
  //
  //     exp ::= (unop exp | primary | prefixexp ) { binop exp }
  //
  //     primary ::= nil | false | true | Number | String | '...'
  //          | functiondef | tableconstructor
  //
  //     prefixexp ::= (Name | '(' exp ')' ) { '[' exp ']'
  //          | '.' Name | ':' Name args | args }
  //

  function parseExpression() {
    var expression = parseSubExpression(0);
    return expression;
  }

  // Parse an expression expecting it to be valid.

  function parseExpectedExpression() {
    var expression = parseExpression();
    if (null == expression) raiseUnexpectedToken('<expression>', token);
    else return expression;
  }


  // Return the precedence priority of the operator.
  //
  // As unary `-` can't be distinguished from binary `-`, unary precedence
  // isn't described in this table but in `parseSubExpression()` itself.
  //
  // As this function gets hit on every expression it's been optimized due to
  // the expensive CompareICStub which took ~8% of the parse time.

  function binaryPrecedence(operator) {
    var charCode = operator.charCodeAt(0)
      , length = operator.length;

    if (1 === length) {
      switch (charCode) {
        case 94: return 12; // ^
        case 42: case 47: case 37: return 10; // * / %
        case 43: case 45: return 9; // + -
        case 38: return 6; // &
        case 126: return 5; // ~
        case 124: return 4; // |
        case 60: case 62: return 3; // < >
      }
    } else if (2 === length) {
      switch (charCode) {
        case 47: return 10; // //
        case 46: return 8; // ..
        case 60: case 62:
            if('<<' === operator || '>>' === operator) return 7; // << >>
            return 3; // <= >=
        case 61: case 126: return 3; // == ~=
        case 111: return 1; // or
      }
    } else if (97 === charCode && 'and' === operator) return 2;
    return 0;
  }

  // Implement an operator-precedence parser to handle binary operator
  // precedence.
  //
  // We use this algorithm because it's compact, it's fast and Lua core uses
  // the same so we can be sure our expressions are parsed in the same manner
  // without excessive amounts of tests.
  //
  //     exp ::= (unop exp | primary | prefixexp ) { binop exp }

  function parseSubExpression(minPrecedence) {
    var operator = token.value
    // The left-hand side in binary operations.
      , expression, marker;

    if (trackLocations) marker = createLocationMarker();

    // UnaryExpression
    if (isUnary(token)) {
      markLocation();
      next();
      var argument = parseSubExpression(10);
      if (argument == null) raiseUnexpectedToken('<expression>', token);
      expression = finishNode(ast.unaryExpression(operator, argument));
    }
    if (null == expression) {
      // PrimaryExpression
      expression = parsePrimaryExpression();

      // PrefixExpression
      if (null == expression) {
        expression = parsePrefixExpression();
      }
    }
    // This is not a valid left hand expression.
    if (null == expression) return null;

    var precedence;
    while (true) {
      operator = token.value;

      precedence = (Punctuator === token.type || Keyword === token.type) ?
        binaryPrecedence(operator) : 0;

      if (precedence === 0 || precedence <= minPrecedence) break;
      // Right-hand precedence operators
      if ('^' === operator || '..' === operator) precedence--;
      next();
      var right = parseSubExpression(precedence);
      if (null == right) raiseUnexpectedToken('<expression>', token);
      // Push in the marker created before the loop to wrap its entirety.
      if (trackLocations) locations.push(marker);
      expression = finishNode(ast.binaryExpression(operator, expression, right));

    }
    return expression;
  }

  //     prefixexp ::= prefix {suffix}
  //     prefix ::= Name | '(' exp ')'
  //     suffix ::= '[' exp ']' | '.' Name | ':' Name args | args
  //
  //     args ::= '(' [explist] ')' | tableconstructor | String

  function parsePrefixExpression() {
    var base, name, marker;

    if (trackLocations) marker = createLocationMarker();

    // The prefix
    if (Identifier === token.type) {
      name = token.value;
      base = parseIdentifier();
      // Set the parent scope.
      if (options.scope) attachScope(base, scopeHasName(name));
    } else if (consume('(')) {
      base = parseExpectedExpression();
      expect(')');
      base.inParens = true; // XXX: quick and dirty. needed for validateVar
    } else {
      return null;
    }

    // The suffix
    var expression, identifier;
    while (true) {
      if (Punctuator === token.type) {
        switch (token.value) {
          case '[':
            pushLocation(marker);
            next();
            expression = parseExpectedExpression();
            base = finishNode(ast.indexExpression(base, expression));
            expect(']');
            break;
          case '.':
            pushLocation(marker);
            next();
            identifier = parseIdentifier();
            base = finishNode(ast.memberExpression(base, '.', identifier));
            break;
          case ':':
            pushLocation(marker);
            next();
            identifier = parseIdentifier();
            base = finishNode(ast.memberExpression(base, ':', identifier));
            // Once a : is found, this has to be a CallExpression, otherwise
            // throw an error.
            pushLocation(marker);
            base = parseCallExpression(base);
            break;
          case '(': case '{': // args
            pushLocation(marker);
            base = parseCallExpression(base);
            break;
          default:
            return base;
        }
      } else if (StringLiteral === token.type) {
        pushLocation(marker);
        base = parseCallExpression(base);
      } else {
        break;
      }
    }

    return base;
  }

  //     args ::= '(' [explist] ')' | tableconstructor | String

  function parseCallExpression(base) {
    if (Punctuator === token.type) {
      switch (token.value) {
        case '(':
          next();

          // List of expressions
          var expressions = [];
          var expression = parseExpression();
          if (null != expression) expressions.push(expression);
          while (consume(',')) {
            expression = parseExpectedExpression();
            expressions.push(expression);
          }

          expect(')');
          return finishNode(ast.callExpression(base, expressions));

        case '{':
          markLocation();
          next();
          var table = parseTableConstructor();
          return finishNode(ast.tableCallExpression(base, table));
      }
    } else if (StringLiteral === token.type) {
      return finishNode(ast.stringCallExpression(base, parsePrimaryExpression()));
    }

    raiseUnexpectedToken('function arguments', token);
  }

  //     primary ::= String | Numeric | nil | true | false
  //          | functiondef | tableconstructor | '...'

  function parsePrimaryExpression() {
    var literals = StringLiteral | NumericLiteral | BooleanLiteral | NilLiteral | VarargLiteral
      , value = token.value
      , type = token.type
      , marker;

    if (trackLocations) marker = createLocationMarker();

    if (type & literals) {
      pushLocation(marker);
      var raw = input.slice(token.range[0], token.range[1]);
      next();
      return finishNode(ast.literal(type, value, raw));
    } else if (Keyword === type && 'function' === value) {
      pushLocation(marker);
      next();
      if (options.scope) createScope();
      return parseFunctionDeclaration(null);
    } else if (consume('{')) {
      pushLocation(marker);
      return parseTableConstructor();
    }
  }

  // Parser
  // ------

  // Export the main parser.
  //
  //   - `wait` Hold parsing until end() is called. Defaults to false
  //   - `comments` Store comments. Defaults to true.
  //   - `scope` Track identifier scope. Defaults to false.
  //   - `locations` Store location information. Defaults to false.
  //   - `ranges` Store the start and end character locations. Defaults to
  //     false.
  //   - `onCreateNode` Callback which will be invoked when a syntax node is
  //     created.
  //   - `onCreateScope` Callback which will be invoked when a new scope is
  //     created.
  //   - `onDestroyScope` Callback which will be invoked when the current scope
  //     is destroyed.
  //
  // Example:
  //
  //     var parser = require('luaparser');
  //     parser.parse('i = 0');

  exports.parse = parse;

  function parse(_input, _options) {
    if ('undefined' === typeof _options && 'object' === typeof _input) {
      _options = _input;
      _input = undefined;
    }
    if (!_options) _options = {};

    input = _input || '';
    options = extend(defaultOptions, _options);

    // Rewind the lexer
    index = 0;
    line = 1;
    lineStart = 0;
    length = input.length;
    // When tracking identifier scope, initialize with an empty scope.
    scopes = [[]];
    scopeDepth = 0;
    globals = [];
    locations = [];

    if (options.comments) comments = [];
    if (!options.wait) return end();
    return exports;
  }

  // Write to the source code buffer without beginning the parse.
  exports.write = write;

  function write(_input) {
    input += String(_input);
    length = input.length;
    return exports;
  }

  // Send an EOF and begin parsing.
  exports.end = end;

  function end(_input) {
    if ('undefined' !== typeof _input) write(_input);

    // Ignore shebangs.
    if (input && input.substr(0, 2) === '#!') input = input.replace(/^.*/, function (line) {
      return line.replace(/./g, ' ');
    });

    length = input.length;
    trackLocations = options.locations || options.ranges;
    // Initialize with a lookahead token.
    lookahead = lex();

    var chunk = parseChunk();
    if (options.comments) chunk.comments = comments;
    if (options.scope) chunk.globals = globals;

    if (locations.length > 0)
      throw new Error('Location tracking failed. This is most likely a bug in luaparse');

    return chunk;
  }

}));
/* vim: set sw=2 ts=2 et tw=79 : */

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)(module), __webpack_require__(4)))

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = function(module) {
	if(!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if(!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),
/* 4 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const ex3_internal_code = __webpack_require__(6);

const compile = abs_syn_tree => {
	const asm_main = [];
	const asm_sub = [];

	let gCnt = 0;

	const env_vars = {};
	const env_stack = ["V_G"];
	const current_env = _ => env_stack[env_stack.length-1];
	const exit_env = _ => env_stack.pop();
	const enter_env = _ => env_stack.push("V_E"+(gCnt++));
	
	const __find_var = (name, local) => env_stack.slice(local ? 1 : 0).map(e => e+"_"+name).filter(e => e in env_vars).pop();
	const find_var = name => {
		const label = __find_var(name, false);
		if(!label){
			throw new Error("Undeclared variable: "+name);
		}
		return label;
	};
	const assign_var = (name, local) => {
		const label = (local ? current_env() : env_stack[0])+"_"+name;
		return __find_var(name, local) || (env_vars[label] = label);
	};
	
	const huge_tables = [];
	
	const gen_label = (num, prefix = "L_SYS_") => "A".repeat(num).split("").map(e => prefix+(gCnt++));
	
	const loop_stack = [];
	const enter_loop = label => loop_stack.push(label);
	const break_loop = _ => loop_stack[loop_stack.length-1];
	const exit_loop = _ => loop_stack.pop();

	const cvals = {};
	const const_value = v => {
		const label = (v < 0 ? "C_M" : "C_P")+Math.abs(v);
		cvals[label] = "DEC "+v;
		return label;
	};

	const code_gen = (ast, t) => {
		if(ast.type == "Chunk"){
			ast.body.forEach(e => code_gen(e, t));
		}
		else if(ast.type == "CallStatement"){
			code_gen(ast.expression, t);
		}
		else if(ast.type == "CallExpression"){
			const base = "base" in ast.base ? ast.base.base.name.toUpperCase() : "USR";
			const name = "identifier" in ast.base ? ast.base.identifier.name : ast.base.name;
			if(name == "__ASM__"){
				t.push(ast.arguments[0].value);
			}
			else if(name == "__EVAL__"){
				t.push(eval(ast.arguments[0].value));
			}
			else{
				ast.arguments.forEach(e => code_gen(e, t));
				t.push("BSA F_"+base+"_"+name);
			}
		}
		else if(ast.type == "LabelStatement"){
			t.push("L_USR_"+ast.label.name+",");
		}
		else if(ast.type == "GotoStatement"){
			t.push("BUN L_USR_"+ast.label.name);
		}
		else if(ast.type == "DoStatement"){
			enter_env();
			ast.body.forEach(e => code_gen(e, t));
			exit_env();
		}
		else if(ast.type == "WhileStatement"){
			const [ls,lc,le] = gen_label(3, "L_WHILE_");
			
			enter_loop(le);
			enter_env();
			t.push(ls+",");
			code_gen(ast.condition, t);
			t.push("BSA F_POP");
			t.push("SZA");
			t.push("BUN "+lc);
			t.push("BUN "+le);
			t.push(lc+",");
			ast.body.forEach(e => code_gen(e, t));
			t.push("BUN "+ls);
			t.push(le+",");
			exit_env();
			exit_loop();
		}
		else if(ast.type == "RepeatStatement"){
			const [lc,le] = gen_label(2, "L_REPEAT_");
			
			enter_loop(le);
			enter_env();
			t.push(lc+",");
			ast.body.forEach(e => code_gen(e, t));
			code_gen(ast.condition, t);
			t.push("BSA F_POP");
			t.push("SZA");
			t.push("BUN "+le);
			t.push("BUN "+lc);
			t.push(le+",");
			exit_env();
			exit_loop();
		}
		else if(ast.type == "ForNumericStatement"){
			const [ls,le] = gen_label(2, "L_FOR_");
			
			enter_loop(le);
			enter_env();
			code_gen(ast.start, t);
			t.push("BSA F_POP");
			t.push("STA "+assign_var(ast.variable.name, true));
			
			t.push(ls+",");
			ast.body.forEach(e => code_gen(e, t));
			
			if(ast.step === null){
				t.push("LDA "+find_var(ast.variable.name));
				t.push("INC");
				t.push("STA "+find_var(ast.variable.name));
			}
			else{
				code_gen(ast.step, t);
				t.push("BSA F_POP");
				t.push("ADD "+find_var(ast.variable.name));
				t.push("STA "+find_var(ast.variable.name));
			}
			
			t.push("LDA "+find_var(ast.variable.name));
			t.push("CMA");
			t.push("INC");
			t.push("STA R_T1");
			code_gen(ast.end, t);
			t.push("BSA F_POP");
			t.push("ADD R_T1");
			t.push("SNA");
			t.push("BUN "+ls);
			
			t.push(le+",");
			exit_env();
			exit_loop();
		}
		else if(ast.type == "BreakStatement"){
			t.push("BUN "+break_loop());
		}
		else if(ast.type == "IfStatement"){
			const [le] = gen_label(1, "L_IF_");
			
			ast.clauses.forEach(ast => {
				const [lc,ln] = gen_label(2, "L_IF_");
				
				enter_env();
				if(ast.type != "ElseClause"){
					code_gen(ast.condition, t);
					t.push("BSA F_POP");
					t.push("SZA");
					t.push("BUN "+lc);
					t.push("BUN "+ln);
					t.push(lc+",");
				}
				ast.body.forEach(e => code_gen(e, t));
				t.push("BUN "+le);
				t.push(ln+",");
				exit_env();
			});
			t.push(le+",");
		}
		else if(ast.type == "FunctionDeclaration"){
			const l = "F_USR_"+ast.identifier.name;
			
			enter_env();
			asm_sub.push(l+",");
			asm_sub.push("HEX 0");
			[].concat(ast.parameters).reverse().forEach(p => {
				asm_sub.push("BSA F_POP");
				asm_sub.push("STA "+assign_var(p.name, true));
			});
			
			ast.body.forEach(e => code_gen(e, asm_sub));
			asm_sub.push("BUN "+l+" I");
			exit_env();
		}
		else if(ast.type == "ReturnStatement"){
			ast.arguments.forEach(e => code_gen(e, t));
		}
		else if(ast.type == "AssignmentStatement" || ast.type == "LocalStatement"){
			ast.init.forEach(e => code_gen(e, t));
			[].concat(ast.variables).reverse().forEach(va => {
				if(va.type == "Identifier"){
					t.push("BSA F_POP");
					t.push("STA "+assign_var(va.name, ast.type == "LocalStatement"));
				}
				else if(va.type == "IndexExpression"){
					var name = find_var(va.base.name);
					code_gen(va.index, t);
					if(huge_tables.some(e => e == name)){
						t.push("LDA "+name);
						t.push("BSA F_PUSH");
						t.push("BSA F_WRITE_HUGE_ARRAY");
					}
					else{
						t.push("BSA F_POP");
						t.push("ADD "+name);
						t.push("STA R_T1");
						t.push("BSA F_POP");
						t.push("STA R_T1 I");
					}
				}
				else {
					throw new Error("Unknown variable type: "+va.type);
				}
			});
			if(ast.init[0].type == "TableConstructorExpression" && ast.init[0].fields.length > 128){
				huge_tables.push(find_var(ast.variables[0].name));
			}
		}
		else if(ast.type == "TableConstructorExpression"){
			const [l] = gen_label(1, "D_ARRAY_");
			
			asm_sub.push(l+", SYM "+l+"_MEM");
			asm_sub.push("DEC "+ast.fields.length);
			asm_sub.push(l+"_MEM,");
			
			let fields = ast.fields.map(item => {
				if(item.value.type != "NumericLiteral"){
					throw new Error("Table constructor fields must be NumericLiteral: "+item.value.type);
				}
				return item.value.value;
			});
			
			if(fields.length > 128){
				const f = [];
				for(let i = 0; i < fields.length; i++){
					f.push((0xFF & fields[i]) | ((0xFF & (fields[++i] || 0)) << 8));
				}
				fields = f;
			}
			
			fields.forEach(v => asm_sub.push("DEC "+v));
			
			t.push("LDA "+l);
			t.push("BSA F_PUSH");
		}
		else if(ast.type == "IndexExpression"){
			var name = find_var(ast.base.name);
			code_gen(ast.index, t);
			if(huge_tables.some(e => e == name)){
				t.push("LDA "+name);
				t.push("BSA F_PUSH");
				t.push("BSA F_READ_HUGE_ARRAY");
				t.push("BSA F_POP");
			}
			else{
				t.push("BSA F_POP");
				t.push("ADD "+name);
				t.push("STA R_T1");
				t.push("LDA R_T1 I");
			}
			t.push("BSA F_PUSH");
		}
		else if(ast.type == "NumericLiteral"){
			t.push("LDA "+const_value(ast.value));
			t.push("BSA F_PUSH");
		}
		else if(ast.type == "Identifier"){
			t.push("LDA "+find_var(ast.name));
			t.push("BSA F_PUSH");
		}
		else if(ast.type == "LogicalExpression"){
			code_gen(ast.left, t);
			
			const [lc,le] = gen_label(2, "L_LOGIC_");
			if(ast.operator == "and"){
				t.push("BSA F_POP");
				t.push("SZA");
				t.push("BUN "+lc);
				t.push("BUN "+le);
				t.push(lc+",");
				code_gen(ast.right, t);
				t.push("BSA F_POP");
				t.push(le+",");
				t.push("BSA F_PUSH");
			}
			else if(ast.operator == "or"){
				t.push("BSA F_POP");
				t.push("SZA");
				t.push("BUN "+le);
				t.push("BUN "+lc);
				t.push(lc+",");
				code_gen(ast.right, t);
				t.push("BSA F_POP");
				t.push(le+",");
				t.push("BSA F_PUSH");
			}
		}
		else if(ast.type == "BinaryExpression" && "opt_loop" in ast){
			code_gen(ast.left, t);
			t.push("BSA F_POP");
			
			if(ast.operator == ">>" || ast.operator == "<<"){
				for(let i = 0; i < ast.opt_loop; i++){
					t.push("CLE");
					t.push(ast.operator == ">>" ? "CIR" : "CIL");
				}
			}
			else if(ast.operator == "^"){
				t.push("STA R_T1");
				t.push("LDA "+const_value(1));
				
				for(let i = 0; i < ast.opt_loop; i++){
					t.push("MUL R_T1");
				}
			}
			else {
				throw new Error("Unknown binop: "+ast.operator);
			}
			
			t.push("BSA F_PUSH");
		}
		else if(ast.type == "BinaryExpression"){
			code_gen(ast.left, t);
			code_gen(ast.right, t);
			
			if(ast.operator == "+"){
				t.push("BSA F_POP");
				t.push("STA R_T1");
				t.push("BSA F_POP");
				t.push("ADD R_T1");
			}
			else if(ast.operator == "-"){
				t.push("BSA F_POP");
				t.push("CMA");
				t.push("INC");
				t.push("STA R_T1");
				t.push("BSA F_POP");
				t.push("ADD R_T1");
			}
			else if(ast.operator == "*"){
				t.push("BSA F_POP");
				t.push("STA R_T1");
				t.push("BSA F_POP");
				t.push("MUL R_T1");
			}
			else if(ast.operator == "^"){
				t.push("BSA F_POP");
				t.push("STA R_T1");
				t.push("BSA F_POP");
				t.push("STA R_T2");
				t.push("LDA "+const_value(1));
				t.push("STA R_T3");
				
				const [ls,lc,le] = gen_label(3, "L_EXP_");
				t.push(ls+",");
				t.push("LDA R_T1");
				t.push("SZA");
				t.push("BUN "+lc);
				t.push("BUN "+le);
				t.push(lc+",");
				t.push("ADD "+const_value(-1));
				t.push("STA R_T1");
				t.push("LDA R_T3");
				t.push("MUL R_T2");
				t.push("STA R_T3");
				t.push("BUN "+ls);
				t.push(le+",");
				t.push("LDA R_T3");
			}
			else if(ast.operator == "&"){
				t.push("BSA F_POP");
				t.push("STA R_T1");
				t.push("BSA F_POP");
				t.push("AND R_T1");
			}
			else if(ast.operator == "|"){
				t.push("BSA F_OR");
				t.push("BSA F_POP");
			}
			else if(ast.operator == ">>" || ast.operator == "<<"){
				t.push("BSA F_POP");
				t.push("STA R_T1");
				t.push("BSA F_POP");
				t.push("STA R_T2");
				
				const [ls,lc,le] = gen_label(3, "L_SHIFT_");
				t.push(ls+",");
				t.push("LDA R_T1");
				t.push("SZA");
				t.push("BUN "+lc);
				t.push("BUN "+le);
				t.push(lc+",");
				t.push("ADD "+const_value(-1));
				t.push("STA R_T1");
				t.push("LDA R_T2");
				t.push("CLE");
				t.push(ast.operator == ">>" ? "CIR" : "CIL");
				t.push("STA R_T2");
				t.push("BUN "+ls);
				t.push(le+",");
				t.push("LDA R_T2");
			}
			else if(ast.operator == "=="){
				t.push("BSA F_POP");
				t.push("CMA");
				t.push("INC");
				t.push("STA R_T1");
				t.push("BSA F_POP");
				t.push("ADD R_T1");
				
				const [l1,l2,l3] = gen_label(3, "L_EQ_");
				t.push("SZA");
				t.push("BUN "+l1);
				t.push("BUN "+l2);
				t.push(l1+","); // !=
				t.push("CLA");
				t.push("BUN "+l3)
				t.push(l2+","); // ==
				t.push("CLA");
				t.push("INC");
				t.push(l3+",");
			}
			else if(ast.operator == "~="){
				t.push("BSA F_POP");
				t.push("CMA");
				t.push("INC");
				t.push("STA R_T1");
				t.push("BSA F_POP");
				t.push("ADD R_T1");
				
				const [l1,l2,l3] = gen_label(3, "L_NEQ_");
				t.push("SZA");
				t.push("BUN "+l1);
				t.push("BUN "+l2);
				t.push(l1+","); // !=
				t.push("CLA");
				t.push("INC");
				t.push("BUN "+l3)
				t.push(l2+","); // ==
				t.push("CLA");
				t.push(l3+",");
			}
			else if(ast.operator == "<"){
				t.push("BSA F_POP");
				t.push("CMA");
				t.push("INC");
				t.push("STA R_T1");
				t.push("BSA F_POP");
				t.push("ADD R_T1");
				
				const [l1,l2,l3] = gen_label(3, "L_LT_");
				t.push("SNA");
				t.push("BUN "+l1);
				t.push("BUN "+l2);
				t.push(l1+","); // >= 0
				t.push("CLA");
				t.push("BUN "+l3)
				t.push(l2+","); // < 0
				t.push("CLA");
				t.push("INC");
				t.push(l3+",");
			}
			else if(ast.operator == "<="){
				t.push("BSA F_POP");
				t.push("CMA");
				t.push("INC");
				t.push("STA R_T1");
				t.push("BSA F_POP");
				t.push("ADD R_T1");
				
				const [l1,l2,l3,l4] = gen_label(4, "L_LT_EQ_");
				t.push("SNA");
				t.push("BUN "+l1);
				t.push("BUN "+l3);
				t.push(l1+","); // >= 0
				t.push("SZA");
				t.push("BUN "+l2); 
				t.push("BUN "+l3);
				t.push(l2+","); // >= 0 and != 0
				t.push("CLA");
				t.push("BUN "+l4)
				t.push(l3+","); // < 0 or (>= 0 and == 0)
				t.push("CLA");
				t.push("INC");
				t.push(l4+",");
			}
			else if(ast.operator == ">="){
				t.push("BSA F_POP");
				t.push("CMA");
				t.push("INC");
				t.push("STA R_T1");
				t.push("BSA F_POP");
				t.push("ADD R_T1");
				
				const [l1,l2,l3] = gen_label(3, "L_GT_EQ_");
				t.push("SPA");
				t.push("BUN "+l1);
				t.push("BUN "+l2);
				t.push(l1+","); // < 0
				t.push("CLA");
				t.push("BUN "+l3)
				t.push(l2+","); // >= 0
				t.push("CLA");
				t.push("INC");
				t.push(l3+",");
			}
			else if(ast.operator == ">"){
				t.push("BSA F_POP");
				t.push("CMA");
				t.push("INC");
				t.push("STA R_T1");
				t.push("BSA F_POP");
				t.push("ADD R_T1");
				
				const [l1,l2,l3,l4] = gen_label(4, "L_GT_");
				t.push("SPA");
				t.push("BUN "+l1);
				t.push("BUN "+l2);
				t.push(l1+","); // < 0 or (>= 0 and == 0)
				t.push("CLA");
				t.push("BUN "+l4)
				t.push(l2+","); // >= 0
				t.push("SZA");
				t.push("BUN "+l3); 
				t.push("BUN "+l1);
				t.push(l3+","); // >= 0 and != 0
				t.push("CLA");
				t.push("INC");
				t.push(l4+",");
			}
			else {
				throw new Error("Unknown binop: "+ast.operator);
			}
			
			t.push("BSA F_PUSH");
		}
		else if(ast.type == "UnaryExpression"){
			code_gen(ast.argument, t);
			
			if(ast.operator == "~"){
				t.push("BSA F_POP");
				t.push("CMA");
			}
			else if(ast.operator == "-"){
				t.push("BSA F_POP");
				t.push("CMA");
				t.push("INC");
			}
			else if(ast.operator == "not"){
				const [l,le] = gen_label(2, "L_NOT_");
				t.push("BSA F_POP");
				t.push("SZA");
				t.push("BUN "+l);
				t.push("CLA");
				t.push("INC");
				t.push("BUN "+le);
				t.push(l+",");
				t.push("CLA");
				t.push(le+",");
			}
			else if(ast.operator == "#"){
				t.push("BSA F_POP");
				t.push("ADD "+const_value(-1));
				t.push("STA R_T1");
				t.push("LDA R_T1 I");
			}
			else {
				throw new Error("Unknown unop: "+ast.operator);
			}
			
			t.push("BSA F_PUSH");
		}
		else if(ast.type != "Noop"){
			throw new Error("Unknown type: "+ast.type);
		}
	};

	code_gen(abs_syn_tree, asm_main);
	asm_main.unshift("ORG 10");
	asm_main.push("HLT");

	Object.keys(env_vars).forEach(l => asm_main.push(l+",\tDEC 0"))

	ex3_internal_code.split("\n")
	.map(e => e.trim().replace(/\((-?\d+)\)/, (v, i) => const_value(parseInt(i))))
	.filter(e => e)
	.forEach(e => asm_sub.push(e));
	
	Object.keys(cvals).forEach(l => asm_sub.push(l+",\t"+cvals[l]));

	asm_sub.push("STACK,\tEND");

	return asm_main.concat(asm_sub);
};

module.exports = {compile};


/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = `

F_EX3_sleep,
	HEX 0
	SLP
	BUN F_EX3_sleep I

F_EX3_get_random,
	HEX 0
	RND
	BSA F_PUSH
	BUN F_EX3_get_random I

F_EX3_get_key_state,
	HEX 0
	BTN
	AND (1)
	BSA F_PUSH
	BTN
	AND (2)
	BSA F_PUSH
	BTN
	AND (4)
	BSA F_PUSH
	BTN
	AND (8)
	BSA F_PUSH
	BUN F_EX3_get_key_state I

F_USR_print,
F_EX3_output_7seg,
	HEX 0
	BSA F_POP
	SEG
	BUN F_EX3_output_7seg I

F_EX3_draw_static_sprite,
	HEX 0
	BSA F_POP
	SLY
	BSA F_POP
	SLX
	BSA F_POP
	MUL (64)
	STA R_T1
	BSA F_POP
	ADD R_T1
	WRT
	BUN F_EX3_draw_static_sprite I
	
F_EX3_draw_dynamic_sprite,
	HEX 0
	LDA (-1)
	SLX
	BSA F_POP
	SLY
	BSA F_POP
	TRY
	BSA F_POP
	TRX
	BSA F_POP
	MUL (64)
	STA R_T1
	BSA F_POP
	ADD R_T1
	WRT
	BUN F_EX3_draw_dynamic_sprite I

F_OR,
	HEX 0
	BSA F_POP
	CMA
	STA R_T0
	BSA F_POP
	CMA
	AND R_T0
	CMA
	BSA F_PUSH
	BUN F_OR I

F_ACCESS_HUGE_ARRAY,
	HEX 0
	BSA F_POP
	STA R_T0
	BSA F_POP
	CLE
	CIR
	STA R_T1
	CLA
	SZE
	INC
	STA R_T2
	LDA R_T1
	ADD R_T0
	STA R_T1
	BUN F_ACCESS_HUGE_ARRAY I

F_WRITE_HUGE_ARRAY,
	HEX 0
	BSA F_ACCESS_HUGE_ARRAY
	LDA R_T2
	SZA
	BUN L_F_WRITE_UPPER
	BUN L_F_WRITE_LOWER
L_F_WRITE_UPPER,
	BSA F_POP
	CIL
	CIL
	CIL
	CIL
	CIL
	CIL
	CIL
	CIL
	AND (65280)
	BSA F_PUSH
	LDA R_T1 I
	AND (255)
	BSA F_PUSH
	BSA F_OR
	BSA F_POP
	BUN L_F_WRITE_END
L_F_WRITE_LOWER,
	BSA F_POP
	AND (255)
	BSA F_PUSH
	LDA R_T1 I
	AND (65280)
	BSA F_PUSH
	BSA F_OR
	BSA F_POP
L_F_WRITE_END,
	STA R_T1 I
	BUN F_WRITE_HUGE_ARRAY I

F_READ_HUGE_ARRAY,
	HEX 0
	BSA F_ACCESS_HUGE_ARRAY
	LDA R_T1 I
	STA R_T1
	LDA R_T2
	SZA
	BUN L_F_READ_UPPER
	BUN L_F_READ_LOWER
L_F_READ_UPPER,
	LDA R_T1
	CIR
	CIR
	CIR
	CIR
	CIR
	CIR
	CIR
	CIR
	BUN L_F_READ_END
L_F_READ_LOWER,
	LDA R_T1
L_F_READ_END,
	AND (255)
	BSA F_PUSH
	BUN F_READ_HUGE_ARRAY I

F_PUSH,
	HEX 0
	STA R_ESP I
	LDA R_ESP
	INC
	STA R_ESP
	BUN F_PUSH I

F_POP,
	HEX 0
	LDA R_ESP
	ADD (-1)
	STA R_ESP
	LDA R_ESP I
	BUN F_POP I

R_T0,  HEX 0
R_T1,  HEX 0
R_T2,  HEX 0
R_T3,  HEX 0
R_T4,  HEX 0
R_T5,  HEX 0

R_ESP, SYM STACK

`;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// 定数の畳み込み
const constant_folding = tree => {
	const fold_tree = t => {
		if(!t){
			return null;
		}
		if(t.type == "NumericLiteral"){
			return t.value;
		}
		if(t.type == "UnaryExpression"){
			const a = fold_tree(t.argument);
			if(a === null){
				return null;
			}
			if(t.operator == "~"){
				return ~a;
			}
			if(t.operator == "-"){
				return -a;
			}
			if(t.operator == "not"){
				return a ? 0 : 1;
			}
		}
		if(t.type == "BinaryExpression" || t.type == "LogicalExpression"){
			const [l,r] = [fold_tree(t.left), fold_tree(t.right)];
			if(t.operator == "and" && l !== null && !l){
				return l;
			}
			if(t.operator == "or" && l !== null && l){
				return l;
			}
			if(r === null || l === null){
				return null;
			}
			if(t.operator == "and"){
				return l&&r;
			}
			if(t.operator == "or"){
				return l||r;
			}
			if(t.operator == "=="){
				return l==r ? 1 : 0;
			}
			if(t.operator == "~="){
				return l!=r ? 1 : 0;
			}
			if(t.operator == "<"){
				return l<r ? 1 : 0;
			}
			if(t.operator == "<="){
				return l<=r ? 1 : 0;
			}
			if(t.operator == ">="){
				return l>=r ? 1 : 0;
			}
			if(t.operator == ">"){
				return l>r ? 1 : 0;
			}
			if(t.operator == "+"){
				return l+r;
			}
			if(t.operator == "|"){
				return l|r;
			}
			if(t.operator == "-"){
				return l-r;
			}
			if(t.operator == "*"){
				return l*r;
			}
			if(t.operator == "/" || t.operator == "//"){
				return parseInt(l/r);
			}
			if(t.operator == "^"){
				return l**r;
			}
			if(t.operator == "%"){
				return l%r;
			}
			if(t.operator == "&"){
				return l&r;
			}
			if(t.operator == "~"){
				return l^r;
			}
			if(t.operator == ">>"){
				return l>>r;
			}
			if(t.operator == "<<"){
				return l<<r;
			}
		}
		return null;
	};
	const walk_tree = t => {
		if(typeof t != "object"){
			return t;
		}
		for(let k in t){
			const v = fold_tree(t[k]);
			t[k] = (v === null) ? walk_tree(t[k]) : {
				"type": "NumericLiteral",
				"value": v,
				"raw": ""+v,
			};
		}
		return t;
	};
	return walk_tree(tree);
};

// 定数伝播
const constant_propagation = tree => {
	const assign = {};
	
	const walk_tree_find_assign = t => {
		if(typeof t != "object" || !t){
			return;
		}
		if(t.type == "AssignmentStatement" || t.type == "LocalStatement"){
			t.variables.forEach((v, i) => {
				if(!(v.name in assign)){
					assign[v.name] = [];
				}
				assign[v.name].push(t.init[i]);
			});
		}
		for(let k in t){
			walk_tree_find_assign(t[k]);
		}
	};
	
	walk_tree_find_assign(tree);
	const constants = Object.keys(assign).filter(k => assign[k].length == 1 && assign[k][0] && assign[k][0].type == "NumericLiteral");
	const is_const = name => constants.some(e => e == name);
	
	const walk_tree_prop_const = t => {
		if(t && typeof t == "object"){
			if(t.type == "Identifier" && is_const(t.name)){
				t = assign[t.name][0];
			}
			
			const assigning = t.type == "AssignmentStatement" || t.type == "LocalStatement";
			if(assigning && !t.variables.some(va => !is_const(va.name))){
				return {type: "Noop"};
			}
			
			for(let k in t){
				if(assigning && k == "variables"){
					continue;
				}
				t[k] = walk_tree_prop_const(t[k]);
			}
		}
		return t;
	};
	
	return walk_tree_prop_const(tree);
};

// 演算子適用時のループを展開
const unroll_op_loop = tree => {
	const walk_tree = t => {
		if(t && typeof t == "object"){
			if((t.operator == "^" || t.operator == "<<" || t.operator == ">>") && t.right.type == "NumericLiteral"){
				t.opt_loop = t.right.value;
			}
			for(let k in t){
				t[k] = walk_tree(t[k]);
			}
		}
		return t;
	};
	return walk_tree(tree);
};

// 無駄なBUNを削除
const remove_bun = (t, i) => {
	const m = (t[i] || "").match(/^BUN (.+)$/);
	if(m){
		for(let k = i+1; k < t.length; k++){
			const m2 = (t[k] || "").match(/^(.+),$/);
			if(m2){
				if(m[1] == m2[1]){
					t[i] = null;
					break;
				}
			}else{
				break;
			}
		}
	}
};

// 無駄なPUSH/POPを削除
const remove_push_pop = (t, i) => {
	if(t[i] == "BSA F_PUSH" && t[i+1] == "BSA F_POP" || t[i] == "BSA F_POP" && t[i+1] == "BSA F_PUSH"){
		t[i] = t[i+1] = null;
	}
};

// 無駄なLDA/STAを削除
const remove_lda_sta = (t, i) => {
	const cm = (t[i] || "").match(/^(LDA|STA) (.+)$/);
	if(cm){
		const nm = (t[i+1] || "").match(new RegExp("^(LDA|STA) "+cm[2]+"$"));
		if(nm && ((cm[1] == "LDA" && nm[1] == "STA") || (cm[1] == "STA" && nm[1] == "LDA"))){
			t[i+1] = null;
		}
	}
};

// ACを実質変更しない命令を削除
const remove_not_affect_ac = (t, i) => {
	const target = /^(CLA|LDA)/;
	const not_affect_ac = /^(S[TPNZ]A|SZE|C[LM]E|SEG|SL[XY]|WRT|TR[XY]|SLP)/;
	if(target.test(t[i])){
		for(let k = i+1; k < t.length; k++){
			if(target.test(t[k]) && t[i] == t[k]){
				t[k] = null;
			}
			if(t[k] && !not_affect_ac.test(t[k])){
				break;
			}
		}
	}
};

// 自己代入を最適化
const fix_self_assign = (t, i) => {
	const repl_conf = [{
		pat: [/^LDA (.+)$/, /^BSA/, /^LDA/, /^STA/, /^BSA/, /^(ADD|MUL|AND)/],
		rep: [0,0,1,0,0,"$1 $0"],
	}, {
		pat: [/^LDA (.+)$/, /^BSA/, /^LDA/, /^CMA$/, /^INC$/, /^STA/, /^BSA/, /^(ADD)/],
		rep: [0,0,1,1,1,0,0,"$1 $0"],
	}];
	
	for(let {pat, rep} of repl_conf){
		let ms = [];
		for(let k = 0; k < pat.length; k++){
			const m = (t[i+k] || "").match(pat[k]);
			if(!m){
				ms = null;
				break;
			}
			ms = ms.concat(m.slice(1));
		}
		if(ms != null && new RegExp("^STA "+ms[0]+"$").test(t[i+pat.length])){
			for(let k = 0; k < rep.length; k++){
				if(typeof rep[k] === "string"){
					t[i+k] = rep[k];
					ms.forEach((v, j) => t[i+k] = t[i+k].replace("$"+j, v));
				}
				else if(rep[k] === 0){
					t[i+k] = null;
				}
			}
		}
	}
};

// よりクロック数の少ない命令に置き換え
const use_fast_inst = (t, i) => {
	if(t[i] == "LDA C_P0"){
		t[i] = "CLA";
	}
	else if(t[i] == "ADD C_P1"){
		t[i] = "INC";
	}
};

// スタックの代わりにレジスタを利用
const use_register = (t, i) => {
	if(!/^BSA F_PUSH$/.test(t[i])){
		return;
	}
	
	const used_reg = [];
	for(let k = i+1; k < t.length; k++){
		const m = t[k].match(/R_T(\d)$/);
		if(m){
			used_reg.push(parseInt(m[1]));
			continue;
		}
		
		if(/^BSA F_POP$/.test(t[k])){
			const reg = [0,1,2,3,4,5].filter(r => !used_reg.some(u => u == r)).shift();
			if(reg !== undefined){
				t[i] = "STA R_T"+reg;
				t[k] = "LDA R_T"+reg;
			}
			break;
		}
		
		if(/^(BUN|BSA)/.test(t[k]) || /,/.test(t[k])){
			break;
		}
	}
};

const merge_labels = code => {
	const result = [];
	code.forEach(inst => {
		const m = /^(.+),$/.exec(inst);
		if(m){
			if(Array.isArray(result[0])){
				result[0].push(m[1]);
				return;
			}
			inst = [m[1]];
		}
		result.unshift(inst);
	});
	return result.reverse();
};
const reassign_labels = (code, prefix = "L_") => {
	let index = 0;
	const assign_list = [];
	return code.map(e => {
		if(Array.isArray(e)){
			const label = prefix+(index++);
			e.forEach(l => assign_list.push({
				regex: new RegExp(l+"( I)?$"),
				replace: label+"$1"
			}));
			return label+",";
		}
		return e;
	}).map(e => {
		assign_list.forEach(assign => e = e.replace(assign.regex, assign.replace));
		return e;
	});
};

// for SIZE (increases BSA overhead)
const optimize_sequence = code => {
	let insts = merge_labels(code);
	let gadd = [];
	
	for(let sz = 20; sz > 2; sz--){
		const seqs = [];
		for(let d = 0; d < sz; d++){
			for(let i = d; i < insts.length; i += sz){
				const sub = insts.slice(i, i+sz);
				if(/^(S[PNZ]A|SZE)/.test(sub[sz-1]) || sub.some(inst => Array.isArray(inst) || /^(HEX|DEC|SYM)/.test(inst))){
					continue;
				}
				seqs.push({i, block: JSON.stringify(sub)});
			}
		}
		
		const hist = [];
		const dups = {};
		
		seqs.forEach(seq => {
			const dup = hist.find(h => h.block == seq.block);
			if(dup){
				if(!(seq.block in dups)){
					dups[seq.block] = [dup];
				}
				dups[seq.block].push(seq);
			}else{
				hist.push(seq);
			}
		});
		
		const rmj = [];
		let adj = [];
		
		Object.keys(dups)
		.map(k => dups[k].sort((a, b) => a.i - b.i))
		.sort((a, b) => b.length - a.length)
		.forEach((dup, j) => {
			const label = "SUBROUTINE_"+sz+"_"+j;
			const check_fn = x => !rmj.some(r => (r.i <= x.i && x.i < r.i+sz) || (x.i <= r.i && r.i < x.i+sz));
			
			dup = dup.filter(check_fn);
			if(!dup.length){
				return;
			}
			
			rmj.push({label, i: dup[0].i});
			dup = dup.filter(check_fn);
			if(dup.length < 1){
				rmj.pop();
				return;
			}
			
			adj.push([label]);
			adj.push("HEX 0");
			adj = adj.concat(JSON.parse(dup[0].block));
			adj.push("BUN "+label+" I");
			
			while(dup.length){
				rmj.push({label, i: dup[0].i});
				dup = dup.filter(check_fn);
			}
		});
		
		rmj.sort((a, b) => a.i - b.i).forEach((rm, j) => {
			insts.splice(rm.i-(sz-1)*j, sz, "BSA "+rm.label);
		});
		
		adj.push(insts.pop());
		insts = insts.concat(adj);
	}
	
	return reassign_labels(insts);
};

const methods_tree = {
	constant_folding, // for SPEED, for SIZE
	constant_propagation, // for SPEED, for SIZE
	unroll_op_loop, // for SPEED (sometimes increases SIZE)
};
const optimize_tree = tree => {
	const orig = JSON.stringify(tree);
	for(let key in methods_tree){
		tree = methods_tree[key](tree);
	}
	return JSON.stringify(tree) == orig ? tree : optimize_tree(tree);
};

const methods_code = {
	remove_bun, // for SIZE
	remove_push_pop, // for SPEED, for SIZE
	remove_lda_sta, // for SPEED, for SIZE
	remove_not_affect_ac, // for SPEED, for SIZE
	fix_self_assign, // for SPEED, for SIZE
	use_fast_inst, // for SPEED
	use_register, // for SPEED
};
const optimize_code = code => {
	const orig = JSON.stringify(code);
	code.forEach((_, i) => {
		for(let key in methods_code){
			methods_code[key](code, i);
		}
	});
	code = code.filter(e => e);
	return JSON.stringify(code) == orig ? code : optimize_code(code);
};

module.exports = {
	optimize_sequence,
	optimize_tree, methods_tree,
	optimize_code, methods_code,
};


/***/ })
/******/ ]);