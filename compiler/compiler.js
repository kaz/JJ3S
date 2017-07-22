"use strict";

const ex3_internal_code = require("./ex3_internal_code");

const compile = abs_syn_tree => {
	const asm_main = [];
	const asm_sub = [];

	let gCnt = 0;

	const env_vars = {};
	const env_stack = ["VAR_GLOB"];
	const current_env = _ => env_stack[env_stack.length-1];
	const exit_env = _ => env_stack.pop();
	const enter_env = _ => env_stack.push("VAR_ENV"+(gCnt++));
	
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
	
	const gen_label = (num, prefix = "L_SYS_") => "A".repeat(num).split("").map(e => prefix+(gCnt++));
	
	const loop_stack = [];
	const enter_loop = label => loop_stack.push(label);
	const break_loop = _ => loop_stack[loop_stack.length-1];
	const exit_loop = _ => loop_stack.pop();

	const cvals = {};
	const const_value = v => {
		const label = (v<0 ? "C_VAL_M_" : "C_VAL_P_")+Math.abs(v);
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
			const [ls,lc,le] = gen_label(3);
			
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
			const [lc,le] = gen_label(2);
			
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
			const [ls,le] = gen_label(2);
			
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
			const [le] = gen_label(1);
			
			ast.clauses.forEach(ast => {
				const [lc,ln] = gen_label(2);
				
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
			asm_sub.push(l+",\tHEX 0");
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
					code_gen(va.index, t);
					t.push("BSA F_POP");
					t.push("ADD "+find_var(va.base.name));
					t.push("STA R_T1");
					t.push("BSA F_POP");
					t.push("STA R_T1 I");
				}
				else {
					throw new Error("Unknown variable type: "+va.type);
				}
			});
		}
		else if(ast.type == "TableConstructorExpression"){
			const [l] = gen_label(1, "TABLE_");
			
			asm_sub.push(l+"_PTR,");
			asm_sub.push("SYM "+l);
			asm_sub.push("DEC "+ast.fields.length);
			asm_sub.push(l+",");
			ast.fields.forEach(item => asm_sub.push("DEC "+item.value.value));
			
			t.push("LDA "+l+"_PTR");
			t.push("BSA F_PUSH");
		}
		else if(ast.type == "IndexExpression"){
			code_gen(ast.index, t);
			t.push("BSA F_POP");
			t.push("ADD "+find_var(ast.base.name));
			t.push("STA R_T1");
			t.push("LDA R_T1 I");
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
			
			const [lc,le] = gen_label(2);
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
			
			if(ast.operator == "+" || ast.operator == "|"){
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
				
				const [ls,lc,le] = gen_label(3);
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
			else if(ast.operator == "~"){
				t.push("BSA F_POP");
				t.push("STA R_T2");
				t.push("BSA F_POP");
				t.push("STA R_T1");
				t.push("CMA");
				t.push("AND R_T2");
				t.push("STA R_T3");
				t.push("LDA R_T2");
				t.push("CMA");
				t.push("AND R_T1");
				t.push("ADD R_T3");
			}
			else if(ast.operator == ">>" || ast.operator == "<<"){
				t.push("BSA F_POP");
				t.push("STA R_T1");
				t.push("BSA F_POP");
				t.push("STA R_T2");
				
				const [ls,lc,le] = gen_label(3);
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
				
				const [l1,l2,l3] = gen_label(3);
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
				
				const [l1,l2,l3] = gen_label(3);
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
				
				const [l1,l2,l3] = gen_label(3);
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
				
				const [l1,l2,l3,l4] = gen_label(4);
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
				
				const [l1,l2,l3] = gen_label(3);
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
				
				const [l1,l2,l3,l4] = gen_label(4);
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
				const [l,le] = gen_label(2);
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
		else {
			throw new Error("Unknown type: "+ast.type);
		}
	};

	code_gen(abs_syn_tree, asm_main);
	asm_main.unshift("ORG 10");
	asm_main.push("HLT");

	Object.keys(env_vars).forEach(l => asm_sub.push(l+",\tDEC 0"))

	ex3_internal_code.split("\n")
	.map(e => e.trim().replace(/\((-?\d+)\)/, (v, i) => const_value(parseInt(i))))
	.filter(e => e)
	.forEach(e => asm_sub.push(e));
	
	Object.keys(cvals).forEach(l => asm_sub.push(l+",\t"+cvals[l]));

	asm_sub.push("STACK,\tEND");

	return asm_main.concat(asm_sub);
};

module.exports = {compile};
