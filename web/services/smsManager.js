define(function () {
  'use strict';
  return function ($q, $http) {
    /** @const */
    var SMS_URL = '/sms';

    function sendSMStoUser (userId, messageData) {
      var send_sms_user_url = SMS_URL + '/user/' + userId;
      return $http.post(send_sms_user_url, messageData)
        .success(function (result) {
        });
    }
    function sendSMStoGroup (groupId, messageData) {
      var send_sms_group_url = SMS_URL + '/group/' + groupId;
      return $http.post(send_sms_group_url, messageData)
        .success(function (result) {
        });
    }

    return {
      sendSMStoUser:  sendSMStoUser,
      sendSMStoGroup: sendSMStoGroup
    };
  };
});
