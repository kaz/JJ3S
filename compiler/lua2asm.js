"use strict";

const parser = require("luaparse");
const compiler = require("./compiler");
const optimizer = require("./optimizer");

module.exports = (lua_user_code, debug = _ => 0) => {
	const rawTree = parser.parse(lua_user_code, {luaVersion: "5.3"});
	debug("<<<raw>>>");
	debug(JSON.stringify(rawTree, null, 2));
	
	const tree = optimizer.optimizeTree(rawTree);
	debug("<<<optiized>>>");
	debug(JSON.stringify(tree, null, 2));

	const rawCode = compiler.compile(tree);
	const code = optimizer.optimizeCode(rawCode);
	debug(`optimized! ${rawCode.length} -> ${code.length}`);

	return code.map(e => /,/.test(e) ? e : `\t${e}`).join("\n");
};
