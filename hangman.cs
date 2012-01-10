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
    render: (guessed_letters, secret) =>
        console.log(guessed_letters)

class Game
    constructor: (@secret) ->
        @guessed_letters = []
        @points_left = 6
        @u = new Util
        @gallows = new Gallows

    deal_with_guess: (guess) =>
        return @u.message("No input.", @play) if guess.length < 1
        return @u.message("Only one character!", @play) if guess.length > 1

        @guessed_letters.push(guess)
        return @u.message("Great!", @play) if guess in @secret

        @points_left--
        return @u.message("Fail!", @play)

    is_over: () =>
        if @points_left < 0
            @u.message("You lost!", init)
            return true

        for letter in @secret
            if letter not in @guessed_letters
                return false

        @u.message("You won!", init)
        return true

    play: () =>
        # Check if the game is over
        if @is_over()
            return

        # Show the state of the game
        @gallows.render(@guessed_letters, @secret)

        # Take a guess
        status = "(Guessed so far: " + @guessed_letters.join(', ') + ")"
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
