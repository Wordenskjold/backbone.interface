# backbone.interface
Plugin for Backbone, which adds property type information to models.

## Note: Still in active development. Nothing has been officially released yet!

Models in Backbone have no notion of their type. They can be overwritten, manually, and from server updates.

The backbone.interface plugin creates a bound relationship between a model property and its type, making sure the type of a property will never change. Lets say we have the following model:

```
var Model = Backbone.Model.extend({

  defaults: {
    myCollection: new MyCustomCollectionType()
  }
});
```

Lets create and fetch an instance:

```
var model = new Model();
model.fetch();
```

After fetch, myCollection will be an array, and our collection will be gone. We will have to deal with this in a callback or parse, which is clumsy and quickly gets hard to maintain.

```
// [ ... data ... ]
model.get('myCollection');
```

The backbone.interface plugin makes this easier to deal with. You just specifiy an interface map, and backbone.interface takes care of the rest:

```
var Model = Backbone.Model.extend({

  ...

  interface: {
    myCollection: MyCustomCollectionType
  }
});

var model = new Model();
model.fetch();
```

myCollection is now still a MyCustomCollectionType!

```
// (myCollection instanceof MyCUstomCollectionType) === true!
model.get('myCollection');
```
