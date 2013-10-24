v1.1.1
======

## Festures:
* Added particle demo project.
* Added outlines options for [Entity.Text](http://docs.mightyfingers.com/api/entitytext/27).
* Added improved ability to switch inputs on CocoonJS between WebView and Canvas.
* Added run.exe for Windows users to improve easiness to launch editor on Node.js.

## Improvements:
* Improved stability for particles.
* Fixed issues with sound on CocoonJS.
* Fixed broken this.ui.setStyle().
* Fixed broken UI onShow/onHide on CocoonJS.
* Fixed UI not loading on iOS on CocoonJS.

v1.1.0
======

## Features:
* Added [Entity.Particle](http://docs.mightyfingers.com/api/entityparticle/28). (particle editor coming soon!)
* Added [UI editor](http://docs.mightyfingers.com/manual/ui-editor/35).
* Added experimental support for WebGL.
* Added ability to change output quality.
* Added entity.flip() ability - AUTO(default), HORIZONTAL, VERTICAL, HORIZONTAL_VERTICAL.

## Improvements:
* Improved performance for patches/culling and entity.move() function.
* UI: data-click attribute support for CocoonJS.
* Ability to change if texture is preloaded (from editor). If not, load it manually by calling .load() function without giving path as parameter.
* Updated Texture API to support many different ways to create and use texture.

## Fixed in engine:
* Issue that Entity.Geometry.load() in some cases is called too soon if created from template.
* Issue that manually loaded texture had a wrong path.
* Fixed Scene.reloadLevel().
* Fixed all issue with volume calculations when entity is scaled or rotated.

## Fixed in editor:
* Auto reconnect if disconnected from Node.js server.
* Issue that could crash editor server if game was launched with "Open Game" button.
