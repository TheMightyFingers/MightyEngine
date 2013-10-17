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
* Issue with Entity.Geometry.load() could be called to soon if created from template.
* Issue that manually loaded texture had a wrong path.
* Fixed Scene.reloadLevel().
* Fixed all issues with calculating volume for scaled/rotated entities.

## Fixed in editor:
* Auto reconnect if disconnected from Node.js.
* Issue that could crash editor server if game was launched with "Open Game" button.
