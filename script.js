var storage = localStorage
var config = JSON.parse(storage.getItem('countdown_config'));

var id = null;
var saveId = null;
var sec = '';

var loadConfig = () => {
    for (let key in config)
        $(`input[name=${key}]`).val(config[key]);
}
var saveConfig = () => {
    let msg = '';
    if (!(''+config.span).match(/^\d+$/) || config.span < 10) {
        config.span = 1000
        msg += (msg ? "<br/>" : '') + "カウントダウンの間隔の最小は「10」です";
    }
    
    if (!(''+config.rmTime).match(/^\d+$/)) {
        config.rmTime = 5000
        msg += (msg ? "<br/>" : '') + "隠す時間は数値で入力してください";
    }

    if (!(''+config.textSize).match(/^\d+$/)) {
        config.textSize = 14
        msg += (msg ? "<br/>" : '') + "文字サイズは数値で入力してください";
    }

    if (!config.textColor.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
        config.textColor = "#FFFFFF"
        msg += (msg ? "<br/>" : '') + "文字色の入力形式がおかしいです";
    }

    if (!config.shadowColor.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
        config.shadowColor = "#252525"
        msg += (msg ? "<br/>" : '') + "影色の入力形式がおかしいです";
    }
    console.log("save countdown_config", config);
    storage.setItem('countdown_config', JSON.stringify(config));
    
    if (msg!=='') {
        if (saveId!==null)
            clearTimeout(saveId);
        $('#error').html(msg);
        $('#error').fadeIn(100);
        saveId = setTimeout(() => {
            $('#error').fadeOut(100);
            saveId = null;
        },2000);
    }
    
    loadConfig();
}
var setTime = (s) => {
    if (sec <= config.rmTime) {
        clearTime();
    }
    else if (sec !== '')
        $('#count-down').text((sec / 1000).toFixed(4 - (config.span+"").length));
}

var clearTime = () => {
    $('#count-down').text('');
    if (id!==null)
        clearInterval(id);
    id = null;
    sec = '';
}

var setLayout = () => {
    $('#count-down').css({
        'color' : config.textColor,
        'text-shadow' : `2px 2px 8px ${config.shadowColor}`,
        'font-size' : `${config.textSize}rem`,
        'width' : `${config.textSize}rem`,
    });
};

if (config===null) {
    console.log('Config init');
    config = {
        span : 1000,
        rmTime : 5000,
        textSize : 14,
        textColor : "#FFFFFF",
        shadowColor : "#802525",
    };
    storage.setItem('countdown_config', JSON.stringify(config));
}

addOverlayListener('LogLine', (data) => {
    if (data.line[0] === '00') {
        var m = data.line[4].match(/戦闘開始まで(\d+)秒！ （/);
        // 戦闘開始までxx秒！
        if (m) {
            sec = m[1];
            if (sec) {
                sec *= 1000;  // ms
                setTime();
                id = setInterval(() => {
                    sec -= config.span;
                    setTime();
                }, config.span);
            }
            else {
                console.log("Stop Countdown:", id);
                if (id)
                    clearInterval(id);
                clearTime();
            }
            console.log("data", data);
        }
    }
});

document.addEventListener('onOverlayStateUpdate', (e) => {
    if (e.detail.isLocked) {
        clearTime();
        $('body').removeClass('setting-mode');
        $('#config').hide();
    }
    else {
        loadConfig();
        sec = 18 * 1000;
        setTime();
        $('body').addClass('setting-mode');
        $('#config').show();
    }
});

$(function () {

    $('#config input').on('change', function(e) {
        console.log(this, e);
        let val = e.currentTarget.value;
        if (val.match(/^\d+$/))
            val = parseInt(val);
        config[e.currentTarget.name] = val;
        saveConfig();

        sec = 18 * 1000;
        setLayout();
        setTime();
    });

    $('#error').hide();

    setLayout();
    startOverlayEvents();
});