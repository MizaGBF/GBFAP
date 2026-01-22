// variable to fix some specific enemies (enemy_4100663, enemy_4100753, enemy_4100933, enemy_4101033)
var attack_num = 0;
// variable to fix a skill for SR Richard (3030267000)
var highlow_result = 0;
// see view/raid/constant.js in GBF code for those exceptions above

// enum to pass to the player on creation
const PlayerLayoutMode = Object.freeze({
	normal: 0, // regular player
	enemy: 1, // enemy mode
	mypage: 2 // my page mode
});

// the animation player
class Player
{
	// constants
	static c_canvas_size = Object.freeze(900); // canvas size, width and height
	static c_gbf_animation_width = Object.freeze(640); // GBF animation width
	static c_enemy_shift = Object.freeze({ // constant to shift enemies around
		x:71,
		y:117
	});
	// enum, z_index shorthand
	static c_zindex = Object.freeze({
		BOTTOM: 0,
		MIDDLE: 1,
		TOP: 2
	});
	
	// constant associated with in-game motion names.
	// the list is non exhaustive.
	static c_animations = Object.freeze({
		// special ones added for the player innerworkings
		// for summon
		SUMMON_ATTACK:{name:"Summon Call",key:"summon_atk"}, 
		SUMMON_DAMAGE:{name:"Summon Damage",key:"summon_dmg"},
		// for boss appear animations
		RAID_APPEAR_0:{name:"Appear",key:"raid_appear_0"},
		RAID_APPEAR_1:{name:"Appear A",key:"raid_appear_1"},
		RAID_APPEAR_2:{name:"Appear B",key:"raid_appear_2"},
		RAID_APPEAR_3:{name:"Appear C",key:"raid_appear_3"},
		RAID_APPEAR_4:{name:"Appear D",key:"raid_appear_4"},
		RAID_APPEAR_5:{name:"Appear E",key:"raid_appear_5"},
		RAID_APPEAR_6:{name:"Appear F",key:"raid_appear_6"},
		RAID_APPEAR_7:{name:"Appear G",key:"raid_appear_7"},
		RAID_APPEAR_8:{name:"Appear H",key:"raid_appear_8"},
		RAID_APPEAR_9:{name:"Appear I",key:"raid_appear_9"},
		// GBF ones
		WAIT:{name:"Idle",key:"wait"},
		WAIT_2:{name:"Idle 2 (OD)",key:"wait_2"},
		WAIT2:{name:"Idle 2' (OD)",key:"wait2"},
		WAIT_3:{name:"Idle 3 (Break)",key:"wait_3"},
		WAIT_3_SETIN:{name:"Idle 3 (Phase)",key:"wait_3_setin"}, // fruit mountain
		WAIT_C:{name:"Idle C",key:"wait_C"},
		WAIT_2_C:{name:"Idle 2 C",key:"wait_2_C"},
		WAIT_2_C_BACK:{name:"Idle 2 C (Back)",key:"wait_2_c_back"},
		WAIT_2_C_FRONT:{name:"Idle 2 C (Front)",key:"wait_2_c_front"},
		WAIT_3_C:{name:"Idle 3 C",key:"wait_3_C"},
		TO_STB_WAIT:{name:"Weapon Drew",key:"setup"},
		STB_WAIT:{name:"Wpn. Drew (Idle)",key:"stbwait"},
		STB_WAIT_O:{name:"Wpn. Drew (Orchis)",key:"stbwait_o"}, // BK & Orchis
		STB_WAIT_ADV:{name:"Wpn. Drew (Idle)(Adv)",key:"stbwait_adv"},
		CHARA_SELECT:{name:"Selection",key:"chara_select"},
		CHARA_IN:{name:"Fade In",key:"chara_in"},
		CHARA_OUT:{name:"Fade Out",key:"chara_out"},
		CHARGE:{name:"Charger",key:"charge"},
		COUNTER:{name:"Counter",key:"counter"},
		ABILITY:{name:"C.A Charged",key:"ability"},
		ABILITY_WAIT:{name:"Skill (Wait)",key:"ability_wait"},
		MORTAL:{name:"Charge Attack",key:"mortal"},
		MORTAL_A:{name:"Charge Attack A",key:"mortal_A"},
		MORTAL_A_EF:{name:"C.A. A (Effect)",key:"mortal_A_ef"},
		MORTAL_A_FRONT:{name:"C.A. A (Front)",key:"mortal_A_front"},
		MORTAL_A_FRONT_EF:{name:"C.A. A (Front)(Effect)",key:"mortal_A_front_ef"},
		MORTAL_A_BACK:{name:"C.A. A (Back)",key:"mortal_A_back"},
		MORTAL_A_BACK_EF:{name:"C.A. A (Back)(Effect)",key:"mortal_A_back_ef"},
		MORTAL_A_SKIP:{name:"C.A. A (Skip)",key:"mortal_A_skip"},
		MORTAL_A_1:{name:"Charge Attack A1",key:"mortal_A_1"},
		MORTAL_A_2:{name:"Charge Attack A2",key:"mortal_A_2"},
		MORTAL_A_B:{name:"Charge Attack AB",key:"mortal_A_B"},
		MORTAL_A_C:{name:"Charge Attack AC",key:"mortal_A_C"},
		MORTAL_B:{name:"Charge Attack B",key:"mortal_B"},
		MORTAL_B_EF:{name:"C.A. B (Effect)",key:"mortal_B_ef"},
		MORTAL_B_FRONT:{name:"C.A. B (Front)",key:"mortal_B_front"},
		MORTAL_B_FRONT_EF:{name:"C.A. B (Front)(Effect)",key:"mortal_B_front_ef"},
		MORTAL_B_BACK:{name:"C.A. B (Back)",key:"mortal_B_back"},
		MORTAL_B_BACK_EF:{name:"C.A. B (Back)(Effect)",key:"mortal_B_back_ef"},
		MORTAL_B_SKIP:{name:"C.A. B (Skip)",key:"mortal_B_skip"},
		MORTAL_B_1:{name:"Charge Attack B1",key:"mortal_B_1"},
		MORTAL_B_2:{name:"Charge Attack B2",key:"mortal_B_2"},
		MORTAL_B_B:{name:"Charge Attack BB",key:"mortal_B_B"},
		MORTAL_B_C:{name:"Charge Attack BC",key:"mortal_B_C"},
		MORTAL_C:{name:"Charge Attack C",key:"mortal_C"},
		MORTAL_C_EF:{name:"C.A. C (Effect)",key:"mortal_C_ef"},
		MORTAL_C_FRONT:{name:"C.A. C (Front)",key:"mortal_C_front"},
		MORTAL_C_FRONT_EF:{name:"C.A. C (Front)(Effect)",key:"mortal_C_front_ef"},
		MORTAL_C_CACK:{name:"C.A. C (Cack)",key:"mortal_C_back"},
		MORTAL_C_CACK_EF:{name:"C.A. C (Cack)(Effect)",key:"mortal_C_back_ef"},
		MORTAL_C_SKIP:{name:"C.A. C (Skip)",key:"mortal_C_skip"},
		MORTAL_C_1:{name:"Charge Attack C1",key:"mortal_C_1"},
		MORTAL_C_2:{name:"Charge Attack C2",key:"mortal_C_2"},
		MORTAL_C_B:{name:"Charge Attack CB",key:"mortal_C_B"},
		MORTAL_C_C:{name:"Charge Attack CC",key:"mortal_C_C"},
		MORTAL_D:{name:"Charge Attack D",key:"mortal_D"},
		MORTAL_D_EF:{name:"C.A. D (Effect)",key:"mortal_D_ef"},
		MORTAL_D_FRONT:{name:"C.A. D (Front)",key:"mortal_D_front"},
		MORTAL_D_FRONT_EF:{name:"C.A. D (Front)(Effect)",key:"mortal_D_front_ef"},
		MORTAL_D_DACK:{name:"C.A. D (Dack)",key:"mortal_D_back"},
		MORTAL_D_DACK_EF:{name:"C.A. D (Dack)(Effect)",key:"mortal_D_back_ef"},
		MORTAL_D_SKIP:{name:"C.A. D (Skip)",key:"mortal_D_skip"},
		MORTAL_D_1:{name:"Charge Attack D1",key:"mortal_D_1"},
		MORTAL_D_2:{name:"Charge Attack D2",key:"mortal_D_2"},
		MORTAL_E:{name:"Charge Attack E",key:"mortal_E"},
		MORTAL_E_1:{name:"Charge Attack E1",key:"mortal_E_1"},
		MORTAL_E_2:{name:"Charge Attack E2",key:"mortal_E_2"},
		MORTAL_F:{name:"Charge Attack F",key:"mortal_F"},
		MORTAL_F_1:{name:"Charge Attack F1",key:"mortal_F_1"},
		MORTAL_F_2:{name:"Charge Attack F2",key:"mortal_F_2"},
		MORTAL_G:{name:"Charge Attack G",key:"mortal_G"},
		MORTAL_G_1:{name:"Charge Attack G1",key:"mortal_G_1"},
		MORTAL_G_2:{name:"Charge Attack G2",key:"mortal_G_2"},
		MORTAL_H:{name:"Charge Attack H",key:"mortal_H"},
		MORTAL_H_1:{name:"Charge Attack H1",key:"mortal_H_1"},
		MORTAL_H_2:{name:"Charge Attack H2",key:"mortal_H_2"},
		MORTAL_I:{name:"Charge Attack I",key:"mortal_I"},
		MORTAL_I_1:{name:"Charge Attack I1",key:"mortal_I_1"},
		MORTAL_I_2:{name:"Charge Attack I2",key:"mortal_I_2"},
		MORTAL_J:{name:"Charge Attack J",key:"mortal_J"},
		MORTAL_J_1:{name:"Charge Attack J1",key:"mortal_J_1"},
		MORTAL_J_2:{name:"Charge Attack J2",key:"mortal_J_2"},
		MORTAL_K:{name:"Charge Attack K",key:"mortal_K"},
		MORTAL_K_1:{name:"Charge Attack K1",key:"mortal_K_1"},
		MORTAL_K_2:{name:"Charge Attack K2",key:"mortal_K_2"},
		MORTAL_SP:{name:"Charge Ultimate",key:"mortal_SP"},
		ATTACK:{name:"Attack",key:"attack"},
		ATTACK_EWIYAR:{name:"Attack (Ewiyar)",key:"attack_Ewiyar"},
		ATTACK_SHORT:{name:"Attack 1",key:"short_attack"},
		ATTACK_SHORT_ADV:{name:"Attack 1 (Adv)",key:"short_attack_adv"},
		ATTACK_DOUBLE:{name:"Attack 2",key:"double"},
		ATTACK_TRIPLE:{name:"Attack 3",key:"triple"},
		ATTACK_QUADRUPLE:{name:"Attack 4",key:"quadruple"},
		SPECIAL_ATTACK:{name:"Attack B (Alt/OD)",key:"attack_2"},
		ENEMY_ATTACK:{name:"Attack C (Break)",key:"attack_3"},
		CHANGE:{name:"Change Form",key:"change"},
		CHANGE_TO:{name:"Change Form 1",key:"change_1"},
		CHANGE_FROM:{name:"Change Form 2",key:"change_2"},
		CHANGE_TO_2:{name:"Change Form 3",key:"change_1_2"},
		CHANGE_FROM_2:{name:"Change Form 4",key:"change_2_2"},
		CHANGE_FULL:{name:"Change Form (Full)",key:"change_full"},
		DEAD:{name:"Dead",key:"dead"},
		DEAD_2:{name:"Dead 2",key:"dead_2"},
		DODGE:{name:"Dodge",key:"dodge"},
		DODGE_2:{name:"Dodge 2",key:"dodge_2"},
		DODGE_3:{name:"Dodge 3",key:"dodge_3"},
		ESCAPE:{name:"Escape",key:"escape"},
		DAMAGE:{name:"Damaged",key:"damage"},
		DAMAGE_1:{name:"Damaged A",key:"damage_1"},
		DAMAGE_2:{name:"Damaged B (OD)",key:"damage_2"},
		DAMAGE_2_B:{name:"Damaged B B",key:"damage_2_B"},
		DAMAGE_3:{name:"Damaged C (Break)",key:"damage_3"},
		DAMAGE_3_B:{name:"Damaged C B",key:"damage_3_B"},
		DAMAGE_3_C:{name:"Damaged C C",key:"damage_3_C"},
		DAMAGE_4:{name:"Damaged D",key:"damage_4"},
		DAMAGE_5:{name:"Damaged E",key:"damage_5"},
		WIN:{name:"Win",key:"win"},
		WIN1:{name:"Win 1",key:"win1"},
		WIN2:{name:"Win 2",key:"win2"},
		WIN01:{name:"Win 01",key:"win01"},
		WIN02:{name:"Win 02",key:"win02"},
		WIN_1:{name:"Win Alt. 1",key:"win_1"},
		WIN_2:{name:"Win Alt. 2",key:"win_2"},
		WIN_3:{name:"Win Alt. 3",key:"win_3"},
		WIN_4:{name:"Win Alt. 4",key:"win_4"},
		WIN_A:{name:"Win Alt. A",key:"win_A"},
		WIN_B:{name:"Win Alt. B",key:"win_B"},
		WIN_C:{name:"Win Alt. C",key:"win_C"},
		WIN_D:{name:"Win Alt. D",key:"win_D"},
		WIN_E:{name:"Win Alt. E",key:"win_E"},
		WIN_F:{name:"Win Alt. F",key:"win_F"},
		INVISIBLE:{name:"Invisible",key:"invisible"},
		HIDE:{name:"Hide",key:"hide"},
		DOWN:{name:"Low HP",key:"down"},
		DOWN_2_MOTION:{name:"Low HP 2 (motion)",key:"down2_motion"},
		WAIT_SPECIAL:{name:"Idle (Spe)",key:"pf"},
		WAIT_SPECIAL_1:{name:"Idle (Spe) A",key:"pf_1"},
		WAIT_SPECIAL_2:{name:"Idle (Spe) B",key:"pf_2"},
		WAIT_SPECIAL_3:{name:"Idle (Spe) C",key:"pf_3"},
		WAIT_SPECIAL_4:{name:"Idle (Spe) D",key:"pf_4"},
		WAIT_SPECIAL_5:{name:"Idle (Spe) E",key:"pf_5"},
		WAIT_NO_CHANGE:{name:"Idle (No Change)",key:"pf_no_change_with_damage"}, // rei ayanami
		MISS:{name:"Miss",key:"miss"},
		SUMMON:{name:"Summoning",key:"summon"},
		ABILITY_MOTION_OLD:{name:"Miss (Old)",key:"attack_noeffect"},
		ABILITY_MOTION:{name:"Skill A",key:"ab_motion"},
		ABILITY_MOTION_2:{name:"Skill B",key:"ab_motion_2"},
		ABILITY_MOTION_3:{name:"Skill C",key:"ab_motion_3"},
		ABILITY_MOTION_4:{name:"Skill D",key:"ab_motion_4"},
		ABILITY_MOTION_5:{name:"Skill E",key:"ab_motion_5"},
		VS_MOTION_1:{name:"Custom Skill A",key:"vs_motion_1"},
		VS_MOTION_2:{name:"Custom Skill B",key:"vs_motion_2"},
		VS_MOTION_3:{name:"Custom Skill C",key:"vs_motion_3"},
		VS_MOTION_4:{name:"Custom Skill D",key:"vs_motion_4"},
		VS_MOTION_5:{name:"Custom Skill E",key:"vs_motion_5"},
		VS_MOTION_6:{name:"Custom Skill F",key:"vs_motion_6"},
		ENEMY_PHASE_1:{name:"Phase 1 (Entry)",key:"setin"},
		ENEMY_PHASE_2:{name:"Phase 2 (OD)",key:"setin_2"},
		ENEMY_PHASE2:{name:"Phase 2' (OD)",key:"setin2"},
		ENEMY_PHASE_3:{name:"Phase 3 (Break)",key:"setin_3"},
		ENEMY_PHASE3:{name:"Phase 3' (Break)",key:"setin3"},
		ENEMY_PHASE_3_B:{name:"Phase 3B (Break)",key:"setin_3_B"},
		ENEMY_PHASE_4:{name:"Phase 4",key:"setin_4"},
		ENEMY_PHASE_4A:{name:"Phase 4 (Alt)",key:"setin_4a"},
		ENEMY_PHASE_5:{name:"Phase 5",key:"setin_5"},
		ENEMY_PHASE_A:{name:"Phase A",key:"setin_A"},
		ENEMY_PHASE_B:{name:"Phase B",key:"setin_B"},
		ENEMY_PHASE_EWIYAR:{name:"Phase Ewiyar",key:"setin_Ewiyar"},
		ENEMY_PHASE_OTHER:{name:"Phase (Other)",key:"setin_other"},
		ENEMY_FORM_CHANGE:{name:"Form Change",key:"form_change"},
		ENEMY_STANDBY_A:{name:"Standby A",key:"standby_A"},
		ENEMY_STANDBY_A_EWIYAR:{name:"Standby A (Ewiyar)",key:"standby_A_Ewiyar"},
		ENEMY_STANDBY_B:{name:"Standby B",key:"standby_B"},
		ENEMY_STANDBY_C:{name:"Standby C",key:"standby_C"},
		ENEMY_STANDBY_C_UNDER:{name:"Standby C (Under)",key:"standby_C_under"},
		ENEMY_STANDBY_D:{name:"Standby D",key:"standby_D"},
		ENEMY_STANDBY_E:{name:"Standby E",key:"standby_E"},
		ENEMY_STANDBY_F:{name:"Standby F",key:"standby_F"},
		ENEMY_STANDBY_G:{name:"Standby G",key:"standby_G"},
		ENEMY_STANDBY_H:{name:"Standby H",key:"standby_H"},
		ENEMY_STANDBY_I:{name:"Standby I",key:"standby_I"},
		ENEMY_BREAK_STANDBY_A:{name:"Standby A (Break)",key:"break_standby_A"},
		ENEMY_BREAK_STANDBY_B:{name:"Standby B (Break)",key:"break_standby_B"},
		ENEMY_BREAK_STANDBY_C:{name:"Standby C (Break)",key:"break_standby_C"},
		ENEMY_BREAK_STANDBY_D:{name:"Standby D (Break)",key:"break_standby_D"},
		ENEMY_BREAK_STANDBY_E:{name:"Standby E (Break)",key:"break_standby_E"},
		ENEMY_BREAK_STANDBY_F:{name:"Standby F (Break)",key:"break_standby_F"},
		ENEMY_BREAK_STANDBY_G:{name:"Standby G (Break)",key:"break_standby_G"},
		ENEMY_BREAK_STANDBY_H:{name:"Standby H (Break)",key:"break_standby_H"},
		ENEMY_BREAK_STANDBY_I:{name:"Standby I (Break)",key:"break_standby_I"},
		ENEMY_DAMAGE_STANDBY_A:{name:"Standby A (Dmgd)",key:"damage_standby_A"},
		ENEMY_DAMAGE_STANDBY_B:{name:"Standby B (Dmgd)",key:"damage_standby_B"},
		ENEMY_DAMAGE_STANDBY_C:{name:"Standby C (Dmgd)",key:"damage_standby_C"},
		ENEMY_DAMAGE_STANDBY_D:{name:"Standby D (Dmgd)",key:"damage_standby_D"},
		ENEMY_DAMAGE_STANDBY_E:{name:"Standby E (Dmgd)",key:"damage_standby_E"},
		ENEMY_DAMAGE_STANDBY_F:{name:"Standby F (Dmgd)",key:"damage_standby_F"},
		ENEMY_DAMAGE_STANDBY_G:{name:"Standby G (Dmgd)",key:"damage_standby_G"},
		ENEMY_DAMAGE_STANDBY_H:{name:"Standby H (Dmgd)",key:"damage_standby_H"},
		ENEMY_DAMAGE_STANDBY_I:{name:"Standby I (Dmgd)",key:"damage_standby_I"},
		// the world ozma form
		ATTACK_BACK:{name:"Attack (Back)",key:"attack_back"},
		// hiro ryugasaki
		CARD_STBWAIT:{name:"Wpn. Drew (Card)",key:"card_stbwait"},
		DRAGON_STBWAIT:{name:"Wpn. Drew (Dragon)",key:"dragon_stbwait"},
		// lucilius/wing, neptune/leverrier, other pets...
		LINK_PHASE_1:{name:"Phase 1 (Entry)(Lk)",key:"setin_link"},
		LINK_PHASE_1_2:{name:"Phase 1B (Entry)(Lk)",key:"setin_link_2"},
		LINK_PHASE_1_F2:{name:"Phase 1C (Entry)(Lk)",key:"setin_link_f2"},
		LINK_PHASE_1_F2_2:{name:"Phase 1D (Entry)(Lk)",key:"setin_link_f2_2"},
		LINK_PHASE_2:{name:"Phase 2 (OD)(Lk)",key:"setin_2_link"},
		LINK_PHASE_2_2:{name:"Phase 2B (OD)(Lk)",key:"setin_2_link_2"},
		LINK_PHASE_2_F2:{name:"Phase 2C (OD)(Lk)",key:"setin_2_link_f2"},
		LINK_PHASE_2_F2_2:{name:"Phase 2D (OD)(Lk)",key:"setin_2_link_f2_2"},
		LINK_PHASE_3:{name:"Phase 3 (Break)(Lk)",key:"setin_3_link"},
		LINK_PHASE_3_2:{name:"Phase 3B (Break)(Lk)",key:"setin_3_link_2"},
		LINK_PHASE_3_F2:{name:"Phase 3C (Break)(Lk)",key:"setin_3_link_f2"},
		LINK_PHASE_3_F2_2:{name:"Phase 3D (Break)(Lk)",key:"setin_3_link_f2_2"},
		LINK_PHASE_4:{name:"Phase 4 (Lk)",key:"setin_4_link"},
		LINK_PHASE_4_2:{name:"Phase 4B (Lk)",key:"setin_4_link_2"},
		LINK_PHASE_4_F2:{name:"Phase 4C (Lk)",key:"setin_4_link_f2"},
		LINK_PHASE_4_F2_2:{name:"Phase 4D (Lk)",key:"setin_4_link_f2_2"},
		LINK_PHASE_5:{name:"Phase 5 (Lk)",key:"setin_5_link"},
		LINK_PHASE_5_2:{name:"Phase 5B (Lk)",key:"setin_5_link_2"},
		LINK_PHASE_5_F2:{name:"Phase 5C (Lk)",key:"setin_5_link_f2"},
		LINK_PHASE_5_F2_2:{name:"Phase 5D (Lk)",key:"setin_5_link_f2_2"},
		LINK_DAMAGE:{name:"Damaged (Link)",key:"damage_link"},
		LINK_DAMAGE_2:{name:"Damaged 2 (Link)",key:"damage_link_2"},
		LINK_2_DAMAGE:{name:"Damaged B (Link)",key:"damage_2_link"},
		LINK_3_DAMAGE:{name:"Damaged C (Link)",key:"damage_3_link"},
		LINK_DOWN:{name:"Low HP (Link)",key:"down_link"},
		LINK_DEAD:{name:"Dead (Link)",key:"dead_link"},
		LINK_DEAD_1:{name:"Dead 1 (Link)",key:"dead_1_link"},
		LINK_DEAD_2:{name:"Dead 2 (Link)",key:"dead_2_link"},
		LINK_DEAD_3:{name:"Dead 3 (Link)",key:"dead_3_link"},
		LINK_DEAD_A:{name:"Dead 1B (Link)",key:"dead_link_1"},
		LINK_DEAD_B:{name:"Dead 2B (Link)",key:"dead_link_2"},
		LINK_DEAD_C:{name:"Dead 3B (Link)",key:"dead_link_3"},
		LINK_MORTAL_A:{name:"Charge Atk. A (Lk)",key:"mortal_A_link"},
		LINK_MORTAL_A_2:{name:"Charge Atk. A2 (Lk)",key:"mortal_A_link_2"},
		LINK_MORTAL_A_F2:{name:"Charge Atk. A3 (Lk)",key:"mortal_A_link_f2"},
		LINK_MORTAL_A_F2_2:{name:"Charge Atk. A4 (Lk)",key:"mortal_A_link_f2_2"},
		LINK_MORTAL_B:{name:"Charge Atk. B (Lk)",key:"mortal_B_link"},
		LINK_MORTAL_B_2:{name:"Charge Atk. B2 (Lk)",key:"mortal_B_link_2"},
		LINK_MORTAL_B_F2:{name:"Charge Atk. B3 (Lk)",key:"mortal_B_link_f2"},
		LINK_MORTAL_B_F2_2:{name:"Charge Atk. B4 (Lk)",key:"mortal_B_link_f2_2"},
		LINK_MORTAL_C:{name:"Charge Atk. C (Lk)",key:"mortal_C_link"},
		LINK_MORTAL_C_2:{name:"Charge Atk. C2 (Lk)",key:"mortal_C_link_2"},
		LINK_MORTAL_C_F2:{name:"Charge Atk. C3 (Lk)",key:"mortal_C_link_f2"},
		LINK_MORTAL_C_F2_2:{name:"Charge Atk. C4 (Lk)",key:"mortal_C_link_f2_2"},
		LINK_MORTAL_D:{name:"Charge Atk. D (Lk)",key:"mortal_D_link"},
		LINK_MORTAL_D_2:{name:"Charge Atk. D2 (Lk)",key:"mortal_D_link_2"},
		LINK_MORTAL_D_F2:{name:"Charge Atk. D3 (Lk)",key:"mortal_D_link_f2"},
		LINK_MORTAL_D_F2_2:{name:"Charge Atk. D4 (Lk)",key:"mortal_D_link_f2_2"},
		LINK_MORTAL_E:{name:"Charge Atk. E (Lk)",key:"mortal_E_link"},
		LINK_MORTAL_E_2:{name:"Charge Atk. E2 (Lk)",key:"mortal_E_link_2"},
		LINK_MORTAL_E_F2:{name:"Charge Atk. E3 (Lk)",key:"mortal_E_link_f2"},
		LINK_MORTAL_E_F2_2:{name:"Charge Atk. E4 (Lk)",key:"mortal_E_link_f2_2"},
		LINK_MORTAL_F:{name:"Charge Atk. F (Lk)",key:"mortal_F_link"},
		LINK_MORTAL_F_2:{name:"Charge Atk. F2 (Lk)",key:"mortal_F_link_2"},
		LINK_MORTAL_F_F2:{name:"Charge Atk. F3 (Lk)",key:"mortal_F_link_f2"},
		LINK_MORTAL_F_F2_2:{name:"Charge Atk. F4 (Lk)",key:"mortal_F_link_f2_2"},
		LINK_MORTAL_G:{name:"Charge Atk. G (Lk)",key:"mortal_G_link"},
		LINK_MORTAL_G_2:{name:"Charge Atk. G2 (Lk)",key:"mortal_G_link_2"},
		LINK_MORTAL_G_F2:{name:"Charge Atk. G3 (Lk)",key:"mortal_G_link_f2"},
		LINK_MORTAL_G_F2_2:{name:"Charge Atk. G4 (Lk)",key:"mortal_G_link_f2_2"},
		LINK_MORTAL_H:{name:"Charge Atk. H (Lk)",key:"mortal_H_link"},
		LINK_MORTAL_H_2:{name:"Charge Atk. H2 (Lk)",key:"mortal_H_link_2"},
		LINK_MORTAL_H_F2:{name:"Charge Atk. H3 (Lk)",key:"mortal_H_link_f2"},
		LINK_MORTAL_H_F2_2:{name:"Charge Atk. H4 (Lk)",key:"mortal_H_link_f2_2"},
		LINK_MORTAL_I:{name:"Charge Atk. I (Lk)",key:"mortal_I_link"},
		LINK_MORTAL_I_2:{name:"Charge Atk. I2 (Lk)",key:"mortal_I_link_2"},
		LINK_MORTAL_I_F2:{name:"Charge Atk. I3 (Lk)",key:"mortal_I_link_f2"},
		LINK_MORTAL_I_F2_2:{name:"Charge Atk. I4 (Lk)",key:"mortal_I_link_f2_2"},
		LINK_MORTAL_J:{name:"Charge Atk. J (Lk)",key:"mortal_J_link"},
		LINK_MORTAL_J_2:{name:"Charge Atk. J2 (Lk)",key:"mortal_J_link_2"},
		LINK_MORTAL_J_F2:{name:"Charge Atk. J3 (Lk)",key:"mortal_J_link_f2"},
		LINK_MORTAL_J_F2_2:{name:"Charge Atk. J4 (Lk)",key:"mortal_J_link_f2_2"},
		LINK_MORTAL_K:{name:"Charge Atk. K (Lk)",key:"mortal_K_link"},
		LINK_MORTAL_K_2:{name:"Charge Atk. K2 (Lk)",key:"mortal_K_link_2"},
		LINK_MORTAL_K_F2:{name:"Charge Atk. K3 (Lk)",key:"mortal_K_link_f2"},
		LINK_MORTAL_K_F2_2:{name:"Charge Atk. K4 (Lk)",key:"mortal_K_link_f2_2"},
		LINK_ATTACK:{name:"Attack (Link)",key:"attack_link"},
		LINK_ATTACK_2L:{name:"Attack B (Link)",key:"attack_2_link"},
		LINK_ATTACK_3L:{name:"Attack C (Link)",key:"attack_3_link"},
		LINK_ATTACK_2:{name:"Attack B (Link)",key:"attack_link_2"},
		LINK_ATTACK_F2:{name:"Attack C (Link)",key:"attack_link_f2"},
		LINK_ATTACK_F2_2:{name:"Attack D (Link)",key:"attack_link_f2_2"},
		LINK_FORM_CHANGE:{name:"Form Change (Link)",key:"form_change_link"},
		LINK_FORM_CHANGE_2:{name:"Form Change 2 (Link)",key:"form_change_link_2"},
		// sturm and drang
		DAMAGE_2_DRANG:{name:"Damaged B (Drang)",key:"damage_2_Drank"},
		WAIT_DRANG:{name:"Idle (Drang)",key:"wait_Drank"},
		WAIT_2_DRANG:{name:"Idle (Drang)(OD)",key:"wait_2_Drank"},
		WAIT_3_DRANG:{name:"Idle (Drang)(Break)",key:"wait_3_Drank"},
		// juana and ellis
		WAIT_ELLIS:{name:"Idle (Ellis)",key:"wait_eld"},
		WAIT_2_ELLIS:{name:"Idle (Ellis)(OD)",key:"wait_2_eld"},
		WAIT_3_ELLIS:{name:"Idle (Ellis)(Break)",key:"wait_3_eld"},
		// akasha
		AKASHA_EXB:{name:"EXB",key:"exb"},
		AKASHA_EXF:{name:"EXF",key:"exf"},
		// quetzalcoatl
		MOTION_EFFECT:{name:"Motion Effect",key:"mEF"},
		MOTION_EFFECT_BG:{name:"Motion Effect (BG)",key:"mEFBG"},
		// omni-magia witch
		WAIT_BG:{name:"Idle (Background)",key:"wait_BG"},
		WAIT_FAMILIAR:{name:"Idle (Familiar)",key:"wait_familiar"},
		// my page
		MY_PAGE:{name:"My Page",key:"mypage"},
	});
	static c_animation_name_table = Object.freeze(
		Object.entries(this.c_animations).reduce((acc, [id, v]) => {
		  acc[v.key] = id;
		  return acc;
		}, {})
	);
	// PlayerLayoutMode must be passed in parameter
	// it will affect the player behavior
	constructor(mode = PlayerLayoutMode.normal)
	{
		this.m_debug = {};
		this.m_allow_save = true;
		// the HTML ui is separated in another instance
		this.ui = new PlayerUI(this);
		this.init_attributes(mode);
	}
	
	init_attributes(mode)
	{
		this.m_debug.texture_count = 0;
		this.m_debug.element_count = 0;
		this.m_layout_mode = mode;
		// player size
		this.m_width = 0;
		this.m_height = 0;
		// player state
		this.m_paused = true;
		this.m_loading = true;
		// player callbacks
		this.m_tick_callback = null;
		this.m_animation_completed_callback = this.animation_completed.bind(this);
		// player settings
		this.m_speed = 1.0; // play speed
		this.m_audio_enabled = false; // audio mute state
		this.m_looping = true; // looping mode (false means we stay on the same animation)
		this.m_ability_target = false; // ability effect positioning flag
		this.m_ability_mode = 0; // ability effect play mode
		this.m_ability_index = 0; // current playing ability effect
		this.m_enemy_shift = false; // enemy positioning flag
		this.m_scaling = 1.0; // unmodifiable at runtime
		// various positions (initialized in another function)
		this.m_fullscreen_scale = 0.0; // scale fullscreen animations
		this.m_offset = {
			position: {
				x : 0.0,
				y : 0.0
			},
			target: {
				x : 0.0,
				y : 0.0
			},
			fullscreen: {
				x : 0.0,
				y : 0.0
			},
			special: {
				x : 0.0,
				y : 0.0
			},
			fullscreen_shift: {
				x : 0.0,
				y : 0.0
			}
		};
		// the createjs stage
		this.m_stage = null;
		// animations
		this.m_animations = []; // store the Animations data
		this.m_cjs = []; // store the instantied associated objects
		this.m_current_cjs = 0; // indicate which one is on screen right now
		this.m_motion_lists = []; // list of list of available motions for all animations
		this.m_weapon_textures = []; // list of weapon texture per version
		// motions
		this.m_current_motion_list = []; // the current play list of motions
		this.m_current_motion = 0; // the currently playing motion in the list
		
		// internal use
		this.m_main_tween = null; // main animation tween
		// recording storage
		this.m_recording = null;
		// texture swapping container
		this.m_texture_state = {};
		// sub tweens
		this.m_child_tweens = []; // contains the tweens
		this.m_tween_sources = []; // contains the source
		// the playing summon/ charge attack / special
		this.m_special_cjs = null;
		// custom playlist content
		this.m_playlist = [];
		// animation stack
		this.m_dispatch_stack = [];
		this.m_looping_index = null;
	}
	
	// create the stage and set the ticker framerate
	init_stage()
	{
		createjs.Ticker.framerate = 30 * this.m_speed;
		if(!this.ui.m_canvas)
			throw new Error("No canvas initialized");
		this.m_stage = new createjs.Stage(this.ui.m_canvas);
		this.loading_draw_text("Initialization...");
	}
	
	// reset the player to a near starting state
	restart(mode = PlayerLayoutMode.normal)
	{
		// pause the player
		this.pause();
		// remove listeners
		for(const cjs of this.m_cjs)
			cjs.removeEventListener("animationComplete", this.m_animation_completed_callback);
		if(this.m_tick_callback != null)
			createjs.Ticker.removeEventListener("tick", this.m_tick_callback);
		// clean createjs
		this.m_stage.removeAllEventListeners();
		this.m_stage.removeAllChildren();
		createjs.Tween.removeAllTweens();
		createjs.Ticker.removeEventListener("tick", this.m_stage);
		createjs.Ticker.reset();
		// reset everything
		this.init_attributes(mode);
		loader.reset();
		if(window.audio)
			window.audio.reset();
		this.ui.reset();
		
		// set speed
		this.m_speed = parseFloat(this.ui.m_speed.value) / 100.0;
		// restart the ticker
		createjs.Ticker.on("tick", createjs.Tween);
	}
	
	// return if the player is loading or busy recording
	is_busy()
	{
		return this.m_loading || (this.m_recording != null);
	}
	
	// return the player speed
	get_speed()
	{
		return this.m_speed;
	}
	
	// return if audio can be played
	is_audio_enabled()
	{
		return this.m_audio_enabled;
	}
	
	load_settings()
	{
		if((config.save_setting_key ?? null) != null && this.m_allow_save)
		{
			this.m_allow_save = false;
			let settings = localStorage.getItem(config.save_setting_key);
			if(settings != null)
			{
				let tmp = config.save_setting_key; // to disable saving
				config.save_setting_key = null
				try
				{
					settings = JSON.parse(settings);
					// volume
					this.ui.m_audio.value = settings.volume;
					this.ui.control_audio_update();
					// background
					if(this.m_layout_mode == PlayerLayoutMode.mypage)
					{
						if(settings.mypage_background)
						{
							this.ui.m_background.src = settings.mypage_background;
							this.ui.update_mypage_background_mask();
						}
						if(settings.mypage_uploaded_background)
						{
							this.ui.m_uploaded_background = settings.mypage_uploaded_background;
						}
					}
					else
					{
						if(settings.background)
						{
							this.ui.m_background.src = settings.background;
						}
						if(settings.uploaded_background)
						{
							this.ui.m_uploaded_background = settings.uploaded_background;
						}
					}
					this.ui.update_background_upload_button_visibility();
					// beep
					beep_enabled = settings.beep;
					this.ui.m_buttons.beep.classList.toggle("player-button-warning", !beep_enabled);
					// audio
					this.m_audio_enabled = settings.audio;
					this.ui.m_buttons.sound.classList.toggle("player-button-enabled", this.m_audio_enabled);
					// record
					this.ui.m_menus.record_bitrate.value = (settings.record_bitrate ?? "50");
					this.ui.m_menus.record_duration.value = (settings.record_duration ?? "10");
					this.ui.m_record_transparency = !(settings.record_transparency ?? false); // it will be toggled
					this.ui.record_bitrate_update();
					this.ui.record_duration_update();
					this.ui.record_transparency_toggle();
				} catch(err) {
					console.error("Failed to load localStorage settings with key " + config.save_setting_key, err);
				}
				// re-enable saving
				config.save_setting_key = tmp;
			}
			this.m_allow_save = true
		}
	}
	
	save_settings()
	{
		if((config.save_setting_key ?? null) != null && this.m_allow_save)
		{
			let past_settings = localStorage.getItem(config.save_setting_key);
			if(past_settings != null)
			{
				settings = JSON.parse(past_settings);
			}
			else
			{
				settings = {};
			}
			// volume
			settings.volume = this.ui.m_audio.value;
			// background
			if(this.m_layout_mode == PlayerLayoutMode.mypage)
			{
				settings.mypage_background = this.ui.m_background.src;
				settings.mypage_uploaded_background = this.ui.m_uploaded_background;
			}
			else
			{
				settings.background = this.ui.m_background.src;
				settings.uploaded_background = this.ui.m_uploaded_background;
			}
			// audio
			settings.beep = beep_enabled;
			settings.audio = this.m_audio_enabled;
			// record
			settings.record_bitrate = this.ui.m_menus.record_bitrate.value;
			settings.record_duration = this.ui.m_menus.record_duration.value;
			settings.record_transparency = this.ui.m_record_transparency;
			// set
			settings = JSON.stringify(settings);
			if(settings != past_settings)
				localStorage.setItem(config.save_setting_key, settings);
		}
	}
	
	// return an object containing the animation data and its associated animation
	get_current_animation_cjs()
	{
		if(this.m_current_cjs >= this.m_cjs.length)
			return null;
		return {
			animation:this.m_animations[this.m_current_cjs],
			cjs:this.m_cjs[this.m_current_cjs]
		};
	}
	
	// change the player size
	set_size(w, h, scaling = 1.0)
	{
		if(w > Player.c_canvas_size || h > Player.c_canvas_size)
			throw new Error("Player size can't be greater than " + Player.c_canvas_size);
		
		this.m_width = w;
		this.m_height = h;
		this.m_scaling = scaling;
		// set visible player size
		this.ui.set_canvas_container_size(w, h);
		
		const center = Player.c_canvas_size / 2.0;
		// initialize offsets
		this.m_fullscreen_scale = w / Player.c_gbf_animation_width;
		switch(this.m_layout_mode)
		{
			// note: Math.floor is used below for pixel snapping
			case PlayerLayoutMode.enemy:
			{
				// enemy is on the left, target on the right
				this.m_offset.position.x = Math.round(
					center - w * 0.30 * this.m_scaling
				);
				this.m_offset.position.y = Math.round(
					center + h * 0.50 * this.m_scaling
				);
				this.m_offset.target.x = Math.round(
					center + w * 0.25 * this.m_scaling
				);
				this.m_offset.target.y = Math.round(
					center + h * 0.40 * this.m_scaling
				);
				this.m_offset.fullscreen.x = Math.round(
					center - w * 0.5 / this.m_scaling
				);
				this.m_offset.fullscreen.y = Math.round(
					center - h * 0.5 / this.m_scaling
				);
				this.m_offset.special.y = Math.round(
					0.15 * w / this.m_scaling
				);
				this.m_offset.special.y = Math.round(
					0.15 * h / this.m_scaling
				);
				break;
			}
			case PlayerLayoutMode.mypage:
			{
				// there is no target or other effect
				// the offset is simply the top left corner
				this.m_offset.position.x = Math.round(
					center - w * 0.5
				);
				this.m_offset.position.y = Math.round(
					center - h * 0.5
				);
				break;
			}
			default: // normal mode
			{
				// element is on the right, target on the left
				this.m_offset.position.x = Math.round(
					center + w * 0.25 * this.m_scaling
				);
				this.m_offset.position.y = Math.round(
					center + h * 0.15 * this.m_scaling
				);
				this.m_offset.target.x = Math.round(
					center - w * 0.10 * this.m_scaling
				);
				this.m_offset.target.y = Math.round(
					center + h * 0.30 * this.m_scaling
				);
				this.m_offset.fullscreen.x = Math.round(
					center - w * 0.5 / this.m_scaling
				);
				this.m_offset.fullscreen.y = Math.round(
					center - h * 0.5 / this.m_scaling
				);
				this.m_offset.special.y = Math.round(
					0.15 * w / this.m_scaling
				);
				this.m_offset.special.y = Math.round(
					0.15 * h / this.m_scaling
				);
				break;
			}
		}
	}
	
	// return the Animation datas
	get_animations()
	{
		return this.m_animations;
	}
	
	// clear the canvas and draw a text
	loading_draw_text(text)
	{
		const half_size = Player.c_canvas_size / 2;
		const ctx = this.ui.m_canvas.getContext("2d");
		ctx.clearRect(0, 0, Player.c_canvas_size, Player.c_canvas_size);
		ctx.font = "20px Consolas, monospace";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.strokeStyle = "black";
		ctx.lineWidth = 8;
		ctx.strokeText(text, half_size, half_size); // outline
		ctx.fillStyle = "white";
		ctx.fillText(text, half_size, half_size);
	}
	
	// clear the canvas and draw the loading progress
	loading_draw_progress_bar(count, limit, suffix = "")
	{
		const half_size = Player.c_canvas_size / 2;
		const ctx = this.ui.m_canvas.getContext("2d");
		ctx.clearRect(0, 0, Player.c_canvas_size, Player.c_canvas_size);
		// back of the bar
		ctx.beginPath();
		ctx.fillStyle = "#111111";
		ctx.roundRect(half_size - 200, half_size + 20, 400, 10, 5);
		ctx.fill();
		// fill part of the bar
		ctx.beginPath();
		// make gradient for the fill bar
		const gradient = ctx.createLinearGradient(
			half_size - 200,
			half_size,
			half_size + 200,
			half_size
		);
		gradient.addColorStop(0, "#ff0000");
		gradient.addColorStop(0.5, "#ffffff");
		gradient.addColorStop(1, "#2bfafa");
		ctx.fillStyle = gradient;
		ctx.roundRect(half_size - 200, half_size + 20, 400 * count / limit, 10, 5);
		ctx.fill();
		// text
		ctx.font = "20px Consolas, monospace";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.strokeStyle = "black";
		ctx.lineWidth = 8;
		ctx.strokeText(count + " / " + limit + (suffix != "" ? " " + suffix : ""), half_size, half_size); // outline
		ctx.fillStyle = "white";
		ctx.fillText(count + " / " + limit + (suffix != "" ? " " + suffix : ""), half_size, half_size);
	}
	
	// set the Animation datas
	set_animations(animations)
	{
		this.m_animations = animations;
		if(animations[0].weapon != null)
		{
			for(const animation of this.m_animations)
			{
				this.m_weapon_textures.push(animation.weapon);
			}
		}
		this.loading_draw_text("Loading Animations...")
		// set the version Select
		this.ui.set_version();
		// load the files
		loader.load_animations();
	}
	
	// start playing
	start_animation()
	{
		// reset some variables
		this.m_debug.texture_count = Object.keys(window.images).length;
		this.m_debug.element_count = Object.keys(window.lib).length;
		this.m_playlist = [];
		this.m_current_motion = 0;
		this.m_current_cjs = 0;
		this.ui.m_canvas.getContext("2d").reset();
		// set texture container
		this.m_texture_state = {}
		for(const [name, img] of Object.entries(window.images))
		{
			this.m_texture_state[name] = {
				ori: img.src,
				version: null,
				swap: null
			}
		}
		
		// instantiate all main animations
		for(let i = 0; i < this.m_animations.length; ++i)
		{
			this.m_cjs.push(this.add_element(this.m_animations[i].cjs));
			// priming element textures
			const last = this.m_cjs[this.m_cjs.length - 1];
			// add and then removing seems to load them properly
			this.m_stage.addChild(last);
			this.m_stage.update();
			this.m_stage.removeChild(last);
		}
		// start with the first version on default animations
		if(this.m_cjs.length > 0)
		{
			// set the first element
			this.m_stage.addChild(this.m_cjs[0]);
			// fetch and store the motion list for all animations
			this.set_motion_lists();
			// make sure the state is reset
			this.reset();
			// reset motion (else it will be set to the last one, because reset is intended for use DURING playing)
			this.m_current_motion = 0;
			// set list of playing motion to demo
			this.m_current_motion_list = this.m_animations[this.m_current_cjs].demo_motions;
			// initialize playlist
			for(const motion of this.m_current_motion_list)
			{
				this.m_playlist.push([0, motion]);
			}
			// play our animation
			this.play(this.m_current_motion_list[this.m_current_motion]);
			//this.m_stage.update();
			this.ui.update_motion_control(this.m_motion_lists[this.m_current_cjs]);
			// update ui
			this.ui.update_ability_control(this.m_animations[0].abilities);
			this.ui.update_enemy_control(this.m_animations[0].is_enemy);
			this.ui.set_texture_list();
			this.ui.set_playlist_versions();
			// unlock button
			this.ui.set_control_lock(false);
			// disable loading
			this.m_loading = false;
			// disable pause
			this.resume();
		}
	}
	
	// retrieve the animation duration (in frames)
	get_animation_duration(cjs)
	{
		if(!cjs instanceof createjs.MovieClip) // shouldn't happen
			return null;
		else if(cjs.timeline.duration)
			return +cjs.timeline.duration;
		else // default for fallback purpose
			return +cjs.timeline.Id;
	}
	
	// return the next motion in the play list
	next_motion()
	{
		let next_index = this.m_current_motion + 1;
		if(next_index >= this.m_current_motion_list.length)
			next_index = 0;
		return this.m_current_motion_list[next_index];
	}
	
	// allow the user to shift the enemy position to the top right a bit
	// controlled by a button
	enemy_shift_toggle()
	{
		this.m_enemy_shift = !this.m_enemy_shift;
		// enemies don't have multiple version so no need to care which one we grab
		let cjs = this.get_current_animation_cjs().cjs;
		if(this.m_enemy_shift) // apply shift
		{
			cjs.x += Player.c_enemy_shift.x;
			cjs.y -= Player.c_enemy_shift.y;
		}
		else // move back
		{
			cjs.x -= Player.c_enemy_shift.x;
			cjs.y += Player.c_enemy_shift.y;
		}
		return this.m_enemy_shift;
	}
	
	// instantiate the main element (i.e. the main animation, character, etc...)
	add_element(cjs)
	{
		let element = new lib[cjs];
		element.name = cjs; // set name
		// set position to position offset
		element.x = this.m_offset.position.x;
		element.y = this.m_offset.position.y;
		// apply scaling
		element.scaleX *= this.m_scaling;
		element.scaleY *= this.m_scaling;
		// apply mypage scaling
		if(this.m_layout_mode == PlayerLayoutMode.mypage)
		{
			element.scaleX *= this.m_fullscreen_scale;
			element.scaleY *= this.m_fullscreen_scale;
		}
		// note: zindex default to 0 (BOTTOM)
		// return it
		return element;
	}
	
	// instantiate an auto attack effect (phit file)
	add_attack(cjs)
	{
		if(cjs == null) // invalid
			return;
		let atk = new lib[cjs];
		atk.name = cjs; // set name
		// set position to target offset
		atk.x = this.m_offset.target.x;
		atk.y = this.m_offset.target.y;
		// apply scaling
		atk.scaleX *= this.m_scaling;
		atk.scaleY *= this.m_scaling;
		// add to stage
		this.m_stage.addChild(atk);
		// set zindex to be on top
		this.m_stage.setChildIndex(atk, Player.c_zindex.TOP);
		// play the animation
		atk[cjs].gotoAndPlay(6); // always 6
		return atk;
	}
	
	// instantiate a charge attack (sp file)
	add_special(cjs, animation) // must pass the associated animation data
	{
		let special = new lib[cjs];
		special.name = cjs; // set name
		// add to stage
		this.m_stage.addChild(special);
		if(animation.is_enemy) // if it's an enemy animation
		{
			special.x = this.m_offset.target.x;
			special.y = this.m_offset.target.y;
			this.m_stage.setChildIndex(special, Player.c_zindex.TOP);
		}
		else // else player or weapon
		{
			// newer "fullscreen" animations cover all the screen
			// and have s2 or s3 in their file names
			if(cjs.includes("_s2") || cjs.includes("_s3"))
			{
				special.x = this.m_offset.fullscreen.x;
				special.y = this.m_offset.fullscreen.y;
				special.scaleX *= this.m_fullscreen_scale;
				special.scaleY *= this.m_fullscreen_scale;
			}
			else // regular ones
			{
				special.x = this.m_offset.target.x;
				special.y = this.m_offset.target.y + this.m_offset.special.y;
				this.m_stage.setChildIndex(special, Player.c_zindex.BOTTOM);
			}
		}
		// apply scaling
		special.scaleX *= this.m_scaling;
		special.scaleY *= this.m_scaling;
		// play the animation
		if(animation.is_main_character && animation.weapon != null)
		{
			// for main character with specific weapon
			// the animation we went is nested a bit further
			special[cjs][cjs + "_special"].gotoAndPlay("special");
		}
		else
		{
			special[cjs].gotoAndPlay(6);
		}
		return special;
	}
	
	// instantiate a summon
	add_summon(cjs)
	{
		let summon = new lib[cjs];
		summon.name = cjs; // set name
		// add to stage
		this.m_stage.addChild(summon);
		// the newer files are in two files (attack and damage)
		// both seems to use the fullscreen offset
		if(cjs.includes("_attack") || cjs.includes("_damage"))
		{
			summon.x = this.m_offset.fullscreen.x;
			summon.y = this.m_offset.fullscreen.y;
			summon.scaleX *= this.m_fullscreen_scale;
			summon.scaleY *= this.m_fullscreen_scale;
		}
		else // old summons (N, R, ...)
		{
			// set to target
			summon.x = this.m_offset.target.x;
			summon.y = this.m_offset.target.y;
			this.m_stage.setChildIndex(summon, Player.c_zindex.TOP);
			summon.gotoAndPlay(0);
		}
		// apply scaling
		summon.scaleX *= this.m_scaling;
		summon.scaleY *= this.m_scaling;
		return summon;
	}
	
	// instantiate a skill effect
	add_ability(cjs, is_aoe) // must pass if it's an aoe ability
	{
		let skill = new lib[cjs];
		skill.name = cjs; // set name
		// add to stage
		this.m_stage.addChild(skill);
		// display on top
		this.m_stage.setChildIndex(skill, Player.c_zindex.TOP);
		// aoe are like fullscreen special
		if(is_aoe)
		{
			skill.x = this.m_offset.fullscreen.x;
			skill.y = this.m_offset.fullscreen.y;
			skill.scaleX *= this.m_fullscreen_scale;
			skill.scaleY *= this.m_fullscreen_scale;
		}
		else
		{
			// set position according to m_ability_target state
			if(this.m_ability_target)
			{
				skill.x = this.m_offset.position.x;
				skill.y = this.m_offset.position.y;
			}
			else
			{
				skill.x = this.m_offset.target.x;
				skill.y = this.m_offset.target.y;
			}
		}
		// apply scaling
		skill.scaleX *= this.m_scaling;
		skill.scaleY *= this.m_scaling;
		return skill;
	}
	
	// instantiate a raid appear animation
	add_appear(cjs)
	{
		let appear = new lib[cjs];
		appear.name = cjs; // set name
		// add to stage
		this.m_stage.addChild(appear);
		// display on top
		this.m_stage.setChildIndex(appear, Player.c_zindex.TOP);
		// fullscreen
		appear.x = this.m_offset.fullscreen.x;
		appear.y = this.m_offset.fullscreen.y;
		appear.scaleX *= this.m_fullscreen_scale;
		appear.scaleY *= this.m_fullscreen_scale;
		// apply scaling
		appear.scaleX *= this.m_scaling;
		appear.scaleY *= this.m_scaling;
		return appear;
	}
	
	// create a tween for N duration and store it
	add_child_tween(tween_source, duration)
	{
		this.m_tween_sources.push(tween_source);
		const child_tween = createjs.Tween.get(tween_source, {
			useTicks: true,
			paused: this.m_paused
		}).wait(duration).call(() => {
			this.clean_tween(tween_source, child_tween);
		});
		this.m_child_tweens.push(child_tween);
	}
	
	// remove/clean up a specific tween
	clean_tween(tween_source, child_tween)
	{
		let i = this.m_tween_sources.indexOf(tween_source);
		if(i != -1)
			this.m_tween_sources.splice(i, 1);
		this.m_stage.removeChild(tween_source);
		i = this.m_child_tweens.indexOf(child_tween);
		if(i != -1)
			this.m_child_tweens.splice(i, 1);
	}
	
	// play an animation
	// the most important function
	// motion is the specific animation to play
	play(motion)
	{
		// first, we check if motion starts with switch_version_
		// switch_version_ is used by the play list system to switch character version automatically
		// if the motion is set to switch_version_INDEX where INDEX is a number, then we must switch character version
		if(motion.startsWith("switch_version_"))
		{
			let version_str = motion.substring("switch_version_".length);
			// remove current one from stage
			this.m_stage.removeChild(this.m_cjs[this.m_current_cjs]);
			// update current_cjs
			this.m_current_cjs = parseInt(version_str);
			// add current one to stage
			this.m_stage.addChild(this.m_cjs[this.m_current_cjs]);
			// update ui
			this.ui.m_version.value = version_str;
			this.ui.update_motion_control(this.m_motion_lists[this.m_current_cjs]);
			// update mainhands
			this.update_main_hand_weapon();
			// increase current_motion index
			this.m_current_motion++;
			// play the next animation
			this.play(this.m_current_motion_list[this.m_current_motion]);
			return;
		}
		let debug_extra_cjs = null;
		// retrieve the current animation data and instance
		let data = this.get_current_animation_cjs()
		if(data == null)
			return;
		// retrieve further down for clarity
		let name = data.cjs.name;
		var cjs = data.cjs[name];
		const animation = data.animation;
		// check if it's a valid animation
		if(!cjs instanceof createjs.MovieClip)
			return;
		// default to visible
		cjs.visible = true;
		// reset looping index
		this.m_looping_index = null;
		// duration will contain the animation duration
		let duration = 0;
		// check which motion it is
		switch(motion)
		{
			// Charge attacks / specials
			case Player.c_animations.MORTAL.key:
			case Player.c_animations.MORTAL_A.key:
			case Player.c_animations.MORTAL_A_1.key:
			case Player.c_animations.MORTAL_A_2.key:
			case Player.c_animations.MORTAL_B.key:
			case Player.c_animations.MORTAL_B_1.key:
			case Player.c_animations.MORTAL_B_2.key:
			case Player.c_animations.MORTAL_C.key:
			case Player.c_animations.MORTAL_C_1.key:
			case Player.c_animations.MORTAL_C_2.key:
			case Player.c_animations.MORTAL_D.key:
			case Player.c_animations.MORTAL_D_1.key:
			case Player.c_animations.MORTAL_D_2.key:
			case Player.c_animations.MORTAL_E.key:
			case Player.c_animations.MORTAL_E_1.key:
			case Player.c_animations.MORTAL_E_2.key:
			case Player.c_animations.MORTAL_F.key:
			case Player.c_animations.MORTAL_F_1.key:
			case Player.c_animations.MORTAL_F_2.key:
			case Player.c_animations.MORTAL_G.key:
			case Player.c_animations.MORTAL_G_1.key:
			case Player.c_animations.MORTAL_G_2.key:
			case Player.c_animations.MORTAL_H.key:
			case Player.c_animations.MORTAL_H_1.key:
			case Player.c_animations.MORTAL_H_2.key:
			case Player.c_animations.MORTAL_I.key:
			case Player.c_animations.MORTAL_I_1.key:
			case Player.c_animations.MORTAL_I_2.key:
			case Player.c_animations.MORTAL_J.key:
			case Player.c_animations.MORTAL_J_1.key:
			case Player.c_animations.MORTAL_J_2.key:
			case Player.c_animations.MORTAL_K.key:
			case Player.c_animations.MORTAL_K_1.key:
			case Player.c_animations.MORTAL_K_2.key:
			{
				// get the duration in the element
				duration = this.get_animation_duration(cjs[name + "_" + motion]);
				// if it has at least a special file
				if(animation.specials.length > 0)
				{
					// retrieve index
					// example: mortal_A is index 0, mortal_B is index 1...
					let special_index = motion.split('_')[1].charCodeAt()-65;
					// play the special file
					let special_cjs = null;
					if(animation.is_enemy)
					{
						// note: enemies need to match the proper file (if it exists) with the ougi motion
						// so for mortal_A, we're looking for the file with _01_ in the name, and so on
						for(let i = 0; i < animation.specials.length; ++i)
						{
							// enemy ougi file name are esp_ID_index_whatever
							// we want the file matching the index
							const file_index = animation.specials[i].split("_")[2];
							if(parseInt(file_index) - 1 == special_index)
							{
								special_cjs = this.add_special(animation.specials[i], animation);
								debug_extra_cjs = animation.specials[i];
								break
							}
						}
					}
					else
					{
						// check if index is in bound, else default to 0
						if(special_index >= animation.specials.length)
							special_index = 0;
						special_cjs = this.add_special(animation.specials[special_index], animation);
						debug_extra_cjs = animation.specials[special_index];
					}
					// store it in class attriute
					this.m_special_cjs = special_cjs;
					// add file duration if it's a weapon animation
					if(animation.is_main_character && animation.weapon != null)
					{
						duration += this.get_animation_duration(special_cjs[special_cjs.name][special_cjs.name + "_special"]);
					}
				}
				break;
			}
			// special ougis for origin classes
			case Player.c_animations.MORTAL_SP.key:
			{
				// get the duration in the element
				duration = this.get_animation_duration(cjs[name + "_" + motion]);
				let special_cjs = this.add_special(animation.ultimate, animation);
				debug_extra_cjs = animation.ultimate;
				// store it in class attriute
				this.m_special_cjs = special_cjs;
				// add file duration if it's a weapon animation
				duration = Math.min(
					duration,
					this.get_animation_duration(special_cjs[special_cjs.name][special_cjs.name + "_special"]
				));
				break;
			}
			// Summon files
			// Note: this isn't native and kinda hacked on top
			case Player.c_animations.SUMMON_ATTACK.key:
			case Player.c_animations.SUMMON_DAMAGE.key:
			{
				let summon_cjs_name = motion == Player.c_animations.SUMMON_DAMAGE.key
					? animation.specials[0].replace("attack", "damage") // update attack to damage accordingly
					: animation.specials[0];
				
				// play the summon file
				let summon_cjs = this.add_summon(summon_cjs_name);
				// store it in class attriute
				this.m_special_cjs = summon_cjs;
				// get duration
				if(!(summon_cjs_name in summon_cjs[summon_cjs_name])) // faisafe for old summons
				{
					for(const k in summon_cjs[summon_cjs_name]) // go over each key
					{
						if(k.includes("_attack")) // find the one named attack
						{
							debug_extra_cjs = summon_cjs_name;
							summon_cjs[summon_cjs_name].gotoAndPlay("attack");
							duration = this.get_animation_duration(summon_cjs[summon_cjs_name][k]);
							break;
						}
					}
				}
				else
				{
					debug_extra_cjs = summon_cjs_name;
					duration = this.get_animation_duration(summon_cjs[summon_cjs_name][summon_cjs_name]);
				}
				break;
			}
			// auto attack animation
			case Player.c_animations.ATTACK.key:
			case Player.c_animations.ATTACK_SHORT.key:
			case Player.c_animations.ATTACK_SHORT_ADV.key:
			case Player.c_animations.ATTACK_DOUBLE.key:
			case Player.c_animations.ATTACK_TRIPLE.key:
			case Player.c_animations.ATTACK_QUADRUPLE.key:
			case Player.c_animations.SPECIAL_ATTACK.key:
			case Player.c_animations.ENEMY_ATTACK.key:
			{
				debug_extra_cjs = animation.attack;
				// retrieve and play file
				let atk = this.add_attack(animation.attack);
				// get the duration
				let atk_duration = this.get_animation_duration(atk[animation.attack][animation.attack + "_effect"]);
				// set tween with the attack duration
				this.add_child_tween(atk, atk_duration);
				// set combo
				// i.e. if the following move is another attack...
				let next_motion = this.next_motion();
				if([
					Player.c_animations.ATTACK_DOUBLE.key,
					Player.c_animations.ATTACK_TRIPLE.key,
					Player.c_animations.ATTACK_QUADRUPLE.key
				].includes(next_motion))
				{
					duration = 10; // limit to 10 frames so that they follow right away
				}
				else
				{
					// else set duration normally
					duration = this.get_animation_duration(cjs[name + "_" + motion]);
				}
				// cycling atk num here (it seems to control which arm attack, see line 1 for concerned monsters)
				attack_num = (attack_num + 1) % 2;
				break;
			}
			// form change
			case Player.c_animations.CHANGE.key:
			case Player.c_animations.CHANGE_FROM.key:
			case Player.c_animations.CHANGE_FROM_2.key:
			case Player.c_animations.CHANGE_FULL.key:
			{
				// Note: does nothing different from default
				// keeping it this way in case it must be changed / improved
				duration = this.get_animation_duration(cjs[name + "_" + motion]);
				break;
			}
			// skill / ability use
			case Player.c_animations.ABILITY_MOTION.key:
			case Player.c_animations.ABILITY_MOTION_2.key:
			case Player.c_animations.ABILITY_MOTION_3.key:
			case Player.c_animations.ABILITY_MOTION_4.key:
			case Player.c_animations.ABILITY_MOTION_5.key:
			case Player.c_animations.VS_MOTION_1.key:
			case Player.c_animations.VS_MOTION_2.key:
			case Player.c_animations.VS_MOTION_3.key:
			case Player.c_animations.VS_MOTION_4.key:
			case Player.c_animations.VS_MOTION_5.key:
			case Player.c_animations.VS_MOTION_6.key:
			{
				// get the animation duration
				let base_duration = this.get_animation_duration(cjs[name + "_" + motion]);
				// check if animation got skill effects AND ui ability select is not set on None
				if(this.m_ability_mode > 0 && animation.abilities.length > 0)
				{
					// get file to play
					let skill_cjs = animation.abilities[this.m_ability_index];
					debug_extra_cjs = skill_cjs;
					let is_aoe = skill_cjs.includes("_all_");
					// instantiate
					const skill = this.add_ability(skill_cjs, is_aoe);
					// get duration
					// note: name change between aoe and single target files
					let skill_duration = is_aoe ?
						this.get_animation_duration(skill[skill_cjs][skill_cjs + "_end"]) :
						this.get_animation_duration(skill[skill_cjs][skill_cjs + "_effect"]);
					// add tween for this duration
					this.add_child_tween(skill, skill_duration);
					// get the highest duration between the element and skill effect
					duration = Math.max(base_duration, skill_duration);
					if(this.m_ability_mode == 1) // if set to Cycle mode
					{
						// increase index
						this.m_ability_index = (this.m_ability_index + 1) % animation.abilities.length;
					}
					if(skill_cjs == "ab_all_3030267000_01") // SR Richard highlow skill
					{
						// cycling highlow_result here (it determines if Richard's skill is a win or not)
						highlow_result = (highlow_result + 1) % 2;
					}
				}
				else // else the duration is just the base animation's
				{
					duration = base_duration;
				}
				break;
			}
			case Player.c_animations.RAID_APPEAR_0.key:
			case Player.c_animations.RAID_APPEAR_1.key:
			case Player.c_animations.RAID_APPEAR_2.key:
			case Player.c_animations.RAID_APPEAR_3.key:
			case Player.c_animations.RAID_APPEAR_4.key:
			case Player.c_animations.RAID_APPEAR_5.key:
			case Player.c_animations.RAID_APPEAR_6.key:
			case Player.c_animations.RAID_APPEAR_7.key:
			case Player.c_animations.RAID_APPEAR_8.key:
			case Player.c_animations.RAID_APPEAR_9.key:
			{
				let appear_index = parseInt(motion.split('_')[2]);
				// get file to play
				let appear_cjs = animation.raid_appear[appear_index];
				debug_extra_cjs = appear_cjs;
				// instantiate
				const appear = this.add_appear(appear_cjs);
				// get duration
				duration = this.get_animation_duration(appear[appear_cjs][appear_cjs]);
				// set as special
				this.m_special_cjs = appear;
				// add tween for this duration
				this.add_child_tween(appear, duration);
				// make character invisible
				cjs.visible = false;
				break;
			}
			default: // default behavior
			{
				// we just set the duration to the animation's
				duration = this.get_animation_duration(cjs[name + "_" + motion]);
				break;
			}
		};
		// update displayed animation name
		this.ui.set_motion(this.translate_motion(motion));
		// update displayed duration
		this.ui.set_duration(duration);
		if(isNaN(duration))
		{
			let next_motion = this.next_motion();
			if(next_motion != motion)
			{
				this.play(next_motion);
			}
			return;
		}
		this.m_debug.motion = motion;
		this.m_debug.duration = duration;
		this.m_debug.extra = debug_extra_cjs;
		
		// set listener for animation completion
		cjs.addEventListener("animationComplete", this.m_animation_completed_callback);
		// play animation
		if(![
				Player.c_animations.SUMMON_ATTACK.key,
				Player.c_animations.SUMMON_DAMAGE.key,
				Player.c_animations.RAID_APPEAR_0.key,
				Player.c_animations.RAID_APPEAR_1.key,
				Player.c_animations.RAID_APPEAR_2.key,
				Player.c_animations.RAID_APPEAR_3.key,
				Player.c_animations.RAID_APPEAR_4.key,
				Player.c_animations.RAID_APPEAR_5.key,
				Player.c_animations.RAID_APPEAR_6.key,
				Player.c_animations.RAID_APPEAR_7.key,
				Player.c_animations.RAID_APPEAR_8.key,
				Player.c_animations.RAID_APPEAR_9.key
				
			].includes(motion))
		{
			// the check is a hack to avoid character moving during certain animations
			cjs.gotoAndPlay(motion);
		}
		// handle dispatch stack
		let flag = true;
		let index;
		for(index = 0; index < this.m_dispatch_stack.length; index++)
		{
			if(this.m_dispatch_stack[index] == 0)
			{
				this.m_dispatch_stack[index] = _.max(this.m_dispatch_stack) + 1
				flag = false
				break
			}
		}
		if(flag)
		{
			this.m_dispatch_stack[index] = _.max(this.m_dispatch_stack) + 1
		};
		
		// create main tween
		// all the tweens are merely used to keep track of the animation durations
		this.m_main_tween = createjs.Tween.get(this.m_stage, {
			useTicks: true,
			override: true,
			paused: this.m_paused
		}).wait(duration).call((index) => {
			this.m_looping_index = index;
			if(
				this.m_layout_mode != PlayerLayoutMode.mypage &&
				(
					this.m_recording ||
					this.m_looping
				)
			)
				this.play_next(cjs);
		}, [index]);
	}
	
	// change which character to play animations from
	change_version(index, motion)
	{
		if(index == this.m_current_cjs) // same as current one, abort
			return;
		// check if it exists for upcoming version
		if(motion != "default" && !this.m_motion_lists[index].includes(motion))
			motion = "default";
		// terminate previous animation
		const data = this.get_current_animation_cjs()
		if(data != null)
		{
			data.cjs[data.cjs.name].dispatchEvent("animationComplete");
		}
		// remove everything from the stage
		this.m_stage.removeAllChildren();
		this.m_special_cjs = null;
		this.m_tween_sources = [];
		this.m_child_tweens = [];
		// stop on going audios
		if(window.audio)
			window.audio.stop_all();
		// select new cjs and add to stage
		this.m_current_cjs = index;
		this.m_stage.addChild(this.m_cjs[this.m_current_cjs]);
		// update motion control
		this.ui.update_motion_control(this.m_motion_lists[this.m_current_cjs]);
		// set playlist
		if(motion == "default")
			this.m_current_motion_list = this.get_animations()[index].demo_motions;
		else
			this.m_current_motion_list = [motion];
		// update current motion
		this.m_current_motion--;
		if(this.m_current_motion >= this.m_current_motion_list.length)
			this.m_current_motion = 0;
		else if(this.m_current_motion < 0)
			this.m_current_motion = this.m_current_motion_list.length - 1;
		// update main character main_hand
		this.update_main_hand_weapon();
		// play animation
		this.play(this.m_current_motion_list[this.m_current_motion]);
	}
	
	// called when a main tween is over to play the next animation
	play_next(previous_cjs)
	{
		if(this.m_looping_index == null)
			return;
		if(this.m_dispatch_stack[this.m_looping_index] == _.max(this.m_dispatch_stack))
		{
			this.m_dispatch_stack[this.m_looping_index] = 0;
			if(previous_cjs)
				previous_cjs.dispatchEvent("animationComplete");
		}
		else
		{
			this.m_dispatch_stack[this.m_looping_index] = 0;
			// if not looping or is mypage, we fire the dispatch
			if(previous_cjs && (!this.m_looping || this.m_layout_mode == PlayerLayoutMode.mypage))
				previous_cjs.dispatchEvent("animationComplete");
		}
	}
	
	// called when the animation is completed
	animation_completed(event)
	{
		// clean up listener
		event.target.removeEventListener("animationComplete", this.m_animation_completed_callback);
		// if there is a special
		if(this.m_special_cjs != null) // clean up
		{
			this.m_stage.removeChild(this.m_special_cjs);
			this.m_special_cjs = null;
		}
		// increase motion index
		this.m_current_motion++;
		if(this.m_current_motion >= this.m_current_motion_list.length)
			this.m_current_motion = 0;
		// play next motion
		this.play(this.m_current_motion_list[this.m_current_motion]);
	}
	
	// update the main hand texture
	update_main_hand_weapon()
	{
		for(const [name, alt] of [["weapon", "weapon_version_"], ["weapon_l", "weapon_version_l_"], ["weapon_r", "weapon_version_r_"], ["weapon2a", "weapon_version_2a_"], ["weapon2b", "weapon_version_2b_"], ["familiar", "familiar_version_"], ["shield", "shield_version_"]])
		{
			if(name in this.m_texture_state)
			{
				if(this.m_current_cjs == 0)
				{
					this.m_texture_state[name].version == null;
					if(this.m_texture_state[name].swap == null)
						images[name].src = this.m_texture_state[name].ori;
					else
						images[name].src = this.m_texture_state[name].swap.url;
				}
				else if(alt + this.m_current_cjs in this.m_texture_state)
				{
					
					this.m_texture_state[name].version = alt + this.m_current_cjs;
					if(this.m_texture_state[this.m_texture_state[name].version].swap == null)
						images[name].src = this.m_texture_state[this.m_texture_state[name].version].ori;
					else
						images[name].src = this.m_texture_state[this.m_texture_state[name].version].swap.url;
				}
			}
		}
	}
	
	// set a texture for a particular element
	set_texture(name, blob)
	{
		if(this.m_texture_state[name].swap != null)
		{
			URL.revokeObjectURL(this.m_texture_state[name].swap.url);
		}
		else
		{
			this.m_texture_state[name].swap = {
				blob: null,
				url : null
			}
		}
		this.m_texture_state[name].swap.blob = blob;
		this.m_texture_state[name].swap.url = URL.createObjectURL(this.m_texture_state[name].swap.blob);
		images[name].src = this.m_texture_state[name].swap.url;
		// update main hand if we updated ones of those
		if(["weapon", "weapon_l", "weapon_r", "weapon2a", "weapon2b", "familiar", "shield"].includes(name) || name.startsWith("weapon_version_") || name.startsWith("familiar_version_") || name.startsWith("shield_version"))
			this.update_main_hand_weapon();
	}
	
	// reset a texture to its original
	reset_texture(name)
	{
		if(this.m_texture_state[name].swap != null)
		{
			URL.revokeObjectURL(this.m_texture_state[name].swap.url);
			delete this.m_texture_state[name].swap.blob;
			this.m_texture_state[name].swap = null;
			if(this.m_texture_state[name].version != null)
			{
				images[name].src = this.m_texture_state[this.m_texture_state[name].version].ori;
			}
			else
			{
				images[name].src = this.m_texture_state[name].ori;
			}
			return true;
		}
		else
		{
			return false;
		}
	}
	
	// read the list of animation from each instance and store it in m_motion_lists
	set_motion_lists()
	{
		let new_lists = [];
		for(let i = 0; i < this.m_cjs.length; ++i)
		{
			const animation = this.m_animations[i];
			let cjs = this.m_cjs[i];
			let motion_list = [];
			// special "hacky" exception for summons
			if(animation.summon != null)
			{
				// there are two types
				// attack + damage
				// and old ones
				if(animation.specials.length >= 1
					&& animation.specials[0].includes("_attack"))
				{
					// set list to character summon, summon atk and summon dmg
					motion_list = ["summon", "summon_atk", "summon_dmg"];
				}
				else
				{
					// set list to character summon and summon atk
					motion_list = ["summon", "summon_atk"];
				}
			}
			else // normal way
			{
				let unsorted_motions = [];
				for(const motion in cjs[cjs.name]) // iterate over all keys
				{
					// a motion always start with the file name
					let motion_str = motion.toString();
					if(motion_str.startsWith(cjs.name))
					{
						// hack to disable ougi options on mc beside mortal_B
						if(animation.is_main_character
							&& motion_str.includes("mortal")
							&& !motion_str.endsWith("_mortal_SP")
							&& (
								(
									animation.weapon == null
								&& !motion_str.endsWith("_mortal_B")
								) ||
								(
									animation.weapon != null
								&&  ["_1", "_2"].includes(motion_str.slice(-2))
								)
							)
						)
							continue;
						// remove the file name part
						motion_str = motion_str.substr(cjs.name.length + 1);
						// add to list
						unsorted_motions.push(motion_str);
					}
				}
				// add appear animation
				if(animation.is_enemy)
				{
					for(let i = 0; i < animation.raid_appear.length; ++i)
					{
						unsorted_motions.push("raid_appear_" + i);
					}
				}
				// create a table of translate name and motion
				let table = {};
				for(const m of unsorted_motions)
				{
					table[this.translate_motion(m)] = m;
				}
				// get a list of sorted translated name
				const keys = Object.keys(table).sort();
				// build motion list according to sorted order
				for(const k of keys)
				{
					motion_list.push(table[k]);
				}
			}
			// append list to motion list
			new_lists.push(motion_list);
		}
		// update m_motion_lists
		this.m_motion_lists = new_lists;
	}
	
	// translate animation to more humanly readable names.
	// Unofficial/Made up and Non exhaustive.
	translate_motion(motion)
	{
		if(motion in Player.c_animation_name_table)
		{
			const i = Player.c_animation_name_table[motion];
			return Player.c_animations[i].name;
		}
		// Unknown name
		return "??? (" + motion + ")";
	}
	
	// pause the player
	pause()
	{
		if(!this.m_paused)
		{
			this.m_paused = true;
			// remove tick
			createjs.Ticker.removeEventListener("tick", this.m_stage);
			// pause all tweens
			if(this.m_main_tween)
				this.m_main_tween.paused = true;
			for(let child of this.m_child_tweens)
				child.paused = true;
			this.ui.m_buttons.pause.classList.toggle("player-button-warning", true);
		}
	}
	
	// unpause the player
	resume()
	{
		if(this.m_paused)
		{
			this.m_paused = false;
			// add tick
			createjs.Ticker.addEventListener("tick", this.m_stage);
			// unpause all tweens
			if(this.m_main_tween)
				this.m_main_tween.paused = false;
			for(let child of this.m_child_tweens)
				child.paused = false;
			this.ui.m_buttons.pause.classList.toggle("player-button-warning", false);
		}
	}
	
	// reset the stage state
	reset()
	{
		// clean up extra animations
		for(let ex of this.m_tween_sources)
			this.m_stage.removeChild(ex);
		this.m_tween_sources = [];
		this.m_child_tweens = [];
		// update stage to apply
		this.m_stage.update();
		// stop playing audio
		if(window.audio)
			window.audio.stop_all();
		// set current motion to last one
		this.m_current_motion = this.m_current_motion_list.length - 1;
		// fire animation complete
		// it will do additional clean up and cycle the animation to the first one (0)
		this.m_cjs[this.m_current_cjs].children[0].dispatchEvent("animationComplete");
	}
	
	// play the animation until the next frame. Must be paused beforehand.
	next_frame()
	{
		if(this.m_tick_callback == null)
		{
			if(this.m_paused)
				this.resume();
			this.m_tick_callback = this.pause_next_tick.bind(this);
			createjs.Ticker.addEventListener("tick", this.m_tick_callback);
		}
	}
	
	// called at the next tick
	pause_next_tick()
	{
		this.pause(); // can't use this, use player instead
		createjs.Ticker.removeEventListener("tick", this.m_tick_callback);
		this.m_tick_callback = null;
	}
	
	record()
	{
		try
		{
			if(this.m_tick_callback != null)
				return;
			// pause the player first
			this.pause();
			// detect the mimetype
			let mimetype = null;
			// list of format/codecs we are trying.
			for(let m of ["video/webm;codecs=vp8", "video/webm;codecs=h264", "video/webm", "video/mp4"])
			{
				if(MediaRecorder.isTypeSupported(m))
				{
					mimetype = m;
					break;
				}
			}
			// error check if no supported mimetype
			if(mimetype == null)
			{
				console.error("This feature isn't supported on your device/browser.");
				if(typeof push_popup !== "undefined")
					push_popup("This feature isn't supported on your device/browser.");
				return;
			}
			// set callback
			this.m_tick_callback = this.record_next_frame.bind(this);
			createjs.Ticker.addEventListener("tick", this.m_tick_callback);
			// restart current animation playlist
			this.reset();
			// firefox check
			let is_firefox = navigator.userAgent.toLowerCase().includes("firefox");
			// container
			this.m_recording = {
				motions: new Set(), // will contain the list of motion already played
				can_alpha: (mimetype.includes(";codecs") && !is_firefox), // flag to check if alpha can be true if the button is enabled
				alpha: (mimetype.includes(";codecs") && this.ui.m_record_transparency && !is_firefox), // set to true for vp8 (and possibly vp9 in the future), setting is enabled and if NOT firefox
				position: -1, // the last played frame
				frames: 0, // the number of frames added to the recording
				canvas: null, // the canvas used for the recording
				ctx: null, // the canvas context
				stream: null, // the recording stream
				rec: null, // the media recorder instance
				chunks: [], // video chunks
				mimetype: mimetype, // the mimetype
				extension: mimetype.split(';')[0].split('/')[1], // the file extension
				use_background: ( // true if we can use the background
					this.ui.m_background.src.startsWith(window.location.origin) ||
					this.ui.m_background.src.startsWith("data:image")
				), 
				old_framerate: createjs.Ticker.framerate, // keep track of the framerate
				firefox: is_firefox, // flag for firefox compatibility
				error: false, // error flag
				bg_scaled_height: null, // used for background scaling
				mypage_duration: parseInt(this.ui.m_menus.record_duration.value ?? "10") * 30 // duration of MyPage animations
			};
			// reset the framerate to 30
			createjs.Ticker.framerate = 30;
			// create a canvas on which we'll draw
			this.m_recording.canvas = document.createElement("canvas");
			// the size is exactly the visible window
			this.m_recording.canvas.width = this.m_width;
			this.m_recording.canvas.height = this.m_height;
			// create the 2d context
			this.m_recording.ctx = this.m_recording.canvas.getContext("2d");
			// set to 0 fps to disable automatic capture
			// note: firefox doesn't support requestFrame, so we use an automatic capture at 30 fps
			this.m_recording.stream = this.m_recording.canvas.captureStream(this.m_recording.firefox ? 30 : 0);
			// create and set media recorder
			let bitrate = parseInt(this.ui.m_menus.record_bitrate.value ?? "50") * 1024 * 1024;
			this.m_recording.rec = new MediaRecorder(this.m_recording.stream, {mimeType: this.m_recording.mimetype, videoBitsPerSecond:bitrate}); // 50mbps
			// set events
			this.m_recording.rec.ondataavailable = e => {
				// when new data is available
				if(e.data) // add data to chunks
					this.m_recording.chunks.push(e.data);
			}
			this.m_recording.rec.onstop = e => {
				// when recording is stopped
				if(!this.m_recording.error) // check if it's due to an error
				{
					// create blob from chunks and download it
					this.download_video(new Blob(this.m_recording.chunks, {type: this.m_recording.mimetype}), this.m_recording.extension);
				}
				this.m_recording = null;
			};
			// start (using 1s chunks)
			this.m_recording.rec.start(1);
			// note current position
			this.m_recording.position = this.m_main_tween.position;
			// update stage to apply the reset
			this.m_stage.update();
			// send popup to user
			if(typeof push_popup !== "undefined")
				push_popup("Generating the video, be patient...");
			// lock the controls
			this.ui.set_control_lock(true);
			// resume play
			this.resume()
		}
		catch(err) // error handling
		{
			// clean up
			createjs.Ticker.removeEventListener("tick", this.m_tick_callback);
			this.m_tick_callback = null;
			if(this.m_recording)
			{
				createjs.Ticker.framerate = this.m_recording.old_framerate;
				this.m_recording.error = true;
				this.m_recording = null;
			}
			// pause
			this.pause();
			// unlock the controls in case they're locked
			this.ui.set_control_lock(false);
			// send error messages
			console.error("Exception thrown", err.stack);
			if(typeof push_popup !== "undefined")
				push_popup("An error occured. This feature might be unavailable on your device/browser.");
		}
	}
	
	record_next_frame()
	{
		try
		{
			let segment = "" + this.m_current_cjs + "#" + this.m_current_motion;
			// "segment" will be something like VERSION_INDEX#MOTION_INDEX
			// it's done this way to ensure we won't have weird overlaps
			//
			// next we check if either:
			// - it's the very first frame (no motions seen and frames captured at 0)
			// - the frame has changed (if it did, this mean the animation progressed)
			// - if the current segment is stored in motions (if it's not, this means we haven't seen it yet)
			//
			// Note: for home page animations, we just go through, as we don't care about the loop or animations
			if(
				this.m_layout_mode == PlayerLayoutMode.mypage ||
				(
					this.m_layout_mode != PlayerLayoutMode.mypage &&
					(
						(this.m_recording.motions.length == 0 && this.m_recording.frames == 0)
						|| (this.m_recording.position != this.m_main_tween.position)
						|| (!this.m_recording.motions.has(segment))
					)
				)
			)
			{
				// update position
				this.m_recording.position = this.m_main_tween.position;
				// pause animation
				this.pause();
				/* here we check if the animation is over
				for mypage animations, we let it run for 10s
				for other animations:
				- if the segment is already in motions, it means we have looped back
				- AND if the position is back to zero (meaning we just looped back to the start of another animation)
				- AND the frames captured is non null (meaning it's not the beginning)
				*/
				if(
					(
						this.m_layout_mode == PlayerLayoutMode.mypage
						&& this.m_recording.frames >= this.m_recording.mypage_duration
					) || (
						this.m_layout_mode != PlayerLayoutMode.mypage
						&& this.m_recording.motions.has(segment)
						&& this.m_main_tween.position == 0
						&& this.m_recording.frames > 0
					)
				)
				{
					// cleanup
					createjs.Ticker.removeEventListener("tick", this.m_tick_callback);
					this.m_tick_callback = null;
					// add popup
					if(typeof push_popup !== "undefined")
						push_popup("Finalizing...");
					// We wait a bit before ending the this.m_recording
					// The delay is needed for to let MediaRecorder finishes what it's doing or frames might be missing
					setTimeout(() => {
							this.record_end();
						},
						2000
					);
					return; // exit here
				}
				// this.m_recording isn't over
				// add segment to motions
				this.m_recording.motions.add(segment);
				// clear our canvas
				if(this.m_recording.alpha) // if set, simply clear with transparent rectangle
				{
					this.m_recording.ctx.clearRect(0, 0, this.m_width,this.m_height);
				}
				else // else we use a solid image to clear the canvas, to avoid transparency issues (for non VPX codecs)
				{
					if(this.m_recording.use_background) // if local background
					{
						// clear the rectangle
						if(this.m_recording.can_alpha)
						{
							this.m_recording.ctx.clearRect(0, 0, this.m_width,this.m_height);
						}
						else
						{
							this.m_recording.ctx.rect(0, 0, this.m_width,this.m_height);
							this.m_recording.ctx.fillStyle = "black";
							this.m_recording.ctx.fill();
						}
						// draw the background
						if(this.m_recording.bg_scaled_height == null)
						{
							this.m_recording.bg_scaled_height = (
								this.m_width
								/ this.ui.m_background.naturalWidth
								* this.ui.m_background.naturalHeight
							);
						}
						this.m_recording.ctx.drawImage(this.ui.m_background, 0, 0, this.m_width,this.m_recording.bg_scaled_height);
					}
					else // else just fill it black
					{
						this.m_recording.ctx.rect(0, 0, this.m_width,this.m_height);
						this.m_recording.ctx.fillStyle = "black";
						this.m_recording.ctx.fill();
					}
				}
				// copy a crop of the player stage canvas to our canvas
				this.m_recording.ctx.drawImage(
					this.m_stage.canvas,
					(Player.c_canvas_size - this.m_width) / 2,
					(Player.c_canvas_size - this.m_height) / 2,
					this.m_width,
					this.m_height,
					0,
					0,
					this.m_width,
					this.m_height)
				;
				if(!this.m_recording.firefox)
				{
					// request the frame to capture it
					this.m_recording.stream.getVideoTracks()[0].requestFrame();
				}
				// increase our frame counter
				this.m_recording.frames++;
				// resume playing
				this.resume();
			}
		}
		catch(err) // error handling
		{
			console.error(err);
			// cleanup
			createjs.Ticker.removeEventListener("tick", this.m_tick_callback);
			this.m_tick_callback = null;
			// reset framerate
			createjs.Ticker.framerate = this.m_recording.old_framerate;
			// stop everything
			this.m_recording.error = true;
			this.m_recording.rec.stop();
			// unlock controls
			this.ui.set_control_lock(false);
			// send error messages
			console.error("Exception thrown", err.stack);
			if(typeof push_popup !== "undefined")
				push_popup("An error occured. This feature might be unavailable on your device/browser.");
		}
	}
	
	// recording is over
	record_end()
	{
		// clean up
		createjs.Ticker.removeEventListener("tick", this.m_tick_callback);
		this.m_tick_callback = null;
		// reset framerate
		createjs.Ticker.framerate = this.m_recording.old_framerate;
		// unlock controls
		this.ui.set_control_lock(false);
		// stop the recording
		// it will fire the onstop event
		this.m_recording.rec.stop();
	}
	
	// called by the recording onstop event
	download_video(blob, extension)
	{
		// create an objectUrl from the blob
		let url = URL.createObjectURL(blob);
		// create a 'a' tag/link
		let link = document.createElement('a');
		link.href = url; // set url to our object url
		link.download = 'gbfap_' + Date.now() + '.' + extension; // and the file name
		// trigger the click to download
		link.click();
		// add popup
		if(typeof push_popup !== "undefined")
			push_popup("Video saved as " + link.download);
		// clean up object url
		URL.revokeObjectURL(url);
	}
};

// function to create the player instance and initialize the html and stage
function init_player(mode = PlayerLayoutMode.normal)
{
	if(player != null)
	{
		player.restart(mode);
	}
	else
	{
		player = new Player(mode);
		player.ui.set_html();
		player.ui.reset();
	}
	player.init_stage();
	player.load_settings();
}