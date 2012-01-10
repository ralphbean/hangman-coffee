class Util
    message: (msg, callback) =>
        $("#messages").prepend(msg + "<br/>")
        callback() if callback

    input: (msg, callback, status) =>
        $("#prompt-label").html(msg) if msg
        $("#prompt-status").html(status) if status
        $("#prompt-input").unbind()
        $("#prompt-input").keyup((event) ->
            if event.keyCode is 13
                val = $(this).val()
                $(this).val('')
                callback(val)
        )

class Gallows
    constructor: ->
        @canvas = document.getElementById('canvas')
        @c = @canvas.getContext('2d')
        @spritesheet = new Image()
        @spritesheet.src = 'images/original.png'
        @image_dims = {width: 364, height: 603}
        @lookup = {
            'head': {
                offsetX: 163,
                offsetY: 40,
                width: 70,
                height: 75,
            },
            'body': {
                offsetX: 125,
                offsetY: 40,
                width: 148,
                height: 200,
            },
            'left_arm': {
                offsetX: 30,
                offsetY: 40,
                width: 95,
                height: 300,
            },
            'right_arm': {
                offsetX: 273,
                offsetY: 40,
                width: 95,
                height: 300,
            },
            'right_leg': {
                offsetX: 200,
                offsetY: 240,
                width: 120,
                height: 375,
            },
            'left_leg': {
                offsetX: 0,
                offsetY: 240,
                width: 200,
                height: 375,
            },
        }

    
    render_part: (part) =>
        @c.drawImage(
            @spritesheet,
            @lookup[part].offsetX,
            @lookup[part].offsetY,
            @lookup[part].width,
            @lookup[part].height,
            @lookup[part].offsetX / @image_dims.width * @canvas.width,
            @lookup[part].offsetY / @image_dims.height * @canvas.height,
            @lookup[part].width / @image_dims.width * @canvas.width,
            @lookup[part].height / @image_dims.height * @canvas.height,
        )

    render: (guessed_letters, secret, points) =>
        @c.fillStyle = '#FFFFFF'
        @c.fillRect(0, 0, @canvas.width, @canvas.height)

        @render_part('body') if points < 5
        @render_part('head') if points < 6
        @render_part('left_arm') if points < 4
        @render_part('right_arm') if points < 3
        @render_part('right_leg') if points < 2
        @render_part('left_leg') if points < 1

class Game
    constructor: (@secret) ->
        @guessed_letters = []
        @points_left = 6
        @u = new Util
        @u.message('---------')
        @gallows = new Gallows
        @gallows.render(@guessed_letters, @secret, @points_left)

    deal_with_guess: (guess) =>
        return @u.message("You already guessed that!", @play) if guess in @guessed_letters
        return @u.message("You didn't input anything!", @play) if guess.length < 1
        return @u.message("You can only guess one letter at a time!", @play) if guess.length > 1

        @guessed_letters.push(guess)
        return @u.message("Great!", @play) if guess in @secret

        @points_left--
        return @u.message("Fail!", @play)

    is_over: () =>
        if @points_left < 0
            @u.message('---------')
            @u.message("You lost!", init)
            return true

        for letter in @secret
            if letter not in @guessed_letters
                return false

        @u.message('---------')
        @u.message("You won!", init)
        return true

    play: () =>
        # Check if the game is over
        if @is_over()
            return

        # Show the state of the game
        @gallows.render(@guessed_letters, @secret, @points_left)

        # Take a guess
        status = "(" + @guessed_letters.join(', ') + ")"
        msg = "  Guess a letter:"
        @u.input(msg, @deal_with_guess, status)


init = () =>
    u = new Util

    # Set up a callback for handling the secret word
    start_game_with = (secret) =>
        u.message("The secret word is: " + ('*' for char in secret).join(''))

        # Build a game and play it
        game = new Game(secret)
        game.play()

    # Employ that callback
    u.input("Secret word:", start_game_with)

$(document).ready(init)
