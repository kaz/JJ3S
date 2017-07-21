"use strict";

const parser = require("luaparse");
const compiler = require("./compiler");
const optimizer = require("./optimizer");

module.exports = lua_user_code => {
	//console.error = _ => 1;
	
	const rawTree = parser.parse(lua_user_code, {luaVersion: "5.3"});
	console.error("<<<raw>>>");
	console.error(JSON.stringify(rawTree, null, 2));
	
	const tree = optimizer.optimizeTree(rawTree);
	console.error("<<<optiized>>>");
	console.error(JSON.stringify(tree, null, 2));

	const rawCode = compiler.compile(tree);
	const code = optimizer.optimizeCode(rawCode);
	console.error(`optimized! ${rawCode.length} -> ${code.length}`);

	return code.map(e => /,/.test(e) ? e : `\t${e}`).join("\n");
};
