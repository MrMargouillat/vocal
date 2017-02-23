$(document).ready(() => {

    var $player = $('.js-audio-player'),
        $playbackClass = 'is-playing',
        $fadeDuration = 500

    $player.each(function(index) {
        var $this = $(this),
            id = 'audio-player-' + index

        $this.attr('id', id)

        $this.find('.js-control')[0].addEventListener('click', function() {
            resetPlayback(id)
            playback($this, $this.find('audio'))
        })

        // Reset state once audio has finished playing
        $this.find('audio')[0].addEventListener('ended', function() {
            resetPlayback()
        })
    })

    function playback($player, $audio) {
        if ($audio[0].paused) {
            $audio[0].play()
                // $video[0].play()
            $audio.animate({
                volume: 1
            }, $fadeDuration)
            $player.addClass($playbackClass)
        } else {
            $audio.animate({
                volume: 0
            }, $fadeDuration, function() {
                $audio[0].pause()
                    // $video[0].pause()
            })
            $player.removeClass($playbackClass)
        }
    }

    function resetPlayback(id) {
        $player.each(function() {
            var $this = $(this)

            if ($this.attr('id') !== id) {
                var t = $this.find('audio')
                console.log(t);
                t.animate({
                    volume: 0
                }, $fadeDuration, function() {
                    $(this)[0].pause()
                        // $this.find('video')[0].pause()
                })
                $this.removeClass($playbackClass)
            }
        })
    }
});