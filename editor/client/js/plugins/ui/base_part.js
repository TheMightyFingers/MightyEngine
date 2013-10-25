
  document.getElementsByClassName = function( classname )
  {
    var elArray = [];
    var tmp = document.getElementsByTagName("*");

    for ( var i = 0; i < tmp.length; i++ ) {
      var a = tmp[i].className.split(' ');
      if (a.indexOf(classname) >= 0) {
        elArray.push(tmp[i]);
      }
    }

    return elArray;
  }

  var all_panels = {};
  var all_panels_def = {};

  function initPanels(parent_w, widgets_def)
  {
    for (var i=0; i<widgets_def.length; i++)
    {
      var wdef = widgets_def[i];

      var w = new ui.templates.PanelWidget(document.getElementsByClassName( data.normal_name + '-' + wdef.id)[0], wdef.options);
      w.id = wdef.id;
      w.is_first = wdef.is_first;
      w.align = wdef.align;
      w.anchor_align = wdef.anchor_align;
      w.parent = parent_w;

      w.auto_width = wdef.auto_width;
      w.auto_height = wdef.auto_height;
      w.height = wdef.height;
      w.ch_all_panels = wdef.ch_all_panels;
      w.css = wdef.css;
      w.src_data = data;

      parent_w.children.push(w);

      all_panels[w.id] = w;
      all_panels_def[w.id] = wdef;

      initPanels(w, wdef.children);
    }
  }

  var root_panel = new ui.templates.PanelWidget(document.getElementsByClassName(data.normal_name + '-template')[0]);
  if (typeof(mighty) != 'undefined' && mighty.UITemplates)
  {
    mighty.UITemplates[data.normal_name] = root_panel;
  }

  initPanels(root_panel, data.objects);

  for (var id in all_panels)
  {
    var def = all_panels_def[id];
    if (!def) continue;

    var panel = all_panels[id];

    panel.left = def.left ? all_panels[def.left] : null;
    panel.right = def.right ? all_panels[def.right] : null;
    panel.top = def.top ? all_panels[def.top] : null;
    panel.bottom = def.bottom ? all_panels[def.bottom] : null;
  }

  root_panel.setChildrenPositions(true);

  function doResize()
  {
    root_panel.setChildrenPositions(true);
  }

  if (window.addEventListener) {
    window.addEventListener('resize', doResize, false);
  } else if (el.attachEvent)  {
    window.attachEvent('onresize', doResize);
  }
