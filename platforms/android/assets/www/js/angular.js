var helloApp = angular.module( 'helloApp', [] );
helloApp.controller( 'helloCtrl', ['$scope', '$http', function( $scope, $http ) {

		$scope.name = 'world';
		$scope.prenom = 'yannick';
		$scope.action = 'JustoClick';
		$http.get("http://www.w3schools.com/website/Customers_JSON.php").success( function( response ){ $scope.clients = response; } );

		} ] );

helloApp.controller( 'peopleCtrl', ['$scope', function( $scope ) {
		$scope.people = [
		{ "firstname": "Martin", "lastname": "Catty" },
		{ "firstname": "Nicolas", "lastname": "Cavigneaux" },
		{ "firstname": "Nicolas", "lastname": "Zermati" },
		{ "firstname": "Victor", "lastname": "Darras" },
		{ "firstname": "Jonathan", "lastname": "François" },
		{ "firstname": "Numa", "lastname": "Claudel" }
		];
		$scope.showPeople = true;

		} ] );

helloApp.controller( 'searchCtrl', ['$scope', function( $scope ) {

	$scope.friendlist = [
			{'status': 'online',  'name': 'Sébastien'},
			{'status': 'offline', 'name': 'Marion'},
			{'status': 'online',  'name': 'Youssef'},
			{'status': 'offline', 'name': 'Romain'},
			{'status': 'offline', 'name': 'Laura'},
			{'status': 'offline', 'name': 'Julien'},
			{'status': 'online',  'name': 'Marie'}
			    ];

		} ] );
