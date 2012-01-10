(function() {
  var Gallows, Game, Util, init,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    _this = this;

  Util = (function() {

    function Util() {
      this.input = __bind(this.input, this);
      this.redraw = __bind(this.redraw, this);
      this.message = __bind(this.message, this);
    }

    /*
        Utilities for IO
    */

    Util.prototype.message = function(msg, callback) {
      $("#messages").prepend(msg + "<br/>");
      if (callback) return callback();
    };

    Util.prototype.redraw = function(status) {
      if (status) return $("#prompt-status").html(status);
    };

    Util.prototype.input = function(msg, callback) {
      if (msg) $("#prompt-label").html(msg);
      $("#prompt-input").unbind();
      return $("#prompt-input").keyup(function(event) {
        var val;
        if (event.keyCode === 13) {
          val = $(this).val();
          $(this).val('');
          return callback(val);
        }
      });
    };

    return Util;

  })();

  Gallows = (function() {
    /*
        Drawing the hangman on the gallows
    */
    function Gallows() {
      this.render = __bind(this.render, this);
      this.render_part = __bind(this.render_part, this);      this.canvas = document.getElementById('canvas');
      this.c = this.canvas.getContext('2d');
      this.spritesheet = new Image();
      this.spritesheet.src = 'images/original.png';
      this.image_dims = {
        width: 364,
        height: 603
      };
      this.lookup = {
        'head': {
          offsetX: 163,
          offsetY: 40,
          width: 70,
          height: 75
        },
        'body': {
          offsetX: 125,
          offsetY: 40,
          width: 148,
          height: 200
        },
        'left_arm': {
          offsetX: 30,
          offsetY: 40,
          width: 95,
          height: 300
        },
        'right_arm': {
          offsetX: 273,
          offsetY: 40,
          width: 90,
          height: 300
        },
        'right_leg': {
          offsetX: 200,
          offsetY: 240,
          width: 100,
          height: 330
        },
        'left_leg': {
          offsetX: 0,
          offsetY: 240,
          width: 200,
          height: 330
        }
      };
    }

    Gallows.prototype.render_part = function(part) {
      console.log("drawing part:" + part);
      return this.c.drawImage(this.spritesheet, this.lookup[part].offsetX, this.lookup[part].offsetY, this.lookup[part].width, this.lookup[part].height, this.lookup[part].offsetX / this.image_dims.width * this.canvas.width, this.lookup[part].offsetY / this.image_dims.height * this.canvas.height, this.lookup[part].width / this.image_dims.width * this.canvas.width, this.lookup[part].height / this.image_dims.height * this.canvas.height);
    };

    Gallows.prototype.render = function(guessed_letters, secret, points) {
      this.c.fillStyle = '#FFFFFF';
      this.c.fillRect(0, 0, this.canvas.width, this.canvas.height);
      if (points < 5) this.render_part('body');
      if (points < 6) this.render_part('head');
      if (points < 4) this.render_part('left_arm');
      if (points < 3) this.render_part('right_arm');
      if (points < 2) this.render_part('right_leg');
      if (points < 1) return this.render_part('left_leg');
    };

    return Gallows;

  })();

  Game = (function() {
    /*
        All the game logic
    */
    function Game(secret) {
      this.secret = secret;
      this.play = __bind(this.play, this);
      this.is_over = __bind(this.is_over, this);
      this.deal_with_guess = __bind(this.deal_with_guess, this);
      this.reveal_letters = __bind(this.reveal_letters, this);
      this.secret = this.secret.toLowerCase();
      this.guessed_letters = [];
      this.points_left = 6;
      this.u = new Util;
      this.u.message('---------');
      this.gallows = new Gallows;
      this.gallows.render(this.guessed_letters, this.secret, this.points_left);
    }

    Game.prototype.reveal_letters = function() {
      var choose, letter,
        _this = this;
      choose = function(letter) {
        if (__indexOf.call(_this.guessed_letters, letter) >= 0) {
          return letter;
        } else {
          return '*';
        }
      };
      return ((function() {
        var _i, _len, _ref, _results;
        _ref = this.secret;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          letter = _ref[_i];
          _results.push(choose(letter));
        }
        return _results;
      }).call(this)).join('');
    };

    Game.prototype.deal_with_guess = function(guess) {
      guess = guess.toLowerCase();
      if (__indexOf.call(this.guessed_letters, guess) >= 0) {
        return this.u.message("You already guessed that!", this.play);
      }
      if (guess.length < 1) {
        return this.u.message("You didn't input anything!", this.play);
      }
      if (guess.length > 1) {
        return this.u.message("You can only guess one letter at a time!", this.play);
      }
      this.guessed_letters.push(guess);
      if (__indexOf.call(this.secret, guess) >= 0) {
        return this.u.message("Great!", this.play);
      }
      this.points_left--;
      return this.u.message("Fail!", this.play);
    };

    Game.prototype.is_over = function() {
      var audio, letter, _i, _len, _ref;
      if (this.points_left <= 0) {
        audio = new Audio();
        audio.src = "audio/sad-trombone.wav";
        audio.play();
        this.u.message('---------');
        this.u.message("You lost!", init);
        return true;
      }
      _ref = this.secret;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        letter = _ref[_i];
        if (__indexOf.call(this.guessed_letters, letter) < 0) return false;
      }
      audio = new Audio();
      audio.src = "audio/Firework-Public_d-182.wav";
      audio.play();
      this.u.message('---------');
      this.u.message("You won!", init);
      return true;
    };

    Game.prototype.play = function() {
      var msg, status;
      this.gallows.render(this.guessed_letters, this.secret, this.points_left);
      status = this.reveal_letters() + " (" + this.guessed_letters.join(',') + ")";
      this.u.redraw(status);
      if (this.is_over()) return;
      msg = "  Guess a letter:";
      return this.u.input(msg, this.deal_with_guess);
    };

    return Game;

  })();

  init = function() {
    var start_game_with, u;
    u = new Util;
    start_game_with = function(secret) {
      var char, game;
      u.message("The secret word is: " + ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = secret.length; _i < _len; _i++) {
          char = secret[_i];
          _results.push('*');
        }
        return _results;
      })()).join(''));
      game = new Game(secret);
      return game.play();
    };
    return u.input("Secret word:", start_game_with);
  };

  $(document).ready(init);

}).call(this);
