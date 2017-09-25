var d3 = require('d3');
var document = require('jsdom').jsdom();
var jQuery = require('jquery')(document.defaultView);
// tipsy, facebook style tooltips for jquery
// version 1.0.0a
// (c) 2008-2010 jason frame [jason@onehackoranother.com]
// released under the MIT license

(function($) {
    
    function maybeCall(thing, ctx) {
        return (typeof thing == 'function') ? (thing.call(ctx)) : thing;
    }
    
    function Tipsy(element, options) {
        this.$element = $(element);
        this.options = options;
        this.enabled = true;
        this.fixTitle();
    }
    
    Tipsy.prototype = {
        show: function() {
            var title = this.getTitle();
            if (title && this.enabled) {
                var $tip = this.tip();
                
                $tip.find('.tipsy-inner')[this.options.html ? 'html' : 'text'](title);
                $tip[0].className = 'tipsy'; // reset classname in case of dynamic gravity
                $tip.remove().css({top: 0, left: 0, visibility: 'hidden', display: 'block'}).prependTo(document.body);
                
                // var pos = $.extend({}, this.$element.offset(), {
                //     width: this.$element[0].offsetWidth || 0,
                //     height: this.$element[0].offsetHeight || 0
                // });
                var pos = $.extend({}, this.$element.offset(), {
                    width: this.$element[0].getBoundingClientRect().width || 0,
                    height: this.$element[0].getBoundingClientRect().height || 0
                });

                if (typeof this.$element[0].nearestViewportElement == 'object') {
                    // SVG
          var el = this.$element[0];
                    var rect = el.getBoundingClientRect();
          pos.width = rect.width;
          pos.height = rect.height;
                }

                
                var actualWidth = $tip[0].offsetWidth,
                    actualHeight = $tip[0].offsetHeight,
                    gravity = maybeCall(this.options.gravity, this.$element[0]);
                
                var tp;
                switch (gravity.charAt(0)) {
                    case 'n':
                        tp = {top: pos.top + pos.height + this.options.offset, left: pos.left + pos.width / 2 - actualWidth / 2};
                        break;
                    case 's':
                        tp = {top: pos.top - actualHeight - this.options.offset, left: pos.left + pos.width / 2 - actualWidth / 2};
                        break;
                    case 'e':
                        tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth - this.options.offset};
                        break;
                    case 'w':
                        tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width + this.options.offset};
                        break;
                }
                
                if (gravity.length == 2) {
                    if (gravity.charAt(1) == 'w') {
                        tp.left = pos.left + pos.width / 2 - 15;
                    } else {
                        tp.left = pos.left + pos.width / 2 - actualWidth + 15;
                    }
                }
                
                $tip.css(tp).addClass('tipsy-' + gravity);
                $tip.find('.tipsy-arrow')[0].className = 'tipsy-arrow tipsy-arrow-' + gravity.charAt(0);
                if (this.options.className) {
                    $tip.addClass(maybeCall(this.options.className, this.$element[0]));
                }
                
                if (this.options.fade) {
                    $tip.stop().css({opacity: 0, display: 'block', visibility: 'visible'}).animate({opacity: this.options.opacity});
                } else {
                    $tip.css({visibility: 'visible', opacity: this.options.opacity});
                }

                var t = this;
                var set_hovered  = function(set_hover){
                    return function(){
                        t.$tip.stop();
                        t.tipHovered = set_hover;
                        if (!set_hover){
                            if (t.options.delayOut === 0) {
                                t.hide();
                            } else {
                                setTimeout(function() { 
                                    if (t.hoverState == 'out') t.hide(); }, t.options.delayOut);
                            }
                        }
                    };
                };
               $tip.hover(set_hovered(true), set_hovered(false));
            }
        },
        
        hide: function() {
            if (this.options.fade) {
                this.tip().stop().fadeOut(function() { $(this).remove(); });
            } else {
                this.tip().remove();
            }
        },
        
        fixTitle: function() {
            var $e = this.$element;
            
            if ($e.attr('title') || typeof($e.attr('original-title')) != 'string') {
                $e.attr('original-title', $e.attr('title') || '').removeAttr('title');
            }
            if (typeof $e.context.nearestViewportElement == 'object'){                                                        
                if ($e.children('title').length){
                    $e.append('<original-title>' + ($e.children('title').text() || '') + '</original-title>')
                        .children('title').remove();
                }
            }
        },
        
        getTitle: function() {
            
            var title, $e = this.$element, o = this.options;
            this.fixTitle();

            if (typeof o.title == 'string') {
                var title_name = o.title == 'title' ? 'original-title' : o.title;
                if ($e.children(title_name).length){
                    title = $e.children(title_name).html();
                } else{
                    title = $e.attr(title_name);
                }
                
            } else if (typeof o.title == 'function') {
                title = o.title.call($e[0]);
            }
            title = ('' + title).replace(/(^\s*|\s*$)/, "");
            return title || o.fallback;
        },
        
        tip: function() {
            if (!this.$tip) {
                this.$tip = $('<div class="tipsy"></div>').html('<div class="tipsy-arrow"></div><div class="tipsy-inner"></div>');
            }
            return this.$tip;
        },
        
        validate: function() {
            if (!this.$element[0].parentNode) {
                this.hide();
                this.$element = null;
                this.options = null;
            }
        },
        
        enable: function() { this.enabled = true; },
        disable: function() { this.enabled = false; },
        toggleEnabled: function() { this.enabled = !this.enabled; }
    };
    
    $.fn.tipsy = function(options) {
        
        if (options === true) {
            return this.data('tipsy');
        } else if (typeof options == 'string') {
            var tipsy = this.data('tipsy');
            if (tipsy) tipsy[options]();
            return this;
        }
        
        options = $.extend({}, $.fn.tipsy.defaults, options);

        if (options.hoverlock && options.delayOut === 0) {
      options.delayOut = 100;
  }
        
        function get(ele) {
            var tipsy = $.data(ele, 'tipsy');
            if (!tipsy) {
                tipsy = new Tipsy(ele, $.fn.tipsy.elementOptions(ele, options));
                $.data(ele, 'tipsy', tipsy);
            }
            return tipsy;
        }
        
        function enter() {
            var tipsy = get(this);
            tipsy.hoverState = 'in';
            if (options.delayIn === 0) {
                tipsy.show();
            } else {
                tipsy.fixTitle();
                setTimeout(function() { if (tipsy.hoverState == 'in') tipsy.show(); }, options.delayIn);
            }
        }
        
        function leave() {
            var tipsy = get(this);
            tipsy.hoverState = 'out';
            if (options.delayOut === 0) {
                tipsy.hide();
            } else {
                var to = function() {
                    if (!tipsy.tipHovered || !options.hoverlock){
                        if (tipsy.hoverState == 'out') tipsy.hide(); 
                    }
                };
                setTimeout(to, options.delayOut);
            }    
        }

        if (options.trigger != 'manual') {
            var binder = options.live ? 'live' : 'bind',
                eventIn = options.trigger == 'hover' ? 'mouseenter' : 'focus',
                eventOut = options.trigger == 'hover' ? 'mouseleave' : 'blur';
            this[binder](eventIn, enter)[binder](eventOut, leave);
        }
        
        return this;
        
    };
    
    $.fn.tipsy.defaults = {
        className: null,
        delayIn: 0,
        delayOut: 0,
        fade: false,
        fallback: '',
        gravity: 'n',
        html: false,
        live: false,
        offset: 0,
        opacity: 0.7,
        title: 'title',
        trigger: 'hover',
        hoverlock: false
    };
    
    // Overwrite this method to provide options on a per-element basis.
    // For example, you could store the gravity in a 'tipsy-gravity' attribute:
    // return $.extend({}, options, {gravity: $(ele).attr('tipsy-gravity') || 'n' });
    // (remember - do not modify 'options' in place!)
    $.fn.tipsy.elementOptions = function(ele, options) {
        return $.metadata ? $.extend({}, options, $(ele).metadata()) : options;
    };
    
    $.fn.tipsy.autoNS = function() {
        return $(this).offset().top > ($(document).scrollTop() + $(window).height() / 2) ? 's' : 'n';
    };
    
    $.fn.tipsy.autoWE = function() {
        return $(this).offset().left > ($(document).scrollLeft() + $(window).width() / 2) ? 'e' : 'w';
    };
    
    /**
     * yields a closure of the supplied parameters, producing a function that takes
     * no arguments and is suitable for use as an autogravity function like so:
     *
     * @param margin (int) - distance from the viewable region edge that an
     *        element should be before setting its tooltip's gravity to be away
     *        from that edge.
     * @param prefer (string, e.g. 'n', 'sw', 'w') - the direction to prefer
     *        if there are no viewable region edges effecting the tooltip's
     *        gravity. It will try to vary from this minimally, for example,
     *        if 'sw' is preferred and an element is near the right viewable 
     *        region edge, but not the top edge, it will set the gravity for
     *        that element's tooltip to be 'se', preserving the southern
     *        component.
     */
     $.fn.tipsy.autoBounds = function(margin, prefer) {
    return function() {
      var dir = {ns: prefer[0], ew: (prefer.length > 1 ? prefer[1] : false)},
          boundTop = $(document).scrollTop() + margin,
          boundLeft = $(document).scrollLeft() + margin,
          $this = $(this);

      if ($this.offset().top < boundTop) dir.ns = 'n';
      if ($this.offset().left < boundLeft) dir.ew = 'w';
      if ($(window).width() + $(document).scrollLeft() - $this.offset().left < margin) dir.ew = 'e';
      if ($(window).height() + $(document).scrollTop() - $this.offset().top < margin) dir.ns = 's';

      return dir.ns + (dir.ew ? dir.ew : '');
    };
    };
})(jQuery);
/******************************************************************************
 * Copyright (c) 2016, GraphSQL Inc.                                          *
 * All rights reserved                                                        *
 * Unauthorized copying of this file, via any medium is strictly prohibited   *
 * Proprietary and confidential                                               *
 ******************************************************************************/
(function(undefined) {
  "use strict";
  console.log('Loading gvis')

  var __instances = 0;

  var gvis = function(conf) {

    //local data object.
    var _this = {};

    var version = '0.1.3'

    //return the version information.
    Object.defineProperty(this, 'version', {
      get: function() { return 'gvis version('+ version + ')'; },
      set: function(newValue) { },
    })

    //Retuen local data object _this.
    Object.defineProperty(this, 'scope', {
      get: function() { return _this; },
      set: function(newValue) {
        try {
          throw new Error("scope is read-only.")
        }
        catch (err) {
          console.log(err)
        }
      }
    })

    _this._instanceIndex = __instances++;

    _this.settings = gvis.settings;
    _this.conf = conf || {};
    _this.conf_index = 0;

    _this.graph = new gvis.graph(_this);
    _this.layouts = new gvis.layouts(_this);

    //_this.events = {};

    _this.behaviors = gvis.utils.clone(gvis.behaviors);
    _this.renderer = new gvis.renders(_this);

    _this.language = {
      translate: function(english, type, label) {
        return english;
      }
    };

    _this.gvis = this;
  }

  this.gvis = gvis;
}).call(this);

/******************************************************************************
 * Copyright (c) 2016, GraphSQL Inc.                                          *
 * All rights reserved                                                        *
 * Unauthorized copying of this file, via any medium is strictly prohibited   *
 * Proprietary and confidential                                               *
 ******************************************************************************/
(function(undefined) {
  "use strict";

  var gvis = this.gvis;

  console.log('Loading gvis.utils')

  // Initialize 
  gvis.utils = gvis.utils || {}

  // replace special charactors
  gvis.utils.replaceAllSpecialCharactors = function (str) {
    return str.replace(/[\. /[&\/\\#,+()$~%.'":*?<>{}]/g, "_");
  }

  // color class
  gvis.utils.color = function() {
    this.colorArray = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf", "#aec7e8", "#ffbb78", "#98df8a", "#ff9896", "#c5b0d5", "#c49c94", "#f7b6d2", "#c7c7c7", "#dbdb8d", "#9edae5", "#393b79", "#5254a3", "#6b6ecf", "#9c9ede", "#637939", "#8ca252", "#b5cf6b", "#cedb9c", "#8c6d31", "#bd9e39", "#e7ba52", "#e7cb94", "#843c39", "#ad494a", "#d6616b", "#e7969c", "#7b4173", "#a55194", "#ce6dbd", "#de9ed6", "#3182bd", "#6baed6", "#9ecae1", "#c6dbef", "#e6550d", "#fd8d3c", "#fdae6b", "#fdd0a2", "#31a354", "#74c476", "#a1d99b", "#c7e9c0", "#756bb1", "#9e9ac8", "#bcbddc", "#dadaeb", "#636363", "#969696", "#bdbdbd", "#d9d9d9"];

    // Color Object;
    var nodeColorMap = {};
    this.nodeColor = function(type) {
      if (type === undefined) {
        console.error('type is ', type);
        return type;
      }

      if (nodeColorMap[type] == undefined) {
        nodeColorMap[type] = Object.keys(nodeColorMap).length;
      }

      return this.colorArray[nodeColorMap[type] % this.colorArray.length];
    }

    var linkColorMap = {};
    this.linkColor = function(type) {
      if (type === undefined) {
        console.error('type is ', type);
        return type;
      }
      
      if (linkColorMap[type] == undefined) {
        linkColorMap[type] = Object.keys(linkColorMap).length;
      }

      return this.colorArray[linkColorMap[type] % this.colorArray.length];
    }

    this.initialize = function(nodes, links) {
      var that = this;
      nodes.forEach(function(n, i) {
        that.nodeColor(n);
      });

      links.forEach(function(l, i) {
        that.linkColor(l);
      })
    }

    // Color Map;
    this.node = {};
    this.link = {};


    // APIs;
    this.getNodeColor = function(type) {
      if (this.node[type] === undefined) {
        this.node[type] = this.nodeColor(type);
      }

      return this.node[type];
    }

    this.getLinkColor = function(type) {
      if (this.link[type] === undefined) {
        this.link[type] = this.linkColor(type);
      }

      return this.link[type];
    }

    this.setNodeColor = function(type, color) {
      this.node[type] = color;
    }

    this.setLinkColor = function(type, color) {
      this.link[type] = color;
    }

    this.randomColor = function () {
      return '#' + (function co(lor){   return (lor +=
      [0,1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f'][Math.floor(Math.random()*16)])
      && (lor.length == 6) ?  lor : co(lor); })('')
    }
  }

  // run jobs individually
  gvis.utils.jobs = function() {

    this.doit = setTimeout(undefined);

    this.runTask = function(cb, interval) {
      clearTimeout(this.doit);
      interval = interval === undefined ? 100 : interval;

      this.doit = setTimeout(cb, interval);
    }

    this.runRepeatTask = function(task, N, interval) {
      setTimeout(function() {
        helper(task, 0);
      }, interval);

      function helper(task, i) {
        task(i);

        setTimeout(function() {
          if (i >= N) {
            return ;
          }
          else {
            helper(task, ++i);
          }
        }, interval);
      }
    }


  }

  // Deep copy object and array in javascript (same as jQuery.extend(true, {}, obj))
  gvis.utils.clone = function (obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
 
    var temp = obj.constructor(); // give temp the original obj's constructor
    for (var key in obj) {
      temp[key] = this.clone(obj[key]);
    }
 
    return temp;
  }

  gvis.utils.extend = function(target, source) {
    target = target || {};
    for (var prop in source) {
      if (typeof source[prop] === 'object') {
        target[prop] = this.extend(target[prop], source[prop]);
      } else {
        target[prop] = source[prop];
      }
    }
    return target;
  };

  gvis.utils.shallowEqual = function(a, b) {

    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);

    // If number of properties is different,
    // objects are not equivalent
    if (aProps.length != bProps.length) {
        return false;
    }

    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];

        // If values of same property are not equal,
        // objects are not equivalent
        if (a[propName] !== b[propName]) {
            return false;
        }
    }

    // If we made it this far, objects
    // are considered equivalent
    return true;
  };

  /*
  Example :

  <g id='test'>
    <g>
    <rect width="50" height="50" x = '25' y = '25' fill='red'></rect> 
    <circle r=25 cx= 10 cy = 50 fill='blue'></circle>  
    <g> 
  </g>

  ****


  d3.select('#test')
  .attr('temp', function() {
    //moveGroup.apply(this, [100, 100])
    moveGroup.call(this, 100, 100)
    return 'temp'
  })

  */

  gvis.utils.moveGroup = function (cx, cy) {

    var box = this.getBBox();
    var x = box.x;  
    var y = box.y;
    var width = box.width;
    var height = box.height;

    d3.select(this).select('g')
    .attr('transform', translate(-x, -y))

    d3.select(this)
    .attr('transform', translate(cx-width/2, cy-height/2))
  }


  gvis.utils.getBBox = function (element) {
    // console.error('Called');

    var b = element.getBBox();
    var temp = 0;
    for (var key in b) {
      temp += Math.abs(+b[key]);
    }

    if (temp > 0) {
      return b;
    }

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute('style', 'border: 1px solid black');
    svg.setAttribute('width', '100');
    svg.setAttribute('height', '100');
    svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
    document.body.appendChild(svg);

    var e = element.cloneNode(true);
    svg.appendChild(e);
    b = e.getBBox();
    svg.removeChild(e);

    document.body.removeChild(svg);

    return b;
  };

  /*
  Example :
  template = 'translate({{x}}, {{y}})';

  return applyTemplate(template, {x:10, y:10})

  */
  gvis.utils.applyTemplate = function (template, objects) {
    for (var key in objects) {
      var value = objects[key]
      template = template.replace(new RegExp("{{"+key+"}}", "g"), value)
    }
    
    return template;
  }

  /*

    base on cx, cy, rotato point(x, y) by degree. 



  */
  gvis.utils.rotate = function(cx, cy, x, y, degree) {
    //X' = X cosB - Y sinB
    //Y' = X sinB + Y cosB
    var radians = (Math.PI / 180) * degree,
    cos = Math.cos(radians),
    sin = Math.sin(radians),
    nx = (cos * (x - cx)) - (sin * (y - cy)) + cx,
    ny = (sin * (x - cx)) + (cos * (y - cy)) + cy;
    return [nx, ny];
  }


  /* Return related icon string */
  gvis.utils.icon = function(icon_name) {
    return gvis.utils.fontAwesome[icon_name] || gvis.utils.fontAwesome[gvis.behaviors.default_icon];
  }

  /* Map fontawesome icon name with code. */
  gvis.utils.fontAwesome = {
    'fa-500px':'\uf26e',
    'fa-adjust':'\uf042',
    'fa-adn':'\uf170',
    'fa-align-center':'\uf037',
    'fa-align-justify':'\uf039',
    'fa-align-left':'\uf036',
    'fa-align-right':'\uf038',
    'fa-amazon':'\uf270',
    'fa-ambulance':'\uf0f9',
    'fa-american-sign-language-interpreting':'\uf2a3',
    'fa-anchor':'\uf13d',
    'fa-android':'\uf17b',
    'fa-angellist':'\uf209',
    'fa-angle-double-down':'\uf103',
    'fa-angle-double-left':'\uf100',
    'fa-angle-double-right':'\uf101',
    'fa-angle-double-up':'\uf102',
    'fa-angle-down':'\uf107',
    'fa-angle-left':'\uf104',
    'fa-angle-right':'\uf105',
    'fa-angle-up':'\uf106',
    'fa-apple':'\uf179',
    'fa-archive':'\uf187',
    'fa-area-chart':'\uf1fe',
    'fa-arrow-circle-down':'\uf0ab',
    'fa-arrow-circle-left':'\uf0a8',
    'fa-arrow-circle-o-down':'\uf01a',
    'fa-arrow-circle-o-left':'\uf190',
    'fa-arrow-circle-o-right':'\uf18e',
    'fa-arrow-circle-o-up':'\uf01b',
    'fa-arrow-circle-right':'\uf0a9',
    'fa-arrow-circle-up':'\uf0aa',
    'fa-arrow-down':'\uf063',
    'fa-arrow-left':'\uf060',
    'fa-arrow-right':'\uf061',
    'fa-arrow-up':'\uf062',
    'fa-arrows':'\uf047',
    'fa-arrows-alt':'\uf0b2',
    'fa-arrows-h':'\uf07e',
    'fa-arrows-v':'\uf07d',
    'fa-asl-interpreting':'\uf2a3',
    'fa-assistive-listening-systems':'\uf2a2',
    'fa-asterisk':'\uf069',
    'fa-at':'\uf1fa',
    'fa-audio-description':'\uf29e',
    'fa-automobile':'\uf1b9',
    'fa-backward':'\uf04a',
    'fa-balance-scale':'\uf24e',
    'fa-ban':'\uf05e',
    'fa-bank':'\uf19c',
    'fa-bar-chart':'\uf080',
    'fa-bar-chart-o':'\uf080',
    'fa-barcode':'\uf02a',
    'fa-bars':'\uf0c9',
    'fa-battery-0':'\uf244',
    'fa-battery-1':'\uf243',
    'fa-battery-2':'\uf242',
    'fa-battery-3':'\uf241',
    'fa-battery-4':'\uf240',
    'fa-battery-empty':'\uf244',
    'fa-battery-full':'\uf240',
    'fa-battery-half':'\uf242',
    'fa-battery-quarter':'\uf243',
    'fa-battery-three-quarters':'\uf241',
    'fa-bed':'\uf236',
    'fa-beer':'\uf0fc',
    'fa-behance':'\uf1b4',
    'fa-behance-square':'\uf1b5',
    'fa-bell':'\uf0f3',
    'fa-bell-o':'\uf0a2',
    'fa-bell-slash':'\uf1f6',
    'fa-bell-slash-o':'\uf1f7',
    'fa-bicycle':'\uf206',
    'fa-binoculars':'\uf1e5',
    'fa-birthday-cake':'\uf1fd',
    'fa-bitbucket':'\uf171',
    'fa-bitbucket-square':'\uf172',
    'fa-bitcoin':'\uf15a',
    'fa-black-tie':'\uf27e',
    'fa-blind':'\uf29d',
    'fa-bluetooth':'\uf293',
    'fa-bluetooth-b':'\uf294',
    'fa-bold':'\uf032',
    'fa-bolt':'\uf0e7',
    'fa-bomb':'\uf1e2',
    'fa-book':'\uf02d',
    'fa-bookmark':'\uf02e',
    'fa-bookmark-o':'\uf097',
    'fa-braille':'\uf2a1',
    'fa-briefcase':'\uf0b1',
    'fa-btc':'\uf15a',
    'fa-bug':'\uf188',
    'fa-building':'\uf1ad',
    'fa-building-o':'\uf0f7',
    'fa-bullhorn':'\uf0a1',
    'fa-bullseye':'\uf140',
    'fa-bus':'\uf207',
    'fa-buysellads':'\uf20d',
    'fa-cab':'\uf1ba',
    'fa-calculator':'\uf1ec',
    'fa-calendar':'\uf073',
    'fa-calendar-check-o':'\uf274',
    'fa-calendar-minus-o':'\uf272',
    'fa-calendar-o':'\uf133',
    'fa-calendar-plus-o':'\uf271',
    'fa-calendar-times-o':'\uf273',
    'fa-camera':'\uf030',
    'fa-camera-retro':'\uf083',
    'fa-car':'\uf1b9',
    'fa-caret-down':'\uf0d7',
    'fa-caret-left':'\uf0d9',
    'fa-caret-right':'\uf0da',
    'fa-caret-square-o-down':'\uf150',
    'fa-caret-square-o-left':'\uf191',
    'fa-caret-square-o-right':'\uf152',
    'fa-caret-square-o-up':'\uf151',
    'fa-caret-up':'\uf0d8',
    'fa-cart-arrow-down':'\uf218',
    'fa-cart-plus':'\uf217',
    'fa-cc':'\uf20a',
    'fa-cc-amex':'\uf1f3',
    'fa-cc-diners-club':'\uf24c',
    'fa-cc-discover':'\uf1f2',
    'fa-cc-jcb':'\uf24b',
    'fa-cc-mastercard':'\uf1f1',
    'fa-cc-paypal':'\uf1f4',
    'fa-cc-stripe':'\uf1f5',
    'fa-cc-visa':'\uf1f0',
    'fa-certificate':'\uf0a3',
    'fa-chain':'\uf0c1',
    'fa-chain-broken':'\uf127',
    'fa-check':'\uf00c',
    'fa-check-circle':'\uf058',
    'fa-check-circle-o':'\uf05d',
    'fa-check-square':'\uf14a',
    'fa-check-square-o':'\uf046',
    'fa-chevron-circle-down':'\uf13a',
    'fa-chevron-circle-left':'\uf137',
    'fa-chevron-circle-right':'\uf138',
    'fa-chevron-circle-up':'\uf139',
    'fa-chevron-down':'\uf078',
    'fa-chevron-left':'\uf053',
    'fa-chevron-right':'\uf054',
    'fa-chevron-up':'\uf077',
    'fa-child':'\uf1ae',
    'fa-chrome':'\uf268',
    'fa-circle':'\uf111',
    'fa-circle-o':'\uf10c',
    'fa-circle-o-notch':'\uf1ce',
    'fa-circle-thin':'\uf1db',
    'fa-clipboard':'\uf0ea',
    'fa-clock-o':'\uf017',
    'fa-clone':'\uf24d',
    'fa-close':'\uf00d',
    'fa-cloud':'\uf0c2',
    'fa-cloud-download':'\uf0ed',
    'fa-cloud-upload':'\uf0ee',
    'fa-cny':'\uf157',
    'fa-code':'\uf121',
    'fa-code-fork':'\uf126',
    'fa-codepen':'\uf1cb',
    'fa-codiepie':'\uf284',
    'fa-coffee':'\uf0f4',
    'fa-cog':'\uf013',
    'fa-cogs':'\uf085',
    'fa-columns':'\uf0db',
    'fa-comment':'\uf075',
    'fa-comment-o':'\uf0e5',
    'fa-commenting':'\uf27a',
    'fa-commenting-o':'\uf27b',
    'fa-comments':'\uf086',
    'fa-comments-o':'\uf0e6',
    'fa-compass':'\uf14e',
    'fa-compress':'\uf066',
    'fa-connectdevelop':'\uf20e',
    'fa-contao':'\uf26d',
    'fa-copy':'\uf0c5',
    'fa-copyright':'\uf1f9',
    'fa-creative-commons':'\uf25e',
    'fa-credit-card':'\uf09d',
    'fa-credit-card-alt':'\uf283',
    'fa-crop':'\uf125',
    'fa-crosshairs':'\uf05b',
    'fa-css3':'\uf13c',
    'fa-cube':'\uf1b2',
    'fa-cubes':'\uf1b3',
    'fa-cut':'\uf0c4',
    'fa-cutlery':'\uf0f5',
    'fa-dashboard':'\uf0e4',
    'fa-dashcube':'\uf210',
    'fa-database':'\uf1c0',
    'fa-deaf':'\uf2a4',
    'fa-deafness':'\uf2a4',
    'fa-dedent':'\uf03b',
    'fa-delicious':'\uf1a5',
    'fa-desktop':'\uf108',
    'fa-deviantart':'\uf1bd',
    'fa-diamond':'\uf219',
    'fa-digg':'\uf1a6',
    'fa-dollar':'\uf155',
    'fa-dot-circle-o':'\uf192',
    'fa-download':'\uf019',
    'fa-dribbble':'\uf17d',
    'fa-dropbox':'\uf16b',
    'fa-drupal':'\uf1a9',
    'fa-edge':'\uf282',
    'fa-edit':'\uf044',
    'fa-eject':'\uf052',
    'fa-ellipsis-h':'\uf141',
    'fa-ellipsis-v':'\uf142',
    'fa-empire':'\uf1d1',
    'fa-envelope':'\uf0e0',
    'fa-envelope-o':'\uf003',
    'fa-envelope-square':'\uf199',
    'fa-envira':'\uf299',
    'fa-eraser':'\uf12d',
    'fa-eur':'\uf153',
    'fa-euro':'\uf153',
    'fa-exchange':'\uf0ec',
    'fa-exclamation':'\uf12a',
    'fa-exclamation-circle':'\uf06a',
    'fa-exclamation-triangle':'\uf071',
    'fa-expand':'\uf065',
    'fa-expeditedssl':'\uf23e',
    'fa-external-link':'\uf08e',
    'fa-external-link-square':'\uf14c',
    'fa-eye':'\uf06e',
    'fa-eye-slash':'\uf070',
    'fa-eyedropper':'\uf1fb',
    'fa-fa':'\uf2b4',
    'fa-facebook':'\uf09a',
    'fa-facebook-f':'\uf09a',
    'fa-facebook-official':'\uf230',
    'fa-facebook-square':'\uf082',
    'fa-fast-backward':'\uf049',
    'fa-fast-forward':'\uf050',
    'fa-fax':'\uf1ac',
    'fa-feed':'\uf09e',
    'fa-female':'\uf182',
    'fa-fighter-jet':'\uf0fb',
    'fa-file':'\uf15b',
    'fa-file-archive-o':'\uf1c6',
    'fa-file-audio-o':'\uf1c7',
    'fa-file-code-o':'\uf1c9',
    'fa-file-excel-o':'\uf1c3',
    'fa-file-image-o':'\uf1c5',
    'fa-file-movie-o':'\uf1c8',
    'fa-file-o':'\uf016',
    'fa-file-pdf-o':'\uf1c1',
    'fa-file-photo-o':'\uf1c5',
    'fa-file-picture-o':'\uf1c5',
    'fa-file-powerpoint-o':'\uf1c4',
    'fa-file-sound-o':'\uf1c7',
    'fa-file-text':'\uf15c',
    'fa-file-text-o':'\uf0f6',
    'fa-file-video-o':'\uf1c8',
    'fa-file-word-o':'\uf1c2',
    'fa-file-zip-o':'\uf1c6',
    'fa-files-o':'\uf0c5',
    'fa-film':'\uf008',
    'fa-filter':'\uf0b0',
    'fa-fire':'\uf06d',
    'fa-fire-extinguisher':'\uf134',
    'fa-firefox':'\uf269',
    'fa-first-order':'\uf2b0',
    'fa-flag':'\uf024',
    'fa-flag-checkered':'\uf11e',
    'fa-flag-o':'\uf11d',
    'fa-flash':'\uf0e7',
    'fa-flask':'\uf0c3',
    'fa-flickr':'\uf16e',
    'fa-floppy-o':'\uf0c7',
    'fa-folder':'\uf07b',
    'fa-folder-o':'\uf114',
    'fa-folder-open':'\uf07c',
    'fa-folder-open-o':'\uf115',
    'fa-font':'\uf031',
    'fa-font-awesome':'\uf2b4',
    'fa-fonticons':'\uf280',
    'fa-fort-awesome':'\uf286',
    'fa-forumbee':'\uf211',
    'fa-forward':'\uf04e',
    'fa-foursquare':'\uf180',
    'fa-frown-o':'\uf119',
    'fa-futbol-o':'\uf1e3',
    'fa-gamepad':'\uf11b',
    'fa-gavel':'\uf0e3',
    'fa-gbp':'\uf154',
    'fa-ge':'\uf1d1',
    'fa-gear':'\uf013',
    'fa-gears':'\uf085',
    'fa-genderless':'\uf22d',
    'fa-get-pocket':'\uf265',
    'fa-gg':'\uf260',
    'fa-gg-circle':'\uf261',
    'fa-gift':'\uf06b',
    'fa-git':'\uf1d3',
    'fa-git-square':'\uf1d2',
    'fa-github':'\uf09b',
    'fa-github-alt':'\uf113',
    'fa-github-square':'\uf092',
    'fa-gitlab':'\uf296',
    'fa-gittip':'\uf184',
    'fa-glass':'\uf000',
    'fa-glide':'\uf2a5',
    'fa-glide-g':'\uf2a6',
    'fa-globe':'\uf0ac',
    'fa-google':'\uf1a0',
    'fa-google-plus':'\uf0d5',
    'fa-google-plus-circle':'\uf2b3',
    'fa-google-plus-official':'\uf2b3',
    'fa-google-plus-square':'\uf0d4',
    'fa-google-wallet':'\uf1ee',
    'fa-graduation-cap':'\uf19d',
    'fa-gratipay':'\uf184',
    'fa-group':'\uf0c0',
    'fa-h-square':'\uf0fd',
    'fa-hacker-news':'\uf1d4',
    'fa-hand-grab-o':'\uf255',
    'fa-hand-lizard-o':'\uf258',
    'fa-hand-o-down':'\uf0a7',
    'fa-hand-o-left':'\uf0a5',
    'fa-hand-o-right':'\uf0a4',
    'fa-hand-o-up':'\uf0a6',
    'fa-hand-paper-o':'\uf256',
    'fa-hand-peace-o':'\uf25b',
    'fa-hand-pointer-o':'\uf25a',
    'fa-hand-rock-o':'\uf255',
    'fa-hand-scissors-o':'\uf257',
    'fa-hand-spock-o':'\uf259',
    'fa-hand-stop-o':'\uf256',
    'fa-hard-of-hearing':'\uf2a4',
    'fa-hashtag':'\uf292',
    'fa-hdd-o':'\uf0a0',
    'fa-header':'\uf1dc',
    'fa-headphones':'\uf025',
    'fa-heart':'\uf004',
    'fa-heart-o':'\uf08a',
    'fa-heartbeat':'\uf21e',
    'fa-history':'\uf1da',
    'fa-home':'\uf015',
    'fa-hospital-o':'\uf0f8',
    'fa-hotel':'\uf236',
    'fa-hourglass':'\uf254',
    'fa-hourglass-1':'\uf251',
    'fa-hourglass-2':'\uf252',
    'fa-hourglass-3':'\uf253',
    'fa-hourglass-end':'\uf253',
    'fa-hourglass-half':'\uf252',
    'fa-hourglass-o':'\uf250',
    'fa-hourglass-start':'\uf251',
    'fa-houzz':'\uf27c',
    'fa-html5':'\uf13b',
    'fa-i-cursor':'\uf246',
    'fa-ils':'\uf20b',
    'fa-image':'\uf03e',
    'fa-inbox':'\uf01c',
    'fa-indent':'\uf03c',
    'fa-industry':'\uf275',
    'fa-info':'\uf129',
    'fa-info-circle':'\uf05a',
    'fa-inr':'\uf156',
    'fa-instagram':'\uf16d',
    'fa-institution':'\uf19c',
    'fa-internet-explorer':'\uf26b',
    'fa-intersex':'\uf224',
    'fa-ioxhost':'\uf208',
    'fa-italic':'\uf033',
    'fa-joomla':'\uf1aa',
    'fa-jpy':'\uf157',
    'fa-jsfiddle':'\uf1cc',
    'fa-key':'\uf084',
    'fa-keyboard-o':'\uf11c',
    'fa-krw':'\uf159',
    'fa-language':'\uf1ab',
    'fa-laptop':'\uf109',
    'fa-lastfm':'\uf202',
    'fa-lastfm-square':'\uf203',
    'fa-leaf':'\uf06c',
    'fa-leanpub':'\uf212',
    'fa-legal':'\uf0e3',
    'fa-lemon-o':'\uf094',
    'fa-level-down':'\uf149',
    'fa-level-up':'\uf148',
    'fa-life-bouy':'\uf1cd',
    'fa-life-buoy':'\uf1cd',
    'fa-life-ring':'\uf1cd',
    'fa-life-saver':'\uf1cd',
    'fa-lightbulb-o':'\uf0eb',
    'fa-line-chart':'\uf201',
    'fa-link':'\uf0c1',
    'fa-linkedin':'\uf0e1',
    'fa-linkedin-square':'\uf08c',
    'fa-linux':'\uf17c',
    'fa-list':'\uf03a',
    'fa-list-alt':'\uf022',
    'fa-list-ol':'\uf0cb',
    'fa-list-ul':'\uf0ca',
    'fa-location-arrow':'\uf124',
    'fa-lock':'\uf023',
    'fa-long-arrow-down':'\uf175',
    'fa-long-arrow-left':'\uf177',
    'fa-long-arrow-right':'\uf178',
    'fa-long-arrow-up':'\uf176',
    'fa-low-vision':'\uf2a8',
    'fa-magic':'\uf0d0',
    'fa-magnet':'\uf076',
    'fa-mail-forward':'\uf064',
    'fa-mail-reply':'\uf112',
    'fa-mail-reply-all':'\uf122',
    'fa-male':'\uf183',
    'fa-map':'\uf279',
    'fa-map-marker':'\uf041',
    'fa-map-o':'\uf278',
    'fa-map-pin':'\uf276',
    'fa-map-signs':'\uf277',
    'fa-mars':'\uf222',
    'fa-mars-double':'\uf227',
    'fa-mars-stroke':'\uf229',
    'fa-mars-stroke-h':'\uf22b',
    'fa-mars-stroke-v':'\uf22a',
    'fa-maxcdn':'\uf136',
    'fa-meanpath':'\uf20c',
    'fa-medium':'\uf23a',
    'fa-medkit':'\uf0fa',
    'fa-meh-o':'\uf11a',
    'fa-mercury':'\uf223',
    'fa-microphone':'\uf130',
    'fa-microphone-slash':'\uf131',
    'fa-minus':'\uf068',
    'fa-minus-circle':'\uf056',
    'fa-minus-square':'\uf146',
    'fa-minus-square-o':'\uf147',
    'fa-mixcloud':'\uf289',
    'fa-mobile':'\uf10b',
    'fa-mobile-phone':'\uf10b',
    'fa-modx':'\uf285',
    'fa-money':'\uf0d6',
    'fa-moon-o':'\uf186',
    'fa-mortar-board':'\uf19d',
    'fa-motorcycle':'\uf21c',
    'fa-mouse-pointer':'\uf245',
    'fa-music':'\uf001',
    'fa-navicon':'\uf0c9',
    'fa-neuter':'\uf22c',
    'fa-newspaper-o':'\uf1ea',
    'fa-object-group':'\uf247',
    'fa-object-ungroup':'\uf248',
    'fa-odnoklassniki':'\uf263',
    'fa-odnoklassniki-square':'\uf264',
    'fa-opencart':'\uf23d',
    'fa-openid':'\uf19b',
    'fa-opera':'\uf26a',
    'fa-optin-monster':'\uf23c',
    'fa-outdent':'\uf03b',
    'fa-pagelines':'\uf18c',
    'fa-paint-brush':'\uf1fc',
    'fa-paper-plane':'\uf1d8',
    'fa-paper-plane-o':'\uf1d9',
    'fa-paperclip':'\uf0c6',
    'fa-paragraph':'\uf1dd',
    'fa-paste':'\uf0ea',
    'fa-pause':'\uf04c',
    'fa-pause-circle':'\uf28b',
    'fa-pause-circle-o':'\uf28c',
    'fa-paw':'\uf1b0',
    'fa-paypal':'\uf1ed',
    'fa-pencil':'\uf040',
    'fa-pencil-square':'\uf14b',
    'fa-pencil-square-o':'\uf044',
    'fa-percent':'\uf295',
    'fa-phone':'\uf095',
    'fa-phone-square':'\uf098',
    'fa-photo':'\uf03e',
    'fa-picture-o':'\uf03e',
    'fa-pie-chart':'\uf200',
    'fa-pied-piper':'\uf2ae',
    'fa-pied-piper-alt':'\uf1a8',
    'fa-pied-piper-pp':'\uf1a7',
    'fa-pinterest':'\uf0d2',
    'fa-pinterest-p':'\uf231',
    'fa-pinterest-square':'\uf0d3',
    'fa-plane':'\uf072',
    'fa-play':'\uf04b',
    'fa-play-circle':'\uf144',
    'fa-play-circle-o':'\uf01d',
    'fa-plug':'\uf1e6',
    'fa-plus':'\uf067',
    'fa-plus-circle':'\uf055',
    'fa-plus-square':'\uf0fe',
    'fa-plus-square-o':'\uf196',
    'fa-power-off':'\uf011',
    'fa-print':'\uf02f',
    'fa-product-hunt':'\uf288',
    'fa-puzzle-piece':'\uf12e',
    'fa-qq':'\uf1d6',
    'fa-qrcode':'\uf029',
    'fa-question':'\uf128',
    'fa-question-circle':'\uf059',
    'fa-question-circle-o':'\uf29c',
    'fa-quote-left':'\uf10d',
    'fa-quote-right':'\uf10e',
    'fa-ra':'\uf1d0',
    'fa-random':'\uf074',
    'fa-rebel':'\uf1d0',
    'fa-recycle':'\uf1b8',
    'fa-reddit':'\uf1a1',
    'fa-reddit-alien':'\uf281',
    'fa-reddit-square':'\uf1a2',
    'fa-refresh':'\uf021',
    'fa-registered':'\uf25d',
    'fa-remove':'\uf00d',
    'fa-renren':'\uf18b',
    'fa-reorder':'\uf0c9',
    'fa-repeat':'\uf01e',
    'fa-reply':'\uf112',
    'fa-reply-all':'\uf122',
    'fa-resistance':'\uf1d0',
    'fa-retweet':'\uf079',
    'fa-rmb':'\uf157',
    'fa-road':'\uf018',
    'fa-rocket':'\uf135',
    'fa-rotate-left':'\uf0e2',
    'fa-rotate-right':'\uf01e',
    'fa-rouble':'\uf158',
    'fa-rss':'\uf09e',
    'fa-rss-square':'\uf143',
    'fa-rub':'\uf158',
    'fa-ruble':'\uf158',
    'fa-rupee':'\uf156',
    'fa-safari':'\uf267',
    'fa-save':'\uf0c7',
    'fa-scissors':'\uf0c4',
    'fa-scribd':'\uf28a',
    'fa-search':'\uf002',
    'fa-search-minus':'\uf010',
    'fa-search-plus':'\uf00e',
    'fa-sellsy':'\uf213',
    'fa-send':'\uf1d8',
    'fa-send-o':'\uf1d9',
    'fa-server':'\uf233',
    'fa-share':'\uf064',
    'fa-share-alt':'\uf1e0',
    'fa-share-alt-square':'\uf1e1',
    'fa-share-square':'\uf14d',
    'fa-share-square-o':'\uf045',
    'fa-shekel':'\uf20b',
    'fa-sheqel':'\uf20b',
    'fa-shield':'\uf132',
    'fa-ship':'\uf21a',
    'fa-shirtsinbulk':'\uf214',
    'fa-shopping-bag':'\uf290',
    'fa-shopping-basket':'\uf291',
    'fa-shopping-cart':'\uf07a',
    'fa-sign-in':'\uf090',
    'fa-sign-language':'\uf2a7',
    'fa-sign-out':'\uf08b',
    'fa-signal':'\uf012',
    'fa-signing':'\uf2a7',
    'fa-simplybuilt':'\uf215',
    'fa-sitemap':'\uf0e8',
    'fa-skyatlas':'\uf216',
    'fa-skype':'\uf17e',
    'fa-slack':'\uf198',
    'fa-sliders':'\uf1de',
    'fa-slideshare':'\uf1e7',
    'fa-smile-o':'\uf118',
    'fa-snapchat':'\uf2ab',
    'fa-snapchat-ghost':'\uf2ac',
    'fa-snapchat-square':'\uf2ad',
    'fa-soccer-ball-o':'\uf1e3',
    'fa-sort':'\uf0dc',
    'fa-sort-alpha-asc':'\uf15d',
    'fa-sort-alpha-desc':'\uf15e',
    'fa-sort-amount-asc':'\uf160',
    'fa-sort-amount-desc':'\uf161',
    'fa-sort-asc':'\uf0de',
    'fa-sort-desc':'\uf0dd',
    'fa-sort-down':'\uf0dd',
    'fa-sort-numeric-asc':'\uf162',
    'fa-sort-numeric-desc':'\uf163',
    'fa-sort-up':'\uf0de',
    'fa-soundcloud':'\uf1be',
    'fa-space-shuttle':'\uf197',
    'fa-spinner':'\uf110',
    'fa-spoon':'\uf1b1',
    'fa-spotify':'\uf1bc',
    'fa-square':'\uf0c8',
    'fa-square-o':'\uf096',
    'fa-stack-exchange':'\uf18d',
    'fa-stack-overflow':'\uf16c',
    'fa-star':'\uf005',
    'fa-star-half':'\uf089',
    'fa-star-half-empty':'\uf123',
    'fa-star-half-full':'\uf123',
    'fa-star-half-o':'\uf123',
    'fa-star-o':'\uf006',
    'fa-steam':'\uf1b6',
    'fa-steam-square':'\uf1b7',
    'fa-step-backward':'\uf048',
    'fa-step-forward':'\uf051',
    'fa-stethoscope':'\uf0f1',
    'fa-sticky-note':'\uf249',
    'fa-sticky-note-o':'\uf24a',
    'fa-stop':'\uf04d',
    'fa-stop-circle':'\uf28d',
    'fa-stop-circle-o':'\uf28e',
    'fa-street-view':'\uf21d',
    'fa-strikethrough':'\uf0cc',
    'fa-stumbleupon':'\uf1a4',
    'fa-stumbleupon-circle':'\uf1a3',
    'fa-subscript':'\uf12c',
    'fa-subway':'\uf239',
    'fa-suitcase':'\uf0f2',
    'fa-sun-o':'\uf185',
    'fa-superscript':'\uf12b',
    'fa-support':'\uf1cd',
    'fa-table':'\uf0ce',
    'fa-tablet':'\uf10a',
    'fa-tachometer':'\uf0e4',
    'fa-tag':'\uf02b',
    'fa-tags':'\uf02c',
    'fa-tasks':'\uf0ae',
    'fa-taxi':'\uf1ba',
    'fa-television':'\uf26c',
    'fa-tencent-weibo':'\uf1d5',
    'fa-terminal':'\uf120',
    'fa-text-height':'\uf034',
    'fa-text-width':'\uf035',
    'fa-th':'\uf00a',
    'fa-th-large':'\uf009',
    'fa-th-list':'\uf00b',
    'fa-themeisle':'\uf2b2',
    'fa-thumb-tack':'\uf08d',
    'fa-thumbs-down':'\uf165',
    'fa-thumbs-o-down':'\uf088',
    'fa-thumbs-o-up':'\uf087',
    'fa-thumbs-up':'\uf164',
    'fa-ticket':'\uf145',
    'fa-times':'\uf00d',
    'fa-times-circle':'\uf057',
    'fa-times-circle-o':'\uf05c',
    'fa-tint':'\uf043',
    'fa-toggle-down':'\uf150',
    'fa-toggle-left':'\uf191',
    'fa-toggle-off':'\uf204',
    'fa-toggle-on':'\uf205',
    'fa-toggle-right':'\uf152',
    'fa-toggle-up':'\uf151',
    'fa-trademark':'\uf25c',
    'fa-train':'\uf238',
    'fa-transgender':'\uf224',
    'fa-transgender-alt':'\uf225',
    'fa-trash':'\uf1f8',
    'fa-trash-o':'\uf014',
    'fa-tree':'\uf1bb',
    'fa-trello':'\uf181',
    'fa-tripadvisor':'\uf262',
    'fa-trophy':'\uf091',
    'fa-truck':'\uf0d1',
    'fa-try':'\uf195',
    'fa-tty':'\uf1e4',
    'fa-tumblr':'\uf173',
    'fa-tumblr-square':'\uf174',
    'fa-turkish-lira':'\uf195',
    'fa-tv':'\uf26c',
    'fa-twitch':'\uf1e8',
    'fa-twitter':'\uf099',
    'fa-twitter-square':'\uf081',
    'fa-umbrella':'\uf0e9',
    'fa-underline':'\uf0cd',
    'fa-undo':'\uf0e2',
    'fa-universal-access':'\uf29a',
    'fa-university':'\uf19c',
    'fa-unlink':'\uf127',
    'fa-unlock':'\uf09c',
    'fa-unlock-alt':'\uf13e',
    'fa-unsorted':'\uf0dc',
    'fa-upload':'\uf093',
    'fa-usb':'\uf287',
    'fa-usd':'\uf155',
    'fa-user':'\uf007',
    'fa-user-md':'\uf0f0',
    'fa-user-plus':'\uf234',
    'fa-user-secret':'\uf21b',
    'fa-user-times':'\uf235',
    'fa-users':'\uf0c0',
    'fa-venus':'\uf221',
    'fa-venus-double':'\uf226',
    'fa-venus-mars':'\uf228',
    'fa-viacoin':'\uf237',
    'fa-viadeo':'\uf2a9',
    'fa-viadeo-square':'\uf2aa',
    'fa-video-camera':'\uf03d',
    'fa-vimeo':'\uf27d',
    'fa-vimeo-square':'\uf194',
    'fa-vine':'\uf1ca',
    'fa-vk':'\uf189',
    'fa-volume-control-phone':'\uf2a0',
    'fa-volume-down':'\uf027',
    'fa-volume-off':'\uf026',
    'fa-volume-up':'\uf028',
    'fa-warning':'\uf071',
    'fa-wechat':'\uf1d7',
    'fa-weibo':'\uf18a',
    'fa-weixin':'\uf1d7',
    'fa-whatsapp':'\uf232',
    'fa-wheelchair':'\uf193',
    'fa-wheelchair-alt':'\uf29b',
    'fa-wifi':'\uf1eb',
    'fa-wikipedia-w':'\uf266',
    'fa-windows':'\uf17a',
    'fa-won':'\uf159',
    'fa-wordpress':'\uf19a',
    'fa-wpbeginner':'\uf297',
    'fa-wpforms':'\uf298',
    'fa-wrench':'\uf0ad',
    'fa-xing':'\uf168',
    'fa-xing-square':'\uf169',
    'fa-y-combinator':'\uf23b',
    'fa-y-combinator-square':'\uf1d4',
    'fa-yahoo':'\uf19e',
    'fa-yc':'\uf23b',
    'fa-yc-square':'\uf1d4',
    'fa-yelp':'\uf1e9',
    'fa-yen':'\uf157',
    'fa-yoast':'\uf2b1',
    'fa-youtube':'\uf167',
    'fa-youtube-play':'\uf16a',
    'fa-youtube-square':'\uf166'
  }


}).call(this);







/******************************************************************************
 * Copyright (c) 2016, GraphSQL Inc.                                          *
 * All rights reserved                                                        *
 * Unauthorized copying of this file, via any medium is strictly prohibited   *
 * Proprietary and confidential                                               *
 ******************************************************************************/
(function(undefined) {
  "use strict";

  var gvis = this.gvis;
  
  console.log('Loading gvis.graph')

  gvis.graph = function(_this) {

    this._this = _this;

    var graph = this;

    var data;
    var _nodesIdCount = 0;
    var _nodesTypeCount = 0;
    var _linksTypeCount = 0;

    data = {
      /*
      * The main data array.
      */
      array: {
        nodes: [],
        links: []
      },

      /*
      * For the internel and external id mapping.
      */
      idMap: {
        nodesID: Object.create(null), 
        nodesType: Object.create(null),
        linksType: Object.create(null)
      },

      /*
      * global indices for nodes and links.
      */
      index: {
        nodes: Object.create(null),
        links: Object.create(null)
      },

      /*
      * These indices refer from node to their neighboring nodes. Each key is an internal-id, and each
      * value is the array of the internal-ids of related nodes.
      */
      neighbors: {
        in: Object.create(null),
        out: Object.create(null),
        all: Object.create(null),
        inCount: Object.create(null),
        outCount: Object.create(null),
        allCount: Object.create(null)
      }
    }

    this.backup = function(newData) {
      if (arguments.length > 0) {
        if (newData !== undefined) {
          this.read(newData);
        }
        return undefined;
      }
      else {
        return gvis.utils.clone(data.array);
      }
    }

    this.read = function(subgraph, extended) {

      this.clear();
      extended = extended === undefined ? true : extended;

      for (var node in subgraph.nodes) {
        this.addNode(subgraph.nodes[node], extended);
      }

      for (var link in subgraph.links) {
        this.addLink(subgraph.links[link], extended);
      }
    }

    this.addSubgraph = function(subgraph, extended) {
      extended = extended === undefined ? true : extended;

      for (var node in subgraph.nodes) {
        this.addNode(subgraph.nodes[node], extended);
      }

      for (var link in subgraph.links) {
        this.addLink(subgraph.links[link], extended);
      }
    }

    this.addNode = function(node, extended) {
      try {
        extended = extended === undefined ? true : extended;

        if (Object(node) != node) {
          throw 'addNode: Wrong arguments.';
        }

        if (typeof node.id != 'string' || typeof node.type != 'string') {
          throw 'The node must have a string/number id and type.';
        }

        node = gvis.utils.clone(node);

        this._this.behaviors.style.initializeNode(node);

        // If node is exist in aggregated node. Ignore the node base on extended.
        var reference = this.isInAggregatedNode(node);
        if (!!reference) {
          // console.log('It is in aggregated node')
          
          try {
            if (!!extended) {
              gvis.utils.extend(reference.node[gvis.settings.attrs], node[gvis.settings.attrs]);
              reference.node.other.label = node['other'].label || "";

              return;
            }
            else {
              throw 'The node "' + ex_type + '-' + ex_id + '" already exists.';
            }
          }
          catch(err) {
            console.log(err)
            return ;
          }
        }

        //1. do the id map.
        var in_id;
        var in_type;
        var ex_id = node.id;
        var ex_type = node.type;

        // update id map for node id.
        if (!!data.idMap.nodesID[ex_id]) {
          in_id = data.idMap.nodesID[ex_id];
        }
        else {
          data.idMap.nodesID[ex_id] = (++_nodesIdCount).toString();
          in_id = data.idMap.nodesID[ex_id];
        }

        // update id map for node type.
        if (!!data.idMap.nodesType[ex_type]) {
          in_type = data.idMap.nodesType[ex_type];
        }
        else {
          data.idMap.nodesType[ex_type] = (++_nodesTypeCount).toString();
          in_type = data.idMap.nodesType[ex_type];
        }
        // end 1.

        // 2. add node to index
        var key = generateNodeKey(in_type, in_id);

        // If node is exist in graph as regular nodes
        if (!!data.index.nodes[key]) {
          try {
            if (extended) {
              gvis.utils.extend(data.index.nodes[key][gvis.settings.attrs], node[gvis.settings.attrs]);
              // gvis.utils.extend(data.index.nodes[key][gvis.settings.styles], node[gvis.settings.styles]);
              data.index.nodes[key].other.label = node['other'].label || "";
              return;
            }
            else {
              throw 'The node "' + ex_type + '-' + ex_id + '" already exists.';
            }
          }
          catch(err) {
            console.trace(err)
            return ;
          }
        }
        else {
          node[gvis.settings.key] = key;
          data.index.nodes[key] = node;
        }
        // end 2.

        // 3. add node in array.
        data.array.nodes.push(node)
        // end 3.

        // 4. add empty neighbors object for this node.
        data.neighbors.in[key] = Object.create(null);
        data.neighbors.out[key] = Object.create(null);
        data.neighbors.all[key] = Object.create(null);

        data.neighbors.inCount[key] = 0;
        data.neighbors.outCount[key] = 0;
        data.neighbors.allCount[key] = 0;

        // end 4.
      }
      catch (err) {
        console.log(err);
        return undefined;
      } 

      return node;
    }

    this.addLink = function(link, extended) {
      try {
        extended = extended === undefined ? true : extended;

        if (Object(link) != link) {
          throw 'addLink: Wrong arguments.';
        }

        if (typeof link.type != 'string') {
          throw 'The link must have a string type.';
        }

        if (typeof link.source.id != 'string' || typeof link.source.type != 'string'
          || typeof link.target.id != 'string' || typeof link.target.type != 'string') {
          throw 'The link source node and target node must have string id and type.';
        }

        link = gvis.utils.clone(link);
        link.other = link.other || {};

        // 1. check vaildation of new link. a) check node id map for exist node. b) update link id map. c) 

        var graph = this;

        var reference = this.isInAggregatedLink(link);

        // If the link belongs to aggregated node, then update aggregated node contained link list, and create virtual link.
        if (!!reference) {
          
          // 1. If link.source and link.target are both in aggregated nodes.
          if (!!reference.source && !!reference.target) {
            // 1.1 if source, target belong to same virtual node, then update link to contained link list, and return.
            if (reference.source.aggregatedNode == reference.target.aggregatedNode) {
              var aggregatedObj = this.getAggregatedObjects(reference.source.aggregatedNode);

              var checkTargetLink = aggregatedObj.contained_link.some(function(l) {
                if (graph.isEqualedLink(l, link)) {
                  gvis.utils.extend(l[gvis.settings.attrs], link[gvis.settings.attrs]);
                  l.other.living = link.other.living || false;
                  return true;
                }
                else if (graph.isReversedLink(l, link) || graph.isCoveredLink(l, link)){
                  gvis.utils.extend(l[gvis.settings.attrs], link[gvis.settings.attrs]);
                  l.directed = false;
                  l.other.living = link.other.living || false;
                  return true;
                }
                else if (graph.isCoveredLink(link, l)) {
                  gvis.utils.extend(l[gvis.settings.attrs], link[gvis.settings.attrs]);
                  l.other.living = link.other.living || false;
                  return true;
                }
                else {
                  return false;
                }
              })

              // if did not find a target link, add link in contained links.
              if (!checkTargetLink) {
                link.target = reference.target.node;
                link.source = reference.source.node;

                aggregatedObj.contained_link.push(link);
              }

              return ;
            }
            // 1.2. if source, target belong to different virtual nodes, then check if link contianed, then update virtual link, or add new virtual link. Then push this link in contained links.
            else {
              var sourceAggregatedObj = this.getAggregatedObjects(reference.source.aggregatedNode);
              var targetAggregatedObj = this.getAggregatedObjects(reference.target.aggregatedNode);

              var checkTargetLink = sourceAggregatedObj.contained_links.some(function(l) {
                if (graph.isEqualedLink(l, link)) {
                  gvis.utils.extend(l[gvis.settings.attrs], link[gvis.settings.attrs]);
                  l.other.living = link.other.living || false;
                  return true;
                }
                else if (graph.isReversedLink(l, link) || graph.isCoveredLink(l, link)){
                  gvis.utils.extend(l[gvis.settings.attrs], link[gvis.settings.attrs]);
                  l.directed = false;
                  l.other.living = link.other.living || false;
                  return true;
                }
                else if (graph.isCoveredLink(link, l)) {
                  gvis.utils.extend(l[gvis.settings.attrs], link[gvis.settings.attrs]);
                  l.other.living = link.other.living || false;
                  return true;
                }
                else {
                  return false;
                }
              })

              checkTargetLink |= targetAggregatedObj.contained_links.some(function(l) {
                if (graph.isEqualedLink(l, link)) {
                  gvis.utils.extend(l[gvis.settings.attrs], link[gvis.settings.attrs]);
                  l.other.living = link.other.living || false;
                  return true;
                }
                else if (graph.isReversedLink(l, link) || graph.isCoveredLink(l, link)){
                  gvis.utils.extend(l[gvis.settings.attrs], link[gvis.settings.attrs]);
                  l.directed = false;
                  l.other.living = link.other.living || false;
                  return true;
                }
                else if (graph.isCoveredLink(link, l)) {
                  gvis.utils.extend(l[gvis.settings.attrs], link[gvis.settings.attrs]);
                  l.other.living = link.other.living || false;
                  return true;
                }
                else {
                  return false;
                }
              })

              // 1.2.1 Did not find a exist link in contained_links.
              if (!checkTargetLink) {
                
                var virtual_link = graph.links(reference.source.aggregatedNode.type, reference.source.aggregatedNode.id, reference.target.aggregatedNode.type, reference.target.aggregatedNode.id, gvis.settings.aggregatedLinkType) || graph.links(reference.target.aggregatedNode.type, reference.target.aggregatedNode.id, reference.source.aggregatedNode.type, reference.source.aggregatedNode.id, gvis.settings.aggregatedLinkType);

                var parent = graph.checkDependencyOfAggregatedNodes(reference.source.aggregatedNode, reference.target.aggregatedNode);

                link.source = graph.nodesInContainedNodes(link.source.type, link.source.id);
                link.target = graph.nodesInContainedNodes(link.target.type, link.target.id);
                
                if (parent !== undefined) {
                  this.getAggregatedObjects(parent).contained_links.push(link);

                  var child = parent !== reference.source.aggregatedNode ? reference.source.aggregatedNode : reference.target.aggregatedNode;

                  this.getAggregatedObjects(child).contained_links.forEach(function(l) {
                    if (l.source.type === parent.type && l.source.id === parent.id) {
                      if ((l.target.type === link.target.type && l.target.id === link.target.id) || (l.target.type === link.source.type && l.target.id === link.source.id)) {
                        l[gvis.settings.attrs]._sum += 1;
                      }
                    }
                    else if (l.target.type === parent.type && l.target.id === parent.id) {
                      if ((l.source.type === link.target.type && l.source.id === link.target.id) || (l.source.type === link.source.type && l.source.id === link.source.id)) {
                        l[gvis.settings.attrs]._sum += 1;
                      }
                    }
                  })
                }
                else {
                  this.getAggregatedObjects(reference.source.aggregatedNode).contained_links.push(link);
                }

                // a. if two virtual nodes has a link, Then push link in the parent aggregated node contained links, and update _sum of virtual link.
                if (virtual_link != undefined) {

                  virtual_link[gvis.settings.attrs]._sum += 1;

                  return ;
                }
                // b. if not, then create a virtual link with _sum = 1; directed = false; Push this link in parent.contained_links.
                else {
                  link = {
                    source : {
                      id : reference.source.aggregatedNode.id,
                      type : reference.source.aggregatedNode.type
                    },
                    target : {
                      id : reference.target.aggregatedNode.id,
                      type : reference.target.aggregatedNode.type
                    },
                    directed : false,
                    other : {},
                    type : gvis.settings.aggregatedLinkType
                  };

                  link[gvis.settings.attrs] = {};
                  link[gvis.settings.attrs]._sum = 1;
                }
              }
              else {
                return;
              }
            }
          }

          // 2. If link.source or link.target is in aggregated node.
          else if (!!reference.source || !!reference.target) {
            var virtual_reference;
            var real_object;
            if (!!reference.source) {
              virtual_reference = reference.source;
              real_object = link.target;
            }
            else {
              virtual_reference = reference.target;
              real_object = link.source;
            }

            var aggregatedObj = this.getAggregatedObjects(virtual_reference.aggregatedNode);
            var virtual_link = this.links(real_object.type, real_object.id, virtual_reference.aggregatedNode.type, virtual_reference.aggregatedNode.id, gvis.settings.aggregatedLinkType);

            // 2.1 if link is in virtual node contained links, then extent the link in contained_links;
            var checkTargetLink = aggregatedObj.contained_links.some(function(l) {
              if (graph.isEqualedLink(l, link)) {
                gvis.utils.extend(l[gvis.settings.attrs], link[gvis.settings.attrs]);
                l.other.living = link.other.living || false;
                return true;
              }
              else if (graph.isReversedLink(l, link) || graph.isCoveredLink(l, link)){
                gvis.utils.extend(l[gvis.settings.attrs], link[gvis.settings.attrs]);
                l.directed = false;
                l.other.living = link.other.living || false;
                return true;
              }
              else if (graph.isCoveredLink(link, l)) {
                gvis.utils.extend(l[gvis.settings.attrs], link[gvis.settings.attrs]);
                l.other.living = link.other.living || false;
                return true;
              }
              else {
                return false;
              }
            })

            // 2.2 if link is not in virtual node contained_links, then push link in virtual node contianed_links;
            if (!checkTargetLink) {

              link.target = virtual_reference.node;
              link.source = this.nodes(real_object.type, real_object.id);
              aggregatedObj.contained_links.push(link);
            

              // 2.2.1 if the virtual link exists,
              if (virtual_link !== undefined) {
                virtual_link[gvis.settings.attrs]._sum += 1;

                return;
              }
              // 2.2.2 if the virutal link does not exist, then create a virtual link with _sum = 1, push link in virtual node.contained_links;
              else {
                link = {
                  source : {
                    id : real_object.id,
                    type : real_object.type
                  },
                  target : {
                    id : virtual_reference.aggregatedNode.id,
                    type : virtual_reference.aggregatedNode.type
                  },
                  directed : false,
                  other : {},
                  type : gvis.settings.aggregatedLinkType
                };

                link[gvis.settings.attrs] = {};
                link[gvis.settings.attrs]._sum = 1;
              }
            }
            //2.3 if link is in virtual node contained_links, return;
            else {
              return ;
            }
          }

          // 3. If neighter of source or target is in aggregated node.
          else {
            // do nothing;
          }
        }
        else {
          // same as up 3. Do nothing.
        }

        this._this.behaviors.style.initializeLink(link);

        var ex_source_type = link.source.type;
        var ex_source_id = link.source.id;
        
        var ex_target_type = link.target.type;
        var ex_target_id = link.target.id;

        var ex_link_type = link.type;

        var in_source_type;
        var in_source_id;
        var in_target_type;
        var in_target_id;
        var in_link_type;

        var key_source;
        var key_target;
        var key_link;
        var key_link_reverse;

        // Check link source exist or not
        if (!data.idMap.nodesType[ex_source_type] || !data.idMap.nodesID[ex_source_id]) {
          if (extended) {
            var tempNode = {
              id : ex_source_id,
              type : ex_source_type,
            }
            tempNode[gvis.settings.attrs] = {};

            tempNode.other = {fixed : 2}

            this.addNode(tempNode);
          }
          else {
            throw 'The link source node must have an existing type and id.'
          }
        }

        in_source_type = data.idMap.nodesType[ex_source_type];
        in_source_id = data.idMap.nodesID[ex_source_id];

        // Check link target exist or not
        if (!data.idMap.nodesType[ex_target_type] || !data.idMap.nodesID[ex_target_id]) {
          if (extended) {
            var tempNode = {
              id : ex_target_id,
              type : ex_target_type,
            }
            tempNode[gvis.settings.attrs] = {};

            tempNode.other = {fixed : 2}

            this.addNode(tempNode);
          }
          else {
            throw 'The link target node must have an existing type and id.'
          }
        }

        in_target_type = data.idMap.nodesType[ex_target_type];
        in_target_id = data.idMap.nodesID[ex_target_id];


        if (!!data.idMap.linksType[ex_link_type]) {
          in_link_type = data.idMap.linksType[ex_link_type];
        }
        else {
          data.idMap.linksType[ex_link_type] = (++_linksTypeCount).toString();
          in_link_type = data.idMap.linksType[ex_link_type];
        }

        key_source = generateNodeKey(in_source_type, in_source_id);
        key_target = generateNodeKey(in_target_type, in_target_id);
        key_link = generateLinkKey(key_source, key_target, in_link_type);
        key_link_reverse = generateLinkKey(key_target, key_source, in_link_type);

        if (!data.index.nodes[key_source]) {
          if (extended) {
            var tempNode = {
              id : ex_source_id,
              type : ex_source_type,
            }
            tempNode[gvis.settings.attrs] = {};

            tempNode.other = {fixed : 2};

            this.addNode(tempNode);
          }
          else {
            throw '[Add Link Error] The link source node index error.'
          }
        }

        if (!data.index.nodes[key_target]) {
          if (extended) {
            var tempNode = {
              id : ex_target_id,
              type : ex_target_type,
            }
            tempNode[gvis.settings.attrs] = {};

            tempNode.other = {fixed : 2};

            this.addNode(tempNode);
          }
          else {
            throw '[Add Link Error] The link target node index error.'
          }
        }



        // end 1.

        // 2. add link to index

        link.source = data.index.nodes[key_source];
        link.target = data.index.nodes[key_target];

        // If link is existed, update link base on "extended" input.
        if (!!data.index.links[key_link]) {
          try {
            if (extended) {
              gvis.utils.extend(data.index.links[key_link][gvis.settings.attrs], link[gvis.settings.attrs]);
              //gvis.utils.extend(data.index.links[key_link][gvis.settings.styles], link[gvis.settings.styles]);
              // gvis.utils.extend(data.index.links[key_link]['other'], link['other']);

              data.index.links[key_link]['other'].living = link['other'].living || false;


              return;
            }
            else {
              throw 'The link "' + generateLinkKey(generateNodeKey(ex_source_type, ex_source_id), generateNodeKey(ex_target_type, ex_target_id), ex_link_type) + '" already exists.';
            }
          }
          catch (err) {
            console.log(err);
            return;
          } 
        }
        // If reverse link is existed and reverse-link is undirected, update reverse link base on extended input.
        else if (!!data.index.links[key_link_reverse] && !data.index.links[key_link_reverse].directed) {
          try {
            if (extended) {
              gvis.utils.extend(data.index.links[key_link_reverse][gvis.settings.attrs], link[gvis.settings.attrs]);
              //gvis.utils.extend(data.index.links[key_link_reverse][gvis.settings.styles], link[gvis.settings.styles]);
              // gvis.utils.extend(data.index.links[key_link_reverse]['other'], link['other']);
              data.index.links[key_link_reverse]['other'].living = link['other'].living || false;

              return;
            }
            else {
              throw 'The link "' + generateLinkKey(generateNodeKey(ex_target_type, ex_target_id), generateNodeKey(ex_source_type, ex_source_id), ex_link_type) + '" already exists.';
            }
          }
          catch (err) {
            console.log(err);
            return;
          }
        }

        // If reverse link is existed and reverse-link is directed and Source.type != Target.type, update reverse link to undirected base on extended input.
        else if (!!data.index.links[key_link_reverse] && !!data.index.links[key_link_reverse].directed && data.index.links[key_link_reverse].source.type != data.index.links[key_link_reverse].target.type) {
          data.index.links[key_link_reverse].directed = false;

          if (extended) {
            gvis.utils.extend(data.index.links[key_link_reverse][gvis.settings.attrs], link[gvis.settings.attrs]);
            //gvis.utils.extend(data.index.links[key_link_reverse][gvis.settings.styles], link[gvis.settings.styles]);
            // gvis.utils.extend(data.index.links[key_link_reverse]['other'], link['other']);

            data.index.links[key_link_reverse]['other'].living = link['other'].living || false;
          }

          return;
        }
        // If reverse link is existed and reverse-link is directed and Source.type === Target.type:
        // Then check if attributes of two links are all the same, 
        // Then update reverse link to undirected base on extended input.
        // Otherwise, treat it as new link. 
        else if (!!data.index.links[key_link_reverse] && !!data.index.links[key_link_reverse].directed && data.index.links[key_link_reverse].source.type == data.index.links[key_link_reverse].target.type) {

          var flag = false;

          var old_one = data.index.links[key_link_reverse][gvis.settings.attrs] || {};
          var new_one = link[gvis.settings.attrs] || {};

          if (gvis.utils.shallowEqual(old_one, new_one)) {
            data.index.links[key_link_reverse].directed = false;

            if (extended) {
              data.index.links[key_link_reverse]['other'].living = link['other'].living || false;
            }

            return;
          }
          else {
            link[gvis.settings.key] = key_link;
            data.index.links[key_link] = link;
          }
        }
        else {
          link[gvis.settings.key] = key_link;
          data.index.links[key_link] = link;
        }
        // end 2.

        // 3. add link to array
        data.array.links.push(link);
        // end 3.

        // 4. update neighbors object

        // neighbors in object.
        if (!data.neighbors.in[key_target][key_source]) {
          data.neighbors.in[key_target][key_source] = Object.create(null);
        }

        data.neighbors.in[key_target][key_source][key_link] = link;

        // neighbors out object.

        if (!data.neighbors.out[key_source][key_target]) {
          data.neighbors.out[key_source][key_target] = Object.create(null);
        }

        data.neighbors.out[key_source][key_target][key_link] = link;

        // neighbors all object
        if (!data.neighbors.all[key_target][key_source]) {
          data.neighbors.all[key_target][key_source] = Object.create(null);
        }

        data.neighbors.all[key_target][key_source][key_link] = link;

        if (!data.neighbors.all[key_source][key_target]) {
          data.neighbors.all[key_source][key_target] = Object.create(null);
        }

        data.neighbors.all[key_source][key_target][key_link] = link;

        // update the count
        /*
          inCount: Object.create(null),
          outCount: Object.create(null),
          allCount: Object.create(null)
        */
        data.neighbors.inCount[key_target]++;
        data.neighbors.outCount[key_source]++;
        data.neighbors.allCount[key_source]++;
        data.neighbors.allCount[key_target]++;
        // end 4.
      }
      catch (err) {
        console.trace(err);
        return undefined;
      }
      
      return link;
    }

    /**
     * Drop a node.
     * @param {string} type - type of the node.
     * @param {string} id - id of the node.
     * @Param {boolean} extended - 
            Droping node will drop related links. While we drop links, we use {extended} to determine whether orn not we drop isolated nodes.
            extended = false; we don't remove any nodes.
            extended = true; we do remove source and target nodes of this link, if the node is isolated.
     */

    this.dropNode = function(type, id, extended) {

      var targetNode = undefined;

      try {
        if (typeof id != 'string' || typeof type != 'string') {
          throw 'The node must have a string id and type.';
        }

        extended = extended === undefined ? true : extended;

        var key;

        try {
          // Delete a not exist node, or a deleted node.
          key = getInNodeKey(type, id).key;
        } 
        catch (err) {
          return;
        }

        if (!data.index.nodes[key]) {
          try {
            throw 'The node ' + generateNodeKey(type, id) + ' does not exist or has been removed.';
          }
          catch (err) {
            console.log(err);
            return;
          } 
        }

        // Remove the node from graph.
        // 1. remove from index.
        targetNode = data.index.nodes[key]
        delete data.index.nodes[key];

        // 2. remove from array
        for (var i=0; i<data.array.nodes.length; ++i) {
          if (data.array.nodes[i][gvis.settings.key] == key) {
            data.array.nodes.splice(i, 1);
            break;
          }
        }

        // 3. remove related links
        for (var i=data.array.links.length-1; i>=0; --i) {
          var link = data.array.links[i];

          if (link.source[gvis.settings.key] == key || link.target[gvis.settings.key] == key) {
            this.dropLink(link.source.type, link.source.id, link.target.type, link.target.id, link.type, extended)
          }
        }

        // 5. remove object related with dropped node in neighbors

        // 5.1 for dropped node self.
        delete data.neighbors.in[key];
        delete data.neighbors.out[key];
        delete data.neighbors.all[key];

        delete data.neighbors.inCount[key];
        delete data.neighbors.outCount[key];
        delete data.neighbors.allCount[key];

        // 5.2 remove neighbors of other nodes that related dropped node.
        for (var i in data.index.nodes) {
          var other_node = data.index.nodes[i];
          var other_key = other_node[gvis.settings.key];

          delete data.neighbors.in[other_key][key];
          delete data.neighbors.out[other_key][key];
          delete data.neighbors.all[other_key][key];
        }

        // 6. remove type of node from id map if no more type exist.
        var checkType = false;

        for (var i in data.array.nodes) {
          var temp_node = data.array.nodes[i];
          if (temp_node.type == type) {
            checkType = true;
            break;
          }
        }

        if (!checkType) {
          delete data.idMap.nodesType[type];
        }

        // end Remove the node from graph.

        // if it is root node, pick the first node as root node.
        if (this._this.layouts._rootNodeKey == key && this.nodes().length) {
          this._this.layouts._rootNodeKey = this.nodes()[0][gvis.settings.key];
        }
      }
      catch (err) {
        // console.trace(err);
      }
      
      return targetNode;
    }

    /**
     * Drop a link.
     * @param {string} source_type - type of the source node of the link.
     * @param {string} source_id - id of the source node of the link.
     * @param {string} target_type - type of the target node of the link.
     * @param {string} target_id - id of the target node of the link.
     * @Param {boolean} extended - 
            While we drop links, we use {extended} to determine whether orn not we drop isolated nodes.
            extended = false; we don't remove any nodes.
            extended = true; we do remove source and target nodes of this link, if the node is isolated.
     */

    this.dropLink = function(source_type, source_id, target_type, target_id, link_type, extended) {
      var targetLink = undefined;

      try {
        //console.log(source_type, source_id, target_type, target_id, link_type);
        if (typeof source_type != 'string' || typeof source_id != 'string' 
          || typeof target_type != 'string' || typeof target_id != 'string' 
          || typeof link_type != 'string') {
          throw 'dropLink: Wrong arguments.';
        }

        extended = extended === undefined ? true : extended;

        var inMap = getInLinkKey(source_type, source_id, target_type, target_id, link_type);

        var key_source = inMap.source.key;
        var key_target = inMap.target.key;
        var key_link = inMap.key;

        if (!data.index.links[key_link]) {
          throw 'The link ' + generateLinkKey(generateNodeKey(source_type, source_id), generateNodeKey(target_type, target_id), link_type) + ' does not exist';
        }

        // Remove the link from graph
        // 1. remove the link from index
        targetLink = data.index.links[key_link];
        delete data.index.links[key_link];

        // 2. remove the link from array
        for (var i=0; i<data.array.links.length; ++i) {
          if (data.array.links[i][gvis.settings.key] == key_link) {
            data.array.links.splice(i, 1);
            break;
          }
        }

        // 3. remove neighbors by the dropped link.
        // 3.1 for in
        delete data.neighbors.in[key_target][key_source][key_link];
        if (!Object.keys(data.neighbors.in[key_target][key_source]).length) {
          delete data.neighbors.in[key_target][key_source];
        }

        // 3.2 for out
        delete data.neighbors.out[key_source][key_target][key_link];
        if (!Object.keys(data.neighbors.out[key_source][key_target]).length) {
          delete data.neighbors.out[key_source][key_target];
        }

        // 3.3 for all
        delete data.neighbors.all[key_target][key_source][key_link];
        if (!Object.keys(data.neighbors.all[key_target][key_source]).length) {
          delete data.neighbors.all[key_target][key_source];
        }

        delete data.neighbors.all[key_source][key_target][key_link];
        if (!Object.keys(data.neighbors.all[key_source][key_target]).length) {
          delete data.neighbors.all[key_source][key_target];
        }

        // 4. update neighbors count
        data.neighbors.inCount[key_target]--;
        data.neighbors.outCount[key_source]--;
        data.neighbors.allCount[key_target]--;
        data.neighbors.allCount[key_source]--;

        // 5. remove node without link.
        if (extended) {
          if (data.neighbors.allCount[key_target] == 0) {
            if (!!data.index.nodes[key_target]) {
              this.dropNode(target_type, target_id, extended);
            }
          }

          if (data.neighbors.allCount[key_source] == 0) {
            if (!!data.index.nodes[key_source]) {
              this.dropNode(source_type, source_id, extended);
            }
          }
        }

        // 6. remove link type in idMap if this type is not in use anymore.
        // 6. remove type of node from id map if no more type exist.
        var checkType = false;

        for (var i in data.array.links) {
          var temp_link = data.array.links[i];
          if (temp_link.type == link_type) {
            checkType = true;
            break;
          }
        }

        if (!checkType) {
          delete data.idMap.linksType[link_type];
        }
      }
      catch (err) {
        // console.trace(err);
      }
      // end Remove the link from graph.

      return targetLink;
    }

    /**
     * Get a node object by internel key
     * @param {string} key
     * @returns {object}
     */
    this.getNodeByKey = function(key) {
      return data.index.nodes[key];
    }

    /**
     * Get a link object by internel key
     * @param {string} key
     * @returns {object}
     */
    this.getLinkByKey = function(key) {
      return data.index.links[key];
    }


    // clear the graph.
    this.clear = function() {

      _nodesIdCount = 0;
      _nodesTypeCount = 0;
      _linksTypeCount = 0;

      data = {
        array: {
          nodes: [],
          links: []
        },
        idMap: {
          nodesID: Object.create(null), 
          nodesType: Object.create(null),
          linksType: Object.create(null)
        },
        index: {
          nodes: Object.create(null),
          links: Object.create(null)
        },
        neighbors: {
          in: Object.create(null),
          out: Object.create(null),
          all: Object.create(null),
          inCount: Object.create(null),
          outCount: Object.create(null),
          allCount: Object.create(null)
        }
      }

      this.aggregatedNodesObject = Object.create(null);
    }

    this.nodes = function() {
      try {
        switch (arguments.length) {
          case 0:
            //return all data object.
            return data.array.nodes;
          break;
          case 1:
            //return an array of selected node.
            var array = arguments[0];
            var result = [];
            if (Object.prototype.toString.call(array) === '[object Array]') {
              for (var i=0; i<array.length; ++i) {
                var inMap = getInNodeKey(array[i].type, array[i].id);
                if (!data.index.nodes[inMap.key]) {
                  throw 'node ' + generateNodeKey(array[i].type, array[i].id) + ' does not exist.'
                }
                else {
                  result.push(data.index.nodes[inMap.key]);
                }
              }
            }
            else if (Object.prototype.toString.call(array) === '[object Object]') {
              var ex_type = array.type;
              var ex_id = array.id;

              var inMap = getInNodeKey(ex_type, ex_id);

              if (!data.index.nodes[inMap.key]) {
                throw 'node ' + generateNodeKey(ex_type, ex_id) + ' does not exist.'
              }
              else {
                return data.index.nodes[inMap.key]; 
              }  
            }
            else if (typeof array === 'string') {
              if (!data.index.nodes[array]) {
                throw 'node ' + array + ' does not exist.'
              }
              else {
                return data.index.nodes[array]; 
              } 
            }
            else {
              throw array + ' not an array or an object.'
            }

            return result;
          break;
          case 2:
            var ex_type = arguments[0];
            var ex_id = arguments[1];

            var inMap = getInNodeKey(ex_type, ex_id);

            if (!data.index.nodes[inMap.key]) {
              throw 'node ' + generateNodeKey(ex_type, ex_id) + ' does not exist.'
            }
            else {
              return data.index.nodes[inMap.key]; 
            }  
          break;

          default:
        }

        throw 'nodes: Wrong arguments.'
      }
      catch (err) {
        // console.log(err);
        return;
      }
      
      return;   
    }

    this.links = function() {
      try {
        switch (arguments.length) {
          case 0:
            //return all data object.
            return data.array.links;
          break;
          case 1:
            //return an array of selected links.
            var array = arguments[0];
            var result = [];
            if (Object.prototype.toString.call(array) === '[object Array]') {
              for (var i=0; i<array.length; ++i) {
                var inMap = getInLinkKey(array[i].source.type, array[i].source.id, array[i].target.type, array[i].target.id, array[i].type);
                if (!data.index.links[inMap.key]) {
                  throw 'link ' + generateLinkKey(generateNodeKey(array[i].source.type, array[i].source.id), generateNodeKey(array[i].target.type, array[i].target.id), array[i].type) + ' does not exist.'
                }
                else {
                  result.push(data.index.links[inMap.key]);
                }
              }
            }
            else if (Object.prototype.toString.call(array) === '[object Object]') {
              var ex_source_type = array.source.type;
              var ex_source_id = array.source.id;
              var ex_target_type = array.target.type;
              var ex_target_id = array.target.id;
              var ex_link_type = array.type;

              var inMap = getInLinkKey(ex_source_type, ex_source_id, ex_target_type, ex_target_id, ex_link_type);

              if (!data.index.links[inMap.key]) {
                throw 'node ' + generateLinkKey(generateNodeKey(ex_source_type, ex_source_id), generateNodeKey(ex_target_type, ex_target_id), ex_link_type) + ' does not exist.'
              }
              else {
                return data.index.links[inMap.key]; 
              } 
            }
            else {
              throw array + ' not an array or an object.'
            }

            return result;
          break;
          case 5:
            var ex_source_type = arguments[0];
            var ex_source_id = arguments[1];
            var ex_target_type = arguments[2];
            var ex_target_id = arguments[3];
            var ex_link_type = arguments[4];

            var inMap = getInLinkKey(ex_source_type, ex_source_id, ex_target_type, ex_target_id, ex_link_type);

            if (!data.index.links[inMap.key]) {
              throw 'link ' + generateLinkKey(generateNodeKey(ex_source_type, ex_source_id), generateNodeKey(ex_target_type, ex_target_id), ex_link_type) + ' does not exist.'
            }
            else {
              return data.index.links[inMap.key]; 
            }  
          break;

          default:
        }

        throw 'links: Wrong arguments.'
      }
      catch (err) {
        console.trace(err);
        return;
      }
      
      return;  
    }

    this.degree = function() {
      switch (arguments.length) {
        case 1:
          //return an array of selected node.
          var array = arguments[0];
          var result = [];
          if (Object.prototype.toString.call(array) === '[object Array]') {
            for (var i=0; i<array.length; ++i) {
              var inMap = getInNodeKey(array[i].type, array[i].id);
              if (!data.index.nodes[inMap.key]) {
                throw 'node ' + generateNodeKey(array[i].type, array[i].id) + ' does not exist.'
              }
              else {
                var item = {
                  in: data.neighbors.inCount[inMap.key],
                  out: data.neighbors.outCount[inMap.key],
                  all: data.neighbors.allCount[inMap.key]
                }

                result.push(item);
              }
            }
          }
          else if (Object.prototype.toString.call(array) === '[object Object]') {
            var ex_type = array.type;
            var ex_id = array.id;

            var inMap = getInNodeKey(ex_type, ex_id);

            if (!data.index.nodes[inMap.key]) {
              throw 'node ' + generateNodeKey(ex_type, ex_id) + ' does not exist.'
            }
            else {
              return {
                  in: data.neighbors.inCount[inMap.key],
                  out: data.neighbors.outCount[inMap.key],
                  all: data.neighbors.allCount[inMap.key]
                };
            }  
          }
          else {
            throw array + ' not an array or an object.'
          }

          return result;
        break;
        case 2:
          var ex_type = arguments[0];
          var ex_id = arguments[1];

          var inMap = getInNodeKey(ex_type, ex_id);

          if (!data.index.nodes[inMap.key]) {
            throw 'node ' + generateNodeKey(ex_type, ex_id) + ' does not exist.'
          }
          else {
            return {
                  in: data.neighbors.inCount[inMap.key],
                  out: data.neighbors.outCount[inMap.key],
                  all: data.neighbors.allCount[inMap.key]
                };
          }  
        break;

        default:
      }

      throw 'nodes: Wrong arguments.'
    }

    this.data = function() {
      return data;
    }

    this.outgoingLinks = function(nodeKey) {
      return data.neighbors.out[nodeKey] || {};
    }

    this.incomingLinks = function(nodeKey) {
      return data.neighbors.in[nodeKey] || {};
    }

    this.inoutLinks = function(nodeKey) {
      return data.neighbors.all[nodeKey] || {};
    }

    /*
    Example of styles :
    styles = {
      "nodes" : [
        {condition:'isBlacklisted == "true"', value:{'fill':"#000", 'stroke-width':3}},
        {condition:'outdegree > 4 && outdegree <= 5', value:{'r':['Math.random() * 70 + 10'], 'stroke-width':3, 'stroke':'#00F'}},
        {condition:'type ==  "bankcard"', value:{'r':100, 'stroke-width':3, 'stroke':'#0F0'}},
        {condition:'type == "transaction" && orderEpochTime > 1427853361', value:{'fill':'#F00'}}
      ],
      "links" : [
        {condition:'type ==  "transactionmerchant"', value:{'stroke-width':['Math.random() * 4 * Math.random() * 4  + 1'], 'stroke':['"#" + "9ecae1"']}},
        {condition:'target.outdegree > 100 && target.type == "phone"', value:{'stroke-width':30, 'dashed' : false, 'stroke':'#0F0'}}
      ]
    }
    */
    this.applyDefinedStyles = function(element_data, definedStyles) {

      if (!element_data || !definedStyles) {
        return;
      }

      var predefinedStyles = definedStyles;

      var errorHead = "[Predefined Style Error] ";

      try {
        // check if element_data is link's
        if (!!element_data.source && !!element_data.target) {
          var styles = predefinedStyles.links || [];

          for (var index in styles) {
            var style = styles[index];
            applyPredefinedStylesOnLink.call(this, element_data, style, index);
          }
        }
        // otherwise the element_data is node's
        else {
          var styles = predefinedStyles.nodes || [];

          for (var index in styles) {
            var style = styles[index];
            applyPredefinedStylesOnNode.call(this, element_data, style, index);
          }
        }
      }
      catch (err) {
        console.log(errorHead + err) // alert error;
      } 
    }

    this.getNodeLegends = function() {
      return Object.keys(data.idMap.nodesType).map(function(i) {
               return {type:i, element:'node'};
             })
    }

    this.getLinkLegends = function() {
      return Object.keys(data.idMap.linksType).map(function(i) {
               return {type:i, element:'link'};
             })
    }

    this.getNodeAttributes = function() {
      var result = [];
      var legends = this.getNodeLegends();

      // attributes hash map.
      var temp = {};

      data.array.nodes.forEach(function(node) {
        temp[node.type] = temp[node.type] || {};

        var _keys = ['id', 'type'];
        for (var key in _keys) {
          var attr = _keys[key];
          temp[node.type][attr] = temp[node.type][attr] || {};
          temp[node.type][attr]['selected'] |= node[gvis.settings.styles].labels[attr];
        }

        for (var attr in node[gvis.settings.attrs]) {
          temp[node.type][attr] = temp[node.type][attr] || {};
          temp[node.type][attr]['selected'] |= node[gvis.settings.styles].labels[attr];
        }
      })

      // console.log(temp);

      result = legends.map(function(legend) {
        legend.selected = true;
        legend.type = legend.type;
        legend.icon = this._this.renderer.iconName(legend.type);
        legend.color = this._this.renderer.color.getNodeColor(legend.type);

        var labels = temp[legend.type];
        legend.labels = Object.keys(labels).map(function(item) {
          return {attributeName:item, selected: Boolean(labels[item].selected)};
        });

        return legend;
      }.bind(this))

      return result;
    }

    this.getLinkAttributes = function() {
      var result = [];
      var legends = this.getLinkLegends();

      var temp = {};

      data.array.links.forEach(function(link) {
        temp[link.type] = temp[link.type] || {};

        temp[link.type]['type'] = temp[link.type]['type'] || {};
        temp[link.type]['type']['selected'] |= link[gvis.settings.styles].labels['type'];

        for (var attr in link[gvis.settings.attrs]) {
          temp[link.type][attr] = temp[link.type][attr] || {};
          temp[link.type][attr]['selected'] |= link[gvis.settings.styles].labels[attr];
        }
      })

      // console.log(temp);

      result = legends.map(function(legend) {
        legend.selected = true;
        legend.type = legend.type;
        legend.icon = "fa-minus";
        legend.color = this._this.renderer.color.getLinkColor(legend.type);
        // legend.labels = temp[legend.type];

        var labels = temp[legend.type];
        legend.labels = Object.keys(labels).map(function(item) {
          return {attributeName:item, selected: Boolean(labels[item].selected)};
        });

        return legend;
      }.bind(this))

      return result;
    }

    this.evaluateNodeExpression = function(node_data, condition) {
      var result = false;

      var node_data = gvis.utils.clone(node_data);

      // Create the Function content.
      var template = 'var id=node.id; var type=node.type; var node = node || {};'

      // 1. check all attributes as string;
      for (var attr in node_data[gvis.settings.attrs]) {
        template += 'node["' + attr + '"]="' + node_data[gvis.settings.attrs][attr] + '";';
      }
      template += 'if (' + condition + ') return true;'

      // 2. check all attrbites as float (if it can be parsed as float);
      for (var attr in node_data[gvis.settings.attrs]) {
        if (parseFloat(node_data[gvis.settings.attrs][attr]).toString() == node_data[gvis.settings.attrs][attr]) {
          template += 'node["' + attr + '"]=' + node_data[gvis.settings.attrs][attr] + ';';
        }
      }
      template += 'if (' + condition + ') return true;';

      // 3. return false; as condition check result;
      template += 'return false;';

      try {
        // Create Function Object by using Function content.
        var fn = new Function('node', template);
        result = fn(node_data);
      }
      catch (err) {
        result = false;
        console.error('node expression input error : ', err);
      }

      return result;
    }

    this.evaluateLinkExpression = function(link_data, condition) {
      var result = false;

      var link_data = gvis.utils.clone(link_data);

      var source = this.nodes(link_data.source);
      var target = this.nodes(link_data.target)

      // Create the Function content.
      var template = 'var source={}; var target={}; var type=link.type; var link=link || {};';

      // 1. create source object and target object.
      template += 'source.type = link.source.type; target.type = link.target.type;'
      template += 'source.id = link.source.id; target.id = link.target.id;'

      for (var attr in source[gvis.settings.attrs]) {
        template += 'source["' + attr + '"] = "' +  source[gvis.settings.attrs][attr] + '";';
      }
      for (var attr in target[gvis.settings.attrs]) {
        template += 'target["' + attr + '"] = "' +  target[gvis.settings.attrs][attr] + '";';
      }

      // 2. create link attributes;
      for (var attr in link_data[gvis.settings.attrs]) {
        template += 'link["' + attr + '"]="' + link_data[gvis.settings.attrs][attr] + '";';
      }

      // 2.5 create link other;
      template += 'var other = ' + JSON.stringify(link_data.other) + ';';

      // 3. check condition;
      template += 'if (' + condition + ') return true;'
      template += 'return false;' 

      try {
        // Create Function Object by using Function content.
        var fn = new Function('link', template);
        result = fn(link_data);
      }
      catch (err) {
        result = false;
        console.error('link expression input error : ', err);

      }

      return result;
    }

    function applyPredefinedStylesOnNode(node_data, style, index) {
      // function was bound with gvis.graph element;

      var condition = style.condition;
      var condition_result = false;
      var value = style.value;

      if (!condition || !value) {
        throw 'Node Predefined Style ' + index + ' is undefined';
      }

      condition_result = graph.evaluateNodeExpression(node_data, condition);

      // // Create the Function content.
      // var template = 'var id=node.id; var type=node.type;'

      // // 1. check all attributes as string;
      // for (var attr in node_data[gvis.settings.attrs]) {
      //   template += 'var ' + attr + '="' + node_data[gvis.settings.attrs][attr] + '";';
      // }
      // template += 'if (' + condition + ') return true;'

      // // 2. check all attrbites as float (if it can be parsed as float);
      // for (var attr in node_data[gvis.settings.attrs]) {
      //   if (parseFloat(node_data[gvis.settings.attrs][attr]).toString() == node_data[gvis.settings.attrs][attr]) {
      //     template += 'var ' + attr + '=' + node_data[gvis.settings.attrs][attr] + ';';
      //   }
      // }
      // template += 'if (' + condition + ') return true;'

      // // 3. return false; as condition check result;
      // template += 'return false;' 

      // try {
      //   // Create Function Object by using Function content.
      //   var fn = new Function('node', template);
      //   condition_result = fn(node_data);
      // }
      // catch (err) {
      //   condition_result = false;
      // }

      // if it is true, change the style of the element.
      if (condition_result) {
        for (var v in value) {
          if (node_data[gvis.settings.styles][v] == undefined) {
            node_data[gvis.settings.styles][v] = value[v];
            // console.log('Node Predefined Style ' + index + ' : style "' + v + '" is not exist.');
            // throw 'Node Predefined Style ' + index + ' : style "' + v + '" is not exist.';
          }
          else {
            switch (typeof value[v]) {
              case 'number' :
                node_data[gvis.settings.styles][v] = value[v];
              break;

              case 'string' :
                node_data[gvis.settings.styles][v] = value[v];
              break;

              case 'boolean' :
                node_data[gvis.settings.styles][v] = value[v];
              break;

              case 'object' :
                var objectType = Object.prototype.toString.call(value[v]);

                if (objectType == '[object Array]') {
                  try {
                    var template = 'return ' + value[v][0];
                    var fn = new Function(template);

                    node_data[gvis.settings.styles][v] = fn();
                  }
                  catch (err) {
                    throw 'Node Predefined Style ' + index + ' : style "' + v + '"" has ' + err;
                  }
                }
                else if (obejctType == '[object Object]') {
                  ;
                }
              break;

              default :
                throw 'Node Predefined Style ' + index + ' : style "' + v + '"" has an unsupported value type'; 
              break;
            }
          }
        } 
      }
    }

    function applyPredefinedStylesOnLink(link_data, style, index) {
      // function was bound with gvis.graph;

      var condition = style.condition;
      var condition_result = false;
      var value = style.value;

      if (!condition || !value) {
        throw 'Link Predefined Style ' + index + ' is undefined';
      }

      condition_result = graph.evaluateLinkExpression(link_data, condition);

      // var source = this.nodes(link_data.source);
      // var target = this.nodes(link_data.target)

      // // Create the Function content.
      // var template = 'var source={}; var target={}; var type=link.type;';

      // // 1. create source object and target object.
      // template += 'source.type = link.source.type; target.type = link.target.type;'
      // template += 'source.id = link.source.id; target.id = link.target.id;'


      
      // for (var attr in source[gvis.settings.attrs]) {
      //   template += 'source["' + attr + '"] = "' +  source[gvis.settings.attrs][attr] + '";';
      // }
      // for (var attr in target[gvis.settings.attrs]) {
      //   template += 'target["' + attr + '"] = "' +  target[gvis.settings.attrs][attr] + '";';
      // }

      // // 2. create link attributes;
      // for (var attr in link_data[gvis.settings.attrs]) {
      //   template += 'var ' + attr + '="' + link_data[gvis.settings.attrs][attr] + '";';
      // }

      // // 2.5 create link other;
      // template += 'var other = ' + JSON.stringify(link_data.other) + ';';

      // // 3. check condition;
      // template += 'if (' + condition + ') return true;'
      // template += 'return false;' 

      // try {
      //   // Create Function Object by using Function content.
      //   var fn = new Function('link', template);
      //   condition_result = fn(link_data);
      // }
      // catch (err) {
      //   condition_result = false;
      // }

      // if it is true, change the style of the element.
      if (condition_result) {
        for (var v in value) {
          if (link_data[gvis.settings.styles][v] == undefined) {
            link_data[gvis.settings.styles][v] = value[v];
            // console.log('Link Predefined Style ' + index + ' : style "' + v + '" is not exist.');
            // throw 'Link Predefined Style ' + index + ' : style "' + v + '" is not exist.';
          }
          else {
            switch (typeof value[v]) {
              case 'number' :
                link_data[gvis.settings.styles][v] = value[v];
              break;

              case 'string' :
                link_data[gvis.settings.styles][v] = value[v];
              break;

              case 'boolean' :
                link_data[gvis.settings.styles][v] = value[v];
              break;

              case 'object' :
                var objectType = Object.prototype.toString.call(value[v]);

                if (objectType == '[object Array]') {
                  try {
                    var template = 'return ' + value[v][0];
                    var fn = new Function(template);

                    link_data[gvis.settings.styles][v] = fn();
                  }
                  catch (err) {
                    throw 'Link Predefined Style ' + index + ' : style "' + v + '"" has ' + err;
                  }
                }
                else if (obejctType == '[object Object]') {
                  ;
                }
              break;

              default :
                throw 'Link Predefined Style ' + index + ' : style "' + v + '"" has an unsupported value type'; 
              break;
            }
          }
        } 
      }
    }

    function generateNodeKey(in_type, in_id) {
      return in_type + gvis.settings.nodeKeyConcChar + in_id;
    }

    function generateLinkKey(key_source, key_target, in_link_type) {
      return key_source + gvis.settings.linkKeyConcChar + key_target + gvis.settings.linkKeyConcChar +  in_link_type;
    }

    function getInNodeKey(ex_type, ex_id) {
      var result = {
        type: '',
        id: '',
        key: ''
      }

      if (!!data.idMap.nodesType[ex_type]) {
        result.type = data.idMap.nodesType[ex_type];
      }
      else {
        throw 'node type '+ ex_type +' does not exist.';
      }

      if (!!data.idMap.nodesID[ex_id]) {
        result.id = data.idMap.nodesID[ex_id];
      }
      else {
        throw 'node id does not exist.';
      }

      result.key = generateNodeKey(result.type, result.id);

      return result;
    }

    function getInLinkKey(ex_source_type, ex_source_id, ex_target_type, ex_target_id, ex_link_type) {
      var result = {
        source: '',
        target: '',
        type: '',
        key: '',
      }

      result.source = getInNodeKey(ex_source_type, ex_source_id);
      result.target = getInNodeKey(ex_target_type, ex_target_id);

      if (!!data.idMap.linksType[ex_link_type]) {
        result.type = data.idMap.linksType[ex_link_type];
      }
      else {
        throw 'Link type ' + ex_link_type + ' does not exist.';
      }
      
      result.key = generateLinkKey(result.source.key, result.target.key, result.type);

      return result;
    }
  }
}).call(this);

/******************************************************************************
 * Copyright (c) 2016, GraphSQL Inc.                                          *
 * All rights reserved                                                        *
 * Unauthorized copying of this file, via any medium is strictly prohibited   *
 * Proprietary and confidential                                               *
 ******************************************************************************/
(function(undefined) {
  "use strict";

  var gvis = this.gvis;

  console.log('Loading gvis.settings')

  var settings = {
    domain_width : 1,
    domain_height : 1,
    nodeKeyConcChar : '-',
    linkKeyConcChar : '_',
    attrs: '_attrs',
    styles: '_styles',
    key: '_key',
    other: '_other',
    iterated: '_iterated',
    children: '_children',
    aggregatedNodeType: '_virtual_aggregated_node',
    aggregatedLinkType: '_virtual_aggregated_link'
  }

  gvis.settings = gvis.utils.extend(gvis.settings || {}, settings);

}).call(this);

/******************************************************************************
 * Copyright (c) 2016, GraphSQL Inc.                                          *
 * All rights reserved                                                        *
 * Unauthorized copying of this file, via any medium is strictly prohibited   *
 * Proprietary and confidential                                               *
 ******************************************************************************/
(function(undefined) {
  "use strict";
  
  var gvis = this.gvis;

  // Doing somthing for layouts
  console.log('Loading gvis.layouts')

  gvis.layouts = function(_this) {
    this._this = _this;

    this._graph = _this.graph;
    this._tree = {};
    this._rootNodeKey = '';
    this._rootNodeID = '';
    this._rootNodeType = '';

    this._layoutName = 'force'; // 'random'

    this._force = d3.layout.force()
      .gravity(.1)
      // .linkDistance(0.005)
      .linkDistance(function(l) {
        var src = l.source;
        var tgt = l.target;

        var src_r = src[gvis.settings.styles].r || this._this.behaviors.render.nodeRadius;
        var tgt_r = tgt[gvis.settings.styles].r || this._this.behaviors.render.nodeRadius;

        return 3*(src_r+tgt_r) / 600;
      }.bind(this))
      .charge(-0.02)
      .size([1, 1])

    this.addLayout('random', function() {
      var alpha = this._graph.data().array.nodes.length / 30;

      this._graph.data().array.nodes.forEach(function(n) {
        n.x = Math.random() * this._this.renderer.domain_width * alpha;
        n.y = Math.random() * this._this.renderer.domain_height * alpha;
      }.bind(this))
    });

    this.addLayout('allZero', function() {
      this._graph.data().array.nodes.forEach(function(n) {
        n.x = 0
        n.y = 0
      })
    });


    this.addLayout('tree', function() {
      var size = this.createTreeBFS();

      var rootNode = this.getRootNode();
      rootNode.x = gvis.settings.domain_width / 2.0;
      rootNode.y = 0

      var treeNodes = d3.layout.tree()
      .size([size[0] * gvis.settings.domain_width / 4.0, size[1] * gvis.settings.domain_height / 4.0])
      .separation(function(a, b) {
        return (a.parent == b.parent ? 1 : 2);
      })
      .nodes(this._tree)

      treeNodes.forEach(function(node) {
        node.node.x = node.x;
        node.node.y = node.y;
      })
    });

    this.addLayout('treemap', function() {
      var size = this.createTreeBFS();

      var rootNode = this.getRootNode();
      rootNode.x = gvis.settings.domain_width / 2.0;
      rootNode.y = 0

      var treeNodes = d3.layout.treemap().value(function(d) {return 1*d.children.length;})
      .size([size[0] * gvis.settings.domain_width / 4.0, size[1] * gvis.settings.domain_height / 4.0])
      .nodes(this._tree)

      treeNodes.forEach(function(node) {
        node.node.x = !node.parent ? 0 : node.parent.node.x + node.parent.dx * 0.3
        node.node.y = !node.parent ? 0 : node.parent.node.y + node.y - node.parent.y + node.dy * 0.5
      })
    });

    this.addLayout('DFStree', function() {
      var size = this.createTreeDFS();

      var rootNode = this.getRootNode();
      rootNode.x = gvis.settings.domain_width / 2.0;
      rootNode.y = 0

      var treeNodes = d3.layout.tree()
      .size([size[0] * gvis.settings.domain_width / 4.0, size[1] * gvis.settings.domain_height / 4.0])
      .separation(function(a, b) {
        return (a.parent == b.parent ? 1 : 2);
      })
      .nodes(this._tree)

      treeNodes.forEach(function(node) {
        node.node.x = node.x;
        node.node.y = node.y;
      })
    });

    this.addLayout('circle', function() {
      var size = this.createTreeBFS();

      var rootNode = this.getRootNode();
      rootNode.x = gvis.settings.domain_width / 2.0;
      rootNode.y = gvis.settings.domain_height / 2.0;

      var allNodes = this._graph.nodes();
      if (allNodes.length == 2) {
        allNodes.forEach(function(n, i) {
          n.x = gvis.settings.domain_width / 2.0 + i * gvis.settings.domain_width / 3.0;
          n.y = gvis.settings.domain_height / 2.0;
        })

        return;
      }
      else if (allNodes.length == 3) {
        var tmp = -1;
        allNodes.forEach(function(n, i) {
          if (n == rootNode) {
            return ;
          }
          else {
            tmp = -1 * tmp;
          }

          n.x = rootNode.x + tmp * gvis.settings.domain_width / 3.0;
          n.y = rootNode.y;
        })

        return;
      }

      var treeNodes = d3.layout.tree()
      .size([360, size[1] * gvis.settings.domain_height / 2.0])
      .separation(function(a, b) {
        return (a.parent == b.parent ? 1 : 2) / a.depth / a.depth;
      })
      .nodes(this._tree)

      treeNodes.forEach(function(node) {
        var position = gvis.utils.rotate(0, 0, node.y, 0, node.x-Math.PI/2.0)
        node.node.x = position[0] + gvis.settings.domain_width / 2.0;
        node.node.y = position[1] + gvis.settings.domain_height / 2.0;
      })
    })

    this.addLayout('sphere', function() {
      var nodes = this._graph.nodes();
      var N = nodes.length;

      var radius = (N / 360) | 0 + 1;

      nodes.forEach(function(n, i) {
        var position = gvis.utils.rotate(0, 0, 0, radius, i/N*360);
        n.x = position[0];
        n.y = position[1];
      })
    });

    this.addLayout('moreLayoutIfNeeded', function() {
      var size = this.createTreeBFS();

      var rootNode = this.getRootNode();
      rootNode.x = gvis.settings.domain_width / 2.0;
      rootNode.y = 0

      var treeNodes = [];

      treeNodes.forEach(function(node) {
        node.node.x = node.x;
        node.node.y = node.y;
      })
    })
  }

  gvis.layouts.prototype.addLayout = function(layoutName, layoutFn) {
    if ( typeof layoutName !== 'string' ||
      typeof layoutFn !== 'function' ||
      arguments.length !== 2) {
      console.error('addLayout: Wrong arguments.');
    }

    if (this[layoutName]) {
      console.warn('layout ' + layoutName + ' already exists.')
    }

    this[layoutName] = layoutFn;

    return this;
  }

  gvis.layouts.prototype.setLayout = function(layoutName) {
    layoutName = layoutName ||  this._layoutName;
    this._layoutName = layoutName;
  }

  gvis.layouts.prototype.runLayout = function(layoutName) {
    layoutName = layoutName ||  this._layoutName;

    if (!this[layoutName]) {
      return this.tree();
      throw 'layout ' + layoutName + ' does not exist.'  
    }
    else {
      return this[layoutName]();
    }
  }

  gvis.layouts.prototype.runLayoutIteratively = function(duration) {
    if (!this[this._layoutName]) {
      return this.tree();
      throw 'layout ' + layoutName + ' does not exist.'  
    }
    else {
      return this[this._layoutName](duration);
    }
  }

  // Breadth First Traverse
  gvis.layouts.prototype.createTreeBFS = function() {
    var maxDepth = 0;
    var maxWidth = 0;

    if (this._rootNodeKey === '' || !this._rootNodeKey) {
      this._rootNodeKey = this._graph.nodes()[0][gvis.settings.key];
    }

    this._graph.nodes().forEach(function(node) {
      node[gvis.settings.iterated] = false;
    })

    var rootNode = this.getRootNode();
    rootNode[gvis.settings.iterated] = true;

    this._tree = {"children":[], "node":rootNode, "depth":0};
    rootNode[gvis.settings.children] = [];

    function iterateTree (parents, depth) {
      depth += 1;

      var _graph = this._graph;

      var nextDepthParents = []

      parents.forEach(function(parent) {
        var outlinks = _graph.outgoingLinks(parent.node[gvis.settings.key]);
        var inlinks = _graph.incomingLinks(parent.node[gvis.settings.key]);

        for (var key in outlinks) {
          var node = outlinks[key][Object.keys(outlinks[key])[0]].target || {};
          if (!node[gvis.settings.iterated]) {
            node[gvis.settings.iterated] = true;

            var treeNode = {"children":[], "node":node, "depth":depth};
            node[gvis.settings.children] = [];

            parent.children.push(treeNode);
            parent.node[gvis.settings.children].push(node);

            nextDepthParents.push(treeNode);
          }
        }

        for (var key in inlinks) {
          var node = inlinks[key][Object.keys(inlinks[key])[0]].source || {};
          if (!node[gvis.settings.iterated]) {
            node[gvis.settings.iterated] = true;

            var treeNode = {"children":[], "node":node, "depth":depth};
            node[gvis.settings.children] = [];

            parent.children.push(treeNode);
            parent.node[gvis.settings.children].push(node);

            nextDepthParents.push(treeNode);
          }
        }
      })

      maxWidth = maxWidth > nextDepthParents.length ? maxWidth : nextDepthParents.length;
      if (!nextDepthParents.length) {
        maxDepth = maxDepth > depth ? maxDepth : depth;
        return;
      }
      
      iterateTree.call(this, nextDepthParents, depth);
    }

    iterateTree.call(this, [this._tree], 0)

    //console.log([maxWidth-1, maxDepth-1])
    return [maxWidth-1, maxDepth-1] 
  }

  // Depth First Traverse
  gvis.layouts.prototype.createTreeDFS = function() {
    var maxDepth = 0;
    var maxWidth = 0;

    if (this._rootNodeKey === '' || !this._rootNodeKey) {
      this._rootNodeKey = this._graph.nodes()[0][gvis.settings.key];
    }

    this._graph.nodes().forEach(function(node) {
      node[gvis.settings.iterated] = false;
    })

    var rootNode = this.getRootNode();
    rootNode[gvis.settings.iterated] = true;

    this._tree = {"children":[], "node":rootNode};
    rootNode[gvis.settings.children] = [];

    function iterateTree (parents, depth) {
      depth += 1;

      var _graph = this._graph;
      var _this = this;

      var tempMax = 0;

      parents.forEach(function(parent) {
        var outlinks = _graph.outgoingLinks(parent.node[gvis.settings.key]);
        var inlinks = _graph.incomingLinks(parent.node[gvis.settings.key]);

        for (var key in outlinks) {
          var node = outlinks[key][Object.keys(outlinks[key])[0]].target || {};
          if (!node[gvis.settings.iterated]) {
            node[gvis.settings.iterated] = true;

            var treeNode = {"children":[], "node":node, "depth":depth};
            node[gvis.settings.children] = [];

            parent.children.push(treeNode);
            parent.node[gvis.settings.children].push(node);
          }
        }

        for (var key in inlinks) {
          var node = inlinks[key][Object.keys(inlinks[key])[0]].source || {};
          if (!node[gvis.settings.iterated]) {
            node[gvis.settings.iterated] = true;

            var treeNode = {"children":[], "node":node, "depth":depth};
            node[gvis.settings.children] = [];

            parent.children.push(treeNode);
            parent.node[gvis.settings.children].push(node);
          }
        }

        tempMax += parent.children.length;

        if (!parent.children.length) {
          maxDepth = maxDepth > depth ? maxDepth : depth;
          return;
        }
        
        iterateTree.call(_this, parent.children, depth);
      })

      maxWidth = maxWidth > tempMax ? maxWidth : tempMax;
    }

    iterateTree.call(this, [this._tree], 0)

    //console.log([maxWidth-1, maxDepth-1])
    return [maxWidth-1, maxDepth-1] 
  }

  gvis.layouts.prototype.setRootNode = function(type, id) {
    try {
      this._rootNodeID = id;
      this._rootNodeType = type;
      
      var node = this._graph.nodes(this._rootNodeType, this._rootNodeID);

      this._rootNodeKey = node[gvis.settings.key]
    }
    catch (err) {
      var tempRootNode = this._graph.nodes()[0];

      if (typeof tempRootNode == 'undefined') {
        return;
      }

      this._rootNodeID = tempRootNode.id;
      this._rootNodeType = tempRootNode.type;
      this._rootNodeKey = tempRootNode[gvis.settings.key];
      
      console.log("Root node has not been found.")
    }
  }

  gvis.layouts.prototype.getRootNode = function() {
    var result = this._graph.nodes(this._rootNodeType, this._rootNodeID);

    // root node is not visualized.
    if (result == undefined) {
      result = this._graph.nodesInContainedNodes(this._rootNodeType, this._rootNodeID);

      // root node is in an aggregated node.
      if (!!result ) {
        result = this._graph.isInAggregatedNode(result) || {};
        result = result.aggregatedNode;
      }
      else {
        result = this._graph.nodes()[0];

        if (typeof result == 'undefined') {
          return;
        }

        this._rootNodeID = result.id;
        this._rootNodeType = result.type;
        this._rootNodeKey = result[gvis.settings.key];
        
        console.log("Root node has not been found.")
      }
    }
    
    return result;
  }

  gvis.layouts.prototype.clear = function() {
    this._tree = {};
    this._rootNodeKey = '';
    this._rootNodeID = '';
    this._rootNodeType = '';
  }

  gvis.layouts.prototype.force = function(duration) {

    duration = duration != undefined ? duration : 500;

    var _this = this._this;

    var nodes = this._graph.nodes();
    var links = this._graph.links();

    var force = this._force;

    force
    .nodes(nodes)
    .links(links)

    var start = new Date().getTime();
    var end = new Date().getTime();
    var time = end - start;

    force.start();

    while (time < duration) {
      end = new Date().getTime();
      time = end - start;
      force.tick();
    }

    force.stop();

    return false;
  }
}).call(this);

/******************************************************************************
 * Copyright (c) 2016, GraphSQL Inc.                                          *
 * All rights reserved                                                        *
 * Unauthorized copying of this file, via any medium is strictly prohibited   *
 * Proprietary and confidential                                               *
 ******************************************************************************/
(function(undefined) {
  "use strict";

  var gvis = this.gvis;

  // Doing somthing for events which can be customized.
  console.log('Loading gvis.events')

  gvis.events = gvis.events || {};


  gvis.events.shiftKey = {};
  gvis.events.shiftKey.mouseOnBackground = true;
  gvis.events.shiftKey.mouseOnNode = false;
  gvis.events.shiftKey.mouseOnLink = false;


  gvis.events.svg = function(svg) {
    this.svg = svg;

    var _svg = svg;
    var _scope = this;

    var shiftKey;
    var ctrlKey;
    var altKey;

    var currentKey;

    var handlers = {};

    var jobRunner = new gvis.utils.jobs()

    window.addEventListener('resize', function() {

      jobRunner.runTask(function() {
        this.resizeend(this.svg);
      }.bind(this), 300);

    }.bind(this));

    this.resizeend = function(svg) {

      // console.log('resize end events');
      svg
      .update(0, 0)
      .autoFit(500);
    }

    this.setEventHandler = function(eventName, fn) {
      handlers[eventName] = fn;
    }

    //node mouse down events.
    this.dragstarted = function() {
      d3.event.sourceEvent.stopPropagation();
      d3.select(this).classed("dragging", true);
      
      if (altKey) {

      }
      else if(shiftKey) {
        // multi select function : unselect selected node/ select unselected node.

        var thisNode = d3.select(this.parentElement)
        .each(function(d) {
          d[gvis.settings.styles].selected = !d[gvis.settings.styles].selected;
        })

        var thisLink = _svg.links().filter(function(d) {
          var tmp = d[gvis.settings.styles].selected;

          d[gvis.settings.styles].preSelected = d[gvis.settings.styles].selected = d.source[gvis.settings.styles].selected && d.target[gvis.settings.styles].selected;
          return tmp || d[gvis.settings.styles].selected;
        })

        _svg.updateNodes(thisNode);
        _svg.updateLinks(thisLink);
      }
      else {
        //unselect all nodes and get preselected nodes;
        var nodes = _svg.nodes().filter(function(d) {
          var tmp = d[gvis.settings.styles].selected;
          d[gvis.settings.styles].preSelected = d[gvis.settings.styles].selected = false;
          return tmp
        })

        //unselect all links and get preselected links;
        var links = _svg.links().filter(function(l) {
          var tmp = l[gvis.settings.styles].selected;
          l[gvis.settings.styles].preSelected = l[gvis.settings.styles].selected = false;
          return tmp;
        })

        var thisNode = d3.select(this.parentElement)
        .each(function(d) {
          d[gvis.settings.styles].preSelected = d[gvis.settings.styles].selected = true;
        })

        nodes[0] = nodes[0].concat(thisNode[0]);

        var thisLink = _svg.links().filter(function(d) {
          return d[gvis.settings.styles].preSelected = d[gvis.settings.styles].selected = d.source[gvis.settings.styles].selected && d.target[gvis.settings.styles].selected;
        })

        links[0] = links[0].concat(thisLink[0]);

        _svg.updateNodes(nodes);
        _svg.updateLinks(links);
      }

      var stop = 0;
    }

    this.dragging = function(draggingNodeData) {

      d3.select(this)
      .each(function(d) {
        d[gvis.settings.styles].selected = true;
      })

      if (shiftKey) {
        // multi-select
        _svg.g_svg.selectAll('.link')
        .each(function(d) {
          d[gvis.settings.styles].preSelected = d[gvis.settings.styles].selected = d.source[gvis.settings.styles].selected && d.target[gvis.settings.styles].selected;
        })
      }
      else {
        _svg.g_svg.selectAll('.link')
        .each(function(d) {
          d[gvis.settings.styles].preSelected = d[gvis.settings.styles].selected = d.source[gvis.settings.styles].selected && d.target[gvis.settings.styles].selected;
        })
      }

      var nodes = _svg.renders.graph.nodes().filter(function(d) {
        return d[gvis.settings.styles].selected;
      })

      for (var i in nodes) {
        var d = nodes[i];
        d.x += _svg.renders.xScale.invert(d3.event.dx);
        d.y += _svg.renders.yScale.invert(d3.event.dy);

        var node_key = d[gvis.settings.key]
        var node = _svg.g_svg.select('#node'+_svg.instanceIndex+'_'+node_key);

        _svg.updateNodeRenderer(node, _svg)

        var graph = _svg.renders.graph.data();

        for (var other_key in graph.neighbors.all[node_key]) {
          for (var link_key in graph.neighbors.all[node_key][other_key]) {
            var link= _svg.g_svg.select('#link'+_svg.instanceIndex+'_'+link_key)

            _svg.updateLinkRenderer(link, _svg)
          }
        }
      }

      // remove tipsy
      d3.selectAll('.tipsy').remove();
    }

    // This event is same as node mouse up events
    this.dragended = function() {
      d3.select(this).classed("dragging", false);

      // _svg.updateNodes();
      // _svg.updateLinks();

      if (shiftKey) {
        var nodes = _svg.renders.graph.nodes().filter(function(d) {
          return d[gvis.settings.styles].selected;
        })

        var links = _svg.renders.graph.links().filter(function(d) {
          return d[gvis.settings.styles].selected;
        })
        
        _svg.events.multiSelect(nodes, links)
        d3.event.sourceEvent.preventDefault();

        return;
      }
    }

    this.linkmousedown = function(d) {
      if (altKey) {
        console.log('alt down ', d);
      }
      else if(shiftKey) {

        var thisLink = d3.select(this.parentElement)
        .each(function(d) {
          d[gvis.settings.styles].selected = !d[gvis.settings.styles].selected;
        })

        _svg.updateLinks(thisLink);
  
        var nodesdata = _svg.renders.graph.nodes().filter(function(d) {
          return d[gvis.settings.styles].selected;
        })

        var linksdata = _svg.renders.graph.links().filter(function(d) {
          return d[gvis.settings.styles].selected;
        })
        
        _svg.events.multiSelect(nodesdata, linksdata);
      }
      else {

        //unselect all nodes and get preselected nodes;
        var nodes = _svg.nodes().filter(function(d) {
          var tmp = d[gvis.settings.styles].selected;
          d[gvis.settings.styles].preSelected = d[gvis.settings.styles].selected = false;
          return tmp
        })

        //unselect all links and get preselected links;
        var links = _svg.links().filter(function(l) {
          var tmp = l[gvis.settings.styles].selected;
          l[gvis.settings.styles].preSelected = l[gvis.settings.styles].selected = false;
          return tmp;
        })

        var thisLink = d3.select(this.parentElement)
        .each(function(d) {
          d[gvis.settings.styles].preSelected = d[gvis.settings.styles].selected = true;
        })

        links[0] = links[0].concat(thisLink[0]);

        _svg.updateNodes(nodes);
        _svg.updateLinks(links);
      }
    }

    this.brushstart = function() {
      // console.log('brush start')
      //_svg.unselectAllElements();
      _svg.g_svg.selectAll('.node')
      .each(function(d) {
        d[gvis.settings.styles].preSelected = d[gvis.settings.styles].selected;
        d[gvis.settings.styles].brushed = false;
      })
    }

    this.brush = function() {
      var extent = d3.event.target.extent();
      
      var translate = _svg.zoom.translate();
      var scale = _svg.zoom.scale();

      translate[0] = _svg.renders.xScale.invert(translate[0] / scale)
      translate[1] = _svg.renders.yScale.invert(translate[1] / scale)

      extent[0][0] = extent[0][0] / scale - translate[0]
      extent[0][1] = extent[0][1] / scale - translate[1]
      extent[1][0] = extent[1][0] / scale - translate[0]
      extent[1][1] = extent[1][1] / scale - translate[1]

      _svg.g_svg.selectAll('.node')
      .each(function(d) {
        var isSelected = (extent[0][0] <= d.x && d.x < extent[1][0] && extent[0][1] <= d.y && d.y < extent[1][1]);
        if (isSelected) {
          d[gvis.settings.styles].selected = isSelected;//!d[gvis.settings.styles].preSelected;
          d[gvis.settings.styles].brushed = true;
        }
        else {
          d[gvis.settings.styles].selected = d[gvis.settings.styles].preSelected;
        }
      })

      _svg.g_svg.selectAll('.link')
      .each(function(d) {
        d[gvis.settings.styles].preSelected = d[gvis.settings.styles].selected = d.source[gvis.settings.styles].selected && d.target[gvis.settings.styles].selected;
      })

      _svg.updateSelectedNodes();
      _svg.updateSelectedLinks();   
      // _svg.updateNodes();
      // _svg.updateLinks(); 
      d3.selectAll('.tipsy').remove();       
    }

    this.brushend = function() {
      _svg.g_svg.selectAll('.node')
      .each(function(d) {
        d[gvis.settings.styles].preSelected = d[gvis.settings.styles].selected;
        d[gvis.settings.styles].brushed = false;
      })

      _svg.g_svg.selectAll('.link')
      .each(function(d) {
        d[gvis.settings.styles].preSelected = d[gvis.settings.styles].selected = d.source[gvis.settings.styles].selected && d.target[gvis.settings.styles].selected;
      })

      // _svg.updateLinks();

      // var extent = d3.event.target.extent();
      
      // var translate = _svg.zoom.translate();
      // var scale = _svg.zoom.scale();

      // translate[0] = _svg.renders.xScale.invert(translate[0] / scale)
      // translate[1] = _svg.renders.yScale.invert(translate[1] / scale)

      // extent[0][0] = extent[0][0] / scale - translate[0]
      // extent[0][1] = extent[0][1] / scale - translate[1]
      // extent[1][0] = extent[1][0] / scale - translate[0]
      // extent[1][1] = extent[1][1] / scale - translate[1]

      var nodes = _svg.renders.graph.nodes().filter(function(d) {
        return d[gvis.settings.styles].selected;
      })

      var links = _svg.renders.graph.links().filter(function(d) {
        return d[gvis.settings.styles].selected;
      })

      if(!handlers['multiSelect']) {
        console.log('multiSelect Events : Doesn\'t Exist');
      }
      else {
        handlers['multiSelect'](nodes, links, _svg);
      }

      d3.event.target.clear();
      d3.select(this).call(d3.event.target);
    }

    this.keydown = function() {
      shiftKey = d3.event.shiftKey;
      ctrlKey = d3.event.ctrlKey;
      altKey = d3.event.altKey;
      currentKey = d3.event.keyCode;

      console.log('d3.event.keyCode down: ', d3.event.keyCode);

      if (shiftKey) {
        console.log(gvis.events.shiftKey)
        if (gvis.events.shiftKey.mouseOnBackground) {
          _svg.g_svg.call(_svg.zoom)
          .on("dblclick.zoom", null)
          .on("mousedown.zoom", null)
          .on("touchstart.zoom", null)
          .on("touchmove.zoom", null)
          .on("touchend.zoom", null);

          _svg.g_svg.selectAll('.node_container')
          .on('mousedown.drag', null);

          _svg.g_brush.select('.background').style('cursor', 'crosshair')
          _svg.g_brush.call(_svg.brush);
        }
        else {
          ;
        }

        // _svg.g_svg.selectAll('.node')
        // .each(function(d) {
        //   d[gvis.settings.styles].preSelected = d[gvis.settings.styles].selected;
        // })
      }

      // key 'f'
      if (d3.event.keyCode == 70) {
        _svg.autoFit(500);
      }
      // key 'c'
      else if (d3.event.keyCode == 67) {
        _svg.centerView(500);
      }
      // key 'r'
      else if (d3.event.keyCode == 82) {
        try {
          fixedNodeRowNumber = 0;
        }
        catch (err) {
          ;
        }
        
        _svg.g_svg
        .selectAll('.node')
        .each(function(d) {
          if (d[gvis.settings.styles].selected) {
            _svg.renders._this.layouts.setRootNode(d.type, d.id);
          }

          d.other.fixed = 0;

          return d[gvis.settings.styles].selected;
        })

        _svg.renders.render(500, 500); 
      }
      // key 'd'
      else if (d3.event.keyCode == 68) {
        _svg.g_svg
        .selectAll('.node')
        .each(function(d) {
          if (d[gvis.settings.styles].selected) {
            _svg.renders._this.graph.dropNode(d.type, d.id, false);
          }
        })

        _svg.g_svg
        .selectAll('.link')
        .each(function(d) {
          if (d[gvis.settings.styles].selected) {
            //source_type, source_id, target_type, target_id, link_type, extended
            _svg.renders._this.graph.dropLink(d.source.type, d.source.id, d.target.type, d.target.id, d.type, false);
          }
        })

        _svg.renders.update(500, 500); 
        // _svg.update()
        // _svg.autoFit(500)
      }
      // key '1'
      else if (d3.event.keyCode == 49) {
        _svg.renders._this.layouts.setLayout('circle');
        _svg.renders.render(500, 500); 
      }
      // key '2'
      else if (d3.event.keyCode == 50) {
        _svg.renders._this.layouts.setLayout('tree');
        _svg.renders.render(500, 500); 
      }
      // key '3'
      else if (d3.event.keyCode == 51) {
        _svg.renders._this.layouts.setLayout('DFStree');
        _svg.renders.render(500, 500);      
      }
      // key '4'
      else if (d3.event.keyCode == 52) {
        _svg.renders._this.layouts.setLayout('random');
        _svg.renders.render(500, 500);   
      }
      //key '5'
      else if (d3.event.keyCode == 53) {
        _svg.renders._this.layouts.setLayout('force');
        _svg.renders.render(2000, 500);  
      }
      //key 't'
      else if (d3.event.keyCode == 84) { 
        _svg.g_svg
        .selectAll('.node')
        .each(function(d) {
          if (d[gvis.settings.styles].selected) {
            console.log(d)
          }
        })
      }

    }

    this.keyup = function() {
      shiftKey = d3.event.shiftKey;
      ctrlKey = d3.event.ctrlKey;
      altKey = d3.event.altKey;

      currentKey = d3.event.keyCode;

      if (!shiftKey) {
        _svg.g_brush
        .call(_svg.brush)
        .on("mousedown.brush", null)
        .on("touchstart.brush", null)
        .on("touchmove.brush", null)
        .on("touchend.brush", null);

        _svg.g_brush.select('.background').style('cursor', 'auto');
        _svg.g_svg.call(_svg.zoom)
        .on("dblclick.zoom", null);

        _svg.g_svg.selectAll('.node_container')
        .call(_svg.drag)
      }

      console.log('d3.event.keyCode up: ', d3.event.keyCode);
    }

    this.contextmenu = function() {
      console.log('oncontextmenu _svg')

      _svg.unselectAllElements();

      d3.event.preventDefault();
    }

    this.zoomstart = function() {
      //d3.event.sourceEvent.stopPropagation();
      //d3.event.preventDefault();

      // console.log('zoomstart')
      // _svg.g_svg.selectAll('.link')
      //   .each(function(d) {
      //     d[gvis.settings.styles].preSelected = d[gvis.settings.styles].selected = d.source[gvis.settings.styles].selected || d.target[gvis.settings.styles].selected;
      //   })

    }

    this.zoomed =  function() {
      _svg.g_zoomer.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
      // _svg.labelFlag = d3.event.scale >= 0.25;
      // console.log(d3.event.scale, d3.event.translate);

      // var translate = d3.event.translate;
      // var scale = d3.event.scale;

      // translate[0] = _svg.renders.xScale.invert(translate[0] / scale)
      // translate[1] = _svg.renders.yScale.invert(translate[1] / scale)

      // var x = _svg.renders.domain_width/ 2 / scale - translate[0]
      // var y = _svg.renders.domain_height/ 2 / scale - translate[1]

      // console.log(x, y);

      // console.log(_svg.renders.domain_width);
    } 

    this.zoomend = function() {
      // d3.event.sourceEvent.preventDefault();

      // d3.event.sourceEvent.stopPropagation();
      // console.log('zoomend')
      // _svg.update(0, 0);
    }

    this.nodeRightClick = function(d) {
      if(!handlers['nodeRightClick']) {
        console.log('nodeRightClick function is not defined');
        console.log(d);
      }
      else {
        handlers['nodeRightClick'](d, _svg, this);
        console.log(d);
      }

      d3.event.stopPropagation();
      d3.event.preventDefault();
    }

    this.nodeMouseover = function(d) {
      gvis.events.shiftKey.mouseOnNode = true;
      gvis.events.shiftKey.mouseOnBackground = false;

      _svg.g_brush
      .call(_svg.brush)
      .on("mousedown.brush", null)
      .on("touchstart.brush", null)
      .on("touchmove.brush", null)
      .on("touchend.brush", null);

      _svg.g_brush.select('.background').style('cursor', 'auto');
      _svg.g_svg.call(_svg.zoom)
      .on("dblclick.zoom", null);

      _svg.g_svg.selectAll('.node_container')
      .call(_svg.drag)
    }

    this.nodeMouseout = function(d) {
      gvis.events.shiftKey.mouseOnNode = false;
      gvis.events.shiftKey.mouseOnBackground = true;

      if (shiftKey) {
        _svg.g_svg.call(_svg.zoom)
        .on("dblclick.zoom", null)
        .on("mousedown.zoom", null)
        .on("touchstart.zoom", null)
        .on("touchmove.zoom", null)
        .on("touchend.zoom", null);

        _svg.g_svg.selectAll('.node_container')
        .on('mousedown.drag', null);

        _svg.g_brush.select('.background').style('cursor', 'crosshair')
        _svg.g_brush.call(_svg.brush);
      } 
    }

    this.nodeClick = function(d) {

      if (shiftKey) {
        d3.event.preventDefault();
        return;
      }

      var that = this;
      var d = d;

      setTimeout(function() {
          var dblclick = parseInt($(that).data('doubleClickCount'), 10);

          if (dblclick > 0) {
              $(that).data('doubleClickCount', dblclick-1);
          } else {
            if(!handlers['nodeClick']) {
              console.log('node click')
            }
            else {
              handlers['nodeClick'](d, _svg, this);
            }
          }
      }, 200);
    }

    this.nodeDblClick = function(d) {
      $(this).data('doubleClickCount', 2);

      if(!handlers['nodeDblClick']) {
        console.log('node DblClick')
      }
      else {
        handlers['nodeDblClick'](d, _svg, this);
      }
    }   

    this.linkClick = function(d) {
      var that = this;
      var d = d;

      if (shiftKey) {
        d3.event.preventDefault();
        return;
      }

      setTimeout(function() {
          var dblclick = parseInt($(that).data('doubleClickCount'), 10);

          if (dblclick > 0) {
              $(that).data('doubleClickCount', dblclick-1);
          } else {
            if(!handlers['linkClick']) {
              console.log('linkClick')
            }
            else {
              handlers['linkClick'](d, _svg, this);
            }
          }
      }, 200);
    }

    this.linkRightClick = function(d) {
      if(!handlers['linkRightClick']) {
        console.log('linkRightClick function is not defined');
        console.log(d);
      }
      else {
        handlers['linkRightClick'](d, _svg, this);
        console.log(d);
      }

      d3.event.stopPropagation();
      d3.event.preventDefault();
    }

    this.linkDblClick = function(d) {
      $(this).data('doubleClickCount', 2);

      if(!handlers['linkDblClick']) {
        console.log('link DblClick')
      }
      else {
        handlers['linkDblClick'](d, _svg, this);
      }
    }

    this.linkMouseover = function(d) {
      gvis.events.shiftKey.mouseOnLink = true;
      gvis.events.shiftKey.mouseOnBackground = false;
    }

    this.linkMouseout = function(d) {
      gvis.events.shiftKey.mouseOnLink = false;
      gvis.events.shiftKey.mouseOnBackground = true;
    }

    this.multiSelect = function(nodes, links) {
      if(!handlers['multiSelect']) {
        console.log('multiSelect Events : Doesn\'t Exist');
      }
      else {
        handlers['multiSelect'](nodes, links, _svg, this);
      }
    }

    this.legendClick = function(d) {
      if (!handlers['legendClick']) {
        console.log('legendClick Events : Does not exist');
      }
      else {
        handlers['legendClick'](d, _svg, this);
      }

      d3.event.stopPropagation();
      d3.event.preventDefault();
    }
  }
}).call(this);

/******************************************************************************
 * Copyright (c) 2016, GraphSQL Inc.                                          *
 * All rights reserved                                                        *
 * Unauthorized copying of this file, via any medium is strictly prohibited   *
 * Proprietary and confidential                                               *
 ******************************************************************************/
(function(undefined) {
  "use strict";

  var gvis = this.gvis;

  // Doing something for behaviors for nodes and links by using customized configuration. Such as style structure, pre definition of the style base on attributes.
  // highlighting, coloring, hiding behaviors.
  console.log('Loading gvis.behaviors')

  gvis.behaviors = gvis.behaviors || {};

  gvis.behaviors.icons = {
    user : 'fa-user',
    movie : 'fa-file-movie-o',
    tag : 'fa-tag',
    phone : 'fa-phone',
    Phone : 'fa-phone',
    Account : 'fa-user',
    Address : 'fa-map-marker',
    Device : 'fa-wrench',
    IP : 'fa-sitemap',
    bankcard : 'fa-credit-card',
    merchant : 'fa-shopping-cart',
    transaction : 'fa-file-text',
    Mobile : 'fa-phone',    
    UserCard : 'fa-credit-card',
    MercCard : 'fa-credit-card-alt',
    User : 'fa-user',
    MerVirTerminal : 'fa-cart-arrow-down',
    Merchant : 'fa-bank',
    Txn : 'fa-file-text',
    Shop : 'fa-shopping-cart'
  }

  gvis.behaviors.icons[gvis.settings.aggregatedNodeType] = 'fa-connectdevelop';//'fa-th-large';

  gvis.behaviors.default_icon = 'fa-circle';

  gvis.behaviors.render = {    

    viewportSize : 600, // if viewportSize == 0; viewport will autoAdjust by window size.
    viewportFontFamily : "inherit",

    viewportBackgroundColor : "255, 255, 255", // has to use r g p 
    viewportBackgroundOpacity : 1,
    viewportBackgroundImg : '', // url to the background image such as /scripts/other/img/mouse_left_click.png

    //node default styles
    nodeRadius : 30,
    nodeRadiusMargin : 2,

    nodeIconRadiusRatio : 0.75,

    nodeBackgroundFillColor : '#fafafa',
    nodeBackgroundFillOpacity : 1,
    nodeBackgroundStrokeColor : 'black',
    nodeBackgroundStrokeOpacity : 0.5,
    nodeBackgroundStrokeWidth : 0.3,

    nodeLabelsFontSize : 15,
    nodeLabelsOpacity : 0.9,
    nodeLabelsBackgroundColor : '#d9d9d9',
    nodeLabelsBackgroundRectStroke : 2,

    nodeBackgroundHighlightStrokeWidth : 5,
    nodeBackgroundHighlightStrokeOpacity : 0.6,
    nodeBackgroundHighlightStrokeColor : '#f00',

    nodeBackgroundFilter : 'black-glow', // black-glow, glow, shadow

    //       -1
    //    *   | 
    //        | 
    // -1 --- 0 --- 1    (0 is center) 
    //        |
    //        |
    //        1
    nodeHeadRadiusRatio : 0.6,
    nodeHeadCenterXRatio : -.75,
    nodeHeadCenterYRatio : -.75,
    nodeHeadFillColor : '#C02F1D',
    nodeHeadFillOpacity : 1,
    nodeHeadStroke : '#ffffff',
    nodeHeadStrokeWidth : 1,
    nodeHeadStrokeOpacity : 0,
    nodeHeadFilter : 'black-glow',


    nodeFootRadiusRatio : 0.6,
    nodeFootCenterXRatio : 1.2,
    nodeFootCenterYRatio : .0,
    nodeFootFillColor : '#ffffff',
    nodeFootFillOpacity : 1,
    nodeFootStroke : '#093145',
    nodeFootStrokeWidth : 1,
    nodeFootStrokeOpacity : 0,
    nodeFootFilter : 'black-glow',
    

    // legend Node default styles
    legendNodeRadius : 12,
    legendNodeRadiusMargin : 1,
    legendNodeOpacity : 0.9,
    legendNodeStrokeOpacity : 0.9,
    legendNodeColor : '#3182bd',
    legendNodeLabelsColor : '#000',
    legendNodeLabelsBackgroundColor : '#fafafa',
    legendNodeLabelsBackgroundOpacity : 0.0,

    // legend background default styles
    legendBackgroundColor : '#fafafa',
    legendBackgroundOpacity : 0.0,
    legendBackgroundStroke : '#fff',
    legendBackgroundStrokeWidth : 2,
    legendBackgroundStrokeOpacity : 0.0,


    // link default styles
    linkMarker : 'marker-end', // marker-mid marker-end
    linkMarkerWidthAlpha : 2.8,// marker_width = link_width * linkMarkerWidthAlpha / 6;

    linkStroke : '#000',
    linkStrokeWidth : 3,
    linkStrokeOpacity : 0.8,

    linkStrokeDasharray : [0.5, 0.5],

    linkLabelsFontSize : 15,
    linkLabelsOpacity : 0.9,
    linkLabelsBackgroundColor : '#c6dbef',
    linkLabelsBackgroundRectStroke : 1,

    linkBackgroundHighlightStrokeIncreaseSize : 2,
    linkBackgroundHighlightStrokeOpacity : 1,
    linkBackgroundHighlightStrokeColor : '#f00',

    linkBackgroundFilter : 'shadow',

  }

  gvis.behaviors.style = gvis.behaviors.style || {};

  gvis.behaviors.style.node = {
    labels : {
      id:true
    },
    'selected' : false,
    'highlighted' : true,
    // 'stroke-width' : 1,
    // 'stroke' : '#000',
    // 'stroke-opacity' : 0.5,
    // 'fill-opacity' : 1,
    // 'r' : 30,
    // 'font-size' : 15,
    // 'label-opacity' : gvis.behaviors.render['nodeLabelsOpacity'],
    // 'label-background-color' : gvis.behaviors.render['nodeLabelsBackgroundColor']
  }

  gvis.behaviors.style.link = {
    labels : {
      type:false
    },
    'selected' : false,
    'highlighted' : true,
    'dashed' : false,
    // 'stroke' : gvis.behaviors.render['linkStroke'], 
    // 'stroke-dasharray' :  [0.1, 0.2, 0.1, 0.2, 0.3, 0.2],//[0.5, 0.5],
    // 'stroke-width' : 5,
    // 'stroke-opacity' : 1,
    // 'font-size' : 7,
    // 'label-opacity' : gvis.behaviors.render['linkLabelsOpacity'],
    // 'label-background-color' : gvis.behaviors.render['linkLabelsBackgroundColor']
  }

  gvis.behaviors.style.color = d3.scale.category10();

  gvis.behaviors.style.initializeNode = function(node) {
    for (var key in gvis.behaviors.style.node) {
      node[gvis.settings.styles] = node[gvis.settings.styles] || {};
      node[gvis.settings.styles][key] = node[gvis.settings.styles][key] || gvis.utils.clone(gvis.behaviors.style.node[key]);

      //testing
      // if (key == 'r') {
      //   node[gvis.settings.styles][key] = Math.random() * 100 + 10
      // }
    }

    node.other = node.other || {};
  }


  gvis.behaviors.style.initializeLink = function(link) {
    for (var key in gvis.behaviors.style.link) {
      link[gvis.settings.styles] = link[gvis.settings.styles] || {};
      link[gvis.settings.styles][key] = link[gvis.settings.styles][key] || gvis.utils.clone(gvis.behaviors.style.link[key]);

      //testing
      // if (key == 'stroke-width') {
      //   link[gvis.settings.styles][key] = Math.random()*5 + 1
      // }
      // if (key == 'dashed') {
      //   link[gvis.settings.styles][key] = Math.random() > 0.2
      // }
    }
  }

  gvis.behaviors.style.nodeToolTips = {
    'default' : function(type, id, attrs) {
      var template = '<span style="color:{{color}}">{{key}}</span>:{{value}}<br />'; 

      var result = '';

      result += gvis.utils.applyTemplate(template, {color:'#fec44f', key:'id', value:id});
      result += gvis.utils.applyTemplate(template, {color:'#fec44f', key:'type', value:type})

      for (var key in attrs) {
        result += gvis.utils.applyTemplate(template, {color:'#99d8c9', key:key, value:attrs[key]})
      }
      
      return result;
    },
    'customized' : undefined
  } 

  gvis.behaviors.style.linkToolTips = {
    'default' : function(type, attrs) {
      var template = '<span style="color:{{color}}">{{key}}</span>:{{value}}<br />'; 

      var result = '';

      //result += gvis.utils.applyTemplate(template, {color:'#fec44f', key:'id', value:d.id});
      result += gvis.utils.applyTemplate(template, {color:'#fec44f', key:'type', value:type})

      for (var key in attrs) {
        result += gvis.utils.applyTemplate(template, {color:'#99d8c9', key:key, value:attrs[key]})
      }
      
      return result;
    },
    'customized' : undefined
  }
}).call(this);

/******************************************************************************
 * Copyright (c) 2016, GraphSQL Inc.                                          *
 * All rights reserved                                                        *
 * Unauthorized copying of this file, via any medium is strictly prohibited   *
 * Proprietary and confidential                                               *
 ******************************************************************************/
(function(undefined) {
  "use strict";

  var gvis = this.gvis;

  // Doing somthing for renders
  console.log('Loading gvis.render')

  gvis.renders = function(_this) {

    this._this = _this; // gvis pointer.
    this.graph = _this.graph;

    this.render_container = _this.conf.container;
    this.render_type = !_this.conf.render_type ? 'svg' : _this.conf.render_type;    

    this.domain_width = gvis.settings.domain_width;
    this.domain_height = gvis.settings.domain_height;

    this.range_width = +d3.select('#'+this.render_container).style('width').slice(0, -2);
    this.range_height = +d3.select('#'+this.render_container).style('height').slice(0, -2);

    this.range_min = Math.max(this.range_width, this.range_height);

    this.jobRunner = new gvis.utils.jobs();

    // The initial position for adding new nodes. It will affect the animated look and feel.
    this.initial_position = [0, 0];

    // legend object for determing which legend item should be visualized.
    // type : true or false;
    this.render_legend = {
      nodes : {
      },
      links : {
      }
    }

    // render_legend.nodes[gvis.settings.aggregatedNodeType] = false;
    // render_legend.nodes[gvis.settings.aggregatedLinkType] = false;

    // color object for rendering the nodes and links.
    this.color = new gvis.utils.color();

    this.color.setNodeColor(gvis.settings.aggregatedNodeType, '#ababab');
    this.color.setLinkColor(gvis.settings.aggregatedLinkType, '#ababab');

    // class gvis_loader : position: absolute; left: 50%; top: 40%; transform: translate(-50%, -50%); display: block;

    this.loader = d3.select('#'+this.render_container)
    .append('div')
    .attr('id', 'loader_'+this._this._instanceIndex)
    .classed('gvis_loader', true)
    .style('position', 'absolute')
    .style('left', '45%')
    .style('top', '30%')
    .style('-webkit-transform', 'translate(-50%, -50%)')
    .style('display', 'none')
    .style('z-index', 10)

    if (_this.behaviors.render.viewportSize != 0) {
      this.range_min = this._this.behaviors.render.viewportSize;
    }

    this.zoomRange = [0.01, 5];

    this.xScale = d3.scale.linear()
    .domain([0, this.domain_width])
    // .range([0, this.range_width]);
    .range([0, this.range_min]);

    this.yScale = d3.scale.linear()
    .domain([0, this.domain_height])
    // .range([0, this.range_height])
    .range([0, this.range_min])

    this.handler = {
      vertex:{
        head:function() {
          return false;
        },
        foot:function() {
          return false;
        }
      }, edge:{}};

    switch (this.render_type) {
      case 'canvas':
        this.renderer = 'render ' + this.render_container + ' by using canvas. Coming soon.';
      break;
      case 'map':
        this.renderer = 'render ' + this.render_container + ' by using map. Coming soon.';
      break;
      case 'svg':
      default:
        this.renderer = new gvis.renders.svg(this);
      break;
    }

    this.setRenderHandler = function(graphElement, renderElement, fn) {
      if (this.handler[graphElement] === undefined) {
        console.error('graph element ' + graphElement + ' does not exist.')
        return ;
      }
      else {
        this.handler[graphElement][renderElement] = fn;
      }
    }

    this.setEventHandler = function(eventName, fn) {
      this.renderer.events.setEventHandler(eventName, fn)
    }

    this.generateCurvedLinkPoints = function(link) {
      var source = {}
      var target = {}

      var link_width = link[gvis.settings.styles]['stroke-width'] || this._this.behaviors.render.linkStrokeWidth;
      var marker_width = link_width * this._this.behaviors.render.linkMarkerWidthAlpha / 6;
      var marker_margin = marker_width * 7;

      source.data = link.source;
      target.data = link.target;

      source.r = source.data[gvis.settings.styles]['r'] || this._this.behaviors.render.nodeRadius;
      target.r = target.data[gvis.settings.styles]['r'] || this._this.behaviors.render.nodeRadius;

      var alpha = 0.15;
      var beta = 5//1.2; // margin distance for edge
      var gamma = 1.3;

      source.margin = source.r + beta;

      // link is default not directed.
      // if is directed, marker maring 6*link_width will be added.
      if (!!link.directed) {
        target.margin = target.r + beta + marker_margin;
      }
      else {
        target.margin = target.r + beta;
      }

      var n = 0;
      var i = -1;

      var graph = this.graph.data();

      source.key = link.source[gvis.settings.key];
      target.key = link.target[gvis.settings.key];

      var link_key = link[gvis.settings.key];

      n = Object.keys(graph.neighbors.all[source.key][target.key]).length;

      i = Object.keys(graph.neighbors.out[source.key][target.key]).indexOf(link_key)

      if (n == 0 || i == -1) {
        throw "link does not exist in graph."
      }

      var C0 = [0, 0]
      var C1 = [0, 0]

      var x0 = this.xScale(link.source.x)
      var y0 = this.yScale(link.source.y)
      var x1 = this.xScale(link.target.x)
      var y1 = this.yScale(link.target.y)

      // If it is a self-circle link
      if (link.source === link.target) {

        var alpha = 0.4;
        var beta = 2.0;

        var temp_x = source.margin + (i+1) * beta * source.margin;
        var temp_y = source.margin + (i+1) * beta * source.margin;

        C0[0] = x0 - temp_x;
        C0[1] = y0 - alpha * temp_y;

        // if (!!link.directed)
        //   C1[0] = x1;
        // else {
        //   C1[0] = x1 - alpha * temp_x;
        // }
        C1[0] = x1 - alpha * temp_x;
        C1[1] = y1 - temp_y;

        var tx0 = x0 - source.margin;
        var ty0 = y0 - source.margin / 3.0;

        var tx1 = x1 - target.margin / 3.0;
        var ty1 = y1 - target.margin ;

        return [[tx0, ty0], C0, C1, [tx1, ty1]]
      }

      var b = gamma * Math.min(source.r, target.r)
      var tb = ((n-1)/2-i) * b
      var td = Math.sqrt((x0-x1)*(x0-x1)+(y0-y1)*(y0-y1));
      var t = td - source.margin - target.margin;
      var t0 = t * alpha;
      var t1 = t - t0;
      var angle = Math.atan2(y1-y0, x1-x0)*180/Math.PI;

      C0[0] = x0 + t0 + source.margin;
      C0[1] = y0 + tb;
      C1[0] = x0 + t1 + source.margin;
      C1[1] = y0 + tb;

      C0 = gvis.utils.rotate(x0, y0, C0[0], C0[1], angle);
      C1 = gvis.utils.rotate(x0, y0, C1[0], C1[1], angle);

      link._C0 = C0;
      link._C1 = C1;

      if (source.margin + target.margin >= td) {
        return []; // overlaping
      }

      source.tdc = Math.sqrt((C0[0]-x0)*(C0[0]-x0)+(C0[1]-y0)*(C0[1]-y0));
      target.tdc = Math.sqrt((C1[0]-x1)*(C1[0]-x1)+(C1[1]-y1)*(C1[1]-y1));

      var tdc = Math.sqrt((C1[0]-x1)*(C1[0]-x1)+(C1[1]-y1)*(C1[1]-y1));

      var tx0 = x0 - source.margin * (x0 - C0[0]) / source.tdc
      var ty0 = y0 - source.margin * (y0 - C0[1]) / source.tdc;

      var tx1 = x1 - target.margin * (x1 - C1[0]) / target.tdc
      var ty1 = y1 - target.margin * (y1 - C1[1]) / target.tdc;

      return [[tx0, ty0], C0, C1, [tx1, ty1]]
    }
  }

  gvis.renders.prototype.update = function(duration, delay) {
    duration = duration != undefined ? duration : 500;
    delay = delay != undefined ? delay : 0;

    this.loader
    .style('display', 'block');

    this.renderer.update(duration, delay);

    this.loader
    .style('display', 'none');

    return this;
  }

  /**
   * Update visualization elements by type.
   *  
   * @param {Object} [options]      Available options:
   *                                `node: array`
   *                                    contains the node types that want to be updated.
   *                                `link: array`
   *                                    contains the link types that want to be updated.
   */
  gvis.renders.prototype.updateByType = function(options) {

    this.loader
    .style('display', 'block');

    try {
      if (options.node) {
        var nodes = this.renderer.g_nodes.selectAll('.node').filter(function(n) {
          return options.node.indexOf(n.type) !== -1;
        })

        this.renderer.updateNodes(nodes);
      }

      if (options.link) {
        var links = this.renderer.g_links.selectAll('.link').filter(function(l) {
          return options.link.indexOf(l.type) !== -1;
        })

        this.renderer.updateLinks(links);
      }
    }
    catch (err) {
      console.error ('update by type error : ' + err);
      this.renderer.update(0, 0);
    }
    
    this.loader
    .style('display', 'none');

    return this;
  }

  gvis.renders.prototype.iconName = function(type) {

    var result = this.renderer.icons[type] || this._this.behaviors.icons[type];

    if (!gvis.utils.fontAwesome[result]) {
      result = this._this.behaviors.default_icon;
    }

    return result;
  }

  gvis.renders.prototype.autoFit = function(duration, delay) {
    duration = duration != undefined ? duration : 500;
    delay = delay != undefined ? delay : 0;
    this.renderer.autoFit(duration, delay);

    return this
  }

  gvis.renders.prototype.zoomin = function() {

    this.renderer.zoomin();

    return this;
  }

  gvis.renders.prototype.zoomout = function() {

    this.renderer.zoomout();

    return this;
  }

  gvis.renders.prototype.setLegendBox = function(x, y) {
    this.renderer.setLegendBox(x, y);

    return this;
  }

  gvis.renders.prototype.render = function(duration, init_delay) {
    var _this = this;

    var layouttime = 300;

    _this.loader
    .style('display', 'block');

    if (!this.graph.nodes().length) {
      this.update(duration, init_delay); 
      return;
    }
    else {
      _this._this.layouts.runLayoutIteratively(layouttime);
      setTimeout(function() {
        _this.update(duration, init_delay);

        setTimeout(function() {
          _this.autoFit(300);

          // console.log('_End');

          _this.loader
           .style('display', 'none');

        }, duration+init_delay)
      }, layouttime);
    }
  }

  gvis.renders.prototype.clear = function() {
    this.renderer.clear();
  }

  gvis.renders.prototype.setIcon = function(type, icon) {

    if (icon !== gvis.behaviors.default_icon && gvis.utils.icon(icon) === gvis.utils.icon(gvis.behaviors.default_icon)) {
      console.warn(icon, ' icon name is not supported yet.');
      this.renderer.icons[type] = gvis.behaviors.default_icon;
    }
    else {
      this.renderer.icons[type] = icon;
    }

    return this;
  }

  /********** renders sub class **********/

  /********** renders.svg **********/
  gvis.renders.svg = function(renders) {
    this.renders = renders;

    this.instanceIndex = renders._this._instanceIndex;

    this.events = new gvis.events.svg(this);

    this.legend_box = {x:10, y:10, width:0, height:0};

    // Show labels or not. True : False
    this.labelFlag = true;

    this._this = renders._this;
    var _this = renders._this;

    this.icons = {};

    var container_id = "#" + renders.render_container

    this.zoom = d3.behavior.zoom()
    .scaleExtent(renders.zoomRange)
    .on("zoomstart", this.events.zoomstart)
    .on("zoom", this.events.zoomed)
    .on("zoomend", this.events.zoomend)

    this.brush = d3.svg.brush()
    .x(this.renders.xScale)
    .y(this.renders.yScale)
    .on("brushstart", this.events.brushstart)
    .on("brush", this.events.brush)
    .on("brushend", this.events.brushend);

    this.drag = d3.behavior.drag()
    .origin(function(d) { return d; })
    .on("dragstart", this.events.dragstarted)
    .on("drag", this.events.dragging)
    .on("dragend", this.events.dragended);

    var svg = d3.select(container_id)
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("font-family", this._this.behaviors.render.viewportFontFamily)
    .attr("tabindex", 1)
    // .attr("viewBox", "0 0 1000 1000")
    // .attr("preserveAspectRatio", "xMinYMin meet")
    .style("background-size", "100% 100%")
    .style("background-image", "url('"+this._this.behaviors.render.viewportBackgroundImg+"')")
    .style("background-repeat", "no-repeat")
    .style("background-position", "center center")
    .style("background-color", function() {
       return "rgba(" + this._this.behaviors.render.viewportBackgroundColor + "," + this._this.behaviors.render.viewportBackgroundOpacity + " )"
    }.bind(this))
    
    .on("keydown", this.events.keydown)
    .on("keyup", this.events.keyup)
    .on("contextmenu", this.events.contextmenu)
    .call(this.zoom)
    .on("dblclick.zoom", null);

    //  svg
    // .append('rect')
    // .classed('background_rect', true) 
    // .attr("width", "100%")
    // .attr("height", "100%")
    // .attr("fill", this._this.behaviors.render.viewportBackgroundColor)
    // .attr("opacity", this._this.behaviors.render.viewportBackgroundOpacity)
    // .attr("stroke", "transparent")

    var defs = svg.append("defs");

    // defs.append("svg:clipPath")
    // .attr('id', "node-mask")
    // .append("svg:circle")
    // .attr("r", this._this.behaviors.render.nodeMaskRadius-1)
    // .attr("cx", 0)
    // .attr("cy", 0);

    defs.append('g')
    .attr('id', 'filter_group' + this.instanceIndex)
    .html(function(){
      return '\
        <!-- a transparent grey drop-shadow that blends with the background colour -->\
        <filter id="filter_shadow'+this.instanceIndex+'" width="1.5" height="1.5" x="-.25" y="-.25">\
            <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" result="blur"/>\
            <feColorMatrix result="bluralpha" type="matrix" values=\
                    "1 0 0 0   0\
                     0 1 0 0   0\
                     0 0 1 0   0\
                     0 0 0 0.4 0 "/>\
            <feOffset in="bluralpha" dx="3" dy="3" result="offsetBlur"/>\
            <feMerge>\
                <feMergeNode in="offsetBlur"/>\
                <feMergeNode in="SourceGraphic"/>\
            </feMerge>\
        </filter>\
        \
        <!-- a transparent grey glow with no offset -->\
        <filter id="filter_black-glow'+this.instanceIndex+'">\
            <feColorMatrix type="matrix" values=\
                        "0 0 0 0   0\
                         0 0 0 0   0\
                         0 0 0 0   0\
                         0 0 0 0.7 0"/>\
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>\
            <feMerge>\
                <feMergeNode in="coloredBlur"/>\
                <feMergeNode in="SourceGraphic"/>\
            </feMerge>\
        </filter>\
        \
        <!-- a transparent glow that takes on the colour of the object it\'s applied to -->\
        <filter id="filter_glow'+this.instanceIndex+'">\
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>\
            <feMerge>\
                <feMergeNode in="coloredBlur"/>\
                <feMergeNode in="SourceGraphic"/>\
            </feMerge>\
        </filter>\
        <filter x="0" y="0" width="1" height="1" id="node_label_background'+this.instanceIndex+'">\
          <feFlood flood-color="'+this._this.behaviors.render.nodeLabelsBackgroundColor+'"/>\
          <feComposite in="SourceGraphic"/>\
        </filter>\
        <filter x="0" y="0" width="1" height="1" id="link_label_background'+this.instanceIndex+'">\
          <feFlood flood-color="'+this._this.behaviors.render.linkLabelsBackgroundColor+'"/>\
          <feComposite in="SourceGraphic"/>\
        </filter>\
        '
    }.bind(this))



    var g_brush = svg.append('g')
    .classed('brush', true)
    .datum(function() {
      return {selected: false, preSelected: false};
    })
    .call(this.brush)

    var g_zoomer = svg.append('g')

    var g_links = g_zoomer.append('g').classed('links_group', true)

    var g_nodes = g_zoomer.append('g').classed('nodes_group', true)

    var g_legends = svg.append('g')
    .classed('legends_group', true)
    .attr('transform', function() {
      var temp = [this.legend_box.x, this.legend_box.y];
      return "translate("+temp+")";
    }.bind(this))

    g_legends
    .append('rect')
    .classed('legends_background', true)
    .attr('rx', 4)
    .attr('ry', 4)
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', 0)
    .attr('height', 0)
    .attr('fill', this._this.behaviors.render.legendBackgroundColor)
    .attr('fill-opacity', this._this.behaviors.render.legendBackgroundOpacity)
    .attr('stroke', this._this.behaviors.render.legendBackgroundStroke)
    .attr('stroke-width', this._this.behaviors.render.legendBackgroundStrokeWidth)
    .attr('stroke-opacity', this._this.behaviors.render.legendBackgroundStrokeOpacity)

    g_legends.append('g').classed('legends_items', true)

    this.g_svg = svg;

    this.g_brush = g_brush;

    this.g_zoomer = g_zoomer;

    this.g_links = g_links

    this.g_nodes = g_nodes

    this.g_legends = g_legends

    g_brush
    .on("mousedown.brush", null)
    .on("touchstart.brush", null)
    .on("touchmove.brush", null)
    .on("touchend.brush", null)
    .select('.background').style('cursor', 'auto');

    this.update = function(duration, delay) {
      //console.log('render.svg.update ' + container_id)

      duration = duration != undefined ? duration : 500;
      delay = delay != undefined ? delay : 0;

      this.renders.domain_width = +d3.select(container_id).style('width').slice(0, -2) / this.renders.range_min
      this.renders.domain_height = +d3.select(container_id).style('height').slice(0, -2) / this.renders.range_min

      this.renders.range_width = +d3.select(container_id).style('width').slice(0, -2);
      this.renders.range_height = +d3.select(container_id).style('height').slice(0, -2);
      
      this.renders.xScale = d3.scale.linear()
      .domain([0, this.renders.domain_width])
      .range([0, this.renders.range_width]);

      this.renders.yScale = d3.scale.linear()
      .domain([0, this.renders.domain_height])
      .range([0, this.renders.range_height]);

      this.brush
      .x(this.renders.xScale)
      .y(this.renders.yScale)

      console.group('Update');
      // console.count('add link');

      // DATA BINDING
      // Binding new data with old elements, if any.
      var d_links = g_links.selectAll('.link').data(_this.graph.data().array.links, function(d) {
        return d[gvis.settings.key]
      })

      // console.count('add link');

      var d_nodes = g_nodes.selectAll('.node').data(_this.graph.data().array.nodes, function(d) {
        return d[gvis.settings.key]
      })


      // Create legend data;

      var legend_data = [];

      var legend_node = _this.graph.getNodeLegends().filter(function(n) {

        var result = renders.render_legend.nodes[n.type];
        result = result === undefined ? true : result;

        return result;
      });
      var legend_link = _this.graph.getLinkLegends().filter(function(l) {

        var result = renders.render_legend.links[l.type];
        result = result === undefined ? true : result;

        return result;
      });

      legend_data = legend_data.concat(legend_node);
      legend_data = legend_data.concat(legend_link);

      var d_legends = g_legends.select('.legends_items').selectAll('.legend').data(legend_data, function(d) {
        return d.type + d.element;
      })

      g_legends
      .transition()
        .delay(delay)
        .duration(duration)
      .attr('transform', function() {
        var temp = [this.legend_box.x, this.legend_box.y];
        return "translate("+temp+")";
      }.bind(this))

      // console.count('add link');

      // ENTER
      // Create new elements as needed.
      d_nodes
      .enter()
      .append('g')
      .classed('node', true)
      .attr('id', function(d) {
        return 'node'+this.instanceIndex+'_'+d[gvis.settings.key]
      }.bind(this))
      .call(this.addNodeRenderer, this)

      d_legends
      .enter()
      .append('g')
      .classed('legend', true)
      .call(this.addLegendRenderer, this)

      d_links
      .enter()
      .append('g')
      .classed('link', true)
      .attr('id', function(d) {
        return 'link'+this.instanceIndex+'_'+d[gvis.settings.key]
      }.bind(this))
      .call(this.addLinkRenderer, this)

      // console.count('add link');

      // EXIT
      // Remove old elements as needed.
      
      d_nodes.exit().remove();
      d_legends.exit().remove();
      d_links.exit().remove();


      // ENTER + UPDATE
      // Appending to the enter selection expands the update selection to include
      // entering elements; so, operations on the update selection after appending to
      // the enter selection will apply to both entering and updating nodes.
      // Updating current elements
      
      d_nodes.call(this.updateNodeRenderer, this, duration, delay);
      d_legends.call(this.updateLegendRenderer, this, duration, delay);
      d_links.call(this.updateLinkRenderer, this, duration, delay)

      // console.count('add link');

      if (!d_legends.empty()) {
        g_legends
        .select('.legends_background')
        .transition()
        .delay(delay)
        .duration(duration)
        .attr('width', this.legend_box.width-1)
        .attr('height', this.legend_box.height-1)
      }
      else {
        g_legends
        .select('.legends_background')
        .transition()
        .delay(delay)
        .duration(duration)
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 0)
        .attr('height', 0)
      }

      console.groupEnd();

      // remove tipsy
      d3.selectAll('.tipsy').remove();

      this.g_zoomer
      .transition()
      .delay(delay)
      .duration(duration)
      .attr("transform", "translate(" + this.zoom.translate() + ")scale(" + this.zoom.scale() + ")");

      return this;
    }   
  }

  gvis.renders.svg.prototype.clear = function() {
    this.g_links.selectAll('*').remove();
    this.g_nodes.selectAll('*').remove();
    this.g_legends.select('.legends_items').selectAll('*').remove();
    this.g_legends.select('.legends_background')
    .attr('width', 0)
    .attr('height', 0)
  }

  gvis.renders.svg.prototype.addNodeRenderer = function() {
    //console.log("addNodeRenderer", this, arguments)

    var nodes = arguments[0];
    var _svg = arguments[1];

    console.time('add node renderer');

    nodes[0].forEach(function(n) {
      if (!n) {
        return;
      }

      // adding node
      var node = d3.select(n)
      .append('g')
      .classed('node_container', true)
      .attr("transform", function(d) { 
        var x = _svg.renders.initial_position[0];
        var y = _svg.renders.initial_position[1];

        return "translate(" + _svg.renders.xScale(x) + "," + _svg.renders.yScale(y) + ")"; 
      })

      var data = node.data()[0];

      if (data.x == undefined) data.x = _svg.renders.initial_position[0];
      if (data.y == undefined) data.y = _svg.renders.initial_position[0];

      node
      // .attr("transform", function(d) {
      //   return "translate(" + _svg.renders.xScale(d.x) + "," + _svg.renders.yScale(d.y) + ")"; 
      // })
      .on("dblclick", _svg.events.nodeDblClick)
      .on("click", _svg.events.nodeClick)
      .on("mouseover", _svg.events.nodeMouseover)
      .on("mouseout", _svg.events.nodeMouseout)
      .on("contextmenu", _svg.events.nodeRightClick)
      .call(_svg.drag)

      
      var r = data[gvis.settings.styles]['r'] || _svg.renders._this.behaviors.render.nodeRadius;
      var margin = data[gvis.settings.styles]['r'] * 0.1 || _svg.renders._this.behaviors.render.nodeRadiusMargin
      var iconRadius = r - margin;

      var stroke_opacity = data[gvis.settings.styles]['stroke-opacity'] || _svg.renders._this.behaviors.render.nodeBackgroundStrokeOpacity;
      var stroke_width = data[gvis.settings.styles]['stroke-width'] || _svg.renders._this.behaviors.render.nodeBackgroundStrokeWidth
      var stroke = data[gvis.settings.styles]['stroke'] || _svg.renders._this.behaviors.render.nodeBackgroundStrokeColor

      var fill = data[gvis.settings.styles]['fill'] || 'blue'
      var fill_opacity = data[gvis.settings.styles]['fill-opacity'] || _svg.renders._this.behaviors.render.nodeBackgroundFillOpacity
      var fill_background = data[gvis.settings.styles]['fill-background'] || _svg.renders._this.behaviors.render.nodeBackgroundFillColor

      var font_size = data[gvis.settings.styles]['font-size'] || _svg.renders._this.behaviors.render.nodeLabelsFontSize

      var label_opacity = data[gvis.settings.styles]['label-opacity'] || _svg.renders._this.behaviors.render.nodeLabelsOpacity
      var label_background_color = data[gvis.settings.styles]['label-background-color'] || _svg.renders._this.behaviors.render.nodeLabelsBackgroundColor  


      // bacground circle for node icon
      node
      .append('circle')
      .classed('node_background_circle', true)
      .attr('stroke-opacity', stroke_opacity)
      .attr('stroke-width', stroke_width + 'px')
      .attr('stroke', stroke)
      .attr('fill', fill_background)
      .attr('r', iconRadius + 'px')
      .attr('filter', 'url(#filter_'+_svg.renders._this.behaviors.render.nodeBackgroundFilter+_svg.instanceIndex+')')

      // add node icon
      // var icon = gvis.utils.icon(_svg.icons[data.type] || _svg.renders._this.behaviors.icons[data.type]);

      // var matrix = [];

      // var sx = this._this.behaviors.render.nodeIconRadiusRatio * iconRadius*2.0/icon.width;
      // var sy = this._this.behaviors.render.nodeIconRadiusRatio * iconRadius*2.0/icon.height;

      // var scale = sx < sy ? sx : sy

      // var cx = icon.width/2 + icon.x;
      // var cy = icon.height/2 + icon.y;

      // var matrix= [scale, 0, 0, scale, -scale*cx, -scale*cy]

      node
      .append('text')
      .classed('icon unselectable', true)
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'central')
      .attr("x",0)
      .attr("y",0)
      .attr("font-family","FontAwesome")
      .attr('font-size', iconRadius * 2 * _svg.renders._this.behaviors.render.nodeIconRadiusRatio + 'px')
      .attr('fill', fill)

      var label = node
                  .append('g')
                  .attr('id', function(d) {
                    return 'label_group'+_svg.instanceIndex+'_' + d[gvis.settings.key];
                  })
                  .classed('unselectable', true)
                  .style('cursor', 'default')
                  .attr('opacity', label_opacity)

      // add node labels
      var text = label.append('text')
      .attr('id', function(d) {
        return 'label'+_svg.instanceIndex+'_' + d[gvis.settings.key];
      })
      .attr("text-anchor", "middle")
      .attr('y', iconRadius + font_size / 3.0 + 'px')
      .attr('filter', 'url(#node_label_background'+_svg.instanceIndex+')')

      // var bbox = gvis.utils.getBBox(text[0][0]); //text[0][0].getBBox();

      // // add node label background rectangle
      // label.insert('rect', '#label'+_svg.instanceIndex+'_' + data[gvis.settings.key])
      // //label.append('rect')
      // .classed('label_background_rect', true)
      // .attr('rx', 4)
      // .attr('ry', 4)
      // .attr('x', bbox.x)
      // .attr('y', bbox.y)
      // .attr('width', bbox.width)
      // .attr('height', bbox.height)
      // .attr('fill', label_background_color)

      node
      .append('g')
      .classed('node_head ', true)
      .classed('unselectable', true)
      .attr('id', 'head'+_svg.instanceIndex+'_'+data[gvis.settings.key])

      node
      .append('g')
      .classed('node_foot', true)
      .classed('unselectable', true)
      .attr('id', 'foot'+_svg.instanceIndex+'_'+data[gvis.settings.key])
      
      $(node[0][0]).tipsy({ 
        gravity: 'w',  // n s e w
        html: true,
        title: function() {
          var d = this.__data__;

          if (!!_svg.renders._this.behaviors.style.nodeToolTips.customized) {
            return _svg.renders._this.behaviors.style.nodeToolTips.customized(d.type, d.id, d[gvis.settings.attrs], d);
          }
          else {
            var type = d.type;
            var id = d.id;
            var attrs = d[gvis.settings.attrs];
            var template = '<span style="color:{{color}}">{{key}}</span>:{{value}}<br />'; 

            var result = '';
            var translate = _svg.renders._this.language.translate;

            result += gvis.utils.applyTemplate(template, {color:'#fec44f', key:'id', value:id});
            result += gvis.utils.applyTemplate(template, {color:'#fec44f', key:'type', value:translate(type, "ui_component", "label")})

            for (var key in attrs) {
              result += gvis.utils.applyTemplate(template, {color:'#99d8c9', key:translate(key, type, 'detail information'), value:attrs[key]})
            }
            
            return result;
            // return _svg.renders._this.behaviors.style.nodeToolTips.default(d.type, d.id, d[gvis.settings.attrs], d);
          }
        }
      });
    })

    console.timeEnd('add node renderer');

  }

  gvis.renders.svg.prototype.updateNodeRenderer = function() {
    var nodes = arguments[0];
    var _svg = arguments[1];
    var duration = arguments[2] || 0;
    var delay = arguments[3] || 0;

    console.time('update node renderer');

    nodes[0].forEach(function(n) {
      if (!n) {
        return;
      }

      // select node
      var node = d3.select(n);

      node
      .select('.node_container')
      .transition()
      .delay(delay)
      .duration(duration)
      .attr("transform", function(d) { 
        d.x = isNaN(d.x) ? 0 : d.x;
        d.y = isNaN(d.y) ? 0 : d.y;

        return "translate(" + _svg.renders.xScale(d.x) + "," + _svg.renders.yScale(d.y) + ")"; 
      })

      // get data
      var data = node.data()[0];

      var r = data[gvis.settings.styles]['r'] || _svg.renders._this.behaviors.render.nodeRadius;
      var margin = _svg.renders._this.behaviors.render.nodeRadiusMargin
      // var margin = data[gvis.settings.styles]['r']/4.0 || _svg.renders._this.behaviors.render.nodeRadiusMargin
      var iconRadius = r - margin;

      var stroke_opacity = data[gvis.settings.styles]['stroke-opacity'] || _svg.renders._this.behaviors.render.nodeBackgroundStrokeOpacity;
      

      var stroke_width = data[gvis.settings.styles]['stroke-width'] || _svg.renders._this.behaviors.render.nodeBackgroundStrokeWidth
      var stroke = data[gvis.settings.styles]['stroke'] || _svg.renders._this.behaviors.render.nodeBackgroundStrokeColor

      var fill = data[gvis.settings.styles]['fill'] || _svg.renders.color.getNodeColor(data.type);
      var fill_opacity = data[gvis.settings.styles]['fill-opacity'] || _svg.renders._this.behaviors.render.nodeBackgroundFillOpacity

      var fill_background = data[gvis.settings.styles]['fill-background'] || _svg.renders._this.behaviors.render.nodeBackgroundFillColor

      var font_size = data[gvis.settings.styles]['font-size'] || _svg.renders._this.behaviors.render.nodeLabelsFontSize

      var label_opacity = data[gvis.settings.styles]['label-opacity'] || _svg.renders._this.behaviors.render.nodeLabelsOpacity
      

      var label_background_color = data[gvis.settings.styles]['label-background-color'] || _svg.renders._this.behaviors.render.nodeLabelsBackgroundColor  

      var filter = 'url(#filter_'+_svg.renders._this.behaviors.render.nodeBackgroundFilter+_svg.instanceIndex+')';

      // For Selected Style
      stroke_opacity = data[gvis.settings.styles].selected ? _svg.renders._this.behaviors.render.nodeBackgroundHighlightStrokeOpacity : stroke_opacity;
      stroke_width = data[gvis.settings.styles].selected ? _svg.renders._this.behaviors.render.nodeBackgroundHighlightStrokeWidth : stroke_width;
      stroke = data[gvis.settings.styles].selected ? _svg.renders._this.behaviors.render.nodeBackgroundHighlightStrokeColor : stroke;      
      filter = data[gvis.settings.styles].selected ? 'url(#filter_glow'+_svg.instanceIndex+')' : filter

      // For Highlighted Style
      // label_opacity = data[gvis.settings.styles]['highlighted'] ? label_opacity : 0.1;
      fill_opacity = data[gvis.settings.styles]['highlighted'] ? fill_opacity : 0.1;
      stroke_opacity = data[gvis.settings.styles]['highlighted'] ? stroke_opacity : 0.1;

      node
      .attr('fill-opacity', fill_opacity);

      node
      .select('.node_background_circle')
      .transition()
      .delay(delay)
      .duration(duration)
      .attr('fill', fill_background)
      .attr('r', iconRadius + 'px')
      .attr('stroke-opacity', stroke_opacity)
      .attr('stroke-width', stroke_width + 'px')
      .attr('stroke', stroke)
      .attr('filter', filter)


      // get node icon
      var icon = gvis.utils.icon(_svg.icons[data.type] || _svg.renders._this.behaviors.icons[data.type]);

      //     {
      //       icon : gvis.utils.fontAwesome[_svg.icons[data.type] || _svg.renders._this.behaviors.icons[data.type]],
      //       x : -5,
      //       y : -5,
      //       width : 10,
      //       height : 10
      //     }

      // var sx = this._this.behaviors.render.nodeIconRadiusRatio * iconRadius*2.0/icon.width;
      // var sy = this._this.behaviors.render.nodeIconRadiusRatio * iconRadius*2.0/icon.height;

      // var scale = sx < sy ? sx : sy

      // var cx = icon.width/2 + icon.x;
      // var cy = icon.height/2 + icon.y;

      // var matrix= [scale, 0, 0, scale, 0-scale*cx, 0-scale*cy]

      // update icon
      node
      .select('.icon')
      .transition()
      .delay(delay)
      .duration(duration)
      .attr('font-size', iconRadius * 2 * _svg.renders._this.behaviors.render.nodeIconRadiusRatio + 'px')
      .attr('fill', fill)
      .text(function(d) {
        return icon;
      })

      var label = node.select('#label_group'+_svg.instanceIndex+'_' + data[gvis.settings.key])

      label
      .transition()
      .delay(delay)
      .attr('opacity', label_opacity)

      // select label
      var text = node.select('#label'+_svg.instanceIndex+'_' + data[gvis.settings.key])
      var labelNumber = 0;

      text
      .transition()
      .delay(delay)
      .duration(duration)
      .attr("font-size", font_size + 'px')
      .each(function(d) {
        labelNumber = nodeLabelGenerator(this, d, _svg.renders);
      })

      // ********************************* //
      // start to handle vertex _head.
      var check = false;
      try {
        check = _svg.renders.handler.vertex.head(data);
      }
      catch (err) {
        check = false;
      }

      // if (data.other && data.other._head && data.other._head.count && data.other._head.count !== 1) {
      if (check && data.other && data.other._head && data.other._head.count) {

        var radius= _svg.renders._this.behaviors.render.nodeHeadRadiusRatio * iconRadius;

        var cx = _svg.renders._this.behaviors.render.nodeHeadCenterXRatio * iconRadius;
        var cy = _svg.renders._this.behaviors.render.nodeHeadCenterYRatio * iconRadius; 

        var fill = _svg.renders._this.behaviors.render.nodeHeadFillColor;
        var fill_opacity = _svg.renders._this.behaviors.render.nodeHeadFillOpacity;
        var stroke = _svg.renders._this.behaviors.render.nodeHeadStroke;
        var stroke_width = _svg.renders._this.behaviors.render.nodeHeadStrokeWidth;
        var stroke_opacity = _svg.renders._this.behaviors.render.nodeHeadStrokeOpacity;
        var filter = 'url(#filter_'+_svg.renders._this.behaviors.render.nodeHeadFilter+_svg.instanceIndex+')';


        var head = node.select('#head'+_svg.instanceIndex+'_'+data[gvis.settings.key]);

        head
        .selectAll('circle')
        .data([data])
        .enter()
        .append('circle')

        head
        .selectAll('circle')
        .attr('cx', cx + 'px')
        .attr('cy', cy + 'px')
        .attr('fill', fill)
        // .attr('fill-opacity', fill_opacity)
        .attr('r', radius + 'px')
        .attr('stroke-opacity', stroke_opacity)
        .attr('stroke-width', stroke_width + 'px')
        .attr('stroke', stroke)
        .attr('filter', filter)

        var text_color = stroke;
        var content = '' + data.other._head.count;

        // var text_color = d3.rgb(data[gvis.settings.styles]['fill']).darker(1);

        head.selectAll('text')
        .data([data])
        .enter()
        .append('text')

        var head_text = head.selectAll('text')
        .attr('fill', text_color)
        .attr('font-size', radius * 0.8 + 'px')
        .text(content)

        // var tbbox = gvis.utils.getBBox(head_text[0][0]); //head_text[0][0].getBBox();


        var tbbox = {
          x : 0,
          y : -1 * (radius*0.9) + stroke_width,
          height : radius + stroke_width,
          width : content.length * radius / 2
        }

        var text_width = tbbox.width
        var text_height = tbbox.height;
        var text_y = tbbox.y;

        var tsx = 2 * radius / text_width;
        var tsy = 2 * radius / text_height;

        var tscale = tsx < tsy ? tsx : tsy

        var tcx = text_width / 2.0;
        var tcy = text_height / 2.0 + text_y;

        //transform="matrix(sx, 0, 0, sy, newcx-sx*cx, newcy-sy*cy)"
        var tmatrix= [tscale, 0, 0, tscale, cx-tscale*tcx, cy-tscale*tcy]

        head_text
        .attr('transform', 'matrix('+tmatrix+')')

        // console.log(data.other._head.count);
      }
      else {
        node.select('#head'+_svg.instanceIndex+'_'+data[gvis.settings.key])
        .selectAll("*")
        .remove();
      }
      // ********************************* //

      // ********************************* //
      // start to handle vertex _foot.
      var check = false;
      try {
        check = _svg.renders.handler.vertex.foot(data);
      }
      catch (err) {
        check = false;
      }

      if (check && data.other && data.other._foot && Object.keys(data.other._foot.levels).length) {

        var radius= _svg.renders._this.behaviors.render.nodeFootRadiusRatio * iconRadius;

        var cx = _svg.renders._this.behaviors.render.nodeFootCenterXRatio * iconRadius;
        var cy = _svg.renders._this.behaviors.render.nodeFootCenterYRatio * iconRadius; 

        var fill = _svg.renders._this.behaviors.render.nodeFootFillColor;
        var fill_opacity = _svg.renders._this.behaviors.render.nodeFootFillOpacity;
        var stroke = _svg.renders._this.behaviors.render.nodeFootStroke;
        var stroke_width = _svg.renders._this.behaviors.render.nodeFootStrokeWidth;
        var stroke_opacity = _svg.renders._this.behaviors.render.nodeFootStrokeOpacity;
        var filter = 'url(#filter_'+_svg.renders._this.behaviors.render.nodeFootFilter+_svg.instanceIndex+')';


        var foot = node.select('#foot'+_svg.instanceIndex+'_'+data[gvis.settings.key]);

        foot
        .selectAll('rect')
        .data([data])
        .enter()
        .append('rect')

        foot
        .selectAll('rect')
        .attr('fill', fill)
        // .attr('fill-opacity', fill_opacity)
        .attr('stroke-opacity', stroke_opacity)
        .attr('stroke-width', stroke_width + 'px')
        .attr('stroke', stroke)
        .attr('filter', filter)

        // var text_color = d3.rgb(data[gvis.settings.styles]['fill']).darker(1);
        var text_color = stroke;

        foot.selectAll('text')
        .data([data])
        .enter()
        .append('text')

        var content = Object.keys(data.other._foot.levels).join(',');

        var foot_text = foot.selectAll('text')
        .attr('fill', text_color)
        .attr('font-size', radius + 'px')
        .text(content)

        // var tbbox2 = gvis.utils.getBBox(foot_text[0][0]); //foot_text[0][0].getBBox();

        var tbbox = {
          x : 0,
          y : -1 * radius + stroke_width,
          height : radius + stroke_width,
          width : content.length * radius / 2
        }

        var text_width = tbbox.width
        var text_height = tbbox.height;
        var text_y = tbbox.y;

        var tsx = 2 * radius / text_width;
        var tsy = 2 * radius / text_height;

        var tscale = tsx < tsy ? tsx : tsy

        var tcx = text_width / 2.0;
        var tcy = text_height / 2.0 + text_y;

        var tmatrix= [tscale, 0, 0, tscale, cx-tscale*tcx, cy-tscale*tcy]

        foot_text
        .attr('transform', 'matrix('+tmatrix+')')

        foot
        .selectAll('rect')
        .attr('x', 0)
        .attr('y', -.8 * text_height + 'px')
        .attr('width', text_width + 'px')
        .attr('height', text_height + 'px')
        .attr('transform', 'matrix('+tmatrix+')')

      }
      else {
        node.select('#foot'+_svg.instanceIndex+'_'+data[gvis.settings.key])
        .selectAll("*")
        .remove();
      }

      // ********************************* //

    })

    function nodeLabelGenerator(target, data, render) {

      if (!render.renderer.labelFlag) {
        d3.select(target)
        .selectAll('tspan')
        .remove()
        
        return 0;
      }
      //var labels = _svg.renders.labels.nodes[data.type];
      var labels = data[gvis.settings.styles].labels || {};
      var font_size = data[gvis.settings.styles]['font-size'] || _svg.renders._this.behaviors.render.nodeLabelsFontSize

      var node_label = [];

      if (!!labels['type']) {
        node_label.push({'Type':data.type})
      }

      if (!!labels['id']) {
        node_label.push({'ID':data.id})
      }

      for (var attr in data[gvis.settings.attrs]) {
        if (!!labels[attr]) {
          var temp = {};
          temp[attr] = data[gvis.settings.attrs][attr];
          node_label.push(temp)
        }
      }

      var container = d3.select(target)
                      .selectAll('tspan')
                      .data(node_label)

      container
      .enter()
      .append('tspan')
      .attr('x', 0)

      container
      .exit()
      .remove();

      container
      .attr('dy', function(d, i) {
        if (i == 0) {
          return font_size + 'px';
        }
        else {
          return font_size + 'px';
        }
      })
      .text(function(d) {
        var key = Object.keys(d)[0];

        if (key == 'Type') {
          return render._this.language.translate(key, data.type, 'detail information') + ':' + render._this.language.translate(d[key], "ui_component", 'label');
        }
        else {
          return render._this.language.translate(key, data.type, 'detail information') + ':' + d[key];
        }
      })

      return node_label.length;
    }

    console.timeEnd('update node renderer');

  }

  gvis.renders.svg.prototype.addLinkRenderer = function() {
    var links = arguments[0];
    var _svg = arguments[1];

    console.time('add link renderer');

    links[0].forEach(function(l) {
      if (!l) {
        return;
      }

      var link = d3.select(l)
                 .append('g')
                 .classed('link_container', true)
                 .on("dblclick", _svg.events.linkDblClick)
                 .on("click", _svg.events.linkClick)
                 .on("contextmenu", _svg.events.linkRightClick)
                 .on("mousedown", _svg.events.linkmousedown)
                 .on("mouseover", _svg.events.linkMouseover)
                 .on("mouseout", _svg.events.linkMouseout)


      var data = link.data()[0]

      if (data.source.x == undefined) data.source.x = _svg.renders.initial_position[0];
      if (data.source.y == undefined) data.source.y = _svg.renders.initial_position[1];
      if (data.target.x == undefined) data.target.x = _svg.renders.initial_position[0];
      if (data.target.y == undefined) data.target.y = _svg.renders.initial_position[1];


      var path = link.append('g')
                 .classed('link_path', true)

      var display;
      var x;
      var y; 


      // base on points to determing whether show the links.
      var points = _svg.renders.generateCurvedLinkPoints(data);

      if (points.length == 0) {
        display = 'none';

        var x0 = _svg.renders.xScale(data.source.x)
        var y0 = _svg.renders.yScale(data.source.y)
        var x1 = _svg.renders.xScale(data.target.x)
        var y1 = _svg.renders.yScale(data.target.y)
        
        points = [[x0, y0], [x0, y0], [x1, y1], [x1, y1]]
      } 
      else {
        display = '';
      }

      x = 0.5 * points[1][0] + 0.5 * points[2][0];
      y = 0.5 * points[1][1] + 0.5 * points[2][1];

      path.append('defs')
      .append("marker")
      .classed('link_marker_background', true)
      .attr('id', 'link_marker_background'+_svg.instanceIndex+'_'+data[gvis.settings.key])
      .each(function(d) {
        var stroke_width = d[gvis.settings.styles]['stroke-width'] || _svg.renders._this.behaviors.render.linkStrokeWidth;
        stroke_width = stroke_width + Math.sqrt(stroke_width) + _svg.renders._this.behaviors.render.linkBackgroundHighlightStrokeIncreaseSize;

        var marker_width = stroke_width * _svg.renders._this.behaviors.render.linkMarkerWidthAlpha / 6;

        var template = '<path d="M0,0 L0,{{a}} L{{b}},{{c}} L0,0"/>';
        var marker = gvis.utils.applyTemplate(template, {a:6*marker_width, b:7*marker_width, c:3*marker_width});

        d3.select(this)
        .attr("markerWidth", 10*marker_width + 'px')
        .attr("markerHeight", 10*marker_width + 'px')
        .attr("refX", 0.75*marker_width + 'px')
        .attr("refY", 3*marker_width + 'px')
        .attr("orient", "auto")
        .attr("fill", _svg.renders._this.behaviors.render.linkBackgroundHighlightStrokeColor)
        .attr("markerUnits", "userSpaceOnUse") // User for "strokeWidth"
        .attr("stroke-width", 3*marker_width + 'px')
        .attr("fill-opacity", 0)
        .html(marker)
      })

      path.append('path')
      .classed('link_line_background', true)
      .attr('id', 'link_line_background'+_svg.instanceIndex+'_'+data[gvis.settings.key])
      .attr("fill", 'none')
      .attr("stroke", _svg.renders._this.behaviors.render.linkBackgroundHighlightStrokeColor)
      .attr("stroke-linecap", "round") // square, round, butt
      .attr("stroke-width", function(d) {
        var stroke_width = d[gvis.settings.styles]['stroke-width'] || _svg.renders._this.behaviors.render.linkStrokeWidth;
        return stroke_width + Math.sqrt(stroke_width) + _svg.renders._this.behaviors.render.linkBackgroundHighlightStrokeIncreaseSize + 'px';
      })
      .attr("stroke-opacity", 0)
      .attr("d", function(d) {
        var line = d3.svg.line().interpolate("basis");
        return line(points);
      })
      .attr(_svg.renders._this.behaviors.render.linkMarker, function(d) {
        if (!!d.directed)
          return 'url(#link_marker_background'+_svg.instanceIndex+'_'+data[gvis.settings.key] + ")"
        else 
          return "";
      })

      path.append('defs')
      .append("marker")
      .classed('link_marker', true)
      .attr('id', 'link_marker'+_svg.instanceIndex+'_'+data[gvis.settings.key])
      .each(function(d) {
        var stroke_width = d[gvis.settings.styles]['stroke-width'] || _svg.renders._this.behaviors.render.linkStrokeWidth;
        var marker_width = stroke_width * _svg.renders._this.behaviors.render.linkMarkerWidthAlpha / 6;

        var template = '<path d="M0,0 L0,{{a}} L{{b}},{{c}} L0,0"/>';
        var marker = gvis.utils.applyTemplate(template, {a:6*marker_width, b:7*marker_width, c:3*marker_width});

        d3.select(this)
        .attr("markerWidth", 10*marker_width + 'px')
        .attr("markerHeight", 10*marker_width + 'px')
        .attr("refX", 0.5*marker_width + 'px')
        .attr("refY", 3*marker_width + 'px')
        .attr("orient", "auto")
        .attr("fill", function(d) {
          return d[gvis.settings.styles]['stroke'] || _svg.renders.color.getLinkColor(d.type);
        })
        .attr("markerUnits", "userSpaceOnUse") // User for "strokeWidth"
        .attr("stroke-width", 3*marker_width + 'px')
        .html(marker)
      })

      path.append('path')
      .classed('link_line', true)
      .attr('id', 'link_line'+_svg.instanceIndex+'_'+data[gvis.settings.key])
      .attr("fill", 'none')
      .attr("stroke", function(d) {
        return d[gvis.settings.styles]['stroke'] || _svg.renders.color.getLinkColor(d.type);
      })
      .attr("stroke-width", function(d) {
        return (d[gvis.settings.styles]['stroke-width'] || _svg.renders._this.behaviors.render.linkStrokeWidth)  + 'px';
      })
      .attr("stroke-linecap", "round")
      .attr("stroke-dasharray", function(d) {
        if (!!d[gvis.settings.styles].dashed) {
          var result = "";
          var stroke_width = d[gvis.settings.styles]['stroke-width'] || _svg.renders._this.behaviors.render.linkStrokeWidth;
          var dashArray = d[gvis.settings.styles]['stroke-dasharray'] || _svg.renders._this.behaviors.render.linkStrokeDasharray
          var dash_number = dashArray.length;

          for (var index in dashArray) {
            result += 2 * dash_number * dashArray[index] * stroke_width + " ";
          }
          return result
        }
        else {
          return ""
        }
      })
      .attr("opacity", function(d) {
        var opacity = d[gvis.settings.styles]['stroke-opacity'] || _svg.renders._this.behaviors.render.linkStrokeOpacity;
        return opacity;
      })
      .attr("d", function(d) {
        var line = d3.svg.line().interpolate("basis");
        return line(points);
      })
      //.attr("marker-end", "url(#link_marker_"+data[gvis.settings.key] + ")")
      .attr(_svg.renders._this.behaviors.render.linkMarker, function(d) {
        if (!!d.directed)
          return 'url(#link_marker'+_svg.instanceIndex+'_'+data[gvis.settings.key] + ")"
        else 
          return "";
      })

      var label_opacity = data[gvis.settings.styles]['label-opacity'] || _svg.renders._this.behaviors.render.linkLabelsOpacity
      var label_background_color = data[gvis.settings.styles]['label-background-color'] || _svg.renders._this.behaviors.render.linkLabelsBackgroundColor  

      // adding labels for links
      var label = link.append('g')
      .classed('unselectable', true)
      .style('cursor', 'default')
      .attr('id', 'label'+_svg.instanceIndex+'_' + data[gvis.settings.key])
      // .attr("transform", function(d) { 
      //   return "translate(" + x + "," + (y-_svg.renders._this.behaviors.render.linkLabelsFontSize) + ")"; 
      // })

      //link.attr('display', 'block');

      var text = label.append('text')
      .attr('id', 'label_text'+_svg.instanceIndex+'_' + data[gvis.settings.key])
      .classed('link_label_text', true)
      .attr("text-anchor", "middle")
      .attr('filter', 'url(#link_label_background'+_svg.instanceIndex+')')
    })

    console.timeEnd('add link renderer');

  }

  gvis.renders.svg.prototype.updateLinkRenderer = function() {
    var links = arguments[0]
    var _svg = arguments[1];
    var duration = arguments[2] || 0;
    var delay = arguments[3] || 0;

    console.time('udpate link renderer');

    links[0].forEach(function(l) {
      if (!l) {
        return;
      }

      var link = d3.select(l).select('.link_container')

      // link
      // .on("dblclick", _svg.events.linkDblClick)
      // .on("click", _svg.events.linkClick)
      // .on("contextmenu", _svg.events.linkRightClick)
      // .on('mousedown', _svg.events.linkmousedown)
      // .on("mouseover", _svg.events.linkMouseover)
      // .on("mouseout", _svg.events.linkMouseout)

      var data = link.data()[0]

      var points = _svg.renders.generateCurvedLinkPoints(data);

      var x;
      var y;
      var display;
      var visibility;

      if (points.length == 0) {
        display = 'none';
        visibility = 'hidden';

        var x0 = _svg.renders.xScale(data.source.x)
        var y0 = _svg.renders.yScale(data.source.y)
        var x1 = _svg.renders.xScale(data.target.x)
        var y1 = _svg.renders.yScale(data.target.y)
        
        points = [[x0, y0], [x0, y0], [x1, y1], [x1, y1]]
      } 
      else {
        display = 'inline';
        visibility = 'visible';
      }

      // for label position.
      x = 0.5 * points[1][0] + 0.5 * points[2][0];
      y = 0.5 * points[1][1] + 0.5 * points[2][1];

      var line = d3.svg.line().interpolate("basis")(points);

      var stroke = data[gvis.settings.styles]['stroke'] || _svg.renders.color.getLinkColor(data.type);
      var stroke_width = data[gvis.settings.styles]['stroke-width'] || _svg.renders._this.behaviors.render.linkStrokeWidth; 
      var stroke_opacity = data[gvis.settings.styles]['stroke-opacity'] || _svg.renders._this.behaviors.render.linkStrokeOpacity;
      stroke_opacity = data[gvis.settings.styles]['selected'] ? 0.3 : stroke_opacity

      var marker_width = stroke_width * _svg.renders._this.behaviors.render.linkMarkerWidthAlpha / 6;
      var marker_fill = stroke;

      var dashArray = data[gvis.settings.styles]['stroke-dasharray'] || _svg.renders._this.behaviors.render.linkStrokeDasharray

      var background_stroke_width = stroke_width + Math.sqrt(stroke_width) + _svg.renders._this.behaviors.render.linkBackgroundHighlightStrokeIncreaseSize;
      var background_marker_width = background_stroke_width * _svg.renders._this.behaviors.render.linkMarkerWidthAlpha / 6;

      var label_opacity = data[gvis.settings.styles]['label-opacity'] || _svg.renders._this.behaviors.render.linkLabelsOpacity

      var label_background_color = data[gvis.settings.styles]['label-background-color'] || _svg.renders._this.behaviors.render.linkLabelsBackgroundColor  

      // For Selected Style
      var background_stroke_opacity = data[gvis.settings.styles]['selected'] ? _svg.renders._this.behaviors.render.linkBackgroundHighlightStrokeOpacity : 0;


      // For Highlighted Stlye
      stroke_opacity = data[gvis.settings.styles]['highlighted'] ? stroke_opacity : 0.1;
      label_opacity = data[gvis.settings.styles]['highlighted'] ? label_opacity : 0.1;

      link.select('#link_marker_background'+_svg.instanceIndex+'_'+data[gvis.settings.key])
      .each(function(d) {
        
        var template = '<path d="M0,0 L0,{{a}} L{{b}},{{c}} L0,0"/>';
        var marker = gvis.utils.applyTemplate(template, {a:6*background_marker_width, b:7*background_marker_width, c:3*background_marker_width});

        d3.select(this)
        .attr("markerWidth", 10*background_marker_width + 'px')
        .attr("markerHeight", 10*background_marker_width + 'px')
        .attr("refX", 0.75*background_marker_width + 'px')
        .attr("refY", 3*background_marker_width + 'px')
        .attr("orient", "auto")
        .attr("fill", _svg.renders._this.behaviors.render.linkBackgroundHighlightStrokeColor)
        .attr("markerUnits", "userSpaceOnUse") // User for "strokeWidth"
        .attr("stroke-width", 3*background_marker_width + 'px')
        .attr("fill-opacity", background_stroke_opacity)
        .html(marker)
      })
  
      link.select('#link_line_background'+_svg.instanceIndex+'_'+data[gvis.settings.key])
      .transition()
      .delay(delay)
      .duration(duration)  
      .attr("fill", 'none')
      .attr("stroke", _svg.renders._this.behaviors.render.linkBackgroundHighlightStrokeColor)
      .attr("stroke-linecap", "round") // square, round, butt
      .attr("stroke-width", background_stroke_width + 'px')
      .attr("stroke-opacity", background_stroke_opacity)
      .attr("d", line)
      .attr(_svg.renders._this.behaviors.render.linkMarker, function(d) {
        if (!!d.directed)
          return 'url(#link_marker_background'+_svg.instanceIndex+'_'+data[gvis.settings.key] + ")"
        else 
          return "";
      })

      link.select('#link_marker'+_svg.instanceIndex+'_'+data[gvis.settings.key])
      .each(function(d) {

        var template = '<path d="M0,0 L0,{{a}} L{{b}},{{c}} L0,0"/>';
        var marker = gvis.utils.applyTemplate(template, {a:6*marker_width, b:7*marker_width, c:3*marker_width});

        d3.select(this)
        .attr("markerWidth", 10*marker_width + 'px')
        .attr("markerHeight", 10*marker_width + 'px')
        .attr("refX", 0.5*marker_width + 'px')
        .attr("refY", 3*marker_width + 'px')
        .attr("orient", "auto")
        .attr("fill", marker_fill)
        .attr("markerUnits", "userSpaceOnUse") // User for "strokeWidth"
        .attr("stroke-width", 3*marker_width + 'px')
        .html(marker)
      })

      link.select('#link_line'+_svg.instanceIndex+'_'+data[gvis.settings.key])
      .transition()
      .delay(delay)
      .duration(duration)
      .attr("fill", 'none')
      .attr("stroke", stroke)
      .attr("stroke-width", stroke_width + 'px')
      .attr("stroke-linecap", "round")
      .attr("stroke-dasharray", function(d) {
        if (!!d[gvis.settings.styles].dashed) { 
          var result = "";         
          var dash_number = dashArray.length;

          for (var index in dashArray) {
            result += 2 * dash_number * dashArray[index] * stroke_width + " ";
          }
          return result
        }
        else {
          return ""
        }
      })
      .attr("opacity", stroke_opacity)
      .attr("d", line)
      //.attr("marker-end", "url(#link_marker_"+data[gvis.settings.key] + ")")
      .attr(_svg.renders._this.behaviors.render.linkMarker, function(d) {
        if (!!d.directed)
          return 'url(#link_marker'+_svg.instanceIndex+'_'+data[gvis.settings.key] + ")"
        else 
          return "";
      })

      var font_size = data[gvis.settings.styles]['font-size'] || _svg.renders._this.behaviors.render.linkLabelsFontSize


      var label = link.select('#label'+_svg.instanceIndex+'_'+data[gvis.settings.key])
      .transition()
      .delay(delay)
      .duration(duration)
      .attr("transform", function(d) { 
        return "translate(" + x + "," + (y-font_size) + ")"; 
      })
      .attr("opacity", label_opacity)

      link.select('.link_container')
      .attr('display', display);

      var text = link.select('#label_text'+_svg.instanceIndex+'_' + data[gvis.settings.key]);
      var labelNumber = 0;

      text
      .attr('font-size', font_size + 'px')
      .transition()
      .delay(delay)
      .duration(duration)
      .each(function(d) {
        labelNumber = linkLabelGenerator(this, d, _svg.renders);
      })

      // var bbox;
      // if (labelNumber == 0) {
      //   bbox = {height:0, width:0, x:0, y:0}
      // }
      // else {
      //   try {
      //     bbox = gvis.utils.getBBox(text[0][0]);//text[0][0].getBBox();
      //   }
      //   catch(err) {
      //     bbox = {height:0, width:0, x:0, y:0}
      //   }
      // }
      
      // var stroke_width_background_rect = bbox.height == 0 ? 0 : _svg.renders._this.behaviors.render.linkLabelsBackgroundRectStroke;

      text.attr('display', display);
      link.attr('display', display);

      // if (data[gvis.settings.styles].selected) {
      //   link.select('.label_background_rect')
      //   .transition()
      //   .delay(delay)
      //   .duration(duration)
      //   .attr('x', bbox.x-stroke_width_background_rect/2)
      //   .attr('y', bbox.y-stroke_width_background_rect/2)
      //   .attr('width', bbox.width+stroke_width_background_rect)
      //   .attr('height', bbox.height+stroke_width_background_rect)
      //   .attr('fill', label_background_color)
      //   .attr('fill-opacity', label_opacity)
      //   .attr('stroke', _svg.renders._this.behaviors.render.linkBackgroundHighlightStrokeColor)
      //   .attr('stroke-width', stroke_width_background_rect)
      //   .attr('stroke-opacity', 0.5)
      //   .attr('stroke-alignment', 'outer')
      // }
      // else {
      //   link.select('.label_background_rect')
      //   .transition()
      //   .delay(delay)
      //   .duration(duration)
      //   .attr('x', bbox.x)
      //   .attr('y', bbox.y)
      //   .attr('width', bbox.width)
      //   .attr('height', bbox.height)
      //   .attr('fill', label_background_color)
      //   .attr('fill-opacity', label_opacity)
      //   .attr('stroke', this._this.behaviors.render.linkBackgroundHighlightStrokeColor)
      //   .attr('stroke-width', stroke_width_background_rect)
      //   .attr('stroke-opacity', 0)
      //   .attr('stroke-alignment', 'outer')
      // }
    })

    console.timeEnd('udpate link renderer');


    function linkLabelGenerator(target, data, render) {
      if (!render.renderer.labelFlag) {
        d3.select(target)
        .selectAll('tspan')
        .remove()

        return 0;
      }

      //var labels = _svg.renders.labels.links[data.type];

      var labels = data[gvis.settings.styles].labels || {};
      var font_size = data[gvis.settings.styles]['font-size'] || _svg.renders._this.behaviors.render.linkLabelsFontSize

      var link_label = [];

      if (!!labels['type']) {
        link_label.push({'Type':data.type})
      }

      if (!!labels['id']) {
        link_label.push({'ID':data.id})
      }

      for (var attr in data[gvis.settings.attrs]) {
        if (!!labels[attr]) {
          var temp = {};
          temp[attr] = data[gvis.settings.attrs][attr];
          link_label.push(temp)
        }
      }

      var container = d3.select(target)
                      .selectAll('tspan')
                      .data(link_label)

      container
      .enter()
      .append('tspan')
      .attr('x', 0)
      // .attr('dy', function(d, i) {
      //   if (i == 0) {
      //     return font_size / 2;
      //   }
      //   else {
      //     return font_size;
      //   }
      // })
      // .text(function(d) {
      //   var key = Object.keys(d)[0];
      //   return key + ':' + d[key];
      // })

      container
      .exit()
      .remove();

      container
      .attr('dy', font_size + 'px')
      .text(function(d) {
        var key = Object.keys(d)[0];        
        return render._this.language.translate(key, data.type, 'detail information') + ':' + d[key];
      })

      return link_label.length;
    }
  }

  gvis.renders.svg.prototype.addLegendRenderer = function() {
    var legends = arguments[0] 
    var _svg = arguments[1];

    legends[0].forEach(function(l, i) {
      if (!l) {
        return;
      }

      // adding legend
      var legend = d3.select(l)
      .append('g')
      .classed('legend_container', true)
      .on('mousedown', _svg.events.legendClick)
      .on('mouseover', function(d) {
        // console.log('mouseover', d)
        d3.select(this)
        .style('cursor', 'pointer')
      })
      .on('mouseout', function(d) {
        // console.log('mouseout', d)
        d3.select(this)
        .style('cursor', 'auto')
      })

      var data = legend.data()[0];
      var type = data.type;
      var element = data.element;

      if (element == 'node') {
        // bacground circle for legend node icon
        legend
        .append('circle')
        .classed('legend_background_circle', true)
        .attr('stroke-opacity', 0)
        .attr('fill', _svg.renders._this.behaviors.render.nodeBackgroundFillColor)
        .attr('opacity', _svg.renders._this.behaviors.render.legendNodeOpacity)
        .attr('r', _svg.renders._this.behaviors.render.legendNodeRadius-_svg.renders._this.behaviors.render.legendNodeRadiusMargin)
        .style('cursor', 'inherit')

        legend
        .append('text')
        .classed('icon unselectable', true)
        .attr("x",0)
        .attr("y",0)
        .attr("font-family","FontAwesome")
        .attr('font-size', function(d) { return (_svg.renders._this.behaviors.render.legendNodeRadius-_svg.renders._this.behaviors.render.legendNodeRadiusMargin) * 1.5 + 'px';})
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'central')
        .style('cursor', 'inherit')

        // end add legend icon font

        var label = legend
                    .append('g')
                    .style('cursor', 'inherit')

        // add legend labels
        var text = label.append('text')
        .classed('unselectable', true)
        .style('cursor', 'inherit')
        .attr('id', function(d) {
          return 'legendLabel'+_svg.instanceIndex+'_' + gvis.utils.replaceAllSpecialCharactors(d.type+d.element);
        })
        .attr('font-size', _svg.renders._this.behaviors.render.legendNodeRadius + 'px')
        .attr('fill', _svg.renders._this.behaviors.render.legendNodeLabelsColor)
        .attr('text-anchor', 'left')
        .attr('x', _svg.renders._this.behaviors.render.legendNodeRadius * 1.00)
        .attr('y', (_svg.renders._this.behaviors.render.legendNodeRadius) * 0.25 )
        .text(function(d) {
          return this.renders._this.language.translate(d.type, "ui_component", "label");
        }.bind(_svg))

        var bbox = gvis.utils.getBBox(text[0][0]);//text[0][0].getBBox();

        // add node label background rectangle
        label.insert('rect', '#legendLabel'+_svg.instanceIndex+'_' + gvis.utils.replaceAllSpecialCharactors(type+element))
        //label.append('rect')
        .classed('legendLabel_background_rect', true)
        .attr('rx', 0)
        .attr('ry', 0)
        .attr('x', bbox.x)
        .attr('y', bbox.y)
        .attr('width', bbox.width)
        .attr('height', bbox.height)
        .attr('fill', _svg.renders._this.behaviors.render.legendNodeLabelsBackgroundColor)
        .attr('opacity', _svg.renders._this.behaviors.render.legendNodeLabelsBackgroundOpacity)
      }
      else if (element == 'link') {

        var r = _svg.renders._this.behaviors.render.legendNodeRadius-_svg.renders._this.behaviors.render.legendNodeRadiusMargin;

        legend
        .append('circle')
        .classed('legend_background_circle', true)
        .attr('stroke-opacity', 0)
        .attr('fill', _svg.renders._this.behaviors.render.nodeBackgroundFillColor)
        .attr('opacity', _svg.renders._this.behaviors.render.legendNodeOpacity)
        .attr('r', r)
        .style('cursor', 'inherit')

        legend
        .append('g')
        .style('cursor', 'inherit')
        .classed('icon', true)
        // .html('<line x1="'+-0.8*r+'" y1="'+-0.1*r+'" x2="'+0.8*r+'" y2="'+-0.1*r+'" style="stroke-width:'+0.3*r+'" />')
        .append('line')
        .attr('x1', function() {
          return -0.8 * r;
        })
        .attr('y1', function() {
          return -0.0 * r;
        })
        .attr('x2', function() {
          return 0.8 * r;
        })
        .attr('y2', function() {
          return -0.0 * r;
        })
        .attr('stroke-width', function() {
          return 0.3 * r + 'px';
        })
        .attr('stroke', _svg.renders._this.behaviors.render.legendNodeColor)

        var label = legend
                    .append('g')

        // add legend labels
        var text = label.append('text')
        .classed('unselectable', true)
        .style('cursor', 'inherit')
        .attr('id', function(d) {
          return 'legendLabel'+_svg.instanceIndex+'_' + gvis.utils.replaceAllSpecialCharactors(d.type+d.element);
        })
        .attr('font-size', _svg.renders._this.behaviors.render.legendNodeRadius + 'px')
        .attr('fill', _svg.renders._this.behaviors.render.legendNodeLabelsColor)
        .attr('text-anchor', 'left')
        .attr('x', _svg.renders._this.behaviors.render.legendNodeRadius * 1.00)
        .attr('y', (_svg.renders._this.behaviors.render.legendNodeRadius) * 0.25 )
        .text(function(d) {
          return this.renders._this.language.translate(d.type, "ui_component", "label");
        }.bind(_svg))

        var bbox = gvis.utils.getBBox(text[0][0]);//text[0][0].getBBox();

        // add node label background rectangle
        label.insert('rect', '#legendLabel'+_svg.instanceIndex+'_' + gvis.utils.replaceAllSpecialCharactors(type+element))
        //label.append('rect')
        .classed('legendLabel_background_rect', true)
        .attr('rx', 0)
        .attr('ry', 0)
        .attr('x', bbox.x)
        .attr('y', bbox.y)
        .attr('width', bbox.width)
        .attr('height', bbox.height)
        .attr('fill', _svg.renders._this.behaviors.render.legendNodeLabelsBackgroundColor)
        .attr('opacity', _svg.renders._this.behaviors.render.legendNodeLabelsBackgroundOpacity)
      }
    })
  }

  gvis.renders.svg.prototype.updateLegendRenderer = function() {
    var legends = arguments[0] 
    var _svg = arguments[1];
    var duration = arguments[2] || 0
    var delay = arguments[3] || 0

    var alpha = 1.05; // margin = 0.1, radius = 1.0;

    _svg.legend_box.width = Number.MIN_VALUE;
    _svg.legend_box.height = Number.MIN_VALUE;

    legends[0].forEach(function(l, i) {
        if (!l) {
          return;
        }

        // get legend
        var legend = d3.select(l);

        legend
        .select('.legend_container')
        .transition()
        .delay(delay)
        .duration(duration)
        .attr("transform", function(d) {
          //return "translate(" + _svg.renders._this.behaviors.render.legendNodeRadius + "," + (_svg.renders._this.behaviors.render.legendNodeRadius-_svg.renders._this.behaviors.render.legendNodeRadiusMargin)*(1+i*2) + ")"; 
          return "translate(" + _svg.renders._this.behaviors.render.legendNodeRadius * alpha + "," + _svg.renders._this.behaviors.render.legendNodeRadius * alpha * (1 + 2*i) + ")"; 
        })

        var data = legend.data()[0];
        var type = data.type;
        var element = data.element;

        if (element == 'node') {
          var color = _svg.renders.color.getNodeColor(type) || _svg.renders._this.behaviors.render.legendNodeColor ;

          var icon = gvis.utils.icon(_svg.icons[type] || _svg.renders._this.behaviors.icons[type]);

          legend
          .select('.icon')
          .transition()
          .delay(delay)
          .duration(duration)
          .attr("font-family","FontAwesome")
          .attr('font-size', function(d) { return (_svg.renders._this.behaviors.render.legendNodeRadius-_svg.renders._this.behaviors.render.legendNodeRadiusMargin) * 1.5 + 'px';})
          .attr('fill', color)
          .text(function(d) { return icon; }); 

          legend
          .selectAll('.legend_background_circle')
          .transition()
          .delay(delay)
          .duration(duration)
          .attr('stroke-opacity', 0)
          .attr('fill', _svg.renders._this.behaviors.render.nodeBackgroundFillColor)
          .attr('opacity', _svg.renders._this.behaviors.render.legendNodeOpacity)
          .attr('r', _svg.renders._this.behaviors.render.legendNodeRadius-_svg.renders._this.behaviors.render.legendNodeRadiusMargin)
          .style('cursor', 'inherit')



          // update legend labels
          var text = legend.select('#' + 'legendLabel'+_svg.instanceIndex+'_' + gvis.utils.replaceAllSpecialCharactors(data.type+data.element))
          .transition()
          .delay(delay)
          .duration(duration)
          .attr('font-size', _svg.renders._this.behaviors.render.legendNodeRadius + 'px')
          .attr('fill', _svg.renders._this.behaviors.render.legendNodeLabelsColor)
          .attr('text-anchor', 'left')
          .attr('x', _svg.renders._this.behaviors.render.legendNodeRadius * 1.00)
          .attr('y', (_svg.renders._this.behaviors.render.legendNodeRadius) * 0.25 )
          .text(function(d) {
            return this.renders._this.language.translate(d.type, "ui_component", "label");
          }.bind(_svg))

          // var bbox = text[0][0].getBBox();
          var bbox = gvis.utils.getBBox(text[0][0]);

          // add node label background rectangle
          //label.insert('rect', '#label_' + data[gvis.settings.key])
          legend.select('.legendLabel_background_rect')
          .transition()
          .delay(delay)
          .duration(duration)
          .attr('rx', 0)
          .attr('ry', 0)
          .attr('x', bbox.x)
          .attr('y', bbox.y)
          .attr('width', bbox.width)
          .attr('height', bbox.height)
          .attr('fill', _svg.renders._this.behaviors.render.legendNodeLabelsBackgroundColor)
          .attr('opacity', _svg.renders._this.behaviors.render.legendNodeLabelsBackgroundOpacity)

          _svg.legend_box.width = Math.max(_svg.legend_box.width, bbox.width + _svg.renders._this.behaviors.render.legendNodeRadius * alpha * 2 + _svg.renders._this.behaviors.render.legendNodeRadiusMargin * 2 * alpha)
          _svg.legend_box.height = Math.max(_svg.legend_box.height, _svg.renders._this.behaviors.render.legendNodeRadius * alpha * 2 *(1 + i))
          // _svg.legend_box.height = Math.max(_svg.legend_box.height, (_svg.renders._this.behaviors.render.legendNodeRadius-_svg.renders._this.behaviors.render.legendNodeRadiusMargin)*(1+i*2) + _svg.renders._this.behaviors.render.legendNodeRadius) - _svg.renders._this.behaviors.render.legendNodeRadiusMargin;
        }
        else if (element == 'link') {
          var color = _svg.renders.color.getLinkColor(type) || _svg.renders._this.behaviors.render.legendNodeColor ;

          var r = _svg.renders._this.behaviors.render.legendNodeRadius-_svg.renders._this.behaviors.render.legendNodeRadiusMargin;

          legend
          .select('.icon')
          .select('line')
          .transition()
          .delay(delay)
          .duration(duration)
          .attr('stroke', color)
          .attr('stroke-opacity', _svg.renders._this.behaviors.render.legendNodeStrokeOpacity)
          .attr('x1', function() {
            return -0.8 * r;
          })
          .attr('y1', function() {
            return -0.0 * r;
          })
          .attr('x2', function() {
            return 0.8 * r;
          })
          .attr('y2', function() {
            return -0.0 * r;
          })
          .attr('stroke-width', function() {
            return 0.3 * r + 'px';
          })
          .attr('stroke', color)

          legend
          .selectAll('.legend_background_circle')
          .transition()
          .delay(delay)
          .duration(duration)
          .attr('stroke-opacity', 0)
          .attr('fill', _svg.renders._this.behaviors.render.nodeBackgroundFillColor)
          .attr('opacity', _svg.renders._this.behaviors.render.legendNodeOpacity)
          .attr('r', r)
          .style('cursor', 'inherit')

          // add legend labels
          var text = legend.select('text')
          .transition()
          .delay(delay)
          .duration(duration)
          .attr('font-size', _svg.renders._this.behaviors.render.legendNodeRadius + 'px')
          .attr('fill', _svg.renders._this.behaviors.render.legendNodeLabelsColor)
          .attr('text-anchor', 'left')
          .attr('x', _svg.renders._this.behaviors.render.legendNodeRadius * 1.00)
          .attr('y', (_svg.renders._this.behaviors.render.legendNodeRadius) * 0.25 )
          .text(function(d) {
            return this.renders._this.language.translate(d.type, "ui_component", "label");
          }.bind(_svg))

          // var bbox = text[0][0].getBBox();
          var bbox = gvis.utils.getBBox(text[0][0]);

          // add node label background rectangle
          //label.insert('rect', '#label_' + data[gvis.settings.key])
          legend.select('.legendLabel_background_rect')
          .transition()
          .delay(delay)
          .duration(duration)
          .attr('rx', 0)
          .attr('ry', 0)
          .attr('x', bbox.x)
          .attr('y', bbox.y)
          .attr('width', bbox.width)
          .attr('height', bbox.height)
          .attr('fill', _svg.renders._this.behaviors.render.legendNodeLabelsBackgroundColor)
          .attr('opacity', _svg.renders._this.behaviors.render.legendNodeLabelsBackgroundOpacity)

          _svg.legend_box.width = Math.max(_svg.legend_box.width, bbox.width + _svg.renders._this.behaviors.render.legendNodeRadius * alpha * 2 + _svg.renders._this.behaviors.render.legendNodeRadiusMargin * 2 * alpha)
          _svg.legend_box.height = Math.max(_svg.legend_box.height, _svg.renders._this.behaviors.render.legendNodeRadius * alpha * 2 *(1 + i))
          // console.log(l);
        }
        else {
          throw ("gvis.renders.js -> updateLegendRenderer [Error]");
        }        
    })
  }

  gvis.renders.svg.prototype.autoFit = function(duration, delay) {
    duration = duration != undefined ? duration : 0;
    delay = delay != undefined ? delay : 0;

    var nodes = [];

    nodes = nodes.length == 0 ? this.renders.graph.data().array.nodes : nodes;
    var width = this.renders.domain_width;
    var height = this.renders.domain_height;

    //no molecules, nothing to do
    if (nodes.length === 0)
    return;

    // Get the bounding box
    var min_x = d3.min(nodes.map(function(d) {return d.x;}));
    var min_y = d3.min(nodes.map(function(d) {return d.y;}));

    var max_x = d3.max(nodes.map(function(d) {return d.x;}));
    var max_y = d3.max(nodes.map(function(d) {return d.y;}));


    // The width and the height of the graph
    var mol_width = max_x - min_x;
    var mol_height = max_y - min_y;

    // how much larger the drawing area is than the width and the height
    var width_ratio = width / mol_width;
    var height_ratio = height / mol_height;

    // we need to fit it in both directions, so we scale according to
    // the direction in which we need to shrink the most
    var ratio_alpha = 0.75 //0.75;
    var min_ratio = Math.min(width_ratio, height_ratio) * ratio_alpha;
    if (min_ratio > this.renders.zoomRange[1]) min_ratio = this.renders.zoomRange[1];
    if (min_ratio < this.renders.zoomRange[0]) min_ratio = this.renders.zoomRange[0];

    min_ratio  = min_ratio < 2 ? min_ratio : 2;

    // the new dimensions of the molecule
    var new_mol_width = mol_width * min_ratio;
    var new_mol_height = mol_height * min_ratio;

    // translate so that it's in the center of the window
    var x_trans = -(min_x) * min_ratio + (width - new_mol_width) / 2;
    var y_trans = -(min_y) * min_ratio + (height - new_mol_height) / 2;

    

    // do the actual moving
    this.g_zoomer
    .transition()
    .delay(delay)
    .duration(duration)
    .attr("transform", "translate(" + [this.renders.xScale(x_trans), this.renders.yScale(y_trans)] + ")" + " scale(" + min_ratio + ")");

    // tell the zoomer what we did so that next we zoom, it uses the
    // transformation we entered here
    this.zoom.translate([this.renders.xScale(x_trans), this.renders.yScale(y_trans)]);
    this.zoom.scale(min_ratio);

    return this;
  }

  gvis.renders.svg.prototype.centerView = function(duration, delay) {

    duration = duration != undefined ? duration : 0;
    delay = delay != undefined ? delay : 0

    var xMass=0;
    var yMass=0;

    var nodes = this.renders.graph.data().array.nodes.filter(function(n) {
      return n[gvis.settings.styles].selected;
    });

    if (nodes.length == 0) {
      nodes = this.renders.graph.data().array.nodes;
    }

    if (nodes.length == 0) {
      return;
    }

    nodes.forEach(function(n) {
      xMass += n.x;
      yMass += n.y;
    })

    xMass /= nodes.length;
    yMass /= nodes.length;

    var scale = this.zoom.scale();

    var x_trans = this.renders.xScale(this.renders.domain_width/2 - xMass*scale) ;
    var y_trans = this.renders.yScale(this.renders.domain_height/2 - yMass*scale) ;

    this.g_zoomer
    .transition()
    .delay(delay)
    .duration(duration)
    .attr("transform", "translate(" + [x_trans, y_trans] + ")" + " scale(" + scale + ")");

    // tell the zoomer what we did so that next we zoom, it uses the
    // transformation we entered here
    this.zoom.translate([x_trans, y_trans]);

    return this;
  }

  gvis.renders.svg.prototype.setLegendBox = function(x, y) {
    this.legend_box.x = x;
    this.legend_box.y = y;

    return this;
  }

  gvis.renders.svg.prototype.nodes = function() {
    return this.g_nodes.selectAll('.node');
  }

  gvis.renders.svg.prototype.links = function() {
    return this.g_links.selectAll('.link');
  }

  gvis.renders.svg.prototype.unselectAllElements = function() {

    var nodes = this.nodes().filter(function(n) {
      var tmp = n[gvis.settings.styles].selected;
      n[gvis.settings.styles].preSelected = n[gvis.settings.styles].selected = false;
      return tmp;
    })

    var links = this.links().filter(function(l) {
      var tmp = l[gvis.settings.styles].selected;
      l[gvis.settings.styles].preSelected = l[gvis.settings.styles].selected = false;
      return tmp;
    })

    this.updateNodes(nodes);
    this.updateLinks(links);

    return this;
  }

  gvis.renders.svg.prototype.updateNodes = function(nodes) {
    if (nodes !== undefined) {
      var _svg = this;

      nodes.forEach(function(node, i) {
        _svg.updateNodeRenderer([node], _svg);
      })
    }
    else {
      this.g_svg.selectAll('.node').call(this.updateNodeRenderer, this);
    }

    return this;
  }

  gvis.renders.svg.prototype.updateSelectedNodes = function() {
    var _svg = this;
    var nodes = _svg.nodes().filter(function(d) {
      return d[gvis.settings.styles].selected || d[gvis.settings.styles].brushed;
    })

    _svg.updateNodeRenderer(nodes, _svg)

    return this;
  }

  gvis.renders.svg.prototype.updateSelectedNodesRelatedLinks = function() {

    var _svg = this;
    var nodes = _svg.renders.graph.nodes().filter(function(d) {
      return d[gvis.settings.styles].selected || d[gvis.settings.styles].brushed;
    })

    for (var i in nodes) {
      var d = nodes[i];

      var node_key = d[gvis.settings.key]
      var node = _svg.g_svg.select('#node'+_svg.instanceIndex+'_'+node_key);

      _svg.updateNodeRenderer(node, _svg)

      var graph = _svg.renders.graph.data();

      for (var other_key in graph.neighbors.all[node_key]) {
        for (var link_key in graph.neighbors.all[node_key][other_key]) {
          var link= _svg.g_svg.select('#link'+_svg.instanceIndex+'_'+link_key)

          _svg.updateLinkRenderer(link, _svg)
        }
      }
    }

    return this;
  }

  gvis.renders.svg.prototype.updateLinks = function(links) {

    if (links !== undefined) {
      var _svg = this;

      links.forEach(function(link, i) {
        _svg.updateLinkRenderer([link], _svg)
      })
    }
    else {
      this.g_svg.selectAll('.link').call(this.updateLinkRenderer, this);
    }

    return this;
  }
 
  gvis.renders.svg.prototype.updateSelectedLinks = function() {
    var _svg = this;
    var links = _svg.links().filter(function(d) {
      return d[gvis.settings.styles].selected;
    })

    _svg.updateLinkRenderer(links, _svg)

    return this;
  }

  gvis.renders.svg.prototype.zoomin = function() {

    var translate = this.zoom.translate();
    var scale = this.zoom.scale();

    translate[0] = this.renders.xScale.invert(translate[0] / scale)
    translate[1] = this.renders.yScale.invert(translate[1] / scale)

    var center_x = this.renders.domain_width / 2 / scale - translate[0]
    var center_y = this.renders.domain_height / 2 / scale - translate[1]

    scale *= 2;

    if (scale > this.renders.zoomRange[1]) scale = this.renders.zoomRange[1];
    if (scale < this.renders.zoomRange[0]) scale = this.renders.zoomRange[0];

    translate[0] = this.renders.xScale(this.renders.domain_width / 2 - center_x*scale);
    translate[1] = this.renders.yScale(this.renders.domain_height / 2 - center_y*scale);

    this.zoom.translate(translate);
    this.zoom.scale(scale);

    this.g_zoomer
    .transition()
    .duration(200)
    .attr("transform", "translate(" + translate + ")" + " scale(" + scale + ")");

    return this;
  }

  gvis.renders.svg.prototype.zoomout = function() {

    var translate = this.zoom.translate();
    var scale = this.zoom.scale();

    translate[0] = this.renders.xScale.invert(translate[0] / scale)
    translate[1] = this.renders.yScale.invert(translate[1] / scale)

    var center_x = this.renders.domain_width / 2 / scale - translate[0]
    var center_y = this.renders.domain_height / 2 / scale - translate[1]

    scale /= 2;

    if (scale > this.renders.zoomRange[1]) scale = this.renders.zoomRange[1];
    if (scale < this.renders.zoomRange[0]) scale = this.renders.zoomRange[0];

    translate[0] = this.renders.xScale(this.renders.domain_width / 2 - center_x*scale);
    translate[1] = this.renders.yScale(this.renders.domain_height / 2 - center_y*scale);

    this.zoom.translate(translate);
    this.zoom.scale(scale);

    this.g_zoomer
    .transition()
    .duration(200)
    .attr("transform", "translate(" + translate + ")" + " scale(" + scale + ")");

    return this;

  }

  gvis.renders.svg.prototype.setViewportFontFamily = function(newFont) {
    this.g_svg
    .attr("font-family", newFont);

    return this;
  }

  gvis.renders.svg.prototype.setViewportBackgroundColor = function(color) {

    this._this.behaviors.render.viewportBackgroundColor = color;

    this.g_svg
    .style("background-color", function() {
       return "rgba(" + color + "," + this._this.behaviors.render.viewportBackgroundOpacity + " )"
    }.bind(this))

    return this;
  }

  gvis.renders.svg.prototype.setViewportBackgroundOpacity = function(opacity) {

    this._this.behaviors.render.viewportBackgroundOpacity = opacity;

    this.g_svg
    .style("background-color", function() {
       return "rgba(" + this._this.behaviors.render.viewportBackgroundColor + "," + opacity + " )"
    }.bind(this))

    return this;
  }

  gvis.renders.svg.prototype.setViewportBackgroundImg = function(img) {

    this._this.behaviors.render.viewportBackgroundImg = img;
    
    this.g_svg
    .style("background-image", "url('"+img+"')")

    return this;
  }
  /********** renders.canvas **********/
  gvis.renders.canvas = function(renders) {

  }


  /********** renders.map **********/
  gvis.renders.map = function(renders) {

  }
  
}).call(this);





/******************************************************************************
 * Copyright (c) 2016, GraphSQL Inc.                                          *
 * All rights reserved                                                        *
 * Unauthorized copying of this file, via any medium is strictly prohibited   *
 * Proprietary and confidential                                               *
 ******************************************************************************/
(function(undefined) {
  "use strict";
  // ALL the prototype functions.
  // Public functions.
  var gvis = this.gvis;
  
  console.log('Loading gvis.core')

  gvis.prototype.data = function(newData) {
    var _this = this.scope;

    return _this.graph;
  }

  gvis.prototype.addSubgraph = function(newSubgraph, extended) {
    var _this = this.scope;
    extended = extended === undefined ? true : extended;

    _this.graph.addSubgraph(newSubgraph, extended);

    return this;
  }

  gvis.prototype.addNode = function(newNode, extended) {
    var _this = this.scope;
    extended = extended === undefined ? true : extended;

    _this.graph.addNode(newNode, extended);

    return this;
  }

  gvis.prototype.addLink = function(newLink, extended) {
    var _this = this.scope;
    extended = extended === undefined ? true : extended;

    _this.graph.addLink(newLink, extended);

    return this;
  }

  gvis.prototype.dropNode = function(node) {
    var _this = this.scope;

    _this.graph.dropNode(node.type, node.id);

    return this;
  }

  gvis.prototype.dropLink = function(link) {
    var _this = this.scope;

    _this.graph.dropLink(link.source.type, link.source.id, link.target.type, link.target.id, link.type, true);

    return this;
  }

  gvis.prototype.read = function(data, extended) {
    var _this = this.scope;

    this.clear();

    extended = extended === undefined ? true : extended;

    _this.graph.read(data, extended);
    //_this.layouts.allZero();

    console.log(_this.graph.data())

    return this
  }

  gvis.prototype.layout = function(layoutName) {
    var _this = this.scope;

    _this.layouts.setLayout(layoutName);

    return this
  }

  gvis.prototype.addLayout = function(layoutName, Fn) {
    var _this = this.scope;

    _this.layouts.addLayout(layoutName, Fn);

    return this
  }

  gvis.prototype.runLayout = function(layoutName) {
    var _this = this.scope;

    _this.layouts.runLayout(layoutName)

    return this;
  }

  gvis.prototype.autoFit = function(duration, delay) {
    var _this = this.scope;

    duration = duration != undefined ? duration : 500;
    delay = delay != undefined ? delay : 0;

    _this.renderer.autoFit(duration, delay);

    return this;
  }

  gvis.prototype.redraw = function() {
    var _this = this.scope;

    _this.renderer.clear();
    _this.renderer.update(0, 0);
  }

  gvis.prototype.clear = function() {
    var _this = this.scope;

    _this.renderer.clear();
    _this.graph.clear();
    _this.layouts.clear();

    return this;
  }

  gvis.prototype.render = function(duration, init_delay) {
    var _this = this.scope;
    
    // total_time = total_time != undefined ? total_time : 500;
    // total_time = total_time >= 1000 ? total_time : 500;

    // between_delay = between_delay != undefined ? between_delay : 500;

    duration = duration != undefined ? duration : 500;
    init_delay = init_delay != undefined ? init_delay : 0;
    
    _this.renderer.render(duration, init_delay);
    
    return this
  }

  gvis.prototype.update = function(duration, delay) {
    var _this = this.scope

    _this.renderer.update(duration, delay);

    return this
  }

  /**
   * Update visualization elements by type.
   *  
   * @param {Object} [options]      Available options:
   *                                `node: array`
   *                                    contains the node types that want to be updated.
   *                                `link: array`
   *                                    contains the link types that want to be updated.
   */
  gvis.prototype.updateByType = function(options) {
     var _this = this.scope;

     _this.renderer.updateByType(options);

     return this;
  }

  gvis.prototype.showNodeLabel = function(type, id, labels) {
    var _this = this.scope;

    var node = _this.graph.nodes(type, id)

    // for (var key in node[gvis.settings.styles].labels) {
    //   node[gvis.settings.styles].labels[key] = false;
    // }

    try {
      for (var i in labels) {
        var label = labels[i];

        node[gvis.settings.styles].labels[label] = true;
      }
    }
    catch (err) {
      console.error(err);
    }

    return this;
  }

  gvis.prototype.showNodeLabelByType = function(type, labels) {

    var _this = this.scope;

    var nodes = _this.graph.nodes();

    try {
      for (var i in nodes) {
        var node = nodes[i];

        if (node.type == type) {
          this.showNodeLabel(node.type, node.id, labels);
        }
      }
    }
    catch (err) {
      console.error(err);
    }

    return this;
  }

  gvis.prototype.hideAllNodeLabels = function() {
    var _this = this.scope;

    _this.graph.nodes().forEach(function(node) {
      node[gvis.settings.styles].labels = {};
    })

    return this;
  }

  gvis.prototype.hideNodeLabel = function(type, id, labels) {
    var _this = this.scope;

    var node = _this.graph.nodes(type, id)

    if (labels == undefined) {
      node[gvis.settings.styles].labels = {};
      return this;
    }

    try {
      for (var i in labels) {
        var label = labels[i];

        node[gvis.settings.styles].labels[label] = false;
      }
    }
    catch (err) {
      console.error(err);
    }

    return this;
  }

  gvis.prototype.hideNodeLabelByType = function(type, labels) {

    var _this = this.scope;

    var nodes = _this.graph.nodes();

    try {
      for (var i in nodes) {
        var node = nodes[i];

        if (node.type == type) {
          this.hideNodeLabel(node.type, node.id, labels);
        }
      }
    }
    catch (err) {
      console.error(err);
    }

    return this;
  }

  gvis.prototype.showLinkLabel = function(sourceType, sourceID, targetType, targetID, linkType, labels) {
    var _this = this.scope;

    var link = _this.graph.links(sourceType, sourceID, targetType, targetID, linkType);

    // for (var key in link[gvis.settings.styles].labels) {
    //   link[gvis.settings.styles].labels[key] = false;
    // }

    try {
      for (var i in labels) {
        var label = labels[i];

        link[gvis.settings.styles].labels[label] = true;
      }
    }
    catch (err) {
      console.error(err);
    }

    return this;
  }

  gvis.prototype.showLinkLabelByType = function(linkType, labels) {
    var _this = this.scope;

    var links = _this.graph.links();

    try {
      for (var i in links) {
        var link = links[i];

        if (link.type == linkType) {
          this.showLinkLabel(link.source.type, link.source.id, link.target.type, link.target.id, link.type, labels);
        }
      }    
    }
    catch (err) {
      console.error(err);
    }

    return this;
  }

  gvis.prototype.hideAllLinkLabels = function() {
    var _this = this.scope;

    _this.graph.links().forEach(function(link) {
      link[gvis.settings.styles].labels = {};
    })

    return this;
  }

  gvis.prototype.hideLinkLabel = function(sourceType, sourceID, targetType, targetID, linkType, labels) {
    var _this = this.scope;

    var link = _this.graph.links(sourceType, sourceID, targetType, targetID, linkType);

    try {
      for (var i in labels) {
        var label = labels[i];

        link[gvis.settings.styles].labels[label] = false;
      }
    }
    catch (err) {
      console.error(err);
    }
    return this;
  }

  gvis.prototype.hideLinkLabelByType = function(linkType, labels) {
    var _this = this.scope;

    var links = _this.graph.links();

    try {
      for (var i in links) {
        var link = links[i];

        if (link.type == linkType) {
          this.hideLinkLabel(link.source.type, link.source.id, link.target.type, link.target.id, link.type, labels);
        }
      }
    }
    catch (err) {
      console.error(err);
    }

    return this;
  }

  gvis.prototype.showNodeLegend = function(type) {
    var _this = this.scope;

    _this.renderer.render_legend.nodes[type] = true;

    return this;
  }

  gvis.prototype.hideNodeLegend = function(type) {
    var _this = this.scope;

    _this.renderer.render_legend.nodes[type] = false;

    return this;
  }

  gvis.prototype.showLinkLegend = function(type) {
    var _this = this.scope;

    _this.renderer.render_legend.links[type] = true;

    return this;
  }

  gvis.prototype.hideLinkLegend = function(type) {
    var _this = this.scope;

    _this.renderer.render_legend.links[type] = false;

    return this;
  }

  gvis.prototype.setNodeToolTipFormat = function(fn) {
    this.scope.behaviors.style.nodeToolTips.customized = fn;

    return this
  }

  gvis.prototype.setLinkToolTipFormat = function(fn) {
    this.scope.behaviors.style.linkToolTips.customized = fn;

    return this
  }

  /**
   * Customize a event call back behavior in visualization.
   * @param {string} event - name of the event
   * @param {function} fn - call back function of the event
   * @description Current supported evetns : nodeClick
                                nodeRightClick
                                nodeDblClick
                                linkClick
                                linkDblClick
                                multiSelect
                                legendClick
   */
  gvis.prototype.on = function(event, fn) {
    var _this = this.scope;
    _this.renderer.setEventHandler(event, fn);

    return this;
  }

  gvis.prototype.setRootNode = function(type, id) {
    var _this = this.scope;

    _this.layouts.setRootNode(type, id);

    return this;
  }

  gvis.prototype.getRootNode = function() {
    var _this = this.scope;

    return _this.layouts.getRootNode();
  }

  gvis.prototype.nodes = function() {
    var _this = this.scope;

    if (arguments.length != 0) {
      return _this.graph.nodes.apply(_this.graph, arguments);
    }
    else {
      return _this.graph.nodes.apply(_this.graph);
    }
  }

  gvis.prototype.links = function() {
    var _this = this.scope;

    if (arguments.length != 0) {
      return _this.graph.links.apply(_this.graph, arguments)
    }
    else {
      return _this.graph.links.apply(_this.graph)
    }
    
  }

  gvis.prototype.getSelectedNodes = function() {
    var _this = this.scope;

    return _this.graph.nodes().filter(function(n) {
      return n[gvis.settings.styles].selected;
    })
  }

  gvis.prototype.getSelectedLinks = function() {
    var _this = this.scope;

    return _this.graph.links().filter(function(l) {
      return l[gvis.settings.styles].selected;
    })
  }

  gvis.prototype.applyStyles = function(styles) {
    var _this = this.scope;

    _this.graph.nodes().forEach(function(n) {
      _this.graph.applyDefinedStyles(n, styles);
    })

    _this.graph.links().forEach(function(l) {
      _this.graph.applyDefinedStyles(l, styles);
    })

    return this;
    // this.update(500);
  }

  gvis.prototype.unselectAllElements = function() {
    var _this = this.scope;

    _this.renderer.renderer.unselectAllElements();
  }

  /**
   * Get graph object of gvis.
   * @returns {Object} gvis.graph
   */
  gvis.prototype.graph = function() {
    var _this = this.scope;

    return _this.graph;
  }

  // backup current visualization data or retrieve data to current visualization
  gvis.prototype.backup = function(data) {
    var _this = this.scope;

    if (arguments.length > 0) {
      _this.graph.backup(data);
    }
    else {
      return _this.graph.backup();
    }

    return this;
  }

  // config config index.
  gvis.prototype.configIndex = function(index) {
    var _this = this.scope;

    _this.conf_index = index;

    // update icons setting of config base on selected tab index.
    _this.conf.configure = _this.conf.configure || [{}];
    _this.conf.configure[_this.conf_index] = _this.conf.configure[_this.conf_index] || {};

    var setting = _this.conf.configure[_this.conf_index].setting || {};
    var defaultsetting = _this.conf.configure[0].setting || {};
    var defaultIcons = defaultsetting.icons || this.behaviors.icons;


    var icons =  setting.icons || defaultIcons;

    for (var type in icons) {
      this.setIcon(type, icons[type]);
    }

    return this;
  }

  // config language lib 
  gvis.prototype.configLanguage = function(language) {
    var _this = this.scope;

    if (typeof language == "object" && language !== null  && typeof language.translate == "function") {
      _this.language = language;
    }

    return this;
  }

  // initialize color object base on schema.
  gvis.prototype.initialColor = function(schema) {
    var _this = this.scope;

    schema = schema || {};
    var vertexType = schema.VertexTypes || [];
    var edgeType = schema.EdgeTypes || [];

    var nodes = [];
    var links = [];

    vertexType.forEach(function(t, i) {
      nodes.push(t.Name);
    })

    edgeType.forEach(function(t, i) {
      links.push(t.Name);
    })

    _this.renderer.color.initialize(nodes, links);

    return this;
  }

  // Config vertex head condition call back function.
  gvis.prototype.vertexHead = function(fn) {
    var _this = this.scope;

    _this.renderer.setRenderHandler('vertex', 'head', fn);

    return this;
  }

  // Config vertex foot condition call back function.
  gvis.prototype.vertexFoot = function(fn) {
    var _this = this.scope;

    _this.renderer.setRenderHandler('vertex', 'foot', fn);

    return this;
  }

  gvis.prototype.initialNodePosition = function(points) {
    var _this = this.scope;

    _this.renderer.initial_position = points;

    return this;
  }

  gvis.prototype.exportLegends = function() {
    var _this = this.scope;

    var result = {};

    result.nodes = _this.graph.getNodeAttributes();
    result.links = _this.graph.getLinkAttributes();

    return result;
  }

  gvis.prototype.zoomin = function() {
    var _this = this.scope;

    _this.renderer.zoomin();

    return this;
  }

  gvis.prototype.zoomout = function() {
    var _this = this.scope;

    _this.renderer.zoomout();

    return this;
  }

  gvis.prototype.setLegendBox = function(x, y) {
    var _this = this.scope;

    x = x !== undefined ? x : 10;
    y = y !== undefined ? y : 10;

    _this.renderer.setLegendBox(x, y);

    return this;
  }

  gvis.prototype.setIcon = function(vertexType, iconName) {
    var _this = this.scope;

    _this.renderer.setIcon(vertexType, iconName);

    return this;
  }

  gvis.prototype.behaviors = function() {
    var _this = this.scope;

    return _this.behaviors;
  }

  gvis.prototype.nodesInAggregatedNodes = function() {
    var _this = this.scope;
    
    if (arguments.length != 0) {
      return _this.graph.nodesInContainedNodes.apply(_this.graph, arguments);
    }
    else {
      return _this.graph.nodesInContainedNodes.apply(_this.graph);
    }
  }

  gvis.prototype.setNodeLabelFontSize = function(type, id, new_size) {
    var node = this.nodes(type, id);

    if (node === undefined) {
      ;
    }
    else {
      node[gvis.settings.styles]['font-size'] = new_size;
    }

    return this;
  }

  gvis.prototype.setLinkLabelFontSize = function(source_type, source_id, target_type, target_id, type, new_size) {
    var link = this.links(source_type, source_id, target_type, target_id, type);

    if (link === undefined) {
      ;
    }
    else {
      link[gvis.settings.styles]['font-size'] = new_size;
    }

    return this;
  }

  gvis.prototype.setLegendNodeRadius = function(new_radius) {
    var _this = this.scope;

    _this.behaviors.render.legendNodeRadius = new_radius;

    return this;
  }

  gvis.prototype.setFontFamily = function(new_font) {
    var _this = this.scope;

    _this.behaviors.render.viewportFontFamily = new_font;
    _this.renderer.renderer.setViewportFontFamily(new_font);

    return this;
  }

  /**
   * Set background style.
   * @param {object} options - it may contain three style value. 
   * 1. viewportBackgroundColor :  background color.
   * 2. viewportBackgroundOpacity :  background opacity.
   * 3. viewportBackgroundImg : change the URL of the background img.
   */

  gvis.prototype.setBackgroundStyle = function(options) {
    var _this = this.scope;

    if (options['viewportBackgroundColor'] !== undefined) {
      _this.renderer.renderer.setViewportBackgroundColor(options['viewportBackgroundColor']);
    }

    if (options['viewportBackgroundOpacity'] !== undefined) {
      _this.renderer.renderer.setViewportBackgroundOpacity(options['viewportBackgroundOpacity']);
    }    

    if (options['viewportBackgroundImg'] !== undefined) {
      _this.renderer.renderer.setViewportBackgroundImg(options['viewportBackgroundImg']);
    }
  }

  gvis.prototype.test = function() {
    var _this = this.scope;

    _this.graph.addNode({id:'0',type:'0'});
    _this.graph.addNode.call(window, {id:'0',type:'0'});
  }
}).call(this);
  

/******************************************************************************
 * Copyright (c) 2016, GraphSQL Inc.                                          *
 * All rights reserved                                                        *
 * Unauthorized copying of this file, via any medium is strictly prohibited   *
 * Proprietary and confidential                                               *
 ******************************************************************************/
(function(undefined) {
  "use strict";
  console.log('loading gvis.graph.aggregation');

  var gvis = this.gvis;
  var graph = gvis.graph;

  graph.prototype.aggregatedNodesObject = {};

  graph.prototype.getAggregatedObjects = function() {
    if (arguments.length == 0) {
      return this.aggregatedNodesObject;
    } 
    else if (arguments.length == 1) {
      var node = arguments[0];
      var id = node.id === undefined ? node : node.id;
      return this.aggregatedNodesObject[id]
    }
    else {
      return undefined;
    }
  }

  graph.prototype.aggregateNodesByExpression = function(expression) {
    // console.log(expression);

    var nodes = this.nodes().filter(function(d) {

      if (d.type.indexOf('_virtual_') !== -1) {
        return false;
      }
      else {
        return this.evaluateNodeExpression(d, expression);
      }
    }.bind(this))

    this.aggregateNodes(nodes);

    return this;
  }

  graph.prototype.aggregateNodes = function(nodes) {
    console.time('aggregateNodes');

    if (nodes.length <= 1) {
      return ;
    }

    var graph = this;

    // 1. Get virtual node ID;
    var id = -1;

    d3.range(5000).some(function(i) {
      id = i + '';
      return graph.aggregatedNodesObject[id] == undefined;
    })

    if (id == -1) {
      console.error("Get aggregatedNode index error");
      return this;
    }
    else {
      graph.aggregatedNodesObject[id] = {
        contained_nodes: [],
        contained_links: []
      }
    }

    // 2. update graph.aggregatedNodesObject[id].contained_nodes;
    graph.aggregatedNodesObject[id].contained_nodes = nodes;

    // 3. Get all realted links from graph, and update object.contained_links;
    var links = graph.links().filter(function(link) {
      return nodes.some(function(n) {
        return link.source == n || link.target == n;
        // return (link.source.id == n.id && link.source.type == n.type) || (link.target.id == n.id && link.target.type == n.type);
      })
    })

    graph.aggregatedNodesObject[id].contained_links = links;


    // 4. Remove nodes and links from graph; Summary contained nodes information.
    var contianed_nodes_type = {};

    nodes.forEach(function(n) {
      graph.dropNode(n.type, n.id, false);

      contianed_nodes_type[n.type] = contianed_nodes_type[n.type] === undefined ? 0 : contianed_nodes_type[n.type];
      contianed_nodes_type[n.type] += 1;
    })

    links.forEach(function(l) {
      graph.dropLink(l.source.type, l.source.id, l.target.type, l.target.id, l.type, false);
    })

    // 5. Create/Add aggregated node in graph.
    var virtual_node = {
      id : id,
      type : gvis.settings.aggregatedNodeType,
      other : {}
    }

    // 5.1 Collect virtual node attributes about contianed nodes. see 6.1 for contained links.
    virtual_node[gvis.settings.attrs] = {
      _sum : nodes.length,
      _types : Object.keys(contianed_nodes_type).toString()
    }

    for (var key in contianed_nodes_type) {
      virtual_node[gvis.settings.attrs][key] = contianed_nodes_type[key];
    }

    // 6. Add/Create/Summarize virtual links and fully contained links in graph.
    var newLinks = {};
    var fully_contained_links_type = {};

    links.forEach(function(l) {

      var sourceInNodes = nodes.some(function(n) {
        return l.source == n;
      })

      var targetInNodes = nodes.some(function(n) {
        return l.target == n;
      })

      if (sourceInNodes && targetInNodes) {
        fully_contained_links_type[l.type] = fully_contained_links_type[l.type] || 0;
        fully_contained_links_type[l.type] += 1;
        return ;
      }
      else if (sourceInNodes || targetInNodes) {

        var newLinkTarget;

        if (sourceInNodes) {
          newLinkTarget = l.target;
        }
        else {
          newLinkTarget = l.source;
        }

        newLinks[newLinkTarget[gvis.settings.key]] = newLinks[newLinkTarget[gvis.settings.key]] === undefined ? {} : newLinks[newLinkTarget[gvis.settings.key]];

        if (l.type == gvis.settings.aggregatedLinkType) {

          for (var lkey in l[gvis.settings.attrs]) {
            
            newLinks[newLinkTarget[gvis.settings.key]][lkey] = newLinks[newLinkTarget[gvis.settings.key]][lkey] === undefined ? 0 : newLinks[newLinkTarget[gvis.settings.key]][lkey];

            newLinks[newLinkTarget[gvis.settings.key]][lkey] += l[gvis.settings.attrs][lkey];
          }
        }
        else {
          newLinks[newLinkTarget[gvis.settings.key]][l.type] = newLinks[newLinkTarget[gvis.settings.key]][l.type] === undefined ? 0 : newLinks[newLinkTarget[gvis.settings.key]][l.type];
          newLinks[newLinkTarget[gvis.settings.key]][l.type] += 1;
        }
      }
      else {
        console.error('aggregate nodes unknown error');
      }
    })

    // 6.1 Collect virtual node attributes about contianed links.
    virtual_node[gvis.settings.attrs].link_sum = 0;
    for (var key in fully_contained_links_type) {
      virtual_node[gvis.settings.attrs].link_sum += fully_contained_links_type[key];
      virtual_node[gvis.settings.attrs]['link_' + key] = fully_contained_links_type[key];
    }

    var AggregatedNode = graph.addNode(virtual_node, true);

    // console.log(newLinks);
    // 7. Create new virtual links base on newLinks object. Add them in graph.
    for (var nodeKey in newLinks) {
      var node = graph.getNodeByKey(nodeKey);

      // the new aggregated node will always be target node.
      var link = {
        source : {
          id : node.id,
          type : node.type
        },
        target : {
          id : AggregatedNode.id,
          type : AggregatedNode.type
        },
        directed : false,
        other : {},
        type : gvis.settings.aggregatedLinkType
      }

      link[gvis.settings.attrs] = {};
      link[gvis.settings.attrs]._sum = 0;


      for (var lkey in newLinks[nodeKey]) {
        link[gvis.settings.attrs][lkey] = newLinks[nodeKey][lkey];
        link[gvis.settings.attrs]._sum += newLinks[nodeKey][lkey];
      }

      graph.addLink(link, true);
    }

    console.timeEnd('aggregateNodes');
    return AggregatedNode;
  }

  graph.prototype.splitAggregatedNode = function(node) {
    if (node.type != gvis.settings.aggregatedNodeType) {
      return ;
    }

    var graph = this;

    // 1. Get virtual node
    var virtual_node = node;

    var reference = graph.aggregatedNodesObject[virtual_node.id];
    delete graph.aggregatedNodesObject[virtual_node.id];

    // 2. Get related links 
    var links = graph.links().filter(function(l) {
      return l.source == virtual_node || l.target == virtual_node;
    })

    // 3. Get related nodes
    var nodes = graph.nodes().filter(function(n) {
      return links.some(function(l) {
        return l.source == n || l.target == n;
      }) && n != virtual_node
    })

    // 4. Remove virtual node and related links.
    graph.dropNode(virtual_node.type, virtual_node.id, false);

    links.forEach(function(d) {
      graph.dropLink(d.source.type, d.source.id, d.target.type, d.target.id, d.type, false);
    })

    // 5. add contained_nodes in graph
    var contained_nodes = reference.contained_nodes;

    contained_nodes = contained_nodes
                      .map(function(d) {
                        return graph.addNode(d, true);
                      })

    // 6. Get Contained links
    var contained_links = reference.contained_links;
    
    // 7. Add/Create/Summarize new links
    // a. Find regular links in contained_links, and Add them in graph.
    contained_links = contained_links.filter(function(l) {

      var source = graph.nodes(l.source);
      var target = graph.nodes(l.target);

      if (source !== undefined && target !== undefined) {
        graph.addLink(l)
        return false;
      }
      else {
        return true;
      }
    })

    // b. summarize new links
    var newLinks = {};

    contained_nodes.forEach(function(n) {
      if (n === undefined) { return ; }
      newLinks[n[gvis.settings.key]] = {};
    })

    // c. update other aggregated node contained_links.
    nodes.forEach(function(n) {
      if (n.type == gvis.settings.aggregatedNodeType) {
        var targetAggregatedNode = graph.aggregatedNodesObject[n.id];
        var links_list = [];

        targetAggregatedNode.contained_links.forEach(function(l) {
          var isSource = (virtual_node.type == l.source.type) && (virtual_node.id == l.source.id);
          var isTarget = (virtual_node.type == l.target.type) && (virtual_node.id == l.target.id);

          if (isSource || isTarget) {
            var newLinkTarget = isSource ? l.target : l.source;
            var tempLinks = contained_links.filter(function(l2) {
              if (l2.source.type == newLinkTarget.type && l2.source.id == newLinkTarget.id) {
                return true;
              }
              else if (l2.target.type == newLinkTarget.type && l2.target.id == newLinkTarget.id) {
                return true;
              }
              else {
                return false;
              }
            })

            // update contained_list, and summarize sum for links.
            tempLinks.forEach(function(l2) {
              links_list.push(l2);

              var newLinksKey;

              var sourceInContainedNodes = contained_nodes.some(function(n2) {
                if (n2.type == l2.source.type && n2.id == l2.source.id) {
                  newLinksKey = n2[gvis.settings.key];
                  return true;
                }
                else {
                  return false;
                }
              })

              var targetInContainedNodes = contained_nodes.some(function(n2) {
                if (n2.type == l2.target.type && n2.id == l2.target.id) {
                  newLinksKey = n2[gvis.settings.key];
                  return true;
                }
                else {
                  return false;
                }
              })

              if (sourceInContainedNodes && targetInContainedNodes) {
                console.error("Contained Circle case, this may lead error.")
              }
              else if (sourceInContainedNodes || targetInContainedNodes) {
                // console.log(newLinksKey in newLinks);
                newLinks[newLinksKey][n.id] = newLinks[newLinksKey][n.id] === undefined ? 0 : newLinks[newLinksKey][n.id];

                if (l2.type == gvis.settings.aggregatedLinkType) {
                  newLinks[newLinksKey][n.id] += l2[gvis.settings.attrs]._sum;
                }
                else {
                  newLinks[newLinksKey][n.id] += 1;
                }
              }
              else {
                console.error("Split aggregated Node, contained link list error.")
              }
            })
          }
          else {
            links_list.push(l);
          }

        })

        targetAggregatedNode.contained_links = links_list;
      }
      else {
        ;// do nothing
      }
    })

    // d. create new links object, add new summarized links in graph.
    // console.log(newLinks);
    for (var sourceKey in newLinks) {
      var source = graph.getNodeByKey(sourceKey); 

      for (var targetKey in newLinks[sourceKey]) {
        var target = graph.nodes(gvis.settings.aggregatedNodeType, targetKey);
        var _sum = newLinks[sourceKey][targetKey];

        var link = {
          source : {
            id : source.id,
            type : source.type
          },
          target : {
            id : target.id,
            type : target.type
          },
          directed : false,
          other : {},
          type : gvis.settings.aggregatedLinkType
        }

        link[gvis.settings.attrs] = {};
        link[gvis.settings.attrs]._sum = _sum;

        graph.addLink(link, true);
      }
    }

    return contained_nodes;
  }

  /**
   * Check if a node is in a agggregatedNode.
   * @param {object} node
   * @returns false or the aggregatedNode reference
   */
  graph.prototype.isInAggregatedNode = function(node) {

    if (node === undefined) {
      return false;
    }

    var result = false;
    var graph = this;

    for (var id in graph.aggregatedNodesObject) {
      var aggregatedNode = graph.aggregatedNodesObject[id];

      aggregatedNode.contained_nodes.some(function(n1) {
        if (n1.type === node.type && n1.id === node.id) {
          result = {
            node : n1,
            aggregatedNode : graph.nodes(gvis.settings.aggregatedNodeType, id)
          }

          return true;
        }
        else {
          return false;
        }
      })
    }

    return result;
  }

  graph.prototype.isInAggregatedLink = function(link) {

    var result = {
      source : this.isInAggregatedNode(link.source),
      target : this.isInAggregatedNode(link.target)
    }

    if (!!result.source || !!result.target) {
      return result;
    }
    else {
      return false;
    }
  }

  /**
   * check if two links are equaled. 
   * True : a == b;
   * True : a is reversed of b, a and b are both undirected links.
   * @param {object} a link
   * @param {object} b link
   * @returns true or false
   */
  graph.prototype.isEqualedLink = function(a, b) {
    try {
      var result = a.source.type === b.source.type && a.source.id === b.source.id && a.target.id === b.target.id && a.target.type === b.target.type && a.type === b.type && a.directed === b.directed;

      result |= this.isReversedLink(a, b) && a.directed === false && b.directed === false;

      return result;
    }
    catch (err) {
      console.error("[isEqualedLink Error] : " + err);
      return false;
    }
  }

  /**
   * check if two links are reversed. 
   * True : a is reversed of b, a and b are both directed links.
   * @param {object} a link
   * @param {object} b link
   * @returns true or false
   */
  graph.prototype.isReversedLink = function(a, b) {
    try {
      return a.source.type === b.target.type && a.source.id === b.target.id && a.target.id === b.source.id && a.target.type === b.source.type && a.type === b.type && a.directed === true && b.directed === true && gvis.utils.shallowEqual(a[gvis.settings.attrs], b[gvis.settings.attrs]);
    }
    catch (err) {
      console.error("[isReversedLink Error] : " + err);
      return false;
    }
  }

  /**
   * check if child link is covered by parent link. 
   * True : a is reversed of b, a and b are both directed links.
   * @param {object} child link
   * @param {object} parent link
   * @returns true or false
   */
  graph.prototype.isCoveredLink = function(child, parent) {
    try {
      var result = child.source.type === parent.target.type && child.source.id === parent.target.id && child.target.id === parent.source.id && child.target.type === parent.source.type && child.type === parent.type && child.directed === true && parent.directed === false;

      result |= child.target.type === parent.target.type && child.target.id === parent.target.id && child.source.id === parent.source.id && child.source.type === parent.source.type && child.type === parent.type && child.directed === true && parent.directed === false;

      return result;
    }
    catch (err) {
      console.error("[isCoveredLink Error] : " + err);
      return false;
    }
  }

  /**
   * retrun the parent aggregated node of two input nodes;
   * @param {object} a : aggregated node object
   * @param {object} b : aggregated node object
   * @returns false or a|b;
   */
  graph.prototype.checkDependencyOfAggregatedNodes = function(a, b) {
    var result = false;
    var parent = false;

    var sourceAggregatedObj = this.getAggregatedObjects(a);
    var targetAggregatedObj = this.getAggregatedObjects(b);

    result = sourceAggregatedObj.contained_links.some(function(l) {
      return (l.source.id == b.id && l.source.type == b.type) || (l.target.id == b.id && l.target.type == b.type)
    })

    if (!!result) {
      parent = b;
    }

    result = targetAggregatedObj.contained_links.some(function(l) {
      return (l.source.id == a.id && l.source.type == a.type) || (l.target.id == a.id && l.target.type == a.type)
    })

    if (!!result) {
      parent = a;
    }

    return parent;
  }

  /**
   * Get node from aggregated node contained_nodes
   * @param {string} type
   * @param {string} id
   * Or @param {object} node
   * Or none return all nodes
   * @returns {object}
   */
  graph.prototype.nodesInContainedNodes = function() {
    var graph = this;
    var result;

    var type;
    var id;
    if (arguments.length == 0) {
      result = [];

      for (var index in graph.aggregatedNodesObject) {
        var contained_nodes = graph.aggregatedNodesObject[index].contained_nodes;
        contained_nodes.forEach(function(n) {
          result.push(n);
        })
      }

      return result;
    }
    else if (arguments.length == 2) {
      type = arguments[0];
      id = arguments[1];
    }
    else if (arguments.length == 1) {
      type = arguments[0].type;
      id = arguments[0].id;
    }

    for (var index in graph.aggregatedNodesObject) {
      var contained_nodes = graph.aggregatedNodesObject[index].contained_nodes;
      contained_nodes.some(function(n) {
        if (n.type == type && n.id == id) {
          result = n;
          return true;
        }
        else {
          return false;
        }
      })
    }

    return result;
  }

  /**
   * set count for nodes in aggregated node contained_nodes to 1;
   */
  graph.prototype.cleanAggregatedNodesCount = function() {
    var graph = this;

    for (var index in graph.aggregatedNodesObject) {
      var contained_nodes = graph.aggregatedNodesObject[index].contained_nodes;
      contained_nodes.forEach(function(n) {
        n.other = n.other || {};
        n.other._head = n.other._head || {};
        n.other._head.count = 1;
        n.other._head.check = false;
      })
    }
  }

  graph.prototype.dropNodesByExpression = function(expression) {
    var nodes = this.nodes().filter(function(d) {
      return this.evaluateNodeExpression(d, expression);
    }.bind(this))

    nodes.forEach(function(d) {
      this.dropNode(d.type, d.id, false);
    }.bind(this))

    return this;
  }

  graph.prototype.dropLinksByExpression = function(expression) {
    var links = this.links().filter(function(d) {
      return this.evaluateLinkExpression(d, expression);
    }.bind(this))

    links.forEach(function(d) {
      this.dropLink(d.source.type, d.source.id, d.target.type, d.target.id, d.type, false);
    }.bind(this))

    return this;
  }

}).call(this);
exports.GVIS = this.gvis;