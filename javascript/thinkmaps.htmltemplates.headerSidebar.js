// define the class namespace
var htmltemplates = htmltemplates || thinkmaps.namespace("thinkmaps.htmltemplates");

// This is a singleton
htmltemplates.headerSidebar = (function () {

    // Private Fields -----------------------------------------------------------------------
    var header,
        headerHeight,
        sidebar,
        sidebarWidth,
        sidebarPosition,
        content,
        esriMap;

    // Public Methods -----------------------------------------------------------------------
    return {
        initialize: function(structur){
            header = document.getElementById(structur.header.id);
            headerHeight = structur.header.height;
            sidebar = document.getElementById(structur.sidebar.id);
            sidebarWidth = structur.sidebar.width;
            sidebarPosition = structur.sidebar.position;
            content = document.getElementById(structur.content.id);
            window.onresize = this.resize;
            this.resize();
        },

        setMap: function(map) {
            esriMap = map;
            this.resize();
        },

        resize:function () {

            header.style.height = headerHeight + "px";
            header.style.width = _getPageWidth() + "px";

            sidebar.style.width = sidebarWidth + "px";
            sidebar.style.top = headerHeight + "px";
            sidebar.style.height = _getPageHeight() - headerHeight + "px";
            if (sidebarPosition.toLowerCase() == "left"){
                sidebar.style.left = "0px";
            } else {
                sidebar.style.left =  _getPageWidth() - sidebarWidth + "px";
            }

            content.style.width = _getPageWidth() - sidebarWidth + "px";
            content.style.height = _getPageHeight() - headerHeight + "px";
            content.style.top = headerHeight + "px";
            if (sidebarPosition.toLowerCase() == "left"){
                content.style.left = sidebarWidth + "px";
            } else {
                content.style.left = "0px";
            }
            if (esriMap){
                esriMap.resize();
            }
        }
    };

    //get the page height
    function _getPageHeight() {
        var height = window.innerHeight;
        if (typeof height === undefined) {
            if (document.documentElement && document.documentElement.clientHeight){
                height = document.documentElement.clientHeight;
            } else {
                height = document.body.clientHeight;
            }
        }
        return height;
    }

    // get the page width
    function _getPageWidth() {
        var width = window.innerWidth;
        if (typeof width === undefined) {
            if (document.documentElement && document.documentElement.clientWidth){
                width = document.documentElement.clientWidth;
            } else {
                width = document.body.clientWidth;
            }
        }
        return width;
    }
})();



