"use strict";
var module = angular.module("ethereum", []);
module.controller("PropertyTransferController", function($scope, $http, $location) {
  var baselocation = $location.protocol() + "://" + $location.host() + ":" + $location.port();
  $scope.listAccounts= [];
  $scope.properties= [];
  $scope.account= {};
  $scope.sendEther = {};
  $scope.allotProperty = {};
  $scope.transferProperty={};
  $scope.selectPropertyName = null;
  $scope.loadList = function(keyword) {
      $scope.accounts();
  };

  $scope.accounts = function() {
    return $http({
      url: baselocation + "/propertyTransfer",
      method: "GET",
    }).then(function(response) {
      $scope.listData = response.data;
    },
    function(errResponse) {
      /*console.error(errResponse);*/
    });
  };

  $scope.submitCreateAccount = function() {
    if($scope.account.password !== $scope.account.passwordConfirm){
      alert("confirm password is not equal")
    }else if (!$scope.account.password && !$scope.account.passwordConfirm){
      alert("please insert password")
    }else {
      return $http({
        url: baselocation + "/propertyTransfer/createAccount",
        method: "POST",
        "Content-type": "application/x-www-form-urlencoded; charset=utf-8",
        data: $scope.account
      }).then(function(response) {
        $scope.listData = response.data;
        $scope.loadList();
        $scope.account={};
        alert("create account success")
      },
      function(errResponse) {
        /*console.error(errResponse);*/
      });
    }
  };

  $scope.submitAllotProperty = function() {
      return $http({
        url: baselocation + "/propertyTransfer/allotProperty",
        method: "POST",
        "Content-type": "application/x-www-form-urlencoded; charset=utf-8",
        data: $scope.allotProperty
      }).then(function(response) {
        $scope.listData = response.data;
        $scope.loadList();
        $scope.showAllProperties();
        $scope.allotProperty={};
        alert("allot property success")
      },
      function(errResponse) {
        /*console.error(errResponse);*/
      });
  };

  $scope.submitTransferProperty = function(name) {
    $scope.transferProperty.propertyName = name;
      if($scope.transferProperty.addressTo == null){
        alert("Receiver address mandatory ")
      }else if ($scope.transferProperty.password == null) {
        alert("Password mandatory ")
      }else if ($scope.transferProperty.addressTo == $scope.transferProperty.addressFrom) {
        alert("Receiver must diferent with sender ")
      }else {
              return $http({
                url: baselocation + "/propertyTransfer/transferProperty",
                method: "POST",
                "Content-type": "application/x-www-form-urlencoded; charset=utf-8",
                data: $scope.transferProperty
              }).then(function(response) {
                $scope.loadList();
                $scope.showAllProperties();
                alert("transfer property success")
              },
              function(errResponse) {
                /*console.error(errResponse);*/
              });
      }
  };


  $scope.$watch("transferProperty.addressFrom", function updatePdfUrl(value) {
    if (value) {
      $scope.showAllProperties();
    }
  });

  $scope.showAllProperties = function() {
    $scope.properties = [];
      return $http({
        url: baselocation + "/propertyTransfer/showAllProperties",
        method: "POST",
        "Content-type": "application/x-www-form-urlencoded; charset=utf-8",
        data: {address:$scope.transferProperty.addressFrom}
      }).then(function(response) {
        for(var i = 0; i <response.data.length; i++ ){
                  if(response.data[i] !== null){
                    $scope.properties.push(response.data[i]);
                  }
                }
        },
      function(errResponse) {
        /*console.error(errResponse);*/
      });
  };


  $scope.submitSendEther = function() {
    console.info($scope.sendEther)
    if(!$scope.sendEther.password){
      alert("please insert password")
    }else {
      return $http({
        url: baselocation + "/propertyTransfer/sendEther",
        method: "POST",
        "Content-type": "application/x-www-form-urlencoded; charset=utf-8",
        data: $scope.sendEther
      }).then(function(response) {
        $scope.listData = response.data;
        $scope.sendEther={};
        $scope.loadList();
        alert("send ether success")
      },
      function(errResponse) {
        /*console.error(errResponse);*/
      });
    }
  };
  $scope.loadList();
});
