class Util
    message: (msg, callback) =>
        $("body").append("<div id='message-dialog'>" + msg + "</div>")
        $("#message-dialog").dialog({
            autoOpen: true,
            buttons: { "Okay": () =>
                $("#message-dialog").dialog("destroy")
                $("#message-dialog").remove()
                callback()
            }
        })

    input: (msg, callback) =>
        $("body").append("
            <div id='input-dialog'>" + msg + "
                <input id='input'></input>
            </div>")
        $("#input-dialog").dialog({
            autoOpen: true,
            buttons: { "Okay": () =>
                val = $("#input").val()
                $("#input-dialog").dialog("destroy")
                $("#input-dialog").remove()
                callback(val)
            }
        })

class Game
    constructor: (@secret) ->
        @guessed_letters = []
        @points_left = 6
        @u = new Util

    vanna_white: () =>
        console.log(@secret)

    deal_with_guess: (guess) =>
        return @u.message("No input.", @play) if guess.length < 1
        return @u.message("One character!", @play) if guess.length > 1

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
        @vanna_white()

        # Take a guess
        msg = "Guess a letter.  " + @guessed_letters.join(', ')
        @u.input(msg, @deal_with_guess)


init = () =>
    # Set up a callback for handling the secret word
    start_game_with = (secret) =>
        # Build a game and play it
        game = new Game(secret)
        game.play()

    # Employ that callback
    u = new Util
    u.input("Secret word:", start_game_with)

$(document).ready(init)
