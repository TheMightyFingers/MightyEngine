"use strict";


/*
todo:


- guardian shop sataisīt funkcionālu
  * pamēģināt itemus dizainot kā atsevišķus widgetus, kurus runtimā var iespraust esošā templeitā

----------
- paneļu resize handles
- source editors priekš custom.css / custom.js
- bug: pozicionēšana + auto dimensijas dažos gadījumos nestrādā
  * centra koordinatu nevar izrēķināt, ja parent dimensija ir auto
  * uzliku, lai koord = 0, bet tas nepalīdz gadījumos, kad parentu iestiepj kāds cits, platāks elements, tad centra koord paliek 0, lai gan jābūt iecentrētai - pagaidām šīs gļuks var palikt
  * nepalidz ari tad, ja childs ir shauraks par parentu

- right click menu nedarbojas
- pārtaisīt no id-atribūtiem uz data-id, līdz ar to rodas iespēja dot elementiem savus custom id
- editora UI CSS kļūdas
- frontent merge ar Templates.js
  - savietot ar cocoon
    - CSS samergot (menu problemas)
    - uz cocoon template load problema
- preview turpat workspace laukuma vietā
- pie deploy ielinkot CSS un JS failus (izdarīs Kaspars)
- z-index problēma,kad atvērts UI Editor un atveras Deploy dialogs,tam jabut pa virsu
* (kautkad vēlāk) defaultais elementu izskats (+defaultā klase - ja nevajag - noņemj)

--------------



cut/copy/paste:
* iespēja funkciju izmantot uz root paneli
* iespēja dragot non-paneļus blakus paneļiem - ieliekot šo widgetu iekš auto-sized wrap paneļa
* tiem css propertijiem, kuriem ir jāievada mērvienības, sataisīt, lai defaultā, ja nav norādīta, tad uztver kā px
* bug: ja konteinerim ir auto-height un ir label, kas to iestiepj, tad cits panelis,kas ir blakus labelim, ar height 100% un ieselektēts kā margin, nezīmējas kā as_margin - tagad varetu but,ka darbojas,jo as_margin iepriekš renderējās kā atsevišķs canvas, bet tagad ir vnk css background.
* multiple iezimešana + dzēšana - vai darbojas ? -nedarbojas -errors - prasīt Kasparam

* bug: ja ieliekam centrā paneli ar auto width, kuram iekšā viens iekš otra vairāki citi auto-width divi, tad šim te parentam nekorekti uzstādas width.
  * uz auto height tas pats
  * kad ir nobrukušas pozīcijas, tad pie katra nākamā setPositions, tās pamazām sakārtojas (turot nospiestu Shift, braukāt ar peli pāri)
  * saistīts ar centrēšanu + auto dimensions
  * novērots gan editorā, gan frontendā
*/


uieditor.Editor = Class.extend({

  $workarea: null,
  selected_widget: null,
  root_panel: null,

  debug: true,
  canvas: null,
  ctx: null,

  mouse_down: false,
  mouse_widget: null,
  mouse_widget_parent: null,
  mouse_widget_next: null,
  mouse_widget_side: null,
  mouse_widget_anchor: null,
  mouse_x_dif: 0,
  mouse_y_dif: 0,
  mouse_x0: 0,
  mouse_y0: 0,
  mouse_dragged: false,

  widget_counter: 0,
  scrollbar_width: 0,

  overlay_canvas: null,
  overlay_ctx: null,
  corner_img: null,
  resize_handles: null,

  init: function()
  {
    var self = this;

    // find scroll bar width
    var wide_scroll_html = '<div id="wide_scroll_div_one" style="width:50px;height:50px;overflow-y:scroll;position:absolute;top:-200px;left:-200px;"><div id="wide_scroll_div_two" style="height:100px;width:100%"></div></div>';
    $("body").append(wide_scroll_html); // Append our div and add the hmtl to your document for calculations
    var scroll_w1 = $("#wide_scroll_div_one").width(); // Getting the width of the surrounding(parent) div - we already know it is 50px since we styled it but just to make sure.
    var scroll_w2 = $("#wide_scroll_div_two").innerWidth(); // Find the inner width of the inner(child) div.
    $("#wide_scroll_div_one").remove(); // remove the html from your document
    this.scrollbar_width = scroll_w1 - scroll_w2; // subtract the difference

    var img = document.createElement('image');
    $(img).on('load', function(e)
    {
      self.corner_img = e.target;
    });
    $(img).attr('src', '/js/plugins/ui/img/corner.png');

    this.$workarea = $('#workarea');
    this.root_panel = new uieditor.PanelWidget(this, this.$workarea[0]);
    this.root_panel.options.width = '';
    this.root_panel.options.height = '';

    $(function()
    {
/*
      var input2 = new Otito({}, {
        template: {
          _type: 'list',
          use: {'px':'px', '%':'%'},
          _head: 'Custom widget'
        }
      });

      input.append($('#ws-wrap')[0]);
      window.parent.MightyEditor.ui.improveOtito(input);
  */
/*
      var canvas = $('<canvas style="width:100%; height:100%"/>').appendTo('#workarea .wrap')[0];
      canvas.width = $(canvas).width();
      canvas.height = $(canvas).height();

      self.canvas = canvas;
      self.ctx = canvas.getContext('2d');
*/
      $('#widgets .widget-btn').draggable({
        revert: 'invalid',
        helper: 'clone',

        drag: function(e, ui)
        {
          var root_pos = $('#workarea').offset();

          var x = e.clientX - root_pos.left;
          var y = e.clientY - root_pos.top;

          if (x < 0 || y < 0) return;

          var classes = $(this).attr('class').split(' ');
          var type = null;
          for (var i=0; i<classes.length; i++)
          {
            if (classes[i].substr(0, 2) == 'w-')
            {
              type = classes[i].substr(2);
              break;
            }
          }

          self.findDropPlace(type, e.clientX, e.clientY);
        }

      });

      $('#workarea').droppable({
        accept: '.widget-btn',

        drop: function(e, ui)
        {
          var classes = ui.draggable.attr('class').split(' ');

          for (var i=0; i<classes.length; i++)
          {
            if (classes[i].substr(0, 2) == 'w-')
            {
              var options = {};
              var type = classes[i].substr(2);

              if (type == 'subtemplate')
                options['id'] = ui.draggable.data('id');

              self.dropWidget(type, options);
              self.redrawEditArea();
              break;
            }
          }
        }

      });

      $(window).resize(function()
      {
/*
        if (canvas)
        {
          canvas.width = $(canvas).width();
          canvas.height = $(canvas).height();
        }
*/
        self.redrawEditArea();
      });

      $('#workarea').mousedown(function(e)
      {
        self.mouseDown(e);
      });

      $(window).mouseup(function(e)
      {
        self.mouseUp(e);
      });

      $(window).mousemove(function(e)
      {
        self.mouseMove(e);
      });

      $(window).keydown(function(e)
      {
        self.keyDown(e);
      });

      $(window).keyup(function(e)
      {
        self.keyUp(e);
      });

      var widgets = {'Custom widget:':0};
      for (var id in parent.MightyEditor.plugins.UI.all_items){
        var item = parent.MightyEditor.plugins.UI.all_items[id];
        if (item.type != 'widget') continue;

        widgets[item.name] = item.id;
      }

      var input = new Otito(null, {
        custom_widget: {
          _type: 'list',
          use: widgets,
          _headless: true,
          onchange: function()
          {
            var id = input.object.custom_widget;
            var $el = $('span.w-subtemplate');
            $el.toggle(id > 0);
            if (id == 0) return;

            $el.data('id', id).html($('option[value='+id+']', this).html());
          }
        }

      });

      input.append($('#ws-wrap')[0]);
      window.parent.MightyEditor.ui.improveOtito(input);

      $('#top-right input').on('change', function()
      {
        if (this.checked)
        {
          self.generateHtml(false, function(data)
          {
            var ui = parent.MightyEditor.ui;

            var p = ui.content.plugins.Map.basePath.split('/');
            p.pop();

            var html_path = p.join('/') + '/' + data.html_path;
            // console.log('p=', html_path);

            $('#widgets').hide();
            $('#preview-wrap iframe', parent.document).attr('src', html_path);
            $('#preview-wrap', parent.document).show();
            $('#uieditor-overlay').hide();
          });
        }
        else
        {
          $('#widgets').show();
          $('#preview-wrap', parent.document).hide();
          $('#uieditor-overlay').show();
        }
      });


      var canvas = $('#uieditor-overlay')[0];
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      self.overlay_canvas = canvas;

      var ctx = canvas.getContext('2d');
      self.overlay_ctx = ctx;

      $(window).on('resize', function()
      {
        var canvas = self.overlay_canvas;
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        self.redrawEditArea(true);
      });

      var ctx_w = null;

      $('body').contextmenu({
        delegate: '.widget',
        customDefaultControl: true,

        beforeOpen: function(e, ui)
        {
          if (ui.event0.shiftKey)
          {
            return false;
          }

          ui.event0.preventDefault();

          var wpos = $('#workarea').offset();
          ctx_w = self.root_panel.getChildAt(e.clientX, e.clientY, true);
          if (!ctx_w) return false;

          return true;
        },
        menu: [
          {title: "Options", cmd: "options"},
          {title: "Cut", cmd: "cut"},
          {title: "Copy", cmd: "copy"},
          {title: "Paste", cmd: "paste"},
          {title: "Delete", cmd: "delete"}
        ],
        select: function(e, ui)
        {
          if (!ctx_w) return;

          switch (ui.cmd)
          {
            case 'options':
              self.openOptionsDialog(ctx_w);
              break;

            case 'cut':
              if (ctx_w == self.root_panel)
              {
                alert('Can\'t delete root panel!');
                return;
              }

              if (ctx_w.is_panel && !ctx_w.canBeMoved())
              {
                alert('Can\'t delete panel in-between others! Remove end panels first.');
                return;
              }

              self.mouse_widget_parent = ctx_w.parent;
              self.mouse_widget_next = ctx_w.parent.children[ctx_w.parent.children.indexOf(ctx_w) + 1];
              self.mouse_widget_side = ctx_w.is_panel ? ctx_w.in_side : null;
              self.mouse_widget_anchor = (ctx_w.is_panel && ctx_w.in_side) ? ctx_w[ctx_w.in_side] : null;

              ctx_w.remove(true);
              ctx_w.$div.hide();
              self.mouse_widget_parent.updateDiv();

              self.redrawEditArea();

              parent.MightyEditor.ui.clipboard_w = ctx_w;
              parent.MightyEditor.ui.clipboard_cut = true;
              break;

            case 'copy':
              parent.MightyEditor.ui.clipboard_w = ctx_w;
              parent.MightyEditor.ui.clipboard_cut = false;
              break;

            case 'paste':
              var src_dest_map = {};

              var cloneChildren = function(dest_w, src_w)
              {
                for (var i=0; i<src_w.children.length; i++)
                {
                  var ch = src_w.children[i];
                  var nch = self.createWidget(ch.type);
                  nch.options = $.extend(nch.options, ch.options);

                  var opts = {};

                  if (nch.is_panel)
                    opts.dont_link = true;

                  dest_w.addChild(nch, opts);

                  if (nch.is_panel)
                  {
                    nch.is_first = ch.is_first;
                    nch.in_side = ch.in_side;

                    src_dest_map[ch.id] = {
                      dest: nch,
                      left: ch.left ? ch.left.id : null,
                      right: ch.right ? ch.right.id : null,
                      top: ch.top ? ch.top.id : null,
                      bottom: ch.bottom ? ch.bottom.id : null,
                    };

                    cloneChildren(nch, ch);
                  }
                }
              }

              var clipboard_w = parent.MightyEditor.ui.clipboard_w;
              var clipboard_cut = parent.MightyEditor.ui.clipboard_cut;

              if (clipboard_w)
              {
                if (clipboard_cut)
                {
                  clipboard_w.$div.show();
                  self.addWidget(ctx_w, clipboard_w);
                }
                else if (!clipboard_cut)
                {
                  var nw = self.createWidget(clipboard_w.type);
                  nw.options = $.extend(nw.options, clipboard_w.options);
                  if (self.addWidget(ctx_w, nw))
                  {
                    if (nw.is_panel)
                    {
                      cloneChildren(nw, clipboard_w);

                      for (var id in src_dest_map)
                      {
                        var item = src_dest_map[id];

                        item.dest.left = item.left ? src_dest_map[item.left].dest : null;
                        item.dest.right = item.right ? src_dest_map[item.right].dest : null;
                        item.dest.top = item.top ? src_dest_map[item.top].dest : null;
                        item.dest.bottom = item.bottom ? src_dest_map[item.bottom].dest : null;
                      }
                    }
                  }
                }

                self.redrawEditArea();
              }

              break;

            case 'delete':
              if (ctx_w == self.root_panel)
              {
                alert('Can\'t delete root panel!');
                return;
              }

              ctx_w.safeRemove();
              self.redrawEditArea();
              break;
          }

        }
      });

      $('#top-right .edit-js').on('click', function()
      {
        parent.MightyEditor.plugins.UI.openSourceEditor("../../projects" + self.getTemplateBaseURL() + '/' + self.getTemplateName() + '.js');
      });

      $('#top-right .edit-css').on('click', function()
      {
        parent.MightyEditor.plugins.UI.openSourceEditor("../../projects" + self.getTemplateBaseURL() + '/' + self.getTemplateName() + '.css');
      });

    });
  },

  getPopupHTML: function(title)
  {
    return ''+
      '<div class="map_layers">'+
      '<div class="ml_title">'+
      '<span>'+title+'</span>'+
      '<a href="#" class="ui-dialog-titlebar-close ui-corner-all" role="button"><span class="ui-icon ui-icon-closethick">close</span></a>'+
      '</div>'+
      '<div class="ml_items" style="top:30px">'+
      '<div class="ml_item_wrap"></div>'+
      '<div class="clear"></div>'+
      '</div>'+
      '</div>';
  },

  redrawEditArea: function(just_draw)
  {
    this.overlay_ctx.clearRect(0, 0, this.overlay_canvas.width, this.overlay_canvas.height);

    this.resize_handles = [];

    if (!just_draw) {
      this.root_panel.setChildrenPositions(true);
    }

    function drawChildren(list)
    {
      for (var i=0; i<list.length; i++)
      {
        if (list[i].is_panel)
        {
          list[i].draw();
          drawChildren(list[i].children);
        }
      }
    }
    drawChildren(this.root_panel.children);

    //console.log('npos=', this.npos);
  },

  getTemplateById: function(id)
  {
    return parent.MightyEditor.plugins.UI.all_items[id];
  },

  openOptionsDialog: function(w)
  {
    var self = w;
    var $div = w.$div;
/*
    if (w.is_panel)
    {
      var ch = w.getChildAt(e.clientX, e.clientY);
      if (ch)
        return;

    }
*/

    if (self.editor.selected_widget)
      self.editor.selected_widget.$div.removeClass('selected');

    self.editor.selected_widget = self;
    $div.addClass('selected');

    var o = w.getClass().otito;

    if (o)
    {
      uieditor.Widget.setOtitoValues(o, w.options);

    }

    uieditor.Widget.setOtitoValues(w.getClass().css_otito, w.options.css);

    if (w.is_panel) {
      uieditor.Widget.setOtitoValues(w.getClass().html_otito, w.options);
    }

    $('#dialog-'+ w.type+' .ui-tabs').tabs('option', 'active', 0);
    $('#dialog-'+ w.type)
        .dialog('option', 'editor_widget', w)
        .dialog('option', 'editor', w.editor);

    uieditor.PanelWidget.otito.refresh();

    if (w.is_panel)
      uieditor.PanelWidget.otitoInitForm(o);


    if (w.is_panel)
    {
      var wrap = '#dialog-'+ w.type;
      $('.align_custom', wrap).toggle(w.numOutLinks() == 0);
      $('.qq-upload-list', wrap).hide();

      if (w.options.bg_image != '')
      {
        $('.bg_image_preview img', wrap).attr('src', self.editor.getTemplateBaseURL() + '/' + w.options.bg_image);
        $('.bg_image_preview', wrap).show();
      }
      else
        $('.bg_image_preview', wrap).hide();

      $(wrap).dialog('option', 'uploader')._options.params.prev_bg_image = w.options.bg_image;

      $('.align_custom .box.active', wrap).removeClass('active');
      $('.align_custom .box[data-pos='+ w.options.align+']', wrap).addClass('active');


      $('.anchor_align', wrap).toggle(w.in_side != null);
      $('.anchor_align > .anchor_align_x', wrap).toggle(w.in_side == 'left' || w.in_side == 'right');
      $('.anchor_align > .anchor_align_y', wrap).toggle(w.in_side == 'top' || w.in_side == 'bottom');

      if (w.in_side == 'left' || w.in_side == 'right')
      {
        var align = w.options.anchor_align;
        if (['top', 'middle', 'bottom'].indexOf(align) == -1) align = 'top';

        $('.anchor_align select[name=anchor_align_x]', wrap).val(align);

        var $inp = $('.anchor_align input', wrap);
        //$inp[0].setValue(align);
        //$inp.trigger('change');
      }
      else if (w.in_side == 'top' || w.in_side == 'bottom')
      {
        var align = w.options.anchor_align;
        if (['left', 'center', 'right'].indexOf(align) == -1) align = 'left';

        $('.anchor_align select[name=anchor_align_y]', wrap).val(align);

        var $inp = $('.anchor_align input', wrap)
        //$inp[0].setValue(align)
        //$inp.trigger('change');
      }

    }

    self.editor.disable_edit_keys = true;


    $('#dialog-'+ w.type).dialog('open');


  },

  drag_resize: false,
  panel_w0: null,
  panel_h0: null,

  mouseDown: function(e)
  {
    if (e.button != 0) return;

    var wpos = $('#workarea').offset();
    var cx = e.clientX - wpos.left;
    var cy = e.clientY - wpos.top;

    if (this.active_resize_handle !== null)
    {
      var rh = this.active_resize_handle;
      this.drag_resize = true;
      this.mouse_x0 = cx;
      this.mouse_y0 = cy;

      this.panel_w0 = rh.w.$div[0].offsetWidth;
      this.panel_h0 = rh.w.$div[0].offsetHeight;
      return;
    }

    if (this.active_resize_edge !== null)
    {
      this.drag_resize = true;
      this.mouse_x0 = cx;
      this.mouse_y0 = cy;

      this.panel_w0 = this.active_resize_edge.w.$div[0].offsetWidth;
      this.panel_h0 = this.active_resize_edge.w.$div[0].offsetHeight;
      return;
    }

    var self = this;
    self.mouse_widget = self.root_panel.getChildAt(e.clientX, e.clientY, true);
    if (!self.mouse_widget) return;

    var parents = self.mouse_widget.getParents();
    parents.push(self.mouse_widget);

    for (var i=0; i<parents.length; i++)
    {
      var div = parents[i].is_panel ? $('> .wrap', parents[i].$div)[0] : parents[i].$div[0];
      var o = parents[i].$div.offset();

      var has_vert_scrollbar = (div.scrollHeight > div.clientHeight);
      if (has_vert_scrollbar)
      {
        var scroll_x2 = o.left + parents[i].$div.width();
        var scroll_x1 = scroll_x2 - self.scrollbar_width - 2;

        if (e.clientX >= scroll_x1 && e.clientX < scroll_x2)
        {
          self.mouse_widget = null;
          self.mouse_down = false;
          return;
        }
      }

      var has_horiz_scrollbar = (div.scrollWidth > div.clientWidth);
      if (has_horiz_scrollbar)
      {
        var scroll_y2 = o.top + parents[i].$div.height();
        var scroll_y1 = scroll_y2 - self.scrollbar_width - 2;

        if (e.clientY >= scroll_y1 && e.clientY < scroll_y2)
        {
          self.mouse_widget = null;
          self.mouse_down = false;
          return;
        }
      }
    }

    self.mouse_down = true;

    var w_o = $('#workarea').offset();
    var o = self.mouse_widget.$div.offset();
    self.mouse_x_dif = o.left - e.clientX - w_o.left;
    self.mouse_y_dif = o.top - e.clientY - w_o.top;
    self.mouse_x0 = e.clientX;
    self.mouse_y0 = e.clientY;
    self.mouse_dragged = false;

  },

  mouseUp: function(e)
  {
    if (this.drag_resize)
    {
      this.drag_resize = false;
      this.active_resize_handle = null;
      this.active_resize_edge = null;

      if (this.resizable_edges) {
        this.findResizableEdges();
      }

      return;
    }

    var self = this;

    var redraw = false
    if (self.mouse_widget && self.mouse_dragged)
    {
      self.dropWidget(self.mouse_widget);
      redraw = true;

      self.mouse_widget_parent = null;
      self.mouse_widget_next = null;
      self.mouse_widget_side = null;
      self.mouse_widget_anchor = null;
    }

    self.mouse_down = false;
    self.mouse_widget = null;
    self.mouse_dragged = false;

    if (redraw)
      self.redrawEditArea();

  },

  active_resize_handle: null,
  active_resize_edge: null,

  mouse_x: 0,
  mouse_y: 0,

  mouseMove: function(e)
  {
    var wpos = $('#workarea').offset();
    var cx = this.mouse_x = e.clientX - wpos.left;
    var cy = this.mouse_y = e.clientY - wpos.top;

    if (this.drag_resize)
    {
      var dif_x = cx - this.mouse_x0;
      var dif_y = cy - this.mouse_y0;
      var w = this.active_resize_handle ? this.active_resize_handle.w : this.active_resize_edge.w;
      var dir = this.active_resize_handle ? this.active_resize_handle.c : this.active_resize_edge.e;

      if ((!w.is_first && w.options.anchor_align == 'center') ||
          (w.is_first && ['center_top', 'middle', 'center_bottom'].indexOf(w.options.align) >= 0)
          ) {
        dif_x *= 2;
      }

      if ((!w.is_first && w.options.anchor_align == 'middle') ||
          (w.is_first && ['left_middle', 'middle', 'right_middle'].indexOf(w.options.align) >= 0)
          ) {
        dif_y *= 2;
      }

      var changes = 0;
      switch (dir)
      {
        case 'left':
          w.options.width = this.panel_w0 - dif_x;
          changes = 1;
          break;

        case 'right':
          w.options.width = this.panel_w0 + dif_x;
          changes = 1;
          break;

        case 'top':
          w.options.height = this.panel_h0 - dif_y;
          changes = 2;
          break;

        case 'bottom':
          w.options.height = this.panel_h0 + dif_y;
          changes = 2;
          break;

        case 'se':
          w.options.width = this.panel_w0 + dif_x;
          w.options.height = this.panel_h0 + dif_y;
          changes = 3;
          break;

        case 'ne':
          w.options.width = this.panel_w0 + dif_x;
          w.options.height = this.panel_h0 - dif_y;
          changes = 3;
          break;

        case 'sw':
          w.options.width = this.panel_w0 - dif_x;
          w.options.height = this.panel_h0 + dif_y;
          changes = 3;
          break;

        case 'nw':
          w.options.width = this.panel_w0 - dif_x;
          w.options.height = this.panel_h0 - dif_y;
          changes = 3;
          break;
      }

      if (w.options.width < 10) {
        w.options.width = 10;
      }

      if (w.options.height < 10) {
        w.options.height = 10;
      }

      if ((changes & 1) && w.options.width_units == '%') {
        w.options.width = (w.options.width / w.parent.$div[0].offsetWidth) * 100;
      }

      if ((changes & 2) && w.options.height_units == '%') {
        w.options.height = (w.options.height / w.parent.$div[0].offsetHeight) * 100;
      }

      w.updateDiv();
      this.redrawEditArea();
      return;
    }

    if (this.resizable_edges)
    {
      this.detectResizableEdge(cx, cy);
    }
    else
    {
      var cursor = '';

      if (this.resize_handles)
      {
        for (var i=0; i<this.resize_handles.length; i++)
        {
          var rh = this.resize_handles[i];

          if (cx >= rh.x && cy >= rh.y &&
              cx < (rh.x+this.corner_img.width) &&
              cy < (rh.y+this.corner_img.height)
              )
          {
            cursor = rh.c + '-resize';
            this.active_resize_handle = rh;
            break;
          }
        }
      }

      if (document.body.style.cursor != cursor) {
        document.body.style.cursor = cursor;
        if (cursor == '') {
          this.active_resize_handle = null;
        }
      }
    }

    var self = this;
    var cursor_x = e.clientX;
    var cursor_y = e.clientY;
    var mw = self.mouse_widget;

    if (mw)
    {
      var xd = e.clientX - self.mouse_x0;
      var yd = e.clientY - self.mouse_y0;

      if ((xd*xd + yd*yd) > 30*30)
      {
        if (!self.mouse_dragged)
        {
          if (mw.is_panel && mw.numOutLinks() > 0)
          {
            alert('Can\'t drag panel in-between others! Drag end panels first.');
            self.mouse_widget = null;
            self.mouse_down = false;
            return;
          }

          self.mouse_widget_parent = mw.parent;
          self.mouse_widget_next = mw.parent.children[mw.parent.children.indexOf(mw) + 1];

          self.mouse_widget_side = mw.is_panel ? mw.in_side : null;
          self.mouse_widget_anchor = (mw.is_panel && mw.in_side) ? mw[mw.in_side] : null;

          mw.remove(true);
          self.mouse_widget_parent.updateDiv();

          self.redrawEditArea();

          mw.$div.appendTo('#workarea > .wrap');
          self.mouse_dragged = true;
        }

        cursor_x = e.clientX + self.mouse_x_dif;
        cursor_y = e.clientY + self.mouse_y_dif;
        /*
         var ctx = self.ctx;
         ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);

         ctx.beginPath();
         ctx.arc(cursor_x, cursor_y, 3, 0, 2 * Math.PI);
         ctx.fillStyle = 'red';
         ctx.fill();
         */
        /*
         var ch = self.root_panel.getChildAt(x, y, true);
         if (ch)
         ch.$div.addClass('over');
         */
        mw.$div.css({
          position: 'absolute',
          left: cursor_x + 'px',
          top: cursor_y + 'px',
          right: 'auto',
          bottom: 'auto'
        });

        self.findDropPlace(mw.type, e.clientX, e.clientY);
      }

      //return;
    }


    var ch = self.root_panel.getChildAt(e.clientX, e.clientY, true);

    if (self.widget_over && self.widget_over != ch)
    {
      if (self.widget_over.$div)
        self.widget_over.$div.removeClass('over');

      self.widget_over = ch;
      self.redrawEditArea(true);
    }
    else if (!self.widget_over && ch) {
      self.widget_over = ch;
      self.redrawEditArea(true);
    }

    if (ch)
    {
      ch.$div.addClass('over');
    }

  },

  detectResizableEdge: function(cx, cy)
  {
    var w = 6;
    var cursor = '';

    for (var i=0; i<this.resizable_edges.length; i++)
    {
      var e = this.resizable_edges[i];

      var ra = null;
      var rb = null;
      var rc = '';

      if (e.e == 'left' || e.e == 'right')
      {
        ra = { x: e.a.x - w, y: e.a.y };
        rb = { x: e.a.x + w, y: e.b.y };
      }
      else  // top || bottom
      {
        ra = { x: e.a.x, y: e.a.y - w };
        rb = { x: e.b.x, y: e.a.y + w };
      }

      if (cx >= ra.x && cx < rb.x && cy >= ra.y && cy < rb.y)
      {
        cursor = { left: 'w', right: 'e', top: 'n', bottom: 's' }[e.e] + '-resize';
        this.active_resize_edge = e;
        break;
      }
    }

    document.body.style.cursor = cursor;

    if (cursor == '') {
      this.active_resize_edge = null;
    }
  },

  isNumber: function(n)
  {
    return !isNaN(parseFloat(n)) && isFinite(n);
  },

  disable_edit_keys: false,
  resizable_edges: null,

  keyDown: function(e)
  {
    if (this.disable_edit_keys)
    {
      return;
    }

    var self = this;
    var w = self.widget_over;

    switch (e.keyCode)
    {
      case 38: // up
        if (w && w.is_panel)
        {
          e.preventDefault();

          var is_perc = (w.options.height_units == '%');
          var min = is_perc ? 1 : 20;
          var step = is_perc ? 1 : 20;

          var h = parseInt(w.options.height) - step;
          if (h < min)
            h = min;

          w.options.height = h;
          w.updateDiv();
          this.redrawEditArea();
        }
        break;

      case 40: // down
        if (w && w.is_panel)
        {
          e.preventDefault();

          var is_perc = (w.options.height_units == '%');
          var step = is_perc ? 1 : 20;

          w.options.height = parseInt(w.options.height) + step;
          w.updateDiv();
          this.redrawEditArea();
        }
        break;

      case 37: // left
        if (w && w.is_panel)
        {
          e.preventDefault();

          var is_perc = (w.options.width_units == '%');
          var min = is_perc ? 1 : 20;
          var step = is_perc ? 1 : 20;

          var h = parseInt(w.options.width) - step;
          if (h < min)
            h = min;

          w.options.width = h;
          w.updateDiv();
          this.redrawEditArea();
        }
        break;

      case 39: // right
        if (w && w.is_panel)
        {
          e.preventDefault();

          var is_perc = (w.options.width_units == '%');
          var step = is_perc ? 1 : 20;

          w.options.width = parseInt(w.options.width) + step;
          w.updateDiv();
          this.redrawEditArea();
        }
        break;

      case 16: // shift
        self.findResizableEdges();
        self.redrawEditArea();
        self.detectResizableEdge(self.mouse_x, self.mouse_y);
        break;
    }
  },

  findResizableEdges: function()
  {
    var self = this;
    var w_ofs = $('#workarea').offset();

    function addResizableEdges(list)
    {
      for (var i=0; i<list.length; i++)
      {
        if (!list[i].is_panel) continue;

        var edges = list[i].getResizableEdges();

        for (var j=0; j<edges.length; j++)
        {
          var a = {};
          var b = {};
          var div = list[i].$div[0];
          var ofs = list[i].$div.offset();
          ofs.left -= w_ofs.left;
          ofs.top -= w_ofs.top;

          switch (edges[j])
          {
            case 'left':
              a.x = ofs.left;
              a.y = ofs.top;
              b.x = ofs.left;
              b.y = ofs.top + div.offsetHeight;
              break;

            case 'right':
              a.x = ofs.left + div.offsetWidth;
              a.y = ofs.top;
              b.x = ofs.left + div.offsetWidth;
              b.y = ofs.top + div.offsetHeight;
              break;

            case 'top':
              a.x = ofs.left;
              a.y = ofs.top;
              b.x = ofs.left + div.offsetWidth;
              b.y = ofs.top;
              break;

            case 'bottom':
              a.x = ofs.left;
              a.y = ofs.top + div.offsetHeight;
              b.x = ofs.left + div.offsetWidth;
              b.y = ofs.top + div.offsetHeight;
              break;
          }

          self.resizable_edges.push({
            e: edges[j],
            w: list[i],
            a: a,
            b: b
          });
        }

        addResizableEdges(list[i].children);
      }
    }

    this.resizable_edges = [];

    addResizableEdges(this.root_panel.children);
  },

  keyUp: function(e)
  {
    switch (e.keyCode)
    {
      case 16: // shift
        document.body.style.cursor = 'default';
        this.resizable_edges = null;
        this.redrawEditArea();
        break;
    }
  },

  findDropPlace: function(type, x, y)
  {
    var self = this;

    if (self.nearest_edge)
      self.nearest_edge.w.$div.removeClass('near_left near_right near_top near_bottom');

    var ch = self.root_panel.getChildAt(x, y, true);

    self.over_widget = ch ? ch : self.root_panel;

    if (type == 'panel' || type == 'subtemplate')
      self.nearest_edge = self.over_widget.is_panel ? self.over_widget.findNearestEdge(x, y) : null;
    else
      self.nearest_edge = null;

    if (self.nearest_edge)
      self.nearest_edge.w.$div.addClass('near_'+self.nearest_edge.dir);

  },

  dropWidget: function(w, options)
  {
    if (typeof options == 'undefined') options = {};

    var self = this;

    if (self.nearest_edge)
      self.nearest_edge.w.$div.removeClass('near_left near_right near_top near_bottom');

    if (typeof w == 'string')
      w = self.createWidget(w);

    if (typeof w.subtemplate_id != 'undefined' && typeof options.id != 'undefined')
      w.subtemplate_id = options.id;

    if (self.nearest_edge)
    {
      self.nearest_edge.w.parent.addChild(w, {
        anchor_w: self.nearest_edge.w,
        anchor_edge: self.nearest_edge.dir
      });
    }
    else if (self.over_widget)
    {
      self.addWidget(self.over_widget, w);
    }
    else
      self.root_panel.addChild(w);

    self.nearest_edge = null;
    self.redrawEditArea();
  },

  addWidget: function(parent, w)
  {
    var parent0 = parent;

    if (!parent.is_panel)
      parent = parent.parent;

    var self = this;

    var num_panels = 0;
    var num_non_panels = 0;
    for (var i=0; i<parent.children.length; i++)
    {
      if (parent.children[i].is_panel)
        num_panels++;
      else
        num_non_panels++;

    }

    if (w.is_panel && num_non_panels > 0)
    {
      alert('Parent panel contains other widget types than panels. You can add panels only near other panels on the same parent.');

      if (w.$div)
      {
        if (self.mouse_widget_parent)
        {
          if (self.mouse_widget_side)
          {
            var sides_inv = { left: 'right', right: 'left', top: 'bottom', bottom: 'top' };

            self.mouse_widget_parent.addChild(w, {
              anchor_edge: sides_inv[self.mouse_widget_side],
              anchor_w: self.mouse_widget_anchor
            });
          }
          else
          {
            self.mouse_widget_parent.addChild(w);
          }
        }
      }

      return false;
    }
    else if (!w.is_panel && num_panels > 0)
    {
      alert('Parent panel contains panels. You can add non-panels only near other non-panel widgets on the same parent.');

      if (w.$div)
      {
        w.$div.css('position', 'static');

        if (self.mouse_widget_parent)
        {
          if (self.mouse_widget_next)
          {
            self.mouse_widget_parent.addChild(w, {
              before: self.mouse_widget_next
            });
          }
          else
          {
            self.mouse_widget_parent.addChild(w);
          }
        }
      }

      return false;
    }
    else
    {
      var options = {};

      if (w.$div && !w.is_panel)
      {
        w.$div.css('position', 'static');

        if (!parent0.is_panel)
          options.before = parent0;

      }

      parent.addChild(w, options);

      return true;
    }
  },

  createWidget: function(type)
  {
    var classname = type.substr(0, 1).toUpperCase() + type.substr(1) + 'Widget';

    if (!uieditor[classname]) throw "Widget class not found: "+classname;

    return new uieditor[classname](this);
  },

  getData: function()
  {
    var data = [];

    function getChildren(list, panel)
    {
      for (var i=0; i<panel.children.length; i++)
      {
        var ch = panel.children[i];

        var item = {
          id: ch.id,
          type: ch.type,
          options: ch.options
        }

        if (ch.is_panel)
        {
          item.left = ch.left ? ch.left.id : null;
          item.right = ch.right ? ch.right.id : null;
          item.top = ch.top ? ch.top.id : null;
          item.bottom = ch.bottom ? ch.bottom.id : null;

          item.is_first = ch.is_first;
          item.in_side = ch.in_side;

          item.children = [];
          getChildren(item.children, ch);
        }

        list.push(item);
      }
    }

    getChildren(data, this.root_panel);

    return data;
  },

  loadData: function(data)
  {
    if (!data) return;

    this.widget_counter = 0;
    this.root_panel.loadChildren(data);
    this.redrawEditArea();
  },

  generateHtml: function(hide_custom_css, callback)
  {
    var data = $.extend({}, parent.MightyEditor.activeItem.object);

    data.objects = this.getData();
    data.hide_custom_css = hide_custom_css;
    data.use_tmp_folder = true;

    parent.MightyEditor.load.action('generateHtml', data, callback);
  },

  isPanelType: function(type)
  {
    return (type == 'panel' || type == 'subtemplate');
  },

  getTemplateName: function()
  {
    return parent.MightyEditor.plugins.UI.item0.normal_name;
  },

  getTemplateBaseURL: function()
  {
    var type = parent.MightyEditor.plugins.UI.item0.type;
    return '/' + parent.MightyEditor.activeProject + '/src/' + (type == 'widget' ? 'widgets' : 'templates') + '/' + this.getTemplateName();
  }


});
