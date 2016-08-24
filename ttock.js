var ktk = ktk || {};

ktk.ttock = (function() {
  // defined elements
  var ele_display = null;
  var ele_timer   = null;
  var ele_timer_input = null;
  var ele_timer_h = null;
  var ele_timer_m = null;
  var ele_timer_s = null;
  var ele_timer_ms = null;
  var ele_timer_total = null;
  // logic control
  var is_touch    = false;
  var is_paused   = true;
  var has_played  = false;
  var start_time  = null;
  var last_time   = null;
  var target_time = 4500;          // target time in ms
  var total_time  = 0;
  var pause_start = 0;
  var timer       = null;           // setInterval timer
  var press_time  = 0;
  var key_held    = false;          // 'spacebar' held boolean
  // audio
  var audio_ctx = new AudioContext();
  // methods
  function onInit() {
    ele_display = document.getElementById('display');
    ele_timer = document.getElementById('timer');
    ele_timer_text = document.getElementById('timer_text');
    ele_timer_total = document.getElementById('timer_total');
    ele_timer_input = document.getElementById('timer_input');
    ele_timer_input_h = document.getElementById('h_input');
    ele_timer_input_m = document.getElementById('m_input');
    ele_timer_input_s = document.getElementById('s_input');
    ele_timer_input_ms = document.getElementById('ms_input');
    setTimer(new Event(null));
    document.body.addEventListener('keydown', onKeyDown, true);
    document.body.addEventListener('keyup', onKeyUp, true);
    ele_timer.addEventListener('mousedown', onMouseDown, true);
    ele_timer.addEventListener('mouseup', onMouseUp, true);
    document.body.addEventListener('touchstart', function(e) {
      if (!is_touch) {
        is_touch = true
        ele_timer.addEventListener('touchstart', onTouchDown, true);
        ele_timer.addEventListener('touchend', onTouchUp, true);
      }
    }, true);
    ele_timer_input_h.addEventListener('change', setTimer, false);
    ele_timer_input_m.addEventListener('change', setTimer, false);
    ele_timer_input_s.addEventListener('change', setTimer, false);
    ele_timer_input_ms.addEventListener('change', setTimer, false);
  };
  function onStop() {
    total_time += (last_time - start_time);
    pause_start = start_time = last_time = 0;
    ele_timer_text.innerText = convertTime(0);
    ele_timer.style.boxShadow = "0 0 0vmin #0080FF";
    updateColor();
    if (is_paused) return;
    clearInterval(timer);
    timer = null;
    is_paused = true;
  };
  function onToggle() {
    if (is_paused) {
      start_time -= pause_start - getTime();
      timer = setInterval(onTick, 1);
      is_paused = false;
    } else {
      clearInterval(timer);
      timer = null;
      pause_start = getTime();
      is_paused = true;
    }
  };
  function onDing() {
    has_played = true;
    var oscillator = audio_ctx.createOscillator();
    oscillator.type = "triangle";
    oscillator.connect(audio_ctx.destination);

    oscillator.start(0);
    setTimeout(function() {
      oscillator.stop();
    }, 250);
  };
  function onTick() {
    if (is_paused) return;
    last_time = getTime();
    var elapsed = ((last_time - start_time));
    ele_timer_text.innerText = convertTime(elapsed);
    ele_timer_total.innerText = convertTime(total_time+elapsed);
    if (elapsed >= target_time) {
      if (!has_played) onDing();
      ele_timer.style.boxShadow = "0 0 4vmin #0080FF";
    }
    updateColor();
  };
  function updateColor() {
    var delta = ((last_time - start_time));
    var ratio = Math.min(delta / target_time, 1.0);
    var r = Math.floor(200 * ratio);
    var g = Math.floor(25 * ratio);
    var b = Math.floor(200 * ratio);
    ele_timer.style.backgroundColor = 'rgb('+r+','+g+','+b+')';
  };
  function getTime() {
    if (typeof performance !== 'undefined') return performance.now();
    else return new Date();
  };
  function setTimer(evt) {
    evt.preventDefault();
    target_time = Number(ele_timer_input_h.value*60*60*1000) + Number(ele_timer_input_m.value*60*1000) + Number(ele_timer_input_s.value*1000) + Number(ele_timer_input_ms.value);
    if (target_time > (last_time - start_time)) {
      has_played = false;
      ele_timer.style.boxShadow = "0 0 0vmin #0080FF";
    }
    return false;
  };
  function onKeyDown(evt) {
    if (evt.which == 32 && !key_held) {
      evt.target = ele_timer;
      onMouseDown(evt);
      key_held = true;
    }
  };
  function onKeyUp(evt) {
    if (evt.which == 32) {
      evt.target = ele_timer;
      onMouseUp(evt);
      key_held = false;
    }
  };
  function onTouchDown(evt) {
    if (evt.target.parentElement == ele_timer_input) return;
    evt.preventDefault();
    onMouseDown(evt);
  };
  function onTouchUp(evt) {
    if (evt.target.parentElement == ele_timer_input) return;
    evt.preventDefault();
    onMouseUp(evt);
  };
  function onMouseDown(evt) {
    if (evt.target.parentElement == ele_timer_input) return;
    press_time = getTime();
  };
  function onMouseUp(evt) {
    if (evt.target.parentElement == ele_timer_input) return;
    var delta = getTime() - press_time;
    if (delta > 750) {
      total_time = 0;
      ele_timer_total.innerText = convertTime(0);
      onStop();
      has_played = false;
    } else if (delta > 200) {
      onStop();
      has_played = false;
      ele_timer_total.innerText = convertTime(total_time);
    } else {
      onToggle();
    }
  };
  function convertTime(ms) {
    var s = ms/1000;
    var m = s/60;
    var h = m/60;
    var rms = Math.floor(ms % 1000);
    rms = rms < 100 ? rms < 10 ? '00'+rms : '0'+rms : rms;
    var rs = Math.floor(s % 60);
    rs = rs < 10 ? '0'+rs : rs;
    var rm = Math.floor(m % 60);
    rm = rm < 10 ? '0'+rm : rm;
    var rh = Math.floor(h % 60);
    rh = rh < 10 ? '0'+rh : rh;
    return rh+":"+rm+":"+rs+"."+rms;
  };
  return {
    gogogo: function() {
      onInit();
    }
  };
})();

window.addEventListener('load', ktk.ttock.gogogo);
