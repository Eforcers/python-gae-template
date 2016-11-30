(function(){
    "use strict";

    var modalApp = angular.module('$eforModal',[]);

    modalApp
        .factory('eforModal', ['$log', '$window', '$rootScope', '$interval', eforModalFactory])
        .controller('efModalCtrl', ['$log', '$rootScope', '$scope','eforModal', '$timeout', esmgModalController])
        ;

    // directive
    function eforModalFactory($log, $window, $rootScope, $interval){

        var $efmodal = $('.efor-modal'); // for obtain $scope of modal from element modal
        var $scopeModal; // is enabled on first clic to open modal and
        var visible = false;
        var init_class;
        var on_close_function = {}; // this function is prepared in open by option object
        var dir_confirm_template = confirmTemplate();

        var isVisible = function( options ){
            return ($efmodal.is(':visible') && $efmodal.is('.is-open'));
        };

        function configureModal( options, callback ){
            // configuration
            on_close_function = options.onClose || null; // asign close function
            $scopeModal =  angular.element($efmodal).scope(); // obtin $scope of modal from element modal
            $scopeModal.scope = options.scope || null; // add instance scope controller to modal scope
            // template options
            $scopeModal.templateUrl = options.templateUrl || '';
            // init class save then apply with options
            init_class = init_class ? init_class : $efmodal.attr('class');
            $efmodal.attr('class', init_class);
            $efmodal.addClass( (options.type) ? options.type : '' );
            var class_from_template = options.templateUrl ? 'url-template' : 'no-template';
            $efmodal.addClass( class_from_template );

            //open modal
            $efmodal.addClass('is-open');

            // reload MDL functions
            if($window.reloadMDLDOM){
                callback = callback || null;
                $window.reloadMDLDOM($interval, callback);
            }

        };

        function closeByKey(){
            if(!window.closemodalkey){

                document.addEventListener('keydown', function(event){
                        if(event.keyCode == 27){
                            close();
                        }
                    }
                );
                window.closemodalkey = true;
            }
        };

        function close( options, callback ){

            // close modal
            $scopeModal.templateUrl = '';
            $efmodal.removeClass('is-open').addClass('is-close');

            // restore slider
            if ($scopeModal.slider) {
                $scopeModal.slider.sectionView = 0;
            }
            //clear scope copy modal
            delete $scopeModal.scope;

            // apply callback open function
            if( on_close_function ){
                on_close_function();
                on_close_function = null;
            }

            // apply callbak function
            if( arguments[2] ){
                callback;
            }

            // delete confirm_modal variable
            if( $scopeModal && $scopeModal.modal_confirm ){
                delete $scopeModal.modal_confirm;
            }

        };

        function open( options, callback ){

            var options = options || {};

            configureModal( options, callback );

            //add close modal event key for "esc"
            closeByKey();

        };

        function confirm(options){
            // Preconfigure options
            var options = options || {};
            options.templateUrl = options.templateUrl || dir_confirm_template;

            // Config modal DOM template
            $scopeModal = angular.element($efmodal).scope();

            $scopeModal.modal_confirm = {
              title: options.title || '',
              subtitle: options.subtitle || '',
              text : options.text || '',
              confirm_text: options.confirm_text || 'Confirm',
              cancel_text: options.cancel_text || 'Cancel',
              confirmAction: function(){
                if( options.confirmAction ){
                   options.confirmAction();

                }

                close();

              },
              cancelAction: function(){
                if( options.cancelAction ){
                   options.cancelAction();

                }

                close();

              }
            };

            configureModal(options);

            // Key esc to exit
            closeByKey();

        };

        function confirmTemplate(){
            // search script url for replace with html template
            var script_sheet = document.querySelector('script[src*="efor_modal.js"]');
            script_sheet = script_sheet ? script_sheet.src.replace('efor_modal.js', 'modal_confirm_action.html') : null;
            return script_sheet;

        };

        return {
            isVisible : isVisible,
            open : open,
            close : close,
            confirm : confirm,
            init_class : init_class
        };
    }

    // conntroller
    function esmgModalController($log, $rootScope, $scope, eforModal, $timeout) {

        $scope.efmodal = eforModal;//preserve buttons close and others
        $scope.templateUrl = '';
        $scope.scope;


        //for animation slider
        $scope.slider = {
            sectionView : 0,
            back : false,
            total : function(button){

                var total = $(button).closest('.esmg-slider .esmg-section').length;
                total = (total <= 0)? 0 : total;
                return total;

            },
            next: function(button){

                var total = $scope.slider.total(button);
                $scope.slider.sectionView = ( $scope.slider.sectionView <= total+1 )? $scope.slider.sectionView +1 : 0;
                $scope.slider.back = false;

            },
            previus: function(button){

                var total = $scope.slider.total(button);
                $scope.slider.back = true;
                $scope.slider.sectionView = ( $scope.slider.sectionView == 0 )? total : $scope.slider.sectionView -1;

            },
            goto : function(slider){

                $scope.slider.sectionView = slider;

            }
        }

    }

})();