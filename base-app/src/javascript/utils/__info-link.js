/**
 * A link that pops up a version dialog box
 */

Ext.define('RallyCommunity.app.InfoLink',{
    extend: 'Rally.ui.dialog.Dialog',
    alias: 'widget.rallyappinfolink',

    /**
     * @cfg {String} informationHtml
     * Additional text to be displayed on the popup dialog (for exmaple,
     * to add a description of the app's use or functionality)
     */
    informationHtml: null,

    /**
     *
     * cfg {String} title
     * The title for the dialog box
     */
    title: "Build Information",

    defaults: { padding: 5, margin: 5 },

    closable: true,

    draggable: true,

    autoShow: true,

    width: 350,

    informationalConfig: null,

    showLog: false,
    logger: null,

    items: [
        {xtype:'container', itemId:'information' },
        {xtype:'container', itemId:'button_box'}
    ],

    initComponent: function() {
        var id = Ext.id(this);
        this.title =  "<span class='icon-help'> </span>" + this.title;
        this.callParent(arguments);
    },

    _generateChecksum: function(string){
        var chk = 0x12345678,
            i;
        string = string.replace(/var CHECKSUM = .*;/,"");
        string = string.replace(/var BUILDER  = .*;/,"");
        string = string.replace(/\s/g,"");  //Remove all whitespace from the string.

        for (i = 0; i < string.length; i++) {
            chk += (string.charCodeAt(i) * i);
        }

        return chk;
    },

    _checkChecksum: function(container) {
        var deferred = Ext.create('Deft.Deferred');
        var me = this;

        Ext.Ajax.request({
            url: document.URL,
            params: {
                id: 1
            },
            success: function (response) {
                text = response.responseText;
                if ( CHECKSUM ) {
                    var stored_checksum = me._generateChecksum(text);
                    if ( CHECKSUM !== stored_checksum ) {
                        deferred.resolve(false);
                        return;
                    }
                }
                deferred.resolve(true);
            }
        });

        return deferred.promise;
    },

    _addToContainer: function(container){
        var config = Ext.apply({
            xtype:'container',
            height: 200,
            overflowY: true
        }, this.informationalConfig);

        container.add(config);
    },

    afterRender: function() {
        var app = Rally.getApp();

        if ( !Ext.isEmpty( this.informationalConfig ) ) {
            var container = this.down('#information');
            this._addToContainer(container);
        }

        if ( this.showLog && this.logger ) {
            this.down('#button_box').add({
                xtype:'rallybutton',
                text:'Show Log',
                listeners: {
                    scope: this,
                    click: function() {
                        this.logger.displayLog();
                    }
                }
            });
        }

        if (! app.isExternal() ) {
            this._checkChecksum(app).then({
                scope: this,
                success: function(result){
                    if ( !result ) {
                        this.addDocked({
                            xtype:'container',
                            cls: 'build-info',
                            dock: 'bottom',
                            padding: 2,
                            html:'<span class="icon-warning"> </span>Checksums do not match'
                        });
                    }
                },
                failure: function(msg){
                    console.log("oops:",msg);
                }
            });
        } else {
            this.addDocked({
                xtype:'container',
                cls: 'build-info',
                padding: 2,
                dock: 'bottom',
                html:'... Running externally'
            });
        }
        this.callParent(arguments);
    },

    beforeRender: function() {
        var me = this;
        this.callParent(arguments);

        if (this.informationHtml) {
            this.addDocked({
                xtype: 'component',
                componentCls: 'intro-panel',
                padding: 2,
                html: this.informationHtml,
                dock: 'bottom'
            });
        }

        this.addDocked({
            xtype:'container',
            cls: 'build-info',
            padding: 2,
            dock:'bottom',
            html:"This app was created for the RallyCommunity."
        });

        if ( APP_BUILD_DATE ) {
            var build_html = Ext.String.format("Built on: {0} <br/>Built by: {1}",
                APP_BUILD_DATE,
                BUILDER);

            if ( ARTIFACT ) {
                build_html = build_html + "<br/>Source artifact: " + ARTIFACT;
            }

            this.addDocked({
                xtype:'container',
                cls: 'build-info',
                padding: 2,
                dock: 'top',
                html: build_html
            });
        }
    }
});
