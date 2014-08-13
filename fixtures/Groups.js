var
  ids = require('./ids'),
  groups = {
    testGroup: {
      _id: ids.groups.testGroup,
      name: 'Test Group',
      _owner: ids.users.superAdmin,
      __v: 0
    },
    groupToDelete1: {
      _id: ids.groups.groupToDelete1,
      name: 'groupToDelete1',
      _owner: ids.users.superAdmin,
      __v: 0
    },
    groupToDelete2: {
      _id: ids.groups.groupToDelete2,
      name: 'groupToDelete2',
      _owner: ids.users.superAdmin,
      __v: 0
    },
    groupToDelete3: {
      _id: ids.groups.groupToDelete3,
      name: 'groupToDelete3',
      _owner: ids.users.superAdmin,
      __v: 0
    }
  };

exports.groups = groups;
