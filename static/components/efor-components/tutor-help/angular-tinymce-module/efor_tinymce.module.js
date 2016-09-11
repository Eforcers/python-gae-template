(function(){

angular.module('ui.tinymce', [])
.value('uiTinymceConfig', {})
.directive('uiTinymce', ['$rootScope', '$compile', '$timeout', '$window', '$sce', 'uiTinymceConfig', function($rootScope, $compile, $timeout, $window, $sce, uiTinymceConfig) {
    uiTinymceConfig = uiTinymceConfig || {};
    var generatedIds = 0;
    var ID_ATTR = 'ui-tinymce';
    if (uiTinymceConfig.baseUrl) {
        tinymce.baseURL = uiTinymceConfig.baseUrl;
    }

    return {
        require: ['ngModel', '^?form'],
        priority: 999,
        link: function(scope, element, attrs, ctrls) {
            if (!$window.tinymce) {
                return;
            }

            var ngModel = ctrls[0],
            form = ctrls[1] || null;

            var expression, options = {
                content_css: '/static/css/style.css',
                body_class: 'tinyMCE_iframe_body',
                visual: true,//helpers guides for tables
                width : '100%',
                height: 250,
                max_height: 400,
                min_width: 100,
                min_height: 100,
                max_width: 600,
                resize: 'both',
                skin: 'lightgray',
                theme: 'modern',
                statusbar: true,
                theme_advanced_resizing : true,
                theme_advanced_resize_horizontal : false,
                fontsize_formats: "8px 10px 12px 14px 18px 24px 36px",
                //theme_url: '/mytheme/mytheme.js',
                //skin_url: '/css/mytinymceskin',
                //Update model when calling setContent (such as from the source editor popup)
                //menubar: false,
                table_advtab: true,
                table_grid: true,
                //language: 'es',
                //table_tab_navigation: false,
                //toolbar: false,
                //http://archive.tinymce.com/wiki.php/Controls
                menu: {
                //file: {title: 'File', items: 'newdocument'},
                    edit: {title: 'Edit', items: 'undo redo | cut copy paste pastetext | selectall'},
                    insert: {title: 'Insert', items: 'link image hr'},
                    view: {title: 'View', items: 'visualaid'},
                    format: {title: 'Format', items: 'bold italic underline strikethrough superscript subscript | formats fontsize | removeformat'},
                    table: {title: 'Table', items: 'inserttable tableprops deletetable | cell row column'},
                    tools: {title: 'Tools', items: 'spellchecker code'},
                },

                toolbar:[
                    "undo redo | fontselect | fontsizeselect | bold italic underline | forecolor backcolor removeformat | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent inserttable | table link image hr code addTagMenu"
                ],
                style_formats: [
                    {title: 'Titulo 1', block: 'h1', styles: {fontSize: '24px'}},
                    {title: 'Titulo 2', block: 'h2', styles: {fontSize: '20px'}},
                    {title: 'Titulo 3', block: 'h3', styles: {fontSize: '18px'}},
                    {title: 'Titulo 4', block: 'h4', styles: {fontSize: '16px'}},
                    {title: 'Normal', block: 'p', styles: {fontSize: '14px'}},
                    {title: 'Pequeño', inline: 'span', styles: {fontSize: '12px'}},
                    {title: 'Diminuto', inline: 'small', styles: {fontSize: '10px'}}
                ],
                setup: function(ed) {
                    ed.on('init', function(args) {
                        ngModel.$render();
                    });
                // Update model on button click
                ed.on('ExecCommand', function(e) {
                    ed.save();
                    ngModel.$setViewValue(elm.val());
                    if (!scope.$$phase) {
                        scope.$apply();
                    }
                });
                // Update model on keypress
                ed.on('KeyUp', function(e) {
                    console.log(ed.isDirty());
                    ed.save();
                    ngModel.$setViewValue(elm.val());
                    if (!scope.$$phase) {
                        scope.$apply();
                    }
                });
                },
                //http://archive.tinymce.com/wiki.php/Tutorials:Creating_a_plugin
                plugins: [
                    'lists link image esmgPlugin  code table contextmenu textcolor colorpicker advlist hr'
                    ],
                mode: 'exact',
                elements: attrs.id
                }, tinyInstance,
                updateView = function(editor) {
                    var content = editor.getContent({format: options.format}).trim();
                    content = $sce.trustAsHtml(content);

                    ngModel.$setViewValue(content);
                    if (!$rootScope.$$phase) {
                        scope.$digest();
                    }
                };

                function toggleDisable(disabled) {
                    if (disabled) {
                        ensureInstance();

                        if (tinyInstance) {
                            tinyInstance.getBody().setAttribute('contenteditable', false);
                        }
                    } else {
                        ensureInstance();

                        if (tinyInstance && !tinyInstance.settings.readonly) {
                            tinyInstance.getBody().setAttribute('contenteditable', true);
                        }
                    }
                }

                // generate an ID
                attrs.$set('id', ID_ATTR + '-' + generatedIds++);

                expression = {};

                angular.extend(expression, scope.$eval(attrs.uiTinymce));

                var setupOptions = {
                // Update model when calling setContent
                // (such as from the source editor popup)
                setup: function(ed) {
                    ed.on('init', function() {
                        ngModel.$render();
                        ngModel.$setPristine();
                        ngModel.$setUntouched();
                        if (form) {
                            form.$setPristine();
                        }
                    });

                    // Update model on button click
                    ed.on('ExecCommand', function() {
                        ed.save();
                        updateView(ed);
                    });

                    // Update model on change
                    ed.on('change NodeChange', function() {
                        ed.save();
                        updateView(ed);
                    });

                    ed.on('blur', function() {
                        element[0].blur();
                        ngModel.$setTouched();
                        scope.$digest();
                    });

                    // Update model when an object has been resized (table, image)
                    ed.on('ObjectResized', function() {
                        ed.save();
                        updateView(ed);
                    });

                    ed.on('remove', function() {
                        element.remove();
                    });

                    if (expression.setup) {
                        expression.setup(ed, {
                            updateView: updateView
                        });
                    }
                },
                format: expression.format || 'html',
                selector: '#' + attrs.id
                };
                // extend options with initial uiTinymceConfig and
                // options from directive attribute value
                angular.extend(options, uiTinymceConfig, expression, setupOptions);
                // Wrapped in $timeout due to $tinymce:refresh implementation, requires
                // element to be present in DOM before instantiating editor when
                // re-rendering directive
                $timeout(function() {
                    if (options.baseURL){
                        tinymce.baseURL = options.baseURL;            
                    }
                    tinymce.init(options);
                    toggleDisable(scope.$eval(attrs.ngDisabled));
                });

                ngModel.$formatters.unshift(function(modelValue) {
                    return modelValue ? $sce.trustAsHtml(modelValue) : '';
                });

                ngModel.$parsers.unshift(function(viewValue) {
                    return viewValue ? $sce.getTrustedHtml(viewValue) : '';
                });

                ngModel.$render = function() {
                    ensureInstance();

                    var viewValue = ngModel.$viewValue ?
                    $sce.getTrustedHtml(ngModel.$viewValue) : '';

                    // instance.getDoc() check is a guard against null value
                    // when destruction & recreation of instances happen
                    if (tinyInstance && tinyInstance.getDoc() ) {
                        tinyInstance.setContent(viewValue);
                        // Triggering change event due to TinyMCE not firing event &
                        // becoming out of sync for change callbacks
                        tinyInstance.fire('change');
                    }
                };

                attrs.$observe('disabled', toggleDisable);

                // This block is because of TinyMCE not playing well with removal and
                // recreation of instances, requiring instances to have different
                // selectors in order to render new instances properly
                scope.$on('$tinymce:refresh', function(e, id) {
                    var eid = attrs.id;
                    if (angular.isUndefined(id) || id === eid) {
                        var parentElement = element.parent();
                        var clonedElement = element.clone();
                        clonedElement.removeAttr('id');
                        clonedElement.removeAttr('style');
                        clonedElement.removeAttr('aria-hidden');
                        tinymce.execCommand('mceRemoveEditor', false, eid);
                        parentElement.append($compile(clonedElement)(scope));
                    }
                });

                scope.$on('$destroy', function() {
                    ensureInstance();

                    if (tinyInstance) {
                        tinyInstance.remove();
                        tinyInstance = null;
                    }
                });

                function ensureInstance() {
                    if (!tinyInstance) {
                        tinyInstance = tinymce.get(attrs.id);
                    }
                }
            }
        };
    }
]);

})();
