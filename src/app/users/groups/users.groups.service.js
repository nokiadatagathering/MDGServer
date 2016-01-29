(function () {
  'use strict';

  angular.module('mdg.app.users').service('groupsService', function ($q, $http) {
    /** @const */
    var GROUPS_URL = '/groups';

    function groupList() {

      return $http.get(GROUPS_URL + '?cacheBuster=' +  new Date().getTime())
        .success(function (result) {
          console.log('result', result);
        });
    }

    function groupData(groupId) {
      var group_url = GROUPS_URL +'/' + groupId;
      return $http.get(group_url)
        .success(function (result) {
        });
    }

    function createGroup(groupName) {
      return $http.post(GROUPS_URL, {name: groupName})
        .success(function (result) {
        });
    }

    function updateGroup(groupId, groupData) {
      var group_url = GROUPS_URL + groupId;
      return $http.put(group_url, groupData)
        .success(function (result) {
        });
    }

    function deleteGroup(groupId) {
      var delete_group_url = GROUPS_URL +'/' + groupId;
      return $http.delete(delete_group_url)
        .success(function (result) {
        });
    }

    return {
      groupList: groupList,
      groupData: groupData,
      createGroup: createGroup,
      updateGroup: updateGroup,
      deleteGroup: deleteGroup
    };
  });
})();
