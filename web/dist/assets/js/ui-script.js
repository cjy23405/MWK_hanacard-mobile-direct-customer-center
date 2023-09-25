(function ($) {
  var userAgent = navigator.userAgent;
  var userAgentCheck = {
    ieMode: document.documentMode,
    isIos: Boolean(userAgent.match(/iPod|iPhone|iPad/)),
    isAndroid: Boolean(userAgent.match(/Android/)),
  };
  if (userAgent.match(/Edge/gi)) {
    userAgentCheck.ieMode = 'edge';
  }
  userAgentCheck.androidVersion = (function () {
    if (userAgentCheck.isAndroid) {
      try {
        var match = userAgent.match(/Android ([0-9]+\.[0-9]+(\.[0-9]+)*)/);
        return match[1];
      } catch (e) {
        console.log(e);
      }
    }
  })();

  // min 포함 max 불포함 랜덤 정수
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  // 랜덤 문자열
  var hashCodes = [];
  function uiGetHashCode(length) {
    var string = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    var stringLength = string.length;

    length = typeof length === 'number' && length > 0 ? length : 10;

    function getCode(length) {
      var code = '';
      for (var i = 0; i < length; i++) {
        code += string[getRandomInt(0, stringLength)];
      }
      if (hashCodes.indexOf(code) > -1) {
        code = getCode(length);
      }
      return code;
    }

    result = getCode(length);
    hashCodes.push(result);

    return result;
  }

  // common
  var $win = $(window);
  var $doc = $(document);

  // swiperSet
  // https://github.com/nolimits4web/swiper/blob/Swiper5/API.md
  $.fn.swiperSet = function (customOption) {
    var defaultOption = {
      customClass: null,
      appendController: null,
      pageControl: false,
      nextControl: false,
      prevControl: false,
      scrollbarControl: false,
      playControl: false,
      pauseControl: false,
    };

    this.each(function () {
      var option = $.extend({}, defaultOption, customOption);
      var $this = $(this);

      if ($this.data('swiper') || !$.isFunction(window.Swiper)) return;

      var $items = $this.children();

      if (!$this.parent('.swiper-container').length) {
        $this.wrap('<div class="swiper-object"><div class="swiper-container"></div></div>');
      }
      $this.addClass('swiper-wrapper');
      $items.addClass('swiper-slide').each(function (i) {
        $(this).attr('data-swiper-set-slide-index', i);
      });

      var $container = $this.parent('.swiper-container');
      var $wrap = $container.parent('.swiper-object');
      var $appendController = $wrap;
      var length = $items.length;

      if (typeof option.customClass === 'string') {
        $wrap.addClass(option.customClass);
      }

      option.pagination = option.pagination || {};
      option.navigation = option.navigation || {};
      option.scrollbar = option.scrollbar || {};

      option.autoplay = length > 1 && option.autoplay ? option.autoplay : false;
      option.loop = length > 1 && option.loop ? option.loop : false;

      if (option.appendController) {
        $appendController = $(option.appendController);
      }

      if (length === 1) {
        $wrap.addClass('swiper-object-once');
      } else if (length <= 0) {
        $wrap.addClass('swiper-object-empty');
      }

      if (option.pageControl) {
        $appendController.append('<div class="swiper-pagination"></div>');
        option.pagination.el = $appendController.find('.swiper-pagination').get(0);
      }
      if (option.nextControl) {
        $appendController.append('<button type="button" class="swiper-button-next"><span class="swiper-button-next-text">next</span></button>');
        option.navigation.nextEl = $appendController.find('.swiper-button-next').get(0);
      }
      if (option.prevControl) {
        $appendController.append('<button type="button" class="swiper-button-prev"><span class="swiper-button-prev-text">prev</span></button>');
        option.navigation.prevEl = $appendController.find('.swiper-button-prev').get(0);
      }
      if (option.scrollbarControl) {
        $appendController.append('<div class="swiper-scrollbar"></div>');
        option.scrollbar.el = $appendController.find('.swiper-scrollbar').get(0);
      }
      if (option.playControl) {
        $appendController.append('<button type="button" class="swiper-button-play"><span class="swiper-button-play-text">play</span></button>');
        option.playButton = $appendController.find('.swiper-button-play').get(0);
      }
      if (option.pauseControl) {
        $appendController.append('<button type="button" class="swiper-button-pause"><span class="swiper-button-pause-text">pause</span></button>');
        option.pauseButton = $appendController.find('.swiper-button-pause').get(0);
      }
      if (option.autoplay && option.playControl) {
        $(option.playButton).addClass('active');
      } else if (!option.autoplay && option.pauseControl) {
        $(option.pauseButton).addClass('active');
      }

      if ($.isFunction(window.Swiper)) {
        var swiper = new Swiper($container.get(0), option);
        $this.data('swiper', swiper);

        if (option.playControl) {
          $(option.playButton).on('click.swiperSet', function () {
            swiper.autoplay.start();
          });
        }
        if (option.pauseControl) {
          $(option.pauseButton).on('click.swiperSet', function () {
            swiper.autoplay.stop();
          });
        }
        swiper.on('autoplayStart', function () {
          if (option.playControl) {
            $(option.playButton).addClass('active');
          }
          if (option.pauseControl) {
            $(option.pauseButton).removeClass('active');
          }
        });
        swiper.on('autoplayStop', function () {
          if (option.playControl) {
            $(option.playButton).removeClass('active');
          }
          if (option.pauseControl) {
            $(option.pauseButton).addClass('active');
          }
        });
      }
    });
  };

  // UiTabPanel
  var UiTabPanel = function (target, option) {
    var _ = this;
    var $wrap = $(target).eq(0);

    _.className = {
      active: 'js-tabpanel-active',
      opened: 'js-tabpanel-opened',
    };
    _.options = option;
    _.wrap = $wrap;
    _.crrTarget = '';
    _.init();
    _.on();
  };
  $.extend(UiTabPanel.prototype, {
    init: function () {
      var _ = this;
      var initialOpen = typeof _.options.initialOpen === 'string' && _.options.initialOpen;

      if (_.options.opener) {
        if (typeof _.options.opener === 'string') {
          _.opener = _.wrap.find(_.options.opener);
        } else {
          _.opener = _.options.opener;
        }
      }

      if (_.options.item) {
        if (typeof _.options.item === 'string') {
          _.item = _.wrap.find(_.options.item);
        } else {
          _.item = _.options.item;
        }
      }

      if (_.opener.length && _.item.length) {
        _.hashCode = uiGetHashCode();

        if (!initialOpen) {
          initialOpen = _.opener.eq(0).attr('data-tab-open');
        }

        if (_.options.a11y) {
          _.initA11y();
        }

        _.open(initialOpen, false);
      }
    },
    on: function () {
      var _ = this;
      var openerFocus = false;
      var $focusOpener = null;

      if (_.opener.length && _.item.length) {
        _.opener.on('click.uiTabPanel' + _.hashCode, function (e) {
          var $this = $(this);
          var target = $this.attr('data-tab-open');
          _.open(target);

          if ($this.is('a')) {
            e.preventDefault();
          }
        });
        $doc.on('focusin.uiTabPanel' + _.hashCode, function (e) {
          var $panel = ($(e.target).is(_.item) && $(e.target)) || ($(e.target).closest(_.item).length && $(e.target).closest(_.item));

          if ($panel && !$panel.is(':hidden')) {
            _.open($panel.attr('data-tab'));
          }
        });
        _.opener
          .on('focus.uiTabPanel' + _.hashCode, function () {
            openerFocus = true;
            $focusOpener = $(this);
          })
          .on('blur.uiTabPanel' + _.hashCode, function () {
            openerFocus = false;
            $focusOpener = null;
          });
        $doc
          .on('keydown.uiTabPanel' + _.hashCode, function (e) {
            var keyCode = e.keyCode;
            if (_.options.a11y && openerFocus) {
              if ([13, 32, 35, 36, 37, 38, 39, 40].indexOf(keyCode) > -1) {
                e.preventDefault();
              }
            }
          })
          .on('keyup.uiTabPanel' + _.hashCode, function (e) {
            var keyCode = e.keyCode;
            var target = $focusOpener && $focusOpener.attr('data-tab-open');
            if (_.options.a11y && openerFocus) {
              switch (keyCode) {
                case 35:
                  _.goEnd();
                  break;
                case 36:
                  _.goStart();
                  break;
                case 37:
                  _.prev();
                  break;
                case 38:
                  _.prev();
                  break;
                case 39:
                  _.next();
                  break;
                case 40:
                  _.next();
                  break;
                case 13:
                  _.open(target);
                  break;
                case 32:
                  _.open(target);
                  break;
                default:
                  break;
              }
            }
          });
      }
    },
    open: function (target, focus) {
      var _ = this;
      target = String(target);
      focus = focus instanceof Boolean ? (String(focus) === 'false' ? false : null) : focus;
      var $opener = _.opener.filter('[data-tab-open="' + target + '"]');
      var $panel = _.item.filter('[data-tab="' + target + '"]');

      if (!$panel.hasClass(_.className.opened)) {
        if (_.options.a11y) {
          _.setActiveA11y(target, focus);
        }

        _.crrTarget = target;
        _.opener.not($opener).removeClass(_.className.active);
        _.item.not($panel).removeClass(_.className.opened);
        $opener.addClass(_.className.active);
        $panel.addClass(_.className.opened).trigger('uiTabPanelChange');
      }
    },
    indexOpen: function (i) {
      var _ = this;
      target = Number(i);
      var target = _.opener.eq(i).attr('data-tab-open');

      _.open(target);
    },
    next: function () {
      var _ = this;
      var length = _.opener.length;
      var i = _.opener.index(_.opener.filter('[data-tab-open="' + _.crrTarget + '"]')) + 1;
      if (i >= length) {
        i = 0;
      }
      _.indexOpen(i);
    },
    prev: function () {
      var _ = this;
      var length = _.opener.length;
      var i = _.opener.index(_.opener.filter('[data-tab-open="' + _.crrTarget + '"]')) - 1;
      if (i < 0) {
        i = length - 1;
      }
      _.indexOpen(i);
    },
    goStart: function () {
      var _ = this;
      _.indexOpen(0);
    },
    goEnd: function () {
      var _ = this;
      _.indexOpen(_.opener.length - 1);
    },
    initA11y: function () {
      var _ = this;

      _.opener.each(function () {
        var $this = $(this);
        var target = $this.attr('data-tab-open');

        $this
          .attr('role', 'tab')
          .attr('id', 'tabpanel-opener-' + target + '-' + _.hashCode)
          .attr('aria-controls', 'tabpanel-' + target + '-' + _.hashCode);
      });

      _.item.each(function () {
        var $this = $(this);
        var target = $this.attr('data-tab');

        $this
          .attr('role', 'tabpanel')
          .attr('id', 'tabpanel-' + target + '-' + _.hashCode)
          .attr('aria-labelledby', 'tabpanel-opener-' + target + '-' + _.hashCode);
      });

      _.wrap.attr('role', 'tablist');
    },
    setActiveA11y: function (target, focus) {
      var _ = this;

      focus = focus === false ? false : true;

      _.opener.each(function () {
        var $this = $(this);
        var crrTarget = $this.attr('data-tab-open');

        if (crrTarget === target) {
          $this.attr('tabindex', '0').attr('aria-selected', 'true');
          if (focus) {
            $this.focus();
          }
        } else {
          $this.attr('tabindex', '-1').attr('aria-selected', 'false');
        }
      });

      _.item.each(function () {
        var $this = $(this);
        var crrTarget = $this.attr('data-tab');

        if (crrTarget === target) {
          $this.removeAttr('hidden');
        } else {
          $this.attr('hidden', '');
        }
      });
    },
    addA11y: function () {
      var _ = this;

      if (!_.options.a11y) {
        _.options.a11y = true;
        _.initA11y();
        _.setActiveA11y(_.crrTarget);
      }
    },
    clearA11y: function () {
      var _ = this;

      if (_.options.a11y) {
        _.options.a11y = false;
        _.opener.removeAttr('role').removeAttr('id').removeAttr('aria-controls').removeAttr('tabindex').removeAttr('aria-selected');

        _.item.removeAttr('role').removeAttr('id').removeAttr('aria-labelledby').removeAttr('hidden');

        _.wrap.removeAttr('role');
      }
    },
  });
  $.fn.uiTabPanel = function (custom) {
    var defaultOption = {
      item: null,
      opener: null,
      initialOpen: null,
      a11y: false,
    };
    var other = [];

    custom = custom || {};

    $.each(arguments, function (i) {
      if (i > 0) {
        other.push(this);
      }
    });

    this.each(function () {
      var options = {};
      var uiTabPanel = this.uiTabPanel;

      if (typeof custom === 'object' && !uiTabPanel) {
        options = $.extend({}, defaultOption, custom);
        this.uiTabPanel = new UiTabPanel(this, options);
      } else if (typeof custom === 'string' && uiTabPanel) {
        switch (custom) {
          case 'addA11y':
            uiTabPanel.addA11y();
            break;
          case 'clearA11y':
            uiTabPanel.clearA11y();
            break;
          case 'open':
            uiTabPanel.open(other[0], other[1]);
            break;
          case 'indexOpen':
            uiTabPanel.indexOpen(other[0]);
            break;
          case 'next':
            uiTabPanel.next();
            break;
          case 'prev':
            uiTabPanel.prev();
            break;
          case 'goStart':
            uiTabPanel.goStart();
            break;
          case 'goEnd':
            uiTabPanel.goEnd();
            break;
          default:
            break;
        }
      }
    });

    return this;
  };

  // UiAccordion
  var UiAccordion = function (target, option) {
    var _ = this;
    var $wrap = $(target).eq(0);

    _.className = {
      opened: 'js-accordion-opened',
    };
    _.options = option;
    _.wrap = $wrap;
    _.init();
    _.on();
  };
  $.extend(UiAccordion.prototype, {
    init: function () {
      var _ = this;

      _.hashCode = uiGetHashCode();
      _.getElements();

      if (_.layer.length && _.item.length && _.item.filter('[data-initial-open]').length) {
        _.item.each(function () {
          var $this = $(this);
          if ($this.attr('data-initial-open') === 'true') {
            _.open($this, 0);
          }
        });
      }

      _.options.onInit();
    },
    getElements: function () {
      var _ = this;

      if (_.options.opener) {
        if (typeof _.options.opener === 'string') {
          _.opener = _.wrap.find(_.options.opener);
        } else {
          _.opener = _.options.opener;
        }
      }

      if (_.options.layer) {
        if (typeof _.options.layer === 'string') {
          _.layer = _.wrap.find(_.options.layer);
        } else {
          _.layer = _.options.layer;
        }
      }

      if (_.options.item) {
        if (typeof _.options.item === 'string') {
          _.item = _.wrap.find(_.options.item);
        } else {
          _.item = _.options.item;
        }
      }
    },
    on: function () {
      var _ = this;

      if (_.opener.length && _.layer.length) {
        _.opener.on('click.uiAccordion' + _.hashCode, function () {
          _.toggle($(this).closest(_.item));
        });

        $doc
          .on('keydown.uiAccordion' + _.hashCode, function (e) {
            if (e.keyCode === 9 && _.blockTabKey) {
              e.preventDefault();
            }
          })
          .on('focusin.uiAccordion' + _.hashCode, function (e) {
            var $item = ($(e.target).is(_.layer) || $(e.target).closest(_.layer).length) && $(e.target).closest(_.item);

            if ($item) {
              _.open($item, 0);
            }
          });
      }
    },
    off: function () {
      var _ = this;

      if (_.opener.length && _.layer.length) {
        _.opener.off('click.uiAccordion' + _.hashCode);
        $doc.off('keydown.uiAccordion' + _.hashCode).off('focusin.uiAccordion' + _.hashCode);
      }
    },
    toggle: function ($item) {
      var _ = this;

      if ($item.hasClass(_.className.opened)) {
        _.close($item);
      } else {
        _.open($item);
      }
    },
    open: function ($item, speed) {
      var _ = this;
      var $layer = null;
      var beforeH = 0;
      var afterH = 0;
      speed = speed instanceof Number ? Number(speed) : typeof speed === 'number' ? speed : _.options.speed;

      if (!$item.hasClass(_.className.opened)) {
        $layer = $item.find(_.layer);
        $layer.stop().css('display', 'block');
        beforeH = $layer.height();
        $layer.css('height', 'auto');
        $item.addClass(_.className.opened);
        afterH = $layer.height();
        if (beforeH === afterH) {
          speed = 0;
        }
        $layer
          .css('height', beforeH)
          .animate(
            {
              height: afterH,
            },
            speed,
            function () {
              $layer
                .css({
                  height: 'auto',
                })
                .trigger('uiAccordionAfterOpened');
            }
          )
          .trigger('uiAccordionOpened', [beforeH, afterH]);

        if (_.options.once) {
          _.item.not($item).each(function () {
            _.close($(this));
          });
        }
      }
    },
    close: function ($item, speed) {
      var _ = this;
      var $layer = null;
      var beforeH = 0;
      var afterH = 0;
      speed = speed instanceof Number ? Number(speed) : typeof speed === 'number' ? speed : _.options.speed;

      if ($item.hasClass(_.className.opened)) {
        _.blockTabKey = true;
        $layer = $item.find(_.layer);
        $layer.stop().css('display', 'block');
        beforeH = $layer.height();
        $layer.css('height', '');
        $item.removeClass(_.className.opened);
        afterH = $layer.height();
        if (beforeH === afterH) {
          speed = 0;
        }
        $layer
          .css('height', beforeH)
          .animate(
            {
              height: afterH,
            },
            speed,
            function () {
              $layer
                .css({
                  display: '',
                  height: '',
                })
                .trigger('uiAccordionAfterClosed');
              _.blockTabKey = false;
            }
          )
          .trigger('uiAccordionClosed', [beforeH, afterH]);
      }
    },
    allClose: function () {
      var _ = this;

      _.item.each(function () {
        _.close($(this));
      });
    },
    update: function (newOptions) {
      var _ = this;

      _.off();
      $.extend(_.options, newOptions);
      _.getElements();
      _.on();
    },
  });
  $.fn.uiAccordion = function (custom) {
    var defaultOption = {
      item: null,
      opener: null,
      layer: null,
      once: false,
      speed: 500,
      onInit: function () {},
    };
    var other = [];

    custom = custom || {};

    $.each(arguments, function (i) {
      if (i > 0) {
        other.push(this);
      }
    });

    this.each(function () {
      var options = {};
      var uiAccordion = this.uiAccordion;

      if (typeof custom === 'object' && !uiAccordion) {
        options = $.extend({}, defaultOption, custom);
        this.uiAccordion = new UiAccordion(this, options);
      } else if (typeof custom === 'string' && uiAccordion) {
        switch (custom) {
          case 'allClose':
            uiAccordion.allClose();
            break;
          case 'close':
            uiAccordion.close(other[0], other[1]);
            break;
          case 'open':
            uiAccordion.open(other[0], other[1]);
            break;
          case 'update':
            uiAccordion.update(other[0]);
            break;
          default:
            break;
        }
      }
    });

    return this;
  };

  // scrollbars width
  var scrollbarsWidth = {
    width: 0,
    set: function () {
      var _ = scrollbarsWidth;
      var $html = $('html');
      var $wrap = $('#wrap');
      $html.css('overflow', 'hidden');
      var beforeW = $wrap.width();
      $html.css('overflow', 'scroll');
      var afterW = $wrap.width();
      $html.css('overflow', '');
      _.width = beforeW - afterW;
    },
  };
  function checkScrollbars() {
    var $html = $('html');
    if (Boolean(scrollbarsWidth.width)) {
      $html.addClass('is-scrollbars-width');
    }
  }

  // scrollBlock
  var scrollBlock = {
    scrollTop: 0,
    scrollLeft: 0,
    className: {
      block: 'is-scroll-blocking',
    },
    block: function () {
      var _ = scrollBlock;
      var $html = $('html');
      var $wrap = $('#wrap');

      scrollBlock.scrollTop = $win.scrollTop();
      scrollBlock.scrollLeft = $win.scrollLeft();

      if (!$html.hasClass(_.className.block)) {
        $html.addClass(_.className.block);
        $win.scrollTop(0);
        $wrap.scrollTop(_.scrollTop);
        $win.scrollLeft(0);
        $wrap.scrollLeft(_.scrollLeft);
      }
    },
    clear: function () {
      var _ = scrollBlock;
      var $html = $('html');
      var $wrap = $('#wrap');

      if ($html.hasClass(_.className.block)) {
        $html.removeClass(_.className.block);
        $wrap.scrollTop(0);
        $win.scrollTop(_.scrollTop);
        $wrap.scrollLeft(0);
        $win.scrollLeft(_.scrollLeft);
      }
    },
  };
  window.uiJSScrollBlock = scrollBlock;

  // layer
  var uiLayer = {
    zIndex: 5000,
    open: function (target, opener, speed) {
      var _ = uiLayer;
      var $html = $('html');
      var $layer = $('[data-layer="' + target + '"]');
      var timer = null;
      var isScrollBlock = true;
      var isFocus = true;
      var speed = typeof speed === 'number' ? speed : 350;
      var $label = null;
      var hashCode = '';
      var labelID = '';
      var $layers = $('[data-layer]');
      var $ohterElements = $('body').find('*').not('[data-layer], [data-layer] *, script, link, style, base, meta, br, [aria-hidden], [inert], .js-not-inert, .js-not-inert *');

      $layers.parents().each(function () {
        $ohterElements = $ohterElements.not($(this));
      });

      if ($layer.length && !$layer.hasClass('js-layer-opened')) {
        $label = $layer.find('h1, h2, h3, h4, h5, h6, p').eq(0);
        hashCode = (function () {
          var code = $layer.data('uiJSHashCode');
          if (!(typeof code === 'string')) {
            code = uiGetHashCode();
            $layer.data('uiJSHashCode', code);
          }
          return code;
        })();
        isScrollBlock = (function () {
          var val = $layer.data('scroll-block');
          if (typeof val === 'boolean' && !val) {
            return false;
          } else {
            return isScrollBlock;
          }
        })();
        isFocus = (function () {
          var val = $layer.data('focus');
          if (typeof val === 'boolean' && !val) {
            return false;
          } else {
            return isFocus;
          }
        })();

        _.zIndex++;
        $layer.trigger('layerBeforeOpened').attr('role', 'dialog').attr('aria-hidden', 'true').css('visibility', 'hidden').attr('hidden', '');
        if ($label.length) {
          labelID = (function () {
            var id = $label.attr('id');
            if (!(typeof id === 'string' && id.length)) {
              id = target + '-' + hashCode;
              $label.attr('id', id);
            }
            return id;
          })();
          $layer.attr('aria-labelledby', labelID);
        }
        $html.addClass('js-html-layer-opened js-html-layer-opened-' + target);

        $ohterElements.attr('aria-hidden', 'true').attr('inert', '').attr('data-ui-js', 'hidden');

        $layer
          .stop()
          .removeClass('js-layer-closed')
          .css({
            display: 'block',
            zIndex: _.zIndex,
          })
          .animate(
            {
              opacity: 1,
            },
            speed,
            function () {
              $layer.trigger('layerAfterOpened');
            }
          )
          .attr('tabindex', '0')
          .attr('aria-hidden', 'false')
          .css('visibility', 'visible')
          .removeAttr('hidden')
          .data('layerIndex', $('.js-layer-opened').length);

        if (isFocus) {
          $layer.focus();
        }

        if (isScrollBlock) {
          scrollBlock.block();
        }

        if (Boolean(opener) && $(opener).length) {
          $layer.data('layerOpener', $(opener));
        }

        timer = setTimeout(function () {
          clearTimeout(timer);
          $layer.addClass('js-layer-opened').trigger('layerOpened');
        }, 0);
      }
    },
    close: function (target, speed) {
      var $html = $('html');
      var $layer = $('[data-layer="' + target + '"]');
      var timer = null;
      var speed = typeof speed === 'number' ? speed : 350;
      var $ohterElements = $('body').find('[data-ui-js="hidden"]');

      if ($layer.length && $layer.hasClass('js-layer-opened')) {
        $layer
          .trigger('layerBeforeClosed')
          .stop()
          .removeClass('js-layer-opened')
          .addClass('js-layer-closed')
          .css('display', 'block')
          .data('layerIndex', null)
          .attr('aria-hidden', 'true')
          .animate(
            {
              opacity: 0,
            },
            speed,
            function () {
              var $opener = $layer.data('layerOpener');
              var $openedLayer = $('.js-layer-opened');
              var $openedLayerIsScrollBlock = $openedLayer.not(function () {
                var val = $(this).data('scroll-block');
                if (typeof val === 'boolean' && !val) {
                  return true;
                } else {
                  return false;
                }
              });
              var isScrollBlock = $html.hasClass(scrollBlock.className.block);

              $(this).css('display', 'none').css('visibility', 'hidden').attr('hidden', '').removeClass('js-layer-closed');

              $html.removeClass('js-html-layer-closed-animate js-html-layer-opened-' + target);

              if (!$openedLayer.length) {
                $html.removeClass('js-html-layer-opened');
                $ohterElements.removeAttr('aria-hidden').removeAttr('inert').removeAttr('data-ui-js');
              }

              if (!$openedLayerIsScrollBlock.length && isScrollBlock) {
                scrollBlock.clear();
              }

              if ($opener && $opener.length) {
                $opener.focus();
                $layer.data('layerOpener', null);
              }

              $layer.trigger('layerAfterClosed');
            }
          )
          .trigger('layerClosed');

        timer = setTimeout(function () {
          clearTimeout(timer);
          $html.addClass('js-html-layer-closed-animate');
        }, 0);
      }
    },
    checkFocus: function (e) {
      var $layer = $('[data-layer]')
        .not(':hidden')
        .not(function () {
          var val = $(this).data('scroll-block');
          if (typeof val === 'boolean' && !val) {
            return true;
          } else {
            return false;
          }
        });
      var $target = $(e.target);
      var $closest = $target.closest('[data-layer]');
      var lastIndex = (function () {
        var index = 0;
        $layer.each(function () {
          var crrI = $(this).data('layerIndex');
          if (crrI > index) {
            index = crrI;
          }
        });
        return index;
      })();
      var checkLayer = $layer.length && !($target.is($layer) && $target.data('layerIndex') === lastIndex) && !($closest.length && $closest.is($layer) && $closest.data('layerIndex') === lastIndex);

      if (checkLayer) {
        $layer
          .filter(function () {
            return $(this).data('layerIndex') === lastIndex;
          })
          .focus();
      }
    },
  };
  window.uiJSLayer = uiLayer;

  $doc
    .on('focusin.uiLayer', uiLayer.checkFocus)
    .on('click.uiLayer', '[data-role="layerClose"]', function () {
      var $this = $(this);
      var $layer = $this.closest('[data-layer]');
      if ($layer.length) {
        uiLayer.close($layer.attr('data-layer'));
      }
    })
    .on('click.uiLayer', '[data-layer-open]', function (e) {
      var $this = $(this);
      var layer = $this.attr('data-layer-open');
      var $layer = $('[data-layer="' + layer + '"]');
      if ($layer.length) {
        uiLayer.open(layer);
        $layer.data('layerOpener', $this);
      }
      e.preventDefault();
    })
    .on('layerAfterOpened.uiLayer', '[data-layer-timer-close]', function () {
      var $this = $(this);
      var layer = $this.attr('data-layer');
      var delay = Number($this.attr('data-layer-timer-close'));
      var timer = setTimeout(function () {
        uiLayer.close(layer);
        clearTimeout(timer);
      }, delay);
      $this.data('layer-timer', timer);
    })
    .on('layerBeforeClosed.uiLayer', '[data-layer-timer-close]', function () {
      var $this = $(this);
      var timer = $this.data('layer-timer');
      clearTimeout(timer);
    });

  // input disabled class
  function checkDisabledClass() {
    var $inputs = $('.ui-input, .ui-select');
    $inputs.each(function () {
      var $this = $(this);
      var $parent = $this.parent('.ui-input-block, .ui-select-block');
      var disabledClassName = 'is-disabled';
      var isDisabled = $this.is(':disabled');
      var disabledHasClass = $parent.hasClass(disabledClassName);
      var readonlyClassName = 'is-readonly';
      var isReadonly = $this.is('[readonly]');
      var readonlyHasClass = $parent.hasClass(readonlyClassName);

      if (isDisabled && !disabledHasClass) {
        $parent.addClass(disabledClassName);
      } else if (!isDisabled && disabledHasClass) {
        $parent.removeClass(disabledClassName);
      }

      if (isReadonly && !readonlyHasClass) {
        $parent.addClass(readonlyClassName);
      } else if (!isReadonly && readonlyHasClass) {
        $parent.removeClass(readonlyClassName);
      }
    });
  }

  // fixBarSet
  function fixBarSet() {
    var $layoutWrap = $('.layout-wrap');
    var $header = $('.header-wrap');
    var headerH = 0;
    var $fakeHeader = $('.js-fake-header');
    var $bottom = $('.bottom-fix-wrap');
    var $fakeBottom = $('.js-fake-bottom');
    var bottomH = 0;
    var $homeScroll = $('.home-wrap__doc, .home-nav__panel-doc');
    var $layerQuickMenu = $('.layer-quick-menu .layer-container');
    var $bottomButtonBlock = $('.bottom-button-block');
    var $fakeBottomButtonBlock = $('.js-fake-bottom-button-block');
    var bottomButtonH = 0;

    if ($header.length && !$header.is(':hidden')) {
      headerH = $header.outerHeight();
      if (!$fakeHeader.length) {
        $layoutWrap.prepend('<div class="js-fake-header"></div>');
        $fakeHeader = $('.js-fake-header');
      }
      $fakeHeader.height(headerH);
    }
    if ($bottomButtonBlock.length && !$bottomButtonBlock.is(':hidden')) {
      bottomButtonH = $bottomButtonBlock.outerHeight();
      if (!$fakeBottomButtonBlock.length) {
        $bottom.append('<div class="js-fake-bottom-button-block"></div>');
        $fakeBottomButtonBlock = $('.js-fake-bottom-button-block');
      }
      $fakeBottomButtonBlock.height(bottomButtonH);
    }
    if ($bottom.length && !$bottom.is(':hidden')) {
      bottomH = $bottom.outerHeight();
      if (!$fakeBottom.length) {
        $layoutWrap.append('<div class="js-fake-bottom"></div>');
        $homeScroll.append('<div class="js-fake-bottom"></div>');
        $fakeBottom = $('.js-fake-bottom');
      }
      $layerQuickMenu.css('bottom', bottomH);
      $fakeBottom.height(bottomH);
    }
  }
  $doc.on('layerAfterOpened.fixBarSet layerAfterClosed.fixBarSet', '.layer-gnb', function () {
    fixBarSet();
  });

  // checkbox tab
  function checkboxTabUpdate($input) {
    var name = $input.data('checkbox-tab');
    var $panel = $('[data-checkbox-tab-panel="' + name + '"]');
    var isChecked = $input.is(':checked');

    if (isChecked) {
      $panel.css('display', 'block');
    } else {
      $panel.css('display', 'none');
    }

    $panel.trigger('checkboxTabChange');
  }
  function checkboxTabInit() {
    $('[data-checkbox-tab]').each(function () {
      var $this = $(this);
      checkboxTabUpdate($this);
    });
  }
  $doc.on('change.checkboxTab', '[data-checkbox-tab]', function () {
    var $this = $(this);
    var name = $this.attr('name');
    var $siblings = $('[name="' + name + '"]').not($this);

    checkboxTabUpdate($this);
    $siblings.each(function () {
      var $siblingsThis = $(this);
      checkboxTabUpdate($siblingsThis);
    });
  });

  // checkbox group
  function checkboxGroupUpdate($input, eventBy) {
    var parentName = $input.attr('data-checkbox-group');
    var childName = $input.attr('data-checkbox-group-child');

    if (typeof childName === 'string' && childName.length) {
      checkboxGroupUpdateChild(childName, eventBy);
    }
    if (typeof parentName === 'string' && parentName.length) {
      checkboxGroupUpdateParent(parentName, eventBy);
    }
    checkboxTabInit();
  }
  function checkboxGroupUpdateParent(name, eventBy) {
    var $parent = $('[data-checkbox-group=' + name + ']');
    var $child = $('[data-checkbox-group-child=' + name + ']');
    var checked = $parent.is(':checked');

    if (!(typeof eventBy === 'string' && eventBy === 'checkboxGroupUpdateChild')) {
      $child.each(function () {
        var $thisChild = $(this);
        var beforeChecked = $thisChild.is(':checked');

        if (checked) {
          $thisChild.prop('checked', true).attr('checked', '');
        } else {
          $thisChild.prop('checked', false).removeAttr('checked');
        }

        var afterChecked = $thisChild.is(':checked');

        if (beforeChecked !== afterChecked) {
          $thisChild.trigger('change');
        }
      });
    }
  }
  function checkboxGroupUpdateChild(name, eventBy) {
    var $parent = $('[data-checkbox-group=' + name + ']');
    var $child = $('[data-checkbox-group-child=' + name + ']');
    var length = $child.length;
    var checkedLength = $child.filter(':checked').length;

    $parent.each(function () {
      var $thisParent = $(this);
      var beforeChecked = $thisParent.is(':checked');

      if (length === checkedLength) {
        $thisParent.prop('checked', true).attr('checked', '');
      } else {
        $thisParent.prop('checked', false).removeAttr('checked');
      }

      var afterChecked = $thisParent.is(':checked');

      if (beforeChecked !== afterChecked) {
        $thisParent.trigger('change', 'checkboxGroupUpdateChild');
      }
    });
  }
  function checkboxGroupInit() {
    $('[data-checkbox-group]').each(function () {
      checkboxGroupUpdate($(this));
    });
  }
  $doc.on('change.checkboxGroup', '[data-checkbox-group], [data-checkbox-group-child]', function (e, eventBy) {
    checkboxGroupUpdate($(this), eventBy);
  });

  // selet tab
  var selectTab = {
    init: function () {
      $('.ui-select').each(function () {
        selectTab.update($(this));
      });
    },
    update: function ($select) {
      var $tapOption = $select.find('[data-select-tab]');

      if (!$tapOption.length) {
        return;
      }

      $tapOption.not(':selected').each(function () {
        var $this = $(this);
        var name = $this.attr('data-select-tab');
        var $panel = $('[data-select-tab-panel="' + name + '"]');

        $panel.css('display', 'none');
      });
      $tapOption.filter(':selected').each(function () {
        var $this = $(this);
        var name = $this.attr('data-select-tab');
        var $panel = $('[data-select-tab-panel="' + name + '"]');

        $panel.css('display', 'block');
      });
    },
  };
  $doc.on('change.selectTab', '.ui-select', function () {
    selectTab.update($(this));
  });

  // resale phone select
  function resalePhoneSelectUpdate($input) {
    var $wrap = $input.closest('.box-checkbox');
    var $radio = $wrap.find('.ui-radio');
    var $selectWrap = $wrap.find('.box-checkbox__item--resale-phone');
    var $select = $wrap.find('.box-checkbox__item--resale-phone .ui-select');
    var $selectPlaceholder = $select.find('.js-select-placeholder');
    var isSelect = $input.is('select');

    if (isSelect) {
      $radio.prop('checked', false).removeAttr('checked', '');
      if ($selectPlaceholder.is(':selected')) {
        $selectWrap.removeClass('is-inputed');
      } else {
        $selectWrap.addClass('is-inputed');
      }
    } else {
      $selectWrap.removeClass('is-inputed');
      $selectPlaceholder.prop('selected', true).attr('selected', '');
    }
  }
  $doc.on('change.resalePhoneSelect', '.box-checkbox--telecom .ui-radio, .box-checkbox__item--resale-phone .ui-select', function () {
    resalePhoneSelectUpdate($(this));
  });

  // card slide
  var cardSlide = {
    init: function () {
      var $cardSlide = $('.card-slide__list');
      if ($cardSlide.length) {
        $cardSlide.each(function () {
          var $this = $(this);
          var $child = $this.children();
          var $section = $this.closest('.card-slide-section');
          var $count = null;
          var $total = null;
          var swiper = $cardSlide.data('swiper');
          var length = $child.length;

          if ($section.length) {
            $count = $section.find('.js-card-slide-count');
            $total = $section.find('.js-card-slide-total');
          }

          if (!(typeof swiper === 'object')) {
            if ($total && $total.length) {
              $total.text(length);
            }
            if ($count && $count.length) {
              $count.text(1);
            }
            $this.swiperSet({
              nextControl: true,
              prevControl: true,
              loop: true,
              on: {
                init: function () {
                  $this.trigger('swiperInit', this);
                },
                slideChange: function () {
                  if ($count && $count.length) {
                    $count.text(this.realIndex + 1);
                  }
                },
              },
            });
          }
        });
      }
    },
  };
  window.uiJSCardSlide = cardSlide;

  // table select
  var tableSelect = {
    target: '.primary-table__select-button .ui-radio, .primary-table__select-button .ui-checkbox',
    init: function () {
      $(tableSelect.target).each(function () {
        tableSelect.update($(this));
      });
    },
    update: function ($input, isCallback) {
      var $row = $input.closest('tr');
      var isChecked = $input.is(':checked');
      var isRadio = $input.is('[type="radio"]');
      var name = '';

      if (isChecked) {
        $row.addClass('is-selected');
      } else {
        $row.removeClass('is-selected');
      }

      if (isRadio && !isCallback) {
        name = $input.attr('name');
        $('[name="' + name + '"]')
          .not($input)
          .each(function () {
            tableSelect.update($(this), true);
          });
      }
    },
  };
  $doc
    .on('change.tableSelect', tableSelect.target, function () {
      tableSelect.update($(this));
    })
    .on('click.tableSelect', '.primary-table > table > tbody > tr', function () {
      var $this = $(this);
      var $input = $this.find(tableSelect.target);
      var isRadio = $input.is('[type="radio"]');
      var name = '';

      if (isRadio) {
        name = $input.attr('name');
        $('[name="' + name + '"]')
          .not($this)
          .each(function () {
            $(this).prop('checked', false).removeAttr('checked');
          });
      }

      if ($input.length) {
        if ($input.is(':checked')) {
          if (!isRadio) {
            $input.prop('checked', false).removeAttr('checked').trigger('change');
          }
        } else {
          $input.prop('checked', true).attr('checked', '').trigger('change');
        }
      }
    })
    .on('click.tableSelect', tableSelect.target + ', .primary-table__select-button .ui-label', function (e) {
      e.stopPropagation();
    });

  // area disabled
  var areaDisabled = {
    init: function () {
      $('[data-area-disabled]').each(function () {
        var $this = $(this);
        areaDisabled.eventCall($this);
      });
    },
    eventCall: function ($this) {
      var isRadio = $this.attr('type') === 'radio';
      var name = $this.attr('name');

      if (isRadio) {
        areaDisabled.update($('[name="' + name + '"]').not($this));
      }

      areaDisabled.update($this);
    },
    update: function ($input) {
      var isChecked = $input.is(':checked');
      var target = $input.attr('data-area-disabled');
      var $target = $('[data-area-disabled-target="' + target + '"]');
      var selector = 'input, select, button, textarea, fieldset, optgroup';

      if (isChecked) {
        if ($target.is(selector)) {
          $target.prop('disabled', false).removeAttr('disabled');
        }
        $target.find(selector).prop('disabled', false).removeAttr('disabled');
      } else {
        if ($target.is(selector)) {
          $target.prop('disabled', true).attr('disabled', '');
        }
        $target.find(selector).prop('disabled', true).attr('disabled', '');
      }
      checkDisabledClass();
    },
  };
  $doc.on('change.areaDisabled', '[data-area-disabled]', function () {
    var $this = $(this);
    areaDisabled.eventCall($this);
  });

  // select card checkbox
  var selectCardCheckbox = {
    inputSelector: '.select-card-block__head .select-card-block__check .ui-checkbox, .select-card-block__head .select-card-block__check .ui-radio',
    init: function () {
      $(selectCardCheckbox.inputSelector).each(function () {
        selectCardCheckbox.update($(this));
      });
    },
    update: function ($input, isCallback) {
      var isChecked = $input.is(':checked');
      var $block = $input.closest('.select-card-block');
      var isRadio = $input.attr('type') === 'radio';
      var name = $input.attr('name');
      var $siblings = $('[name="' + name + '"]').not($input);

      if (isChecked) {
        $block.addClass('is-checked');
      } else {
        $block.removeClass('is-checked');
      }

      if (isRadio && !isCallback) {
        $siblings.each(function () {
          selectCardCheckbox.update($(this), true);
        });
      }
    },
  };
  $doc.on('change.selectCardCheckbox', selectCardCheckbox.inputSelector, function () {
    selectCardCheckbox.update($(this));
  });

  // common js
  function uiJSCommon() {
    checkScrollbars();
    checkDisabledClass();
    checkboxGroupInit();
    checkboxTabInit();
    tableSelect.init();
    selectTab.init();
    areaDisabled.init();
    selectCardCheckbox.init();
    $('.js-ui-tab-panel').each(function () {
      var $this = $(this);
      var initial = $this.attr('data-initial');
      var filter = function () {
        var $thisItem = $(this);
        var $wrap = $thisItem.closest('.js-ui-tab-panel');

        if ($wrap.is($this)) {
          return true;
        } else {
          return false;
        }
      };
      var $items = $this.find('[data-tab]').filter(filter);
      var $openers = $this.find('[data-tab-open]').filter(filter);

      $this.uiTabPanel({
        a11y: true,
        item: $items,
        opener: $openers,
        initialOpen: initial,
      });
    });
    $('.js-ui-accordion').each(function () {
      var $this = $(this);
      var once = $this.attr('data-once') === 'true';
      var filter = function () {
        var $thisItem = $(this);
        var $wrap = $thisItem.closest('.js-ui-accordion');

        if ($wrap.is($this)) {
          return true;
        } else {
          return false;
        }
      };
      var $items = $this.find('.js-ui-accordion__item').filter(filter);
      var $openers = $this.find('.js-ui-accordion__opener').filter(filter);
      var $layers = $this.find('.js-ui-accordion__layer').filter(filter);

      if ($this.get(0).uiAccordion) {
        $this.uiAccordion('update', {
          item: $items,
          opener: $openers,
          layer: $layers,
        });
      } else {
        $this.uiAccordion({
          item: $items,
          opener: $openers,
          layer: $layers,
          once: once,
        });
      }
    });
  }
  window.uiJSCommon = uiJSCommon;

  // uiJSResize
  function uiJSResize() {
    fixBarSet();
    isCallingBar();
    homeSlideResize();
  }
  window.uiJSResize = uiJSResize;

  // calling bar
  function isCallingBar() {
    var $html = $('html');
    var $callingBar = $('.calling-bar');
    var isHide = $callingBar.is(':hidden');

    if ($callingBar.length) {
      if (isHide) {
        $html.addClass('is-calling-bar-hide');
      } else {
        $html.removeClass('is-calling-bar-hide');
      }
    }
  }

  // area focus
  function areaFocus(area) {
    $doc
      .on('focus.areaFocus', area, function () {
        var $this = $(this);
        var timer = $this.data('areaFocusTimer');

        clearTimeout(timer);
        $this.addClass('is-focus');
      })
      .on('blur.areaFocus', area, function () {
        var $this = $(this);
        var timer = $this.data('areaFocusTimer');

        clearTimeout(timer);
        $this.data(
          'areaFocusTimer',
          setTimeout(function () {
            $this.removeClass('is-focus');
          }, 100)
        );
      });
  }
  areaFocus('.ui-select-block');
  areaFocus('.ui-input-block');
  areaFocus('.search-form');

  // inputed
  function inputedCheck($input, parent) {
    var val = $input.val();
    var $wrap = $input.closest(parent);

    if ($wrap.length) {
      if (typeof val === 'string' && val.length > 0) {
        $wrap.addClass('is-inputed');
      } else {
        $wrap.removeClass('is-inputed');
      }
    }
  }
  $doc
    .on('focus.inputedCheck blur.inputedCheck keydown.inputedCheck keyup.inputedCheck change.inputedCheck', '.ui-input', function () {
      inputedCheck($(this), '.ui-input-block');
    })
    .on('focus.inputedCheck blur.inputedCheck keydown.inputedCheck keyup.inputedCheck change.inputedCheck', '.ui-input', function () {
      inputedCheck($(this), '.search-form');
    });

  // input delete
  $doc.on('click.inputDelete', '.ui-input-delete', function () {
    var $this = $(this);
    var $input = $this.closest('.ui-input-block').find('.ui-input');

    $input.val('').trigger('focus');
  });

  // home slide
  function homeSlide() {
    var $html = $('html');

    function homeListChange(swiper) {
      $html.removeClass('is-slide-home is-slide-nav');
      if (swiper.realIndex === 0) {
        $html.addClass('is-slide-home');

        var prevNavSwiper = $('.home-slide__item.swiper-slide-duplicate .home-nav-slide__list').data('swiper');
        var nextNavSwiper = $('.home-slide__item:not(.swiper-slide-duplicate) .home-nav-slide__list').data('swiper');

        if (typeof prevNavSwiper === 'object') {
          prevNavSwiper.slideTo(prevNavSwiper.slides.length - 1);
        }
        if (typeof nextNavSwiper === 'object') {
          nextNavSwiper.slideTo(0);
        }

        $('.home-wrap__scroll').each(function () {
          var $this = $(this);
          var scrollSwiper = $this.data('swiper');
          if (typeof scrollSwiper === 'object') {
            scrollSwiper.slideTo(0, 0);
          }
        });
      } else if (swiper.realIndex === 1) {
        $html.addClass('is-slide-nav');

        var navSwiper = $(swiper.slides[swiper.activeIndex]).find('.home-nav-slide__list').data('swiper');
        var cloneNavSwiper = $(swiper.slides)
          .not(':eq(' + swiper.activeIndex + ')')
          .find('.home-nav-slide__list')
          .data('swiper');

        if (typeof navSwiper === 'object' && typeof cloneNavSwiper === 'object') {
          cloneNavSwiper.slideTo(navSwiper.realIndex);
        }
      }
    }

    var $homeList = $('.home-slide__list');
    $homeList.swiperSet({
      loop: true,
      noSwipingClass: 'js-home-no-swiping',
      on: {
        slideChange: function () {
          homeListChange(this);
        },
      },
    });

    var $homeWrapScroll = $('.home-wrap__scroll');
    $homeWrapScroll.swiperSet({
      //scrollbarControl: true,
      direction: 'vertical',
      slidesPerView: 'auto',
      freeMode: true,
      mousewheel: true,
    });

    var $homeBanner = $('.home-banner__list');
    $homeBanner.swiperSet({
      pageControl: true,
      nextControl: true,
      prevControl: true,
      playControl: true,
      pauseControl: true,
      loop: true,
      autoplay: {
        disableOnInteraction: false,
      },
      pagination: {
        type: 'fraction',
        formatFractionCurrent: function (number) {
          if (number < 10) {
            return '0' + number;
          } else {
            return number;
          }
        },
        formatFractionTotal: function (number) {
          if (number < 10) {
            return '0' + number;
          } else {
            return number;
          }
        },
      },
      on: {
        resize: function () {
          homeSlideResize();
        },
      },
    });

    var $homeNavTab = $('.home-nav__tab-list');
    $homeNavTab.swiperSet({
      slidesPerView: 'auto',
      freeMode: true,
      mousewheel: true,
    });

    var $homeNav = $('.home-nav-slide__list');
    function homeNaveChange(swiper) {
      var $this = $(swiper.$wrapperEl);
      var $thisTab = $this.closest('.home-nav').find('.home-nav__tab-list');
      var $tabItem = $thisTab.find('.home-nav__tab-item');

      $tabItem.find('.home-nav__tab-link').removeClass('is-active');
      $tabItem
        .filter(':nth-child(' + (swiper.realIndex + 1) + ')')
        .find('.home-nav__tab-link')
        .addClass('is-active');

      var tabSwiper = $thisTab.data('swiper');
      if (typeof tabSwiper === 'object') {
        tabSwiper.slideTo(swiper.realIndex);
      }

      var cloneSwiper = $homeNav.not(swiper.$wrapperEl).data('swiper');
      if (typeof cloneSwiper === 'object' && $('html').hasClass('is-slide-nav')) {
        cloneSwiper.slideTo(swiper.realIndex, 0);
      }

      $('.home-nav__panel-scroll').each(function () {
        var $this = $(this);
        var panelSwiper = $this.data('swiper');
        if (typeof panelSwiper === 'object') {
          panelSwiper.slideTo(0, 0);
        }
      });
    }
    $homeNav.swiperSet({
      touchReleaseOnEdges: true,
      on: {
        init: function () {
          homeNaveChange(this);
          homeListChange($homeList.data('swiper'));
        },
        slideChange: function () {
          homeNaveChange(this);
        },
      },
    });

    var $homeNavTabScroll = $('.home-nav__panel-scroll');
    $homeNavTabScroll.swiperSet({
      //scrollbarControl: true,
      direction: 'vertical',
      slidesPerView: 'auto',
      freeMode: true,
      mousewheel: true,
    });

    homeSlideResize();
  }
  function homeSlideResize() {
    if ($('.contents-wrap--home').length) {
      $('.home-slide > .swiper-object > .swiper-container, .home-wrap, .home-wrap > .swiper-object, .home-wrap > .swiper-object > .swiper-container').css('height', '');
      var height = $('.contents-wrap--home').height();
      $('.home-slide > .swiper-object > .swiper-container, .home-wrap, .home-wrap > .swiper-object, .home-wrap > .swiper-object > .swiper-container').height(height);

      var bottomBarHeight = (function () {
        var $bottomBar = $('.bottom-fix-wrap');
        if ($bottomBar.length) {
          return $bottomBar.outerHeight();
        } else {
          return 0;
        }
      })();
      var homeHeight = $('.home-search').outerHeight() + $('.home-tags').outerHeight() + $('.home-banner__link').outerHeight() + $('.home-menu').outerHeight() + bottomBarHeight + 4;
      $('.home-wrap__doc').css('min-height', homeHeight + 'px');

      $('.home-nav, .home-nav-slide > .swiper-object, .home-nav-slide > .swiper-object > .swiper-container').css('height', '');
      var navHeight = $('.home-nav-slide').height();
      $('.home-nav, .home-nav-slide > .swiper-object, .home-nav-slide > .swiper-object > .swiper-container').height(navHeight);

      $('.home-wrap__scroll, .home-nav__tab-list, .home-nav__panel-scroll').each(function () {
        var $this = $(this);
        var swiper = $this.data('swiper');
        if (typeof swiper === 'object') {
          swiper.update();
        }
      });

      var $visual = $('.home-visual');
      if ($visual.outerHeight() > 100) {
        $visual.addClass('is-illust');
      } else {
        $visual.removeClass('is-illust');
      }
    }
  }
  $doc.on('click.homeSlide', '.home-nav__tab-link', function () {
    var $this = $(this);
    var $nav = $this.closest('.home-nav').find('.home-nav-slide__list');
    var navSwiper = $nav.data('swiper');
    var index = $this.closest('.home-nav__tab-item').index();
    if (typeof navSwiper === 'object') {
      navSwiper.slideTo(index);
    }
  });

  // search bar
  $doc
    .on('click.searchBar', '.is-home-page .header-wrap .header__button--search', function () {
      var $searchBar = $('.home-nav__search');
      var $html = $('html');
      $html.addClass('is-opened-search-bar');
      $searchBar
        .stop()
        .css('overflow', 'hidden')
        .animate(
          {
            height: 68,
          },
          function () {
            $searchBar.css('overflow', 'visible');
            homeSlideResize();
          }
        );
    })
    .on('click.searchBar', '.is-home-page .header-wrap .header__button--close', function () {
      var $searchBar = $('.home-nav__search');
      var $html = $('html');
      $html.removeClass('is-opened-search-bar');
      $searchBar
        .stop()
        .css('overflow', 'hidden')
        .animate(
          {
            height: 0,
          },
          function () {
            homeSlideResize();
          }
        );
    });

  // total bar
  function totalBarScroll() {
    var $wrap = $('.total-bar:not(.total-bar--in-contents)');
    var $block = $('.total-bar__block');
    var $billList = $('.bill-list');
    var billTop = 0;
    var wrapTop = 0;
    var blockHeight = 0;
    var scrollTop = 0;
    var winHeight = 0;

    if ($wrap.length && $billList.length) {
      billTop = $billList.offset().top;
      wrapTop = $wrap.offset().top;
      blockHeight = $block.outerHeight();
      scrollTop = $win.scrollTop();
      winHeight = $win.height();

      if (scrollTop + winHeight > billTop + 100 && scrollTop < wrapTop - winHeight + blockHeight) {
        $wrap.addClass('is-fixed');
      } else {
        $wrap.removeClass('is-fixed');
      }
    }
  }
  $doc.on('uiAccordionAfterOpened.totalBar uiAccordionAfterClosed.totalBar', '.total-bar.js-ui-accordion', function () {
    var $wrap = $('.total-bar');
    var $block = $('.total-bar__block');
    var blockHeight = $block.outerHeight();

    $wrap.height(blockHeight);
  });

  // agree open
  $doc
    .on('change.agreeOpen', '.js-agree-open', function () {
      var $this = $(this);
      var $wrap = $this.closest('.js-ui-accordion');
      var $thisItem = $this.closest('.js-ui-accordion__item');
      var isChecked = $this.is(':checked');

      if ($wrap.length && isChecked) {
        $wrap.uiAccordion('open', $thisItem);
      }
    })
    .on('change.agreeOpen', '.js-agree-open-toggle', function () {
      var $this = $(this);
      var $wrap = $this.closest('.js-ui-accordion');
      var $thisItem = $this.closest('.js-ui-accordion__item');
      var isChecked = $this.is(':checked');

      if ($wrap.length) {
        if (isChecked) {
          $wrap.uiAccordion('open', $thisItem);
        } else {
          $wrap.uiAccordion('close', $thisItem);
        }
      }
    });

  // swiper refresh
  $doc.on('checkboxTabChange.swiperRefresh', '[data-checkbox-tab-panel]', function () {
    var $this = $(this);
    var $swiper = $this.find('.swiper-wrapper');
    var swiper = $swiper.length && $swiper.data('swiper');

    if (typeof swiper === 'object') {
      swiper.update();
    }
  });

  // zip code
  $doc
    .on('click.uiJSZipCode', '.zip-code-list__link', function () {
      var $this = $(this);
      var $search = $this.closest('.zip-code-search');
      var $detail = $search.siblings('.zip-code-detail-address');
      var $scroller = $this.closest('.ui-layer__body');

      if ($search.length) {
        $search.css('display', 'none');
        $detail.css('display', 'block');
        $scroller.scrollTop(0);
      }
    })
    .on('layerOpened.uiJSZipCode', '.layer-find-zip-code', function () {
      var $this = $(this);
      var $search = $this.find('.zip-code-search');
      var $detail = $this.find('.zip-code-detail-address');

      $search.css('display', 'block');
      $detail.css('display', 'none');
      $search.uiTabPanel('open', 'zipCode1', false);
    })
    .on('uiTabPanelChange.uiJSZipCode', '.zip-code-panel--names-or-number', function () {
      var $this = $(this);
      var $tab = $this.find('.js-ui-tab-panel');

      $tab.uiTabPanel('open', 'zipCodeNamesOrNumber1', false);
    })
    .on('uiTabPanelChange.uiJSZipCode', '.zip-code-panel--names-or-number .js-ui-tab-panel', function (e) {
      e.stopPropagation();
    });

  // full layer opened class
  var fullLayerOpenedClass = {
    className: {
      target: 'layer-wrap--full',
      opened: 'js-html-full-layer-opened',
    },
  };
  $doc
    .on('layerOpened.fullLayerOpenedClass', '.' + fullLayerOpenedClass.className.target, function () {
      var $html = $('html');

      $html.addClass(fullLayerOpenedClass.className.opened);
    })
    .on('layerClosed.fullLayerOpenedClass', '.' + fullLayerOpenedClass.className.target, function () {
      var $html = $('html');
      var $openedLayer = $('.' + fullLayerOpenedClass.className.target + '.js-layer-opened');

      if (!$openedLayer.length) {
        $html.removeClass(fullLayerOpenedClass.className.opened);
      }
    });

  // layer opened scroll to start
  $doc.on('layerOpened.layerOpenedScrollToStart', '.layer-wrap', function () {
    var $this = $(this);
    var $scroller = $this.find('.ui-alert__body--scroll, .ui-layer__body, .gnb__tab, .gnb__panel');

    $this.scrollTop(0).scrollLeft(0);
    $scroller.scrollTop(0).scrollLeft(0);
  });

  // intro visual
  function introResize() {
    var $visual = $('.intro-visual');
    if ($visual.outerHeight() > 100) {
      $visual.addClass('is-illust');
    } else {
      $visual.removeClass('is-illust');
    }
  }

  // input focus class
  var inputFocusClass = {
    input: 'textarea, [type="text"], [type="password"], [type="search"], [type="email"], [type="url"], [type="number"], [type="tel"], [type="date"], [type="time"]',
    className: 'is-text-input-focus',
    update: function ($input, isFocus) {
      var $html = $('html');
      var $header = $('.header-wrap');
      var headerH = ($header.length)? $('.header-wrap').outerHeight() : 0;
      var offsetTop = $input.offset().top
      var scrollTop = offsetTop - headerH - 40;

      if (isFocus) {
        $html.addClass(inputFocusClass.className);
        if (userAgentCheck.isAndroid) {
          $win.scrollTop(scrollTop);
        }
      } else {
        $html.removeClass(inputFocusClass.className);
      }

      uiJSResize();
    },
  };
  $doc
    .on('focus.inputFocusClass', inputFocusClass.input, function () {
      inputFocusClass.update($(this), true);
    })
    .on('blur.inputFocusClass', inputFocusClass.input, function () {
      inputFocusClass.update($(this), false);
    });

  // dom ready
  $(function () {
    var $html = $('html');
    var $body = $('body');

    if (userAgentCheck.isIos) {
      $('meta[name="viewport"]').attr('content', 'width=device-width, initial-scale=1, minimum-scale=1, user-scalable=no');
      $html.addClass('is-ios-os');
    }

    if (userAgentCheck.isAndroid) {
      $html.addClass('is-android-os');
    }

    scrollbarsWidth.set();
    uiJSCommon();

    // css set
    if (scrollbarsWidth.width > 0) {
      $body.prepend(
        '<style type="text/css">' +
          '.is-scroll-blocking.is-scrollbars-width #wrap {' +
          'margin-right: ' +
          scrollbarsWidth.width +
          'px;' +
          '}\n' +
          '.is-scroll-blocking.is-scrollbars-width .header-wrap {' +
          'right: ' +
          scrollbarsWidth.width +
          'px;' +
          '}\n' +
          '.is-scroll-blocking.is-scrollbars-width .bottom-fix-wrap {' +
          'right: ' +
          scrollbarsWidth.width +
          'px;' +
          '}' +
          '</style>'
      );
    }

    // intro
    if ($('.contents-wrap--intro').length) {
      $html.addClass('is-intro-page');
    }
    introResize();

    // member auth
    if ($('.contents-wrap--member-auth').length) {
      $html.addClass('is-member-auth-page');
    }

    // home
    if ($('.calling-bar').length) {
      $html.addClass('is-calling');
    }
    if ($('.contents-wrap--home').length) {
      $html.addClass('is-home-page');
      homeSlide();
    }

    // call-transfer-end
    if ($('.contents-wrap--call-transfer-end').length) {
      $html.addClass('is-call-transfer-end-page');
    }

    // end
    if ($('.contents-wrap--end').length) {
      $html.addClass('is-end-page');
    }

    // total bar
    if ($('.total-bar:not(.total-bar--in-contents)').length) {
      $html.addClass('is-total-bar');
    }
    totalBarScroll();

    cardSlide.init();
    uiJSResize();
  });

  // win load, scroll, resize
  $win
    .on('load.uiJS', function () {
      uiJSResize();
      homeSlideResize();
      introResize();
    })
    .on('scroll.uiJS', function () {
      totalBarScroll();
    })
    .on('resize.uiJS', function () {
      uiJSResize();
      homeSlideResize();
      totalBarScroll();
      introResize();
    })
    .on('orientationchange', function () {
      uiJSResize();
      homeSlideResize();
      introResize();
    });
})(jQuery);
