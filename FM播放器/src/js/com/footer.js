define(['jquery'],function($){
  function footer(){
    this.init()
    this.EventCenter = {
      on: function(type, handler){
        $(document).on(type, handler)
      },
      fire: function(type, data){
        $(document).trigger(type, data)
      }
    }
  }

  footer.prototype.init = function(){
    this.$ul = $('footer .box ul')
    this.$box = $('footer .box')
    this.$rightBtn = $('footer .layout .icon-right')
    this.$leftBtn = $('footer .layout .icon-left')
    this.isToEnd = false
    this.isToStart = true
    this.isAnimate = false
    this.index = 0
    this.bind()
    this.render()
  }

  footer.prototype.bind = function(){
    var _this = this
    var itemWidth = this.$ul.find('li').outerWidth(true)
    var rowCount = parseFloat(this.$box.width() / itemWidth)
    this.$rightBtn.on('click',function(){
      if(!_this.isAnimate){
        if(!_this.isToEnd){
          _this.isAnimate = true
          _this.$ul.animate({
            left: '-=' + rowCount*itemWidth
          },function(){
            _this.isToStart = false
            _this.isAnimate = false
            if((parseFloat(_this.$ul.width()) + parseFloat(_this.$ul.css('left'))) <= parseFloat(_this.$box.width()) ){
              _this.isToEnd = true
            }
          })
        }
      }
    })

    this.$leftBtn.on('click',function(){
      if(!_this.isAnimate){
        if(!_this.isToStart){
          _this.isAnimate = true
          _this.$ul.animate({
            left: '+=' + rowCount*itemWidth
          },function(){
            _this.isAnimate = false
            _this.isToEnd = false
            if(Math.abs(parseFloat(_this.$ul.css('left'))) >= 0 && Math.abs(parseFloat(_this.$ul.css('left'))) < 1 ){
              _this.isToStart = true
            }
          })
        }
      }
    })

    this.$ul.on('click','li',function(e){
      _this.index = _this.$ul.find('li').index(this)
      $(this).addClass('active').siblings().removeClass('active')
      $('.bg').css('background-image','url(' + _this.channels[_this.index].cover_big +')')
      _this.EventCenter.fire('select-albumn', {
        channelId: $(this).attr('data-channel-id'),
        channelName: $(this).attr('data-channel-name')
      })
    })
  }

  footer.prototype.render = function(){
    var _this = this
    $.getJSON('https://jirenguapi.applinzi.com/fm/getChannels.php')
      .done(function(ret){
        _this.channels = ret.channels
        _this.renderFooter(ret.channels)
      }).fail(function(){
        console.log('error')
      })
  }

  footer.prototype.renderFooter = function(channels){
    var html = ''
    channels.forEach(function(channel){
      return html += '<li data-channel-id="' + channel.channel_id +'" data-channel-name="'+channel.name+'">'
                   +'<div class="cover" style="background-image: url(' + channel.cover_small + '")>'+'</div>'
                   +'<h3>' + channel.name + '</h3>'
                   +'</li>'
    })
    this.$ul.html(html)
    this.setStyle()
  }

  footer.prototype.setStyle = function(){
    var count = this.$ul.find("li").length
    var width = this.$ul.find('li').outerWidth(true)
    this.$ul.css({
      width: width*count
    })
  }

  return footer;

})