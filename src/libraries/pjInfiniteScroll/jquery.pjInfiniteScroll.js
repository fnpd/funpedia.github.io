/*!
 * jQuery Infinite Scroll plugin 1.0
 *
 * Copyright 2014, PHPJabbers.com (http://www.phpjabbers.com/free-jquery-infinite-scroll-script/)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 * 
 * Date: Mon Jan 20 12:37:15 2014 +0200
 */
(function ($, undefined) {
	var PROP_NAME = 'scroll',
    	FALSE = false,
    	TRUE = true;
	
	function InfinteScroll() {
		this._defaults = {
			offset: 20,
			autoLoad: true,
			autoLoadUntil: false,
			loadingIcon: "data:image/gif;base64,R0lGODlhEAALAPQAAP///wAAANra2tDQ0Orq6gYGBgAAAC4uLoKCgmBgYLq6uiIiIkpKSoqKimRkZL6+viYmJgQEBE5OTubm5tjY2PT09Dg4ONzc3PLy8ra2tqCgoMrKyu7u7gAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCwAAACwAAAAAEAALAAAFLSAgjmRpnqSgCuLKAq5AEIM4zDVw03ve27ifDgfkEYe04kDIDC5zrtYKRa2WQgAh+QQJCwAAACwAAAAAEAALAAAFJGBhGAVgnqhpHIeRvsDawqns0qeN5+y967tYLyicBYE7EYkYAgAh+QQJCwAAACwAAAAAEAALAAAFNiAgjothLOOIJAkiGgxjpGKiKMkbz7SN6zIawJcDwIK9W/HISxGBzdHTuBNOmcJVCyoUlk7CEAAh+QQJCwAAACwAAAAAEAALAAAFNSAgjqQIRRFUAo3jNGIkSdHqPI8Tz3V55zuaDacDyIQ+YrBH+hWPzJFzOQQaeavWi7oqnVIhACH5BAkLAAAALAAAAAAQAAsAAAUyICCOZGme1rJY5kRRk7hI0mJSVUXJtF3iOl7tltsBZsNfUegjAY3I5sgFY55KqdX1GgIAIfkECQsAAAAsAAAAABAACwAABTcgII5kaZ4kcV2EqLJipmnZhWGXaOOitm2aXQ4g7P2Ct2ER4AMul00kj5g0Al8tADY2y6C+4FIIACH5BAkLAAAALAAAAAAQAAsAAAUvICCOZGme5ERRk6iy7qpyHCVStA3gNa/7txxwlwv2isSacYUc+l4tADQGQ1mvpBAAIfkECQsAAAAsAAAAABAACwAABS8gII5kaZ7kRFGTqLLuqnIcJVK0DeA1r/u3HHCXC/aKxJpxhRz6Xi0ANAZDWa+kEAA7AAAAAAAAAAAA",
			complete: null,
			url: "ajax.php",
			loadMoreText: "load more",
			loadMoreClass: "pjInfiniteScroll_LoadMore",
			loadMoreWrapperClass: "pjInfiniteScroll_LoadMoreWrapper",
			indicatorWrapperClass: "pjInfiniteScroll_IndicatorWrapper"
		};
	}
	
	$.extend(InfinteScroll.prototype, {
		_attachInfiniteScroll: function (target, settings) {
			
			if (this._getInst(target)) {
                return FALSE;
            }
            var $target = $(target),
                self = this,
                inst = self._newInst($target),
                height = inst.container.outerHeight(),
                scrollHeight;

            $.extend(inst.settings, self._defaults, settings);

            if (inst.container.is(document)) {
            	$(window).bind("resize.scroll", function (e) {
                    height = $(this).height()
            	});
            }
            
			inst.container.on("scroll.scroll", function (e) {
				var $this = $(this);
				
				if ($this.is(document)) {
					scrollHeight = $(document.body).prop("scrollHeight");
				} else {
					scrollHeight = $this.prop("scrollHeight");
				}

				if (scrollHeight - height - $this.scrollTop() <= inst.settings.offset && !inst.states.loading) {
					inst.states.loading = TRUE;
					
					if (inst.settings.autoLoad && (!inst.settings.autoLoadUntil || inst.settings.autoLoadUntil > inst.page)) {
						self._loadInfiniteScroll.call(self, target);
					} else {
						self._moreInfiniteScroll.call(self, target, 'show');
					}
				}
			}).on("click.scroll", "." + inst.settings.loadMoreClass, function (e) {
				if (e && e.preventDefault) {
					e.preventDefault();
				}

				self._loadInfiniteScroll.call(self, target);

				return false;
			}).on("scrollcomplete", function (event, ui) {
				if (inst.settings.complete !== null) {
					inst.settings.complete.call(target, event, ui);
				}
			});

			$.data(target, PROP_NAME, inst);
		},
		_moreInfiniteScroll: function (target, action) {
			var inst = this._getInst(target);
			if (!inst) {
				return;
			}
			
			var $wrapper = inst.container.find("." + inst.settings.loadMoreWrapperClass);
			
			switch (action) {
			case 'show':
				if ($wrapper.length === 0) {
					$('<div class="' + inst.settings.loadMoreWrapperClass + '"><a href="#" class="' + inst.settings.loadMoreClass + '">' + inst.settings.loadMoreText + '</a></div>').appendTo(inst.container.is(document) ? document.body : inst.container);
				}
				break;
			case 'hide':
				if ($wrapper.length > 0) {
					$wrapper.remove();
				}
				break;
			}
		},
		_indicatorInfiniteScroll: function (target, action) {
			var inst = this._getInst(target);
			if (!inst) {
				return;
			}
			
			var $wrapper = inst.container.find("." + inst.settings.indicatorWrapperClass);
			
			switch (action) {
			case 'show':
				if ($wrapper.length === 0) {
					$('<div class="' + inst.settings.indicatorWrapperClass + '" style="background: url(' + inst.settings.loadingIcon + ') center center no-repeat;"></div>').appendTo(inst.container.is(document) ? document.body : inst.container);
				}
				break;
			case 'hide':
				if ($wrapper.length > 0) {
					$wrapper.remove();
				}
				break;
			}
		},
		_loadInfiniteScroll: function (target) {
			var inst = this._getInst(target);
			if (!inst) {
				return;
			}
			
			var self = this;
			
			this._moreInfiniteScroll.call(this, target, 'hide');

			this._indicatorInfiniteScroll.call(this, target, 'show');
			
			inst.page += 1;
			
			$.ajax({
				url: inst.settings.url,
				cache: false,
				data: {
					page: inst.page
				}
			}).done(function (data) {
				if (inst.container.is(document)) {
					$(document.body).append(data);
				} else {
					inst.container.append(data);
				}
				
				self._indicatorInfiniteScroll.call(self, target, 'hide');

				inst.states.loading = FALSE;
				
				inst.container.trigger("scrollcomplete", {});
			});
		},
		_destroyInfiniteScroll: function (target) {
			var inst = this._getInst(target);
			if (!inst) {
				return FALSE;
			}
			$(target)
				.off("scrollcomplete")
				.off(".scroll")
				.find("." + inst.settings.loadMoreWrapperClass).remove().end()
				.find("." + inst.settings.indicatorWrapperClass).remove();
			
			if (inst.container.is(document)) {
				$(window).unbind(".scroll");
			}

			$.data(target, PROP_NAME, FALSE);
		},
		_newInst: function(target) {
			return {
				container: target,
				uid: Math.floor(Math.random() * 99999999),
				page: 0,
				settings: {},
				states: {
					loading: false
				}
			};
		},
        _getInst: function(target) {
            try {
                return $.data(target, PROP_NAME);
            } catch (err) {
                throw 'Missing instance data for this infinite scroll';
            }
        },
	});
	
	$.fn.pjInfiniteScroll = function (options) {
		var otherArgs = Array.prototype.slice.call(arguments, 1);
        if (typeof options == 'string' && options == 'isDisabled') {
            return $.pjInfiniteScroll['_' + options + 'InfiniteScroll'].apply($.pjInfiniteScroll, [this[0]].concat(otherArgs));
        }

        if (options == 'option' && arguments.length == 2 && typeof arguments[1] == 'string') {
            return $.pjInfiniteScroll['_' + options + 'InfiniteScroll'].apply($.pjInfiniteScroll, [this[0]].concat(otherArgs));
        }

        return this.each(function() {
            typeof options == 'string' ? $.pjInfiniteScroll['_' + options + 'InfiniteScroll'].apply($.pjInfiniteScroll, [this].concat(otherArgs)) : $.pjInfiniteScroll._attachInfiniteScroll(this, options);
        });
	};
	
	$.pjInfiniteScroll = new InfinteScroll();
	$.pjInfiniteScroll.version = "1.0";
	
})(jQuery);