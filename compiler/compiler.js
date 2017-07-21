"use strict";

const ex3_internal_code = require("./ex3_internal_code");

const compile = abs_syn_tree => {
	const asm_main = [];
	const asm_sub = [];

	let gCnt = 0;

	const env_vars = {};
	const env_stack = ["VAR_GLOBAL"];
	const current_env = _ => env_stack[env_stack.length-1];
	const exit_env = _ => env_stack.pop();
	const enter_env = _ => env_stack.push("VAR_E"+(gCnt++));
	const find_var = name => {
		const label = env_stack.map(e => e+"_"+name).filter(e => e in env_vars).pop();
		return label || assign_var(name, false);
	};
	const assign_var = (name, local) => {
		const label = (local ? current_env() : env_stack[0])+"_"+name;
		return env_vars[label] = label;
	};
	const gen_label = (num, prefix = "L_SYS_") => "A".repeat(num).split("").map(e => prefix+(gCnt++));

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
			ast.arguments.forEach(e => code_gen(e, t));
			t.push("BSA F_"+base+"_"+name);
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
		}
		else if(ast.type == "IfStatement"){
			const le = gen_label(1);
			
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
			[].concat(ast.variables).reverse().forEach(v => {
				t.push("BSA F_POP");
				t.push("STA "+assign_var(v.name, ast.type == "LocalStatement"));
			});
		}
		else if(ast.type == "TableConstructorExpression"){
			const [l,g] = gen_label(2, "TABLE_");
			asm_sub.push(l+",");
			ast.fields.forEach((item, key) => {
				asm_sub.push("DEC "+item.value.value);
			});
			t.push(g+",");
			t.push("SYM "+l);
			t.push("LDA "+g);
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
		else if(ast.type == "BinaryExpression" || ast.type == "LogicalExpression"){
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
			else if(ast.operator == "/" || ast.operator == "//" || ast.operator == "%"){
				t.push("LDA "+const_value(ast.operator == "%" ? 1 : 0));
				t.push("BSA F_PUSH");
				t.push("BSA F_DIVMOD");
				t.push("BSA F_POP");
			}
			else if(ast.operator == "&"){
				t.push("BSA F_POP");
				t.push("STA R_T1");
				t.push("BSA F_POP");
				t.push("AND R_T1");
			}
			else if(ast.operator == ">>" || ast.operator == "<<"){
				t.push("BSA F_POP");
				t.push("STA R_T1");
				t.push("BSA F_POP");
				t.push("STA R_T2");
				
				const [l] = gen_label(1);
				t.push(l+",");
				t.push("LDA R_T2");
				t.push("CLE");
				t.push(ast.operator == ">>" ? "CIR" : "CIL");
				t.push("STA R_T2");
				t.push("LDA R_T1");
				t.push("ADD "+const_value(-1));
				t.push("STA R_T1");
				t.push("SZA");
				t.push("BUN "+l);
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
			else if(ast.operator == "and"){
				t.push("BSA F_POP");
				t.push("STA R_T1");
				t.push("BSA F_POP");
				t.push("SZA");
				t.push("LDA R_T1");
			}
			else if(ast.operator == "or"){
				const [l] = gen_label(1);
				t.push("BSA F_POP");
				t.push("STA R_T1");
				t.push("BSA F_POP");
				t.push("SZA");
				t.push("BUN "+l);
				t.push("LDA R_T1");
				t.push(l+",")
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

	Object.keys(env_vars).forEach(l => asm_sub.push(l+",\tHEX 0"))

	ex3_internal_code.split("\n")
	.map(e => e.trim().replace(/\((-?\d+)\)/, (v, i) => const_value(parseInt(i))))
	.filter(e => e)
	.forEach(e => asm_sub.push(e));
	
	Object.keys(cvals).forEach(l => asm_sub.push(l+",\t"+cvals[l]));

	asm_sub.push("STACK,\tEND");

	return asm_main.concat(asm_sub);
};

module.exports = {compile};
