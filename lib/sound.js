define(["underscore"], (function() {
    return {
        play: function(file)
        {
            if(sfxState)
            {
                let audio = new Audio(Game.soundUri + '/' + file);
                audio.volume = 0.5;
                audio.play();
            }
        },
        stop: function()
        {
            
        }
    }
}));