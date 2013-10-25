"use strict";


uieditor.LabelWidget = uieditor.Widget.extend({

  init: function(editor)
  {
    this.type = 'label';
    this._super(editor);

    this.options = {
      css: {},
      text: 'Text',
      //text: "Label\nLabel\nLabel\nLabel\nLabel\nLabel\nLabel\nLabel\nLabel\nLabel\nLabel\nLabel\nLabel\nLabel\nLabel\nLabel\nLabel\nLabel\nLabel\nLabel\nLabel\n",
      align: '',
      class: '',
      data_click: '',
      data_var: ''
    };

    if (!uieditor.LabelWidget.dialog_inited)
    {
      uieditor.LabelWidget.initDialog();
      uieditor.LabelWidget.dialog_inited = true;
    }

  },

  onAdd: function()
  {

  },

  createHTML: function()
  {
    return '<div id="'+ this.id +'" class="widget label">' + this.nl2br(this.options.text) + '</div>';
  },

  updateDiv: function()
  {
    var w = this;
    var css_props = {};
    if (this.options.align != '')
      css_props['text-align'] = this.options.align;

    this.updateDivCSS(css_props);

    this.$div.html(this.nl2br(this.options.text));
  },

  nl2br: function(str, is_xhtml)
  {
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
  },

  safeRemove: function(keep_div)
  {
    if (!confirm('Are you sure you want to delete this widget?')) return false;

    return this._super(keep_div);
  }

});


uieditor.LabelWidget.dialog_inited = false;
uieditor.LabelWidget.initDialog = function()
{
  $('#tabs-label').tabs();
  uieditor.Widget.initStylesTab(this, '#label-styles');

  $('#dialog-label').dialog({
    autoOpen: false,
    width: 350,
    height: 500,
    title: 'Text options',
    buttons: {
      Update: function()
      {
        var w = $(this).dialog('option', 'editor_widget');

        uieditor.Widget.getOtitoValues(w.getClass().otito, w.options);

        w.options.css = {};
        uieditor.Widget.getOtitoValues(w.getClass().css_otito, w.options.css);

        w.updateDiv();

        w.$div.removeClass('selected');
        w.editor.selected_widget = null;
        w.editor.redrawEditArea();

        $(this).dialog('close');
      },

      Delete: function()
      {
        var w = $(this).dialog('option', 'editor_widget');

        if (!w.safeRemove()) return;

        w.editor.selected_widget = null;
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


  var otito = new Otito({}, {
    text: { _type: 'textarea', rows: 7 },
    align: {
      _type: 'list',
      use: ['', 'left', 'center', 'right', 'justify'],
      _sortFn: null,
      _reverse: true
    },
    'id': { _type: 'text' },
    'class': { _type: 'text' },
    data_click: { _type: 'text' },
    data_var: { _type: 'text' }
  });

  otito.append($('#label-basic')[0]);
  uieditor.LabelWidget.otito = otito;

  uieditor.Widget.otitoInitForm(otito, {
    copy_option_value: true
  });


};
