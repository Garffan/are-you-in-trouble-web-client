/**
 * Copyright (C) 2013 Yurij Mikhalevich
 * @license GPLv3
 * @author Yurij Mikhalevich <0@39.yt>
 */

var Validator = {
  types: {}
};

Validator.types.Integer = function (minimum, maximum, required) {
  var integer = { type: 'integer' };
  if (minimum) {
    integer.minimum = minimum;
  }
  if (maximum) {
    integer.maximum = maximum;
  }
  if (required) {
    integer.required = true;
  }
  return integer;
};
Validator.types.Serial = new Validator.types.Integer(1);
Validator.types.Timestamp = { type: 'string', format: 'date-time' };
Validator.types.Text = { type: 'string' };
Validator.types.String = function (length, required) {
  return { type: 'string', maxLength: length, required: required || false };
};
Validator.types.Boolean = { type: 'boolean' };
Validator.types.Email = { type: 'string', format: 'email', maxLength: 255 };
Validator.types.Phone = { type: 'string', pattern: /^\+[0-9]{10,15}$/ };
Validator.types.Enum = function (values, required) {
  return { type: 'string', enum: values, required: required || false };
};
Validator.types.UserRole = new Validator.types.Enum([ 'client', 'helper', 'subdepartment chief', 'department chief' ]);
Validator.types.OrderingDirection = new Validator.types.Enum([ 'ASC', 'DESC' ]);
Validator.types.SerialFilter = {
  type: [ 'integer', 'array', 'null' ],
  minimum: 1,
  minLength: 1,
  items: new Validator.types.Integer(1)
};
Validator.types.StringFilter = function (length, required) {
  return {
    type: [ 'string', 'array', 'null' ],
    minLength: 1,
    maxLength: length,
    items: new Validator.types.String(length),
    required: required || false
  }
};
Validator.types.RoleFilter = {
  type: [ 'array' ],
  minLength: 1,
  items: new Validator.types.Enum([ 'client', 'helper', 'subdepartment chief', 'department chief' ])
};

for (var property in Validator.types) {
  if (!Validator.types.hasOwnProperty(property) || typeof Validator.types[property] === 'function') {
    continue;
  }
  Validator.types[property] = function () {
    var type = Validator.types[property]
      , typeR = {};
    for (var typeProperty in type) {
      if (type.hasOwnProperty(typeProperty)) {
        typeR[typeProperty] = type[typeProperty];
      }
    }
    typeR.required = true;
    return function (required) {
      return required ? typeR : type;
    };
  }();
}

Validator.presets = {
  nothing: {
    properties: {}
  },
  onlyTaskIdRequired: {
    properties: {
      taskId: new Validator.types.Serial(true)
    }
  }
};

Validator.filters = {
  'tasks:retrieve': {
    properties: {
      limit: new Validator.types.Integer(1, 50),
      offset: new Validator.types.Integer(0),
      order: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            column: new Validator.types.Enum([ 'createdAt', 'updatedAt' ], true),
            direction: new Validator.types.OrderingDirection(true)
          }
        }
      },
      filters: {
        type: 'object',
        properties: {
          closedById: new Validator.types.SerialFilter(),
          typeId: new Validator.types.SerialFilter(),
          universityDepartmentId: new Validator.types.SerialFilter(),
          subdepartmentId: new Validator.types.SerialFilter(),
          content: new Validator.types.StringFilter(128)
        }
      }
    }
  },
  'tasks:save-client': {
    properties: {
      content: new Validator.types.Text(true),
      typeId: new Validator.types.Serial(true)
    }
  },
  'tasks:save-department chief': {
    properties: {
      id: new Validator.types.Serial(),
      content: new Validator.types.Text(true),
      typeId: new Validator.types.Serial(true),
      clientId: new Validator.types.Serial(),
      universityDepartmentId: new Validator.types.Serial(true),
      subdepartmentId: new Validator.types.Serial()
    }
  },
  'tasks:close': Validator.presets.onlyTaskIdRequired,
  'tasks:remove': Validator.presets.onlyTaskIdRequired,
  'tasks:add helper': {
    properties: {
      taskId: new Validator.types.Serial(true),
      helperId: new Validator.types.Serial(true)
    }
  },
  'tasks:remove helper': {
    properties: {
      taskId: new Validator.types.Serial(true),
      helperId: new Validator.types.Serial(true)
    }
  },
  'task comments:retrieve': Validator.presets.onlyTaskIdRequired,
  'task comments:unsubscribe': Validator.presets.onlyTaskIdRequired,
  'task comments:save': {
    properties: {
      content: new Validator.types.Text(true),
      taskId: new Validator.types.Serial(true)
    }
  },
  'task comments:save-department chief': {
    properties: {
      id: new Validator.types.Serial(),
      content: new Validator.types.Text(true),
      taskId: new Validator.types.Serial(true)
    }
  },
  'task comments:remove': {
    properties: {
      commentId: new Validator.types.Serial(true)
    }
  },
  'task types:retrieve': Validator.presets.nothing,
  'task types:save': {
    properties: {
      id: new Validator.types.Serial(),
      name: new Validator.types.String(60, true),
      subdepartmentId: new Validator.types.Serial()
    }
  },
  'subdepartments:retrieve': Validator.presets.nothing,
  'subdepartments:save': {
    properties: {
      id: new Validator.types.Serial(),
      name: new Validator.types.String(60, true)
    }
  },
  'university departments:retrieve': Validator.presets.nothing,
  'university departments:save': {
    properties: {
      id: new Validator.types.Serial(),
      name: new Validator.types.String(60, true)
    }
  },
  'profiles:retrieve': {
    properties: {
      limit: new Validator.types.Integer(1, 50),
      offset: new Validator.types.Integer(0),
      order: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            column: new Validator.types.Enum([ 'displayName', 'createdAt', 'updatedAt' ], true),
            direction: new Validator.types.OrderingDirection(true)
          }
        }
      },
      filters: {
        type: 'object',
        properties: {
          id: new Validator.types.SerialFilter(),
          displayName: new Validator.types.StringFilter(60),
          email: new Validator.types.StringFilter(60),
          phone: new Validator.types.StringFilter(60),
          role: new Validator.types.RoleFilter(),
          universityDepartmentId: new Validator.types.SerialFilter(),
          subdepartmentId: new Validator.types.SerialFilter()
        }
      }
    }
  },
  'profiles:save': {
    properties: {
      displayName: new Validator.types.String(60, true),
      phone: new Validator.types.String(15)
    }
  },
  'profiles:save-department chief': {
    properties: {
      id: new Validator.types.Serial(),
      displayName: new Validator.types.String(60, true),
      phone: new Validator.types.String(15)
    }
  },
  'profiles:remove': {
    properties: {
      profileId: new Validator.types.Serial(true)
    }
  },
  'profiles:make client': {
    properties: {
      userId: new Validator.types.Serial(true),
      universityDepartmentId: new Validator.types.Serial(true)
    }
  },
  'profiles:make helper': {
    properties: {
      userId: new Validator.types.Serial(true),
      chief: new Validator.types.Boolean(),
      subdepartmentId: new Validator.types.Serial(true)
    }
  },
  'profiles:make department chief': {
    properties: {
      userId: new Validator.types.Serial(true)
    }
  },
  'profiles:set subdepartment': {
    properties: {
      userId: new Validator.types.Serial(true),
      subdepartmentId: new Validator.types.Serial(true)
    }
  },
  'profiles:set university department': {
    properties: {
      userId: new Validator.types.Serial(true),
      universityDepartmentId: new Validator.types.Serial(true)
    }
  }
};

/**
 * @param {Function} validate Revalidator's validate function (window.validate in browser, and revalidator.validate in
 * node.js)
 * @param {String|Object} entity
 * @param {Object} entry
 * @returns {Object}
 */
Validator.validate = function (validate, entity, entry) {
  var legend;
  if (typeof entity === 'string') {
    legend = Validator.filters[entity];
  } else {
    legend = entity;
  }
  if (!legend) {
    return {
      valid: false,
      errors: [ { message: 'invalid entity type' } ]
    };
  }
  this.cleanObject(entry, legend);
  return validate(entry, legend);
};

Validator.cleanObject = function (entry, legend) {
  var propertyLegend;
  if (legend.properties) {
    var property;
    for (property in entry) {
      if (!entry.hasOwnProperty(property)) {
        continue;
      }
      propertyLegend = legend.properties[property];
      if (propertyLegend == undefined) {
        delete entry[property];
      } else {
        if (propertyLegend.type instanceof Array) {
          // instructions inside that block are very dirty, implemented only for SerialFilter type
          // FIXME: refactor that method to be universal
          if ((propertyLegend.type.indexOf('null') === -1 || entry[property] !== null)) {
            if (propertyLegend.type.indexOf('integer') !== -1 && entry[property] == +entry[property]) {
              entry[property] = +entry[property];
            } else if (propertyLegend.type.indexOf('array') !== -1 && propertyLegend.items
              && entry[property] instanceof Array) {
              if (propertyLegend.items.type === 'object') {
                for (var k = 0; k < entry[property].length; ++k) {
                  this.cleanObject(entry[property][k], propertyLegend.items);
                }
              } else if (propertyLegend.items.type === 'integer' || propertyLegend.items.type === 'number') {
                for (var l = 0; l < entry[property].length; ++l) {
                  if (entry[property][l] == +entry[property][l]) {
                    entry[property][l] = +entry[property][l];
                  }
                }
              }
            }
          }
        } else if ((propertyLegend.type === 'integer' || propertyLegend.type === 'number')
          && entry[property] == +entry[property]) {
          entry[property] = +entry[property];
        } else if (propertyLegend.type === 'boolean') {
          if (entry[property] === '1' || entry[property] === 1 || entry[property] === 'true') {
            entry[property] = true;
          } else if (entry[property] === '0' || entry[property] === 0 || entry[property] === 'false') {
            entry[property] = false;
          }
        } else if (propertyLegend.type === 'object') {
          this.cleanObject(entry[property], propertyLegend);
        } else if (propertyLegend.type === 'array' && propertyLegend.items && entry[property] instanceof Array) {
          if (propertyLegend.items.type === 'object') {
            for (var i = 0; i < entry[property].length; ++i) {
              this.cleanObject(entry[property][i], propertyLegend.items);
            }
          } else if (propertyLegend.items.type === 'integer' || propertyLegend.items.type === 'number') {
            for (var j = 0; j < entry[property].length; ++j) {
              if (entry[property][j] == +entry[property][j]) {
                entry[property][j] = +entry[property][j];
              }
            }
          }
        }
      }
    }
    for (property in legend.properties) {
      if (!legend.properties.hasOwnProperty(property)) {
        continue;
      }
      if (entry[property] === undefined && legend.properties[property].default !== undefined) {
        entry[property] = legend.properties[property].default;
      }
    }
  }
};

if (module && module.exports) {
  module.exports = function (validate, entity, entry) {
    return Validator.validate(validate, entity, entry);
  };
}