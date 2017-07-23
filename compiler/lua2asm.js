"use strict";

const parser = require("luaparse");
const compiler = require("./compiler");
const optimizer = require("./optimizer");

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
