define(["underscore"], (function() {
    return {
        play: function(file)
        {
            if(sfxState)
            {
                let audio = new Audio("https://prd-game-a5-granbluefantasy.akamaized.net/assets_en/sound/" + file);
                audio.volume = 0.5;
                audio.play();
            }
        },
        stop: function()
        {
            
        }
    }
}));