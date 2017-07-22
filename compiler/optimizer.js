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

// 演算子適用時のループを削減
const delete_operator_loop = tree => {
	const walk_tree = t => {
		if(typeof t != "object"){
			return t;
		}
		if((t.operator == "^" || t.operator == "<<" || t.operator == ">>") && t.right.type == "NumericLiteral"){
			t.opt_loop = t.right.value;
		}
		for(let k in t){
			t[k] = walk_tree(t[k]);
		}
		return t;
	};
	return walk_tree(tree);
};

const optimizeTree = tree => {
	tree = constant_folding(tree);
	tree = delete_operator_loop(tree);
	return tree;
};

const optimizeCode = code => {
	// 無駄なPUSH/POPを削除
	const opt_del_push_pop = (t, i) => {
		if(t[i] == "BSA F_PUSH" && t[i+1] == "BSA F_POP" || t[i] == "BSA F_POP" && t[i+1] == "BSA F_PUSH"){
			t[i] = t[i+1] = null;
		}
	};
	
	// 無駄なLDA/STAを削除
	const opt_del_lda_sta = (t, i) => {
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
	
	// 自己代入を最適化
	const opt_self_assign = (t, i) => {
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
	const opt_replace_inst = (t, i) => {
		if(t[i] == "LDA C_VAL_P_0"){
			t[i] = "CLA";
		}
		else if(t[i] == "ADD C_VAL_P_1"){
			t[i] = "INC";
		}
	};
	
	// スタックの代わりにレジスタを利用
	const opt_pseudo_stack = (t, i) => {
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
				const reg = [0,1,2,3,4,5,6,7,8,9].filter(r => !used_reg.some(u => u == r)).shift();
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
	
	// 最大まで最適化
	const opt = orig => {
		let t = [].concat(orig);
		t.forEach((_, i) => {
			opt_del_push_pop(t, i);
			opt_del_lda_sta(t, i);
			opt_self_assign(t, i);
			opt_replace_inst(t, i);
			opt_pseudo_stack(t, i);
		});
		t = t.filter(e => e);
		return t.some((v, i) => orig[i] != v) ? opt(t) : t;
	};
	
	return opt(code);
};

module.exports = {optimizeTree, optimizeCode};
