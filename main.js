let time = {};
let result = {};
let addition = {};
let start_time = 0;
let answers = [];
let is_paused = false;
let game_timeout;

/**
 * @return {object}
 */
let get_new_time = () => {
  return parse_time({
    'minutes': Math.floor(Math.random() * 7),
    'seconds': round_seconds(Math.floor(Math.random() * 60))
  });
}

/**
 * @param  {object} time
 * @param  {object} addition
 * @return {object}
 */
let get_result = (time, addition) => {
  let result = parse_time({
    'minutes': time.minutes + addition.minutes,
    'seconds': time.seconds + addition.seconds
  });

  return result;
}

/**
 * @param  {object} time
 * @return {object}
 */
let parse_time = (time) => {
  if (time.seconds >= 60) {
    time = {
      'minutes': time.minutes + 1,
      'seconds': time.seconds - 60
    };
  }

  return time;
}

/**
 * @param  {object} time
 * @return {string}
 */
let format_time = (time) => {
  if (time.seconds < 10) {
    return time.minutes + ':0' + time.seconds;
  }

  return time.minutes + ':' + time.seconds;
}

/**
 * @param  {string} input
 * @return {object}
 */
let parse_input_value = (input) => {
  let seconds = parseInt(input.substr(-2));
  let minutes = input.length < 3 ? 0 : parseInt(input.substr(0, 1));

  let input_time = {
    'minutes': input.length < 3 ? 0 : parseInt(input.substr(0, 1)),
    'seconds': parseInt(input.substr(-2))
  };

  if (document.getElementById('ignore-minutes').checked) {
    input_time.minutes = result.minutes;
  }

  return parse_time(input_time);
}

/**
 * @return {integer}
 */
let get_avg_reaction_time = () => {
  let avg_reaction_time = 0;

  for (let i = 0; i < answers.length; i++) {
    avg_reaction_time += answers[i].reaction_time;
  }

  return answers.length ? Math.round(avg_reaction_time / answers.length) : 0;
}

/**
 * @param  {integer} seconds
 * @return {integer}
 */
let round_seconds = (seconds) => {
  if (document.getElementById('round-seconds').checked) {
    return Math.ceil(seconds / 5) * 5;
  }

  return seconds;
}

/**
 * @param {object} answer [description]
 */
let update_statistics = (answer) => {
  answers.push(answer);

  document.getElementById('avg-reaction-time').innerHTML = get_avg_reaction_time() + 'ms';
  document.getElementById('count').innerHTML = answers.length;

  let correct_count = 0;

  for (var i = 0; i < answers.length; i++) {
    if (answers[i].correct) {
      document.getElementById('correct-count').innerHTML = ++correct_count;
    }
  }

  let calculation_string = format_time(answer.time) + ' + ' + format_time(answer.addition) + ' = ' + format_time(answer.result);
  let result_text = '';

  if (answer.correct) {
    result_text = '<span class="correct">Correct! Calculation: ' + calculation_string + ', Your answer: ' + format_time(answer.input) + ', Time: ' + answer.reaction_time + 'ms</span>';
  } else {
    result_text = '<span class="wrong">Wrong! Calculation: ' + calculation_string + ', Your answer: ' + format_time(answer.input) + ', Time: ' + answer.reaction_time + 'ms</span>';
  }

  document.getElementById('result-text').innerHTML = result_text;
  document.getElementById('list').insertAdjacentHTML('afterbegin', '<li>' + result_text + '</li>');
}

/**
 * Init
 */
let init = () => {
  start_time = 0;
  answers = [];
  pause();

  document.getElementById('input-form').addEventListener('submit', (e) => {
    e.preventDefault();
    let input = parse_input_value(document.getElementById('tyit-input').value);

    let answer = {
      'reaction_time': Date.now() - start_time,
      'correct': (input.seconds == result.seconds && input.minutes == result.minutes),
      'time': time,
      'addition': addition,
      'result': result,
      'input': input
    }

    update_statistics(answer);
    new_game();
  });

  document.getElementById('pause-button').addEventListener('click', (e) => {
    e.preventDefault();
    toggle_pause();
  });

  let allow_space_key = true;

  /**
   * Capture space
   */
  window.addEventListener('keydown', (e) => {
    let _e = e || window.event;
    let key = _e.which || _e.keyCode || 0;

    if (key == 32) { // 32 = space
      e.preventDefault();
      if (allow_space_key) {
        allow_space_key = false;
        toggle_pause();
      }
    }
  });

  /**
   * Prevent space keyup
   */
  window.addEventListener('keyup', (e) => {
    let _e = e || window.event;
    let key = _e.which || _e.keyCode || 0;

    if (key == 32) { // 32 = space
      e.preventDefault();
      allow_space_key = true;
    }
  });
}

/**
 * Toggle pause
 */
let toggle_pause = () => {
  if (is_paused) {
    unpause();
  } else {
    pause();
  }
}

/**
 * Pause
 */
let pause = () => {
  is_paused = true;
  clearTimeout(game_timeout);
  document.getElementById('pause-button').focus();
  document.getElementById('pause-button').innerHTML = '<i class="fa fa-play"></i> Unpause';
  document.getElementById('time').innerHTML = 'paused';
  document.getElementById('time-addition').innerHTML = '';
  document.getElementById('tyit-input').disabled = true;
  document.getElementById('input-button').disabled = true;
}

/**
 * Unpause
 */
let unpause = () => {
  is_paused = false;
  document.getElementById('pause-button').innerHTML = '<i class="fa fa-pause"></i> Pause';
  document.getElementById('time').innerHTML = '';
  document.getElementById('tyit-input').disabled = false;
  document.getElementById('input-button').disabled = false;
  new_game();
}

/**
 * Start a new game
 */
let new_game = () => {
  if (!is_paused) {
    document.getElementById('time').innerHTML = 'wait...';
    document.getElementById('time-addition').innerHTML = '';
    time = {};
    result = {};
    addition = {};

    let input_field = document.getElementById('tyit-input');
    input_field.focus();
    input_field.setSelectionRange(0, input_field.value.length);
    document.getElementById('input-button').disabled = true;

    game_timeout = setTimeout(() => {
      let add_seconds = [];
      let add_seconds_string = document.getElementById('seconds-to-add').value.split(',');
      document.getElementById('input-button').disabled = false;

      for (var i = 0; i < add_seconds_string.length; i++) {
        let new_add_seconds = parseInt(add_seconds_string[i]);
        if (new_add_seconds && !isNaN(new_add_seconds) && new_add_seconds > 0) {
          add_seconds.push(new_add_seconds);
        }
      }

      add_seconds = add_seconds.length ? add_seconds : [25, 35];

      addition = {
        'minutes': 0,
        'seconds': round_seconds(add_seconds[Math.floor(Math.random() * add_seconds.length)])
      };

      time = get_new_time();
      result = get_result(time, addition);

      document.getElementById('time').innerHTML = format_time(time);
      document.getElementById('time-addition').innerHTML = '+' + addition.seconds + 's';
      start_time = Date.now();
    }, parseInt(document.getElementById('ms-between').value));
  }
}

init();
