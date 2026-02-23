
var tabsModule = angular.module('inspinia')

tabsModule.directive('tabset', function(appStates, $state, $localStorage) {
    return {
      restrict: 'E',
      transclude: true,
      scope: { },
      // template: '<div role="tabpanel"><ul class="nav nav-tabs" role="tablist"><li role="presentation"  ng-class="{"active":tab.active, "disabled":tab.disabled}" ng-repeat="tab in tabset.tabs"><a href=""role="tab"ng-click="tabset.select(tab)">{{tab.heading}}</a></li></ul><ng-transclude></ng-transclude></div>',
      templateUrl: 'app/directivas/tabs/tabset.html',
      bindToController: true,
      controllerAs: 'tabset',
      controller: function() {
        var self = this
        self.tabs = [];
        self.select = function(selectedTab) {
          if(selectedTab.disabled) { return }
          angular.forEach(self.tabs, function(tab) {
            if(tab.active && tab !== selectedTab) {
              tab.active = false;
            }
          })
          selectedTab.active = true;
          $state.go(selectedTab.route);
        }
        self.add_tab = function(){
          console.log('Add tab');
          appStates.states = appStates.states.map(function(item){
            item.active = false;
            return item
          });
          appStates.states.push(
            { name: 'Dashboard', heading: 'Dashboard', route: 'index.main', active: true, isVisible: true, href: $state.href('index.main')}
          );
          self.tabs = appStates.states;
          $localStorage.tab_states = appStates.states;
          $state.go(self.tabs[self.tabs.length-1].route);
        }

        self.delete_tab = function(index){
          console.log(self.tabs);
          console.log(self.tabs[index]);
          var actual_state = appStates.states.splice(index, 1);
          console.log('actual_state**', actual_state);
          
          self.tabs = appStates.states;



          // $localStorage.tab_states = appStates.states;
          
          
        }
      
      self.addTab = function addTab(tab) {
      self.tabs.push(tab)
      if(self.tabs.length === 1) {
      tab.active = true
     }
    }
   }
  }
  })