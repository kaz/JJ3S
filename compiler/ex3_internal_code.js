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

F_DIVMOD,
	HEX 0
	BSA F_POP
	STA R_T1
	BSA F_POP
	STA D
	BSA F_POP
	STA S
	CLA
	STA SH
	LDA BX
	STA B
Loop,
	LDA B
	INC
	STA B
	SZA
	BUN Act
	BUN End
Act,
	LDA Q
	CLE
	CIL
	STA Q
	BSA CIL_N
	BSA N_SUB_D
	SZE
	BUN Plus
Minus,
	BSA N_ADD_D
	BUN Loop
Plus,
	LDA Q
	INC
	STA Q
	BUN Loop
End,
	LDA SH
	STA R
	LDA R_T1
	SZA
	BUN Ret_Remindrr
	LDA Q
	BUN Return
Ret_Remindrr,
	LDA R
Return,
	BSA F_PUSH
	BUN F_DIVMOD I
CIL_N,
	HEX 0
	CLE
	LDA S
	CIL
	STA S
	LDA SH
	CIL
	STA SH
	BUN CIL_N I
N_ADD_D,
	HEX 0
	LDA D
	ADD SH
	STA SH
	BUN N_ADD_D I
N_SUB_D,
	HEX 0
	LDA D
	CMA
	INC
	ADD SH
	STA SH
	BUN N_SUB_D I

S,	DEC 0
D,	DEC 0
SH, DEC 0
B,	HEX FFEF
BX,	HEX FFEF
Q,	DEC 0
R,	DEC 0

R_T1,  HEX 0
R_T2,  HEX 0
R_ESP, SYM STACK

`;
