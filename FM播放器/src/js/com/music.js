define(['jquery','com/footer'],function($,Footer,center){
	var footer = new Footer()

	function music(){
		this.music = new Audio()
		this.music.autoplay = true
		this.init()
	}

	music.prototype.init = function(){
		this.$container = $('#page-music')
		this.lock = false
		this.loadMusic()
		this.bind()
	}

	music.prototype.bind = function(){
		var _this = this
		this.$bar = this.$container.find('.bar')

		footer.EventCenter.on('select-albumn', function(e, channelObj){
      _this.channelId = channelObj.channelId
      _this.channelName = channelObj.channelName
      _this.loadMusic()
    })

		this.$container.find('.btn-play').on('click',function(e){
			if($(this).hasClass('icon-pause')){
				_this.music.pause()
			}else{
				_this.music.play()
			}
			$(this).toggleClass('icon-pause')
			$(this).toggleClass('icon-play')
		})

		this.$container.find('.btn-next').on('click',function(){
			if(!_this.lock)
				_this.loadMusic()
		})

		$(this.music).on('play',function(){
			clearInterval(_this.statusClock)
			_this.statusClock = setInterval(function(){
				_this.updateStatus()
			},1000)
		})

		$(this.music).on('pause',function(){
			clearInterval(_this.statusClock)
		})

		$(this.music).on('ended',function(){
			_this.loadMusic()
		})

		this.$container.find('.bar').on('click',function(e){
			var x = e.pageX - _this.$bar.offset().left
			if(x < 0){
				x =0
			}
			var percent = x / _this.$bar.width()
			_this.music.currentTime = percent * _this.music.duration
		})
	}

	music.prototype.loadMusic = function(){
		var _this = this
		this.lock = true
		$.getJSON('https://jirenguapi.applinzi.com/fm/getSong.php',{channel: this.channelId})
			.done(function(ret){
				_this.song = ret.song[0]
				console.log(_this.song)
				_this.setMusic()
				_this.loadLyric()
				_this.lock = false
				if(!ret.song[0].url){
					_this.loadMusic()
				}
			})
			.fail(function(){
				alert('error')
			})

	}

	music.prototype.setMusic = function(){
		this.music.src = this.song.url
	  $('.bg').css('background-image','url(' + this.song.picture +')')
		this.$container.find('figure').css('background-image','url(' + this.song.picture +')')
		this.$container.find('h1').text(this.song.title)
		this.$container.find('.author').text(this.song.artist)
		this.$container.find('.tag').text(this.channelName)
		this.$container.find('.btn-play').removeClass('icon-play').addClass('icon-pause')

	}

	music.prototype.loadLyric = function(){
		var _this = this
		this.$container.find('.lyric p').text(' ')
		$.getJSON('https://jirenguapi.applinzi.com/fm/getLyric.php',{sid: this.song.sid})
			.done(function(ret){
				console.log(ret.lyric)
				var lyric = ret.lyric,
						lyricObj = {};
				lyric.split('\n').forEach(function(line){
					var times = line.match(/\d{2}:\d{2}/g)
					var str = line.replace(/\[.+?\]/g,'')
					if(Array.isArray(times)){
						times.forEach(function(time){
							lyricObj[time] = str
						})
					}
				})
				_this.lyricObj = lyricObj
				console.log(_this.lyricObj)
			})
	}

	music.prototype.updateStatus = function(){
		var currentTime = this.music.currentTime,
				duration = this.music.duration,
				percent = currentTime / duration,
				minute = '0' + Math.floor(currentTime / 60),
				second = Math.round(currentTime % 60) + '',
				second = second.length === 2 ? second : '0' + second

		this.$container.find('.bar-progress').css({
			width: percent*100 + '%'
		})
		this.$container.find('.current-time').text(minute +':'+ second)
		if(this.lyricObj)
		var line = this.lyricObj[minute+':' + second]
		if(line){
			this.$container.find('.lyric p').text(line).boomText()
		}

	}

	$.fn.boomText = function(){
		/*
		this.html(function(){
			var str = $(this).text()
			return '<span class="boomText">' + str +'</span>'
		})
		$('.boomText').addClass('animated rotateIn')
	*/
		this.html(function(){
			var arr = $(this).text().split('').map(function(word){
				return '<span class="boomText">' + word +'</span>'
			})
			return arr.join('')
		})

		var index = 0
		var $boomTexts = $(this).find('span')
		var clock = setInterval(function(){
			$boomTexts.eq(index).addClass('animated ' + 'rollIn')
			index++
			if(index >=$boomTexts.length){
				clearInterval(clock)
			}
		},100)
	}

	return music;
})