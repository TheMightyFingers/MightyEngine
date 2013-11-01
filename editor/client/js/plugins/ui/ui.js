"use strict";

Mighty.namespace("plugins");
Mighty(
  Mighty.plugins.UI = function(){
    this.core = 1;
  },
  {

  editor: null,

  action_widget: false,

  clipboard_w: null,
  clipboard_cut: false,

  register: function(){
    var that = this;

    this.menuItem = this.content.plugins.SideMenu.registerMenu({
      ui: {
        title: "UI Templates",
        action: "UI",
        click: function() {
          that.clickUI();
        },
        test2: {
          title: "UI Widgets",
          action: "UI",
          id: "UI-widgets",
          click: function() {
            that.clickWidget();
          }
        }

      }
    },10);

    this.setView = this.setViewReal;
  },

  clickUI: function(){
    this.clickFunc = this.clickUI;
    var that = this;
    var plugin = that.content.plugins[that.content.action];
    if(plugin && that.content.action !== that.name && plugin.deactivate !== void(0)){
      plugin.deactivate.call(plugin);
    }

    that.action_widget = false;
    //that.setViewReal();
    that.setView = that.setViewReal;
    that.content.setAction(that.name);
    return true;
  },

  clickWidget: function(){
    this.clickFunc = this.clickWidget;
    var that = this;
    var plugin = that.content.plugins[that.content.action];
    if(plugin && that.content.action !== that.name && plugin.deactivate !== void(0)){
      plugin.deactivate.call(plugin);
    }

    that.action_widget = true;
    //that.handleWidget();
    that.setView = that.handleWidget;
    that.content.setAction(that.name);
    return true;
  },

  start: function(cb){
    this._start(cb);
  	$(document.body).addClass("_ui");
  },

  newAsset: function(name){
    var that = this;
    this._newAsset();
  },

  init: function()
  {
    var self = this;

    this.wrapper = document.createElement('div');
    $(this.wrapper).addClass('ui-wrapper');
    $(this.wrapper).css({'position': 'absolute', 'left': 0, top: 0, right: 0, bottom: 0, /*background: 'red',*/ zIndex: 1000 });
  },

  itemChanged: function()
  {

  },

  clickItem: function(item, element){
    this._clickItem(item);

    if(element == null)
    {
      this.item0 = null;
      this.setView();
      return;
    }

    var self = this;

    this.item0 = $.extend({}, item);
    if (this.item0.normal_name == void(0)) {
      MightyEditor.load.action('uiGetNormalName', this.item0, function(data){
        self.item0.normal_name = data.normal_name;
      });
    }

    // console.log(item);
    var self = this;

    $.get('js/plugins/ui/index.html', function(data)
    {
      $(self.wrapper).html(data);
      $('#uieditor-iframe').css('visibility', 'hidden').load(function()
      {
        $(this).css('visibility', 'visible');

        this.focus();

        if (!item.objects) {
          $('#top-right .edit-js, #top-right .edit-css', this.contentWindow.document).hide();
        }

        self.editor = this.contentWindow.editor;
        self.editor.loadData(item.objects);
      });
    });

    $(this.wrapper).appendTo(this.content.ui.$iconContainer);
  },

  deactivate: function(){
    $(this.wrapper).detach();
    this.editor = null;
	$(document.body).removeClass("_ui");
  },

  onsave_cb: null,

  saveItem: function(item, cb){
    var self = this;

    if (item.id && this.editor){
      item.objects = this.editor.getData();

      var item2 = $.extend({}, item);
      item2.old_item = this.item0;

      MightyEditor.load.action('generateHtml', item2, function(data){
        item.normal_name = data.normal_name;
        item.html_info = data.html_info;

        self._saveItem(item, null, true);
        if (self.onsave_cb) self.onsave_cb();
      });
    }
    else {
      this._saveItem(item, null);
      if (self.onsave_cb) self.onsave_cb();
    }

  },

  setView: function(){

  },

  handleWidget: function(){
    //this.subtype = "widget";

    this.inputs.type.value = 'widget';
    //this.content.setAction(this.name);

    this.setView = this.handleWidget;
    var items = this.content.buffer[this.name];
    var items_r = [];

    for (var id in items){
      if (items[id].type == 'widget')
        items_r.push(items[id]);

    }

    MightyEditor.ui.setView(null, true, items_r);
  },


  setViewReal: function(activeItem){
    if (this.action_widget) return;

    this.inputs.type.value = 'template';

    var items = this.content.buffer[this.name];
    var items_r = [];

    for (var id in items){
      if (items[id].type == 'template')
        items_r.push(items[id]);

    }


    MightyEditor.ui.setView(activeItem, true, items_r);
  },

  deleteItem: function(item,cb,noAsk){
    var that = this;

    if (!noAsk){
      if (!confirm('Do you want to delete template '+item.name + '?')) return;
    }

    if (!this.item0) throw "Item not opened - can't delete!";

    MightyEditor.load.action('deleteUITemplate', this.item0, function(data){
      that._deleteItem(item, null, true);
    });


  },

  itemDeleted: function(item, need_refresh){
    window.ACTIVE_ITEM = null;

    if (need_refresh)
      this.clickFunc.call(this);

  },

  getItems: function(cb){
    var that = this;

    this._getItems(function(data){
      if(typeof(cb) === "function"){
        cb(data);
      }

      that.all_items = data;
      that.createList(data);
    })
  },

  openSourceEditor: function(file, cb)
  {
    var id = MightyEditor.activeItem.object.id;

    var self = this;

    this.onsave_cb = function()
    {
      self.onsave_cb = null;

      MightyEditor.setAction("SourceEditor");
      MightyEditor.plugins.SourceEditor.selectFile(file);
      MightyEditor.plugins.SourceEditor.addSaveCb(function(source)
      {
        MightyEditor.setAction("UI");
        MightyEditor.plugins.UI.clickItem(MightyEditor.buffer.UI[id], 1);
      });
    };

    MightyEditor.saveItem(MightyEditor.activeItem.object, 'UI');
  },

  inputs: {
    id: {
      _type: "hidden",
      value: null
    },

    name: {
      _type: "text"
    },

    type: {
      _type: "list",
      use: {
        template: "Template",
        widget: "Widget"
      },
      _reverse: true
    }

  }

}).extend("plugins._plugin._Plugin");
