/* global exports */
"use strict";

var React = require("react");

function createClass(baseClass) {
  function bindProperty(instance, prop, value) {
    switch (prop) {
      case 'state':
      case 'render':
      case 'componentDidMount':
      case 'componentWillUnmount':
        instance[prop] = value;
        break;

      case 'componentDidCatch':
      case 'componentWillUpdate':
      case 'shouldComponentUpdate':
      case 'getSnapshotBeforeUpdate':
        instance[prop] = function (a, b) { return value(a)(b)(); };
        break;

      case 'componentDidUpdate':
        instance[prop] = function (a, b, c) { return value(a)(b)(c)(); };
        break;

      case 'unsafeComponentWillMount':
        instance['UNSAFE_componentWillMount'] = value;
        break;

      case 'unsafeComponentWillReceiveProps':
        instance['UNSAFE_componentWillReceiveProps'] = function (a) { return value(a)(); };
        break;

      case 'unsafeComponentWillUpdate':
        instance['UNSAFE_componentWillUpdate'] = function (a, b) { return value(a)(b)(); };
        break;

      default:
        throw new Error('[purescript-react] Not a component property: ' + prop);
    }
  }

  return function (displayName) {
    return function (ctrFn) {
      var Constructor = function (props) {
        baseClass.call(this, props);
        var spec = ctrFn(this)();
        for (var k in spec) {
          bindProperty(this, k, spec[k]);
        }
      };

      Constructor.displayName = displayName;
      Constructor.prototype = Object.create(baseClass.prototype);
      Constructor.prototype.constructor = Constructor;

      return Constructor;
    };
  };
}

function createClassWithDerivedState(classCtr) {
  return function(displayName) {
    return function(getDerivedStateFromProps) {
      return function(ctrFn) {
        var Constructor = componentImpl(displayName)(ctrFn);
        Constructor.getDerivedStateFromProps = function(a, b) { return getDerivedStateFromProps(a)(b) };
        return Constructor;
      };
    };
  };
}

var componentImpl = createClass(React.Component);
exports.componentImpl = componentImpl;
exports.componentWithDerivedStateImpl = createClassWithDerivedState(componentImpl);

var pureComponentImpl = createClass(React.PureComponent);
exports.pureComponentImpl = pureComponentImpl
exports.pureComponentWithDerivedStateImpl = createClassWithDerivedState(pureComponentImpl);

exports.statelessComponent = function(x) { return x; };

exports.fragment = React.Fragment;

function getProps(this_) {
  return function(){
    return this_.props;
  };
}
exports.getProps = getProps;

exports.childrenToArray = React.Children.toArray

exports.childrenCount = React.Children.count;

function setStateImpl(this_) {
  return function(state){
    return function(){
      this_.setState(state);
    };
  };
}
exports.setStateImpl = setStateImpl;

function setStateWithCallbackImpl(this_) {
  return function(state){
    return function(cb){
      return function() {
        this_.setState(state, cb);
      };
    };
  };
}
exports.setStateWithCallbackImpl = setStateWithCallbackImpl;

function getState(this_) {
  return function(){
    if (!this_.state) {
      throw new Error('[purescript-react] Cannot get state within constructor');
    }
    return this_.state;
  };
}
exports.getState = getState;

function forceUpdateWithCallback(this_) {
  return function(cb) {
    return function() {
      this_.forceUpdate(cb);
    };
  };
}
exports.forceUpdateWithCallback = forceUpdateWithCallback;

function createElement(class_) {
  return function(props){
    return function(children){
      var args = [class_, props].concat(children);
      var element = React.createElement.apply(React, args);
      console.log(args, element);
      return  element;
    };
  };
}
exports.createElementImpl = createElement;

function createElementTagNameImpl(tag, props, children) {
  var newProps = props;
  var key = null;
  var ref = null;
  if (props.hasOwnProperty('key') || props.hasOwnProperty('ref') || children.length) {
    newProps = {};
    for (var k in props) {
      if (k === 'key') {
        key = props[k];
      } else if (k === 'ref') {
        ref = props[k];
      } else {
        newProps[k] = props[k];
      }
    }
    if (children.length) {
      newProps.children = toChildren(children);
    }
  }
  return createInlineElementImpl(tag, key, ref, newProps);
}
exports.createElementTagNameImpl = createElementTagNameImpl

function createLeafElement(class_) {
  return function(props) {
    return React.createElement(class_, props);
  };
}
exports.createLeafElementImpl = createLeafElement;

function createContext(defaultValue) {
  var context = React.createContext(defaultValue);
  return {
    consumer: context.Consumer,
    provider: context.Provider
  };
}
exports.createContext = createContext;

var REACT_ELEMENT_TYPE =
  (typeof Symbol === 'function' && Symbol.for && Symbol.for('react.element')) || 0xeac7;

function createInlineElementImpl(type, key, ref, props) {
  var defaultProps = type && typeof type !== "string" && type.defaultProps;
  var newProps = props;
  if (defaultProps) {
    newProps = {};
    for (var k in defaultProps) {
      newProps[k] = defaultProps[k];
    }
    for (var k in props) {
      newProps[k] = props[k];
    }
  }
  return {
    $$typeof: REACT_ELEMENT_TYPE,
    type: type,
    key: key,
    ref: ref,
    props: newProps
  };
}
exports.createInlineElementImpl = createInlineElementImpl;

function toChildren(arr) {
  if (arr.length === 0) {
    return null;
  }
  if (arr.length === 1) {
    return arr[0];
  }
  return arr;
}
exports.toChildren = toChildren;
