"use strict";

const constantFolding = tree => {
	const scanTree = t => {
		if(!t){
			return null;
		}
		if(t.type == "NumericLiteral"){
			return t.value;
		}
		if(t.type == "UnaryExpression"){
			const a = scanTree(t.argument);
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
			const [l,r] = [scanTree(t.left), scanTree(t.right)];
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
			if(t.operator == "%"){
				return l%r;
			}
			if(t.operator == "&"){
				return l&r;
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
	const fixTree = t => {
		if(typeof t != "object"){
			return t;
		}
		for(let k in t){
			const v = scanTree(t[k]);
			t[k] = (v === null) ? fixTree(t[k]) : {
				"type": "NumericLiteral",
				"value": v,
				"raw": ""+v,
			};
		}
		return t;
	};
	return fixTree(tree);
};

const optimizeTree = tree => {
	// 定数の畳み込み
	tree = constantFolding(tree);
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
				if(cm[1] == "STA" && nm[1] == "LDA"){
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
	
	const opt = t => {
		t.forEach((_, i) => {
			opt_del_push_pop(t, i);
			opt_del_lda_sta(t, i);
			opt_self_assign(t, i);
		});
		return t.filter(e => e);
	};
	
	// 最大まで最適化
	let len;
	do {
		len = code.length;
		code = opt(code);
	}while(len - code.length);
	
	return code;
};

module.exports = {optimizeTree, optimizeCode};
