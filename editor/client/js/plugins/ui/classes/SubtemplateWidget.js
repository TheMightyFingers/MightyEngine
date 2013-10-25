"use strict";

uieditor.SubtemplateWidget = uieditor.PanelWidget.extend({

  subtemplate_id: 0,

  init: function(editor, custom_panel)
  {
    this._super(editor, custom_panel);

    this.options.width = '100';
    this.options.width_units = '%';
    this.options.height = 'auto';
  },

  onAdd: function()
  {
    if (this.subtemplate_id == 0) return;

    var tpl = this.editor.getTemplateById(this.subtemplate_id);
    this.loadChildren(tpl.objects, this.editor.widget_counter, {
      add_classes: true,
      class_prefix: tpl.normal_name + '-',
      subtemplate: tpl.normal_name
    });

    this.subtemplate_id = 0;
  }


});

