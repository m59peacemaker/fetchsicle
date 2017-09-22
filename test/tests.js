import test from 'tape'
import fetchware from 'fetchware'
import popsicleStatus from 'popsicle-status'
import popsiclePrefix from 'popsicle-prefix'
import catboxMemory from 'catbox-memory'
import { plugin as PopsicleCache, ttls as popsicleCacheTtls } from 'popsicle-cache'
import fetchsicle from '../src'

test('popsicle-status', t => {
  t.plan(2)

  fetchware
    .use(fetchsicle(popsicleStatus()))
    ('http://jsonplaceholder.typicode.com/bad-rekwest')
    .then(response => {
      if (response.status !== 404) {
        throw new Error(`response status is ${response.status}. This test expects it to be 404`)
      }
      t.fail('should have thrown on 404')
    })
    .catch(err => {
      t.equal(err.status, 404, 'threw when 404')
      t.equal(err.code, 'EINVALIDSTATUS', 'threw EINVALIDSTATUS')
    })
})

test('popsicle-prefix', t => {
  t.plan(2)

  fetchware
    .use(fetchsicle(popsiclePrefix('http://jsonplaceholder.typicode.com/posts')))
    ('/1')
    .then(response => response.json())
    .then(data => {
      t.equal(data.id, 1)
      t.equal(data.userId, 1)
    })
    .catch(t.fail)
})

test('popsicle-cache', t => {
  t.plan(2)

  const url = 'http://jsonplaceholder.typicode.com/posts/1'
  const popsicleCache = PopsicleCache({ engine: catboxMemory, ttls: popsicleCacheTtls.forever() })
  const cachingFetch = fetchware
    .use(fetchsicle(popsicleCache.handle))

  const now = () => new Date().getTime()
  const firstRequestStartTime = now()
  cachingFetch(url)
    .then(response => {
      const firstRequestTotalTime = now() - firstRequestStartTime
      const secondRequestStartTime = now()
      return cachingFetch(url)
        .then(() => {
          const secondRequestTotalTime = now() - secondRequestStartTime
          t.true(secondRequestTotalTime < (firstRequestTotalTime / 10))
          t.true(secondRequestTotalTime < 5)
        })
    })
    .catch(t.fail)
    .then(() => {
      popsicleCache.stop()
    })
})
