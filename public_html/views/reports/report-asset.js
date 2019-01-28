(function(){
	var app;
	app = angular.module('report-asset', ['datatables', 'report-generator', 'ui-tools', 'datatables.buttons', 'config_module'])
	.controller('report-asset-cntrl', ['$scope','DTOptionsBuilder', 'tools', 'assetReport', 'settings', function($scope, DTOptionsBuilder, tools, assetReport, settings)
	{
		$scope.initilised = false;
		$scope.dataLoaded = false;
		
		
		$scope.BRs = [];
		
		$scope.getBRs = function(){
			
			tools.getBR().then(function(types){
				$scope.BRs = types;
					$scope.initilised = true;
			})
		
		}
		
		$scope.getBRs();
		
		
		$scope.chartData = {
				labels : [],
				data : [],
				colours :[]
				
			}
		$scope.chartData2 = {
				labels : [],
				data : []
				
			}
		
		$scope.reportSelected = false;
		$scope.tabSelect = function(tab_id)
		{
			if (tab_id=="report")
			{
				$scope.reportSelected = true;
			}
			else
			{
				$scope.reportSelected = false;
			}
		}
		$scope.assetData = [];
		
		$scope.getData = function(){
			$scope.completionData = {
			
				passed_pas141: 0,
				scrapped_pas141: 0,
				completed_nonpas:0,
				sold: 0,
				inprogress_pas:0,
				inprogress_non: 0,		
			
			}
			$scope.productMix = {		
				mobile: 0,
				monitor: 0,
				laptop:0,
				base:0,
				router: 0,
				printer: 0,
				harddrive: 0,
				server: 0
			
		}
			$scope.dataLoaded = false;
			assetReport.get($scope.BRs.selected).then(function(response){
				$scope.brInfo = response.brInfo;
				$scope.assetData = response.table;
				$scope.assetData.forEach(function(product){
					product.finalP = '';
					
					
					
					//FOR CHARTS
					if (product.Complete == '1')
					{
						if (product.sold == 'pass')
						{
							$scope.completionData.sold ++;
						}
						else if (product.ss == 'pass')
						{
							$scope.completionData.scrapped_pas141 ++;
						}
						else if (product.cd == 'pass')
						{
							$scope.completionData.passed_pas141 ++;
						}		
						else if (product.Route == '0')
						{
							$scope.completionData.completed_nonpas ++;
						}
						
					}
					else
					{
						
						if (product.Route == '1')
						{
							$scope.completionData.inprogress_pas ++;
						}
						else if (product.Route == '0')
						{
							$scope.completionData.inprogress_non ++;
						}
					}
					
					if (product.de == "pass" || product.de == "fail")
					{
						if (product.cert == "Factory Reset")
						{
						}
						else if (product.cert == "Manual Pass"){
						}
						else if (product.cert == "Manual Fail"){
						}
						else{
							product.cert = settings.phpUrl + "blancco_export.php?serial=" + product.serial + "&br=" + product.br_no;
							product.link = true;
						}
					
					}
					
					if (product.ss == 'pass')
					{
						product.finalP = "For material recycle";
					}
					else if (product.cd == 'pass')
					{
						product.finalP = "Cleaned ready for PAS 141 reuse";
					}
					
					if (product.Route == '1')
					{
						product.Route = "PAS 141";
					}
					else if (product.Route == '0')
					{
						product.Route = "STD";
						if (product.Complete == "1")
						{							
							product.finalP = "Completed to S2S standard";
						}
						
					}
					
					if (product.type == "mobile phone")
					{
						$scope.productMix.mobile ++;
					}
					else if (product.type == "base station")
					{
						$scope.productMix.base ++;
					}
					else if (product.type == "laptop")
					{
						$scope.productMix.laptop ++;
					}
					else if (product.type == "monitor")
					{
						$scope.productMix.monitor ++;
					}
					else if (product.type == "router")
					{
						$scope.productMix.router ++;
					}
					else if (product.type == "printer")
					{
						$scope.productMix.printer ++;
					}
					else if (product.type == "hard drive")
					{
						$scope.productMix.harddrive ++;
					}
					else if (product.type == "server")
					{
						$scope.productMix.server ++;
					}
					
				})
				$scope.dataLoaded = true;
				$scope.dtOptions = DTOptionsBuilder.newOptions()
								
								.withDOM('<"row"B><"row"lf><"row"rt><"row"ip>')
								.withDisplayLength(100)
								.withOption('order', [9, 'desc'])
								.withOption('scrollX', '100%')
								.withButtons([
								
									{ extend: 'copy', className: 'btn ' },
									{ extend: 'excel', className: 'btn ' },
									{ extend: 'pdf', className: 'btn ' },
										
									
									
								]);
								
				$scope.makeChartData();
			})
			
		}
		
		
		$scope.makeChartData = function(){
			
			$scope.chartData = {
				labels : ["Sold", "Complete - Passed (PAS141)", "Complete - Scrapped (PAS141)", "Complete(Non-PAS141)", "In-Progress (PAS141)", "In-Progress (Non-PAS141)"],
				data : [$scope.completionData.sold, $scope.completionData.passed_pas141, $scope.completionData.scrapped_pas141, $scope.completionData.completed_nonpas, $scope.completionData.inprogress_pas, $scope.completionData.inprogress_non],
				colours: ['#FFBF00', '#009900', '#FF1A1A', '#80FF80', '#FEFF00', '#FFFF99']
			};
			
			$scope.chartData2 = {
				labels : ["Mobile Phone", "Monitor", "Laptop", "Base Station", "Router", "Printer", "Hard Drive", "Server"],
				data : [$scope.productMix.mobile, $scope.productMix.monitor, $scope.productMix.laptop, $scope.productMix.base, $scope.productMix.router, $scope.productMix.printer, $scope.productMix.harddrive, $scope.productMix.server]
				
			};
		}
		
		$scope.onClick = function (points, evt) {
			console.log(points, evt);
		  };
			
		
	}]);
})();