jQuery(document).ready(function($) {

    /****************************************************************
     * Application Reportview Theme
     *****************************
     */

    // facetview instance for control

    function customFrame(options) {
        /*****************************************
         * overrides must provide the following classes and ids
         *
         * id: facetview - main div in which the facetview functionality goes
         * id: facetview_filters - div where the facet filters will be displayed
         * id: facetview_rightcol - the main window for result display (doesn't have to be on the right)
         * class: facetview_search_options_container - where the search bar and main controls will go
         * id : facetview_selectedfilters - where we summarise the filters which have been selected
         * class: facetview_metadata - where we want paging to go
         * id: facetview_results - the table id for where the results actually go
         * id: facetview_searching - where the loading notification can go
         *
         * Should respect the following configs
         *
         * options.debug - is this a debug enabled facetview.  If so, put a debug textarea somewhere
         */

        // the facet view object to be appended to the page
        var thefacetview = '<div id="facetview">';

        // provde the facets a place to go
        thefacetview += '<div class="row-fluid"><div class="span12"><div id="facetview_filters" style="padding-top:45px;"></div></div></div>'

        // insert loading notification
        thefacetview += '<div class="row-fluid"><div class="span12"><div class="facetview_searching" style="display:none"></div></div></div>'

        // debug window near the bottom
        if (options.debug) {
            thefacetview += '<div class="row-fluid"><div class="span12"><div class="facetview_debug" style="display:none"><textarea style="width: 95%; height: 150px"></textarea></div></div></div>'
        }

        // close off the big container and return
        thefacetview += '</div>';
        return thefacetview
    }

    function customFacetList(options) {
        /*****************************************
         * overrides must provide the following classes and ids
         *
         * none - no requirements for specific classes and ids
         *
         * should (not must) respect the following config
         *
         * options.render_terms_facet - renders a term facet into the list
         * options.render_range_facet - renders a range facet into the list
         * options.render_geo_facet - renders a geo distance facet into the list
         */
        if (options.facets.length > 0) {
            var filters = options.facets;
            var thefilters = '';
            for (var idx = 0; idx < filters.length; idx++) {
                thefilters += '<div style="float: left; padding-left: 30px">'
                var facet = filters[idx]
                var type = facet.type ? facet.type : "terms"
                if (type === "terms") {
                    thefilters += options.render_terms_facet(facet, options)
                } else if (type === "range") {
                    thefilters += options.render_range_facet(facet, options)
                } else if (type === "geo_distance") {
                    thefilters += options.render_geo_facet(facet, options)
                }
                thefilters += "</div>"
            };
            return thefilters
        };
        return ""
    }

    function updateReport(options, context) {
        var fvfilters = getFilters({"options" : options})

        // Licence Proportions

        function licenceProportionPreRender(options, context) {
            var total = options.data.found
            $('#licence-count').html(total)
        }

        var filters = []
        filters.push({"exists" : {"field" : "bibjson.license.type"}})
        filters = filters.concat(fvfilters)

        $('#reportview-licence-proportion').empty()
        $('#reportview-licence-proportion').report({
            type: "pie",
            search_url: query_endpoint,
            facets: [
                {
                    "field" : "bibjson.license.type.exact",
                    "size" : 100,
                    "display" : "Licence Type"
                }
            ],
            fixed_filters : filters,
            pre_render_callback: licenceProportionPreRender
        });

        // Aspects of Licences

        function reduceAspectDataSeries(options, context) {
            var series = options.data_series
            var new_series = {"key" : "Licence Aspects", "values" : []}
            for (var i = 0; i < series.length; i++) {
                var os = series[i]
                var thevalue = 0
                for (var j = 0; j < os.values.length; j++) {
                    var val = os.values[j]
                    if (val.label === "T") {
                        thevalue = val.value
                    }
                }
                var point = {"label" : os.key, "value" : thevalue}
                new_series.values.push(point)
            }
            options.data_series = [new_series]
        }

        $('#reportview-licence-aspects').empty()
        $('#reportview-licence-aspects').report({
            type: 'horizontal_multibar',
            search_url: query_endpoint,
            facets : [
                {
                    "field" : "bibjson.license.BY",
                    "size" : 2,
                    "display" : "BY"
                },
                {
                    "field" : "bibjson.license.NC",
                    "size" : 2,
                    "display" : "NC"
                },
                {
                    "field" : "bibjson.license.SA",
                    "size" : 2,
                    "display" : "SA"
                },
                {
                    "field" : "bibjson.license.ND",
                    "size" : 2,
                    "display" : "ND"
                }
            ],
            fixed_filters: fvfilters,
            pre_render_callback: reduceAspectDataSeries
        })

        // similarities between claimed licence and actual licence

        // obtain the licence types from the facet
        var licence_types = []
        for (var i = 0; i < options.facets.length; i++) {
            var facet = options.facets[i]
            if (facet.field === "bibjson.journal.license.type.exact") {
                for (var j = 0; j < facet.values.length; j++) {
                    var val = facet.values[j]
                    licence_types.push(val.term)
                }
            }
        }

        $("#reportview-arbitrage-container").empty()
        for (var i = 0; i < licence_types.length; i++) {
            var t = licence_types[i]
            var divid = "licence_" + t.replace(" ", "_")
            $("#reportview-arbitrage-container").append("<div id='" + divid + "' class='arbitrage_report'><strong>Asserted Journal Licence: " + t + "</strong></div>")

            var lfilters = []
            lfilters.push({"term" : {"bibjson.journal.license.type.exact" : t}})
            lfilters = lfilters.concat(fvfilters)

            $("#" + divid).report({
                type: "multibar",
                search_url: query_endpoint,
                facets: [
                    {
                        "field" : "bibjson.license.type.exact",
                        "size" : 100,
                        "display" : "Licence Type"
                    }
                ],
                fixed_filters: lfilters
            })
        }

    }

    $("#facetview-controls").facetview({
        // debug: true,
        search_url: query_endpoint,
        page_size: 0,
        facets : [
            {
                "field" : "index.country.exact",
                "display" : "Country of Publication",
                "open" : true,
                "size" : 5
            },
            {
                "field" : "index.language.exact",
                "display" : "Journal Language",
                "open" : true,
                "size" : 5
            },
            {
                "field" : "index.publisher.exact",
                "display" : "Publisher",
                "open" : true,
                "size" : 5
            },
            {
                "field" : "bibjson.journal.license.type.exact",
                "display" : "Journal Licence",
                "open" : true,
                "size" : 5
            }
        ],
        pushstate: false,
        render_the_facetview: customFrame,
        render_facet_list: customFacetList,
        post_render_callback: updateReport
    })
});
