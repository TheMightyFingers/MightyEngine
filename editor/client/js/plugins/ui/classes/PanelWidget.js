"use strict";

uieditor.PanelWidget = uieditor.Widget.extend({

  children: null,

  left: null,
  right: null,
  top: null,
  bottom: null,

  in_side: null,
  is_first: false,
  is_panel: true,
  align_positions: ['left_top', 'center_top', 'right_top', 'left_middle', 'middle', 'right_middle', 'left_bottom', 'center_bottom', 'right_bottom'],

  init: function(editor, custom_panel)
  {
    this.type = 'panel';
    this._super(editor);
    this.children = [];

    var self = this;

    this.options = {
      css: {},
      width: 200,
      width_units: custom_panel ? '%' : 'px',
      height: 150,
      height_units: custom_panel ? '%' : 'px',
      anchor_align: '',
      align: 'left_top',
      class: '',
      data_click: '',
      data_var: '',
      bg_image: '',
      as_margin: false,
      html: ''
    };

    if (custom_panel)
      this.$div = $(custom_panel);


    if (!uieditor.PanelWidget.dialog_inited)
    {
      uieditor.PanelWidget.initDialog();
      uieditor.PanelWidget.dialog_inited = true;
    }
  },

  updateDiv: function()
  {
    var static_wrap = false;

    if (this.options.width == 'auto')
    {
      this.$div.css('width', 'auto');
      $('> .wrap', this.$div).css('overflow-x', 'hidden');
      static_wrap |= true;
    }
    else if (this.options.width != '')
    {
      this.$div.css('width', this.options.width + this.options.width_units);
      $('> .wrap', this.$div).css('overflow-x', '');
    }

    if (this.options.height == 'auto')
    {
      this.$div.css('height', 'auto');
      $('> .wrap', this.$div).css('overflow-y', 'hidden');
      static_wrap |= true;
    }
    else if (this.options.height != '')
    {
      this.$div.css('height', this.options.height + this.options.height_units);
      $('> .wrap', this.$div).css('overflow-y', '');
    }

    var num_panels = 0;
    for (var i=0; i<this.children.length; i++)
    {
      if (this.children[i].is_panel)
        num_panels++;

    }

    if (num_panels == this.children.length)
      static_wrap = false;


    if (static_wrap)
    {
      $('> .wrap', this.$div).css({
        position: 'relative',
        left: 'auto',
        right: 'auto',
        top: 'auto',
        bottom: 'auto'
      });

      if (this.options.height != 'auto' && this.options.height != '')
      {
        $('> .wrap', this.$div).css({
          height: (this.$div[0].offsetHeight - 2) + 'px'
        });
      }
    }
    else
    {
      $('> .wrap', this.$div).css({
        position: '',
        left: '',
        right: '',
        top: '',
        bottom: ''
      });
    }


    if (this.editor.root_panel != this)
    {
      $('> .wrap', this.$div).css({
        background: this.options.as_margin ? 'url(/js/plugins/ui/img/pattern_1.png) repeat' : 'none'
      });
    }

    var w = this;
    var css_props = {};
    if (w.is_panel && w.options.bg_image != '')
    {
      css_props['background-image'] = 'url("' + w.options.bg_image + '")';
      css_props['background-repeat'] = 'no-repeat';
    }
    this.updateDivCSS(css_props);
  },

  createHTML: function()
  {
    return '<div id="'+ this.id +'" class="widget panel"><div class="wrap"></div></div>';
  },

  addChild: function(w, options)
  {
    var self = this;

    if (typeof options == 'undefined')
      options = {};

    var anchor_w = options.anchor_w
    var anchor_edge = options.anchor_edge;

    if (options.before)
    {
      var i = this.children.indexOf(options.before);
      if (i == -1) return;

      this.children.splice(i, 0, w);
    }
    else {
      this.children.push(w);
    }

    w.parent = this;
    if (w.id == 0)
      w.id = 'e-' + (++this.editor.widget_counter);

    var $div = w.$div;
    if (!$div) {
      $div = $(w.createHTML()).appendTo($('> .wrap', this.$div));
    }
    else
    {
      $div.detach();

      if (options.before)
      {
        $div.insertBefore(options.before.$div);
      }
      else
        $div.appendTo($('> .wrap', this.$div));

    }
    w.$div = $div;

    if (w.is_panel && (typeof(options.dont_link) == 'undefined' || !options.dont_link))
    {
      if (anchor_w && anchor_edge)
        anchor_w.linkAtEdge(w, anchor_edge);
      else
        w.linkOnAlign();

    }

    w.updateDiv();
    w.onAdd();

    $div.unbind('dblclick');
    $div.dblclick(function(e)
    {
      e.stopPropagation();

//      window.w = w;
      console.log(w);

      self.editor.openOptionsDialog(w);
    });

    this.updateDiv();


    function panelsLine(a, b)
    {
      var ctx = self.editor.ctx;
      var a_pos = a.$div.offset();
      var b_pos = b.$div.offset();

      var w_pos = $('#workarea').offset();

      ctx.strokeStyle = '#00ff00';
      ctx.beginPath();
      ctx.moveTo(a_pos.left-w_pos.left + a.$div.width()/2, a_pos.top-w_pos.top + a.$div.height()/2);
      ctx.lineTo(b_pos.left-w_pos.left + b.$div.width()/2, b_pos.top-w_pos.top + b.$div.height()/2);
      ctx.stroke();
    }

/*
    if (this.editor.debug && w.type == 'panel')
    {
      $div.mouseover(function(e)
      {
        if (w.children.length > 0) return;

        var ctx = self.editor.ctx;
        ctx.clearRect(0, 0, self.editor.canvas.width, self.editor.canvas.height);

        if (w.left && w.left != w.parent)
          panelsLine(w, w.left);

        if (w.right && w.right != w.parent)
          panelsLine(w, w.right);

        if (w.top && w.top != w.parent)
          panelsLine(w, w.top);

        if (w.bottom && w.bottom != w.parent)
          panelsLine(w, w.bottom);

      });

      $div.mouseout(function()
      {
        var ctx = self.editor.ctx;
        ctx.clearRect(0, 0, self.editor.canvas.width, self.editor.canvas.height);
      });

    }
*/

  },

  removeChild: function(ch, keep_div)
  {
    if (ch.parent != this) return;

    if (ch.is_panel)
    {
      if (ch.in_side != 'left' && ch.in_side != 'right')
      {
        if (ch.left)
          ch.left.remove();

        if (ch.right)
          ch.right.remove();

      }

      if (ch.in_side != 'top' && ch.in_side != 'bottom')
      {
        if (ch.top)
          ch.top.remove();

        if (ch.bottom)
          ch.bottom.remove();

      }

      ch.unlink();
    }

    if (!keep_div && ch.$div)
    {
      ch.$div.remove();
      ch.$div = null;
    }

    var i = this.children.indexOf(ch);
    if (i >= 0)
      this.children.splice(i, 1);

    this.setChildrenPositions();
    ch.parent = null;
  },

  setChildrenPositionsOnAlign: function(align)
  {
    var ch = this.getFirstChildOnAlign(align);
    if (!ch) return;

    var this_w = parseInt(this.$div.css('width'));
    var this_h = parseInt(this.$div.css('height'));

    var auto_w = (this.options.width == 'auto');
    var auto_h = (this.options.height == 'auto');

    var y = 0;

    switch (align)
    {
      case 'left':
      case 'left_top':
        ch.setCSS({
          position: 'absolute',
          left: 0,
          top: 0,
          right: 'auto',
          bottom: 'auto'
        });
        break;

      case 'center':
      case 'center_top':
        var ch_w = parseInt(ch.$div.css('width'));

        ch.setCSS({
          position: 'absolute',
          left: (auto_w ? 0 : ((this_w - ch_w) / 2) ) + 'px',
          top: 0,
          right: 'auto',
          bottom: 'auto'
        });
        break;

      case 'right':
      case 'right_top':
        ch.setCSS({
          position: 'absolute',
          right: 0,
          top: 0,
          left: 'auto',
          bottom: 'auto'
        });
        break;

      case 'left_middle':
        var ch_h = parseInt(ch.$div.css('height'));

        ch.setCSS({
          position: 'absolute',
          left: 0,
          top: (auto_h ? 0 : ((this_h - ch_h) / 2) ) + 'px',
          right: 'auto',
          bottom: 'auto'
        });
        break;

      case 'middle':
        var ch_w = parseInt(ch.$div.css('width'));
        var ch_h = parseInt(ch.$div.css('height'));

        ch.setCSS({
          position: 'absolute',
          left: (auto_w ? 0 : ((this_w - ch_w) / 2) ) + 'px',
          top: (auto_h ? 0 : ((this_h - ch_h) / 2) ) + 'px',
          right: 'auto',
          bottom: 'auto'
        });
        break;

      case 'right_middle':
        var ch_h = parseInt(ch.$div.css('height'));

        ch.setCSS({
          position: 'absolute',
          left: 'auto',
          top: (auto_h ? 0 : ((this_h - ch_h) / 2) ) + 'px',
          right: 0,
          bottom: 'auto'
        });
        break;

      case 'left_bottom':
        ch.setCSS({
          position: 'absolute',
          left: 0,
          top: 'auto',
          right: 'auto',
          bottom: 0
        });
        break;

      case 'center_bottom':
        var ch_w = parseInt(ch.$div.css('width'));

        ch.setCSS({
          position: 'absolute',
          left: (auto_w ? 0 : ((this_w - ch_w) / 2) ) + 'px',
          top: 'auto',
          right: 'auto',
          bottom: 0
        });
        break;

      case 'right_bottom':
        ch.setCSS({
          position: 'absolute',
          right: 0,
          top: 'auto',
          left: 'auto',
          bottom: 0
        });
        break;

    }

    this.setChildrenPositionsOnLeft(ch);
    this.setChildrenPositionsOnRight(ch);
    this.setChildrenPositionsOnTop(ch);
    this.setChildrenPositionsOnBottom(ch);
  },

  setChildrenPositionsOnLeft: function(ch)
  {
    var x = ch.$div.position().left;

    ch = ch.left;
    if (!ch) return;

    while (ch)
    {
      x -= this.getWidth(ch.$div);

      var top = ch.right.$div[0].offsetTop;
      if (ch.options.anchor_align == 'middle')
        top += (ch.right.$div[0].offsetHeight - ch.$div[0].offsetHeight) / 2;
      else if (ch.options.anchor_align == 'bottom')
        top += ch.right.$div[0].offsetHeight - ch.$div[0].offsetHeight;

      ch.setCSS({
        position: 'absolute',
        left: x+'px',
        right: 'auto',
        top: top + 'px',
        bottom: 'auto'
      });

      this.setChildrenPositionsOnTop(ch);
      this.setChildrenPositionsOnBottom(ch);

      ch = ch.left;
    }

  },

  setChildrenPositionsOnRight: function(ch)
  {
    var x = ch.$div.position().left + this.getWidth(ch.$div);

    ch = ch.right;
    if (!ch) return;

    while (ch)
    {
      var top = ch.left.$div[0].offsetTop;
      if (ch.options.anchor_align == 'middle')
        top += (ch.left.$div[0].offsetHeight - ch.$div[0].offsetHeight) / 2;
      else if (ch.options.anchor_align == 'bottom')
        top += ch.left.$div[0].offsetHeight - ch.$div[0].offsetHeight;

      ch.setCSS({
        position: 'absolute',
        left: x+'px',
        right: 'auto',
        top: top + 'px',
        bottom: 'auto'
      });

      this.setChildrenPositionsOnTop(ch);
      this.setChildrenPositionsOnBottom(ch);

      x += this.getWidth(ch.$div);
      ch = ch.right;
    }
  },

  setChildrenPositionsOnTop: function(ch)
  {
    var y = ch.$div.position().top;

    ch = ch.top;
    if (!ch) return;

    while (ch)
    {
      y -= this.getHeight(ch.$div);

      var left = ch.bottom.$div[0].offsetLeft;
      if (ch.options.anchor_align == 'center')
        left += (ch.bottom.$div[0].offsetWidth - ch.$div[0].offsetWidth) / 2;
      else if (ch.options.anchor_align == 'right')
        left += ch.bottom.$div[0].offsetWidth - ch.$div[0].offsetWidth;

      ch.setCSS({
        position: 'absolute',
        left: left + 'px',
        right: 'auto',
        top: y+'px',
        bottom: 'auto'
      });

      this.setChildrenPositionsOnLeft(ch);
      this.setChildrenPositionsOnRight(ch);

      ch = ch.top;
    }
  },

  setChildrenPositionsOnBottom: function(ch)
  {
    var y = ch.$div.position().top + this.getHeight(ch.$div);

    ch = ch.bottom;
    if (!ch) return;

    while (ch)
    {
      var left = ch.top.$div[0].offsetLeft;
      if (ch.options.anchor_align == 'center')
        left += (ch.top.$div[0].offsetWidth - ch.$div[0].offsetWidth) / 2;
      else if (ch.options.anchor_align == 'right')
        left += ch.top.$div[0].offsetWidth - ch.$div[0].offsetWidth;


      ch.setCSS({
        position: 'absolute',
        left: left + 'px',
        right: 'auto',
        top: y+'px',
        bottom: 'auto'
      });

      this.setChildrenPositionsOnLeft(ch);
      this.setChildrenPositionsOnRight(ch);

      y += this.getHeight(ch.$div);
      ch = ch.bottom;
    }
  },

  setChildrenPositionsOnly: function(recursive)
  {
    var self = this;

    if (recursive)
    {
      for (var i=0; i<self.children.length; i++)
      {
        if (self.children[i].is_panel)
          self.children[i].setChildrenPositionsOnly(true);

      }
    }

    for (var i=0; i<self.align_positions.length; i++)
    {
      self.setChildrenPositionsOnAlign(self.align_positions[i]);
    }

    this.updateChildrenDimensions(false);
  },

  updateChildrenDimensions: function(recursive)
  {
    if (recursive)
    {
      for (var i=0; i<this.children.length; i++)
      {
        if (this.children[i].is_panel)
          this.children[i].updateChildrenDimensions(true);

      }
    }

    var w = 0;
    var h = 0;
    var all_panels = true;

    for (var i=0; i<this.children.length; i++)
    {
      var ch = this.children[i];

      var max_x = ch.$div[0].offsetLeft + ch.$div[0].offsetWidth;
      var max_y = ch.$div[0].offsetTop + ch.$div[0].offsetHeight;

      if (max_x > w) {
        w = max_x;
      }

      if (max_y > h) {
        h = max_y;
      }

      if (!ch.is_panel) {
        all_panels = false;
      }

    }

    if (all_panels && (this.options.width == 'auto' || this.options.height == 'auto') )
    {
      if (w < 10) w = 10;
      if (h < 10) h = 10;

      var border_w = parseInt($('> .wrap', this.$div).css('border-width'));
      w += border_w * 2;
      h += border_w * 2;

      if (this.options.width == 'auto') {
        this.$div.css('width', w+'px');
      }

      if (this.options.height == 'auto') {
        this.$div.css('height', h+'px');
      }

    }

  },


  setChildrenPositions: function(recursive)
  {
    this.setChildrenPositionsOnly(recursive);
  },

  draw: function()
  {
    if (this.editor.widget_over != this) return;

    function pointInsideDiv(x, y, div)
    {
      return (x >= 0 && y >= 0 && x < div.offsetWidth && y < div.offsetHeight);
    }

    if (this.editor.corner_img && !this.editor.resizable_edges)
    {
      var ctx = this.editor.overlay_ctx;

      var workarea = $('#workarea')[0];
      var pos = this.$div.offset();

      pos.left -= workarea.offsetLeft;
      pos.top -= workarea.offsetTop;
      pos.right = pos.left + this.$div[0].offsetWidth;
      pos.bottom = pos.top + this.$div[0].offsetHeight;

      var pos_local = {
        left: this.$div[0].offsetLeft,
        top: this.$div[0].offsetTop,
        right: this.$div[0].offsetLeft + this.$div[0].offsetWidth,
        bottom: this.$div[0].offsetTop + this.$div[0].offsetHeight
      }

      var resizable_edges = this.getResizableEdges();

      var has_left = (resizable_edges.indexOf('left') >= 0);
      var has_right = (resizable_edges.indexOf('right') >= 0);
      var has_top = (resizable_edges.indexOf('top') >= 0);
      var has_bottom = (resizable_edges.indexOf('bottom') >= 0);

      if (has_left && has_top && pointInsideDiv(pos_local.left, pos_local.top, this.parent.$div[0]) )
      {
        ctx.drawImage(this.editor.corner_img, pos.left-6, pos.top-6);

        this.editor.resize_handles.push({
          w: this,
          x: pos.left-6,
          y: pos.top-6,
          cx: pos.left,
          cy: pos.top,
          c: 'nw'
        });
      }

      if (has_right && has_top && pointInsideDiv(pos_local.right, pos_local.top, this.parent.$div[0]) )
      {
        ctx.drawImage(this.editor.corner_img, pos.right-7, pos.top-6);

        this.editor.resize_handles.push({
          w: this,
          x: pos.right-7,
          y: pos.top-6,
          cx: pos.right,
          cy: pos.top,
          c: 'ne'
        });
      }

      if (has_right && has_bottom && pointInsideDiv(pos_local.right, pos_local.bottom, this.parent.$div[0]) )
      {
        ctx.drawImage(this.editor.corner_img, pos.right-7, pos.bottom-6);

        this.editor.resize_handles.push({
          w: this,
          x: pos.right-7,
          y: pos.bottom-6,
          cx: pos.right,
          cy: pos.bottom,
          c: 'se'
        });
      }

      if (has_left && has_bottom && pointInsideDiv(pos_local.left, pos_local.bottom, this.parent.$div[0]) )
      {
        ctx.drawImage(this.editor.corner_img, pos.left-6, pos.bottom-6);

        this.editor.resize_handles.push({
          w: this,
          x: pos.left-6,
          y: pos.bottom-6,
          cx: pos.left,
          cy: pos.bottom,
          c: 'sw'
        });
      }
    }

  },

  getFirstChildOnAlign: function(align)
  {
    for (var i=0; i<this.children.length; i++)
    {
      var ch = this.children[i];
      if (ch.options.align == align && ch.is_first)
      {
        return ch;
      }
    }

    return null;
  },

  linkOnAlign: function()
  {
    var w = this;

    var first_ch = this.parent.getFirstChildOnAlign(w.options.align);
    if (first_ch == null)
    {
      w.in_side = null;
      w.is_first = true;
    }
    else
    {
      switch (w.options.align)
      {
        case 'left':
        case 'left_top':

        case 'center':
        case 'center_top':

        case 'right':
        case 'right_top':
          var ch = first_ch;
          while (ch.bottom != null)
          {
            ch = ch.bottom;
          }

          w.top = ch;
          w.in_side = 'top';
          ch.bottom = w;
          break;

        case 'left_middle':
        case 'middle':
        case 'right_middle':
          var ch = first_ch;
          while (ch.bottom != null)
          {
            ch = ch.bottom;
          }

          w.top = ch;
          w.in_side = 'top';
          ch.bottom = w;
          break;

        case 'left_bottom':
        case 'center_bottom':
        case 'right_bottom':
          var ch = first_ch;
          while (ch.top != null)
          {
            ch = ch.top;
          }

          w.bottom = ch;
          w.in_side = 'bottom';
          ch.top = w;
          break;

      }
    }

  },

  linkAtEdge: function(w, edge)
  {
    w.options.align = this.options.align;

    if (w.id == 0)
      w.id = ++this.editor.widget_counter;


    /*
        w.parent = this.parent;

        this.parent.children.push(w);

        w.$div.detach();
        w.$div.appendTo($('> .wrap', this.parent.$div));
    */

    switch (edge)
    {
      case 'left':
        if (this.left)
        {
          this.left.right = w;
          w.left = this.left;
        }

        w.right = this;
        w.in_side = 'right';
        w.options.anchor_align = 'top';
        this.left = w;
        break;

      case 'right':
        if (this.right)
        {
          this.right.left = w;
          w.right = this.right;
        }

        w.left = this;
        w.in_side = 'left';
        w.options.anchor_align = 'top';
        this.right = w;
        break;

      case 'top':
        if (this.top)
        {
          this.top.bottom = w;
          w.top = this.top;
        }

        w.bottom = this;
        w.in_side = 'bottom';
        w.options.anchor_align = 'left';
        this.top = w;
        break;

      case 'bottom':
        if (this.bottom)
        {
          this.bottom.top = w;
          w.bottom = this.bottom;
        }

        w.top = this;
        w.in_side = 'top';
        w.options.anchor_align = 'left';
        this.bottom = w;
        break;
    }
  },

  unlink: function()
  {
    var a_left = this.left;
    var a_right = this.right;
    var a_top = this.top;
    var a_bottom = this.bottom;

    if (this.left)
    {
      if (this.left.right == this)
      {
        this.left.right = a_right;
      }

      this.left = null;
    }

    if (this.right)
    {
      if (this.right.left == this)
      {
        this.right.left = a_left;
      }

      this.right = null;
    }

    if (this.top)
    {
      if (this.top.bottom == this)
      {
        this.top.bottom = a_bottom;
      }

      this.top = null;
    }

    if (this.bottom)
    {
      if (this.bottom.top == this)
      {
        this.bottom.top = a_top;
      }

      this.bottom = null;
    }

    this.is_first = false;
    this.in_side = null;

/*
    if (a_right)
    {
      if (a_top)
      {
        var w = a_right.top;
        while (w)
        {
          var next_top = w.top;
          a_top.linkAtEdge(w, 'bottom');
          w = next_top;
        }

        var w = a_right.bottom;
        while (w)
        {
          var next_bottom = w.bottom;
          a_top.linkAtEdge(w, 'bottom');
          w = next_bottom;
        }

        a_top.linkAtEdge(a_right, 'bottom');
      }
      else if (a_bottom)
      {
        var w = a_right.top;
        while (w)
        {
          var next_top = w.top;
          a_top.linkAtEdge(w, 'bottom');
          w = next_top;
        }

        var w = a_right.bottom;
        while (w)
        {
          var next_bottom = w.bottom;
          a_bottom.linkAtEdge(w, 'top');
          w = next_bottom;
        }

        a_bottom.linkAtEdge(a_right, 'top');
      }
    }
    else if (a_bottom)
    {
    }
*/
  },

  findNearestEdge: function(x, y)
  {
    var nearest_d = Number.MAX_VALUE;
    var nearest_ch = null;
    var nearest_dir = null;

    for (var i=0; i<this.children.length; i++)
    {
      var ch = this.children[i];
      if (!ch.is_panel) continue;

      var o = ch.$div.offset();
      var w = this.getWidth(ch.$div);
      var h = this.getHeight(ch.$div);

      var d = Number.MAX_VALUE;
      var dir = null;

      if (x < o.left && y >= o.top && y < (o.top + h))
      {
        d = o.left - x;
        dir = 'left';
      }
      else if (x >= (o.left + w) && y >= o.top && y < (o.top + h))
      {
        d = x - (o.left + w);
        dir = 'right';
      }
      else if (y < o.top && x >= o.left && x < (o.left + w))
      {
        d = o.top - y;
        dir = 'top';
      }
      else if (y >= (o.top + h) && x >= o.left && x < (o.left + w))
      {
        d = y - (o.top + h);
        dir = 'bottom';
      }

      if (!dir) continue;


      if (d < nearest_d)
      {
        nearest_d = d;
        nearest_ch = ch;
        nearest_dir = dir;
      }

    }
    if (!nearest_ch) return null;

    return {
      dist: nearest_d,
      w: nearest_ch,
      dir: nearest_dir
    };
  },

  getChildAt: function(x, y, recursive)
  {
    for (var i=0; i<this.children.length; i++)
    {
      var ch = this.children[i];

      var o = ch.$div.offset();

      if (x >= o.left && x < (o.left + this.getWidth(ch.$div) ) &&
          y >= o.top && y < (o.top + this.getHeight(ch.$div)) )
      {
        if (recursive)
        {
          var ch2 = ch.is_panel ? ch.getChildAt(x, y, true) : null;
          return ch2 ? ch2 : ch;
        }
        else
          return ch;

      }

    }

    return null;
  },

  numOutLinks: function()
  {
    var panelw = this;
    var num_out = 0;
    if (panelw.left && panelw.in_side != 'left')
      num_out++;

    if (panelw.right && panelw.in_side != 'right')
      num_out++;

    if (panelw.top && panelw.in_side != 'top')
      num_out++;

    if (panelw.bottom && panelw.in_side != 'bottom')
      num_out++;

    return num_out;
  },

  getWidth: function($el)
  {
    return $el[0].offsetWidth;
/*
    var v = $el.css('width');
    if (v.substr(-1) == '%')
      return $el.parent().width() * (parseFloat(v) / 100);
    else
      return $el.width();
*/
  },

  getHeight: function($el)
  {
    return $el[0].offsetHeight;
/*
    var v = $el.css('height');
    if (v.substr(-1) == '%')
      return $el.parent().height() * (parseFloat(v) / 100);
    else
      return $el.height();
*/
  },

  loadChildren: function(list, id_base, options)
  {
    if (!list) return;

    if (!options) options = {};
    var class_prefix = options.class_prefix ? options.class_prefix : '';

    if (typeof id_base == 'undefined')
      id_base = 0;

    var self = this;
    var all_panels = {};
    var all_panels_data = {};

    function loadSubChildren(list, panel)
    {
      for (var i=0; i<list.length; i++)
      {
        if (!list[i].type) continue;

        var w = self.editor.createWidget(list[i].type);
        w.options = $.extend(w.options, list[i].options);

        if (w.is_panel)
        {
          if (w.options.align == 'left') w.options.align = 'left_top';
          else if (w.options.align == 'center') w.options.align = 'center_top';
          else if (w.options.align == 'right') w.options.align = 'right_top';
        }

        w.id = list[i].id;

        if (options.add_classes)
        {
          w.options.class += ' ' + class_prefix + w.id;

          if (w.type == 'panel')
            w.options.class += ' ' + class_prefix + 'panel';

        }


        if (options.subtemplate)
          w.options._subtemplate = options.subtemplate;


        var id_n = parseInt(w.id.substr(2));
        var prefix = w.id.substr(0, 2);
        if (w.id == (prefix + id_n))
        {
          id_n += id_base;

          if (id_n > self.editor.widget_counter)
            self.editor.widget_counter = id_n;

          w.id = prefix + id_n;
        }

        var opts = {};

        if (w.is_panel)
          opts.dont_link = true;

        panel.addChild(w, opts);

        if (w.is_panel && list[i].children)
        {
          w.is_first = list[i].is_first;
          w.in_side = list[i].in_side;

          all_panels[list[i].id] = w;
          all_panels_data[list[i].id] = list[i];

          loadSubChildren(list[i].children, w);
        }
      }
    }

    loadSubChildren(list, this);

    for (var id in all_panels)
    {
      var data = all_panels_data[id];
      if (!data) continue;

      var panel = all_panels[id];

      panel.left = data.left ? all_panels[data.left] : null;
      panel.right = data.right ? all_panels[data.right] : null;
      panel.top = data.top ? all_panels[data.top] : null;
      panel.bottom = data.bottom ? all_panels[data.bottom] : null;
    }

    this.setChildrenPositions(true);
    this.setChildrenPositions(true);
  },

  remove: function(keep_div)
  {
    if (this.numOutLinks() > 0) return false;

    return this._super(keep_div);
  },

  canBeMoved: function()
  {
    return (this.numOutLinks() == 0);
  },

  safeRemove: function(keep_div)
  {
    if (this.numOutLinks() > 0) { alert('Can\'t delete panel in-between others! Remove end panels first.'); return false; }

    if (!confirm('Are you sure you want to delete this panel?')) return false;

    return this._super(keep_div);
  },

  getResizableEdges: function()
  {
    if (this.is_first)
    {
      var align_resizable_edges = {
        'left_top': ['right', 'bottom'],
        'center_top': ['left', 'right', 'bottom'],
        'right_top': ['left', 'bottom'],
        'left_middle': ['top', 'right', 'bottom'],
        'middle': ['left', 'right', 'top', 'bottom'],
        'right_middle': ['top', 'left', 'bottom'],
        'left_bottom': ['top', 'right'],
        'center_bottom': ['left', 'top', 'right'],
        'right_bottom': ['left', 'top']
      };

      return align_resizable_edges[this.options.align];
    }

    var edges = ['left', 'right', 'top', 'bottom'];
    edges.splice(edges.indexOf(this.in_side), 1);

    if (this.in_side == 'left' || this.in_side == 'right')
    {
      if (this.options.anchor_align == 'top' || this.options.anchor_align == 'bottom') {
        edges.splice(edges.indexOf(this.options.anchor_align), 1);
      }
    }
    else    // top || bottom
    {
      if (this.options.anchor_align == 'left' || this.options.anchor_align == 'right') {
        edges.splice(edges.indexOf(this.options.anchor_align), 1);
      }
    }

    return edges;
  }

});

uieditor.PanelWidget.dialog_inited = false;
uieditor.PanelWidget.initDialog = function()
{
  $('#tabs-panel').tabs();
  uieditor.Widget.initStylesTab(this, '#panel-styles');

  var wrap = $('#dialog-panel')[0];

  $('#dialog-panel').dialog({
    autoOpen: false,
    width: 350,
    height: 500,
    title: 'Panel options',
    buttons: {
      Update: function()
      {
        var panelw = $(this).dialog('option', 'editor_widget');
        var fields = panelw.getClass().otito.object;
/*
        if (fields.width == 'auto' && fields.height != 'auto')
        {
          alert('Auto width and fixed height combination is not possible!');
          return;
        }
*/
        var align_old = panelw.options.align;

        uieditor.Widget.getOtitoValues(panelw.getClass().otito, panelw.options);

        panelw.options.css = {};
        uieditor.Widget.getOtitoValues(panelw.getClass().css_otito, panelw.options.css);

        var opt = {};
        uieditor.Widget.getOtitoValues(panelw.getClass().html_otito, opt);
        panelw.options.html = opt.html;

        if (align_old != panelw.options.align)
        {
          panelw.unlink();
          panelw.linkOnAlign();
        }

        panelw.updateDiv();

        panelw.$div.removeClass('selected');
        panelw.editor.selected_widget = null;
        panelw.editor.redrawEditArea();
        panelw.editor.redrawEditArea();

        $(this).dialog('close');
      },

      Delete: function()
      {
        var panelw = $(this).dialog('option', 'editor_widget');

        if (!panelw.safeRemove()) return;

        panelw.editor.selected_widget = null;
        $(this).dialog('option', 'editor_widget', null);

        $(this).dialog('close');
      },

      Cancel: function()
      {
        $(this).dialog('close');
      }

    },

    close: function()
    {
      var panelw = $(this).dialog('option', 'editor_widget');

      if (panelw)
      {
        panelw.$div.removeClass('selected');
        panelw.editor.selected_widget = null;
      }

      $(this).dialog('close');
      $(this).dialog('option', 'editor').disable_edit_keys = false;
    }

  });


  var h_pos = ['left', 'center', 'right'];
  var v_pos = ['top', 'middle', 'bottom'];

  var otito = new Otito({}, {
    width: { _type: 'text' },
    width_units: {
      _type: 'list',
      use: ['px', '%'],
      _sortFn: null,
      _reverse: true,
      _headless: true,
      _variant: 'fdsfds'
    },

    height: { _type: 'text' },
    height_units: {
      _type: 'list',
      use: ['px', '%'],
      _sortFn: null,
      _reverse: true,
      _headless: true,
      _variant: 'fdsfds'
    },

    anchor_align: {
      _type: 'list',
      // className: 'anchor_align'
      use: ['top', 'middle', 'bottom', 'left', 'center', 'right'],
      _sortFn: null,
      _reverse: true,
      _filter: function(key, label){
        var w = $('#dialog-panel').dialog('option', 'editor_widget');
        if (!w) return false;

        if (w.in_side == 'left' || w.in_side == 'right')
          return (v_pos.indexOf(key) >= 0);

        if (w.in_side == 'top' || w.in_side == 'bottom')
          return (h_pos.indexOf(key) >= 0);

        return false;
      }
    },
    align: { _type: 'text', className: 'align_custom' },
    as_margin: { _type: 'bool' },
    'id': { _type: 'text' },
    'class': { _type: 'text' },
    data_click: { _type: 'text' },
    data_var: { _type: 'text' },
    bg_image: { _type: 'text', className: 'bg_image' }
  });

  otito.append($('#panel-basic')[0]);
  window.parent.MightyEditor.ui.improveOtito(otito);


  uieditor.PanelWidget.otito = otito;

  uieditor.Widget.otitoInitForm(otito, {});
  uieditor.PanelWidget.otitoInitForm(otito, wrap);


  var otito2 = new Otito({}, {
    html: { _type: 'textarea', rows: 7 }
  });

  otito2.append($('#panel-html')[0]);
  uieditor.PanelWidget.html_otito = otito2;
};

uieditor.PanelWidget.otitoInitForm = function(otito, wrap)
{
  var parent2 = $('input.align_custom', otito.html).removeClass('align_custom').parent().parent()[0];
  $('div.input', parent2).hide();
  $(parent2).addClass('align_custom');

  $('#align_custom > *').clone().appendTo(parent2);

  $('.box', parent2).click(function()
  {
    $('.box.active', parent2).removeClass('active');
    $(this).addClass('active');

    var $inp = $('input[type=text]', parent2);
    $inp[0].setValue($(this).data('pos'));
    $inp.trigger('change');

    return false;
  });

  var parent3 = $('input.bg_image', otito.html).removeClass('bg_image').parent().parent()[0];
  $('div.input', parent3).hide();
  $(parent3).addClass('bg_image');

  $('#uploader > *').clone().appendTo(parent3);

  $('.remove-bg', otito.html).click(function()
  {
    var params = {
      project: parent.MightyEditor.activeProject,
      path: 'src/templates/' + parent.MightyEditor.plugins.UI.item0.normal_name + '/' + $('input[type=text]', parent3)[0].value
    };

    parent.MightyEditor.load.action('uiRemoveFile', params, function(data){
      var $inp = $('input[type=text]', parent3);
      $inp[0].setValue('');
      $inp.trigger('change');

      $('.bg_image_preview', otito.html).hide();
    });

    return false;
  });

  var uploader = new parent.qq.FileUploader({
    element: $('.upload', otito.html)[0],
    allowedExtensions: parent.cfg.imageExtensions,
    action: parent.cfg.uploadFile,
    buttonText: 'Upload',
    multiple: false,
    params: {
      project: parent.MightyEditor.activeProject,
      action: "uploadBg",
      template_name: parent.MightyEditor.plugins.UI.item0.name
    },

    onComplete: function(a,b,params){
      if(!params){return;}

      $('.upload', otito.html).hide();

      var $inp = $('input[type=text]', parent3);
      $inp[0].setValue(params.file);
      $inp.trigger('change');

      uploader._options.params.prev_bg_image = params.file;

      var path = '/' + parent.MightyEditor.activeProject + '/' + params.path;
      $('.bg_image_preview img', otito.html).attr('src', path);
      $('.bg_image_preview', otito.html).show();
    }
  });

  $(wrap).dialog('option', 'uploader', uploader);

};