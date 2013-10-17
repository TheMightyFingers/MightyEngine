v1.1.0
======

## Features:
* Added [Entity.Particle](http://docs.mightyfingers.com/api/entityparticle/28]).
* Added [UI editor](http://docs.mightyfingers.com/manual/ui-editor/35).
* Added experimental support for WebGL.
* Added css scaling for improving or degrading performance/output quality.

## Improvements:
* Improved performance for entity.move() function.
* UI: data-click attribute support for CocoonJS.
* Ability to change if texture is preloaded (from editor). If not, load it manually by calling .load() function without giving path as parameter.
* Updated Texture API to support many different ways to create and use texture.

## Fixed in engine:
* Issue with Entity.Geometry.load() could be called to soon if created from template.
* Issue that manually loaded textures did had wrong path.
* Fixed Scene.reloadLevel().
* Fixed all issues with calculating volume for scaled/rotated entities.

## Fixed in editor:
* Auto reconnect if disconnected from Node.js.
* Issue that could crash editor server if game was launched with "Open Game" button.
