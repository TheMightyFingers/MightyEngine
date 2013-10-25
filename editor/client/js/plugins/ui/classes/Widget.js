"use strict";

var uieditor = {};

uieditor.Widget = Class.extend({

  id: 0,
  editor: null,
  options: {
    css: {}
  },
  type: null,
  $div: null,
  parent: null,

  init: function(editor)
  {
    this.editor = editor;
  },

  onAdd: function()
  {

  },

  createHTML: function()
  {
    return '<div>widget</div>';
  },

  updateDiv: function()
  {
    this.updateDivCSS();
  },

  updateDivCSS: function(css_props)
  {
    if (css_props == void(0)) css_props = {};

    for (var i=0; i<uieditor.Widget.css_fields.length; i++)
    {
      var key = uieditor.Widget.css_fields[i];
      if (css_props[key] == void(0))
        css_props[key] = '';

    }

    for (var k in this.options.css)
    {
      css_props[k] = this.options.css[k];
    }

    var bg = css_props['background-image'];
    if (bg != '' && bg.substr(0, 4) == 'url(')
    {
      if (bg.charAt(4) == '"')
      {
        var a = bg.split('"');
        a[1] = this.editor.getTemplateBaseURL() + '/' + a[1];
        bg = a.join('"');
      }
      else if (bg.charAt(4) == "'")
      {
        var a = bg.split("'");
        a[1] = this.editor.getTemplateBaseURL() + '/' + a[1];
        bg = a.join("'");
      }
      else
      {
        var a = bg.split('(');
        var b = a[1].split(')')
        b[0] = this.editor.getTemplateBaseURL() + '/' + b[0];
        a[1] = b.join(')');
        bg = a.join('(');
      }

      css_props['background-image'] = bg;
    }

    this.$div.css(css_props);
  },

  setCSS: function(props)
  {
    if (this.options.css.left !== void(0))
    {
      props.left = this.options.css.left;
    }

    if (this.options.css.right !== void(0))
    {
      props.right = this.options.css.right;
    }

    if (this.options.css.top !== void(0))
    {
      props.top = this.options.css.top;
    }

    if (this.options.css.bottom !== void(0))
    {
      props.bottom = this.options.css.bottom;
    }

    if (this.options.css.position !== void(0))
      props.position = this.options.css.position;


    this.$div.css(props);
  },

  remove: function(keep_div)
  {
    if (!this.parent) return false;

    this.parent.removeChild(this, keep_div);
    return true;
  },

  canBeMoved: function()
  {
    return true;
  },

  safeRemove: function(keep_div)
  {
    return this.remove();
  },

  getParents: function()
  {
    var parents = [];

    var parent = this.parent;
    while (parent)
    {
      parents.push(parent);
      parent = parent.parent;
    }

    parents.reverse();
    return parents;
  },

  getClass: function()
  {
    var classname = this.type.substr(0, 1).toUpperCase() + this.type.substr(1) + 'Widget';
    return uieditor[classname];
  }

});

uieditor.Widget.css_fields = 'color font-family font-size font-weight background-image background-color background-position background-size background-repeat margin padding cursor line-height text-transform border-width border-style border-color border-radius position left top right bottom display white-space'.split(' ');

uieditor.Widget.initStylesTab = function(widgetclass, wrap)
{
  var css_fields = {
    font: {
      color: { _type: 'text', className: 'colorpicker' },
      'font-family': { _type: 'text' },
      'font-size': { _type: 'text' },
      'font-weight': {
        _type: 'list',
        use: ['', 'normal', 'bold', 'bolder', 'lighter', /*100, 200, 300, 400, 500, 600, 700, 800, 900,*/ 'inherit'],
        _reverse: true
      }
    },

    background: {
      'background-image': { _type: 'text' },
      'background-color': { _type: 'text', className: 'colorpicker' },
      'background-position': { _type: 'text' },
      'background-size': { _type: 'text' },
      'background-repeat': {
        _type: 'list',
        use: ['', 'repeat', 'repeat-x', 'repeat-y', 'no-repeat', 'inherit'],
        _reverse: true

/*
        {
          '': '',
          repeat: 'repeat',
          'repeat-x': 'repeat-x',
          'repeat-y': 'repeat-y',
          'no-repeat': 'no-repeat',
          'inherit': 'inherit'
        }
*/
      }
    },

    border: {
      'border-width': { _type: 'text' },
      'border-style': {
        _type: 'list',
        use: ['', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset', 'inherit'],
        _reverse: true
      },
      'border-color': { _type: 'text', className: 'colorpicker' },
      'border-radius': { _type: 'text' }
    },

    position: {
      position: {
        _type: 'list',
        use: ['', 'absolute', 'relative'],
        _reverse: true
      },

      left: { _type: 'text' },
      right: { _type: 'text' },
      top: { _type: 'text' },
      bottom: { _type: 'text' }
    },

    other: {
      margin: { _type: 'text' },
      padding: { _type: 'text' },
      cursor: {
        _type: 'list',
        use: ['', 'default', 'pointer'],
        _reverse: true
      },
      'line-height': { _type: 'text' },
      'text-transform': {
        _type: 'list',
        use: ['', 'none', 'capitalize', 'uppercase', 'lowercase', 'inherit'],
        _reverse: true
      },
      display: {
        _type: 'list',
        use: ['', 'block', 'inline-block', 'block' ],
        _reverse: true
      },
      'white-space': {
        _type: 'list',
        use: ['', 'normal', 'nowrap', 'pre', 'pre-line', 'pre-wrap', 'inherit'],
        _reverse: true
      }
    }

  }

  var otito = new Otito({}, css_fields);
  otito.append($(wrap)[0]);
  uieditor.Widget.otitoInitForm(otito, {
    //copy_option_value: true
  });

  window.parent.MightyEditor.ui.improveOtito(otito);

  widgetclass.css_otito = otito;
}

uieditor.Widget.otitoInitForm = function(otito, options)
{
  if (options == void(0)) options = {};

  $('.head', otito.html).on('click', function(e)
  {
    $(e.target).closest('.folder').toggleClass('active');
  });

  $('input.colorpicker', otito.html).colorpicker({
    colorFormat: 'rgba(rd,gd,bd,af)',
    alpha: true
  });
/*
  if (options.copy_option_value)
  {
    $('option', otito.html).each(function(i, e)
    {
      $(e).html($(e).attr('value'));
    });
  }
  */
}

uieditor.Widget.getOtitoValues = function(otito, values)
{
  $('input.colorpicker', otito.html).trigger('change');

  function getKeyFromValue(obj, value)
  {
    for (var key in obj)
    {
      if (obj[key] == value) {
        return key;
      }
    }

    return null;
  }

  function getValuesFromBranch(branch, meta)
  {
    for (var k in branch)
    {
      if (typeof(branch[k]) == 'object')
        getValuesFromBranch(branch[k], meta[k]);
      else
      {
        if (values[k] == void(0) && branch[k] == '') continue;

        if (meta[k]._type == 'list') {
          values[k] = getKeyFromValue(meta[k].use, branch[k]);
        }
        else {
          values[k] = branch[k];
        }

      }
    }
  }
  getValuesFromBranch(otito.object, otito.meta);
}

uieditor.Widget.setOtitoValues = function(otito, values)
{
  function setValuesOnBranch(branch, meta)
  {
    for (var k in branch)
    {
      if (typeof(branch[k]) == 'object')
        setValuesOnBranch(branch[k], meta[k]);
      else
      {
        if (meta[k]._type == 'list') {
          branch[k] = meta[k].use[ values[k] ];
          //console.log('setv', k, values[k], meta[k].use);
        }
        else {
          branch[k] = values[k];
        }


      }
    }
  }
  setValuesOnBranch(otito.object, otito.meta);

  otito.refresh();
  uieditor.Widget.otitoInitForm(otito, {
    //copy_option_value: true
  });

}

