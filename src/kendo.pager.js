(function($, undefined) {
    var kendo = window.kendo,
        ui = kendo.ui,
        Widget = ui.Widget,
        proxy = $.proxy,
        FIRST = ".k-first",
        LAST = ".k-last",
        PREV = ".k-prev",
        NEXT = ".k-next",
        CHANGE = "change",
        CLICK = "click",
        KEYDOWN = "keydown",
        DISABLED = "disabled",
        iconTemplate = kendo.template('<a href="\\#" title="#=text#" class="k-link"><span class="k-icon #= className #">#=text#</span></a>');

    function button(template, idx, text, numeric) {
        return template( {
            idx: idx,
            text: text,
            ns: kendo.ns,
            numeric: numeric
        });
    }

    function icon(className, text) {
        return iconTemplate({
            className: className.substring(1),
            text: text
        });
    }

    function update(element, selector, page, disabled) {
       element.find(selector)
              .parent()
              .attr(kendo.attr("page"), page)
              .attr(DISABLED, disabled)
              .toggleClass("k-state-disabled", disabled);
    }

    function first(element, page, totalPages) {
        update(element, FIRST, 1, page <= 1);
    }

    function prev(element, page, totalPages) {
        update(element, PREV, Math.max(1, page - 1), page <= 1);
    }

    function next(element, page, totalPages) {
        update(element, NEXT, Math.min(totalPages, page + 1), page >= totalPages);
    }

    function last(element, page, totalPages) {
        update(element, LAST, totalPages, page >= totalPages);
    }

    var Pager = Widget.extend( {
        init: function(element, options) {
            var that = this, page, totalPages;

            Widget.fn.init.call(that, element, options);

            options = that.options;
            that.dataSource = options.dataSource;
            that.linkTemplate = kendo.template(that.options.linkTemplate);
            that.selectTemplate = kendo.template(that.options.selectTemplate);

            page = that.page();
            totalPages = that.totalPages();


            that._refreshHandler = proxy(that.refresh, that);

            that.dataSource.bind(CHANGE, that._refreshHandler);

            if (options.previousNext) {
                if (!that.element.find(FIRST).length) {
                    that.element.append(icon(FIRST, options.messages.first));

                    first(that.element, page, totalPages);
                }

                if (!that.element.find(PREV).length) {
                    that.element.append(icon(PREV, options.messages.previous));

                    prev(that.element, page, totalPages);
                }
            }

            that.list = that.element.find(".k-pager");

            if (!that.list.length) {
               that.list = $('<ul class="k-pager k-reset k-numeric" />').appendTo(that.element);
            }

            if (options.input) {
                if (!that.element.find(".k-pager-input").length) {
                   that.element.append('<span class="k-pager-input">'+
                       options.messages.page +
                       '<input class="k-textbox">' +
                       kendo.format(options.messages.of, totalPages) +
                       '</span>');
                }

                that._keydownHandler = proxy(that._keydown, that);
                that.element.on(KEYDOWN, ".k-pager-input input", that._keydownHandler);
            }

            if (options.previousNext) {
                if (!that.element.find(NEXT).length) {
                    that.element.append(icon(NEXT, options.messages.next));

                    next(that.element, page, totalPages);
                }

                if (!that.element.find(LAST).length) {
                    that.element.append(icon(LAST, options.messages.last));

                    last(that.element, page, totalPages);
                }
            }

            if (options.pageSizes){
                if (!that.element.find(".k-pager-size").length){
                     $('<span class="k-pager-sizes k-label"><select/></span>')
                        .appendTo(that.element)
                        .find("select")
                        .html($.map($.isArray(options.pageSizes) ? options.pageSizes : [5,10,20], function(page){
                            return "<option>" + page + "</option>";
                        }).join(""))
                        .val(that.pageSize())
                        .end()
                        .appendTo(that.element);

                    if (kendo.ui.DropDownList) {
                       that.element.find(".k-pager-sizes select").kendoDropDownList();
                    }
                }

                that._changeHandler = proxy(that._change, that);

                that.element.on(CHANGE, ".k-pager-sizes select", that._changeHandler);
            }

            if (options.info) {
                if (!that.element.find(".k-pager-info").length) {
                    that.element.append('<span class="k-pager-info k-label" />');
                }

                that.element.find("")
            }

            if (options.refresh) {
                if (!that.element.find(".k-refresh").length) {
                    that.element.append(icon(".k-refresh", options.messages.refresh));
                }

                that._reloadHandler = proxy(that._refreshClick, that);

                that.element.on(CLICK, ".k-link:has(.k-refresh)", that._reloadHandler);
            }

            that._clickHandler = proxy(that._click, that);

            that.element.on(CLICK, "a", that._clickHandler);

            if (options.autoBind) {
                that.refresh();
            }
        },

        destroy: function() {
            var that = this;

            that.element.off(CLICK, "a", that._clickHandler);

            that.element.off(KEYDOWN, ".k-pager-input input", that._keydownHandler);

            that.element.off(CHANGE, ".k-pager-sizes select", that._changeHandler);

            that.element.off(CLICK, ".k-link:has(.k-refresh)", that._reloadHandler);

            that.dataSource.unbind(CHANGE, that._refreshHandler);
        },

        events: [
            CHANGE
        ],

        options: {
            name: "Pager",
            selectTemplate: '<li><span class="k-state-active">#=text#</span></li>',
            linkTemplate: '<li><a href="\\#" class="k-link" data-#=ns#page="#=idx#">#=text#</a></li>',
            buttonCount: 10,
            autoBind: true,
            info: true,
            previousNext: true,
            pageSizes: false,
            refresh: false,
            messages: {
                display: "Displaying items {0} - {1} of {2}",
                empty: "No items to display",
                page: "Page",
                of: "of {0}",
                first: "Go to the first page",
                previous: "Go to the previous page",
                next: "Go to the next page",
                last: "Go to the last page",
                refresh: "Refresh"
            }
        },

        refresh: function() {
            var that = this,
                idx,
                end,
                start = 1,
                html = "",
                reminder,
                page = that.page(),
                pageSize = that.pageSize(),
                total = that.dataSource.total(),
                totalPages = that.totalPages(),
                linkTemplate = that.linkTemplate,
                buttonCount = that.options.buttonCount;

            if (page > buttonCount) {
                reminder = (page % buttonCount);

                start = (reminder === 0) ? (page - buttonCount) + 1 : (page - reminder) + 1;
            }

            end = Math.min((start + buttonCount) - 1, totalPages);

            if (start > 1) {
                html += button(linkTemplate, start - 1, "...", false);
            }

            for (idx = start; idx <= end; idx++) {
                html += button(idx == page ? that.selectTemplate : linkTemplate, idx, idx, true);
            }

            if (end < totalPages) {
                html += button(linkTemplate, idx, "...", false);
            }

            if (html === "") {
                html = that.selectTemplate({ text: 0 });
            }

            that.list.empty().append(html);

            if (that.options.info) {
                if (total > 0) {
                    html = kendo.format(that.options.messages.display,
                        (page - 1) * pageSize + 1, // first item in the page
                        Math.min(page * pageSize, total), // last item in the page
                    total);
                } else {
                    html = that.options.messages.empty;
                }

                that.element.find(".k-pager-info").html(html);
            }

            if (that.options.input) {
                that.element
                    .find(".k-pager-input")
                    .html(that.options.messages.page +
                        '<input class="k-textbox">' +
                        kendo.format(that.options.messages.of, totalPages))
                    .find("input")
                    .val(page)
                    .attr(DISABLED, total < 1)
                    .toggleClass("k-state-disabled", total < 1);
            }

            if (that.options.previousNext) {
                first(that.element, page, totalPages);

                prev(that.element, page, totalPages);

                next(that.element, page, totalPages);

                last(that.element, page, totalPages);
            }

            if (that.options.pageSizes) {
                that.element.find(".k-pager-sizes select").val(pageSize);
            }
        },

        _keydown: function(e) {
            if (e.keyCode === kendo.keys.ENTER) {
                var input = this.element.find(".k-pager-input").find("input"),
                    page = parseInt(input.val(), 10);

                if (isNaN(page) || page < 1 || page > this.totalPages()) {
                    page = this.page();
                }

                input.val(page);

                this.page(page);
            }
        },

        _refreshClick: function(e) {
            e.preventDefault();

            this.dataSource.read();
        },

        _change: function(e) {
            var pageSize = parseInt(e.currentTarget.value, 10);

            if (!isNaN(pageSize)){
               this.dataSource.pageSize(pageSize);
            }
        },

        _click: function(e) {
            var page = $(e.currentTarget).attr(kendo.attr("page"));
            e.preventDefault();

            this.page(page);
        },

        totalPages: function() {
            return Math.ceil((this.dataSource.total() || 0) / this.pageSize());
        },

        pageSize: function() {
            return this.dataSource.pageSize() || this.dataSource.total();
        },

        page: function(page) {
            if (page !== undefined) {
                this.dataSource.page(page);

                this.trigger(CHANGE, { index: page });
            } else {
                if (this.dataSource.total() > 0) {
                    return this.dataSource.page();
                } else {
                    return 0;
                }
            }
        }
    });

    ui.plugin(Pager);
})(jQuery);
