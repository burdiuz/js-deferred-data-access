/**
 * Created by Oleg Galaburda on 07.03.16.
 */
//TODO If RequestTarget, RequestTargetLink or their proxies are passed, they should be converted to RAW links.
var DataConverter = (function() {

  function convertLinkToRaw(data) {
    if (data.target instanceof RequestTarget) {
      data = data.target.toJSON();
    }else if (typeof(data.toJSON) === 'function') {
      data = data.toJSON();
    }
    return data;
  }

  function convertRawToRequestTarget(data, sendRequestHandler) {
    var poolId = RequestTargetLink.getLinkPoolId(data);
    if (poolId === TargetPool.instance.id) { // target object is stored in current pool
      data = TargetPool.instance.get(RequestTargetLink.getLinkId(data));
      if (data) {
        data = data.target;
      }
    } else { // target object has another origin, should be wrapped
      data = new RequestTarget(Promise.resolve(data), sendRequestHandler);
    }
    return data;
  }

  function convertArrayTo(list, linkConvertHandler, sendRequestHandler) {
    var result = [];
    var length = list.length;
    for (var index = 0; index < length; index++) {
      var value = list[index];
      if (RequestTargetLink.isLink(value)) {
        result[index] = linkConvertHandler(value, sendRequestHandler);
      } else {
        result[index] = value;
      }
    }
    return result;
  }

  function convertHashTo(data, linkConvertHandler, sendRequestHandler) {
    var result = {};
    for (var name in data) {
      if (!data.hasOwnProperty(name)) continue;
      var value = data[name];
      if (RequestTargetLink.isLink(data)) {
        result[name] = linkConvertHandler(value, sendRequestHandler);
      } else {
        result[name] = value;
      }
    }
    return result;
  }

  function convertToRaw(data) {
    var result = data;
    var dataType = typeof(data);
    if (dataType === 'object' && data !== null) {
      if (RequestTargetLink.isLink(data)) { // if data is link
        result = convertLinkToRaw(data);
      } else if (data instanceof Array) { // if data is Array of values, check its
        result = convertArrayTo(data, convertLinkToRaw);
      } else if (data.constructor === Object) { // only Object instances can be looked up, other object types must be converted by hand
        result = convertHashTo(data, convertLinkToRaw);
      }
    } else if (dataType === 'function') {
      result = TargetPool.instance.set(data).toJSON();
    }
    return result;
  }

  function prepareToSend(data) {
    if (data) {
      data.value = convertToRaw(data.value);
    }
    return data;
  }

  function convertFromRaw(data, sendRequestHandler) {
    var result = data;
    if (typeof(data) === 'object' && data !== null) {
      if (RequestTargetLink.isLink(data)) { // if data is link
        result = convertRawToRequestTarget(data, sendRequestHandler);
      } else if (data instanceof Array) { // if data is Array of values, check its
        result = convertArrayTo(data, convertRawToRequestTarget, sendRequestHandler);
      } else if (data.constructor === Object) {
        result = convertHashTo(data, convertRawToRequestTarget, sendRequestHandler);
      }
    }
    return result;
  }

  function prepareToReceive(data, sendRequestHandler) {
    if (data) {
      data.value = convertFromRaw(data.value, sendRequestHandler);
    }
    return data;
  }

  function isPending(value) {
    return value.target instanceof RequestTarget && value.target.status == TargetStatus.PENDING;
  }

  function lookupForPending(data) {
    var result = [];
    if (typeof(data) === 'object' && data !== null) {
      function add(value) {
        if (isPending(value)) {
          result.push(value);
        }
        return value;
      }
      if (isPending(data)) {
        result.push(data);
      } else if (data instanceof Array) {
        convertArrayTo(data, add);
      } else if (data.constructor === Object) {
        convertHashTo(data, add);
      }
    }
    return result;
  }

  return {
    prepareToSend: prepareToSend,
    prepareToReceive: prepareToReceive,
    lookupForPending: lookupForPending
  };
})();
