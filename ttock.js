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
  var ele_favicon = null;
  var ele_speed_input = null;
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
  var frame_fast  = 1;
  var frame_slow  = 100;
  var frame_time  = frame_fast;
  var press_time  = 0;
  var key_held    = false;          // 'spacebar' held boolean
  var use_hpt     = (typeof performance !== 'undefined');
  // FIXME: forcible disable hpt on mobile. should use 'pageshow' and 'pagehide' to change the type of timer used.
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
    use_hpt       = false;
  }
  // audio
  var audio_ctx;
  if (window.AudioContext || window.webkitAudioContext) {
    audio_ctx = new window.AudioContext || window.webkitAudioContext;
  }
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
    ele_favicon = document.getElementById('favicon');
    ele_speed_input = document.getElementById('ctl_speed_input');
    // Use old-style event creation for backward support
    setTimer(document.createEvent('Event'));
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
    ele_timer_input_h.addEventListener('keyup', checkFocus, false);
    ele_timer_input_m.addEventListener('keyup', checkFocus, false);
    ele_timer_input_s.addEventListener('keyup', checkFocus, false);
    ele_timer_input_ms.addEventListener('keyup', checkFocus, false);
    ele_speed_input.addEventListener('change', function(e) {
      toggleSlow(e.target.checked)
    }, false);
    updateTitle();
  };
  function onStop() {
    total_time += (last_time - start_time);
    pause_start = start_time = last_time = 0;
    var time = formatTime(convertTime(0));
    ele_timer_text.innerText = time.h+':'+time.m+':'+time.s+'.'+time.ms;
    ele_timer.style.boxShadow = "0 0 0vmin #0080FF";
    updateColor();
    updateTitle();
    if (is_paused) return;
    clearInterval(timer);
    timer = null;
    is_paused = true;
  };
  function onToggle() {
    if (is_paused) {
      start_time -= pause_start - getTime();
      timer = setInterval(onTick, frame_time);
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
    if (audio_ctx) {
      var oscillator = audio_ctx.createOscillator();
      oscillator.type = "triangle";
      oscillator.connect(audio_ctx.destination);
      oscillator.start(audio_ctx.currentTime);
      oscillator.stop(audio_ctx.currentTime + 0.250);
    }
  };
  function onTick() {
    if (is_paused) return;
    last_time = getTime();
    var elapsed = ((last_time - start_time));
    var time = formatTime(convertTime(elapsed));
    ele_timer_text.innerText = time.h+':'+time.m+':'+time.s+'.'+time.ms;
    var time_total = formatTime(convertTime(total_time+elapsed));
    ele_timer_total.innerText = time_total.h+':'+time_total.m+':'+time_total.s+'.'+time_total.ms;
    if (elapsed >= target_time) {
      if (!has_played) onDing();
      ele_timer.style.boxShadow = "0 0 4vmin #0080FF";
      ele_favicon.href = 'alarm.ico';
    } else {
      ele_favicon.href = 'ttock.ico';
    }
    updateColor();
    updateTitle();
  };
  function updateColor() {
    var delta = ((last_time - start_time));
    var ratio = Math.min(delta / target_time, 1.0);
    var r = Math.floor(200 * ratio);
    var g = Math.floor(25 * ratio);
    var b = Math.floor(200 * ratio);
    ele_timer.style.backgroundColor = 'rgb('+r+','+g+','+b+')';
  };
  function updateTitle() {
    var elapsed = last_time - start_time;
    var t_elapsed = convertTime(elapsed);
    var t_target = convertTime(target_time);
    var elapsed_str = (t_elapsed.h ? t_elapsed.h+'h' : '') + (t_elapsed.m ? t_elapsed.m+'m' : '') + (t_elapsed.s ? t_elapsed.s+'s' : t_target.s ? t_elapsed.s+'s' : '');
    var target_str = (t_target.h ? t_target.h+'h' : '') + (t_target.m ? t_target.m+'m' : '') + (t_target.s ? t_target.s+'s' : '');
    document.title = elapsed_str + '/' + target_str + ' - ttock';
  };
  function getTime() {
    if (use_hpt) {
      return performance.now();
    } else { 
      return new Date();
    }
  };
  function setTimer(evt) {
    evt.preventDefault();
    target_time = Number(ele_timer_input_h.value*60*60*1000) + Number(ele_timer_input_m.value*60*1000) + Number(ele_timer_input_s.value*1000) + Number(ele_timer_input_ms.value);
    if (target_time > (last_time - start_time)) {
      has_played = false;
      ele_timer.style.boxShadow = "0 0 0vmin #0080FF";
    }
    updateTitle();
    return false;
  };
  function checkFocus(evt) {
    if (evt.which === 13) evt.target.blur();
  }
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
    } else if (evt.which == 83) { // 's' = slow mode
      toggleSlow(frame_time == frame_fast ? true : false)
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
      var time = formatTime(convertTime(0));
      ele_timer_total.innerText = time.h+':'+time.m+':'+time.s+'.'+time.ms;
      onStop();
      has_played = false;
    } else if (delta > 200) {
      onStop();
      has_played = false;
      var time = formatTime(convertTime(total_time));
      ele_timer_total.innerText = time.h+':'+time.m+':'+time.s+'.'+time.ms;
    } else {
      onToggle();
    }
  };
  function toggleSlow(bool) {
    if (bool) {
      frame_time = frame_slow;
    } else {
      frame_time = frame_fast;
    }
    if (timer) {
      clearInterval(timer);
      timer = setInterval(onTick, frame_time);
    }
    ele_speed_input.checked = bool;
  }
  function convertTime(ms) {
    var s = ms/1000;
    var m = s/60;
    var h = m/60;
    var rms = Math.floor(ms % 1000);
    var rs = Math.floor(s % 60);
    var rm = Math.floor(m % 60);
    var rh = Math.floor(h % 60);
    return {h: rh, m: rm, s: rs, ms: rms};
  };
  function formatTime(time) {
    time.ms = time.ms < 100 ? time.ms < 10 ? '00'+time.ms : '0'+time.ms : time.ms;
    time.s = time.s < 10 ? '0'+time.s : time.s;
    time.m = time.m < 10 ? '0'+time.m : time.m;
    time.h = time.h < 10 ? '0'+time.h : time.h;
    return time;
  };
  return {
    gogogo: function() {
      onInit();
    }
  };
})();

window.addEventListener('load', ktk.ttock.gogogo);
