"use strict";


uieditor.ButtonWidget = uieditor.Widget.extend({

  init: function(editor)
  {
    this.type = 'button';
    this._super(editor);

    this.options = {
      css: {},
      label: 'Button',
      class: '',
      data_click: '',
      data_var: ''
    };

    if (!uieditor.ButtonWidget.dialog_inited)
    {
      uieditor.ButtonWidget.initDialog();
      uieditor.ButtonWidget.dialog_inited = true;
    }

  },

  onAdd: function()
  {

  },

  createHTML: function()
  {
    return '<button id="'+this.id+'" class="widget button">'+ this.options.label + '</button>';
  },

  updateDiv: function()
  {
    var w = this;
    var css_props = {};

    this.updateDivCSS(css_props);

    this.$div.html(this.options.label);
    //$('> .wrap', this.$div).html('<button id="'+this.id+'">'+ this.options.label + '</button>');

  },

  safeRemove: function(keep_div)
  {
    if (!confirm('Are you sure you want to delete this widget?')) return false;

    return this._super(keep_div);
  }

});


uieditor.ButtonWidget.dialog_inited = false;
uieditor.ButtonWidget.initDialog = function()
{
  $('#tabs-button').tabs();
  uieditor.Widget.initStylesTab(this, '#button-styles');

  $('#dialog-button').dialog({
    autoOpen: false,
    width: 350,
    height: 500,
    title: 'Button options',
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
      var w = $(this).dialog('option', 'editor_widget');

      if (w)
      {
        w.$div.removeClass('selected');
        w.editor.selected_widget = null;
      }

      $(this).dialog('close');
      $(this).dialog('option', 'editor').disable_edit_keys = false;
    }

  });


  var otito = new Otito({}, {
    label: { _type: 'text' },
    'id': { _type: 'text' },
    'class': { _type: 'text' },
    data_click: { _type: 'text' },
    data_var: { _type: 'text' }
  });

  otito.append($('#button-basic')[0]);
  uieditor.ButtonWidget.otito = otito;

  uieditor.Widget.otitoInitForm(otito, {
    copy_option_value: true
  });

};
