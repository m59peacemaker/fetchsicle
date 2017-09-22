# fetchsicle

Wraps popsicle middleware so that it can be used as [fetchware](https://github.com/m59peacemaker/fetchware).

## install

```sh
$ npm install fetchsicle
```

## example

```js
import fetchware from 'fetchware'
import fetchsicle from 'fetchsicle'
import status from 'popsicle-status'

fetchware
  .use(fetchsicle(status()))
  ('/bad-rekwest')
  .catch(() => {}) // threw because response code was 404
```

## WARNING

`fetchsicle` has to convert back and forth from fetch requests and responses to the kind that popsicle deals with. Not everything popsicle expects is implemented yet, so it isn't currently likely to work with whatever popsicle middleware you try to use. Be prepared to submit a PR to add whatver you need when trying out popsicle middleware with `fetchware`.

Or just rewrite popsicle middleware for fetchware. It's all fun.
