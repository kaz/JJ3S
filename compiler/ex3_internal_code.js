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

R_T0,  HEX 0
R_T1,  HEX 0
R_T2,  HEX 0
R_T3,  HEX 0
R_T4,  HEX 0
R_T5,  HEX 0

R_ESP, SYM STACK

`;
