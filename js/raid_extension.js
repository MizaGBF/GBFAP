define([], (function() {
	// functions used by some animations
	// only useful in actual battle and don't need to be implemented here
	return {
		mAnimBrightness: function(a, b, c) {},
		hideHUD: function(a) {}, // uneeded, no hud
		showHUD: function(a) {}, // uneeded, no hud
		mAnimColor: function(a, b, c) {}, // seemingly unused in the gacha preview
		mAnimShake: function(type, duration, occurence, src_object) {}, // uneeded because we don't have a target
		mMoveTo: function(a, b, c, d, e) {}, // only useful in actual battle
		mChangeMotion: function(motion) {}, // to change the element animation. uneeded, we have our own logic
		mDamage: function(_createjs, damage) {}, // we have no target, you're supposed to play the enemy damage animation here
		mDamageSyncEffect: function(a, b) {},
		_changeDamageMotionBoss: function(a, b, c, d) {},
		_changeHpBoss: function(a, b, c) {},
		mAnimZoomChara: function(a) {},
		mAnimZoomReset: function() {}
	}
}));