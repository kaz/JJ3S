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
	
	const walk_tree_prop_const = t => {
		if(t && typeof t == "object"){
			if(t.type == "Identifier" && constants.some(e => e == t.name)){
				t = assign[t.name][0];
			}
			for(let k in t){
				if((t.type == "AssignmentStatement" || t.type == "LocalStatement") && k == "variables"){
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
		if(nm){
			if(cm[1] == "LDA" && nm[1] == "STA"){
				t[i] = t[i+1] = null;
			}
			else if(cm[1] == "STA" && nm[1] == "LDA"){
				t[i+1] = null;
			}
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
	tree = constant_folding(tree);
	tree = constant_propagation(tree);
	tree = unroll_op_loop(tree);
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
