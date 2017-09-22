import { PopsicleError } from 'popsicle'

const fetchHeadersToPlainObject = fetchHeaders => [ ...fetchHeaders ]
  .reduce((acc, [ key, value ]) => {
    acc[key] = value
    return acc
  }, {})

const fetchwareRequestToPopsicleRequest = fetchwareRequest => {
  const headers = fetchHeadersToPlainObject(fetchwareRequest.init.headers)
  return Object.assign(
    {},
    fetchwareRequest.init,
    {
      url: fetchwareRequest.url,
      headers,
      get: key => headers[key],
      error: function (message, code, original) {
        return new PopsicleError(message, code, original, this)
      }
    }
  )
}

const popsicleRequestToFetchwareRequest = popsicleRequest => {
  const url = popsicleRequest.url
  const init = Object.assign({}, popsicleRequest)
  delete init.get
  delete init.url
  return { url, init }
}

const fetchResponseToPopsicleResponse = fetchResponse => {
  const popsicleResponse = fetchResponse.clone()
  popsicleResponse.get = key => popsicleResponse.headers.get(key)
  return popsicleResponse
}

const popsicleResponseToFetchResponse = popsicleResponse => {
  delete popsicleResponse.get
  return popsicleResponse
}

const fetchsicle = popsicleMiddleware => {
  return function fetchsicleMiddleware (request, next) {
    /* popsicle relies on mutation rather than passing the request around explicitly
      - make a new request object with the interface popsicle middlware expects
      - pass that request object to popsicle middleware so it can mutate it
      - wrap `next` to adapt that request object back to fetchware's interface and pass it to `next`
     */

     /* and then I need to figure out what kind of response popsicle expects and how to adapt that */

    const popsicleRequest = fetchwareRequestToPopsicleRequest(request)
    const popsicleNext = () => {
      return next(popsicleRequestToFetchwareRequest(popsicleRequest))
        .then(fetchResponseToPopsicleResponse)
    }
    return popsicleMiddleware(popsicleRequest, popsicleNext)
      .then(popsicleResponseToFetchResponse)
  }
}

export default fetchsicle
