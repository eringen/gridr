var HTM = {
        frame: '\n<div class="frame">\n</div>',
        splitFirst: '\n<div class="split">\n</div>',
        splitSecond: '\n<div class="split">\n</div>',
        colgroup: '\n<div class="colgroup">\n</div>',
        column: '\n<div class="col">\n</div>'
    };
	
var CONTEXT = {
        menu: '<div id="contextMenu"></div>'
    };
    
var MAIN = {

    init: function(){
        $('#column-margin').attr('value', 9);
        $('#column-width').attr('value', 140);
        $('#column-number').attr('value', 6);
        $('#row-number').attr('value', 0);
        
        $('#column-width,#column-margin,#column-number,#row-number').keyup(function(p){
            var unitMargin = parseInt($('#column-margin').attr('value'));
            var unitWidth  = parseInt($('#column-width').attr('value'));
            var unitNumber = parseInt($('#column-number').attr('value'));
            var rowNumber  = parseInt($('#row-number').attr('value'));
            if (p.target.id === 'row-number') {
                $('#main').html(populateDom(rowNumber, unitNumber));
            }
            $('style').html(populateCss(unitNumber, unitWidth, unitMargin));
            $('#output1').attr('value', populateCss(unitNumber, unitWidth, unitMargin));
            $('#output2').attr('value', $.trim($('#main').html()));
        });
        $('#column-width,#column-margin,#column-number,#row-number').trigger('keyup');
        
        function populateDom(mainRow, columns, columnWidth, columnMargin){
            $('#main').html('');
            var left = Math.ceil(columns / 2), right = Math.floor(columns / 2);
            $('.splitter').remove();
            for (i = 0; i < mainRow; i++) {
                (function(){
                    var thisFrame = createFrame(left, right), thisRow = i + 1, columnOption = $('<div class="splitter" id="frame' + thisRow + '">Row ' + thisRow + ' Left Side:<select class="first"></select>columns -|- Right side:<select class="second"></select>columns</div>');
                    if (i === 0) {
                        $('#row-number').after(columnOption);
                    }
                    else {
                        $('#frame' + i).after(columnOption);
                    }
                    var pullDowns = columnOption.find('select');
                    for (o = 1; o < (columns); o++) {
                        var ops = $('<option value="' + (o) + '">' + (o) + '</option>');
                        if (o === left) {
                            ops = $('<option selected="selected" value="' + (o) + '">' + (o) + '</option>');
                        }
                        pullDowns.append(ops);
                    }
                    var firstSplit = columnOption.find('select.first'), secondSplit = columnOption.find('select.second');
                    $(firstSplit).change(function(w){
                        var splitx = $(this).val(), setOther = Math.abs(splitx - columns);
                        $(secondSplit).find('option:selected').attr('selected', '');
                        $(secondSplit).find('option[value="' + setOther + '"]').attr('selected', 'selected');
                        $(thisFrame.firstSplit).attr('class', 'split x' + splitx);
                        $(thisFrame.secondSplit).attr('class', 'split x' + setOther);
                    })
                    $(secondSplit).change(function(w){
                        var splitx = $(this).val(), setOther = Math.abs(splitx - columns);
                        $(firstSplit).find('option:selected').attr('selected', '');
                        $(firstSplit).find('option[value="' + setOther + '"]').attr('selected', 'selected');
                        $(thisFrame.secondSplit).attr('class', 'split x' + splitx);
                        $(thisFrame.firstSplit).attr('class', 'split x' + setOther);
                    });
                })();
            }
        }
        
        var createFrame = function(first, second){
            var frame = $(HTM.frame), splitFirst = $(HTM.splitFirst), splitSecond = $(HTM.splitSecond);
            $('#main').append(frame);
            frame.append(splitFirst);
            frame.append(splitSecond);
            splitFirst.addClass('x' + first);
            splitSecond.addClass('x' + second);
            return {
                firstSplit: splitFirst,
                secondSplit: splitSecond
            }
        }
        
        function populateCss(columns, columnWidth, columnMargin){
            var split = columnWidth + (columnMargin * 2), totalWidth = split * columns, temp = 'body,html {font-size:16px;}\n';
            temp += '\n/* MAIN CONTAINER */\n';
            temp += '#page {width:' + totalWidth + 'px; margin:0 auto;}\n';
            temp += '\n/* FRAME SETTINGS */\n';
            temp += '.frame {clear:both;overflow:hidden;}\n.split {float:left; position:relative;}\n';
            for (i = 1; i < (columns+1); i++) {
                temp += '.x' + i + ' {width:' + split * i + 'px;}\n';
            }
            temp += '\n/* COLUMN SETTINGS */\n';
            temp += '.col {background:#f00; float:left; margin:0 ' + columnMargin + 'px; position:relative; display:inline;}\n';
            temp += '.colgroup {margin-bottom:' + (columnMargin * 2) + 'px; overflow:hidden; height:1%;}\n';
            for (i = 1; i < columns; i++) {
                var col = (columnWidth * i) + ((i - 1) * (columnMargin * 2));
                temp += '.colgroup .g' + i + ' {width:' + col + 'px;}\n';
                if (i === columns - 1) {
                    return temp;
                }
            };
         }
        
        var rightclick = $(document.body).rightClick(function(elem){
            if ($('#contextMenu').length !== 0) {
                $('#contextMenu').remove();
            }
            var that = elem.target;
            var remover = $('<div>Remove</div>').mousedown(function(){
                $(that).remove();
            });
            var blinker = function(it){
                $(it).css({
                    'background-color': '#f00'
                });
                $('body').unbind('mousedown.colorchange').bind('mousedown.colorchange', function(){
                    $(it).attr('style', '');
                });
            }
            var contextMenu = $(CONTEXT.menu).css({
                left: elem.pageX,
                top: elem.pageY
            }).append(remover).hide();
            /*FRAME MENU*/
            if ($(that).hasClass('frame')) {
                var totalColumns = parseInt($('#column-number').attr('value')), usedColumns = 0;
                $(that).children('.split').each(function(){
                    var usedSpace = $(this).attr('class').split(' ');
                    usedSpace = parseInt(usedSpace[1].replace('x', ''));
                    usedColumns += usedSpace;
                });
                totalColumns = totalColumns - usedColumns
                for (j = 0; j < totalColumns; j++) {
                    (function(){
                        var cols = j + 1, split = $(HTM.splitFirst).addClass('x' + cols);
                        var menuHTML = $('<div>Add ' + cols + ' column' + s(j) + ' wide split</div>').click(function(){
                            $(that).append(split)
                        });
                        $(contextMenu).append(menuHTML)
                    })();
                }
                $('body').append(contextMenu);
                blinker(that);
            }
            /*SPLIT MENU*/
            if ($(that).hasClass('split')) {
                var frameClass = $(that).attr('class').split(' ');
                frameClass = frameClass[1].replace('x', '');
                $(contextMenu).prepend(contextContent('split', frameClass, that));
                $('body').append(contextMenu);
                blinker(that);
            }
            /*COLGROUP MENU*/
            
            
            
            if ($(that).hasClass('colgroup')) {
                var existingCols = $(that).children('.col'), usedCols = 0, maxCol = $(that).parents('.split').attr('class').split(' ');
                $(existingCols).each(function(){
                    var colWidth = $(this).attr('class').split(' ');
                    colWidth = parseInt(colWidth[1].replace('g', ''));
                    usedCols += colWidth;
                });
                maxCol = parseInt(maxCol[1].replace('x', '')) - usedCols;
                
                // Function defined to be used in 'for loop' bellow.
                function iterateInLoop(j) {
                    var colWide = j + 1;
                    if (colSetting !== colWide) {
                        var column = $(HTM.column).addClass('g' + colWide)
                        var colMenu = $('<div>Create ' + colWide + ' column' + s(j) + ' wide element</div>').click(function(){
                            $(that).append(column);
                        });
                        $(contextMenu).prepend(colMenu);
                    }
                };
                
                for (j = 0; j < maxCol; j++) {
                    iterateInLoop(j)
                }
                $(document.body).append(contextMenu);
                blinker(that);
            }
            /*COL MENU*/
            if ($(that).hasClass('col')) {
                var colSetting = $(that).attr('class').split(' ');
                colSetting = parseInt(colSetting[1].replace('g', ''));
                var maxCol = $(that).parents('.split').attr('class').split(' ');
                var otherCols = $(that).parents('.colgroup').children('.col');
                var allColsWidth = 0
                $(otherCols).each(function(){
                    var colWidth = $(this).attr('class').split(' ');
                    colWidth = parseInt(colWidth[1].replace('g', ''));
                    allColsWidth += colWidth;
                })
                maxCol = parseInt(maxCol[1].replace('x', '')) - allColsWidth + colSetting;
                for (j = 0; j < maxCol; j++) {
                    (function(){
                        var colWide = j + 1;
                        if (colSetting !== colWide) {
                            var colMenu = $('<div>Make this element ' + colWide + ' column' + s(j) + ' wide</div>').click(function(){
                                $(that).removeClass('g' + colSetting).addClass('g' + (colWide));
                            });
                            $(contextMenu).prepend(colMenu);
                        }
                    })();
                }
                $('body').append(contextMenu);
                blinker(that);
            }
            
            
            /*MAIN MENU*/
            if ($(that).attr('id') === 'main') {
                var addFrame = $('<div>Add frame</div>').click(function(){
                    var frame = $(HTM.frame);
                    $(that).append(frame);
                });
                $(contextMenu).prepend(addFrame);
                $('body').append(contextMenu);
                blinker(that);
            }
            
            
            /*FRAME MENU*/
            if ($(that).hasClass('frame')) {
                $('body').append(contextMenu);
                blinker(that);
            }
            $(contextMenu).fadeIn('fast');
            
        }).mousedown(function(elem){
            var that = elem.target;
            if ($(that).parent('#contextMenu').length !== 0 || $(that).attr('id') === 'contextMenu') {
                $('#contextMenu').fadeOut('fast', function(){
                    $(this).remove();
                });
            }
            else {
                $('#contextMenu').remove();
            }
        });
        
        function contextContent(context, cols, targetElem){
            if (context === 'split') {
                var elems = '';
                for (i = 0; i < cols; i++) {
                    elems += '<div>Create ' + (i + 1) + ' element' + s(i) + '</div>';
                }
                var menuElements = $(elems);
                for (m = 0; m < cols; m++) {
                    $(menuElements[m]).val(m).bind('mousedown', function(){
                        var colgroup = $(HTM.colgroup);
                        $(targetElem).append(colgroup);
                        var countItem = parseInt($(this).val()) + 1;
                        populateColumns(countItem, colgroup, cols);
                    });
                }
                return menuElements;
            }
        }
        
        function populateColumns(colNumber, target, space){
            for (m = 0; m < colNumber; m++) {
                (function(){
                    var setClass = Math.floor(space / colNumber);
                    var col = $(HTM.column).addClass('g' + setClass);
                    $(target).append(col);
                })();
            }
            $('#output2').attr('value', $.trim($('#main').html()));
        }
        
        function is_int(value){
            if ((parseFloat(value) === parseInt(value)) && !isNaN(parseInt(value))) {
                return true;
            }
            else {
                return false;
            }
        }
        
        function s(s){
            /* Puts "s" end of string if required */
            if (s === 0) {
                return ''
            }
            else {
                return 's'
            }
        }
        
        $(document.body).disableContextMenu();
        
        $('#colorswitch').toggle(function(){
            $(document.body).toggleClass('white', '')
            $('.col').append('<p class="dummyCon">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.</p>')
        }, function(){
            $(document.body).toggleClass('white', '')
            $('p.dummyCon').remove();
        })
    }
};


$(document).ready(function(){
    MAIN.init();
});
